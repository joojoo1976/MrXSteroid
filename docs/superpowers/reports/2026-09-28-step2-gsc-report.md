# Step 2 — GSC Implementation (Blocked Design Only)

> **Status:** `BLOCKED — NO PRODUCTION ACTIVATION`, `NOT PROVEN` (no verified Production DB / API access)
> **Step authorized:** Only Step 2 (GSC only), not Bing/Ads/Trends/Competitor.
> **Evidence Gate preserved:** Baseline 2,341 / 2,325 / 16 unchanged; Fourthwall files untouched.

---

## 1. GSC Contract Verified (Read-Only Research)

Source: `https://developers.google.com/webmaster-tools/v1/searchanalytics/query` (authoritative).

- **Dimensions:** `query`, `page`, `country`, `device`, `date`
- **Metrics:** `clicks`, `impressions`, `ctr`, `position`
- **Auth:** OAuth 2.0 / Service account (Google Cloud); requires site verification.
- **No production credentials used.** No secrets in code. No `.env.local` read for GSC.

---

## 2. Files Created / Modified (Step 2)

| File | Action | Size | Notes |
|---|---|---|---|
| `server/seo/sources/adapterContract.ts` | Created (Step 1) | 1725 B | Unchanged |
| `server/seo/sources/registry.ts` | Modified | 3465 B | Added GSC import + `BLOCKED` registration |
| `server/seo/sources/gscAdapter.ts` | **Created** | 3773 B | Adapter + mapping + normalization + no-credential guard |
| `tests/unit/gscAdapter.test.ts` | **Created** | 2359 B | 9 tests (mapping, provenance, lang/market, null normalization, error handling, fail-closed, credential leak) |

**Untouched:** All existing `app/`, `server/seo/` pipeline (`scoringEngine.ts`, `seoService.ts`, `normalization.ts`, etc.), `tests/` (except new `gscAdapter`), migrations, `refresh/route.ts`, `report/route.ts`, `types.ts`.

---

## 3. GSC Status Classification

| Classification | Status | Reason |
|---|---|---|
| Source design / adapter | `PROVEN` (design only) | Contract verified from Google docs; adapter implements interface correctly |
| Source registry entry | `BLOCKED` | `register()` called with `status: 'BLOCKED'`; `getActiveSources()` excludes it |
| Production API access | `BLOCKED — NO VERIFIED PRODUCTION DB ACCESS` | No GSC OAuth credentials; no verified site URL access; no `SUPABASE_URL` / DB connection |
| Production data ingestion | `NOT PROVEN` / `BLOCKED` | No `fetchDiscoveredKeywords()` activation; returns `[]` fail-closed |

---

## 4. No Provider Activation

- **GSC:** Registered `BLOCKED` only.
- **Bing:** Not touched.
- **Google Ads:** Not touched.
- **Google Trends:** Not touched.
- **Competitor / Scraping / Common Crawl:** Not touched.
- **No API keys, tokens, secrets, credentials** added anywhere.
- **No `.env.local` or `.env` modifications.**

---

## 5. Pipeline Preservation

- `scoringEngine.ts`, `seoService.ts`, `normalization.ts`, `intentClassifier.ts`, `destinationMapper.ts`: **untouched**.
- Existing `baselineKeywords`, `seedKeywords`, internal telemetry (`searchTelemetry.ts`): **untouched**.
- `refresh/route.ts` (includes `last_analyzed_at`/`is_pinned` references): **untouched**.
- `report/route.ts`: **untouched**.
- `types.ts`: **untouched**.

---

## 6. TypeScript

`npx tsc --noEmit`: **PASS** (0 errors).

---

## 7. Tests (Affected Only)

`tests/unit/gscAdapter.test.ts`: **9 passed**.

Coverage: mapping, provenance (`parent_seed` from query), Arabic (`ar`) / English (`en`) handling, market isolation (`global`), null normalization, CTR clamp, no credential leak, fail-closed (`fetchDiscoveredKeywords` returns `[]`), error handling.

No Full Regression executed (not required per Step 2 rules; existing pipeline unchanged).

---

## 8. Git Status

`?? server/seo/sources/` — new artifacts only.  
`?? tests/unit/gscAdapter.test.ts` — new only.  
`?? docs/superpowers/` — audit artifacts unchanged.  
`M` tracked files (20): **pre-existing Fourthwall — untouched by Step 2**.

---

## 9. No Production Changes

- **No migrations** (sql files unchanged; `supabase/migrations/` untouched).
- **No DB writes.**
- **No refresh execution / scheduler.**
- **No deployment / commit / push.**

---

## 10. Decisions / Risks / Approval Needed Before Step 3

1. **GSC remains `BLOCKED`.** Should it stay `BLOCKED` until Production evidence arrives? **Yes — recommended.**
2. **When Production DB evidence is obtained** (Sections 11/15 updated), and if GSC API key / site access is confirmed, status can transition to `NOT_PROVEN` → `PROVEN` with approval.
3. **Adapter does not change `last_analyzed_at` / `is_pinned` fields.** Those remain separate Phase issues (requires Production SQL verification).
4. **No other providers added** — Step 3 requires separate approval for each.

---

**STOP — Awaiting explicit approval before any Step 3 (additional provider / activation / fix) or any Production DB interaction.**
