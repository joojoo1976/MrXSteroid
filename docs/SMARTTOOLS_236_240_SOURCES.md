# SmartTools 236–240: Sources and calculation boundaries

Reviewed: 2026-10-27

These tools use values and references entered by the visitor. They do not fetch or verify restaurant, supplement, fiber-type, peptide, or material data from an external source. A cited label or reference is recorded as user-provided and is not treated as independently authenticated.

| Tool | Data basis | Calculation / behavior | Explicit boundary |
| --- | --- | --- | --- |
| 236 — Restaurant Menu Label Calculator | Nutrition values and serving count entered from a restaurant label/reference by the user | Per-item nutrient value × servings; sums provided items. Shows the difference between label calories and the 4/4/9 arithmetic check when the required macro values are provided. | Does not infer missing values, authenticate restaurant data, judge meal quality, or recommend food. The 4/4/9 check is arithmetic, not a label correction. |
| 237 — Intra-Workout Product Label Calculator | Product label values and consumed servings entered by the user | Multiplies provided per-serving values by recorded servings; volume display follows the site's measurement preference. | Does not recommend hydration, electrolytes, carbohydrate intake, or workout nutrition. No values are supplied when the label is incomplete. |
| 238 — Fiber-Related Performance Observation Log | User-entered training observations | Stores/returns a structured observation record; validated fiber-type score is `NOT_AVAILABLE` (`NO_VALIDATED_FIBER_TYPE_MODEL`). | Does not infer muscle-fiber composition, dominant type, adaptation, performance potential, or training prescription. |
| 239 — Peptide Product Label Reference Record | User-entered product name and source/label reference | Records the reference; calculation is `NOT_AVAILABLE` (`NO_VERIFIED_PRODUCT_INSTRUCTIONS`). | No reconstitution, solvent, volume, concentration, dose, sterility, storage, or preparation instructions. User-supplied references are not verified by this tool. |
| 240 — Measured Sample Density Calculator | User-measured sample mass and volume with a recorded source/method | Density `ρ = m / V`, for positive finite measurements; presentation converts units according to the global measurement preference. | No material density database, material identification, mixing, preparation, purity, yield, dosing, or sterilization calculations. |

## General references and assumptions

- Label data: the product/restaurant label or source selected by the user. No external label API is used and no label version/date is independently checked by these tools.
- Unit conversions: exact SI/US customary conversion constants are implemented in the application conversion helper; UI conversions are display-only and engine inputs use documented canonical units.
- Density: the equation is the definition of mass density (`ρ = m/V`); the result describes only the submitted measurement and does not identify the sample.
- Calorie cross-check: 4 kcal/g for protein and carbohydrate and 9 kcal/g for fat is used solely as a transparent arithmetic comparison. Label rounding, fiber/polyols, alcohol, and jurisdiction-specific labeling rules can explain differences; no regulatory conclusion is made.

## Data and safety

The tools do not call Supabase or external services, and this batch adds no persistence. Inputs remain within the current client interaction unless the surrounding application independently persists tool state. The UI reads the shared language and measurement preferences and adds no local language/unit controls.
