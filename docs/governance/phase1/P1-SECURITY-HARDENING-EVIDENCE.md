# Phase 1 — Security Hardening Evidence (2026-09-24)

**Read-only posture evidence. No production change was applied by this phase.**

## 0. Phase scope & constraints (owner-approved)

Security Hardening audits and tests the **existing** Production architecture and controls. It does **not** redesign or replace the current payment flow.

| # | Constraint | Status |
|---|---|---|
| C-1 | InstaPay stays LIVE/ACTIVE — no removal/disable/deprecate/replace/consolidation | PRESERVED |
| C-2 | `POST /api/checkout/instapay` flow (upload → validation → storage → manual review → affiliate attribution → protections) unchanged | PRESERVED |
| C-3 | No Kashier production changes in this phase | NONE APPLIED |
| C-4 | **M1B NOT APPLIED** (no schema/business enforcement) | CONFIRMED |
| C-5 | M1A invariants (region/currency/payment_status/etc., verified in Production) intact | PRESERVED |
| C-6 | Rejected InstaPay receipt = `orders.status='cancelled'` + `payment_status='failed'` (that order attempt only) | PRESERVED |

## 1. Posture dashboard

| # | Control domain | Assessment | Evidence |
|---|---|---|---|
| 1 | RLS enabled on all sensitive tables | PASS | §2 |
| 2 | RLS row guards = ownership + `is_admin()` | PASS | §2 |
| 3 | Admin API access via `requireAdmin` (user-bound client, no service role) | PASS | §4 |
| 4 | Rate limiting on checkout / affiliate / auth-touch surfaces | PASS | §4 |
| 5 | `SUPABASE_SERVICE_ROLE_KEY` never in client bundle | PASS | §5 |
| 6 | Receipt storage private + admin-read + service-write | PASS | §3 |
| 7 | No client mutation of `payment_receipts` (INSERT/DELETE locked to service/admin) | PASS | §4 |
| 8 | Users cannot mint `payments` in a paid state | PASS | §2 |
| 9 | Webhook source verification in per-decision edge functions | PARTIAL | §6 |
| 10 | Security response headers (CSP/HSTS/nosniff/DENY/Referrer) | PASS (+minor gap) | §7 |
| 11 | No hardcoded secrets in tracked source | PASS | §5 |
| 12 | Supabase security advisor | 1 WARN + 3 INFO | §8 |
| 13 | InstaPay preservation invariants (locked) | PASS | `tests/unit/instapayPreservationLock.test.ts` |

**Overall: GOOD posture.** Remaining items are hardening recommendations (none block the running flows; all are documented with a target phase).

## 2. Database — RLS matrix (Production, read-only)

All checked tables have `rowsecurity = true`. Effective anon/authenticated access is derived from policies (table grants alone do not grant row access under RLS).

| Table | RLS | anon effective | authenticated effective | Verdict |
|---|---|---|---|---|
| `orders` | ON | DENY (no anon policy) | SELECT own/admin/representative · UPDATE only `is_admin()` · INSERT own or `user_id IS NULL` | PASS |
| `payment_receipts` | ON | DENY | SELECT admin/own · UPDATE admin · **no INSERT/DELETE client path** | PASS |
| `invoices` | ON | DENY | SELECT own/admin · INSERT own | PASS |
| `payment_intents` | ON | DENY | admin only | PASS |
| `payments` | ON | DENY | INSERT own **`AND status='pending'`** · SELECT own | PASS |
| `admin_settings` | ON | DENY | admin only (ALL) | PASS |
| `merchant_configs` | ON | DENY | DENY (no policies, grants = postgres/service_role) | PASS (locked deny) |
| `kashier_product_mappings` | ON | DENY | DENY (no policies, grants = postgres/service_role) | PASS (locked deny) |
| `product_prices` | ON | DENY | DENY (no policies, grants = postgres/service_role) | PASS (locked deny) |
| `financial_ledger` | ON | DENY (admin check in qual) | admin only (roles=`public` — non-idiomatic, see F-6) | PASS* |
| `payouts` | ON | DENY (admin check in qual) | admin only (roles=`public` — non-idiomatic, see F-6) | PASS* |
| `reconciliation_runs` | ON | DENY | service_role ALL | PASS |

Key guard functions observed in policies: `is_admin()` (orders, invoices, payment_receipts), inline profile-role check `COALESCE((SELECT profiles.role …)= 'admin')` (admin_settings, financial_ledger, payment_intents, payouts), ownership predicates (`auth.uid() = user_id`, `customer_email = profiles.email`, linked-order check on receipts).

## 3. Storage — buckets & objects policies

| Bucket | Public | Objects policy posture | Verdict |
|---|---|---|---|
| `payment-receipts` | **PRIVATE** (limit 10 MB) | SELECT: `is_admin()` only (`roles={authenticated}`). No public/anon read. INSERT: service_role only. DELETE: none (service-role rollback only). | PASS — InstaPay receipts protected |
| `products` | public | public SELECT (product images) · INSERT `bucket_id='products' AND is_admin()` | PASS |
| `avatars` | public | public SELECT · user-scoped INSERT/UPDATE/DELETE by folder | PASS |

Receipt objects can **only** be read by admins; uploads come from the server route's service-role client (`RECEIPT_BUCKET = 'payment-receipts' // Private bucket`, `app/api/checkout/instapay/route.ts:60`).

## 4. API surface

- **Admin routes** (`app/api/admin/**` and `app/api/payments/evaluate-risk`) all guard with `requireAdmin(req)` before any operation; `require-admin.ts` deliberately uses a **user-bound anon client** (RLS enforced, no service role) and validates the session cookie.
- **Rate limited** (per-IP, and per-user where relevant): `checkout/instapay`, `checkout/kashier/session`, `payments/create-session`, `affiliate/{create,me,stats,referrals}`, `auth/check-password`, `calculate`.
- **No client mutation of `payment_receipts`:** the only INSERT is inside the InstaPay route (service-role admin client), the only UPDATE in the admin settle route (`requireAdmin`), and **no `.delete()` on `payment_receipts` exists anywhere in `app/api`**.
- Orders from the browser (MissionControl / RealtimeSyncService) act through the anon client with the admin’s live session; RLS `is_admin()` gates every write — the M1A write vocabulary (`payment_status`, status rules) is additionally enforced by the producer contract tests.

## 5. Environment & secrets

- `SUPABASE_SERVICE_ROLE_KEY` appears **only** in server code: `server/**`, `app/api/**` server routes, edge functions (`Deno.env`), and `lib/kashier/payouts/create-transfer.ts` — the latter is **imported only by tests**, never by a client component (verified by source walk).
- Client-entry files (`lib/supabaseClient.ts`, `shared/lib/supabase.ts`, `shared/lib/env-reader.ts`, `config/env.ts`, `context/AuthContext.tsx`, `features/auth/hooks/*`) expose **only** `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `resolveUser` deliberately uses the anon key („public anon key to avoid unnecessary service_role usage“); `attributionService` documents „SUPABASE_SERVICE_ROLE_KEY never sent to client“.
- Repo: only `.env.example` tracked; no `.pem`/`.key`/credential/secret files. Full secret-pattern scan over tracked source found **zero** hardcoded keys (test suite keeps this guarded).

## 6. Edge functions — deployment & verification inventory

| Function | Deployed | `verify_jwt` | Source verification | Verdict / note |
|---|---|---|---|---|
| `whatsapp-webhook` | YES (v4, ACTIVE) | false | **No Twilio `X-Twilio-Signature` check today**; makes **zero DB writes** (TwiML replies only) | F-2 (see §9) — low risk (no data mutation), recommend signature verify; face Twilio auth token in env |
| `payment-webhook` (SpaceRemit legacy) | **NOT deployed** | — | Repo code compares `x-spaceremit-signature` header to secret | Dormant; no action while inactive |
| `send_email` | **NOT deployed** | — | Uses `Authorization: Bearer <apiKey>` | Dormant file only |

Note: `payment-webhook`/`send_email` exist in the repo but are not active Supabase functions; the only live edge function is the Twilio WhatsApp bot.

## 7. Transport & delivery

- `vercel.json` sets: CSP (self + explicit 3rd-party allowlists), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.
- `middleware.ts` is locale-only, matcher excludes `/api` — no auth logic leaks into the edge; API authorization lives in the routes.
- Minor gap: **no `Permissions-Policy` / `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy`** headers (low severity, optional F-9).

## 8. Supabase security advisor (Production)

| Lint | Level | Detail | Disposition |
|---|---|---|---|
| `rls_enabled_no_policy` ×3 | INFO | `kashier_product_mappings`, `merchant_configs`, `product_prices` RLS on, no policies | **Intentional deny-by-default**; grants limited to postgres/service_role. No change. |
| `auth_leaked_password_protection` | WARN | Leaked-password (HIBP) protection disabled in Auth | **F-1:** recommend enabling in the Auth dashboard (`Auth → Security → leaked password protection`). App already ships client-side k-anonymity check (`shared/lib/pwned-password.ts`). Dashboard toggle, not code. |

## 9. Findings & recommendations (deferred — NOT applied in this phase)

| ID | Severity | Finding | Recommendation | Target |
|---|---|---|---|---|
| F-1 | MED | Leaked-password protection disabled | Owner enables via Auth dashboard | Dashboard toggle |
| F-2 | MED | `whatsapp-webhook` deployed with `verify_jwt=false` and no Twilio signature check (no DB writes today) | Add `X-Twilio-Signature` HMAC verification using `TWILIO_AUTH_TOKEN` env | Next hardening batch |
| F-3 | LOW | Broad table grants (SELECT/INSERT/UPDATE/DELETE/TRUNCATE) to `anon`/`authenticated` on `orders`, `invoices`, `payment_receipts`, `financial_ledger`, `payouts`, `admin_settings` | Neutralized by RLS but should be `REVOKE`d when the admin routes replace browser mutation (D7) | **M3b / Phase 8** (only together with `PATCH /api/admin/orders/[id]` + MissionControl rewiring — OPEN-6) |
| F-4 | LOW | Admin-only policies on `financial_ledger`, `payouts`, `payment_intents`, `admin_settings` use `roles={public}` (guarded by an inline admin check) | Narrow to `roles={authenticated}` alongside F-3 | M3b / Phase 8 |
| F-5 | LOW | `kashier_product_mappings`/`merchant_configs`/`product_prices`: RLS on with no policies (deny-by-default) — linter shows INFO | Optional: add explicit documentation policies; no functional need | optional |
| F-6 | LOW | WhatsApp bot hardcodes price copy `49.99$ … mrxsteroid.com/buy` | Business pricing freeze (D3/D4/P2) — flag for the pricing phase; **no change here** | Phase 4 (pricing) |
| F-7 | LOW | No `Permissions-Policy`/COOP/CORP headers | Optional additive header hardening | optional |
| F-8 | LOW | Production **publishable** ANON key embedded as fallback default in `shared/lib/supabase.ts`, `app/api/contact/route.ts`, and (full value) in `DEPLOYMENT_GUIDE.md` | Publishable by design and inert without the anon role's RLS grants, but remove baked defaults → env-only resolution so key rotation is safe. The posture suite allow-lists **only** this exact token (runtime-derived); any other embedded JWT fails | Next hardening batch |

**This phase applies zero production changes.** All controls are preserved as deployed (Production `ecbd4ea` + M1A migration live).

## 10. Re-verification (read-only, re-runnable)

SQL and source checks:
```sql
-- RLS enabled on sensitive tables (expect true for all rows)
select tablename, rowsecurity from pg_tables
 where schemaname='public'
   and tablename in ('orders','payment_receipts','invoices','payment_intents','payments',
                     'admin_settings','merchant_configs','kashier_product_mappings','product_prices',
                     'financial_ledger','payouts','reconciliation_runs')
 order by tablename;

-- No anon/authenticated DELETE privilege that bypasses RLS on order-critical tables:
-- (policies with cmd DELETE + roles containing anon)
select tablename, policyname, roles from pg_policies
 where schemaname='public' and cmd='DELETE' and roles::text like '%anon%';

-- Receipt objects are admin-read-only:
select policyname, cmd, roles, qual from pg_policies
 where schemaname='storage' and tablename='objects'
   and (qual::text like '%payment-receipts%' or qual::text like '%is_admin%');
```
Source invariants are enforced by `tests/security/securityHardeningPosture.test.ts` (see §11) — run in CI/gate.

## 11. Locked test coverage added by this phase

`tests/security/securityHardeningPosture.test.ts` (static, CI-gated):

1. `SUPABASE_SERVICE_ROLE_KEY` never referenced by client-entry files (lib/shared/context/config/features/auth).
2. `lib/kashier/payouts/create-transfer.ts` (service role) is imported only by tests — never from a client component.
3. Every route under `app/api/admin/**` imports and calls `requireAdmin`.
4. Checkout/financial write routes all call `enforceRateLimit`.
5. No `.delete()` on `payment_receipts` anywhere in `app/api`; the only `payment_receipts` INSERT lives in the service-role InstaPay route.
6. `payment-webhook` verifies `x-spaceremit-signature`; `whatsapp-webhook` performs **no DB writes** (limits the blast radius of the missing Twilio signature).
7. `RECEIPT_BUCKET` constant == `'payment-receipts'` and is documented as Private; receipts upload uses the service-role route client (no shared anon client import in the InstaPay route).
8. Env readers expose only `NEXT_PUBLIC_*` keys.
9. Admin receipt settle always writes the `audit_log` trail.
10. No hardcoded secret material (`sk_live`, `AKIA…`, embedded JWT seeds, private key blocks, `ghp_`…) in any tracked source file.
11. InstaPay preservation invariants remain locked (referenced from `tests/unit/instapayPreservationLock.test.ts`).

## Status

```text
InstaPay                 = LIVE / ACTIVE (preserved, verified)
M1A                      = LIVE
Application Compatibility= LIVE
Rejected receipt outcome = cancelled + failed (order attempt only) — LOCKED
M1B                      = NOT APPLIED
Kashier                  = unchanged
Security Hardening       = EVIDENCE + TESTS COMPLETE (production untouched)
```