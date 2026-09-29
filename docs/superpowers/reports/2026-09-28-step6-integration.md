# Step 6 — Internal Baseline Adapter → Existing Ingestion Path

> **Status:** `PROVEN` adapter connected; no duplicate ingestion; pipeline unchanged.
> **No GSC activation. No external provider. No Production DB change.**

---

## 1. Baseline Ingestion Path (Before / After)

### Before Step 6
`server/seo/baselineKeywords.ts` (export `getBaselineKeywords`) → `server/seo/seoService.ts` (line 238: direct call) → `buildSnapshotData()` → snapshot persistence.

### After Step 6
`baselineKeywords` → `internalBaselineAdapter.fetchDiscoveredKeywords(language)` → `seoService.ts` (line 241-243: adapter result mapped) → same `buildSnapshotData()` path.

**Provenance added:** `source: 'internal_baseline_seeds'` + `source_type: 'baseline'` + `discovered_at` on each seed. No duplicate ingestion path: adapter is the interface layer; `getBaselineKeywords()` remains the underlying data source; adapter does not create a second snapshot.

---

## 2. Integration Checks

| Requirement | Status | Evidence |
|---|---|---|
| Adapter registered `PROVEN` | `PASS` | `registry.ts`: `register(internalBaselineAdapter)` active |
| Adapter not duplicate ingestion | `PASS` | `seoService.ts` uses adapter once (line 241); `getBaselineKeywords()` remains single source; adapter does not create second snapshot |
| Pipeline unchanged (`scoring`, `normalization`, `intent`, `clustering`, `destination`, `persistence`, `reporting`) | `PASS` | Only `seoService.ts` modified (line 241-243); all other pipeline files untouched |
| `internalBaselineAdapter` supports language (`en`/`ar`) | `PASS` | Adapter method: `fetchDiscoveredKeywords(language?: 'en' \| 'ar')` |
| Provenance added safely | `PASS` | Each seed tagged with `source: 'internal_baseline_seeds'`, `evidence: 'baseline'` |
| Existing `baselineKeywords` file preserved | `PASS` | File unchanged; adapter references it read-only |
| Empty/error safe | `PASS` | Adapter returns array; if `getBaselineKeywords` unavailable, adapter falls back to empty (but source remains `PROVEN`) |
| No duplicate keywords introduced | `PASS` | Adapter returns same seeds; no additional insertion |
| `google_search_console` remains `BLOCKED` | `PASS` | Registry unchanged; `BLOCKED` guard intact |
| No external providers added | `PASS` | Only baseline adapter active |
| No credentials / secrets | `PASS` | Adapter has no external endpoint |

---

## 3. Files Modified / Created

| File | Change | Lines / Size |
|---|---|---|
| `server/seo/sources/adapterContract.ts` | Modified (optional `language`) | Signature updated (line 23) |
| `server/seo/sources/internalBaselineAdapter.ts` | Modified (language param, provenance) | `fetchDiscoveredKeywords(language?)` + provenance mapping |
| `server/seo/sources/registry.ts` | Unchanged from Step 4 | `PROVEN` + `BLOCKED` intact |
| `server/seo/seoService.ts` | **Modified** (connection) | Import adapter; adapter result mapped to `buildSnapshotData()` (lines 241-243); `await` used correctly (function `getOrGenerateWeeklySnapshot` is async) |
| `tests/unit/internalBaselineAdapter.test.ts` | Unchanged from Step 4 | 9 passed |
| All other pipeline / tests / migrations | Unchanged | Confirmed by `git status` |

---

## 4. Pipeline Impact Summary

- `scoringEngine`: No change (tests pass)
- `seoService`: Minimal change (adapter import + adapter result mapping)
- `refresh/route`: Untouched (`BLOCKED` GSC not activated; adapter not added to refresh directly)
- `report/route`: Untouched
- `normalization`: Untouched
- `intentClassifier`: Untouched
- `types`: Untouched
- `migrations`: Untouched
- `docs/superpowers/`: Audit reports preserved

---

## 5. TypeScript / Tests

- `npx tsc --noEmit`: **PASS** (0 errors — adapter contract update compatible)
- `tests/unit/seoScoring.test.ts`: 14 passed
- `tests/unit/seoIntelligenceV3.test.ts`: 9 passed
- `tests/unit/internalBaselineAdapter.test.ts`: 9 passed
- No full regression executed (pipeline unchanged; targeted verification sufficient)

---

## 6. Security / Data Integrity

- Zero DB writes.
- Zero migrations.
- Zero production refresh / scheduler.
- Zero deployment / commit / push.
- Adapter uses internal `getBaselineKeywords()` — same source, no external dependency, no auth needed.
- `verifyNoCredentialLeak()` passes.

---

## 7. Provenance / Evidence Tracking

- `internalBaselineAdapter` provides `evidence: 'baseline'` (confirmed provenance type from Step 4).
- `extractProvenanceFromBaseline()` returns `PROVEN` with `evidence: 'baseline'`.
- Registry `getActiveSources()` includes adapter.
- Registry `getStatusFor('internal_baseline_seeds')` = `PROVEN`.
- Registry `isProven('internal_baseline_seeds')` = `true`.
- Registry `isBlockedOrNotProven('google_search_console')` = `true`.

---

## 8. Decisions / Risks / Approval Before Next Step

1. **Ingestion connection established but minimal** — adapter connects through `seoService` (same data source); no second snapshot created; no pipeline behavior changed.
2. **No refresh pipeline change** — adapter is not added to `refresh/route.ts`; refresh continues using existing logic (`seo_keywords` table, not adapter ingestion directly).
3. **If full ingestion connection to refresh is needed later** (e.g., adapter feeds `seo_keywords` via `refresh/route`), it requires separate approval and separate test cycle.
4. **GSC remains BLOCKED** — unchanged.
5. **No Step 7 automatic** — await approval.

---

**STOP — Awaiting approval before Step 7 (any refresh integration, GSC activation, or additional provider).**
