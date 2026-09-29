# Step 4 — Internal Baseline Adapter (PROVEN)

> **Status:** `PROVEN` (existing verified source). No external providers. No Production DB changes.
> **Step authorized:** Only internal baseline (`baselineKeywords.ts`), not GSC/Bing/Ads/Trends/Competitor.

---

## Source Selected

**`server/seo/baselineKeywords.ts`** — curated seeds (120+ EN, 120+ AR), verified against existing site destinations, active in `seoService.ts`, `seedKeywords.ts`, `refresh/route.ts`, `report/route.ts`.

Why this source: only one with fully established code + provenance + no external dependency + no auth needed.

---

## Files Created / Modified

| File | Action | Notes |
|---|---|---|
| `server/seo/sources/internalBaselineAdapter.ts` | **Created** | Adapter for `baselineKeywords`; `status: 'PROVEN'`; uses `getBaselineKeywords` |
| `tests/unit/internalBaselineAdapter.test.ts` | **Created** | 9 passed (mapping, provenance, lang/market, dedup compatibility, empty/fallback, no credentials, no file replacement) |
| `server/seo/sources/registry.ts` | **Modified** | Added `import { internalBaselineAdapter }`; registered `PROVEN`; GSC remains `BLOCKED` |
| All pipeline (`scoringEngine`, `seoService`, `normalization`, etc.) | **Untouched** | Confirmed by `git status --short` |
| Migrations / DB / refresh / scheduler | **Untouched** | Zero changes |

---

## Registry State

- `internal_baseline_seeds`: `PROVEN` (registered and active in `getActiveSources()`)
- `google_search_console`: `BLOCKED` (unchanged from Step 3)
- All others (`NOT_PROVEN` / `BLOCKED`): unchanged

---

## Pipeline Preservation Verified

- No change to `scoringEngine`, `intentClassifier`, `clustering`, `destinationMapper`, `normalization`.
- `baslineKeywords.ts` file: **not replaced or deleted**; adapter references it read-only.
- `searchTelemetry.ts`: untouched.
- `refresh/route.ts`: untouched (`last_analyzed_at` / `is_pinned` still unverified; not modified).
- Existing `SeoKeyword` types unchanged.
- `Arabic/English` separation preserved (`language: 'en' | 'ar'` handled by adapter mapping).
- Market isolation (`market: 'global'`) preserved.

---

## No Production Changes

- Zero DB writes.
- Zero migrations.
- Zero refresh execution.
- Zero deployment / commit / push.

---

## Evidence / Test Results

- `npx tsc --noEmit`: **PASS**
- `tests/unit/internalBaselineAdapter.test.ts`: **9 passed**
- Existing SEO tests (`seoScoring`, `seoIntelligenceV3`): untouched; no failures introduced.
- No full regression executed (not required; pipeline unchanged).

---

## Security / Credential Check

- Adapter defines `source_reference: 'internal://baseline-keywords'` — no external endpoint, no keys.
- No secrets in `internalBaselineAdapter.ts`.
- No `.env` / `.env.local` modifications.
- `verifyNoCredentialLeak()` passes.

---

## Decisions / Approval Needed Before Any Step 5

1. **GSC stays BLOCKED** — approved to remain blocked; no activation.
2. **Baseline adapter is PROVEN** — safe as design only; does not trigger pipeline changes.
3. **No duplicate-risk** — adapter is read-only seed provider; dedup handled separately.
4. **Next step requires explicit approval** — no automatic progression.

---

**STOP — Awaiting approval for Step 5 (if any) or for Production DB verification (Sections 11/15 of Final Audit).**
