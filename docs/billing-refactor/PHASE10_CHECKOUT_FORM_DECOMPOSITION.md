# Phase 10 — `CheckoutForm.tsx` Decomposition

Status: **complete** · Branch: `main` · Base: `05088c57ce403b6e364d3383518fd9eb4f6371b4`

Phase 10 is a behavior-preserving structural refactor. No payment rule, price, gateway selection, validation rule, DOM id, or accessibility attribute was changed.

## 1. Scope and prerequisites

- Phase 2 (single server price source) and Phase 7 (shipping/book-language invoice lines) were already merged into `main` before this work.
- Phase 10 only decomposes `features/checkout/CheckoutForm.tsx` and the checkout hook/data modules around it.
- No gateway configuration, credential, environment variable, migration, or workflow file was touched.

## 2. Result: every checkout file is under 400 lines

| File | Before | After |
|---|---:|---:|
| `features/checkout/CheckoutForm.tsx` | 1283 | **279** |
| `features/checkout/hooks/useCheckout.ts` | 483 | **397** |
| `features/checkout/ProductSelector.tsx` | 428 | **357** |
| `features/checkout/components/CheckoutBillingCard.tsx` | — | 359 |
| `features/checkout/components/CheckoutPaymentFooter.tsx` | — | 193 |
| `features/checkout/components/CheckoutInstapayMethod.tsx` | — | 176 |
| `features/checkout/components/CheckoutPaymobHiddenMethods.tsx` | — | 157 |
| `features/checkout/components/CheckoutPromoCard.tsx` | — | 92 |
| `features/checkout/components/CheckoutGlobalMethods.tsx` | — | 84 |
| `features/checkout/components/CheckoutRegionCard.tsx` | — | 79 |
| `features/checkout/components/CheckoutHiddenPaypalMethod.tsx` | — | 50 |
| `features/checkout/hooks/usePromoCode.ts` | — | 55 |
| `features/checkout/hooks/useInstapayReceipt.ts` | — | 42 |
| `features/checkout/lib/checkoutSchema.ts` | — | 62 |
| `features/checkout/lib/checkoutTotals.ts` | — | 30 |
| `features/checkout/checkoutFormTypes.ts` | — | 36 |
| `features/checkout/productVariants.ts` | — | 75 |

`OrderSummary.tsx` (268), `DirectServicesCheckoutSection.tsx` (303), and `StripePaymentElement.tsx` (164) were already within the limit and were not restructured.

## 3. What was extracted

### Presentational components

- `CheckoutRegionCard` — Egypt/Global region toggle.
- `CheckoutBillingCard` — customer fields, primary/secondary phones, shipping address/rates, body stats, account checkbox.
- `CheckoutPromoCard` — promo input, apply action and status copy.
- `CheckoutPaymobHiddenMethods` — the disabled Paymob card/wallet/kiosk cards.
- `CheckoutInstapayMethod` — InstaPay method card, QR block, reference and receipt upload.
- `CheckoutHiddenPaypalMethod` — the disabled international PayPal card.
- `CheckoutGlobalMethods` — Stripe and Kashier Global cards.
- `CheckoutPaymentFooter` — terms checkbox, accessible legal-link rendering, submit button and its Stripe confirmation branch.

The moved markup was copied verbatim from the original file. A source comparison was run for each extracted block, including the Kashier, Stripe, security-notice and footer blocks; all matched exactly. Paymob/PayPal ids were passed as props only to keep the source-level guard test anchored in `CheckoutForm.tsx`; rendered ids are unchanged.

### Logic modules

- `lib/checkoutSchema.ts` — the Zod schema and conditional shipping/body-stat rules, unchanged.
- `lib/checkoutTotals.ts` — shipping-inclusive subtotal, percentage/fixed discount precedence and non-negative floor, unchanged.
- `hooks/usePromoCode.ts` — promo input/status state and `handleApplyPromo` action, unchanged.
- `hooks/useInstapayReceipt.ts` — InstaPay reference, receipt file state and 10MB/MIME validation, unchanged.
- `checkoutFormTypes.ts` — `NewPricingTier`, `CheckoutFormProps`, the controller return type and receipt state.
- `productVariants.ts` — static `VARIANTS` display data moved out of `ProductSelector.tsx`.

`CheckoutForm.tsx` still re-exports `NewPricingTier` and `CheckoutFormProps`, so every existing consumer import path remains valid.

## 4. Behavior preservation

- Structural DOM is unchanged; components add no wrapper elements. Extracted components return the same `Card`/`motion.div`/fragment roots as before.
- No `data-testid` value was added, removed or renamed.
- Existing ids remain: `checkout-payment-methods`, `checkout-method-kashier`, `checkout-method-stripe`, `checkout-method-kashier-global`, `checkout-method-instapay`, `checkout-stripe-element`, `checkout-submit-btn`, `agreeToTerms`, `createAccount`, `checkout-wallet-phone`, plus the disabled Paymob ids.
- The `paymobCustomerVisibility` source test still finds its security-notice ternary, the `HIDING PAYMOB METHODS TEMPORARILY` marker, both `{false && (` guards, and all four Paymob ids in `CheckoutForm.tsx`; it passes untouched.
- Form registration, validation, auto-fill, shipping-cost notification, discount notification, InstaPay redirect and Stripe confirmation all keep their original order and callbacks.

## 5. Verification

| Check | Result |
|---|---|
| New Phase 10 tests (`tests/unit/phase10CheckoutDecomposition.test.ts`) | **8/8 passed** |
| Payment/checkout regression suite | **53 files, 697/697 passed, 0 failed** |
| `npx tsc --noEmit` | exit **0** |
| `npm run build` | exit **0**, `✓ Compiled successfully` |
| `npm run check:artifacts` | exit **0**, no backup artifacts |
| Existing tests modified/disabled | **none**; no new `skip`/`todo`/`only` |

The 8 new tests pin the 400-line acceptance rule, stable `CheckoutForm` exports, the extracted totals formula, and the conditional Zod rules for postal code, shipping fields and body stats.

## 6. Constraints confirmed

- **No gateway, key or environment variable changed.** `git status` shows no change under `server/payments/gateways`, and no `.env*` change.
- **No migration run or modified.** `git status` shows no change under `supabase/`.
- **`.github/workflows/artifact-guard.yml` unchanged.**
- **No branch history rewritten.** Work stayed on `main`; no rebase, amend, or force operation.
- **Stash not restored.** `stash@{0}` remains untouched.
- **Unrelated working-tree changes not staged or committed.**

## 7. Remaining gaps

Phase 10 did not change any payment behavior, so the gaps recorded in `BILLING_CONTINUATION_REPORT.md` remain as-is:

- **P0** — Phase-1 `invoice_lines` and Phase-4 atomic invoice migrations are still not applied in the target database; numeric backfill proof remains pending; `admin_settings` price overrides are still inconsistent between quote and invoice paths.
- **P1** — Fourthwall invoices are still labeled with Kashier gateway metadata for legacy reasons; the legacy `createCheckoutSession` path does not write `invoice_lines`; `SpaceRemit /smart-landing` remains a legacy bypass; `guestClaimService` still grants from the claim product.
- **P2** — `FlatRateProvider` is a fixed price bucket, not a live carrier; `settle_invoice_payment_leg` retains its internal 0.01 tolerance; Fourthwall product mapping/`FOURTHWALL_*` seeds need pre-live verification; tax is still `0`; no tax engine.

No new gap was introduced by Phase 10.
