# SmartTools Batch 32 — Tool 034 Fractional Decay Scenario

**Date:** 2026-10-25 (Africa/Cairo)  
**Identity:** `mrx.tool.034-compound-clearance` / `tool-034-compound-clearance` (unchanged)  
**Canonical route:** `/smarttools/pharmacokinetics/tool-034-compound-clearance`  
**Legacy route:** `/smarttools/tool-034-compound-clearance` → HTTP 308 to canonical route  
**Status:** `TARGETED IMPLEMENTATION AND CHECKS PASS — FULL RELEASE REVIEW PENDING`

## Baseline risks addressed

- The original user-visible compound, dose, and half-life defaults looked like a real medication scenario despite being example values.
- “Clearance date,” “already clear,” and estimated milligrams remaining implied a physiological result from a simplified dose-decay calculation.
- A hidden fixed 1% cutoff looked like a medical standard; no half-life source was requested.
- Provenance assigned confidence to manually entered values without a validation basis.

## Implemented behavior

- Renamed the tool **Single-dose Fractional Decay Scenario / محاكاة رياضية لاضمحلال نسبة جرعة مفردة**, preserving its app identity, slug, category, old path, and registry order.
- Removed the fabricated example values and dose input. The visitor now supplies a scenario label, half-life in days, its source label or URL, start/evaluation dates, and an explicit mathematical threshold from 0.1% to 20%. The source is displayed as entered and is explicitly unverified.
- Computes only the remaining model fraction, whole days/date to the chosen threshold, and a bounded fractional curve under `fraction(t) = 0.5^(t / halfLife)`. It emits no estimated amount in the body, drug clearance claim, or safety recommendation.
- The selected threshold is described as arbitrary math, not a clinical clearance, detection, or safety standard. The UI states the single-exponential assumption and excluded mechanisms.
- Strict schemas validate source text, finite half-life bounds, threshold bounds, real calendar dates, date order, and that all generated curve dates remain within supported years. The pure engine also rejects invalid inputs instead of substituting current time or defaults.
- Adapter confidence is `null`, data quality `not_assessed`, and findings remain informational. Catalog and registry now use the category-first canonical route; the flat page redirects.
- English/Arabic rendering follows global header language. The unit preference is carried in saved metadata; this model uses days and percent and performs no unit conversion. No local preference controls were added.
- Source rationale is documented in `docs/SMARTTOOLS_TOOL_034_SOURCES.md`; only the Tool 034 row and test-matrix record were updated in the master inventory.

## Verification evidence

| Check | Result |
|---|---|
| `npx vitest run lib/tools/engines/tool-034-compound-clearance.test.ts lib/tools/adapters/tool-031-035-batch.test.ts components/tools/tool-034-compound-clearance.test.tsx --reporter=dot` | PASS — 3 files, 12 tests. |
| `npm run validate-tools` | PASS — 1 file, 5 tests. |
| `npx tsc --noEmit` | PASS — exit code 0. |
| `npx eslint lib/tools/engines/tool-034-compound-clearance.ts lib/tools/schemas/tool-034-compound-clearance.ts lib/tools/adapters/tool-034-compound-clearance.ts components/tools/tool-034-compound-clearance.tsx lib/tools/smartToolsCatalog6.ts lib/tools/registry.ts` | PASS — exit code 0, no warnings. |
| Parse `i18n/tool-034-compound-clearance.json` | PASS. |
| `HEAD http://localhost:3000/smarttools/pharmacokinetics/tool-034-compound-clearance` | PASS — HTTP 200 on local dev server. |
| `HEAD http://localhost:3000/smarttools/tool-034-compound-clearance` | PASS — HTTP 308 legacy redirect. |
| `git diff --check` on the Tool 034 files | PASS; edited CRLF files report Git's line-ending normalization notice. |
| Full test suite, production build, browser accessibility review | NOT RUN. |

## Limitations and release decision

The source entered for half-life is not fetched, checked, or endorsed. The calculation does not establish a real compound's half-life, concentration, amount in the body, detectability, clearance, safety, dosing, or suitability for use. A single exponential does not represent all absorption, distribution, repeat-dose, nonlinear, active-metabolite, or individual PK behavior. The verified tests prove implementation arithmetic only. The existing dashboard save path was not invoked. No database writes, migrations, commits, pushes, or deployment were performed.

**Release decision:** not declared release-ready; full suite/build and browser accessibility review remain outstanding.
