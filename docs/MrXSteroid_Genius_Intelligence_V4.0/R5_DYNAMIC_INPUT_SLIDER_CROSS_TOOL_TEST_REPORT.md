# R5 DYNAMIC INPUT SLIDER CROSS-TOOL TEST REPORT

**Where a slider is appropriate, what was actually tested, and what remains unverified**

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

> Read-only audit. No code, schema, route, registry, database, RLS, Macro or frozen document was changed. No commit, push, merge or deployment was performed.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

## 1. Verdict

Only **8 of 264** implemented tools render a slider. The three R5 pilots have a verified, measurement-aware slider with a 44px target; the other five slider-bearing tools (macro, hpta-recovery, aromatization-risk, pct-timing, hcg-serm-protocol) have not been runtime-verified in this pass. The remaining 256 tools use native number/text inputs or no numeric input. **This is not a request to put a slider on every tool.** It is a finding that dynamic input is a pilot feature, not a platform capability.

## 2. Existing sliders

| Tool | Sliders | Numeric fields | Depth | Runtime evidence |
|---|---:|---:|---|---|
| Adaptive Macro Calculator (`macro`) | 1 | 0 | standard | NOT RUN |
| HPTA Recovery Modeler (`hpta-recovery`) | 1 | 1 | standard | NOT RUN |
| Unvalidated Aromatization Scenario (`aromatization-risk`) | 3 | 3 | standard | NOT RUN |
| PCT Timing Engine (`pct-timing`) | 3 | 3 | standard | NOT RUN |
| HCG & SERM Protocol (`hcg-serm-protocol`) | 2 | 2 | standard | NOT RUN |
| Body Mass Index Calculator (`bmi`) | 3 | 2 | rich-output | PASS (R5 live + a11y) |
| Protein Needs Estimate (`protein-needs`) | 2 | 2 | rich-output | PASS (R5 live + a11y) |
| Daily Water Intake Estimate (`water-intake`) | 2 | 2 | rich-output | PASS (R5 live + a11y) |

The R5 slider contract includes: animated track/thumb, domain tick labels, correct min/max/step, current value + unit, synchronized precise number input, immediate validation, keyboard/touch/mouse/screen-reader support, reduced-motion support and a 44px hit area while the painted track stays 8px.

## 3. Suitability rubric

| Input type | Slider? | Reason |
|---|---|---|
| Continuous bounded anthropometric value (weight, height, body-fat %) | Yes | meaningful to drag; precise input still required |
| Continuous bounded dose/volume with a safe range | Yes, only with a domain-approved range | wrong bounds can imply a protocol |
| Percentage/score with a validated 0–100 range | Yes | classification changes are meaningful |
| Free text, names, IDs, dates, categorical selects | No | no continuous scale |
| Unbounded or very wide scientific values (e.g., half-life up to 1,000,000 days) | No, or logarithmic control only if approved | a linear slider would be unusable |
| Monetary cost entered by the user | No | precision and currency matter; numeric field is better |
| Record-only entries | No by default | no derived model to drive |

Do not invent arbitrary min/max to make a slider render. Do not force a medical panel, prediction or AI call onto a tool where it makes no sense.

## 4. Highest-value slider candidates (not implemented)

Ranked by unit-bearing numeric fields + numeric input count; this is a triage list, not an approval.

| Tool | Category | Numeric fields | Unit-bearing fields | Proposed slider field(s) |
|---|---|---:|---|---|
| Progressive Overload & Adaptive Reserve Capacity Predictor (`tool-120-progressive-overload-predictor`) | Training & Recovery | 16 | current_1rm_kg, current_volume_load_kg, baseline_1rm_kg, baseline_volume_load_kg, body_weight_kg, height_cm, protein_g_per_kg, wrist_cm, ankle_cm | current_1rm_kg, current_volume_load_kg |
| Fiber Type Adaptation & Mechanical Tension Score (`tool-125-fiber-type-mechanical-tension-score`) | Training & Recovery | 11 | height_cm, body_weight_kg, vertical_jump_cm, broad_jump_cm, avg_weekly_volume_sets, current_tempo | height_cm, body_weight_kg |
| Physique Circumference Ratio Comparison (`tool-136-physique-golden-ratio-score`) | Body Composition | 7 | shoulder_cm, chest_cm, waist_cm, hips_cm, arm_cm, thigh_cm, calf_cm | shoulder_cm, chest_cm |
| AI Body Composition Vision Engine (`tool-108-ai-body-composition-vision-engine`) | Body Composition | 8 | weight_kg, height_cm, neck_cm, waist_cm, hips_cm, chest_cm | weight_kg, height_cm |
| FFMI & Body Fat Analyzer (`bodyfat`) | Body Composition | 5 | heightCm, weightKg, neckCm, waistCm, hipCm | heightCm, weightKg |
| CNS Recovery Score (`tool-118-cns-recovery-score`) | Training & Recovery | 9 | body_temp_c, body_temp_baseline_c, joint_pain | body_temp_c, body_temp_baseline_c |
| Neuromuscular Performance & Explosiveness Modeler (`tool-126-neuromuscular-explosiveness-modeler`) | Training & Recovery | 6 | vertical_jump_cm, broad_jump_cm, one_rm_kg, body_weight_kg | vertical_jump_cm, broad_jump_cm |
| Exercise Sweat-Rate Measurement (`tool-097-hydration-balance-calculator`) | Nutrition | 5 | pre_exercise_body_weight_kg, post_exercise_body_weight_kg, fluid_consumed_liters, urine_output_liters | pre_exercise_body_weight_kg, post_exercise_body_weight_kg |
| Renal Function & Hydration Index (`tool-103-renal-function-hydration-index`) | Medical Monitoring | 5 | serum_creatinine_mg_dl, body_weight_kg, fluid_intake_liters, training_sweat_liters | serum_creatinine_mg_dl, body_weight_kg |
| Arterial Health Manager (`tool-075-arterial-health-manager`) | Medical Monitoring | 6 | total_cholesterol_mg_dl, hdl_mg_dl, triglycerides_mg_dl | total_cholesterol_mg_dl, hdl_mg_dl |
| Thyroid Function & Metabolic Rate Dynamics (`tool-104-thyroid-metabolic-rate-dynamics`) | Hormonal Health | 6 | free_t3_pg_ml, weight_kg, height_cm | free_t3_pg_ml, weight_kg |
| Ideal Circular-Tube Pressure Drop Calculator (`tool-141-carrier-oil-viscosity-syringe-pressure`) | Injection & Formulation | 6 | densityKgM3, volumetricFlowM3S, measurementTemperatureC | densityKgM3, volumetricFlowM3S |
| Master Calculator (`master-calculator`) | Nutrition | 5 | heightCm, weightKg, bodyFatPercentage | heightCm, weightKg |
| Glycogen Supercompensation & Water Retention Modeler (`tool-106-glycogen-supercompensation-water-modeler`) | Nutrition | 5 | body_weight_kg, lean_mass_kg, target_carbs_g_per_kg | body_weight_kg, lean_mass_kg |
| Deload Frequency & Fatigue Accumulation Modeler (`tool-124-deload-frequency-fatigue-modeler`) | Training & Recovery | 8 | weekly_volume_sets, joint_pain | weekly_volume_sets, joint_pain |
| Genetic Potential Calculator (`genetic`) | Training & Recovery | 4 | heightCm, wristCm, ankleCm | heightCm, wristCm |
| Macro Optimizer (`tool-013-macro-optimizer`) | Nutrition | 4 | weight_kg, protein_per_kg, fats_per_kg | weight_kg, protein_per_kg |
| Estrogen Management Pro (`tool-042-estrogen-management`) | Hormonal Health | 4 | e2_pg_ml, weekly_testosterone_mg, weekly_ai_dose_mg | e2_pg_ml, weekly_testosterone_mg |
| Peptide Dosage Calculator (`tool-051-peptide-dosage-calculator`) | Injection & Formulation | 3 | vial_mg, bac_water_ml, desired_dose_mg | vial_mg, bac_water_ml |
| Systemic Inflammation Calculator (`tool-072-systemic-inflammation-calculator`) | Medical Monitoring | 3 | hs_crp_mg_l, waist_circumference_cm, chronic_joint_pain | hs_crp_mg_l, waist_circumference_cm |
| Illustrative Measurement Index (`tool-160-genetic-potential`) | Body Composition | 3 | height_cm, wrist_cm, ankle_cm | height_cm, wrist_cm |
| Intra-Workout Product Label Calculator (`tool-237-intra-workout-volumizer`) | AI Nutrition Vision | 6 | servingVolumeMl, caloriesPerServing | servingVolumeMl, caloriesPerServing |
| Genetic Potential Calculator (`tool-020-genetic-potential`) | Training & Recovery | 5 | currentWeight, height | currentWeight, height |
| Fat Metabolism Calculator (`tool-079-fat-metabolism-calculator`) | Body Composition | 5 | body_weight_kg, vo2max_ml_kg_min | body_weight_kg, vo2max_ml_kg_min |
| BMR / TDEE Calculator (`bmr-tdee`) | Nutrition | 4 | weightKg, heightCm | weightKg, heightCm |
| Calorie Adjuster (`tool-012-calorie-adjuster`) | Nutrition | 4 | height_cm, current_weight_kg | height_cm, current_weight_kg |
| Endothelial Health Manager (`tool-078-endothelial-health-manager`) | Medical Monitoring | 4 | fasting_glucose_mg_dl, high_sensitivity_crp_mg_l | fasting_glucose_mg_dl, high_sensitivity_crp_mg_l |
| Muscle Group Recovery Time-Course Modeler (`tool-121-muscle-group-recovery-modeler`) | Training & Recovery | 7 | protein_g_per_kg | protein_g_per_kg |
| Cycle Architect (`cycle`) | Cycle Management | 3 | userWeightKg, userHeightCm | userWeightKg, userHeightCm |
| Prostate Health Manager (`tool-062-prostate-health-manager`) | Medical Monitoring | 3 | psa_ng_ml, psa_prev_1y_ng_ml | psa_ng_ml, psa_prev_1y_ng_ml |

The dossier for each tool states whether a slider is appropriate, not applicable, or blocked on a validated range.

## 5. R5 runtime test results (actual)

| Test | Result | Evidence |
|---|---|---|
| Slider accessibility RED→GREEN | 13 failed → 13 passed (4 files) | `R5_FIRST_BATCH_EVIDENCE_REPORT.md` §2.2 |
| R5 batch tests | 17 files / 81 tests passed | §4 |
| Targeted R5 + shared regression | 15 files / 45 tests passed; `shared/ui` 20; `header-preferences` 84 | §4 |
| Hit area | computed/offset/client height 44px; track 8px; RTL same | §3.4 |
| Imperial stops | min 66.2 lb → 49 g/day; max 661.3 lb → 485 g/day; 29.9/300.1 kg rejected | §5.2 |
| 375px | no page-level horizontal scroll (358 = 358); RTL; 0 unclipped offenders | §7 |
| Lighthouse a11y | BMI 1.00, Protein 1.00, Water 1.00; zero failing axe audits | §4 |
| Language switch | ARIA names localized; physical unit symbols retained | §3.3 |
| Measurement switch | value physically equal; display unit changes; repeated toggles return to canonical | §5.1–5.3 |

Non-R5 sliders and all non-slider numeric inputs are **NOT RUN** for this contract. Static inventory alone cannot establish keyboard behavior, screen-reader announcements or unit rescaling.

## 6. Defects found in the R5 slider work

1. **Physically invalid imperial stops:** 39 in = 99.06 cm, below the 100 cm canonical minimum; 6/9 boundary tests failed before the fix. The fix uses the smallest 0.1 display stop inside the canonical range.
2. **Raw canonical weight leaked into explanations:** the Arabic/English copy showed kg while the Header was imperial; fixed by passing display-unit weight.
3. **English accessible names in Arabic mode:** “Set weight” / “Precise input” were announced in Arabic; fixed by passing `locale` to `DynamicSliderField`.
4. **7px touch target:** the native range input was only as tall as the painted track; fixed with a 44px hit area.
5. **No real viewport-resize tool:** 375px was verified with a same-origin iframe, not a device. This remains a limitation.

## 7. Required cross-tool test protocol

| Test | Acceptance |
|---|---|
| Bounds | min-1/min/max/max+1/NaN/Infinity; no result on invalid |
| Step/precision | displayed value matches the declared precision; no floating-point noise |
| Slider ↔ number sync | both directions; one canonical state; no loop |
| Measurement switch before/after input | displayed bounds/value rescale; canonical unchanged |
| Repeated switches | no drift; returns to the original canonical value |
| Keyboard | arrow/Home/End/PageUp/PageDown; visible focus; no trap |
| Screen reader | accessible name includes label, value and unit; result announced |
| Touch | 44px target; no accidental page scroll while dragging |
| Reduced motion | no animation when the preference is set |
| RTL | track/thumb direction and labels correct |
| Locale | no English fragment; physical unit symbols may remain |

## 8. Status and next action

**Current status: PASS for R5; NOT RUN for the other five slider tools; NOT APPLICABLE for most record-only tools.** The next batch must not add sliders indiscriminately. It must first establish field-level metadata and the shared slider contract, then apply it only where the domain range is validated.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
