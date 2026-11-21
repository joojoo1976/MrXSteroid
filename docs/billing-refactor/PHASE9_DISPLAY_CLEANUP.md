# Phase 9 — Display fix and artifact cleanup

Branch: `feat/r6.1-tools-041-042` (not pushed).
No migration, no gateway/key/env change, no port 3111 process change.

## 1. `coaching_plus` before-discount price

### Root cause
`DISPLAY_ORIGINAL_PRICES.storefront.egp.coaching_plus` was a hand-written
aggregate `11848`. The package actually has two original line items:

```
coaching list price   949 EGP
coaching add-on     9,999 EGP
                     ---------
original amount    10,948 EGP
```

`bundle_plus` and `digital_plus` had the same +1,000 error.

### Fix
`server/payments/pricing.ts` now derives every `*_plus` display original from
its component lines:

```
original_amount = Σ(original unit_price × qty)
                = base list price + coaching add-on
```

- `storefront.egp.coaching_plus` = **10,948**
- `storefront.egp.bundle_plus` = **10,848**
- `storefront.egp.digital_plus` = **10,698**
- `storefront.usd.coaching_plus` = **464.79**
- `bundle_plus` USD = **450.79**, `digital_plus` USD = **419.98**

New helpers:

- `getOriginalPriceLines(tier, currency, surface)` — product + add-on lines.
- `sumOriginalLineItems(lines)` — the only definition of a pre-discount total.
- `getOriginalAmount(tier, currency, surface)` — derived total.

`features/calculator/hooks/usePricing.ts` now uses `getOriginalAmount()` instead
of the previous `1.18` / `1.5` multipliers, so the struck-through display uses
the same line sum as the pricing catalog. `features/billing/hooks/useBillingPlans.ts`
does the same instead of its previous `1.2` add-on multiplier.

## 2. Backup files removed

Deleted **11** artifacts:

```
features/checkout/DirectServicesCheckoutSection.tsx.bak
features/marketing/DirectServicesSection.tsx.bak
server/payments/gateways/FourthwallCheckoutAdapter.ts.bak
server/payments/gateways/KashierServiceLinkAdapter.ts.bak
server/payments/multiLegPaymentService.ts.bak
supabase/migrations/20261019120000_consolidated_invoice_payment_legs.sql.bak
tests/unit/combinedCheckoutGatewayAdapter.test.ts.bak
tests/unit/consolidatedInternalInvoiceMultiLeg.test.ts.bak
tests/unit/digitalBookEntitlement.test.ts.bak
tests/unit/directServicesCheckoutSection.test.ts.bak
tests/unit/multiLegCheckoutIntegration.test.ts.bak
```

`find . -name '*.bak'` now returns zero.

## 3. CI / build artifact guard

New:

- `scripts/check-backup-files.mjs` — fails on `*.bak`, `*.orig`, `*~`
  (skips `node_modules`, `.next`, `.git`, `coverage`, `.vercel`).
- `.github/workflows/artifact-guard.yml` — runs the guard on push/PR.
- `package.json`:
  - `check:artifacts` script
  - `prebuild` runs the same guard, so `npm run build` fails closed.

Verified: clean tree → exit 0; temporary `scripts/__guard_probe.bak` → exit 1
with the offending path; after removal → exit 0.

## 4. Tests

New `tests/unit/displayOriginalPricePhase9.test.ts` — **6/6**:

1. Every package in both surfaces/currencies satisfies
   `original_amount == Σ(unit_price × qty)`.
2. Every `*_plus` has exactly two lines (product + addon) and the add-on equals
   the canonical catalog.
3. `coaching_plus` EGP = 949 + 9,999 = **10,948**, not 11,848.
4. `coaching_plus` USD = 114.80 + 349.99 = **464.79**.
5. The pricing source contains no `*_plus` aggregate literal.
6. Add-on lines match the canonical `DEFAULT_PRICING.addons`.

## 5. Verification

| Check | Result |
|---|---|
| Payment suite (54 matched files) | **689 passed / 0 failed / 689** |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0 (prebuild guard ran) |
| `npm run check:artifacts` | exit 0 |
| Backup artifacts | 0 |

## 6. Risks / notes

- Base list prices (`699 / 849 / 949` etc.) remain explicit business display
  inputs. They are **unit** list prices, not hand-written aggregates; every
  package total is derived from them.
- The guard scans the working tree, not git history; a `.bak` deleted in this
  commit remains in older commits but cannot be reintroduced by a new commit or
  build.
- No runtime charge path reads `DISPLAY_ORIGINAL_PRICES`; the fix is display-only.
