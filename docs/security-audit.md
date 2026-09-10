# Security Audit Report — mrxsteroid.com

## Issues Fixed in This Release

### CRITICAL — Hardcoded Supabase Credentials
| File | Status |
|------|--------|
| `app/api/payments/callback/route.ts` | Fixed — removed anon key fallback, throws on missing `SUPABASE_SERVICE_ROLE_KEY` |
| `app/api/payments/create-invoice/route.ts` | Fixed — same pattern |

**Root cause:** Both files contained a hardcoded JWT (anon key) as fallback and the Supabase project URL in plaintext. If `SUPABASE_SERVICE_ROLE_KEY` was absent, the webhook handler would use the anon key to update `profiles` and `invoices`, which could allow RLS bypass or under-permission writes.

**Fix:** `getSupabaseAdmin()` now throws immediately if `SUPABASE_SERVICE_ROLE_KEY` is not present. Zero fallback tolerance.

---

### HIGH — GET Callback Activating Subscriptions
| File | Status |
|------|--------|
| `app/api/payments/callback/route.ts` GET handler | Fixed — advisory redirect only |

**Root cause:** The GET return URL callback was calling `activateSubscription()`. An attacker who can guess/enumerate an invoice UUID could hit the GET URL and activate a subscription without payment.

**Fix:** GET handler is now advisory-only — reads the invoice status set by the POST webhook and redirects accordingly. Subscription activation happens exclusively via the verified POST webhook.

---

### MEDIUM — Webhook Idempotency (Status Check Only)
| File | Status |
|------|--------|
| `server/payments/webhook.ts` | Fixed — DB-level dedup via `webhook_events` table |

**Root cause:** Idempotency was only checked via `invoices.status === 'success'`. A replay attack with a different `externalReferenceId` could slip through.

**Fix:** New `webhook_events` table with `UNIQUE(provider, provider_event_id)` constraint. Insert-before-process pattern ensures database-level deduplication. Duplicate events return 200 immediately.

---

### MEDIUM — TIMED_OUT / UNKNOWN webhook statuses causing incorrect state
**Fix:** `TIMED_OUT`, `UNKNOWN`, and `AUTHORIZED` statuses are mapped to `status: undefined` and trigger no fulfillment, no permanent failure. Invoice is marked `payment_status = 'unknown'` for manual reconciliation.

---

## Ongoing Recommendations
- Rotate the Supabase anon key immediately (was hardcoded in git history).
- Rotate `SUPABASE_SERVICE_ROLE_KEY` as a precaution.
- Remove `SMTP_PASS` plaintext from `supabase/config.toml` — use Supabase dashboard instead.
- Enable Supabase log drain to detect RLS policy violations.
- Add rate limiting to `/api/affiliate/create` (prevent mass account creation).
