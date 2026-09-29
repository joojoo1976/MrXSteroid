# Fourthwall Gateway Contract Alignment (test-only) — Implementation Plan

## Goal
Align the Fourthwall integration to the **official provider contract** (docs.fourthwall.com
is source of truth), test-only. No Production activation, no migration, no secrets, no
Kashier/Egypt changes.

## Verified Official Contract (source: docs.fourthwall.com)

### Authentication
- Shop-level Open API User credentials use **HTTP Basic Auth**:
  `Authorization: Basic base64(username:password)`.
- Base URL: `https://api.fourthwall.com/open-api/v1/...` (OpenAPI schemas show `/open-api/v1.0/`).
- Source: https://docs.fourthwall.com/guides/authentication

### Checkout (Storefront API — headless carts)
- Storefront base: `https://storefront-api.fourthwall.com/v1/...`
- Auth: `storefront_token` query param (public token, created via `Get or Create Public Token`).
- `POST /v1/carts` body: `{ items: [{ variantId (uuid), quantity, bundleId? }], metadata }`.
  `metadata` max 10 keys, keys `[a-zA-Z0-9_]`, ≤256 chars/key, ≤512/value, ≤2KB total.
  Cart metadata is propagated to the order's `metadata` on checkout.
- No server-side "checkout session" endpoint exists. Buyer is **redirected** to:
  `https://{shop_domain}/cart/checkout?cartId={cartId}&currency=USD`
  (or `?products={variantUUID}:{qty}&currency=USD`).
- Source: https://docs.fourthwall.com/shop-apis/cart-checkout-endpoint,
  https://docs.fourthwall.com/api-reference/storefront/carts/create-cart

### Webhooks
- Signature: HMAC-SHA256 over the **entire raw webhook body** with the shop **webhook
  secret**, result **base64-encoded**, delivered in header **`X-Fourthwall-Hmac-SHA256`**
  (Platform Apps use `X-Fourthwall-Hmac-Apps-SHA256`).
- Envelope: `{ testMode, id (dedup key), webhookId, shopId, type, apiVersion, createdAt, data }`.
- Event types: `ORDER_PLACED`, `ORDER_UPDATED`, `DONATION`, ... `data` = the event object
  (for order events, `data` is the OrderV1 order object).
- Order status enum (OrderV1): `CONFIRMED, PARTIALLY_IN_PRODUCTION, IN_PRODUCTION,
  PARTIALLY_SHIPPED, SHIPPED, PARTIALLY_DELIVERED, DELIVERED, CANCELLED, COMPLETED`.
- Successful-payment gate: `CONFIRMED` (or `COMPLETED`/`DELIVERED`). `CANCELLED` = failed.
  Unknown/invalid statuses → **fail closed**.
- **No fulfillment on a redirect alone** — fulfillment only from a verified status webhook.
- Source: https://docs.fourthwall.com/webhooks/signature-verification,
  https://docs.fourthwall.com/webhooks/webhook-model,
  https://docs.fourthwall.com/api-reference/platform/orders/get-order

### Idempotency
- Dedup key = webhook event `id` (doc: "If you receive multiple events with the same id,
  treat them as duplicates"). Replay → no-op.
- Cart creation is idempotent per invoice via `metadata` (invoice id) lookups.

### Digital delivery (Platform API)
- `PUT /open-api/v1.0/order/{orderId}/downloaded` marks a digital download complete and can
  create a download from a provided `defaultFileUrl`.
- Digital products are their own order item; **no verified "free digital file attached to a
  different physical product" rule** — Digital Book for physical purchases must use the
  signed-download fallback, NOT claimed native attachment.
- Source: https://docs.fourthwall.com/api-reference/platform/orders/mark-download-complete,
  https://docs.fourthwall.com/guides/create-digital-products

## Files to change (Fourthwall crate only — all untracked/new)
- `server/payments/gateways/FourthwallGateway.ts` — contract alignment (auth, base URL,
  webhook HMAC base64, status mapping, checkout cart path, idempotency, price validation).
- `server/payments/fulfillment/DigitalBookDelivery.ts` — stop false native-attachment claim;
  use signed URL for cross-product digital book.
- `app/api/webhooks/fourthwall/route.ts` — raw-body-based signature check wiring + dedup.
- `tests/unit/FourthwallGateway.test.ts` — real contract fixtures.
- `tests/unit/DigitalBookDelivery.test.ts` — honest native/signed behavior.
- `tests/integration/fourthwallGlobalCheckout.test.ts` — contract fixtures + statuses.
- `tests/unit/merchantResolverFourthwall.test.ts` — routing stays GLOBAL→Fourthwall.
- `tests/unit/ShippoService.test.ts` — contract-only (no real label).

## TDD tasks
1. RED: webhook fixtures (valid / invalid sig / duplicate / unknown status / successful
   fulfillment) against current gateway → fail.
2. IMPLEMENT: gateway `verifyWebhook` to real contract.
3. RED+GREEN: checkout cart path + auth + price validation (fetch mocked).
4. RED+GREEN: DigitalBook honest native/signed behavior.
5. GREEN: merchantResolverFourthwall + ShippoService (already green — keep green).
6. Run all 5 Fourthwall suites → 0 failures; confirm no new Kashier failures.
7. Report.

## Constraints
- No Kashier/Egypt/InstaPay/settlement changes.
- No migration apply, no Prod secrets, no deploy, no real order/label/shipment.
- Prices fixed: 49.99 / 72.00 / 82.00. Coaching/Consultation blocked.
