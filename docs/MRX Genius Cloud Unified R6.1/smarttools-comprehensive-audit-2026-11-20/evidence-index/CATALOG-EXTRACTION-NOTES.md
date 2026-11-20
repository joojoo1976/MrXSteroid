# Catalog Extraction Notes — 268 vs 286 reconciliation (2026-11-20)

**Purpose:** document exactly how the SmartTool universe for this audit was derived, why the count is 268 (not 263/269/286), and which extraction is authoritative.  
**Mode:** read-only. No catalog, registry, source, or ledger file was modified.  
**Fixed baseline:** `E:\MrXSteroid-main` @ HEAD `37f047a4105d078b22edea2c857bf35aefdbdc7f`.

---

## 1. Three independent extractions

| # | Method | Artifact | Result |
|---|---|---|---|
| 1 | **Runtime catalog evaluation** — TypeScript transpile + call `getPublishedCatalogTools()` from `lib/tools/smartToolsCatalog4.ts` | `evidence-index/runtime-catalog-dump.mjs`, `evidence-index/RUNTIME-PUBLISHED-CATALOG.json` | `publishedCount: 268`, `allCount: 268`, `plannedCount: 0`, **0 duplicate toolId / slug / href** |
| 2 | **Static source scan** — character-level parser restricted to exported `SmartToolEntry[]` arrays | `evidence-index/scan-tools.mjs`, `evidence-index/TOOL-SOURCE-SCAN.json` | `publishedEntries: 268`, `uniqueEntries: 268`; set-identical to runtime (0 scanner-only, 0 runtime-only) |
| 3 | **Historical scope file** | `docs/MRX Genius Cloud Unified R6.1/scope-reconciliation-286.csv` | 286 rows: 268 `published` / `current_catalog_exact`, 18 `unverified` / `legacy_only` / `GAP` |

The runtime extraction is authoritative for "what is actually published". The static scan is used for per-tool source paths and criteria. The two agree exactly.

---

## 2. Why earlier counts were wrong (263 / 269)

Early static-parser attempts produced 263 and 269 due to:
- naive regex parsing that broke on nested braces, comments, and string literals inside catalog entries;
- inclusion of commented-out or non-entry arrays;
- miscounting spread/merged arrays.

The final `scan-tools.mjs` uses a character-level scanner that:
- tracks string/template/comment state;
- limits collection to exported arrays typed `SmartToolEntry[]`;
- balances braces before slicing entries.

After correction, the static scan matches the runtime dump exactly: **268**. The runtime dump was added specifically to eliminate parser ambiguity and is the tie-breaker.

---

## 3. Reconciliation: 286 → 268

`scope-reconciliation-286.csv` was parsed row-by-row (286 data rows, 286 unique `toolId`, 286 unique `canonicalSlug`):

| publicationState | entryKind | implementationState | catalogSource | Count |
|---|---|---|---|---:|
| published | CORE_TOOL (264) + VARIANT (4) | component_exists (264) / no_component (4) | current_catalog_exact | **268** |
| unverified | GAP | not_found | legacy_only | **18** |

The 18 unverified entries are `UNVERIFIED-001…018` (`SR-269…SR-286`). They have **no component on disk**, are `legacy_only`, and are **not** published. They are preserved as historical GAP placeholders — not deleted tools and not tools requiring development in this audit.

Full row-by-row classification: `286-TO-268-SCOPE-MAPPING.csv` (287 lines incl. header).  
Deduplicated identity inventory: `SMARTTOOLS-CATALOG-RECONCILIATION.csv`.

**Result: 286 = 268 real published tools + 18 unverified GAP placeholders.**

---

## 4. Published tool composition

- 247 numeric IDs in range `006…252` (gaps are expected; not contiguous).
- 21 named/legacy IDs: `mrx.tool.macro`, `bodyfat`, `injection`, `halflife`, `lab`, `genetic`, `cycle`, `timeline`, `master-calculator`, `multi-ester-pharmacokinetics`, `hpta-recovery`, `aromatization-risk`, `pct-timing`, `hcg-serm-protocol`, `bmr-tdee`, `protein-needs`, `water-intake`, `bmi`, `one-rep-max`, `strength-standards`, `rest-timer`.
- 247 + 21 = **268**.

---

## 5. Static source-scan coverage (E2 only)

| Measure | Count |
|---|---:|
| Component source present | 268 |
| Engine source present | 268 |
| Schema source present | 268 |
| Dynamic-route coverage (`app/smarttools/[category]/[tool]/page.tsx`) | 268 |
| Dedicated R6 pipeline file (exact `<slug>-pipeline.ts` name) | 45 |
| Pipeline file matched by numeric-tool prefix fallback | 2 (`tool-016-*`, `tool-051-*`; each flagged `PIPELINE_PREFIX_FALLBACK` in the CSV) |
| Any pipeline file matched in `SMARTTOOLS-CATALOG-RECONCILIATION.csv` | 47 |
| Dedicated i18n resource | 122 |
| Tools with ≥1 tool-specific test file discovered | 154 |
| Tools with no tool-specific test file discovered | 114 |
| Missing from registry (primary-path lookup only) | 2 — `mrx.tool.018-hpta-recovery-monitor`, `mrx.tool.029-side-effect-warning`; slug-level registry lookup is 268/268, with 4 ID variants noted in the CSV |
| Primary path dirty (modified) at HEAD | 24 (preserved, not reverted) |

These are **E2 source-presence** facts. The `Source Presence Proxy %` derived from them (mean 61.31, range 35–100) is explicitly **not** Implementation Progress, E3, or E4.

---

## 6. Locale route handling

The catalog stores one canonical EN `href` per tool. AR routes are produced by `middleware.ts` via a `/ar/*` → underlying-route rewrite (prefix stripped), with locale resolved from URL prefix / manual choice / cookie. Therefore per-tool AR routes in the audit are expressed as `/ar` + `href` with `E2 static` status; browser E4 is `NOT_RUN`. The master/implementation summary was updated from the earlier "no proven /ar route mapping" wording to reflect this middleware evidence (268 rows updated).

---

## 7. Reproduce

```bash
# Runtime-authoritative count (from repo root)
node "docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/runtime-catalog-dump.mjs"

# Static cross-check
node "docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/scan-tools.mjs"

# Scope reconciliation totals
# parse docs/MRX Genius Cloud Unified R6.1/scope-reconciliation-286.csv
```

Expected: `publishedCount 268`, `uniqueEntries 268`, `286 = 268 + 18`.

---

## 8. Final universe CSV construction (authoritative for this deliverable set)

The deterministic PowerShell helpers in this folder were the only writers used for the three requested deliverables:

| Helper | Output |
|---|---|
| `evidence-index/extract-catalog.ps1` | `evidence-index/catalog-extraction.json` — parsed catalog + registry entries |
| `evidence-index/build-universe.ps1` | `SMARTTOOLS-CATALOG-RECONCILIATION.csv` — 268 deduplicated rows |
| `evidence-index/build-286-mapping.ps1` | `286-TO-268-SCOPE-MAPPING.csv` — 286 historical rows |
| `evidence-index/verify-deliverables.ps1` | read-only verification output reproduced in §11 |

Dedupe key = **slug** (268 unique catalog slugs and 268 unique registry slugs). Catalog and registry agree on 264 identical tool IDs; the 4 ID variants are preserved as `REGISTRY_ID_VARIANT=...` notes rather than treated as extra tools.

The batch column uses the historical R5 `B1`–`B88` plan as context only (234 rows), plus explicit annotations for the 29 already-completed Phase-Next audits, the 039 reference-only row, and 4 named legacy tools with no documented batch. The 29 audited tools were **not re-audited**; their IDs are only noted.

---

## 9. Canonical EN/AR route derivation

`Canonical EN Route` is copied from the catalog `href`. All 268 hrefs are hierarchical (`/smarttools/<category>/<slug>`; 0 non-hierarchical). The only route template capable of serving them is `app/smarttools/[category]/[tool]/page.tsx`; 147 other `page.tsx` files under `app/smarttools` are flat redirect/legacy pages, not alternate canonical targets.

Arabic is not a duplicated page tree. `middleware.ts` proves it:

- lines 5–8: `/ar/*` and `/en/*` are rewritten to the underlying route with the prefix stripped;
- lines 56–63: `segments[1]` is parsed as `pathLocale`;
- line 78: explicit URL locale wins;
- lines 94–105: `x-locale`/`x-units` are set and `NextResponse.rewrite` targets `/` + the unprefixed rest;
- lines 120–124: matcher applies to page requests (static assets and API routes skipped).

There is no `app/**/ar/**/page.tsx`. Therefore `Canonical AR Route = '/ar' + Canonical EN Route` is derived from actual route structure. Verification: `AR_ROUTE_MISMATCHES=0`, `AR_ROUTE_NOT_VERIFIED=0`, `NON_AR_PREFIXED_ROUTES=0`.

---

## 10. Source SHA, worktree state, and last-commit rule

Primary source = resolved component file from the catalog declaration (fallback to engine only if the component is absent; no fallback was needed). Resolution accepts the declared path, extension additions, and `/index` variants.

- Tracked primary files: `git hash-object -- <absolute path>`, labelled `GIT_BLOB_WORKTREE:<sha>`. The working tree is dirty at the fixed HEAD, so this is the blob of the current worktree content, not a claim about a committed blob.
- Untracked primary files: `Get-FileHash -Algorithm SHA256`, labelled `SHA256:<hash> (UNTRACKED)`. They are never labelled as committed.
- Missing files: `NOT_FOUND`.
- `Last Relevant Commit`: `git log -1 --format=%h -- <primary path>`. For modified tracked files this is the last committed change to the path; uncommitted edits are separately flagged.

Results: `SHA_KIND_GIT_BLOB_WORKTREE=268`, `SHA_KIND_SHA256=0`, `SHA_KIND_NOT_FOUND=0`, `UNTRACKED_MARKED=0`, `WORKTREE_MODIFIED_PRIMARY=24`, `LAST_COMMIT_UNTRACKED_OR_NOT_FOUND=0`.

---

## 11. Final verification output (selected)

Command:

```powershell
& 'docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/verify-deliverables.ps1'
```

Selected output (byte count omitted because it changes when this notes file is edited):

```text
HEAD=37f047a4105d078b22edea2c857bf35aefdbdc7f
CATALOG_HEADER_MATCH=True
MAPPING_HEADER_MATCH=True
CATALOG_DATA_ROWS=268
MAPPING_DATA_ROWS=286
MAPPING_INVALID_CLASSIFICATIONS=0
CLASS_PRESENT=268
CLASS_UNDETERMINED=18
HISTORICAL_IDS_COMPLETE=True
HISTORICAL_IDS_UNIQUE=True
AR_ROUTE_MISMATCHES=0
AR_ROUTE_NOT_VERIFIED=0
NON_AR_PREFIXED_ROUTES=0
SHA_KIND_GIT_BLOB_WORKTREE=268
UNTRACKED_MARKED=0
WORKTREE_MODIFIED_PRIMARY=24
LAST_COMMIT_UNTRACKED_OR_NOT_FOUND=0
IMPL_IMPLEMENTED=46
IMPL_PARTIAL=222
BATCH_TAG_NOT_DOCUMENTED=4
BATCH_TAG_R6_PHASE_NEXT_039_REFERENCE_ONLY=1
BATCH_TAG_R6_PHASE_NEXT_29_AUDITED=29
AUDITED_29_NOTES=29
REFERENCE_039_NOTES=1
REGISTRY_ID_VARIANT_NOTES=4
PIPELINE_EXACT_MATCH=45
PIPELINE_PREFIX_FALLBACK=2
PIPELINE_ANY_MATCH=47
PIPELINE_PREFIX_FALLBACK_NOTES=2
PIPELINE_AMBIGUOUS_NOTES=0
```

Remaining `BATCH_TAG_B1`…`BATCH_TAG_B88` lines total 234 rows. `IMPL_*` values are source-presence proxies only; they do not reopen or re-score the 29 completed audits.

