# SmartTools Batch 20 — Tools 008–009 Explicit History Logging

**Date:** 2026-10-25 (Africa/Cairo)  
**Status:** `IMPLEMENTED — REVIEW REQUIRED`  
**Git snapshot before edits:** `main` / `254ce1299bff227c54809bb7027f9b587d69c143`; 697 `git status --short` records; staged diff empty.  
**Final Git snapshot:** same branch and HEAD; 705 worktree records; staged diff empty.

## Scope and findings

The prior Tool 008 component wrote a symptom entry from an effect tied to field changes, and the button itself did not perform the save. Tool 009 created a site record on component mount and again on input changes. It also assigned a fixed seven-day `next_safe_date`, and its schema included interval/safety-plan fields without a verified clinical basis. Those behaviors were removed from the active UI path.

## Changes

- Tool 008 is now a bilingual, user-entered symptom log. The user chooses the description and category; the tool does not infer risk, diagnose, recommend treatment, or automatically create an entry. Saving occurs only after an explicit button action.
- Tool 009 is now a bilingual site-history log. The user supplies the label, date, location, and compound-type metadata. It makes no site/interval recommendation and does not determine whether a site is safe. The unsubstantiated `next_safe_date` and rotation-plan output contract were removed from its engine/schema types.
- Both components consume the existing global language/direction preference and add no local language or unit control.
- Tool 009's displayed title and catalog/registry descriptions now match its record-only behavior. Tool ID, slug, category, and routes were preserved.
- Both tools continue to use the existing `mrx_tool_state` browser-local storage helper and their existing top-level keys. No Supabase read/write or schema change was made.
- Existing stored rows are parsed before display; Tool 009 accepts legacy date-only rows by normalizing the date for display, discards malformed rows from the rendered list, and caps history at 500 entries.

## Files changed

- `components/tools/tool-008-side-effect-tracker.tsx`
- `components/tools/tool-009-injection-site-rotator.tsx`
- `components/tools/tool-008-009-explicit-logging.test.tsx`
- `i18n/tool-008-side-effect-tracker.json`
- `i18n/tool-009-injection-site-rotator.json`
- `lib/tools/engines/tool-009-injection-site-rotator.ts`
- `lib/tools/schemas/tool-009-injection-site-rotator.ts`
- `lib/tools/schemas/tool-009-injection-site-rotator.test.ts`
- `lib/tools/smartToolsCatalog3.ts`
- `lib/tools/registry.ts` (the Tool 009 row only; other pre-existing local changes remain)

## Verification

| Command | Result |
|---|---|
| `npx vitest run --project jsdom components/tools/tool-008-009-explicit-logging.test.tsx` | `PASS`, exit 0; 1 file, 2 tests |
| `npx vitest run --project node lib/tools/schemas/tool-009-injection-site-rotator.test.ts` | `PASS`, exit 0; 1 file, 3 tests |
| Scoped `npx eslint --no-ignore` over the changed components, schema, tests, catalog and registry | `PASS`, exit 0; 0 errors, 0 warnings |
| `npx tsc --noEmit` | `PASS`, exit 0 |
| `npm run validate-tools` | `PASS`, exit 0; 1 file, 5 tests |
| `npm run build` | `PASS`, exit 0; Next.js generated 389/389 static pages. Existing Browserslist and missing `metadataBase` warnings remain. |
| `npx vitest run` | `FAIL`, exit 1; 421 files: 413 passed, 7 failed, 1 skipped; 4,347 passed, 16 failed, 5 skipped. The same 16 checkout/payment failures were observed before this batch (prior run: 419 files and 4,342 passed); the seven failing test files are not modified in this batch. Current evidence therefore classifies these failures as pre-existing to Batch 20, though not necessarily pre-existing to earlier local worktree changes. |

The failing payment cases report missing Fourthwall product mappings, an absent method on a checkout test double, and stale payment-settlement assertions. Their root causes remain outside this batch and are unresolved; the repository is not globally green.

## Limitations and follow-up

- The shared local-storage helper ignores its `_userId` argument and stores tool state under one browser key. Account separation, logout cleanup, retention, export, and deletion behavior are not established here. Because the content can be health-related, this needs a separate storage/privacy audit before describing it as account-private.
- Tool 007 still contains count-based bloodwork assessments and automatic recommendations; it was identified during inspection but deliberately not changed in this batch.
- The catalog-wide preference scan was heuristic only. It found 166 component records, 7 planned component paths absent, 16 components without a detected language hook, and 30 without a detected global unit hook; wrappers and alternate localization patterns mean these numbers are leads for file-by-file review, not confirmed functional failures.
- No database writes, migrations, staging, commit, push, or deployment were performed.

**Decision:** Tools 008–009 are ready for owner review as bounded user-history logs. The 252-tool program remains in progress, and global readiness is not established.
