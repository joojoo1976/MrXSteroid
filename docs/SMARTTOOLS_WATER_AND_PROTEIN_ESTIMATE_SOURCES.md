# Water Intake and Protein Estimate Source Audit

Date: 2026-10-25

## Scope

Read-only source review of the existing Water Intake and Protein Needs pilot estimates and their source basis. The formulas were not changed in this audit. The goal is to distinguish the local arithmetic assumptions from recommendations directly supported by the cited evidence.

## Water Intake Estimate

### Current local calculation

- Engine: `lib/tools/engines/water-intake.v6.ts`.
- UI activity choices: 1.0, 1.1, 1.2, 1.3, and 1.4 in `components/tools/water-intake-pilot.tsx`.
- Calculation: `weightKg × 35 mL/kg × (1 + (activityLevel - 1) × 0.1)`, rounded to 0.01 L/day.
- Validation range: activity factor 1.0–1.4 in the engine and `lib/tools/schemas/water-intake.ts`.
- The UI calls the result an estimate and discloses that it omits fluid from food and does not account for climate or health conditions.

### Evidence and boundary

The National Academies' adult Adequate Intake table gives total-water values of 3.7 L/day for adult men and 2.7 L/day for adult women. It explicitly defines total water as water from food, beverages, and drinking water. These population reference values do not validate the app's 35 mL/kg coefficient or its 10% activity adjustment, nor do they establish an individual drinking-water prescription. Source: [National Academies, Dietary Reference Intakes table](https://www.nationalacademies.org/read/10925/chapter/25).

Therefore, keep the current output classified as a local heuristic estimate, not an evidence-based requirement or individualized hydration prescription. The displayed result must retain its current limitations notice unless a validated, population-specific method is approved.

## Protein Needs Estimate

### Current local calculation

- Engine: `lib/tools/engines/protein-needs.v6.ts`.
- UI activity choices: 1.0, 1.1, 1.2, 1.3, and 1.4 in `components/tools/protein-needs-pilot.tsx`.
- Goal bases: maintenance 1.6, bulk 2.0, and cut 2.2 g/kg/day.
- Activity multiplier: `1 + (activityLevel - 1) × 0.05`.
- The application does not collect training status, age, pregnancy status, kidney condition, or whether a calorie deficit is present beyond the user-selected goal.

### Evidence and boundary

- The 2017 ISSN position stand states that 1.4–2.0 g/kg/day is sufficient for most exercising individuals, with higher intake potentially relevant to resistance-trained subjects during hypocaloric periods. This does not establish the app's exact mapping of `maintain/bulk/cut` to 1.6/2.0/2.2 or its activity multiplier. Source: [ISSN Position Stand: Protein and Exercise, PubMed](https://pubmed.ncbi.nlm.nih.gov/28642676/).
- The 2026 ISSN position stand on body-weight reduction distinguishes general-population weight-loss intakes (1.2–1.6 g/kg/day), resistance-training contexts (1.6–2.2 g/kg/day), and lean resistance-trained people in hypocaloric conditions (1.9–3.2 g/kg/day). The tool does not collect enough context to select among those populations. Source: [ISSN Position Stand: Diets for Body Weight Reduction, PubMed](https://pubmed.ncbi.nlm.nih.gov/42867412/).

Therefore, the current goal labels and coefficient are application heuristics, not a personalized or clinically suitable recommendation. Preserve the visible estimate/disclaimer language; do not claim the cited positions validate the exact formula.

## Test and implementation checkpoint

- The Wave 1 engine tests previously passed `activityLevel: 1.55`, although both tools expose and validate only 1.0–1.4. Their fixtures now use the supported 1.4 boundary; no formula, schema, UI option, or product output changed.
- Tool 128's zero-load case now asserts the implemented structured result (`chronicLoad: 0`, `acwr: null`, `band: undertraining`) rather than expecting a division-by-zero exception.
- Focused verification: `npx vitest run lib/tools/engines/wave1-engines.test.ts lib/tools/engines/tool-128-training-load-acute-chronic-ratio.v6.test.ts` — PASS, 2 files / 10 tests.
- Current project-wide `npx vitest run` remains FAIL from payment-related suites; exact counts are maintained in `docs/GENIUS_TOOL_V3_BASELINE_AUDIT.md`.

## Open product decision

The existing inputs are insufficient to turn these outputs into individualized nutrition or hydration guidance. A future change to the formula, population claim, or required context should be reviewed as a separate scope decision; this audit does not authorize changing the formula.
