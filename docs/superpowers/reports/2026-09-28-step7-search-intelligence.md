# Step 7 — Internal Search Intelligence Source Integration (Read-Only Design)

> **Status:** `PROVEN` adapter registered; **signal/boost only** (NOT keyword discovery); no duplicate ingestion; pipeline unchanged.
> **No GSC activation. No external provider. No DB writes. No migrations. No Production refresh.**

---

## 1. Source Analysis (Before Implementation)

From `app/api/seo/refresh/route.ts` (lines 117-129):
- `seo_internal_search_logs` selected for `normalized_query` within last 7 days.
- Used only to compute `searchFrequencyMap` (search boost signal for `updatedComponents.demand`).
- **Not used** to insert new rows into `seo_keywords`.
- Confirmed: `searchTelemetry.ts` writes telemetry; refresh reads it as signal.

**Conclusion:** Internal search is `signal/boost`, not `keyword discovery`. Adapter must preserve this semantics.

---

## 2. Adapter Design (`internalSearchAdapter`)

- `source`: `internal_search_telemetry`
- `source_type`: `internal_search`
- `source_reference`: `internal://seo_internal_search_logs`
- `language`: `'en'` (adapter supports both; telemetry provides `language` from `AdvancedSearchLogParams`)
- `market`: `'global'`
- `evidence`: `'internal_telemetry'`
- `status`: `PROVEN`
- `discovery_method`: `'telemetry'`
- `confidence`: `70`
- `fetchDiscoveredKeywords()`: returns `[]` (empty array — signal adapter, not discovery source)
- Provenance: `evidence: 'internal_telemetry'`, `discovered: 0`

---

## 3. Integration Path (No Duplicate Ingestion)

- Adapter registered in `registry.ts` (`PROVEN`).
- Existing pipeline (`refresh/route.ts`) reads `seo_internal_search_logs` directly for boost; adapter exists as design layer but does NOT create new ingestion path.
- `seoService.ts`: adapter not consumed directly (only `getBaselineKeywords` / adapter for baseline; telemetry remains direct read).
- **No second ingestion path added.** Adapter is design/provenance layer only.

---

## 4. Registry State

- `internal_baseline_seeds`: `PROVEN`
- `internal_search_telemetry`: `PROVEN`
- `google_search_console`: `BLOCKED`
- All others (`NOT_PROVEN` / `BLOCKED`): unchanged

---

## 5. Tests

`tests/unit/internalSearchAdapter.test.ts`: **9 passed**.

Coverage:
- Registration (`PROVEN` check)
- Signal-only assertion (`discovery_method` = telemetry, `discovered` = 0)
- Arabic / English isolation
- Provenance (`evidence: 'internal_telemetry'`)
- Market isolation
- Contract fields
- Empty/fallback safe
- No external credentials
- No duplicate ingestion risk (adapter separate from refresh pipeline)

---

## 6. Pipeline Preservation

- `scoringEngine`: Untouched (tests pass)
- `seoService`: Only adapter contract reference added; `baselineKeywords` direct call preserved; `refresh` telemetry direct read preserved
- `normalization`: Untouched
- `intentClassifier`: Untouched
- `clustering`: Untouched
- `destinationMapper`: Untouched
- `report/route`: Untouched (telemetry read unchanged)
- `refresh/route`: Untouched (telemetry read unchanged; adapter not added to refresh directly)
- `types`: Untouched
- `migrations`: Untouched
- `docs/`: Audit reports preserved

---

## 7. TypeScript / Safety

- `tsc --noEmit`: **PASS**
- `adapterContract.ts`: Optional `language` parameter added safely (backward compatible)
- `internalSearchAdapter.ts`: No external endpoint; no secrets
- `registry.ts`: GSC `BLOCKED` intact; `PROVEN` sources active; `NOT_PROVEN`/`BLOCKED` rejected

---

## 8. Security / No Activation

- Zero Production DB writes.
- Zero refresh execution.
- Zero scheduler.
- Zero deployment / commit / push.
- No GSC activation.
- No new providers.
- No credentials.

---

## 9. Evidence Classification for Step 7

| Component | Classification |
|---|---|
| Internal search telemetry usage (`refresh/route`) | `PROVEN` (code inspection confirms signal/boost only) |
| Adapter design (`internalSearchAdapter`) | `PROVEN` |
| Registry (`PROVEN`) | `PROVEN` |
| Pipeline behavior preserved | `PROVEN` (tests + code inspection) |
| No duplicate ingestion path | `PROVEN` (no second ingestion created) |
| GSC status | `BLOCKED` (unchanged) |
| Production DB access for verification | `BLOCKED` |

---

## 10. Decisions Before Step 8

1. **No ingestion connection added** — adapter exists as design/provenance layer; `refresh` still reads telemetry directly. If a full ingestion connection is needed later, it requires explicit approval.
2. **GSC remains BLOCKED** — unchanged.
3. **Baseline adapter remains PROVEN** — unchanged.
4. **No Step 8 automatic** — await approval.

---

**STOP — Awaiting approval before Step 8 (any ingestion connection to refresh, GSC activation, or additional provider).**
