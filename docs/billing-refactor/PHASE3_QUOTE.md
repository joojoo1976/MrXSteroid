# Phase 3 — Quote Endpoint (read-only, signed)

## Route

`POST /api/checkout/quote` (`runtime = nodejs`)

Builds a proposed multi-line quote from `server/payments/pricing.ts`. It does
**not** create an order, invoice, payment intent, or gateway session, and it has
no database client.

## Request

```json
{
  "region": "EG",
  "lines": [
    { "sku": "bundle", "quantity": 1, "language": "ar", "edition": "paperback" }
  ],
  "shippingAddress": { "address": "1 Test Street", "city": "Cairo" },
  "promoCode": "STEROIDIQ",
  "shippingProviderId": "eg_standard",
  "addons": ["coaching"],
  "language": "ar"
}
```

`sku` accepts tier ids (`digital`, `bundle`, `coaching`, `pdf`, `paperback`,
`*_plus`) and canonical products (`MRX-PROTOCOL`, `MRX-TACTICAL`,
`MRX-SMART-PRO`, `MRX-COACHING-ADDON`, `MRX-CONSULTATION`).

The schema is Zod `.strict()`. Any of these client fields is rejected with
`code = CLIENT_PRICE_FIELD_FORBIDDEN` and a `fields` list:

`price`, `unit_price`, `unitPrice`, `line_total`, `lineTotal`, `subtotal`,
`sub_total`, `discount`, `discount_amount`, `discountAmount`, `tax`,
`tax_amount`, `taxAmount`, `shipping`, `shipping_cost`, `shippingCost`, `total`,
`total_amount`, `totalAmount`, `amount`, `currency`.

## Response

```json
{
  "success": true,
  "region": "EGYPT",
  "currency": "EGP",
  "lines": [
    { "line_type": "product", "sku": "bundle", "qty": 1, "unit_price": 749, "line_total": 749, "...": "..." },
    { "line_type": "shipping", "unit_price": 199, "line_total": 199, "metadata": { "provider_id": "eg_standard", "service_code": "flat_rate", "quote_id": "..." } },
    { "line_type": "discount", "unit_price": 1, "line_total": -1 }
  ],
  "subtotal": 749,
  "discount": 1,
  "shipping": 199,
  "tax": 0,
  "total": 947,
  "pricing_version": "2026-11-18.1",
  "cart_hash": "<sha256>",
  "expires_at": "2026-11-18T12:10:00.000Z",
  "quote_token": "<base64url payload>.<base64url hmac>"
}
```

`total` equals the sum of line totals. `subtotal` excludes shipping/discount.

## Quote token

`server/payments/quote.ts`

- HMAC-SHA256 over a base64url JSON payload (`v=1`).
- Payload: `iat`, `exp`, `cart_hash`, `pricing_version`, `currency`, `region`,
  `total`.
- TTL: 10 minutes (clamped 30s–30min).
- Secret: `QUOTE_TOKEN_SECRET`, falling back to the existing
  `SUPABASE_SERVICE_ROLE_KEY` so no new env value is required to deploy.
- `verifyQuoteToken(token, { now, expectedCartHash })` rejects `MALFORMED`,
  `BAD_SIGNATURE`, `EXPIRED`, `CART_MISMATCH`, `MISSING_SECRET`.

The token's numeric fields are **audit data only**. Phase 4 must re-price the
cart from `pricing.ts` and compare `cart_hash`; it must not use the token total
as an accounting input.

## Business rules enforced server-side

- Currency is derived from `region`; never accepted from the client.
- Egypt physical → `199 EGP` flat-rate shipping line; shipping address required.
- GLOBAL physical → rejected (`GLOBAL_PHYSICAL_SHIPPING_BLOCKED`).
- Digital/PDF → no shipping.
- Book lines require `language` (`ar`/`en`); unknown/missing language rejected.
- Consultation is GLOBAL/USD only (`SERVICE_NOT_AVAILABLE_IN_EGYPT` in Egypt).
- `*_plus` is split into base product + coaching add-on lines.
- Promo codes are computed by `computePromoDiscount`; no client discount amount.
- Tax is currently `0` (no tax is enabled); the field is present for Phase 4+.

## Verification (Phase 3)

- `npx vitest run tests/unit/checkoutQuote.test.ts` → **24/24 passed**
- `npx tsc --noEmit` → exit 0
- `npx next build` → exit 0 (route `/api/checkout/quote` emitted; only existing
  `metadataBase` warnings)
- Payment suite → **627 passed / 14 failed** (45 files; the same 14 baseline
  failures documented in `PHASE1_FAILURE_CLASSIFICATION.md`)

## Risks / human decisions

1. Quote uses `basePricing()` (catalog + `PRICING_*` env overrides), not
   `admin_settings`. If an admin override exists, the invoice (Phase 4,
   `loadPricing()`) can differ from the quote. Phase 4 must either read the same
   config or the quote must be revalidated before invoice creation.
2. The signing secret fallback reuses `SUPABASE_SERVICE_ROLE_KEY`. A dedicated
   `QUOTE_TOKEN_SECRET` is recommended for production; no env file was changed.
3. `tax` is 0 because no tax engine is active; enabling `REGIONAL_CONFIG.taxRate`
   would change totals and needs a human decision.
4. `edition` is accepted but not yet required/validated per tier; Phase 7 owns
   book-language/edition delivery rules.
