# Webhook Architecture

## Endpoint
Single unified endpoint: `POST /api/payments/webhook`

Configure this URL in all gateway dashboards.

## Processing Flow

```
POST /api/payments/webhook
  |
  v
PaymentFactory.detectGatewayFromRequest()
  - x-kashier-signature header -> KashierGateway(egypt) [initial]
  - stripe-signature header    -> StripeGateway
  - hmac header/query          -> PaymobGateway
  - x-spaceremit-signature     -> SpaceRemitGateway
  |
  v
gateway.verifyWebhook(rawBody)
  |-- If Kashier fails: cross-account routing via merchantId
  |
  v
DB-level dedup: INSERT INTO webhook_events (UNIQUE provider + event_id)
  |-- Duplicate (code 23505) -> 200 OK, skip
  |
  v
Status mapping:
  TIMED_OUT / UNKNOWN / AUTHORIZED -> unresolved (no action, 200 OK)
  APPROVED / CAPTURED / SUCCESS    -> status=success
  DECLINED / FAILED / EXPIRED      -> status=failed
  |
  v
Invoice-level idempotency: check invoices.status = success
  |
  v
[success path]
  verifyPaidAmount() -- defense-in-depth amount check
  UPDATE invoices SET status=success, payment_status=paid, paid_at=now()
  UPDATE profiles SET subscription_status=active
  triggerAffiliateCommission() [non-fatal]
  |
  v
[failed path]
  UPDATE invoices SET status=failed, payment_status=failed
  |
  v
UPDATE webhook_events SET status=processed
200 OK
```

## Kashier Cross-Account Routing
If `KASHIER_EGYPT` verification fails (merchant ID mismatch), the handler reads `merchantId` from the payload and re-routes to `KASHIER_GLOBAL` (or vice versa) using `PaymentFactory.detectKashierAccountFromMerchantId()`.

## Idempotency Guarantees
1. **DB level:** `webhook_events.UNIQUE(provider, provider_event_id)` — prevents duplicate insert.
2. **Invoice level:** `invoices.status = success` check before any write.
3. **Commission level:** `referrals.invoice_id` check inside `triggerAffiliateCommission`.

## Status Codes
| Gateway Status | Internal status | Action |
|---|---|---|
| APPROVED, SUCCESS, CAPTURED | success | Fulfil |
| DECLINED, EXPIRED_CARD, UNSPECIFIED_FAILURE, ACQUIRER_SYSTEM_ERROR, REFUNDED, VOIDED | failed | Mark failed |
| TIMED_OUT, UNKNOWN, AUTHORIZED | undefined | No action, pending reconciliation |
