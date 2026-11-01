# SmartTools Batch 33 — Tool 035 Hormone Unit Converter

**Date:** 2026-10-25 (Africa/Cairo)  
**Identity:** `mrx.tool.035-hormone-conversion` / `tool-035-hormone-conversion` (preserved)  
**Canonical route:** `/smarttools/pharmacokinetics/tool-035-hormone-conversion`  
**Legacy route:** `/smarttools/tool-035-hormone-conversion` → HTTP 308 to canonical route  
**Status:** `TARGETED IMPLEMENTATION AND CHECKS PASS — FULL RELEASE REVIEW PENDING`

## Baseline risks addressed

The prior tool inferred total testosterone and estradiol from a weekly testosterone amount, body-fat percentage, age, and AI dose using undocumented constants. It classified estimated E2 as low/optimal/high and recommended a weekly aromatase-inhibitor dose. No valid per-person or source-based PK/clinical model was present to support those values or medication guidance.

## Implemented behavior

- Replaced estimates and AI advice with direct unit conversion for a user-entered lab concentration: testosterone `ng/dL ↔ nmol/L`; estradiol `pg/mL ↔ pmol/L`.
- Derived factors from PubChem molecular weights (288.4 g/mol testosterone; 272.4 g/mol estradiol) and NIST SI concentration definitions. Results are rounded to four decimal places; factors to eight decimal places. Full references and derivation are in `docs/SMARTTOOLS_TOOL_035_SOURCES.md`.
- Requires the analyte, finite nonnegative value, matching unit, valid date, and user-entered lab/report source label. It rejects incompatible analyte/unit pairs and malformed inputs.
- Result is labeled `CALCULATED` and includes input/output unit, value, date, source label, factor, and calculation method. The source label is displayed as user-entered and unverified.
- Removed hormone estimates, reference bands, “optimal” status, ratio, body-fat/age effects, AI medication inputs/suggestions, and clinical warnings.
- Adapter confidence is `null`, data quality `not_assessed`, and findings are informational. Bilingual language follows the global header; no local language or measurement preference buttons were added. The header measurement system is recorded as metadata; hormone-specific analyte units remain explicit.
- Preserved application identity and legacy path; updated catalog and registry title/description and canonical category-first route. Only Tool 035 inventory and test-matrix rows were updated.

## Verification evidence

| Check | Result |
|---|---|
| `npx vitest run lib/tools/engines/tool-035-hormone-conversion.test.ts lib/tools/adapters/tool-031-035-batch.test.ts components/tools/tool-035-hormone-conversion.test.tsx --reporter=dot` | PASS — 3 files, 12 tests. |
| `npm run validate-tools` | PASS — 1 file, 5 tests. |
| `npx tsc --noEmit` | PASS — exit code 0. |
| `npx eslint lib/tools/engines/tool-035-hormone-conversion.ts lib/tools/schemas/tool-035-hormone-conversion.ts lib/tools/adapters/tool-035-hormone-conversion.ts components/tools/tool-035-hormone-conversion.tsx lib/tools/smartToolsCatalog6.ts lib/tools/registry.ts` | PASS — exit code 0, no warnings. |
| Parse `i18n/tool-035-hormone-conversion.json` | PASS. |
| `rg -n "ai_suggestion|AI dose|estimated_e2|estimated_total_t|body_fat_pct|weekly_test_mg|aromatization"` across Tool 035 production files | PASS — no matches. |
| `HEAD http://localhost:3000/smarttools/pharmacokinetics/tool-035-hormone-conversion` | PASS — HTTP 200 on local dev server. |
| `HEAD http://localhost:3000/smarttools/tool-035-hormone-conversion` | PASS — HTTP 308 legacy redirect. |
| `git diff --check` on the Tool 035 files | PASS; edited CRLF files report Git line-ending normalization notices. |
| Full test suite, production build, browser accessibility review | NOT RUN. |

## Limitations and release decision

The converter performs dimensional arithmetic only. It does not identify total versus free testosterone, validate the entered source/result, provide reference intervals, interpret the result, or recommend treatment. Rounded molecular weights can differ slightly from a laboratory's conversion method and displayed precision. The existing dashboard-save handler was not invoked during verification. No database writes, migrations, commits, pushes, or deployment were performed.

**Release decision:** not declared release-ready; full suite/build and browser accessibility review remain outstanding.
