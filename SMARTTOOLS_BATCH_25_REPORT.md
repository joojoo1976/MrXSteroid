# SmartTools Batch 25 — Tool 027 User-Provided Molar Mass Calculator

**Date:** 2026-10-25 (Africa/Cairo)  
**Status:** `IMPLEMENTED — REVIEW REQUIRED`  
**Git snapshot before this batch:** branch `main`; HEAD `254ce1299bff227c54809bb7027f9b587d69c143`; 730 `git status --short` records; staged diff empty.  
**Git snapshot after implementation and report updates:** branch and HEAD unchanged; 737 `git status --short` records; staged diff remains empty.  
**Scope:** Tool 027 only. ID, slug, category, route, and ordering remain unchanged.

## Audit finding

The previous engine used a hard-coded, unsupported ester-ratio table and labeled outputs as hormone potency/base-hormone conversion. It accepted a hormone name but did not use it to validate the relevant chemistry. The UI prefilled testosterone and 200 mg, offered fixed ester choices, and persisted the result through a generic user-state hook without a verified data source or consent/account-isolation contract.

## Changes

- Reframed the page as a generic **User-Provided Molar Mass Calculator**. It requires starting/target labels, starting mass and unit, both molar masses in g/mol, and a provenance label for each molar mass.
- The deterministic engine converts source mass to grams, computes `n = m / M`, computes target mass as `m₂ = n × M₂`, then converts the result to the selected mg/g/kg unit. Both the input and result are schema-validated; all numeric values must be finite, positive, and bounded.
- Displays `CALCULATED` and `SAME_AMOUNT_OF_SUBSTANCE`, the entered labels and sources, the formula, and a source link to the IUPAC definition. There are no built-in chemical values or substance lookup database.
- Removed fixed ester ratios, preset hormones/ester choices, “potency” and hormone-equivalence claims, default values, and persistent storage. The UI explicitly excludes dose conversion, biological/pharmaceutical equivalence, potency, bioavailability, substitution, and administration guidance.
- Updated registry/catalog display text while preserving Tool 027 identity, slug, category, route and ordering.

## Source record

IUPAC defines molar mass as mass divided by amount of substance, supporting the dimensional relationship `n = m / M`; the calculator applies this definition to user-entered values only. No substance-specific values are copied from the reference. See `docs/SMARTTOOLS_MOLAR_MASS_SOURCES.md` for reference details and limitations.

## Changed artifacts

- `components/tools/tool-027-ester-conversion.tsx`
- `i18n/tool-027-ester-conversion.json`
- `lib/tools/engines/tool-027-ester-conversion.ts`
- `lib/tools/engines/tool-027-ester-conversion.test.ts`
- `lib/tools/schemas/tool-027-ester-conversion.ts`
- `lib/tools/schemas/tool-027-ester-conversion.test.ts`
- `tests/unit/components/tool-027-molar-mass-calculator.test.tsx`
- `lib/tools/smartToolsCatalog5.ts` (Tool 027 catalog entry)
- `lib/tools/registry.ts` (Tool 027 visible title; other local changes preserved)
- `docs/SMARTTOOLS_MOLAR_MASS_SOURCES.md`
- `SMARTTOOLS_BATCH_25_REPORT.md`
- `SMARTTOOLS_252_MASTER_INVENTORY.md` (batch addendum)

## Verification evidence

| Command | Result |
|---|---|
| `npx vitest run --project node lib/tools/engines/tool-027-ester-conversion.test.ts lib/tools/schemas/tool-027-ester-conversion.test.ts` | `PASS`, exit 0; 2 files, 12 tests. |
| `npx vitest run --project jsdom tests/unit/components/tool-027-molar-mass-calculator.test.tsx` | `PASS`, exit 0; 1 file, 2 tests, including Arabic RTL, required provenance, formula output and stale-result clearing. |
| Scoped `npx eslint --no-ignore` over Tool 027 component, tests, schema, engine, catalog, and registry | `PASS`, exit 0; no warnings. |
| `npx tsc --noEmit` | `PASS`, exit 0. |
| `npm run validate-tools` | `PASS`, exit 0; 1 file, 5 tests. |
| `npm run build` | `PASS`, exit 0; Next.js generated 389/389 pages. Existing stale Browserslist and missing `metadataBase` warnings remain. Build output reports configured Supabase, but this batch made no database calls. |
| Obsolete ester/dose implementation scan over Tool 027 component, locale, engine and schema | No matches (expected `rg` exit 1). |
| Build manifest: `rg -n 'tool-027-ester-conversion' .next/server/app-paths-manifest.json` | `PASS`, exit 0; existing flat route is present. |
| `npx vitest run` | `FAIL`, exit 1; 435 files: 427 passed, 7 failed, 1 skipped; 4,388 passed, 16 failed, 5 skipped (4,409 total). The same seven checkout/payment files and 16 failures are documented in Batches 21–24. |

The unchanged complete-suite blockers include missing Fourthwall product mapping for tier `digital`, payment-receipt route/test contract mismatches, and related checkout/merchant assertions. This batch changes no payment files and adds 14 passing tests. The repository remains not globally green.

## Limits and decision

- The IUPAC definition supports the dimensional relationship only. User-entered labels, molar masses, and sources are not independently verified; chemical identity, formula, purity, form, and stoichiometry are outside this tool's validation.
- The calculated target mass is not an active-moiety dose, medication equivalence, or evidence of equal biological effect.
- No database writes, migrations, staging, commit, push, or deployment were performed.

**Decision:** Tool 027 is ready for owner review as a generic educational calculation from user-provided values. It is not a drug-dose converter. Overall SmartTools readiness remains `NOT READY` because the full-suite failures and broader audit gaps remain.
