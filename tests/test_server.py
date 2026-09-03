import hashlib
import hmac
import json
import time
import unittest

import server


class StripeSignatureTests(unittest.TestCase):
    def test_accepts_valid_signature(self):
        payload = b'{"id":"evt_test"}'
        secret = "whsec_test"
        timestamp = 1_700_000_000
        signature = hmac.new(
            secret.encode(), str(timestamp).encode() + b"." + payload, hashlib.sha256
        ).hexdigest()
        header = f"t={timestamp},v1={signature}"
        self.assertTrue(
            server.verify_stripe_signature(payload, header, secret, now=timestamp)
        )

    def test_rejects_invalid_or_stale_signature(self):
        payload = b"{}"
        self.assertFalse(
            server.verify_stripe_signature(payload, "t=1700000000,v1=nope", "secret", now=1700000000)
        )
        signature = hmac.new(
            b"secret", b"1700000000." + payload, hashlib.sha256
        ).hexdigest()
        self.assertFalse(
            server.verify_stripe_signature(
                payload, f"t=1700000000,v1={signature}", "secret", now=1700001000
            )
        )


class CheckoutParsingTests(unittest.TestCase):
    def test_parses_written_tarot_order(self):
        session = {
            "id": "cs_test_123",
            "created": 1_788_400_000,
            "payment_link": "plink_1UBeF2A59Pf3OUe3lUcQknEy",
            "payment_intent": "pi_test",
            "payment_status": "paid",
            "amount_total": 3500,
            "currency": "usd",
            "customer_details": {"email": "reader@example.com", "name": "Reader Name"},
            "custom_fields": [
                {
                    "key": "format",
                    "label": {"custom": "Reading format"},
                    "dropdown": {"value": "written"},
                },
                {
                    "key": "focus",
                    "label": {"custom": "Question or area of focus"},
                    "text": {"value": "Career direction"},
                },
            ],
        }
        order = server.order_from_checkout_session(session)
        self.assertEqual(order["service"], "Tarot reading")
        self.assertEqual(order["reading_format"], "written")
        self.assertEqual(order["amount_total"], 3500)
        self.assertIn("delivery_due_date", order)

    def test_preserves_advanced_fulfillment_state_on_retry(self):
        existing = {"id": "cs_test", "fulfillment_status": "delivered"}
        incoming = {"id": "cs_test", "fulfillment_status": "paid", "payment_status": "paid"}
        merged = server.merge_order(existing, incoming)
        self.assertEqual(merged["fulfillment_status"], "delivered")


class InquiryValidationTests(unittest.TestCase):
    def valid_fields(self):
        return {
            "Full name": "Potential Client",
            "email": "client@example.com",
            "Project type": "Branded content",
            "Details": "I need a story edit for an upcoming campaign.",
            "Consent": "I agree",
            "form_started_at": str(time.time() - 10),
        }

    def test_accepts_complete_inquiry(self):
        inquiry, error = server.validate_inquiry(
            self.valid_fields(), "https://alyhackbart.com"
        )
        self.assertIsNone(error)
        self.assertEqual(inquiry["email"], "client@example.com")

    def test_rejects_honeypot_and_wrong_origin(self):
        fields = self.valid_fields()
        fields["company_website"] = "https://spam.example"
        self.assertIsNotNone(
            server.validate_inquiry(fields, "https://alyhackbart.com")[1]
        )
        self.assertIsNotNone(
            server.validate_inquiry(self.valid_fields(), "https://example.com")[1]
        )


class FirestoreCodecTests(unittest.TestCase):
    def test_round_trip(self):
        source = {
            "text": "hello",
            "count": 3,
            "ready": True,
            "items": ["a", 2],
            "nested": {"value": None},
        }
        encoded = json.loads(server.encode_firestore_document(source))
        self.assertEqual(server.decode_firestore_document(encoded), source)


class StaticFileAllowlistTests(unittest.TestCase):
    def test_public_site_files_are_available(self):
        self.assertTrue(server.is_public_static_path("/"))
        self.assertTrue(server.is_public_static_path("/readings/"))
        self.assertTrue(server.is_public_static_path("/assets/media/reel.mp4"))

    def test_source_and_configuration_files_are_private(self):
        self.assertFalse(server.is_public_static_path("/server.py"))
        self.assertFalse(server.is_public_static_path("/.pages.yml"))
        self.assertFalse(server.is_public_static_path("/content/site-content.json"))


if __name__ == "__main__":
    unittest.main()
