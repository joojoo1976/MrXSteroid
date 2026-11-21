# Phase 5 — Gateway bypass paths → invoice-first

Status: implemented on `feat/r6.1-tools-041-042`. No gateway setting, key or env
variable was changed. No migration was applied.

## Final Table 2.3

```text
/checkout → quote → create-invoice → create-session     invoice-first (4)
Kashier quick links (3)                                  bypass → invoice-first (5)
Kashier service links                                    bypass/partial → invoice-first service (5)
Paymob direct/standalone                                 bypass → redirect/invoice-first (5)
Fourthwall                                               invoice-first (partial) (5 classify, 7 complete)
SpaceRemit /smart-landing                                legacy-bypass (5 classify, later convert)
SpaceRemit gateway fallback                              invoice-backed (6/8)
InstaPay receipt                                         invoice-backed (6 verify amount)
Stripe                                                   invoice-backed (6)
```

## What changed

### 1. Kashier quick links (3)

- `shared/lib/checkoutPlan.ts` builds first-party `/checkout?plan=...` URLs and
  copies `utm_*` + `ref`.
- `buildKashierPaymentPageUrl()` now returns that internal URL. The historical
  `KASHIER_PAYMENT_PAGES[*].liveUrl` values remain in the repo for audit and
  rollback but are no longer used to send customers to a payment page.
- `/checkout` already understood `?plan=`; the quick-link block now also passes
  `region=EG|GLOBAL` and no longer says “no form”.
- The deprecated `features/marketing/PricingSection.tsx` duplicate uses the same
  builder, so it cannot keep an external quick-pay link.

### 2. Kashier service links (VIP Coaching / Consultation)

- `KASHIER_SERVICE_LINKS_VERIFIED` is read in the server route
  (`app/checkout/page.tsx`) and passed to `CheckoutPage` as
  `showDirectServices`. When false, `DirectServicesCheckoutSection` is not
  rendered at all.
- When true, the section collects full name + email and runs:
  `POST /api/checkout/quote` → `POST /api/payments/create-invoice` with
  `quote_token` → `POST /api/payments/create-session` with `invoiceId`.
  No `liveUrl` is opened from the UI.
- VIP Coaching is now a standalone service `vip_coaching` in
  `server/payments/pricing.ts` (349.99 USD), not a book add-on. Consultation
  remains a service (30.00 USD).
- `createSessionFromInvoice()` detects service invoices and builds the existing
  server-side Kashier service link **after** the invoice exists. It does not
  require the GLOBAL Kashier merchant to be enabled and never routes a service
  to Fourthwall. The flag is not consulted on this path.
- `KashierServiceLinkAdapter` is left untouched as the legacy combined-checkout
  adapter (not used by the Phase 5 service path); removing its flag branch is a
  Phase 7 cleanup so the existing combined-path tests are not changed here.

### 3. Paymob direct / standalone

- `PaymobProductModal` now uses `router.push(buildCheckoutPlanUrl(...))`.
- The modal’s direct-link shortcut was removed.
- Paymob remains disabled; no gateway activation or setting change.

### 4. Fourthwall

Classified `invoice-first (partial)`. No behavioural change:
- invoice exists before the session;
- `invoice_lines` completion and the `invoices.gateway='kashier'` label are
  deferred to Phase 7/8.

### 5. SpaceRemit

Classified `legacy-bypass` for `/smart-landing`; conversion is deferred by
explicit decision. The gateway fallback is `invoice-backed` and is handled in
Phase 6/8.

## Tests

`tests/unit/phase5CheckoutConversion.test.ts` — 8 passing:
- internal URL shape + `utm_*` / `ref` preservation;
- legacy quick-pay builder no longer emits an external URL;
- server-flag visibility guard;
- Paymob modal uses `router.push` and has no direct link;
- `vip_coaching` / `consultation` service quote lines;
- service invoice session uses the invoice amount and does not call Fourthwall
  or a gateway factory;
- service link carries `invoice_id` and the invoice amount.

## Verification (this phase)

- `npx tsc --noEmit` → clean.
- `npx next build` → success.
- Payment-focused test set → 13 failures, all in the documented baseline files
  (`checkoutCountryRouting`, `checkoutSessionService`, `instapayPreservationLock`,
  `paymentReceiptsAdmin`); baseline was 14, so no new failure was introduced.
- No migration applied. No gateway/env/settings change.

## Rollback

- Revert the Phase 5 commit.
- The old `KASHIER_PAYMENT_PAGES[*].liveUrl` values and the service link config
  are still present, so reverting the helpers restores the previous URLs.
- No database rollback is needed: this phase adds no migration.
