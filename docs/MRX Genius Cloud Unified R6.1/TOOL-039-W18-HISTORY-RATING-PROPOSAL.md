# TOOL 039 — IMPLEMENTATION PROPOSAL: HISTORY (BOX 11) + RATING/COMMENT (BOX 12)

**Document type:** PROPOSAL ONLY — **not** an authorization, not a spec change, not an implementation.
**Date:** 2026-11-12
**Repository:** E:\MrXSteroid-main · **HEAD:** `5a87f3e5271db497a63833bb3cd1bb3df2078497` · **Branch:** `docs/r6.1-r0-evidence`
**Tool:** Tool 039 — Liver Enzyme Tracker · `mrx.tool.039-liver-enzyme-tracker`
**Rows addressed:** `LAYER-GENIUS12-11` (History) and `LAYER-GENIUS12-12-RATING` (Rating / comment)
**Current tool status:** `OWNER_REVIEW` · **Ledger unchanged:** 123 rows · 94 applicable · 92 complete · **92 / 94 = 97.87%** · both target rows remain `B=BLOCKED, E=E0, C=PENDING`
**Explicitly NOT done by this document:** no code change, no ledger change, no requirement change, no deletion of any row, no `NOT_APPLICABLE` re-classification, no Deployment, no Supabase/DB/RLS/migration, no W18 lift, no Tool 040.

---

## 0. The decision this proposal asks the owner to make

Both rows are blocked by **W18**, and W18 is a *decision between two branches*, not a single switch. The canonical W18 row (`R6.1-CLOSURE-LAYER.md:144`) reads, in full:

> **W18 | تجربة الزائر مقابل المسجل غير محسومة** | A=SPECIFIED كاقتراح | B=NOT_RUN | C=PENDING | Owner فقط | Phase 2 / G-R6.1-2 | Privacy + Consent | **مانع: لا تنفيذ حفظ/مزامنة/تغيير جلسة او DB حتى قرار المالك. الاقتراح: زائر = حفظ محلي فقط مع تحذير، مسجل = سحابي مشفر + Last-Write-Wins + سجل + خيار مستخدم. يبقى اقتراحا**
> ("Blocker: no **save / sync / session change** or DB until the owner's decision. The proposal: **guest = local save only with a warning**, **registered = encrypted cloud + Last-Write-Wins + log + user option**. It remains a proposal.")

`SPEC.md:48` (SPEC-R6.1-6.d) repeats it: *"W18: تصميم Preferences (زائر محلي + مسجل سحابي + Last-Write-Wins) يبقى اقتراحا حتى C=APPROVED. لا تغيير DB او جلسة قبله."*

### The finding that matters most

**The "local only" branch still needs the W18 decision.** The blocker's wording is `حفظ` (save) with no "local vs cloud" qualifier, so a *strict* reading forbids saving results anywhere — including the browser. The same row's own proposal, however, offers `زائر = حفظ محلي فقط مع تحذير` as one of the two branches the owner picks between. **So the guest-local variant is not W18-free: it needs the owner to say which branch applies.** What the owner's choice changes is the *blast radius*, not whether a decision is required:

| | Blast radius | DB / Supabase / RLS |
|---|---|---|
| **Option A — guest-local** | browser only | **none** |
| **Option B — registered cloud** | server + database | **migration + table + RLS + server identity** |
| **Option C — documented exception** | none | **none** |

A second finding lowers the cost of Option B relative to what the package assumed: **a server-side, user-level auth boundary already exists and is reusable** — `server/auth/resolveUser.ts` exports `getAuthenticatedUser(req)` (cryptographic Bearer-token verification via `auth.getUser`) and `resolveEffectiveUserId(req, clientUserId)` (IDOR protection: a client-supplied `userId` that differs from the verified token → 403; an unauthenticated caller claiming a `userId` → 401). `server/auth/require-admin.ts` is the admin-level variant. The package note `GAP-01` ("no server-side auth boundary exists") refers to a **tenant**-scoped boundary; the user-level boundary is present and already in production use by the dashboard/payments routes.

---

## 1. What each row actually requires (functions to add)

### 1.1 `LAYER-GENIUS12-11` — Box 11 "History: your previous results with freshness"

Requirement text in the ledger: *"Box 11 History: your previous results with freshness"*. The domain profile that makes it mandatory for this tool is `Health Monitor` (`R6.1-CLOSURE-LAYER.md:398`): *"Health Monitor | اتجاهات + حدود + تنبيهات + Freshness | **History + Safety** | بيانات قديمة تظهر Stale ولا تستخدم كانها حديثة"* — old data must show as **Stale** and must not be used as if current.

Functions to add:

1. **A "save this result" action** on the result block — saves the *computed result of the current input* (readings + engine output), never a re-computation and never a partially-typed input.
2. **A history list in box 11** — each entry shows: draw date, marker, value, unit, multiple of the reference limit, the overall status, and the age in days.
3. **A Stale treatment per entry** — entries older than the lab freshness threshold (90 days, `TOOL_039_LAB_FRESHNESS_DAYS`) render with an explicit Stale badge and are **never** presented as current. The flag is computed **at read time** from the draw date, not stored at write time — a stored boolean would keep saying "fresh" for 90 days after the data went stale.
4. **A delete path** — delete one entry, and delete all.
5. **An export path** — reuse the existing browser-only CSV builder pattern (`buildLiverTrackerCsv` in `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts`) to export the history.
6. **A consent gate + a visible storage notice** — the user must opt in, and the mode (guest-local / registered) must be stated in the UI.
7. **No cross-tool side effects** — the history is scoped to Tool 039; it does not feed any other tool automatically (the cross-tool link contract stays `transfer: 'manual-reentry'`).

### 1.2 `LAYER-GENIUS12-12-RATING` — Box 12 "Feedback / rating (1–5 + comment)"

Note: the **C5 half of box 12 is already complete and separately evidenced** (`LAYER-GENIUS12-12`, B=PASS, E=E3 — "one next step, what not to do and when to see a doctor"). Only the rating/comment half is open.

Functions to add:

1. **A rating control (1–5)** inside box 12, bound to **one specific result**, not to the tool in general.
2. **An optional free-text comment**, length-capped.
3. **Edit / clear** — a rating can be changed or removed.
4. **Persistence** of the rating + comment with the same consent/TTL/delete/export rules as the history, and the same storage mode.
5. **Accessibility** — the control must be keyboard operable, screen-reader labelled, and it must fit the 390 px layout (the same bar the legibility fix established).
6. **Honest unavailability** — until the storage mode is enabled, the current `data-r6-rating="not_available"` block stays exactly as it is.

---

## 2. Technical design

### 2.1 Data shape (shared by both options)

A single versioned envelope, one entry per saved result:

```
entry = {
  id:            string            // client-generated, UUID
  schemaVersion: 1
  drawDate:      string            // ISO date of the blood draw (the freshness anchor)
  recordedAt:    string            // ISO instant the entry was saved
  readings:      [{ marker, value, unit, date }]
  overallStatus: string            // from the engine
  stopOrals:     boolean
  markers:       [{ marker, latest_value, unit, uln_multiple, status, trend_per_30d }]
  rating:        1..5 | null
  comment:       string | null
}
```

The values are exactly what the engine produced — the history stores **the result of the V6 engine**, never a re-derived number. No defaults, no averaging, no synthetic rows (SPEC-R6.1-1.f).

### 2.2 Storage

**Option A — guest-local (device only)**

- `localStorage`, key `mrx_tool039_history_v1`, one JSON envelope.
- Sensitive values encrypted with the **existing** `shared/lib/secureStorage.ts` (`SecureStorage`, AES, key prefix `mrx_enc_`, graceful plaintext fallback when no key is configured) — the same mechanism the preferences layer already uses. No new crypto dependency.
- Retention TTL: entries auto-expire after **365 days** (a year of lab results). The **90-day** figure stays as the *freshness* threshold, not the retention period — two different numbers with two different meanings.
- Maximum entries: bounded (e.g. 100) to respect the storage quota; oldest pruned first, and the pruning is disclosed in the UI.
- Nothing leaves the browser: no network call, no analytics, no third party.

**Option B — registered cloud**

- New table `public.tool039_history` (migration + rollback script, following the `supabase/migrations/` convention already in the repo, with a `20260930180000_seo_keyword_weekly_states_rls.sql`-style RLS file).
- Columns: `id uuid pk`, `user_id uuid not null`, `tenant_id text not null`, `draw_date date not null`, `recorded_at timestamptz not null default now()`, `payload jsonb not null`, `overall_status text not null`, `rating smallint null check (rating between 1 and 5)`, `comment text null`, `created_at`, `updated_at`.
- Indexes: `(user_id, draw_date desc)`, `(tenant_id, user_id)`.
- **RLS, enabled and enforced**: `using (user_id = (select auth.uid()))` for select/insert/update/delete, plus a tenant-scoped admin/service policy mirroring the existing precedent. A cross-user read must be impossible without disabling RLS.
- API: `app/api/tool-039/history/route.ts` (GET list, POST create, DELETE one / all), using `resolveEffectiveUserId` for identity, `assertTenantContext` / `validateTenantContext` for the tenant contract, and `validateAuditEvent` for the audit trail.
- Server identity: the client's Supabase session token is sent as `Authorization: Bearer`; the server verifies it cryptographically. The client-supplied `userId` is **never** trusted.
- Last-Write-Wins: needs an explicit rule — recommended **"latest `updated_at` wins per entry id"**, with the loser logged, never silently discarded.

### 2.3 Identity and permissions

| Concern | Option A | Option B |
|---|---|---|
| Identity | none (anonymous guest) | Supabase session (`auth.uid()`), verified server-side |
| Authorization | none needed (own device) | RLS `auth.uid()` + tenant scope + role check via `canMutate` (`lib/shared/tenant-context.ts`) |
| Read | own browser only | own rows only (RLS) |
| Write | own browser only | own rows only; `database.write` is already in `APPROVAL_REQUIRED_ACTIONS` (`lib/shared/audit-contract.ts:67`), so each write carries an approval-shaped audit event |
| Delete / export | own browser only | own rows only, same paths |
| Cross-user attack | not applicable | mitigated by RLS + `resolveEffectiveUserId`'s IDOR guard; must be proven by a negative test |

### 2.4 Where the freshness is computed

`labFreshness(isoDate, referenceIsoDate)` already exists in `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts:434` and is already used for the current reading. The history list **reuses it**, with "now" injected (the module stays pure — no `Date.now()` inside it), and renders `Stale` + the age in days. **Nothing is read from the database/browser without a freshness verdict.**

---

## 3. Files, components and systems affected

### 3.1 Option A (guest-local)

| File | Kind | Change |
|---|---|---|
| `lib/tools/r6/tool-039-liver-enzyme-tracker-history.ts` | **new** | Pure module: entry type, versioned envelope, TTL + max-entries pruning, read-time freshness, validation, CSV export of the history, consent state. No React, no DOM, no `Date.now()`, no I/O (the caller injects the clock) — same discipline as `lib/tools/r6/tool-039-liver-enzyme-tracker-visual.ts` |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-history.test.ts` | **new** | Unit tests for the module above |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts` | modified | Add the history/rating types and the retention constant; reuse `labFreshness` / `daysSinceDate`; **no change** to the existing field contract, reference limits or thresholds |
| `components/tools/tool-039-liver-enzyme-tracker.genius.tsx` | modified | Box 11 renders the history list (or the existing `NOT_APPLICABLE` reason when storage is off); box 12 renders the rating control (or the existing `not_available` block) |
| `components/tools/tool-039-liver-enzyme-tracker.tsx` | modified | "Save this result" action, consent gate, storage notice, load/save/delete wiring |
| `i18n/tool-039-liver-enzyme-tracker.json` | modified | ~+18 keys **per locale** (AR + EN), keeping the parity rule (both locales, no untranslated keys) |
| `components/tools/tool-039-liver-enzyme-tracker.test.tsx` | modified | +tests for box 11 / box 12 (the two existing tests that assert `NOT_APPLICABLE` / `not_available` are replaced by the equivalent assertions for the enabled state) |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-visual.ts` | **untouched** | The visual layer is not involved |
| engine / schema / registry / catalogue | **untouched** | The calculation and the tool identity do not change |

### 3.2 Option B (registered cloud) — everything in 3.1, **plus**

| File | Kind | Change |
|---|---|---|
| `supabase/migrations/<ts>_create_tool039_history.sql` | **new** | Table, indexes, constraints |
| `supabase/migrations/<ts>_create_tool039_history_rls.sql` | **new** | `enable row level security` + the `auth.uid()` policies (mirrors `20260930180000_seo_keyword_weekly_states_rls.sql`) |
| `supabase/migrations/rollbacks/<ts>_rollback_tool039_history.sql` | **new** | Rollback, per the existing convention |
| `app/api/tool-039/history/route.ts` | **new** | GET / POST / DELETE; identity via `resolveEffectiveUserId`; audit events via `validateAuditEvent` |
| `server/tool-039/history-service.ts` | **new** | Data access (mirrors `server/dashboard/dashboardService.ts`) |
| `tests/security/tool-039-history-cross-user.test.ts` | **new** | **Negative** tests: user A cannot read / write / delete user B's rows; unauthenticated → 401; forged `userId` → 403 |
| `tests/unit/tool-039-retention.test.ts` | **new** | TTL/retention + stale-at-read-time |

### 3.3 Systems touched, and systems deliberately not touched

- **Touched:** the Tool 039 component, the tool's genius component, the tool's i18n, the tool's pure R6 layer, and (Option B only) one new table + one new route + the audit/tenant contracts *used*, never modified.
- **Not touched:** the V6 engine, the Zod schema, the registry, the catalogue, `R6_EXEMPT_SLUGS`, the shared shell (`R6ToolShell`, `R6Progress`), the preferences layer, every other tool's component, the i18n provider, and the translation provider policy.

---

## 4. Security, privacy and data retention

The stored data is **health data** (liver enzymes with a reference-limit multiple) and therefore falls under SPEC-R6.1-4.f (Memory), which requires: *per user only · explicit, revocable consent · viewable / deletable / exportable · no shared memory · TTL · no secrets or sensitive medical data without classification and consent*.

| Requirement | How the design satisfies it |
|---|---|
| **Explicit, revocable consent** | A first-use opt-in gate; consent state is stored with the data; revoking consent deletes the local envelope and shows the `NOT_APPLICABLE` reason again. No consent → no write at all |
| **Viewable / deletable / exportable** | Delete one / delete all in the UI, plus CSV export of the history. These are the user's data, so the controls are first-class, not a support request |
| **Per user only** | Option A: the browser profile is the boundary. Option B: `user_id = auth.uid()` enforced by RLS — a user cannot see another user's rows even if they know the id |
| **No shared memory** | Nothing is written to a shared or cross-user store; the cross-tool link contract stays `manual-reentry`, so no other tool reads another tool's history |
| **TTL / retention** | 365-day auto-expiry (Option A) and/or a retention policy on the table (Option B); the age is always visible next to each entry |
| **Stale is visible** | Health Monitor profile requirement: entries older than 90 days show `Stale` and are never presented as current (computed at read time) |
| **Secrets** | No secret is created, stored or printed. Option A uses the existing `SecureStorage` AES helper. Honest limitation to state to the owner: a client-side key delivered to the browser is **obfuscation against casual inspection, not secrecy against an XSS on the same origin** — the browser is not a trusted vault for medical data |
| **Data minimisation** | The entry stores the readings and the engine result that the user just saw — no additional clinical inference, no profiling, no third-party sharing, no analytics event carrying the values |
| **Audit (Option B)** | `snapshot.commit` / `database.write` are already in `APPROVAL_REQUIRED_ACTIONS`; every write emits an audit event with actor, scope and outcome through the existing `validateAuditEvent` contract, with no PII in the metadata beyond the row id |
| **Server logs (Option B)** | Log `requestId` + actor id + outcome; never log reading values or comments |
| **Legal/medical framing** | The tool stays educational ("Results are educational only — not a diagnosis or prescription"); a stored history must carry the same disclaimer, and the history list must not read as a clinical record |

---

## 5. Tests and evidence that would prove completion

The evidence ladder is defined in `R6.1-CLOSURE-LAYER.md:81-89`; E3 = a re-runnable passing test, E4 = a live run with a build + staging/preview + log.

### 5.1 `LAYER-GENIUS12-11` — History

| # | Test (re-runnable) | Proves |
|---|---|---|
| H1 | box 11 renders the saved entries with marker, value, unit, multiple, status and age | the box is no longer `NOT_APPLICABLE` |
| H2 | an entry older than 90 days renders `Stale` **and is not presented as current** | the Health Monitor profile rule |
| H3 | the Stale verdict is computed at **read** time — an entry saved today with an old draw date is Stale immediately | no stale-forever bug |
| H4 | entries survive a page reload | persistence actually works |
| H5 | delete one entry removes it; delete all empties the history | the user's delete control |
| H6 | consent is required: without consent nothing is written and the UI shows the reason | explicit, revocable consent |
| H7 | revoking consent removes the stored data | consent is revocable |
| H8 | in Option A: **no network call is made** by the history (fetch/XHR spy asserts zero calls) | guest-local really is local |
| H9 | in Option A: two different browser contexts do not see each other's history | per-user isolation for the guest mode |
| H10 | in Option B: user A cannot read / write / delete user B's rows (negative test) | RLS + IDOR protection |
| H11 | the exported CSV contains the stored entries and only the stored entries | export correctness |
| H12 | entries older than the TTL are pruned | retention |

### 5.2 `LAYER-GENIUS12-12-RATING` — Rating / comment

| # | Test | Proves |
|---|---|---|
| R1 | the rating control renders and the `not_available` block is gone | the row is implemented |
| R2 | values 1–5 are accepted; 0 / 6 / non-numeric are rejected | the 1–5 contract |
| R3 | a comment is stored and re-displayed with its rating | comment persistence |
| R4 | a rating can be changed and cleared | edit / clear |
| R5 | the rating is bound to its specific result (two results → two independent ratings) | correct binding |
| R6 | the control is keyboard operable and screen-reader labelled | ACC-5.5.8 / SPEC-15 |
| R7 | the control fits at 390 px with no horizontal overflow, and the text meets the legibility bar used by `ACC-5.5.7-LEGIBILITY` | ACC-5.5.7 + the legibility row |
| R8 | no rating is written without consent; revoking consent removes it | consent |
| R9 | in Option B: cross-user rating access is impossible | RLS |

### 5.3 Live evidence (E4)

- Browser run against the **published** deployment with the same harness used for Tool 039 (`tool-039-browser-verify.mjs`): save a result → reload → the history entry is listed → an artificially old entry shows `Stale` → rate the result → reload → the rating is there → the 390 px layout → AR RTL → keyboard-only operation → the delete and export controls.
- Screenshots: history list, Stale entry, rating control, 390 px, AR RTL.
- `npx tsc --noEmit` = 0 · `npx eslint` = 0 · `next build` = 506/506 · scope 1 and scope 2 green · i18n parity (AR/EN, no missing keys) · a security scan that no value leaves the browser in Option A.

### 5.4 Ledger effect (only after the owner decides and the work is done)

Both rows would move `B=BLOCKED, E=E0` → `B=PASS` with E3 (tests) or E4 (live run), `C` stays `PENDING` until the owner decides each row, and the change log records the transition and the denominator effect (**92/94 = 97.87% → 94/94 = 100%**, with 29 NOT_APPLICABLE still excluded). **No row is deleted, re-scoped or marked NOT_APPLICABLE by the developer.** If the owner instead takes Option C, the transition is a documented exception, and the ledger change is recorded with the exception's reason, duration, alternative and review date — as `R6.1-CLOSURE-LAYER.md:362` requires ("the silent exception is forbidden").

---

## 6. Does implementation require opening W18 / changing the DB / Supabase / RLS?

| | W18 decision | DB migration | Supabase write | RLS policy | Server identity | New route |
|---|---|---|---|---|---|---|
| **Option A — guest-local** | **YES** (the strict reading of `حفظ` bans any save; the row's own proposal offers this branch) | no | no | no | no | no |
| **Option B — registered cloud** | **YES** | **YES** | **YES** | **YES** | yes (reuses `server/auth/resolveUser.ts`) | yes (`app/api/tool-039/history/route.ts`) |
| **Option C — documented exception** | **no** (a recorded exception, not a lift) | no | no | no | no | no |

**Direct answers:**

- **Opening W18:** required for **A and B**; not required for C.
- **Changing the database / Supabase / RLS:** required **only for B**. A touches none of them — no migration, no table, no policy, no service-role key, no production data write. C touches none of them either.
- Option B additionally lands inside a gate that is **not PASS**: G-R6.1-1 is `IN PROGRESS`, and tenant-isolation enforcement (Slice D) is a **contract only, not wired** (`lib/shared/tenant-context.ts` is explicitly "application-layer contract only"; its header lists "wiring to a server-side authentication boundary … any database write, Supabase call, RLS policy" as out of scope). Option B therefore depends on GAP-01 being closed first.

---

## 7. Risks, dependencies and additional approvals

### 7.1 Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Health data in the browser** — `localStorage` is readable by any script on the origin | High | `SecureStorage` AES + explicit consent + clear/delete + TTL; and the owner must be told plainly: a client-side key is obfuscation, not a secure vault. If the data is too sensitive for the device, Option A is not acceptable and only B (or C) remains |
| **Scope creep of the tool** — Tool 039 is currently documented as *"compute-and-display only … no save path … W18 remains blocked"* (`R6.1-PREVIEW-INDEX.md:100-102`) | High | Any persistence makes that statement false; the scope statement, the ledger applicability text and the acceptance document must be updated together — and that is an **owner-visible scope change**, not a developer decision |
| **Data loss** — clearing site data / a new device loses a guest-local history | Medium | Disclosed in the UI; export; TTL is stated |
| **Last-Write-Wins conflicts** (Option B) — two devices editing the same entry | Medium | Explicit rule (latest `updated_at` wins), loser logged not silently dropped; conflict count surfaced |
| **RLS misconfiguration** (Option B) — a wrong policy could expose one user's medical data to another | Critical | RLS enabled + policies using `(select auth.uid())`; the cross-user negative test H10 is a **release gate**, not a nice-to-have; `resolveEffectiveUserId`'s IDOR guard as a second layer |
| **Landmines from the gates** — G-R6.1-1 and G-R6.1-2 are not PASS; Slice D/E/F are contracts only | Medium | Option B is sequenced after the tenant/audit boundaries are wired; Option A does not depend on them |
| **Translation regression** — new AR/EN keys | Low | The i18n parity check (AR/EN, no missing, no contamination) is part of the acceptance run |
| **Ledger integrity** — a "we fixed it" claim without evidence | High | The rows stay `BLOCKED/E0` until the tests in §5 actually pass; the change log records every transition |

### 7.2 Dependencies

- **Option A:** the W18 branch decision; nothing else. It reuses `shared/lib/secureStorage.ts`, `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts` (`labFreshness`, `buildLiverTrackerCsv`), the existing i18n layer, and the existing component/test structure.
- **Option B:** the W18 branch decision **plus** GAP-01 (server-side tenant boundary) closed **plus** an authorization for the migration + RLS **plus** a consent/retention policy **plus** an audit sink (durable audit persistence is currently `BLOCKED` — `GAP-05`).

### 7.3 Additional approvals the owner would need to give

1. **The W18 branch** (D-08): guest-local, registered cloud, or a documented exception — plus the wording of the blocker's `حفظ` for the guest case.
2. **If Option B:** a DB migration authorization; an RLS policy authorization; a retention/consent policy; and the sequencing decision on GAP-01/GAP-05.
3. **A consent-UX decision**: where the gate sits, its exact wording, and whether consent is per-tool or global.
4. **A scope decision**: does Tool 039 remain "compute-and-display only", or does it become the first tool with persistence?
5. **If Option C:** the exception must be recorded with reason, duration, alternative and review date (`R6.1-CLOSURE-LAYER.md:362`) — and the owner's signature, because the exception is not the developer's to grant.

---

## 8. What is NOT in this proposal

- No implementation, no code, no file changes, no Deployment.
- No change to the ledger, the acceptance requirements, or the 123 rows; nothing deleted, nothing re-scoped, nothing marked `NOT_APPLICABLE`.
- No W18 lift, no DB change, no Supabase write, no RLS change, no migration.
- No change to the engine, the Zod schema, the registry, the catalogue, or any other tool.
- No Tool 040 work.
- The tool stays in **`OWNER_REVIEW`** with **92 / 94 = 97.87%** until the owner decides.

**A recommendation, offered as such and not as a decision:** *Option A (guest-local) first.* It resolves both rows with no database, no Supabase write, no RLS, no server identity and no dependence on GAP-01/GAP-05 — the two rows become genuinely implemented and evidenced, and the browser-side privacy trade-off is stated honestly to the user (local only, device-bound, TTL, clear/delete/export, not a secure vault). Option B remains available later as an upgrade path, because the envelope shape, the consent model and the TTL are identical in both — the storage backend is the only difference. If the owner judges that medical values must never rest on a client device, then Option C (a documented exception) is the honest alternative to shipping a weak version of the requirement.
