# Read-Only SEO Gap Audit — 2026-09-28

> **Status:** `BLOCKED — NO VERIFIED PRODUCTION DB ACCESS`
> **Production DB Verification:** No `DATABASE_URL` or active `SUPABASE_SERVICE_ROLE_KEY` available. `.env` contains placeholder service role key (`your_service_role_key_here`). All Production DB evidence is `BLOCKED`.
> **Files Modified:** NONE (working tree untouched, no code changes).
> **SQL Verification Script:** `docs/superpowers/sql/2026-09-28-seo-production-verification.sql` (SELECT / metadata ONLY — zero write statements).

---

## Section 1 — Executive Summary

Audit completed from repository source code and migration SQL only. No Production DB connection established. Three SEO-related migrations identified:

- `20260911200000_create_seo_keyword_intelligence.sql` (base keyword intelligence)
- `20260918170000_seo_intelligence_v3_backbone.sql` (v3.0 enhancements)
- `20260918180000_seo_search_telemetry_and_attribution.sql` (telemetry + attribution)

Key findings (code-only):
- `last_analyzed_at`: Referenced in refresh code (`app/api/seo/refresh/route.ts:26,230,250`) and report API (`app/api/seo/report/route.ts:25,69`) — **NOT present in any migration** (`BLOCKED — requires Production DB evidence`).
- `is_pinned`: Referenced extensively (`server/seo/seoService.ts:204`, `app/api/admin/seo/pins/[id]/route.ts:37-76`, `app/api/seo/refresh/route.ts:195`) — **NOT present as column in `seo_keywords`** (exists as separate `seo_keyword_pins` table only; `BLOCKED — requires Production DB evidence` to confirm whether column exists in Production).
- `last_scored_at`: Present in `seo_intelligence_v3_backbone.sql` line 131 (`timestamptz default now()`).
- `last_observed_at`: Present in `create_seo_keyword_intelligence.sql` line 50 (`timestamptz not null default now()`).
- `last_seen_at`: Present in `seo_intelligence_v3_backbone.sql` line 129 (`timestamptz default now()`).

---

## Section 2 — Schema Inventory (Migrations Only)

### Tables Created/Altered in Migrations

From `supabase/migrations/20260911200000_create_seo_keyword_intelligence.sql`:
- `seo_keyword_snapshots` (snapshot data, weekly pre-computed)
- `seo_keywords` (central repository — base definition)
- `seo_keyword_refresh_runs` (audit log for refresh jobs)
- `seo_internal_search_logs` (anonymous telemetry)

From `supabase/migrations/20260918170000_seo_intelligence_v3_backbone.sql`:
- `seo_keyword_sources` (source registry)
- `seo_topic_clusters` (topic clustering)
- `seo_keyword_source_links` (provenance links)
- `seo_keyword_pins` (pinning — separate table, NOT column)
- `seo_keyword_blocks` (blocking management)
- `seo_competitors` (competitor intelligence)
- `seo_competitor_observations` (observations)
- `seo_seasonal_calendar` (seasonal events)
- `seo_cannibalization_alerts` (cannibalization detection)
- `seo_keyword_audit_log` (audit logging)

Altered: `seo_keywords` (v3.0 columns added — see Section 3).

From `supabase/migrations/20260918180000_seo_search_telemetry_and_attribution.sql`:
- `seo_keyword_attributions` (conversion attribution)
- Altered: `seo_internal_search_logs` (`query_hash`, `locale`, `country_code`, `clicked_result`, `search_success`, `session_reference_hash`)

---

## Section 3 — Column Deep-Dive (5 Target Columns)

`STATUS = BLOCKED / REQUIRES PRODUCTION DB EVIDENCE` applies to all verification of actual column existence in Production.

### 3.1 `last_analyzed_at`
- **Migration Reference:** NONE (not found in any of the 3 SEO migrations).
- **Code References:** `app/api/seo/refresh/route.ts`: 26, 230, 250; `app/api/seo/report/route.ts`: 25, 69.
- **Usage:** Written during refresh pipeline (`update({ last_analyzed_at: now.toISOString() })`); selected in report query.
- **Type Assumed by Code:** `timestamptz` (ISO string passed to `.update()`).
- **Status:** `BLOCKED — NOT FOUND IN MIGRATIONS; requires Production DB evidence to confirm absence or presence.`

### 3.2 `last_scored_at`
- **Migration Reference:** `supabase/migrations/20260918170000_seo_intelligence_v3_backbone.sql`, line 131.
- **Migration Definition:** `add column if not exists last_scored_at timestamptz default now()`.
- **Type:** `timestamptz`; Default: `now()`; Nullable: `YES` (no `NOT NULL`).
- **Index Coverage:** Not explicitly indexed for this column in migrations.
- **Status:** `CONFIRMED IN MIGRATION`.

### 3.3 `last_observed_at`
- **Migration Reference:** `supabase/migrations/20260911200000_create_seo_keyword_intelligence.sql`, line 50.
- **Migration Definition:** `last_observed_at timestamptz not null default now()`.
- **Type:** `timestamptz`; Default: `now()`; Nullable: `NO` (`NOT NULL`).
- **Status:** `CONFIRMED IN MIGRATION`.

### 3.4 `last_seen_at`
- **Migration Reference:** `supabase/migrations/20260918170000_seo_intelligence_v3_backbone.sql`, line 129.
- **Migration Definition:** `add column if not exists last_seen_at timestamptz default now()`.
- **Type:** `timestamptz`; Default: `now()`; Nullable: `YES`.
- **Status:** `CONFIRMED IN MIGRATION`.

### 3.5 `is_pinned`
- **Migration Reference:** NONE as column on `seo_keywords`. Separate table `seo_keyword_pins` exists (`supabase/migrations/20260918170000_seo_intelligence_v3_backbone.sql`, lines 172–177).
- **Code References:** `server/seo/seoService.ts`: 204; `app/api/admin/seo/pins/[id]/route.ts`: 37, 40, 76; `app/api/seo/refresh/route.ts`: 195.
- **Usage Pattern in Code:** `pinnedKeywordsSet.has(row.id) || row.is_pinned === true` (line 195 refresh); `.update({ is_pinned: true/false })` (pins admin route); `isPinned` derived for trend protection.
- **Status:** `BLOCKED — NO MIGRATION COLUMN FOUND; separate `seo_keyword_pins` table exists. Production DB must confirm whether `seo_keywords.is_pinned` exists independently.`

---

## Section 4 — Index / Constraint Coverage (From Migrations Only)

Indexes on `seo_keywords` (from migrations):
- `idx_seo_keywords_lang_active_score` (`language, is_active, score desc`) — base
- `idx_seo_keywords_cluster` — base
- `idx_seo_keywords_trend_status` — base
- `idx_seo_keywords_intent` — base
- `idx_seo_keywords_lifecycle_market` (`lifecycle_status, market, language`) — v3
- `idx_seo_keywords_ymyl_review` (`is_ymyl, requires_review, review_status`) — v3

No indexes explicitly defined for `last_analyzed_at`, `last_scored_at`, `last_observed_at`, `last_seen_at`, or `is_pinned`.

Constraints on `seo_keywords` (base migration):
- `language` check (`en`, `ar`)
- `intent` check (`informational`, `commercial`, `transactional`, `navigational`, `comparison`, `question`, `unknown`)
- `trend_status` check (`new`, `rising`, `stable`, `declining`, `retired`)
- `normalized_keyword` unique (`language, normalized_keyword`)
- `score` check (`>= 0 and <= 100`)

---

## Section 5 — Code-to-Schema Drift Analysis

### Drift 1: `last_analyzed_at` missing from migrations
- **Evidence:** Migration SQL reviewed; no `ALTER TABLE ... ADD COLUMN last_analyzed_at` found in any SEO migration.
- **Code Impact:** Refresh pipeline writes this value; report API selects it. If column missing in Production, refresh will fail with column-not-found error.
- **Status:** `BLOCKED — REQUIRES PRODUCTION DB EVIDENCE`

### Drift 2: `is_pinned` column missing from `seo_keywords` migration; separate table exists
- **Evidence:** Migration creates `seo_keyword_pins` (line 172); no `is_pinned` column added to `seo_keywords`.
- **Code Impact:** Code treats `is_pinned` as column on `seo_keywords`; pins admin updates `is_pinned` directly on `seo_keywords`. If column missing, updates will fail.
- **Alternative Interpretation:** Production DB may have applied a manual migration or pre-existing column not tracked in repo.
- **Status:** `BLOCKED — REQUIRES PRODUCTION DB EVIDENCE`

### Drift 3: `last_published_at` in migration but no code reference
- **Evidence:** `seo_intelligence_v3_backbone.sql` line 132: `add column if not exists last_published_at timestamptz`.
- **Code Impact:** Zero TypeScript references to `last_published_at` found via `grep`. Unused column — no functional impact but storage overhead.
- **Status:** `CONFIRMED FROM MIGRATION` (unused by code).

---

## Section 6 — Refresh Pipeline Audit (`app/api/seo/refresh/route.ts`)

### Pipeline Steps (from code):
1. **Audit log creation** — `seo_keyword_refresh_runs` insert (`status`: `running`, `started_at`).
2. **Telemetry fetch** — `seo_internal_search_logs` select (last 7 days).
3. **Pin fetch** — `seo_keyword_pins` select (`keyword_id`).
4. **Keyword scan** — `seo_keywords` select (`*`) with `.eq('is_active', true)`.
5. **Score recalculation** — `calculateKeywordScoreV3()` using `updatedComponents`.
6. **Pin protection** — `pinnedKeywordsSet.has(row.id) || row.is_pinned === true` (line 195).
7. **Batch updates** — `.update()` for `score`, `final_score`, `raw_score`, `trend_status`, `score_components`, `is_ymyl`, `medical_risk_level`, `requires_review`, `last_analyzed_at`, `last_scored_at`.
8. **Snapshot generation** — `seo_keyword_snapshots` upsert (language, year, week_number) with `onConflict`.
9. **Audit finalization** — `seo_keyword_refresh_runs` update (`status`: `completed`, `finished_at`, counts, summary).

### Schema Drift Impact on Refresh:
- `last_analyzed_at`: Written but not in migration → **potential failure**.
- `last_scored_at`: Written and in migration → safe.
- `is_pinned`: Read from `seo_keywords`; if column missing, `row.is_pinned` will return `undefined`, `|| true` will evaluate `false`, and pinned protection will fail unless `seo_keyword_pins` covers it.
- `last_observed_at`: Read from `seo_keywords`; safe (base migration).

---

## Section 7 — Scheduler / Cron Audit

### From `app/api/seo/refresh/route.ts` (authorization):
- `CRON_SECRET` environment variable used (`x-cron-secret` header or Bearer token).
- `NODE_ENV === 'development'` allows bypass.
- Admin profile (`profiles.role === 'admin'`) also authorized.

### From `docs/superpowers/plans/` and `tests/`:
- No dedicated scheduler file (`**/*scheduler*` glob returned nothing).
- Refresh endpoint is `POST` API route (manual/cronned via external mechanism — likely Vercel cron job calling this endpoint with `CRON_SECRET`).

### Status:
- `BLOCKED` — No `vercel.json` cron definition or package-level scheduler inspected in this audit.
- Production DB evidence required to confirm whether refresh runs (`seo_keyword_refresh_runs`) contain scheduled executions vs manual only.

---

## Section 8 — Provenance Tracking Audit

### Provenance Tables (from migrations):
- `seo_keyword_sources` — source registry (`source_type`, `source_name`, `retrieved_at`, `reliability_score`, `terms_verified`).
- `seo_keyword_source_links` — keyword-to-source provenance (`keyword_id`, `source_id`, `observed_value`, `source_metric`, `source_rank`, `source_confidence`, `created_at`).

### Code References:
- `server/seo/seoService.ts`: `lastObservedAt`, `isPinned`, provenance logic.
- `tests/unit/seoIntelligenceV3.test.ts`: Tests v3 backbone behavior.

### Status:
- Migration defines provenance structure fully.
- `BLOCKED` — Production DB required to confirm provenance data population (whether `seo_keyword_source_links` has rows linked to active keywords).

---

## Section 9 — Report / Admin API Audit

### `app/api/seo/report/route.ts` (GET):
- Selects from `seo_keywords`: `id, original_keyword, normalized_keyword, language, cluster, intent, destination_path, score, final_score, confidence_score, lifecycle_status, is_ymyl, requires_review, trend_status, is_active, last_analyzed_at`.
- Selects from `seo_keyword_snapshots`: `language, year, week_number, created_at, snapshot_data`.
- Selects from `seo_internal_search_logs`: `query, normalized_query, language, created_at`.
- Aggregates counts from `seo_keyword_sources`, `seo_competitors`, `seo_seasonal_calendar`, `seo_cannibalization_alerts`.

### Schema Drift Impact:
- `last_analyzed_at`: Selected but not in migration → potential null/empty column issue.
- `last_published_at`: Not selected (unused).

---

## Section 10 — Test Coverage vs Schema

### SEO Test Files (from `glob`):
- `tests/unit/seoScoring.test.ts`
- `tests/unit/seoReportAdminOnly.test.ts`
- `tests/unit/seoNormalization.test.ts`
- `tests/unit/seoIntent.test.ts`
- `tests/unit/seoIntelligenceV3.test.ts`
- `tests/unit/seoIntelligence.test.ts`
- `tests/unit/seoDestination.test.ts`
- `tests/integration/seoPaymentsWebhookKeywords.test.ts`
- `tests/integration/seoGlobalIntelligenceWebhookAttribution.test.ts`
- `tests/integration/seoApi.test.ts`

### Status:
- `BLOCKED` — Tests assume schema state; without Production DB evidence, cannot confirm whether test fixtures match actual column presence (especially `last_analyzed_at`, `is_pinned`).
- No test failures reviewed for SEO-specific failures (full regression shows 16 failures in unrelated files; SEO tests not specifically isolated).

---

## Section 11 — Migration Application Status

### From `docs/superpowers/sql/2026-09-28-seo-production-verification.sql`:
- Query 6 (`supabase_migrations.schema_migrations`) will show which versions applied.
- Query 7 shows full applied version list (last 20).

### Expected Versions:
- `20260911200000`
- `20260918170000`
- `20260918180000`

### Status:
- `BLOCKED — REQUIRES PRODUCTION DB EVIDENCE` (user must run SQL script in Supabase SQL Editor to confirm applied versions).

---

## Section 12 — Missing Columns / Tables Referenced in Code

### Columns in Code but NOT in Migration:
1. `seo_keywords.last_analyzed_at` — referenced in refresh (update, select) and report (select).
2. `seo_keywords.is_pinned` — referenced extensively; separate `seo_keyword_pins` table exists but code assumes column.

### Columns in Migration but NOT Referenced in Code:
1. `seo_keywords.last_published_at` (v3 backbone line 132) — zero TypeScript references.
2. `seo_keywords.review_notes` — no code reference found.
3. `seo_keywords.reviewed_at` — no direct reference in refresh/report code.

### Tables in Migration with No Direct Code Reference (potential unused):
- `seo_topic_clusters` — referenced only in `seo_keywords.topic_cluster_id` reference; direct queries not visible in audited files.
- `seo_seasonal_calendar` — referenced in migration but no refresh pipeline query found.

---

## Section 13 — Risk Assessment

| Risk | Severity | Evidence Source | Blocked Status |
|---|---|---|---|
| `last_analyzed_at` missing in Production | **HIGH** | Migration review + code reference | BLOCKED |
| `is_pinned` column vs table ambiguity | **HIGH** | Migration review + code reference | BLOCKED |
| `last_scored_at` safe (in migration) | **LOW** | Migration confirmed | CONFIRMED |
| `last_observed_at` safe (in migration, NOT NULL) | **LOW** | Migration confirmed | CONFIRMED |
| `last_seen_at` safe (in migration) | **LOW** | Migration confirmed | CONFIRMED |
| Refresh pipeline failure risk (missing column writes) | **HIGH** | Code review of refresh route | BLOCKED |
| Report query failure risk (missing column selects) | **MEDIUM** | Code review of report route | BLOCKED |
| Unused columns (`last_published_at`) | **LOW** | Migration review | CONFIRMED |

---

## Section 14 — Recommended Fixes (Repo-Only, No Production Changes)

These recommendations are for repository alignment only. They do NOT modify Production DB.

1. **Add `last_analyzed_at` to migration** — either via a new migration (`ALTER TABLE public.seo_keywords ADD COLUMN IF NOT EXISTS last_analyzed_at timestamptz default now();`) or confirm it exists in Production via SQL script.
2. **Resolve `is_pinned` ambiguity** — either:
   a. Confirm `seo_keywords.is_pinned` exists in Production (via SQL script section 1/12), or
   b. Update code to derive pinned state exclusively from `seo_keyword_pins` (remove `.is_pinned` reads/writes on `seo_keywords`).
3. **Add index for `last_analyzed_at`** if refresh pipeline filters/orders by this column (currently no index in migrations).
4. **Consider removing `last_published_at`** from future migrations if confirmed unused by code (optional, low priority).
5. **Run SQL verification script** (`docs/superpowers/sql/2026-09-28-seo-production-verification.sql`) in Supabase SQL Editor to confirm actual Production state.

---

## Section 15 — Blocked Items Requiring Production DB Evidence

All of the following items remain `BLOCKED — REQUIRES PRODUCTION DB EVIDENCE`. No assumption is made about Production DB state.

1. **Actual presence of `last_analyzed_at` column** in `public.seo_keywords`.
2. **Actual presence of `is_pinned` column** in `public.seo_keywords`.
3. **Actual nullable/default values** for all 5 target columns in Production.
4. **Actual index definitions** on these columns in Production (`pg_indexes`).
5. **Applied migration versions** (`supabase_migrations.schema_migrations`) — must confirm `20260911200000`, `20260918170000`, `20260918180000` applied.
6. **Row-level data for the 5 columns** — sample data required to confirm types and defaults in practice.
7. **Refresh pipeline execution history** — whether `seo_keyword_refresh_runs` contains completed runs with `updated_keywords > 0`.
8. **Provenance table population** — whether `seo_keyword_source_links` links exist for active keywords.

### Production DB Verification Script

Run the following in Supabase SQL Editor (read-only):
```
-- File: docs/superpowers/sql/2026-09-28-seo-production-verification.sql
```

The script contains 13 SELECT-only queries covering:
- Column existence for all 5 target columns
- Full column inventory for `seo_keywords`
- Index definitions on `seo_keywords`
- Constraint definitions
- Migration application status
- Related table inventory (`seo_%`)
- `seo_keyword_pins` column inventory
- Sample data (5 rows)
- Explicit checks for `last_analyzed_at` and `is_pinned`

---

## Appendix A — File References (No Modifications Made)

### Source / Migration Files Read (Read-Only Only):
- `supabase/migrations/20260911200000_create_seo_keyword_intelligence.sql`
- `supabase/migrations/20260918170000_seo_intelligence_v3_backbone.sql`
- `supabase/migrations/20260918180000_seo_search_telemetry_and_attribution.sql`
- `app/api/seo/refresh/route.ts`
- `app/api/seo/report/route.ts`
- `server/seo/seoService.ts`
- `app/api/admin/seo/pins/[id]/route.ts`

### Tests Inspected (File Names Only — No Changes):
- `tests/unit/seoScoring.test.ts`
- `tests/unit/seoReportAdminOnly.test.ts`
- `tests/unit/seoNormalization.test.ts`
- `tests/unit/seoIntent.test.ts`
- `tests/unit/seoIntelligenceV3.test.ts`
- `tests/unit/seoIntelligence.test.ts`
- `tests/unit/seoDestination.test.ts`
- `tests/integration/seoPaymentsWebhookKeywords.test.ts`
- `tests/integration/seoGlobalIntelligenceWebhookAttribution.test.ts`
- `tests/integration/seoApi.test.ts`

### Unchanged Working Tree Files (Pre-Existing Modifications Preserved):
No new modifications made. Existing `git status` modifications remain untouched (see conversation checkpoint for full list — 20 modified files including `create-session/route.ts`, `checkoutSessionService.ts`, `merchantResolver.ts`, and various webhook/reconciliation tests).

---

## Appendix B — Verification Artifacts Created

1. `docs/superpowers/plans/2026-09-28-seo-gap-audit.md` — Implementation plan (created before audit).
2. `docs/superpowers/sql/2026-09-28-seo-production-verification.sql` — Read-only SQL verification script.
3. `docs/superpowers/reports/2026-09-28-seo-gap-audit.md` — This audit report.

---

*Audit completed: 2026-09-28. No code changes. No Production DB writes. No file modifications beyond audit artifacts. STOP — await user confirmation before any further SEO implementation.*
