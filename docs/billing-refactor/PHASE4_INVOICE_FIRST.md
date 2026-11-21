# Phase 4 — Atomic Invoice Creation + Invoice-First Session

## Scope

Phase 4 adds the canonical invoice-first write path:

```
POST /api/checkout/quote
        ↓ (signed quote_token + cart)
POST /api/payments/create-invoice
        ↓ (verify token → re-price → atomic DB write; NO gateway)
POST /api/payments/create-session
        ↓ (load invoice → amount/currency from row → gateway session)
```

The legacy body shape on `/api/payments/create-invoice` is preserved until the
Phase 5 bypass-path migration. A body containing `quote_token` always takes the
new invoice-first branch and never calls a gateway.

## create-invoice (invoice-first request)

```json
{
  "quote_token": "<phase-3 token>",
  "cart": {
    "region": "EG",
    "lines": [{ "sku": "bundle", "quantity": 1, "language": "ar" }],
    "shippingAddress": { "address": "1 Test Street", "city": "Cairo" }
  },
  "customer": {
    "email": "buyer@example.com",
    "fullName": "Test Buyer",
    "phoneNumber": "+201000000000"
  },
  "idempotencyKey": "optional-if-header-is-sent",
  "metadata": {}
}
```

`Idempotency-Key` header wins over the body key. One key is required.

### Security / correctness

1. `quote_token` is verified first: HMAC, TTL, cart hash.
2. The cart is re-priced from scratch with `buildQuote()`; no numeric token
   field is used as an accounting input.
3. A token whose cart hash, pricing version, currency, or total no longer
   matches the fresh quote is rejected (`CART_MISMATCH` / `QUOTE_STALE`).
4. Client price fields (`total`, `unit_price`, `line_total`, `currency`, ...)
   are rejected before any database client is constructed.
5. The customer email/name and shipping address are persisted on the invoice /
   order; they are not used for pricing.

### Response

```json
{
  "success": true,
  "invoiceId": "...",
  "orderId": "...",
  "amount": 948,
  "currency": "EGP",
  "region": "EGYPT",
  "status": "pending",
  "pricing_version": "2026-11-18.1",
  "quote_hash": "<sha256>",
  "idempotent": false
}
```

No `redirectUrl`, `clientSecret`, gateway call, or product-line pass-through
occurs on this route.

## Atomic database function

Migration: `supabase/migrations/20261118160000_invoice_first_atomic.sql`

- Adds nullable `invoices.pricing_version` and `invoices.quote_hash`.
- Adds `public.create_invoice_atomic(...)`, `SECURITY DEFINER`, service-role only.
- Writes `orders` + `invoices` + `invoice_lines` inside one PostgreSQL
  transaction. Any failure rolls back all three.
- Claims idempotency through the existing partial unique indexes:
  - `invoices.idempotency_key`
  - `orders.idempotency_key`
- Rejects a line-sum that does not equal the invoice amount
  (`invoice_line_total_mismatch`).
- Returns `invoice_id`, `order_id`, `amount`, `currency`, `pricing_version`,
  `quote_hash`, `idempotent`.

Rollback: `supabase/migrations/rollbacks/20261118160000_rollback_invoice_first_atomic.sql`
(drops the function, then the two additive columns).

**Not applied to any shared/production database in this phase.**

## Idempotency

- Same key + same cart → the existing invoice/order is returned; no second
  invoice, order, or line rows.
- Same key + different cart → `409 IDEMPOTENCY_KEY_REUSED` because the stored
  `quote_hash` differs.
- The key is a DB unique constraint, never an in-memory cache.
- Concurrent requests rely on PostgreSQL's unique index and `ON CONFLICT`; the
  loser reads the winner's committed row.

## create-session (invoice-first branch)

When the body contains `invoiceId`:

- The invoice row is loaded before any gateway call.
- `amount` and `currency` come only from `invoices.amount` / `invoices.currency`.
- The invoice must be `status = pending` and `payment_status = pending`.
- A stored Kashier session URL is replayed, never re-minted.
- Any body `amount`, `total`, `currency`, or `lines` is ignored.
- Only `invoiceId`, optional locale, and contact fallbacks are passed to the
  service.
- The gateway receives `amount`/`currency` and no invoice line items.
- The session is linked to the invoice and `payment_intents` row.

Requests without `invoiceId` keep the pre-existing create-session behavior for
compatibility until Phase 5.

## Files

| File | Change |
|---|---|
| `supabase/migrations/20261118160000_invoice_first_atomic.sql` | new atomic function + additive columns |
| `supabase/migrations/rollbacks/20261118160000_rollback_invoice_first_atomic.sql` | rollback |
| `server/payments/invoice/invoiceCreationService.ts` | quote verify/re-price, RPC call, invoice loader |
| `server/payments/checkout/checkoutSessionService.ts` | `createSessionFromInvoice()` |
| `app/api/payments/create-invoice/route.ts` | `quote_token` invoice-first branch |
| `app/api/payments/create-session/route.ts` | `invoiceId` branch; body amounts ignored |
| `tests/unit/invoiceFirst.test.ts` | 11 tests |
| `tests/unit/createSessionFromInvoice.test.ts` | 7 tests |
| `tests/unit/createSessionInvoiceRoute.test.ts` | 2 tests |
| `tests/unit/invoiceFirstMigration.test.ts` | 3 tests |

## Verification (Phase 4)

- New Phase 4 tests: **23/23 passed**
- `npx tsc --noEmit` → exit 0
- `npx next build` → exit 0 (only existing `metadataBase` warnings)
- Payment suite → **650 passed / 14 failed** (49 files; the same 14 baseline
  failures documented in `PHASE1_FAILURE_CLASSIFICATION.md`)

## Risks / human decisions

1. **Migration not applied.** `create_invoice_atomic`, `pricing_version`, and
   `quote_hash` must be applied by a human before production traffic uses the
   `quote_token` branch. Until then the branch returns 500 on DB errors.
2. **Admin pricing overrides.** Quote and create-invoice both use
   `basePricing()` (catalog + `PRICING_*` env). `admin_settings` overrides are
   not reflected; a quote cannot see them. Phase 5/9 needs a shared config
   reader or an explicit rejection policy.
3. **Legacy create-invoice still calls gateways** for non-quote bodies. This is
   deliberate compatibility; Phase 5 converts the remaining bypass paths.
4. **No live transaction test.** The atomic guarantee is enforced by the
   PostgreSQL function; this phase cannot execute it without a non-production
   database. Tests cover token verification, re-pricing, RPC payloads, and the
   session-from-invoice contract.
5. **Fourthwall GLOBAL mapping** remains a known baseline failure for the old
   createCheckoutSession path; it is not changed in this phase.
6. **Signing secret fallback** still uses `SUPABASE_SERVICE_ROLE_KEY` when
   `QUOTE_TOKEN_SECRET` is absent. No env was modified.
