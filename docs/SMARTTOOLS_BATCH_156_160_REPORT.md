
## SMARTTOOLS 156–160 checkpoint — 2026-10-27

Published five preserved V7 identities with bounded contracts:

- 156 water-weight observation arithmetic.
- 157 independent multi-entry half-life arithmetic.
- 158 generic volume measurement ratio (no injection guidance).
- 159 independent decay-factor scenario (no schedule).
- 160 illustrative measurement index explicitly not a genetic-limit prediction.

Added catalog 15, schema re-exports, category mappings, and canonical slug routes. The existing registry identity for Tool 158 retains its legacy `tool-158-injection-volume` route; the new catalog uses the validated slug route and preserves the registry identity.

Verification:

| Command | Result |
|---|---|
| `npm run validate-tools` | PASS — 5 tests |
| `npx vitest run lib/tools/engines/tool-151-155.v7.test.ts --reporter=dot` | PASS — 6 tests |
| `npx tsc --noEmit` | PASS — exit 0 |
| `npx eslint` scoped engines/catalog | PASS |
| `npm run build` | PASS — 427/427 pages |

No database writes, migrations, commits, pushes, or deployment were performed.

## Bilingual UI and global measurement preference follow-up — 2026-10-27

Reworked all five published components to replace raw JSON output and technical/untranslated field keys with bilingual labels, accessible controls, localized validation errors, and structured result summaries. Blank values are rejected before numeric conversion instead of silently becoming zero. Tools 156, 158, and 160 now use the global header's measurement preference while retaining canonical engine values: kg↔lb, mL↔US fl oz, and cm↔in respectively. Tools 157 and 159 use days and remain unaffected by metric/imperial selection. Every result keeps the existing educational limits; Tool 160 exposes the illustrative formula and prominently states that it is not a validated prediction. No engine formula, route, identity, or persistence behavior changed.

| Check | Result |
|---|---|
| `npx vitest run components/tools/tool-156-160-header-preferences.test.tsx lib/tools/engines/tool-156-160.v7.test.ts --reporter=dot` | PASS — 2 files / 10 tests |
| `npx tsc --noEmit` | PASS — exit 0 |
| Scoped ESLint for Tools 156–160 components and UI test | PASS — exit 0 |
| `npm run validate-tools` | PASS — 5/5 |
| `npm run build` | PASS — 502/502 pages; existing Browserslist and metadataBase warnings |

The UI tests check Arabic/English and RTL/LTR, kg/lb and mL/fl oz display, canonical results across unit changes, empty/invalid input, and the non-diagnostic/non-predictive wording. They do not constitute a manual browser or accessibility audit.
