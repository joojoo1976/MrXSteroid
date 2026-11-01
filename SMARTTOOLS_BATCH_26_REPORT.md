# SmartTools Batch 26 — Tool 028 Compound Scenario Comparison Worksheet

**Date:** 2026-10-25 (Africa/Cairo)  
**Status:** `IMPLEMENTED — REVIEW REQUIRED`  
**Git snapshot before this batch:** branch `main`; HEAD `254ce1299bff227c54809bb7027f9b587d69c143`; 737 `git status --short` records; staged diff empty.  
**Git snapshot after implementation and report updates:** branch and HEAD unchanged; 743 `git status --short` records; staged diff remains empty.  
**Scope:** Tool 028 only. ID, slug, category, route, and ordering remain unchanged.

## Audit finding

The previous engine assigned a numeric “synergy” score using arbitrary pairwise rules over compound labels and toxicity flags, then emitted a “best” assessment, a testosterone addition recommendation, and cycle protocol tips. The UI supplied a default testosterone item and persisted results through a generic user-state hook without an explicit consent/account-isolation contract. No validated compatibility evidence source was configured.

## Changes

- Reframed the tool as a bilingual **Compound Scenario Comparison Worksheet**. Users enter two named lists (1–10 user-labeled items each) with optional notes, then view those lists side by side.
- Strict schemas validate both scenarios, names, item counts and text limits. The engine validates the input and returns it unchanged with `resultOrigin: USER_PROVIDED`, `assessment: NOT_AVAILABLE`, and reason `NO_VALIDATED_COMPATIBILITY_SOURCE_CONFIGURED`.
- Removed compound properties and classifications, synergy score, compatibility claims, “best” scenario, recommended additions, avoidance judgments, protocol tips, default compounds, and persistent storage.
- Data remains in component memory and is cleared by reset or when leaving the page. No browser storage, Supabase, database, remote source, or cross-tool data access was added.
- Updated registry/catalog display descriptions while preserving Tool 028 identity, route, category and ordering.

No external interaction/compatibility source is claimed or used. The worksheet provides no medication, cycle, health, or safety recommendation.

## Changed artifacts

- `components/tools/tool-028-stacking-synergy.tsx`
- `i18n/tool-028-stacking-synergy.json`
- `lib/tools/engines/tool-028-stacking-synergy.ts`
- `lib/tools/engines/tool-028-stacking-synergy.test.ts`
- `lib/tools/schemas/tool-028-stacking-synergy.ts`
- `lib/tools/schemas/tool-028-stacking-synergy.test.ts`
- `tests/unit/components/tool-028-scenario-comparison-worksheet.test.tsx`
- `lib/tools/smartToolsCatalog5.ts` (Tool 028 entry)
- `lib/tools/registry.ts` (Tool 028 visible title; other local changes preserved)
- `SMARTTOOLS_BATCH_26_REPORT.md`
- `SMARTTOOLS_252_MASTER_INVENTORY.md` (batch addendum)

## Verification evidence

| Command | Result |
|---|---|
| `npx vitest run --project node lib/tools/engines/tool-028-stacking-synergy.test.ts lib/tools/schemas/tool-028-stacking-synergy.test.ts` | `PASS`, exit 0; 2 files, 6 tests. |
| `npx vitest run --project jsdom tests/unit/components/tool-028-scenario-comparison-worksheet.test.tsx` | `PASS`, exit 0; 1 file, 2 tests, including Arabic RTL and reset. |
| Scoped `npx eslint --no-ignore` over Tool 028 component, tests, schema, engine, catalog and registry | `PASS`, exit 0; no warnings. |
| `npx tsc --noEmit` | `PASS`, exit 0. |
| `npm run validate-tools` | `PASS`, exit 0; 1 file, 5 tests. |
| `npm run build` | `PASS`, exit 0; Next.js generated 389/389 pages. Existing stale Browserslist and missing `metadataBase` warnings remain. Build output reports configured Supabase, but this batch made no database calls. |
| Obsolete-claims scan over Tool 028 component, locale, engine and schema | No matches (expected `rg` exit 1). |
| Build manifest: `rg -n 'tool-028-stacking-synergy' .next/server/app-paths-manifest.json` | `PASS`, exit 0; existing flat route is present. |
| `npx vitest run` | `FAIL`, exit 1; 438 files: 430 passed, 7 failed, 1 skipped; 4,396 passed, 16 failed, 5 skipped (4,417 total). The same seven checkout/payment files and 16 failures remain as in Batches 21–25. |

The unchanged full-suite blockers include the missing Fourthwall product mapping for tier `digital`, payment receipt route/test contract mismatches, and related checkout/merchant assertions. No payment files were changed by this batch; eight focused tests passed. The repository remains not globally green.

## Limits and decision

- This is a manual display worksheet, not a synergy, pharmacology, interaction, health, or safety analysis. User-entered labels are not verified.
- Session data is not persisted and disappears when the page unmounts or reloads.
- No database writes, migrations, staging, commit, push, or deployment were performed.

**Decision:** Tool 028's manual worksheet is ready for owner review. Any real compatibility feature requires a separately reviewed evidence source and safety contract. Overall SmartTools readiness remains `NOT READY` because the full-suite blockers and broader audit gaps remain.
