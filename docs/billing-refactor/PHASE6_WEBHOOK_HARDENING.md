# Phase 6 — Webhook / callback hardening

Status: implemented on `feat/r6.1-tools-041-042`; not pushed. No gateway
settings, keys, env vars, or the process on port 3111 were touched. No migration
was applied.

## State machine

The legacy `invoices.status` / `invoices.payment_status` values are retained for
compatibility. The explicit Phase 6 lifecycle is stored in
`invoices.metadata.payment_state`:

```text
pending -> paid -> fulfilled
pending -> amount_mismatch
pending -> failed
```

- `fulfilled`, `amount_mismatch`, and `failed` are terminal for provider events.
- `paid` cannot be moved backwards by a later failure/refund event; only the
  internal delivery step performs `paid -> fulfilled`.
- Legacy rows without metadata are derived from `status` / `payment_status`;
  refunded/cancelled rows are treated as terminal.

Implementation: `server/payments/invoicePaymentState.ts`.

## Idempotency

No new migration was needed. The existing DB constraints already provide the
required uniqueness:

- `webhook_events(provider, provider_event_id)` — unique constraint
  (`webhook_events_provider_event_unique`).
- `invoice_payment_legs(provider, provider_reference)` — partial unique index.

Both `/api/payments/webhook` and `/api/payments/callback` use the same
`webhook_events` key. `callback` now inserts the same audit row and then calls
`applyProviderVerdict`; it no longer activates a subscription through a separate
path. A callback followed by a webhook for the same provider transaction cannot
settle twice.

## Amount and currency matching

`server/payments/verifyPaidAmount.ts`:

- compares integer minor units exactly (`round(amount * 100)`), zero tolerance;
- rejects a reported currency that differs from `invoices.currency`
  (`currency_mismatch`), with no silent conversion;
- returns explicit reasons: `invoice_not_found`, `currency_mismatch`,
  `amount_mismatch`.

`applyProviderVerdict` passes the provider currency into the check. Multi-leg
verification now also compares integer minor units exactly.

## Audit log

`webhook_events` is the audit trail:

- `pending` — event received and recorded;
- `processed` — financial settlement completed;
- `duplicate` — replay of an already-processed event;
- `failed` + `processing_status='amount_mismatch'` — amount/currency deviation,
  with `error_message` describing paid vs expected;
- `skipped` + `out_of_order:<state>-><target>` — event arrived after a terminal
  state;
- `failed` + `processing_status='financial_review:<stage>'` — capture recorded
  but financial settlement incomplete.

A rejected signature returns 401/400 before any Supabase client is created, so
it performs zero database writes; the rejection is logged.

## Tests added

- `tests/unit/webhookHardeningPhase6.test.ts` (9): state transitions, legacy
  state derivation, zero-margin amount, currency mismatch, triple delivery,
  terminal `amount_mismatch`, late success after `amount_mismatch`, refunded
  invoice protection, late failure after paid.
- `tests/unit/callbackWebhookUnificationPhase6.test.ts` (2): callback duplicate
  delivery settles once; bad signature performs zero database writes.

## Verification

- `npx tsc --noEmit` → clean.
- `npx next build` → success.
- Payment-focused suite (50 files): **14 failed / 660 passed** — identical to
  the baseline; no new failures and no existing test was modified/skipped.
  Baseline files: `checkoutCountryRouting` (8),
  `createInvoiceKashierDelegation` (1), `checkoutSessionService` (1),
  `instapayPreservationLock` (1), `paymentReceiptsAdmin` (3).

## Rollback

Revert the Phase 6 commit. No database migration was applied, so there is no
schema rollback. Existing `webhook_events` rows created during testing are
operational audit rows; no invoice/ledger data was created by automated tests.
