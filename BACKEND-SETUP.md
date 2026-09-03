# Payment fulfillment backend

The production container serves the existing static site and these server-side routes:

- `POST /api/stripe/webhook` verifies Stripe signatures and records paid, failed, refunded, and disputed payments.
- `POST /api/inquiries` validates and rate-limits project briefs before storing and emailing them.
- `POST /api/orders/{checkout_session_id}/status` records scheduled, preparing, delivered, or canceled fulfillment state. It requires an admin bearer token.
- `GET /api/health` reports configuration readiness without returning secret values.

Checkout remains on Stripe-hosted Payment Links. Card data never passes through this server.

## Production services

Use the existing Google Cloud project and Cloud Run service.

1. Create a Firestore database in Native mode in the same project.
2. Grant the Cloud Run runtime service account read/write access only to the Firestore database used by this site.
3. Add the secrets below to Google Secret Manager and expose them to the Cloud Run service as environment variables. Do not paste secret values into this repository.
4. Deploy the container and open `/api/health`. Do not register the webhook until `ready_for_webhooks` is `true`.
5. In Stripe Workbench, create a live webhook endpoint at `https://alyhackbart.com/api/stripe/webhook` for the event list below. Put its signing secret in Google Secret Manager as `STRIPE_WEBHOOK_SECRET`.
6. Send a test event and confirm a successful response before enabling the endpoint for live fulfillment.
7. Set `CONTACT_FORM_ENABLED=true`, then change the public contact form action to `/api/inquiries` only after a live inquiry test succeeds.

## Environment contract

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_CLOUD_PROJECT` | Yes | Project containing the Firestore database. Cloud Run normally supplies this. |
| `FIRESTORE_DATABASE` | No | Defaults to `(default)`. |
| `STRIPE_WEBHOOK_SECRET` | Yes | Live endpoint signing secret from Stripe. |
| `RESEND_API_KEY` | Yes | Transactional email credential. Store in Secret Manager. |
| `EMAIL_FROM` | Yes | Verified sender, such as `Aly Hackbart <bookings@alyhackbart.com>`. |
| `ADMIN_EMAIL` | Yes | Aly's fulfillment inbox. Defaults to the current Gmail address. |
| `ADMIN_API_TOKEN` | Yes | Long random token for internal fulfillment status updates. |
| `RATE_LIMIT_SALT` | Yes | Long random value used when hashing client addresses for rate limiting. |
| `SCHEDULING_URL` | No | Booking link included for live-reading customers. Without it, confirmation says Aly will email. |
| `ALLOWED_ORIGINS` | No | Comma-separated form origins. Defaults to `https://alyhackbart.com`. |
| `CONTACT_FORM_ENABLED` | No | Keep `false` until Firestore and email are verified. |
| `INQUIRY_RATE_PER_HOUR` | No | Per-instance contact limit. Defaults to 5. |

## Stripe event subscriptions

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.succeeded`
- `charge.succeeded`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

The webhook stores Stripe event IDs before processing so retries are idempotent. Email requests also use idempotency keys based on the Checkout Session ID.

## Fulfillment status update

Send JSON with an admin bearer token. Never put the token into client-side JavaScript.

```bash
curl -X POST 'https://alyhackbart.com/api/orders/cs_example/status' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  --data '{"status":"scheduled","scheduled_at":"2026-09-10T14:00:00-07:00","meeting_url":"https://meet.google.com/example"}'
```

Allowed fulfillment states are `scheduled`, `preparing`, `delivered`, and `canceled`. Refunds remain in Stripe and arrive through verified Stripe events.
