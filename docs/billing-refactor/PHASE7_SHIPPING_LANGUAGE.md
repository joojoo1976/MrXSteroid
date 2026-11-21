# Phase 7 — Shipping and book language as invoice lines

Branch: `feat/r6.1-tools-041-042` (not pushed).
No migration, no gateway/key/env change, no port 3111 process change.

## What changed

### 1. Shipping provider boundary

New:
- `server/shipping/ShippingProvider.ts` — `ShippingProvider { quote(); createShipment(); track() }`,
  `ShippingQuote`, `ShippingUnavailableError`.
- `server/shipping/FlatRateProvider.ts` — Egypt-only 199 EGP flat rate, `service_code = flat_rate`.
  `createShipment()` / `track()` explicitly return `carrier_not_integrated`; no courier API is called.

`server/payments/quote.ts` now resolves the approved Egypt rate through `FlatRateProvider`
(passing the already-resolved amount/provider), so the quote line and provider agree.

### 2. Shipping line on quote / invoice

The existing `line_type='shipping'` line now carries:

```json
{
  "metadata": {
    "provider_id": "eg_standard",
    "service_code": "flat_rate",
    "quote_id": "<cart_hash>",
    "amount": 199
  }
}
```

`quote.total` is derived from all quote lines (products + shipping + addons − discount + tax).
`buildInvoiceLinePayload()` already persists this metadata to `invoice_lines`; no SQL change was needed.

### 3. Book language

- `features/checkout/ProductSelector.tsx` accepts `bookLanguage` / `onBookLanguageChange` and renders
  an Arabic/English selector.
- `legacy-pages/CheckoutPage.tsx` owns the selection and passes it as `selectedLanguage`.
- Payment quote already requires `language` for book SKUs (`LANGUAGE_REQUIRED`) and stores it on the
  quote line; `buildInvoiceLinePayload()` persists `language` on `invoice_lines`.
- `server/payments/fulfillment/DigitalBookDelivery.ts` accepts `language` on `deliverAfterPurchase()`
  and resolves a distinct asset (`resolveDigitalBookAsset`): Arabic uses
  `MrXSteroid_Digital_Protocol_ar.pdf`; English stays the current asset. Validation derives the
  language from the stored `file_name`.

### 4. Entitlements from invoice lines

`server/payments/entitlementService.ts` adds:

- `canonicalProductIdForInvoiceLine()` — maps `line_type`/`sku` to the canonical entitlement product
  (`MRX-PROTOCOL`, `MRX-TACTICAL`, `MRX-SMART-PRO`, `MRX-COACHING-ADDON`, `MRX-CONSULTATION`);
  ignores shipping/discount/tax lines.
- `grantEntitlementsFromInvoice()` — reads `invoice_lines` for the invoice, grants one entitlement per
  canonical product, and stores the line language in entitlement metadata.
- Legacy invoices without lines fall back to the supplied product id so already-paid rows remain
  deliverable.

`server/payments/fulfillmentService.ts` now calls `grantEntitlementsFromInvoice()` with
`fallbackProductId: invoice.tier_id` instead of granting directly from the invoice tier.

## Tests added

`tests/unit/phase7ShippingLanguageEntitlements.test.ts` — **9/9 passing**:
1. `FlatRateProvider` quotes 199 EGP / `eg_standard` / `flat_rate`.
2. Carrier methods report `not_integrated`.
3. Shipping line has provider/service/amount and `quote_id = cart_hash`.
4. Invoice total equals the sum of all lines.
5. Shipping metadata survives `buildInvoiceLinePayload`.
6. Product line keeps `language: 'ar'`.
7. A book without language is rejected with `LANGUAGE_REQUIRED`.
8. `DigitalBookDelivery` with `language: 'ar'` inserts the Arabic file name, not the English one.
9. Entitlements are granted from `invoice_lines`, with shipping ignored and `language` in metadata.

Existing focused suites also re-run green:
- `checkoutQuote.test.ts` + `shippingTamperResistance.test.ts` — 82/82.
- `DigitalBookDelivery.test.ts` — 14/14.
- `captureToLedgerIntegrity.test.ts` — 21/21.
- phase-5/6 webhook suites — green.

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | exit 0 (clean) |
| `npx next build` | exit 0 (success) |
| Payment suite (53 matching files) | **669 passed, 14 failed, 683 total** |
| Failed files | identical baseline: `checkoutCountryRouting` (8), `createInvoiceKashierDelegation` (1), `checkoutSessionService` (1), `instapayPreservationLock` (1), `paymentReceiptsAdmin` (3) |
| New/disabled tests | none disabled; no existing expectation changed |

## Risks / decisions for human review

1. `FlatRateProvider` is a price bucket, not a live carrier. `createShipment()` / `track()` are
   intentionally unimplemented; enabling a real carrier later needs credentials and a provider.
2. Shipping price still originates from `server/payments/pricing.ts` (`EGYPT_LOCAL_SHIPPING_EGP`);
   `FlatRateProvider` is constructed with the resolved amount. This keeps admin/env overrides working
   while preserving the 199 EGP default.
3. The legacy `create-invoice` route still writes invoice-level metadata rather than an
   `invoice_lines` row for its non-quote path. The invoice-first quote path is the one that persists
   language/shipping lines; Phase 8 can decide whether to retire that legacy branch.
4. `guestClaimService` still grants directly from the claim's product id. It preserves the existing
   `source: 'guest_order_claim'` contract/tests; the main fulfillment path is now line-based.
5. `ProductSelector` shows the language selector for the current book variants; add-on/service-only
   future flows must pass the prop explicitly.

## Commit

Phase 7 is committed separately after this document.

## Rollback

- Revert the Phase 7 commit: `git revert <phase7-commit>`.
- No database migration was applied, so there is nothing to roll back in Supabase.
- `invoice_lines` rows already written keep `language` / shipping metadata; reverting code does not
  mutate them.
