"""Static site server plus secure Stripe fulfillment and inquiry endpoints.

The public checkout stays on Stripe-hosted Payment Links. This process never
receives card numbers. It verifies Stripe webhooks, persists fulfillment state
in Firestore, and sends transactional email through Resend when configured.
"""

from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, quote, urlparse
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo
import hashlib
import hmac
import json
import logging
import os
import re
import threading
import time
import uuid


ROOT = Path(__file__).resolve().parent
PORT = int(os.getenv("PORT", "8080"))
MAX_BODY_BYTES = 64 * 1024
STRIPE_SIGNATURE_TOLERANCE = 300
PACIFIC = ZoneInfo("America/Los_Angeles")

PAYMENT_LINK_CATALOG = {
    "plink_1UBeF2A59Pf3OUe3lUcQknEy": {"kind": "reading", "service": "Tarot reading"},
    "plink_1UBeFWA59Pf3OUe3Ac9ioS6A": {"kind": "reading", "service": "Astrology reading"},
    "plink_1UBeFjA59Pf3OUe3BGsj5SIo": {"kind": "support", "service": "Support Aly"},
}

PUBLIC_ROOT_FILES = {
    "/404.html",
    "/apple-touch-icon.png",
    "/booking-policy.html",
    "/favicon.png",
    "/favicon.svg",
    "/index.html",
    "/privacy.html",
    "/reading-thanks.html",
    "/resume.html",
    "/robots.txt",
    "/script.js",
    "/site.webmanifest",
    "/sitemap.xml",
    "/styles.css",
    "/support-thanks.html",
    "/thanks.html",
}
PUBLIC_ASSET_SUFFIXES = {
    ".avif",
    ".gif",
    ".jpeg",
    ".jpg",
    ".json",
    ".mp4",
    ".png",
    ".svg",
    ".webm",
    ".webp",
    ".woff",
    ".woff2",
}

ALLOWED_ADMIN_STATUSES = {"scheduled", "preparing", "delivered", "canceled"}
FULFILLMENT_RANK = {
    "awaiting_schedule": 0,
    "paid": 0,
    "scheduled": 1,
    "preparing": 2,
    "delivered": 3,
    "canceled": 4,
}

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(message)s",
)
LOGGER = logging.getLogger("alyhackbart-site")


class ConfigurationError(RuntimeError):
    pass


class StoreError(RuntimeError):
    def __init__(self, message: str, status: int | None = None):
        super().__init__(message)
        self.status = status


class EmailError(RuntimeError):
    pass


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso_now() -> str:
    return utc_now().isoformat().replace("+00:00", "Z")


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def clean_text(value: object, limit: int = 1000) -> str:
    text = str(value or "").replace("\x00", "").strip()
    return text[:limit]


def safe_document_id(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9_.-]", "_", value)
    return value[:240] or uuid.uuid4().hex


def is_public_static_path(path: str) -> bool:
    if path == "/" or path in PUBLIC_ROOT_FILES:
        return True
    if path in {"/readings", "/readings/", "/readings/index.html"}:
        return True
    if path.startswith("/assets/") and not path.endswith("/"):
        return Path(path).suffix.lower() in PUBLIC_ASSET_SUFFIXES
    return False


def delivery_due_date(created_timestamp: int, business_days: int = 3) -> str:
    current = datetime.fromtimestamp(created_timestamp, timezone.utc).astimezone(PACIFIC).date()
    remaining = business_days
    while remaining:
        current += timedelta(days=1)
        if current.weekday() < 5:
            remaining -= 1
    return current.isoformat()


def verify_stripe_signature(
    payload: bytes,
    signature_header: str,
    secret: str,
    *,
    now: int | None = None,
    tolerance: int = STRIPE_SIGNATURE_TOLERANCE,
) -> bool:
    if not payload or not signature_header or not secret:
        return False

    parts: dict[str, list[str]] = defaultdict(list)
    for item in signature_header.split(","):
        key, separator, value = item.partition("=")
        if separator:
            parts[key.strip()].append(value.strip())

    try:
        timestamp = int(parts["t"][0])
    except (KeyError, IndexError, TypeError, ValueError):
        return False

    now = int(time.time()) if now is None else now
    if abs(now - timestamp) > tolerance:
        return False

    signed_payload = str(timestamp).encode("ascii") + b"." + payload
    expected = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return any(hmac.compare_digest(expected, candidate) for candidate in parts.get("v1", []))


def encode_firestore_value(value: object) -> dict[str, object]:
    if value is None:
        return {"nullValue": None}
    if isinstance(value, bool):
        return {"booleanValue": value}
    if isinstance(value, int):
        return {"integerValue": str(value)}
    if isinstance(value, float):
        return {"doubleValue": value}
    if isinstance(value, dict):
        return {
            "mapValue": {
                "fields": {str(key): encode_firestore_value(item) for key, item in value.items()}
            }
        }
    if isinstance(value, (list, tuple)):
        return {"arrayValue": {"values": [encode_firestore_value(item) for item in value]}}
    return {"stringValue": str(value)}


def decode_firestore_value(value: dict[str, object]) -> object:
    if "nullValue" in value:
        return None
    if "booleanValue" in value:
        return bool(value["booleanValue"])
    if "integerValue" in value:
        return int(str(value["integerValue"]))
    if "doubleValue" in value:
        return float(value["doubleValue"])
    if "stringValue" in value:
        return str(value["stringValue"])
    if "timestampValue" in value:
        return str(value["timestampValue"])
    if "arrayValue" in value:
        array_value = value.get("arrayValue") or {}
        return [decode_firestore_value(item) for item in array_value.get("values", [])]
    if "mapValue" in value:
        map_value = value.get("mapValue") or {}
        return {
            key: decode_firestore_value(item)
            for key, item in map_value.get("fields", {}).items()
        }
    return None


def encode_firestore_document(data: dict[str, object]) -> bytes:
    payload = {"fields": {key: encode_firestore_value(value) for key, value in data.items()}}
    return json.dumps(payload, separators=(",", ":")).encode("utf-8")


def decode_firestore_document(payload: dict[str, object]) -> dict[str, object]:
    return {
        key: decode_firestore_value(value)
        for key, value in (payload.get("fields") or {}).items()
    }


class FirestoreStore:
    """Small Firestore REST client using the Cloud Run service account."""

    def __init__(self) -> None:
        self.project_id = clean_text(
            os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT_ID"), 200
        )
        self.database = clean_text(os.getenv("FIRESTORE_DATABASE", "(default)"), 200)
        self._token = ""
        self._token_expires_at = 0.0
        self._token_lock = threading.Lock()

    @property
    def configured(self) -> bool:
        return bool(self.project_id)

    @property
    def base_url(self) -> str:
        if not self.configured:
            raise ConfigurationError("Firestore project is not configured")
        return (
            "https://firestore.googleapis.com/v1/projects/"
            f"{quote(self.project_id, safe='')}/databases/{quote(self.database, safe='()')}/documents"
        )

    def _access_token(self) -> str:
        with self._token_lock:
            if self._token and time.time() < self._token_expires_at - 60:
                return self._token
            request = Request(
                "http://metadata.google.internal/computeMetadata/v1/instance/"
                "service-accounts/default/token",
                headers={"Metadata-Flavor": "Google"},
            )
            try:
                with urlopen(request, timeout=3) as response:
                    payload = json.load(response)
            except (HTTPError, URLError, TimeoutError, ValueError) as error:
                raise StoreError("Could not obtain the Google Cloud service token") from error
            self._token = clean_text(payload.get("access_token"), 4096)
            self._token_expires_at = time.time() + int(payload.get("expires_in", 300))
            if not self._token:
                raise StoreError("Google Cloud returned an empty service token")
            return self._token

    def _request(
        self,
        method: str,
        url: str,
        data: bytes | None = None,
    ) -> dict[str, object]:
        request = Request(
            url,
            data=data,
            method=method,
            headers={
                "Authorization": f"Bearer {self._access_token()}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urlopen(request, timeout=8) as response:
                raw = response.read()
                return json.loads(raw) if raw else {}
        except HTTPError as error:
            raw = error.read().decode("utf-8", "replace")[:1000]
            raise StoreError(f"Firestore request failed: {raw}", error.code) from error
        except (URLError, TimeoutError, ValueError) as error:
            raise StoreError("Firestore request failed") from error

    def get(self, path: str) -> dict[str, object] | None:
        url = f"{self.base_url}/" + "/".join(quote(part, safe="") for part in path.split("/"))
        try:
            return decode_firestore_document(self._request("GET", url))
        except StoreError as error:
            if error.status == HTTPStatus.NOT_FOUND:
                return None
            raise

    def create(self, collection: str, document_id: str, data: dict[str, object]) -> None:
        collection_url = f"{self.base_url}/{quote(collection, safe='')}"
        url = f"{collection_url}?documentId={quote(document_id, safe='')}"
        self._request("POST", url, encode_firestore_document(data))

    def put(self, path: str, data: dict[str, object]) -> None:
        url = f"{self.base_url}/" + "/".join(quote(part, safe="") for part in path.split("/"))
        self._request("PATCH", url, encode_firestore_document(data))

    def merge(self, path: str, updates: dict[str, object]) -> dict[str, object]:
        existing = self.get(path) or {}
        existing.update(updates)
        self.put(path, existing)
        return existing


class ResendEmailClient:
    def __init__(self) -> None:
        self.api_key = clean_text(os.getenv("RESEND_API_KEY"), 4096)
        self.from_address = clean_text(os.getenv("EMAIL_FROM"), 320)
        self.admin_email = clean_text(
            os.getenv("ADMIN_EMAIL", "alysonhackbart@gmail.com"), 320
        )

    @property
    def configured(self) -> bool:
        return bool(self.api_key and self.from_address and self.admin_email)

    def send(
        self,
        *,
        to: str,
        subject: str,
        text: str,
        idempotency_key: str,
        reply_to: str | None = None,
    ) -> None:
        if not self.configured:
            raise ConfigurationError("Transactional email is not configured")
        payload: dict[str, object] = {
            "from": self.from_address,
            "to": [to],
            "subject": subject[:200],
            "text": text,
        }
        if reply_to:
            payload["reply_to"] = reply_to
        request = Request(
            "https://api.resend.com/emails",
            data=json.dumps(payload).encode("utf-8"),
            method="POST",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Idempotency-Key": idempotency_key[:256],
            },
        )
        try:
            with urlopen(request, timeout=8) as response:
                response.read()
        except HTTPError as error:
            error.read()
            raise EmailError(f"Email provider returned HTTP {error.code}") from error
        except (URLError, TimeoutError) as error:
            raise EmailError("Email provider could not be reached") from error


STORE = FirestoreStore()
EMAIL = ResendEmailClient()


class SlidingWindowLimiter:
    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, key: str, now: float | None = None) -> bool:
        now = time.time() if now is None else now
        cutoff = now - self.window_seconds
        with self._lock:
            events = self._events[key]
            while events and events[0] < cutoff:
                events.popleft()
            if len(events) >= self.limit:
                return False
            events.append(now)
            return True


INQUIRY_LIMITER = SlidingWindowLimiter(
    max(1, int(os.getenv("INQUIRY_RATE_PER_HOUR", "5"))), 3600
)


def parse_custom_fields(session: dict[str, object]) -> dict[str, str]:
    result: dict[str, str] = {}
    for index, field in enumerate(session.get("custom_fields") or []):
        if not isinstance(field, dict):
            continue
        label = field.get("label") or {}
        key = clean_text(label.get("custom") if isinstance(label, dict) else "", 120)
        key = key or clean_text(field.get("key"), 120) or f"Field {index + 1}"
        value = ""
        for field_type in ("dropdown", "text", "numeric"):
            candidate = field.get(field_type)
            if isinstance(candidate, dict) and candidate.get("value") is not None:
                value = clean_text(candidate.get("value"), 2000)
                break
        result[key] = value
    return result


def infer_reading_format(custom_fields: dict[str, str]) -> str:
    combined = " ".join(custom_fields.values()).lower()
    if "written" in combined or "email" in combined:
        return "written"
    if "live" in combined or "video" in combined:
        return "live"
    return "unspecified"


def order_from_checkout_session(session: dict[str, object]) -> dict[str, object]:
    session_id = clean_text(session.get("id"), 255)
    if not session_id:
        raise ValueError("Checkout Session has no id")
    payment_link = clean_text(session.get("payment_link"), 255)
    catalog = PAYMENT_LINK_CATALOG.get(
        payment_link, {"kind": "payment", "service": "Stripe payment"}
    )
    custom_fields = parse_custom_fields(session)
    reading_format = infer_reading_format(custom_fields)
    created = int(session.get("created") or time.time())
    customer_details = session.get("customer_details") or {}
    if not isinstance(customer_details, dict):
        customer_details = {}
    customer_email = clean_text(
        customer_details.get("email") or session.get("customer_email"), 320
    )
    customer_name = clean_text(customer_details.get("name"), 200)
    kind = str(catalog["kind"])
    fulfillment_status = "paid"
    if kind == "reading" and reading_format == "live":
        fulfillment_status = "awaiting_schedule"

    order: dict[str, object] = {
        "id": session_id,
        "stripe_checkout_session_id": session_id,
        "stripe_payment_link_id": payment_link,
        "stripe_payment_intent_id": clean_text(session.get("payment_intent"), 255),
        "stripe_customer_id": clean_text(session.get("customer"), 255),
        "kind": kind,
        "service": str(catalog["service"]),
        "reading_format": reading_format,
        "fulfillment_status": fulfillment_status,
        "payment_status": clean_text(session.get("payment_status"), 80) or "paid",
        "amount_total": int(session.get("amount_total") or 0),
        "currency": clean_text(session.get("currency"), 12).upper(),
        "customer_email": customer_email,
        "customer_name": customer_name,
        "custom_fields": custom_fields,
        "created_at": datetime.fromtimestamp(created, timezone.utc).isoformat().replace(
            "+00:00", "Z"
        ),
        "updated_at": iso_now(),
    }
    if kind == "reading" and reading_format == "written":
        order["delivery_due_date"] = delivery_due_date(created)
    return order


def merge_order(existing: dict[str, object] | None, incoming: dict[str, object]) -> dict[str, object]:
    if not existing:
        return incoming
    merged = dict(existing)
    current_fulfillment = str(existing.get("fulfillment_status") or "paid")
    incoming_fulfillment = str(incoming.get("fulfillment_status") or "paid")
    merged.update(incoming)
    if FULFILLMENT_RANK.get(current_fulfillment, 0) > FULFILLMENT_RANK.get(
        incoming_fulfillment, 0
    ):
        merged["fulfillment_status"] = current_fulfillment
    merged["updated_at"] = iso_now()
    return merged


def customer_payment_email(order: dict[str, object]) -> tuple[str, str]:
    service = str(order.get("service") or "payment")
    first_name = clean_text(order.get("customer_name"), 200).split(" ")[0]
    greeting = f"Hi {first_name}," if first_name else "Hi,"
    lines = [greeting, "", f"Your payment for {service} was received."]
    kind = order.get("kind")
    reading_format = order.get("reading_format")
    if kind == "reading" and reading_format == "written":
        lines.extend(
            [
                "",
                "Your written reading will be sent to this email address within 3 business days.",
            ]
        )
    elif kind == "reading" and reading_format == "live":
        scheduling_url = clean_text(os.getenv("SCHEDULING_URL"), 1000)
        if scheduling_url:
            lines.extend(["", f"Choose a time for your 30-minute reading: {scheduling_url}"])
        else:
            lines.extend(["", "Aly will email you to arrange your 30-minute video call."])
    elif kind == "support":
        lines.extend(["", "Thank you for supporting Aly's independent creative work."])
    lines.extend(
        [
            "",
            "Booking policy: https://alyhackbart.com/booking-policy.html",
            "Questions: alysonhackbart@gmail.com",
            "",
            "Aly Hackbart",
        ]
    )
    return f"Payment received: {service}", "\n".join(lines)


def admin_payment_email(order: dict[str, object]) -> tuple[str, str]:
    service = str(order.get("service") or "Stripe payment")
    amount = int(order.get("amount_total") or 0) / 100
    fields = order.get("custom_fields") or {}
    lines = [
        f"New paid order: {service}",
        "",
        f"Order: {order.get('id', '')}",
        f"Amount: {order.get('currency', '')} {amount:.2f}",
        f"Customer: {order.get('customer_name', '')}",
        f"Email: {order.get('customer_email', '')}",
        f"Format: {order.get('reading_format', '')}",
        f"Fulfillment: {order.get('fulfillment_status', '')}",
    ]
    if order.get("delivery_due_date"):
        lines.append(f"Written delivery due: {order['delivery_due_date']}")
    if isinstance(fields, dict) and fields:
        lines.extend(["", "Checkout details:"])
        for label, value in fields.items():
            lines.append(f"{label}: {value}")
    return f"New paid order: {service}", "\n".join(lines)


def bind_payment_aliases(order: dict[str, object]) -> None:
    order_id = safe_document_id(str(order["id"]))
    payment_intent = clean_text(order.get("stripe_payment_intent_id"), 255)
    if payment_intent:
        charge_alias = STORE.merge(
            f"stripe_payment_intents/{safe_document_id(payment_intent)}",
            {"order_id": order_id, "payment_intent_id": payment_intent, "updated_at": iso_now()},
        )
        charge_id = clean_text(charge_alias.get("charge_id"), 255)
        if charge_id:
            STORE.put(
                f"stripe_charges/{safe_document_id(charge_id)}",
                {"order_id": order_id, "payment_intent_id": payment_intent, "updated_at": iso_now()},
            )


def save_paid_order(session: dict[str, object]) -> dict[str, object]:
    order = order_from_checkout_session(session)
    order_path = f"orders/{safe_document_id(str(order['id']))}"
    existing = STORE.get(order_path)
    order = merge_order(existing, order)
    STORE.put(order_path, order)
    bind_payment_aliases(order)

    if order.get("customer_email"):
        subject, body = customer_payment_email(order)
        EMAIL.send(
            to=str(order["customer_email"]),
            subject=subject,
            text=body,
            idempotency_key=f"customer-confirmation-{order['id']}",
            reply_to=EMAIL.admin_email,
        )
    admin_subject, admin_body = admin_payment_email(order)
    EMAIL.send(
        to=EMAIL.admin_email,
        subject=admin_subject,
        text=admin_body,
        idempotency_key=f"admin-confirmation-{order['id']}",
        reply_to=str(order.get("customer_email") or EMAIL.admin_email),
    )
    STORE.merge(
        order_path,
        {"confirmation_sent": True, "confirmation_sent_at": iso_now(), "updated_at": iso_now()},
    )
    return order


def find_order_for_event_object(obj: dict[str, object]) -> tuple[str, dict[str, object]] | None:
    payment_intent = clean_text(obj.get("payment_intent"), 255)
    charge_id = clean_text(obj.get("charge") or obj.get("id"), 255)
    alias: dict[str, object] | None = None
    if payment_intent:
        alias = STORE.get(f"stripe_payment_intents/{safe_document_id(payment_intent)}")
    if not alias and charge_id:
        alias = STORE.get(f"stripe_charges/{safe_document_id(charge_id)}")
    if not alias or not alias.get("order_id"):
        return None
    order_id = safe_document_id(str(alias["order_id"]))
    order = STORE.get(f"orders/{order_id}")
    return (order_id, order) if order else None


def process_stripe_event(event: dict[str, object]) -> None:
    event_type = clean_text(event.get("type"), 120)
    data = event.get("data") or {}
    obj = data.get("object") if isinstance(data, dict) else None
    if not isinstance(obj, dict):
        raise ValueError("Stripe event has no data object")

    if event_type in {"checkout.session.completed", "checkout.session.async_payment_succeeded"}:
        if clean_text(obj.get("payment_status"), 80) == "paid":
            save_paid_order(obj)
        return

    if event_type == "checkout.session.async_payment_failed":
        session_id = clean_text(obj.get("id"), 255)
        if session_id:
            STORE.merge(
                f"orders/{safe_document_id(session_id)}",
                {"payment_status": "failed", "updated_at": iso_now()},
            )
        return

    if event_type in {"charge.succeeded", "payment_intent.succeeded"}:
        if event_type == "charge.succeeded":
            charge_id = clean_text(obj.get("id"), 255)
            payment_intent = clean_text(obj.get("payment_intent"), 255)
        else:
            payment_intent = clean_text(obj.get("id"), 255)
            charge_id = clean_text(obj.get("latest_charge"), 255)
        if payment_intent:
            pi_path = f"stripe_payment_intents/{safe_document_id(payment_intent)}"
            alias = STORE.get(pi_path) or {}
            alias.update(
                {
                    "payment_intent_id": payment_intent,
                    "charge_id": charge_id,
                    "updated_at": iso_now(),
                }
            )
            STORE.put(pi_path, alias)
            if charge_id:
                charge_alias = {
                    "payment_intent_id": payment_intent,
                    "updated_at": iso_now(),
                }
                if alias.get("order_id"):
                    charge_alias["order_id"] = alias["order_id"]
                STORE.put(f"stripe_charges/{safe_document_id(charge_id)}", charge_alias)
        return

    if event_type == "charge.refunded":
        found = find_order_for_event_object(obj)
        if found:
            order_id, order = found
            amount = int(obj.get("amount") or order.get("amount_total") or 0)
            refunded = int(obj.get("amount_refunded") or 0)
            status = "refunded" if amount and refunded >= amount else "partially_refunded"
            STORE.merge(
                f"orders/{order_id}",
                {
                    "payment_status": status,
                    "amount_refunded": refunded,
                    "refunded_at": iso_now(),
                    "updated_at": iso_now(),
                },
            )
        return

    if event_type in {"charge.dispute.created", "charge.dispute.closed"}:
        found = find_order_for_event_object(obj)
        if found:
            order_id, _ = found
            dispute_status = clean_text(obj.get("status"), 80) or "open"
            STORE.merge(
                f"orders/{order_id}",
                {
                    "payment_status": "disputed" if event_type.endswith("created") else f"dispute_{dispute_status}",
                    "stripe_dispute_id": clean_text(obj.get("id"), 255),
                    "dispute_status": dispute_status,
                    "updated_at": iso_now(),
                },
            )


def begin_stripe_event(event_id: str, event_type: str) -> bool:
    path = f"stripe_events/{safe_document_id(event_id)}"
    existing = STORE.get(path)
    if existing and existing.get("status") == "processed":
        return False
    if existing and existing.get("status") == "processing":
        started = clean_text(existing.get("started_at"), 80)
        try:
            age = utc_now() - datetime.fromisoformat(started.replace("Z", "+00:00"))
            if age < timedelta(minutes=5):
                return False
        except ValueError:
            pass
    marker = {
        "event_id": event_id,
        "event_type": event_type,
        "status": "processing",
        "started_at": iso_now(),
    }
    try:
        if existing:
            STORE.put(path, marker)
        else:
            STORE.create("stripe_events", safe_document_id(event_id), marker)
    except StoreError as error:
        if error.status == HTTPStatus.CONFLICT:
            return False
        raise
    return True


def finish_stripe_event(event_id: str, status: str) -> None:
    STORE.merge(
        f"stripe_events/{safe_document_id(event_id)}",
        {"status": status, "finished_at": iso_now()},
    )


def validate_email(value: str) -> bool:
    return bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value)) and len(value) <= 320


def allowed_origin(origin: str) -> bool:
    if not origin:
        return True
    configured = os.getenv("ALLOWED_ORIGINS", "https://alyhackbart.com")
    allowed = {item.strip().rstrip("/") for item in configured.split(",") if item.strip()}
    return origin.rstrip("/") in allowed


def validate_inquiry(fields: dict[str, str], origin: str) -> tuple[dict[str, str] | None, str | None]:
    if not allowed_origin(origin):
        return None, "This form can only be submitted from AlyHackbart.com."
    if clean_text(fields.get("company_website"), 500):
        return None, "Your message could not be submitted."
    name = clean_text(fields.get("Full name"), 120)
    email = clean_text(fields.get("email"), 320)
    project_type = clean_text(fields.get("Project type"), 160)
    details = clean_text(fields.get("Details"), 5000)
    if not name or not validate_email(email) or not project_type or len(details) < 10:
        return None, "Please complete your name, email, project type, and project details."
    if clean_text(fields.get("Consent"), 80).lower() not in {"i agree", "agree", "yes", "on"}:
        return None, "Please confirm the privacy notice before sending."
    started = clean_text(fields.get("form_started_at"), 40)
    if started:
        try:
            elapsed = time.time() - float(started)
            if elapsed < 2 or elapsed > 7200:
                return None, "Please refresh the page and try again."
        except ValueError:
            return None, "Please refresh the page and try again."
    return {
        "name": name,
        "email": email,
        "project_type": project_type,
        "timeline": clean_text(fields.get("Timeline"), 160),
        "budget": clean_text(fields.get("Budget"), 160),
        "project_link": clean_text(fields.get("Project link"), 1000),
        "details": details,
    }, None


def inquiry_email(inquiry: dict[str, str]) -> tuple[str, str]:
    lines = [
        "New AlyHackbart.com project brief",
        "",
        f"Name: {inquiry['name']}",
        f"Email: {inquiry['email']}",
        f"Project type: {inquiry['project_type']}",
        f"Timeline: {inquiry['timeline']}",
        f"Budget: {inquiry['budget']}",
        f"Project link: {inquiry['project_link']}",
        "",
        "Project details:",
        inquiry["details"],
    ]
    return f"New project brief: {inquiry['project_type']}", "\n".join(lines)


def autoresponse_email(inquiry: dict[str, str]) -> tuple[str, str]:
    first_name = inquiry["name"].split(" ")[0]
    return (
        "Your project brief was received",
        (
            f"Hi {first_name},\n\n"
            "Thanks for reaching out to Aly Hackbart. Your project brief was received, "
            "and Aly will reply by email as soon as possible.\n\n"
            "Aly Hackbart\nalyhackbart.com"
        ),
    )


class SiteHandler(SimpleHTTPRequestHandler):
    server_version = "AlyHackbartSite/1.0"

    def __init__(self, *args: object, **kwargs: object) -> None:
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Content-Security-Policy", (
            "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; "
            "img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline'; "
            "script-src 'self'; connect-src 'self'; "
            "form-action 'self' https://formsubmit.co https://*.stripe.com"
        ))
        host = self.headers.get("Host", "").split(":", 1)[0].lower()
        if self.headers.get("X-Forwarded-Proto", "https") == "https" and host not in {"localhost", "127.0.0.1"}:
            self.send_header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        super().end_headers()

    def log_message(self, format_string: str, *args: object) -> None:
        LOGGER.info("%s %s", self.command, urlparse(self.path).path)

    def _json(self, status: int, payload: dict[str, object]) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self) -> bytes | None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Invalid request length."})
            return None
        if length <= 0 or length > MAX_BODY_BYTES:
            self._json(
                HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
                {"ok": False, "error": "The request was empty or too large."},
            )
            return None
        return self.rfile.read(length)

    def _client_key(self) -> str:
        forwarded = self.headers.get("X-Forwarded-For", "")
        address = forwarded.split(",", 1)[0].strip() or self.client_address[0]
        salt = os.getenv("RATE_LIMIT_SALT", "local-rate-limit")
        return hashlib.sha256(f"{salt}:{address}".encode("utf-8")).hexdigest()

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path in {"/healthz", "/api/health"}:
            ready = STORE.configured and EMAIL.configured and bool(os.getenv("STRIPE_WEBHOOK_SECRET"))
            self._json(
                HTTPStatus.OK,
                {
                    "ok": True,
                    "ready_for_webhooks": ready,
                    "firestore_configured": STORE.configured,
                    "email_configured": EMAIL.configured,
                    "contact_form_enabled": env_bool("CONTACT_FORM_ENABLED"),
                },
            )
            return
        if not is_public_static_path(path):
            self._json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found."})
            return
        super().do_GET()

    def do_HEAD(self) -> None:
        path = urlparse(self.path).path
        if not is_public_static_path(path):
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        super().do_HEAD()

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/stripe/webhook":
            self._handle_stripe_webhook()
            return
        if path == "/api/inquiries":
            self._handle_inquiry()
            return
        match = re.fullmatch(r"/api/orders/([^/]+)/status", path)
        if match:
            self._handle_order_status(match.group(1))
            return
        self._json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found."})

    def _handle_stripe_webhook(self) -> None:
        secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
        if not STORE.configured or not EMAIL.configured or not secret:
            self._json(
                HTTPStatus.SERVICE_UNAVAILABLE,
                {"ok": False, "error": "Webhook processing is not configured."},
            )
            return
        body = self._read_body()
        if body is None:
            return
        if not verify_stripe_signature(body, self.headers.get("Stripe-Signature", ""), secret):
            self._json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Invalid signature."})
            return
        try:
            event = json.loads(body)
            event_id = clean_text(event.get("id"), 255)
            event_type = clean_text(event.get("type"), 120)
            if not event_id or not event_type:
                raise ValueError("Missing event identity")
            if not begin_stripe_event(event_id, event_type):
                self._json(HTTPStatus.OK, {"ok": True, "duplicate": True})
                return
            process_stripe_event(event)
            finish_stripe_event(event_id, "processed")
        except (ValueError, TypeError, json.JSONDecodeError):
            self._json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Invalid Stripe event."})
            return
        except (StoreError, EmailError, ConfigurationError):
            LOGGER.exception("Stripe event processing failed")
            try:
                if "event_id" in locals():
                    finish_stripe_event(event_id, "failed")
            except StoreError:
                LOGGER.exception("Could not mark Stripe event as failed")
            self._json(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {"ok": False, "error": "The event will be retried."},
            )
            return
        self._json(HTTPStatus.OK, {"ok": True})

    def _handle_inquiry(self) -> None:
        if not env_bool("CONTACT_FORM_ENABLED") or not STORE.configured or not EMAIL.configured:
            self._json(
                HTTPStatus.SERVICE_UNAVAILABLE,
                {"ok": False, "error": "Online inquiries are temporarily unavailable. Please email Aly directly."},
            )
            return
        if not INQUIRY_LIMITER.allow(self._client_key()):
            self._json(
                HTTPStatus.TOO_MANY_REQUESTS,
                {"ok": False, "error": "Too many messages were sent. Please try again later."},
            )
            return
        body = self._read_body()
        if body is None:
            return
        content_type = self.headers.get("Content-Type", "").split(";", 1)[0]
        if content_type != "application/x-www-form-urlencoded":
            self._json(HTTPStatus.UNSUPPORTED_MEDIA_TYPE, {"ok": False, "error": "Unsupported form type."})
            return
        parsed = parse_qs(body.decode("utf-8", "replace"), keep_blank_values=True)
        fields = {key: values[-1] for key, values in parsed.items() if values}
        inquiry, error = validate_inquiry(fields, self.headers.get("Origin", ""))
        if error or inquiry is None:
            self._json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": error or "Invalid form."})
            return

        inquiry_id = uuid.uuid4().hex
        record: dict[str, object] = {
            **inquiry,
            "status": "received",
            "created_at": iso_now(),
            "source": "alyhackbart.com",
        }
        try:
            STORE.create("inquiries", inquiry_id, record)
            subject, message = inquiry_email(inquiry)
            EMAIL.send(
                to=EMAIL.admin_email,
                subject=subject,
                text=message,
                idempotency_key=f"inquiry-admin-{inquiry_id}",
                reply_to=inquiry["email"],
            )
            auto_subject, auto_message = autoresponse_email(inquiry)
            EMAIL.send(
                to=inquiry["email"],
                subject=auto_subject,
                text=auto_message,
                idempotency_key=f"inquiry-customer-{inquiry_id}",
                reply_to=EMAIL.admin_email,
            )
            STORE.merge(
                f"inquiries/{inquiry_id}",
                {"email_sent": True, "email_sent_at": iso_now()},
            )
        except (StoreError, EmailError, ConfigurationError):
            LOGGER.exception("Inquiry processing failed")
            self._json(
                HTTPStatus.BAD_GATEWAY,
                {"ok": False, "error": "Your message could not be sent. Please email Aly directly."},
            )
            return
        self._json(HTTPStatus.CREATED, {"ok": True, "redirect": "/thanks.html"})

    def _handle_order_status(self, order_id: str) -> None:
        expected = os.getenv("ADMIN_API_TOKEN", "")
        provided = self.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        if not expected or not provided or not hmac.compare_digest(expected, provided):
            self._json(HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "Unauthorized."})
            return
        body = self._read_body()
        if body is None:
            return
        try:
            payload = json.loads(body)
        except (json.JSONDecodeError, TypeError):
            self._json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Invalid JSON."})
            return
        status = clean_text(payload.get("status"), 80)
        if status not in ALLOWED_ADMIN_STATUSES:
            self._json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Invalid order status."})
            return
        path = f"orders/{safe_document_id(order_id)}"
        try:
            order = STORE.get(path)
            if not order:
                self._json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Order not found."})
                return
            updates: dict[str, object] = {"fulfillment_status": status, "updated_at": iso_now()}
            if status == "scheduled":
                updates["scheduled_at"] = clean_text(payload.get("scheduled_at"), 120)
                updates["meeting_url"] = clean_text(payload.get("meeting_url"), 1000)
            if status == "delivered":
                updates["delivered_at"] = iso_now()
            order = STORE.merge(path, updates)
            if status in {"scheduled", "delivered"} and order.get("customer_email"):
                detail = "Your reading has been delivered."
                if status == "scheduled":
                    detail = f"Your 30-minute reading is scheduled for {order.get('scheduled_at') or 'the agreed time'}."
                    if order.get("meeting_url"):
                        detail += f"\nVideo call: {order['meeting_url']}"
                EMAIL.send(
                    to=str(order["customer_email"]),
                    subject=f"Reading {status}",
                    text=f"Hi,\n\n{detail}\n\nQuestions: {EMAIL.admin_email}\n\nAly Hackbart",
                    idempotency_key=f"order-status-{order_id}-{status}-{hashlib.sha256(json.dumps(updates, sort_keys=True).encode()).hexdigest()[:16]}",
                    reply_to=EMAIL.admin_email,
                )
        except (StoreError, EmailError, ConfigurationError):
            LOGGER.exception("Order status update failed")
            self._json(HTTPStatus.BAD_GATEWAY, {"ok": False, "error": "The order could not be updated."})
            return
        self._json(HTTPStatus.OK, {"ok": True, "status": status})


def run() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", PORT), SiteHandler)
    LOGGER.info("Serving AlyHackbart.com on port %s", PORT)
    server.serve_forever()


if __name__ == "__main__":
    run()
