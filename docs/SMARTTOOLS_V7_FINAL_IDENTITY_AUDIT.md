# SmartTools v7 Identity and Build Audit

**Date:** 2026-10-26  
**Scope:** Registry reconciliation after integrating tools 241–252. No database, migration, commit, push, or deployment work was performed.

## Reproducible counts

Commands run from the repository root:

```powershell
$v7 = Get-Content 'mrxsteroid-v7-252-tools-genius/registry/tools.registry.v7.252.ts' -Raw
([regex]::Matches($v7, 'number:\s*\d+')).Count
# 252

$reg = Get-Content 'lib/tools/registry.ts' -Raw
([regex]::Matches($reg, '\{ toolId:')).Count
# 262

$ids = [regex]::Matches($reg, "(?:toolId|slug):\s*'[^']*tool-(\d+)") |
  ForEach-Object { [int]$_.Groups[1].Value }
$unique = $ids | Sort-Object -Unique
$duplicates = $ids | Group-Object | Where-Object Count -gt 1
$missing = 1..252 | Where-Object { $_ -notin $unique }
# unique=243, duplicates=0,
# missing=1,2,3,4,5,132,137,138,139
```

The v7 source therefore contains 252 numbered records. The application registry currently contains 262 records in total (including legacy records), with 243 distinct numeric SmartTool identities and no duplicate numeric identities in the extracted tool-number set.

## Discrepancy and identity decision

The difference between 252 v7 records and 262 application records is expected from the registry's legacy records and layered records sharing one file; it is not evidence that the v7 list has been duplicated. The numeric crosswalk still has nine unresolved local identities: **1, 2, 3, 4, 5, 132, 137, 138, and 139**. These are retained as unresolved gaps. No alias, redirect, merge, or replacement was inferred without source evidence.

Evidence is split: v7 defines #1–5 as `body-fat`, `lean-body-mass`, `fat-mass-index`, `ffmi`, and `ideal-body-weight` (registry source lines 20–24), but the application registry has no numbered records for them. The local catalog explicitly keeps #132 and #137–139 as `status: 'planned'` (`lib/tools/smartToolsCatalog10.ts:18,23-25`) and only maps their categories (`lib/tools/categories.ts:207,212-214`); no numbered engine, schema, component, or active route proves an implemented identity. These remain `UNRESOLVED`, rather than aliases of other tools.

Tools 241–252 now have explicit page enums, legal/legacy routes, registry entries, engines, focused tests, and bilingual generic pages. Their engine behavior is covered by the focused tests; the generic pages remain presentation adapters and do not claim broader AI, medical, or database behavior.

## Quality evidence

| Check | Result |
|---|---|
| `npx vitest run lib/tools/engines/tool-241-245.v7.test.ts lib/tools/engines/tool-246-252.v7.test.ts` | PASS (12 focused tests) |
| `npx tsc --noEmit` | PASS |
| `npm run validate-tools` | PASS (5/5) |
| `npm run build` | PASS (395/395 pages; existing Browserslist and `metadataBase` warnings remain) |

## Follow-up UI verification

The 241–242 adapters were upgraded to call their v7 engines, validate numeric input through the engine schemas, expose bilingual labels, and render explicit invalid-input or zero-denominator feedback. After this change, `npx tsc --noEmit` passed and `npx vitest run lib/tools/engines/tool-241-245.v7.test.ts` passed (5/5). The remaining 243–245 pages are intentionally note-only adapters matching their engines' non-calculating scope.

The 248 safety page was then aligned with its engine: it now uses a fixed bilingual checklist, explicit checkbox selection, and escalation text that does not claim safety when there is no match. `npx tsc --noEmit` and `npx vitest run lib/tools/engines/tool-246-252.v7.test.ts` passed (7/7) after the change.

The 249 and 250 adapters now call their engines. Tool 249 records a bounded query while explicitly stating that it does not retrieve or generate citations. Tool 250 records optional current-session context while explicitly stating that it is not persisted, synchronized, or shared. TypeScript and the 246–252 focused tests remained passing.

Tools 251 and 252 were also aligned with their declared boundaries: 251 records a bounded scenario note without prediction, while 252 splits user-selected lines and passes them through the manual aggregation engine with explicit limits. TypeScript and the 246–252 focused tests passed again (7/7).

The final adapter coverage scan for tools 241–252 now reports engine imports for all 12 pages. Tools 246 and 247 were upgraded from free-text-only adapters to validated calls to their note/record engines; TypeScript and the 246–252 focused tests remained passing.

After the 246–252 UI changes, project-level verification was rerun: `npm run validate-tools` passed 5/5, and `npm run build` passed with 395/395 generated pages. The existing Browserslist freshness and `metadataBase` warnings remain documented baseline warnings; no new build failure was observed.

## Complete crosswalk

The generated [252-row identity crosswalk](./SMARTTOOLS_V7_252_ROW_CROSSWALK.md) contains one row for every v7 record. It reports 252 rows and 9 `UNRESOLVED` local numbered identities, matching the reproducible count above. It is evidence only and does not mutate either registry.

Targeted ESLint over all 12 adapters (`components/tools/tool-241-*` through `tool-252-*`) exited 0 with no reported findings.

Browser interaction, screen-reader behavior, and manual accessibility review are **NOT RUN** in this environment. They remain required before a final release decision; the passing TypeScript, ESLint, tests, and build do not substitute for those checks.

The route audit over `lib/legacy-routes.ts` found no missing entries for tools 241–252 (`missing=`). Each tool has a recorded legal/legacy route slug; route presence does not by itself prove the page has passed browser review.

`git diff --check` is **FAIL** because the pre-existing dirty worktree contains blank lines at EOF and one CRLF trailing-whitespace finding across older files (for example `lib/tools/registry.ts:472` and `shared/types/types.ts:2110`). These findings were not normalized to avoid rewriting unrelated user changes.

The full `npm run lint` command exited 0: **PASS with 487 warnings and 0 errors**. The warnings are distributed across existing application and v5 compatibility files; they are not treated as clean-lint evidence and were not mass-fixed in this review batch.

The full `npx vitest run` suite was executed and is **FAIL**: 11 files failed, 23 tests failed, 486 files passed, 4,708 tests passed, and 5 tests were skipped. The observed failures are outside the 241–252 focused batch and include checkout product mapping/payment fixtures, legacy adapter contracts, security posture assumptions, and older header-preference DOM expectations. They require a separate regression triage; they were not silently attributed to the v7 adapter work.

Regression triage fixed the two translation-contract failures in tools 034 and 093 by restoring the headings and date-label strings expected by their DOM contracts. Focused rerun: `npx vitest run components/tools/tool-034-compound-clearance.dom.test.tsx components/tools/tool-090-093-header-preferences.test.tsx` — **4/4 PASS**. The remaining full-suite failures are still tracked separately.

The legacy calculation contract for tool 034 was also reconciled with the newer heading wording while retaining a screen-reader-visible legacy alias and compatible date label. Its two focused test files now pass **4/4**. A fresh full-suite run reduced the repository-wide failure count from 23 to **17**; remaining failures are recorded separately.

The adapters for tools 101, 103, and 104 were also corrected to emit numeric bounded provenance confidence and `medium` data quality instead of an object/`not_assessed` value that contradicted their canonical adapter test contract. Focused rerun: `npx vitest run lib/tools/adapters/tool-101-105-batch.test.ts` — **6/6 PASS**; `npx tsc --noEmit` — **PASS**.

The adjacent adapter batch remains green: `npx vitest run lib/tools/adapters/tool-106-110-batch.test.ts` — **10/10 PASS**.

The remaining repository-wide failures are tracked in the [full-test regression triage](./SMARTTOOLS_FULL_TEST_REGRESSION_TRIAGE.md), separated from the SmartTools v7 batch and without suppressing or bypassing failing assertions.

Following the latest tool-034 compatibility adjustment, `npx tsc --noEmit` was rerun successfully. Merchant and checkout failures remain separately tracked and were not masked by changing their tests.

`npm run validate-tools` was rerun after the compatibility changes and passed **5/5**.

`npm run build` was rerun after the same changes and passed with **395/395 generated pages**. Existing Browserslist and `metadataBase` warnings remain non-blocking baseline warnings.

Git preservation check: `git diff --cached --stat` returned no output (`NO_STAGED_CHANGES`); the worktree remains dirty with 1,212 existing modified/untracked paths. No cleanup, staging, reset, or commit was performed.

Checkpoint: current branch `main`, HEAD `254ce129`. This is the working-tree checkpoint used for all evidence in this report; no branch switch or history mutation was performed.

Adapter UX scan for tools 241–252 reports `status`/`alert` output and an engine import for all 12 pages. This is static evidence of result-channel wiring; manual browser and screen-reader review remains outstanding.

Source-boundary regression check passed: `npx vitest run lib/tools/engines/tool-146-emergency-warning-signs-checklist.v6.test.ts lib/tools/engines/tool-246-252.v7.test.ts` — **20/20 tests PASS**. This keeps ACEP/MedlinePlus source behavior isolated to #146 while #248 remains explicit-selection-only.

Placeholder scan over tools 241–252 found no `TODO` or `NOT_IMPLEMENTED` markers. The only `placeholder` match is the intentional user-facing hint in tool 252 (“one entry per line”), not an unimplemented code path.

Tool 248 now displays an explicit source disclosure: local fixed rules, no external retrieval, and no ACEP attribution for this separate v7 identity. After the disclosure change, TypeScript passed and the 246–252 engine suite remained **7/7 PASS**.

Targeted ESLint for `components/tools/tool-248-safety-gate-emergency-protocol.tsx` exited 0 with no findings.

The documented #146 generic-loader gap was closed with a compatibility re-export at `components/tools/tool-146-ai-safety-gate-emergency-protocol.tsx` and an explicit loader branch in `lib/tools/loaders.ts`, preserving the canonical checklist implementation without creating a second identity. The loader test was added alongside the existing #147 loader test. Combined run `npx vitest run lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts lib/tools/engines/tool-146-emergency-warning-signs-checklist.v6.test.ts` passed **23/23**; `npx tsc --noEmit` and `npm run validate-tools` passed. Targeted ESLint on the loader and compatibility component exited 0. The Vite dynamic-import warning remains for the generic fallback branch; #146 and #147 resolve through explicit imports.

Tool 147 end-to-end component checks passed: engine, Upstash global limiter, API route, and UI tests (`npx vitest run lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts lib/ncbi/eutils-rate-limit.test.ts app/api/smarttools/tool-147/route.test.ts components/tools/tool-147-scientific-evidence-explorer.test.tsx`) — **4 files, 24 tests PASS**. These use mocked upstream/Redis behavior; no live NCBI request was made.

The unresolved set now has a separate [decision matrix](./SMARTTOOLS_V7_UNRESOLVED_DECISION_MATRIX.md). It records the evidence and owner decision required for each identity, including the mismatch between v7 #137–139 health identities and the older local planned catalog entries. No identity was silently merged.

## Remaining review items

The project is **READY FOR HUMAN REVIEW**, not a claim that all 252 tools are production-complete. The unresolved nine identities require an owner-approved crosswalk, and browser/accessibility review plus a full architectural evidence audit remain outstanding. No implementation of those missing identities is authorized by this report.
