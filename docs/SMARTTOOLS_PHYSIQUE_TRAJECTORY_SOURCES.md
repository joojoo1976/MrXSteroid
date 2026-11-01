# SmartTools Tool 149 — Physique Trajectory Scenario Source Register

Reviewed: 2026-10-24

## Source and method

- This tool uses no external dataset, physiology model, clinical guideline, body-fat table, AI model, or prediction service.
- The arithmetic definition is the shared in-project kernel in `lib/tools/engines/shared/physique-scenario-kernel.ts`, reused by Tool 131 and Tool 149. It treats the user-entered current weight and body-fat percentage as inputs and assumes lean mass remains constant.
- `current_lean_mass_kg = current_weight_kg × (1 - current_body_fat_pct / 100)`.
- `scenario_target_weight_kg = current_lean_mass_kg / (1 - target_body_fat_pct / 100)`.
- `scenario_duration_weeks = abs(unrounded_scenario_target_weight_kg - current_weight_kg) / user_selected_weekly_rate_kg`.
- Weight and rate values are canonicalized to kg and kg/week before calculation. Body-fat values are percentages from 3 through 70. Current weight is greater than 0 and at most 500 kg; each user-selected rate is greater than 0 and at most 2 kg/week. One to three rates are supported; repeated rates are preserved in entered order.
- A target-weight result above the supported 500 kg bound, a non-finite calculation, or a duration outside the supported numeric domain returns `NOT_AVAILABLE` with a reason and no scenarios.

## Output classification and limitations

- A successful result is `CALCULATED`: deterministic arithmetic under the stated assumptions. Duration is labeled as a scenario calculation, never as a real-world prediction or promise.
- Missing required values are `PARTIAL`; invalid values or duplicate/out-of-range rates are explicit validation errors and prevent calculation.
- Each rate is evaluated independently and displayed in entered order. No rate is recommended, ranked, or combined into a single score.
- This tool does not assess whether a target is healthy, realistic, achievable physiologically, or appropriate. It does not provide training, nutrition, medication, or other health advice.
- No Tool 131 result or profile data is fetched. Both tools call the same pure arithmetic kernel directly.
