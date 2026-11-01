# SMARTTOOLS 252 MASTER INVENTORY (Phase 0)

Inventory refreshed after Batch 19 Tool 146 implementation and focused verification on 2026-10-24. The earlier count block below was stale and internally contradictory. It was reconciled against the checked-out sources on 2026-10-25; the full evidence and 252-row crosswalk are in [SMARTTOOLS_252_REGISTRY_IDENTITY_RECONCILIATION_AUDIT.md](docs/SMARTTOOLS_252_REGISTRY_IDENTITY_RECONCILIATION_AUDIT.md) and [SMARTTOOLS_252_IDENTITY_CROSSWALK.csv](docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv).

### Current source-count reconciliation — 2026-10-25
- Ten catalog files: 166 raw records, 166 unique slugs, 0 within-catalog duplicate slugs; 7 entries are marked planned, leaving 159 non-planned entries.
- `TOOL_REGISTRY`: 154 records, 154 unique slugs, 0 duplicate slugs; all 154 slugs also occur in the catalogs.
- Catalog/registry union: 166 unique slugs; catalog-only 12, registry-only 0, intersection 154. Combined raw occurrences are 320, with 154 cross-source repeated slugs.
- Approved `TOOLS_REGISTRY_V7_252`: 252 numbered records, 252 unique IDs and slugs. Crosswalk: 5 EXACT_MATCH, 93 POSSIBLE_CONCEPTUAL_MATCH, 154 UNRESOLVED, 0 VERIFIED_ALIAS.
- The former 130 registry count is not reproduced by the current source or HEAD. HEAD contains 121 records and the current working tree contains 154 (net +33); the historical origin of 130 remains unknown. Do not infer a source or counting rule for it.
- Current command evidence: `npx vitest run tests/unit/smartToolsCatalog.test.ts` PASS, 6/6 tests; it asserts 159 published + 7 planned = 166. `npm run validate-tools` PASS, 5/5 tests. The previously recorded verbose validator text (9 planned / 157 filesystem entries) is stale and must not be used as current catalog status.

### Macro v6 Phase 1 checkpoint — 2026-10-25
- Legacy identity remains `mrx.tool.macro` / slug `macro`; route, registry identity and category were not changed.
- Macro v6 engine and pilot UI now expose explicit empty/partial/full flow; pilot inputs have no hidden numeric defaults, and the six equation inputs are user-visible. The pilot renders calculation assumptions, phase/weight scenarios, a bilingual macro-distribution list with grams/calories/rounded percentages, summed energy versus target and signed difference, the percentage-rounding limitation, sensitivity notes and a bounded weight What-If slider.
- Macro follow-up validates optional Body Fat imports (source, kg unit, timestamp, confidence and measurement values), preserves explicit user inputs, does not mislabel current body-fat percentage as a target, and removes unimplemented/self-referential outbound graph edges. This does not add automatic import or storage.
- Focused verification: `npx vitest run lib/tools/adapters/bodyfat-to-macro.test.ts lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx` PASS, 85 tests; `npx tsc --noEmit` PASS; scoped ESLint PASS; `npm run validate-tools` PASS, 5 tests; engine coverage PASS, 89.75% branches; `npm run build` PASS with 385/385 static pages. The engine's local finite-difference sensitivity report has no statistical confidence field.
- Full suite remains FAIL: latest run 7 failed files, 16 failed tests, 4222 passed, 5 skipped (4243 total). Macro, Tool 111, Water Intake, Protein Needs and Tool 128 focused tests pass; remaining failures are in payment areas. The full suite and focused evidence are not equivalent.
- Arabic labels, assumptions, scenario labels and numeric sensitivity values appear in the pilot; metric/imperial conversion occurs at the UI boundary while computation stays canonical kg/cm. Generic template status tokens and CALCULATED markers remain English. Browser accessibility and deployed behavior are not verified. See `docs/MACRO_V6_ENGINE_REPORT.md`.

## 1. Raw counts by source
- smartToolsCatalog.ts: 11
- smartToolsCatalog2.ts: 5
- smartToolsCatalog3.ts: 8
- smartToolsCatalog4.ts: 4
- smartToolsCatalog5.ts: 11
- smartToolsCatalog6.ts: 20
- smartToolsCatalog7.ts: 25
- smartToolsCatalog8.ts: 25
- smartToolsCatalog9.ts: 25
- smartToolsCatalog10.ts: 32
- registry.ts: 154
- Total raw records: 320
- Unique slugs: 166
- Duplicate raw occurrences: 154 (catalog/registry overlap)
- Single-source slugs: 12

## Summary
- Catalog + registry unique identities: 166
- Catalog raw entries: 166
- Components/tools TSX files: 211
- Engine TS files: 283
- Schema TS files: 161
- SmartTools page.tsx routes: 162

The older narrative in this paragraph refers to a prior snapshot and is superseded for current counts by the 2026-10-25 source-count reconciliation above. Current catalog/registry union is 166, leaving a numeric target gap of 86; this count gap is distinct from the 247 approved v7 slugs without an exact local slug.

## Count by classification
Classification totals below count 170 route-aware inventory rows; the source inventory contains 166 unique catalog/registry identities.
- IMPLEMENTED BUT UNVERIFIED: 45
- TARGETED TESTS PASS (Batches 6–19): 43
- FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED: 75
- PLANNED/MISSING: 7
- NEEDS REPAIR: 0

## Inventory table (route-aware)
| Tool ID | Slug | catalogHref | canonicalRoute | legacyRouteOrRedirectSource | categoryMapping | routeEvidence | Component | Engine | Schema | Tests | Classification |
|---|---|---|---|---|---|---|---|---|---|---|---|
| mrx.tool.macro | macro | /smarttools/nutrition/macro | /smarttools/nutrition/macro | none | nutrition | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.bodyfat | bodyfat | /smarttools/body-composition/bodyfat | /smarttools/body-composition/bodyfat | none | body-composition | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.injection | injection | /smarttools/injection-formulation/injection | /smarttools/injection-formulation/injection | none | injection-formulation | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.halflife | halflife | /smarttools/pharmacokinetics/halflife | /smarttools/pharmacokinetics/halflife | none | pharmacokinetics | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.lab | lab | /smarttools/medical-monitoring/lab | /smarttools/medical-monitoring/lab | none | medical-monitoring | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.genetic | genetic | /smarttools/training-recovery/genetic | /smarttools/training-recovery/genetic | none | training-recovery | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.cycle | cycle | /smarttools/cycle-management/cycle | /smarttools/cycle-management/cycle | none | cycle-management | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.timeline | timeline | /smarttools/training-recovery/timeline | /smarttools/training-recovery/timeline | none | training-recovery | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.master-calculator | master-calculator | /smarttools/nutrition/master-calculator | /smarttools/nutrition/master-calculator | none | nutrition | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.multi-ester-pharmacokinetics | multi-ester-pharmacokinetics | /smarttools/pharmacokinetics/multi-ester-pharmacokinetics | /smarttools/pharmacokinetics/multi-ester-pharmacokinetics | none | pharmacokinetics | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.hpta-recovery | hpta-recovery | /smarttools/hormonal-health/hpta-recovery | /smarttools/hormonal-health/hpta-recovery | none | hormonal-health | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.126-neuromuscular-explosiveness-modeler | tool-126-neuromuscular-explosiveness-modeler | /smarttools/tool-126-neuromuscular-explosiveness-modeler | /smarttools/training-recovery/tool-126-neuromuscular-explosiveness-modeler | /smarttools/tool-126-neuromuscular-explosiveness-modeler | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.127-ai-daily-readiness-explainer | tool-127-ai-daily-readiness-explainer | /smarttools/tool-127-ai-daily-readiness-explainer | /smarttools/training-recovery/tool-127-ai-daily-readiness-explainer | /smarttools/tool-127-ai-daily-readiness-explainer | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.128-training-load-acute-chronic-ratio | tool-128-training-load-acute-chronic-ratio | /smarttools/tool-128-training-load-acute-chronic-ratio | /smarttools/training-recovery/tool-128-training-load-acute-chronic-ratio | /smarttools/tool-128-training-load-acute-chronic-ratio | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.129-ai-adaptive-training-planner | tool-129-ai-adaptive-training-planner | /smarttools/tool-129-ai-adaptive-training-planner | /smarttools/training-recovery/tool-129-ai-adaptive-training-planner | /smarttools/tool-129-ai-adaptive-training-planner | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.130-ai-plateau-detective | tool-130-ai-plateau-detective | /smarttools/tool-130-ai-plateau-detective | /smarttools/training-recovery/tool-130-ai-plateau-detective | /smarttools/tool-130-ai-plateau-detective | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.131-transformation-forecast-trajectory-engine | tool-131-transformation-forecast-trajectory-engine | /smarttools/tool-131-transformation-forecast-trajectory-engine | /smarttools/body-composition/tool-131-transformation-forecast-trajectory-engine | /smarttools/tool-131-transformation-forecast-trajectory-engine | body-composition | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.132-ai-pose-form-coach | tool-132-ai-pose-form-coach | /smarttools/tool-132-ai-pose-form-coach | /smarttools/training-recovery/tool-132-ai-pose-form-coach | /smarttools/tool-132-ai-pose-form-coach | training-recovery | category map + dynamic route | N | N | N | N | PLANNED/MISSING |
| mrx.tool.133-rep-tempo-velocity-loss-analyzer | tool-133-rep-tempo-velocity-loss-analyzer | /smarttools/tool-133-rep-tempo-velocity-loss-analyzer | /smarttools/training-recovery/tool-133-rep-tempo-velocity-loss-analyzer | /smarttools/tool-133-rep-tempo-velocity-loss-analyzer | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.134-mobility-movement-symmetry-screen | tool-134-mobility-movement-symmetry-screen | /smarttools/tool-134-mobility-movement-symmetry-screen | /smarttools/training-recovery/tool-134-mobility-movement-symmetry-screen | /smarttools/tool-134-mobility-movement-symmetry-screen | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.135-exercise-substitution-ai | tool-135-exercise-substitution-ai | /smarttools/tool-135-exercise-substitution-ai | /smarttools/training-recovery/tool-135-exercise-substitution-ai | /smarttools/tool-135-exercise-substitution-ai | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.136-physique-golden-ratio-score | tool-136-physique-golden-ratio-score | /smarttools/tool-136-physique-golden-ratio-score | /smarttools/body-composition/tool-136-physique-golden-ratio-score | /smarttools/tool-136-physique-golden-ratio-score | body-composition | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.137-peptide-hormone-reconstitution-calculator | tool-137-peptide-hormone-reconstitution-calculator | /smarttools/tool-137-peptide-hormone-reconstitution-calculator | /smarttools/injection-formulation/tool-137-peptide-hormone-reconstitution-calculator | /smarttools/tool-137-peptide-hormone-reconstitution-calculator | injection-formulation | category map + dynamic route | N | N | N | N | PLANNED/MISSING |
| mrx.tool.138-raw-powder-density-oil-formulation-engine | tool-138-raw-powder-density-oil-formulation-engine | /smarttools/tool-138-raw-powder-density-oil-formulation-engine | /smarttools/injection-formulation/tool-138-raw-powder-density-oil-formulation-engine | /smarttools/tool-138-raw-powder-density-oil-formulation-engine | injection-formulation | category map + dynamic route | N | N | N | N | PLANNED/MISSING |
| mrx.tool.139-solvent-emulsifier-ratio-calculator | tool-139-solvent-emulsifier-ratio-calculator | /smarttools/tool-139-solvent-emulsifier-ratio-calculator | /smarttools/injection-formulation/tool-139-solvent-emulsifier-ratio-calculator | /smarttools/tool-139-solvent-emulsifier-ratio-calculator | injection-formulation | category map + dynamic route | N | N | N | N | PLANNED/MISSING |
| mrx.tool.140-dosage-unit-conversion-engine | tool-140-dosage-unit-conversion-engine | /smarttools/tool-140-dosage-unit-conversion-engine | /smarttools/pharmacokinetics/tool-140-dosage-unit-conversion-engine | /smarttools/tool-140-dosage-unit-conversion-engine | pharmacokinetics | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.145-habit-intelligence-consistency-coach | tool-145-habit-intelligence-consistency-coach | /smarttools/tool-145-habit-intelligence-consistency-coach | /smarttools/platform-ai/tool-145-habit-intelligence-consistency-coach | /smarttools/tool-145-habit-intelligence-consistency-coach | platform-ai | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.141-carrier-oil-viscosity-syringe-pressure | tool-141-carrier-oil-viscosity-syringe-pressure | /smarttools/tool-141-carrier-oil-viscosity-syringe-pressure | /smarttools/injection-formulation/tool-141-carrier-oil-viscosity-syringe-pressure | /smarttools/tool-141-carrier-oil-viscosity-syringe-pressure | injection-formulation | category map + dynamic route | N | N | N | N | PLANNED/MISSING |
| mrx.tool.142-compound-purity-active-yield-estimator | tool-142-compound-purity-active-yield-estimator | /smarttools/tool-142-compound-purity-active-yield-estimator | /smarttools/injection-formulation/tool-142-compound-purity-active-yield-estimator | /smarttools/tool-142-compound-purity-active-yield-estimator | injection-formulation | category map + dynamic route | N | N | N | N | PLANNED/MISSING |
| mrx.tool.143-storage-stability-thermal-degradation-estimator | tool-143-storage-stability-thermal-degradation-estimator | /smarttools/tool-143-storage-stability-thermal-degradation-estimator | /smarttools/injection-formulation/tool-143-storage-stability-thermal-degradation-estimator | /smarttools/tool-143-storage-stability-thermal-degradation-estimator | injection-formulation | category map + static route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.144-homebrew-chemistry-calculator | tool-144-homebrew-chemistry-calculator | /smarttools/tool-144-homebrew-chemistry-calculator | /smarttools/measurement-conversion/tool-144-homebrew-chemistry-calculator | flat + old category redirects | measurement-conversion | category map + static route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.146-ai-safety-gate-emergency-protocol | tool-146-ai-safety-gate-emergency-protocol | /smarttools/tool-146-ai-safety-gate-emergency-protocol | /smarttools/platform-ai/tool-146-ai-safety-gate-emergency-protocol | flat redirect to canonical route | platform-ai | category map + static canonical and redirect routes | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.147-scientific-evidence-explorer | tool-147-scientific-evidence-explorer | /smarttools/tool-147-scientific-evidence-explorer | /smarttools/platform-ai/tool-147-scientific-evidence-explorer | /smarttools/tool-147-scientific-evidence-explorer | platform-ai | category map + dynamic route | N | N | N | N | PLANNED/MISSING |
| mrx.tool.148-personal-fitness-memory-layer | tool-148-personal-fitness-memory-layer | /smarttools/platform-ai/tool-148-personal-fitness-memory-layer | /smarttools/platform-ai/tool-148-personal-fitness-memory-layer | /smarttools/tool-148-personal-fitness-memory-layer redirect | platform-ai | category map + canonical and legacy redirect routes | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.149-physique-trajectory-simulator | tool-149-physique-trajectory-simulator | /smarttools/tool-149-physique-trajectory-simulator | /smarttools/body-composition/tool-149-physique-trajectory-simulator | flat redirect to canonical route | body-composition | category map + static canonical and redirect routes | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.150-ai-performance-command-center | tool-150-ai-performance-command-center | /smarttools/platform-ai/tool-150-ai-performance-command-center | /smarttools/platform-ai/tool-150-ai-performance-command-center | /smarttools/tool-150-ai-performance-command-center redirect | platform-ai | category map + canonical and legacy redirect routes | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.aromatization-risk | aromatization-risk | /smarttools/aromatization-risk | /smarttools/hormonal-health/aromatization-risk | /smarttools/aromatization-risk | hormonal-health | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.pct-timing | pct-timing | /smarttools/pct-timing | /smarttools/cycle-management/pct-timing | /smarttools/pct-timing | cycle-management | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.hcg-serm-protocol | hcg-serm-protocol | /smarttools/hcg-serm-protocol | /smarttools/reproductive-wellbeing/hcg-serm-protocol | /smarttools/hcg-serm-protocol | reproductive-wellbeing | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.006-estrogen-prolactin | tool-006-estrogen-prolactin | /smarttools/tool-006-estrogen-prolactin | /smarttools/hormonal-health/tool-006-estrogen-prolactin | /smarttools/tool-006-estrogen-prolactin | hormonal-health | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.007-bloodwork-analyzer | tool-007-bloodwork-analyzer | /smarttools/tool-007-bloodwork-analyzer | /smarttools/medical-monitoring/tool-007-bloodwork-analyzer | /smarttools/tool-007-bloodwork-analyzer | medical-monitoring | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.008-side-effect-tracker | tool-008-side-effect-tracker | /smarttools/tool-008-side-effect-tracker | /smarttools/medical-monitoring/tool-008-side-effect-tracker | /smarttools/tool-008-side-effect-tracker | medical-monitoring | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.009-injection-site-rotator | tool-009-injection-site-rotator | /smarttools/tool-009-injection-site-rotator | /smarttools/injection-formulation/tool-009-injection-site-rotator | /smarttools/tool-009-injection-site-rotator | injection-formulation | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.010-compound-stack-builder | tool-010-compound-stack-builder | /smarttools/tool-010-compound-stack-builder | /smarttools/cycle-management/tool-010-compound-stack-builder | /smarttools/tool-010-compound-stack-builder | cycle-management | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.011-progress-tracker | tool-011-progress-tracker | /smarttools/tool-011-progress-tracker | /smarttools/body-composition/tool-011-progress-tracker | /smarttools/tool-011-progress-tracker | body-composition | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.012-calorie-adjuster | tool-012-calorie-adjuster | /smarttools/tool-012-calorie-adjuster | /smarttools/nutrition/tool-012-calorie-adjuster | /smarttools/tool-012-calorie-adjuster | nutrition | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.013-macro-optimizer | tool-013-macro-optimizer | /smarttools/tool-013-macro-optimizer | /smarttools/nutrition/tool-013-macro-optimizer | /smarttools/tool-013-macro-optimizer | nutrition | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.014-water-retention | tool-014-water-retention | /smarttools/tool-014-water-retention | /smarttools/body-composition/tool-014-water-retention | /smarttools/tool-014-water-retention | body-composition | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.015-shbg-modulator | tool-015-shbg-modulator | /smarttools/tool-015-shbg-modulator | /smarttools/hormonal-health/tool-015-shbg-modulator | /smarttools/tool-015-shbg-modulator | hormonal-health | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.016-half-life | tool-016-half-life-calculator | /smarttools/tool-016-half-life-calculator | /smarttools/pharmacokinetics/tool-016-half-life-calculator | /smarttools/tool-016-half-life-calculator | pharmacokinetics | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.017-drug-interaction | tool-017-drug-interaction | /smarttools/tool-017-drug-interaction | /smarttools/medical-monitoring/tool-017-drug-interaction | /smarttools/tool-017-drug-interaction | medical-monitoring | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.018-hpta-recovery-monitor | tool-018-hpta-recovery | /smarttools/tool-018-hpta-recovery | /smarttools/hormonal-health/tool-018-hpta-recovery | /smarttools/tool-018-hpta-recovery | hormonal-health | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.019-cardio-monitor | tool-019-cardio-monitor | /smarttools/tool-019-cardio-monitor | /smarttools/medical-monitoring/tool-019-cardio-monitor | /smarttools/tool-019-cardio-monitor | medical-monitoring | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.020-genetic-potential | tool-020-genetic-potential | /smarttools/tool-020-genetic-potential | /smarttools/training-recovery/tool-020-genetic-potential | /smarttools/tool-020-genetic-potential | training-recovery | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.021-peptide-protocol | tool-021-peptide-protocol | /smarttools/tool-021-peptide-protocol | /smarttools/cycle-management/tool-021-peptide-protocol | /smarttools/tool-021-peptide-protocol | cycle-management | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.022-half-life-stacker | tool-022-half-life-stacker | /smarttools/tool-022-half-life-stacker | /smarttools/pharmacokinetics/tool-022-half-life-stacker | /smarttools/tool-022-half-life-stacker | pharmacokinetics | category map + dynamic route | Y | Y | Y | Y | FOCUSED TESTS PASS — CLINICAL MODEL REVIEW PENDING |
| mrx.tool.023-trt-optimization | tool-023-trt-optimization | /smarttools/tool-023-trt-optimization | /smarttools/hormonal-health/tool-023-trt-optimization | /smarttools/tool-023-trt-optimization | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FOCUSED CONTRACT TEST PASS — CLINICAL MODEL REVIEW PENDING |
| mrx.tool.024-bloodwork-interpreter | tool-024-bloodwork-interpreter | /smarttools/tool-024-bloodwork-interpreter | /smarttools/medical-monitoring/tool-024-bloodwork-interpreter | /smarttools/tool-024-bloodwork-interpreter | medical-monitoring | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.025-drug-interaction-pro | tool-025-drug-interaction-pro | /smarttools/tool-025-drug-interaction-pro | /smarttools/medical-monitoring/tool-025-drug-interaction-pro | /smarttools/tool-025-drug-interaction-pro | medical-monitoring | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.026-injection-pain | tool-026-injection-pain | /smarttools/tool-026-injection-pain | /smarttools/injection-formulation/tool-026-injection-pain | /smarttools/tool-026-injection-pain | injection-formulation | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.027-ester-conversion | tool-027-ester-conversion | /smarttools/tool-027-ester-conversion | /smarttools/pharmacokinetics/tool-027-ester-conversion | /smarttools/tool-027-ester-conversion | pharmacokinetics | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.028-stacking-synergy | tool-028-stacking-synergy | /smarttools/tool-028-stacking-synergy | /smarttools/cycle-management/tool-028-stacking-synergy | /smarttools/tool-028-stacking-synergy | cycle-management | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.029-side-effect-warning | tool-029-side-effect-early-warning | /smarttools/tool-029-side-effect-early-warning | /smarttools/medical-monitoring/tool-029-side-effect-early-warning | /smarttools/tool-029-side-effect-early-warning | medical-monitoring | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.030-cycle-cost | tool-030-cycle-cost-calculator | /smarttools/tool-030-cycle-cost-calculator | /smarttools/cycle-management/tool-030-cycle-cost-calculator | /smarttools/tool-030-cycle-cost-calculator | cycle-management | category map + dynamic route | Y | Y | Y | Y | FOCUSED TESTS PASS — FULL REVIEW PENDING |
| mrx.tool.031-cycle-length-optimizer | tool-031-cycle-length-optimizer | /smarttools/tool-031-cycle-length-optimizer | /smarttools/cycle-management/tool-031-cycle-length-optimizer | /smarttools/tool-031-cycle-length-optimizer | cycle-management | category map + dynamic route | Y | Y | Y | Y | HOLD — CRITICAL: UNSOURCED CYCLE-SAFETY DURATION RECOMMENDATIONS |
| mrx.tool.032-advanced-pct-planner | tool-032-advanced-pct-planner | /smarttools/tool-032-advanced-pct-planner | /smarttools/hormonal-health/tool-032-advanced-pct-planner | /smarttools/tool-032-advanced-pct-planner | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.033-bloodwork-trend-analyzer | tool-033-bloodwork-trend-analyzer | /smarttools/medical-monitoring/tool-033-bloodwork-trend-analyzer | /smarttools/medical-monitoring/tool-033-bloodwork-trend-analyzer | /smarttools/tool-033-bloodwork-trend-analyzer redirect | medical-monitoring | category map + canonical and legacy redirect routes | Y | Y | Y | Y | TARGETED TESTS PASS — FULL REVIEW PENDING |
| mrx.tool.034-compound-clearance | tool-034-compound-clearance | /smarttools/pharmacokinetics/tool-034-compound-clearance | /smarttools/pharmacokinetics/tool-034-compound-clearance | /smarttools/tool-034-compound-clearance redirect | pharmacokinetics | category map + canonical and legacy redirect routes | Y | Y | Y | Y | TARGETED TESTS PASS — FULL REVIEW PENDING |
| mrx.tool.035-hormone-conversion | tool-035-hormone-conversion | /smarttools/pharmacokinetics/tool-035-hormone-conversion | /smarttools/pharmacokinetics/tool-035-hormone-conversion | /smarttools/tool-035-hormone-conversion redirect | pharmacokinetics | category map + canonical and legacy redirect routes | Y | Y | Y | Y | TARGETED TESTS PASS — FULL REVIEW PENDING |
| mrx.tool.036-injection-schedule | tool-036-injection-schedule | /smarttools/tool-036-injection-schedule | /smarttools/injection-formulation/tool-036-injection-schedule | /smarttools/tool-036-injection-schedule | injection-formulation | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.037-side-effect-probability | tool-037-side-effect-probability | /smarttools/tool-037-side-effect-probability | /smarttools/medical-monitoring/tool-037-side-effect-probability | /smarttools/tool-037-side-effect-probability | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.038-stack-compatibility | tool-038-stack-compatibility | /smarttools/tool-038-stack-compatibility | /smarttools/cycle-management/tool-038-stack-compatibility | /smarttools/tool-038-stack-compatibility | cycle-management | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.039-liver-enzyme-tracker | tool-039-liver-enzyme-tracker | /smarttools/tool-039-liver-enzyme-tracker | /smarttools/medical-monitoring/tool-039-liver-enzyme-tracker | /smarttools/tool-039-liver-enzyme-tracker | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.040-lipid-profile-optimizer | tool-040-lipid-profile-optimizer | /smarttools/tool-040-lipid-profile-optimizer | /smarttools/medical-monitoring/tool-040-lipid-profile-optimizer | /smarttools/tool-040-lipid-profile-optimizer | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.041-hematocrit-monitor | tool-041-hematocrit-monitor | /smarttools/tool-041-hematocrit-monitor | /smarttools/medical-monitoring/tool-041-hematocrit-monitor | /smarttools/tool-041-hematocrit-monitor | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.042-estrogen-management | tool-042-estrogen-management | /smarttools/tool-042-estrogen-management | /smarttools/hormonal-health/tool-042-estrogen-management | /smarttools/tool-042-estrogen-management | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.043-prolactin-management | tool-043-prolactin-management | /smarttools/tool-043-prolactin-management | /smarttools/hormonal-health/tool-043-prolactin-management | /smarttools/tool-043-prolactin-management | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.044-dht-side-effects | tool-044-dht-side-effects | /smarttools/tool-044-dht-side-effects | /smarttools/medical-monitoring/tool-044-dht-side-effects | /smarttools/tool-044-dht-side-effects | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.045-cycle-break-planner | tool-045-cycle-break-planner | /smarttools/tool-045-cycle-break-planner | /smarttools/cycle-management/tool-045-cycle-break-planner | /smarttools/tool-045-cycle-break-planner | cycle-management | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.046-trt-lifetime | tool-046-trt-lifetime | /smarttools/tool-046-trt-lifetime | /smarttools/hormonal-health/tool-046-trt-lifetime | /smarttools/tool-046-trt-lifetime | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.047-fertility-preservation | tool-047-fertility-preservation | /smarttools/tool-047-fertility-preservation | /smarttools/hormonal-health/tool-047-fertility-preservation | /smarttools/tool-047-fertility-preservation | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.048-cardiovascular-risk | tool-048-cardiovascular-risk | /smarttools/tool-048-cardiovascular-risk | /smarttools/medical-monitoring/tool-048-cardiovascular-risk | /smarttools/tool-048-cardiovascular-risk | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.049-bone-density | tool-049-bone-density | /smarttools/tool-049-bone-density | /smarttools/medical-monitoring/tool-049-bone-density | /smarttools/tool-049-bone-density | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.050-mental-health | tool-050-mental-health | /smarttools/tool-050-mental-health | /smarttools/medical-monitoring/tool-050-mental-health | /smarttools/tool-050-mental-health | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.051-peptide-dosage-calculator | tool-051-peptide-dosage-calculator | /smarttools/tool-051-peptide-dosage-calculator | /smarttools/injection-formulation/tool-051-peptide-dosage-calculator | /smarttools/tool-051-peptide-dosage-calculator | injection-formulation | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.052-growth-hormone-protocol-planner | tool-052-growth-hormone-protocol-planner | /smarttools/tool-052-growth-hormone-protocol-planner | /smarttools/hormonal-health/tool-052-growth-hormone-protocol-planner | /smarttools/tool-052-growth-hormone-protocol-planner | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.055-insulin-sensitivity-optimizer | tool-055-insulin-sensitivity-optimizer | /smarttools/tool-055-insulin-sensitivity-optimizer | /smarttools/medical-monitoring/tool-055-insulin-sensitivity-optimizer | /smarttools/tool-055-insulin-sensitivity-optimizer | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.056-mini-pct-calculator | tool-056-mini-pct-calculator | /smarttools/tool-056-mini-pct-calculator | /smarttools/cycle-management/tool-056-mini-pct-calculator | /smarttools/tool-056-mini-pct-calculator | cycle-management | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.057-free-testosterone-manager | tool-057-free-testosterone-manager | /smarttools/tool-057-free-testosterone-manager | /smarttools/hormonal-health/tool-057-free-testosterone-manager | /smarttools/tool-057-free-testosterone-manager | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.058-androgenic-balance-calculator | tool-058-androgenic-balance-calculator | /smarttools/tool-058-androgenic-balance-calculator | /smarttools/hormonal-health/tool-058-androgenic-balance-calculator | /smarttools/tool-058-androgenic-balance-calculator | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.059-androgen-receptor-optimizer | tool-059-androgen-receptor-optimizer | /smarttools/tool-059-androgen-receptor-optimizer | /smarttools/hormonal-health/tool-059-androgen-receptor-optimizer | /smarttools/tool-059-androgen-receptor-optimizer | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.060-5-alpha-conversion-calculator | tool-060-5-alpha-conversion-calculator | /smarttools/tool-060-5-alpha-conversion-calculator | /smarttools/pharmacokinetics/tool-060-5-alpha-conversion-calculator | /smarttools/tool-060-5-alpha-conversion-calculator | pharmacokinetics | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.061-hair-loss-tracker | tool-061-hair-loss-tracker | /smarttools/tool-061-hair-loss-tracker | /smarttools/medical-monitoring/tool-061-hair-loss-tracker | /smarttools/tool-061-hair-loss-tracker | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.062-prostate-health-manager | tool-062-prostate-health-manager | /smarttools/tool-062-prostate-health-manager | /smarttools/medical-monitoring/tool-062-prostate-health-manager | /smarttools/tool-062-prostate-health-manager | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.063-testicular-suppression-calculator | tool-063-testicular-suppression-calculator | /smarttools/tool-063-testicular-suppression-calculator | /smarttools/hormonal-health/tool-063-testicular-suppression-calculator | /smarttools/tool-063-testicular-suppression-calculator | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.064-sperm-production-optimizer | tool-064-sperm-production-optimizer | /smarttools/tool-064-sperm-production-optimizer | /smarttools/reproductive-wellbeing/tool-064-sperm-production-optimizer | /smarttools/tool-064-sperm-production-optimizer | reproductive-wellbeing | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.065-aromatase-conversion-calculator | tool-065-aromatase-conversion-calculator | /smarttools/tool-065-aromatase-conversion-calculator | /smarttools/pharmacokinetics/tool-065-aromatase-conversion-calculator | /smarttools/tool-065-aromatase-conversion-calculator | pharmacokinetics | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.066-estrogen-sensitivity-manager | tool-066-estrogen-sensitivity-manager | /smarttools/tool-066-estrogen-sensitivity-manager | /smarttools/hormonal-health/tool-066-estrogen-sensitivity-manager | /smarttools/tool-066-estrogen-sensitivity-manager | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.067-estrogen-balance-calculator | tool-067-estrogen-balance-calculator | /smarttools/tool-067-estrogen-balance-calculator | /smarttools/hormonal-health/tool-067-estrogen-balance-calculator | /smarttools/tool-067-estrogen-balance-calculator | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.068-gynecomastia-tracker | tool-068-gynecomastia-tracker | /smarttools/tool-068-gynecomastia-tracker | /smarttools/medical-monitoring/tool-068-gynecomastia-tracker | /smarttools/tool-068-gynecomastia-tracker | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.069-detoxification-optimizer | tool-069-detoxification-optimizer | /smarttools/tool-069-detoxification-optimizer | /smarttools/medical-monitoring/tool-069-detoxification-optimizer | /smarttools/tool-069-detoxification-optimizer | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.070-oxidative-stress-calculator | tool-070-oxidative-stress-calculator | /smarttools/tool-070-oxidative-stress-calculator | /smarttools/medical-monitoring/tool-070-oxidative-stress-calculator | /smarttools/tool-070-oxidative-stress-calculator | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.071-antioxidant-manager | tool-071-antioxidant-manager | /smarttools/tool-071-antioxidant-manager | /smarttools/medical-monitoring/tool-071-antioxidant-manager | /smarttools/tool-071-antioxidant-manager | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.072-systemic-inflammation-calculator | tool-072-systemic-inflammation-calculator | /smarttools/tool-072-systemic-inflammation-calculator | /smarttools/medical-monitoring/tool-072-systemic-inflammation-calculator | /smarttools/tool-072-systemic-inflammation-calculator | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.073-immune-system-optimizer | tool-073-immune-system-optimizer | /smarttools/tool-073-immune-system-optimizer | /smarttools/medical-monitoring/tool-073-immune-system-optimizer | /smarttools/tool-073-immune-system-optimizer | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.074-blood-pressure-tracker | tool-074-blood-pressure-tracker | /smarttools/tool-074-blood-pressure-tracker | /smarttools/medical-monitoring/tool-074-blood-pressure-tracker | /smarttools/tool-074-blood-pressure-tracker | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.075-arterial-health-manager | tool-075-arterial-health-manager | /smarttools/tool-075-arterial-health-manager | /smarttools/medical-monitoring/tool-075-arterial-health-manager | /smarttools/tool-075-arterial-health-manager | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.076-blood-viscosity-calculator | tool-076-blood-viscosity-calculator | /smarttools/tool-076-blood-viscosity-calculator | /smarttools/medical-monitoring/tool-076-blood-viscosity-calculator | /smarttools/tool-076-blood-viscosity-calculator | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.077-nitric-oxide-optimizer | tool-077-nitric-oxide-optimizer | /smarttools/tool-077-nitric-oxide-optimizer | /smarttools/medical-monitoring/tool-077-nitric-oxide-optimizer | /smarttools/tool-077-nitric-oxide-optimizer | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.078-endothelial-health-manager | tool-078-endothelial-health-manager | /smarttools/tool-078-endothelial-health-manager | /smarttools/medical-monitoring/tool-078-endothelial-health-manager | /smarttools/tool-078-endothelial-health-manager | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.079-fat-metabolism-calculator | tool-079-fat-metabolism-calculator | /smarttools/tool-079-fat-metabolism-calculator | /smarttools/body-composition/tool-079-fat-metabolism-calculator | /smarttools/tool-079-fat-metabolism-calculator | body-composition | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.080-mitochondrial-optimizer | tool-080-mitochondrial-optimizer | /smarttools/tool-080-mitochondrial-optimizer | /smarttools/medical-monitoring/tool-080-mitochondrial-optimizer | /smarttools/tool-080-mitochondrial-optimizer | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.081-cellular-aging-calculator | tool-081-cellular-aging-calculator | /smarttools/tool-081-cellular-aging-calculator | /smarttools/medical-monitoring/tool-081-cellular-aging-calculator | /smarttools/tool-081-cellular-aging-calculator | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.082-telomere-manager | tool-082-telomere-manager | /smarttools/tool-082-telomere-manager | /smarttools/medical-monitoring/tool-082-telomere-manager | /smarttools/tool-082-telomere-manager | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.083-anti-aging-inflammation-calculator | tool-083-anti-aging-inflammation-calculator | /smarttools/tool-083-anti-aging-inflammation-calculator | /smarttools/medical-monitoring/tool-083-anti-aging-inflammation-calculator | /smarttools/tool-083-anti-aging-inflammation-calculator | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.084-cognitive-enhancer | tool-084-cognitive-enhancer | /smarttools/tool-084-cognitive-enhancer | /smarttools/medical-monitoring/tool-084-cognitive-enhancer | /smarttools/tool-084-cognitive-enhancer | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.085-sleep-quality-manager | tool-085-sleep-quality-manager | /smarttools/tool-085-sleep-quality-manager | /smarttools/medical-monitoring/tool-085-sleep-quality-manager | /smarttools/tool-085-sleep-quality-manager | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.086-cortisol-stress-calculator | tool-086-cortisol-stress-calculator | /smarttools/tool-086-cortisol-stress-calculator | /smarttools/hormonal-health/tool-086-cortisol-stress-calculator | /smarttools/tool-086-cortisol-stress-calculator | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.087-mood-optimizer | tool-087-mood-optimizer | /smarttools/tool-087-mood-optimizer | /smarttools/medical-monitoring/tool-087-mood-optimizer | /smarttools/tool-087-mood-optimizer | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.088-dopamine-tracker | tool-088-dopamine-tracker | /smarttools/tool-088-dopamine-tracker | /smarttools/medical-monitoring/tool-088-dopamine-tracker | /smarttools/tool-088-dopamine-tracker | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.089-serotonin-manager | tool-089-serotonin-manager | /smarttools/tool-089-serotonin-manager | /smarttools/medical-monitoring/tool-089-serotonin-manager | /smarttools/tool-089-serotonin-manager | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.090-female-hormone-balance-calculator | tool-090-female-hormone-balance-calculator | /smarttools/tool-090-female-hormone-balance-calculator | /smarttools/hormonal-health/tool-090-female-hormone-balance-calculator | /smarttools/tool-090-female-hormone-balance-calculator | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.091-female-health-optimizer | tool-091-female-health-optimizer | /smarttools/tool-091-female-health-optimizer | /smarttools/hormonal-health/tool-091-female-health-optimizer | /smarttools/tool-091-female-health-optimizer | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.092-female-dosage-calculator | tool-092-female-dosage-calculator | /smarttools/tool-092-female-dosage-calculator | /smarttools/hormonal-health/tool-092-female-dosage-calculator | /smarttools/tool-092-female-dosage-calculator | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.093-menstrual-cycle-manager | tool-093-menstrual-cycle-manager | /smarttools/tool-093-menstrual-cycle-manager | /smarttools/reproductive-wellbeing/tool-093-menstrual-cycle-manager | /smarttools/tool-093-menstrual-cycle-manager | reproductive-wellbeing | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.094-pregnancy-risk-calculator | tool-094-pregnancy-risk-calculator | /smarttools/tool-094-pregnancy-risk-calculator | /smarttools/reproductive-wellbeing/tool-094-pregnancy-risk-calculator | /smarttools/tool-094-pregnancy-risk-calculator | reproductive-wellbeing | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.095-skin-health-optimizer | tool-095-skin-health-optimizer | /smarttools/tool-095-skin-health-optimizer | /smarttools/medical-monitoring/tool-095-skin-health-optimizer | /smarttools/tool-095-skin-health-optimizer | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.096-hair-nail-tracker | tool-096-hair-nail-tracker | /smarttools/tool-096-hair-nail-tracker | /smarttools/medical-monitoring/tool-096-hair-nail-tracker | /smarttools/tool-096-hair-nail-tracker | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.097-hydration-balance-calculator | tool-097-hydration-balance-calculator | /smarttools/tool-097-hydration-balance-calculator | /smarttools/nutrition/tool-097-hydration-balance-calculator | /smarttools/tool-097-hydration-balance-calculator | nutrition | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.098-sodium-potassium-manager | tool-098-sodium-potassium-manager | /smarttools/tool-098-sodium-potassium-manager | /smarttools/nutrition/tool-098-sodium-potassium-manager | /smarttools/tool-098-sodium-potassium-manager | nutrition | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.099-digestive-health-optimizer | tool-099-digestive-health-optimizer | /smarttools/tool-099-digestive-health-optimizer | /smarttools/nutrition/tool-099-digestive-health-optimizer | /smarttools/tool-099-digestive-health-optimizer | nutrition | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.100-comprehensive-report-generator | tool-100-comprehensive-report-generator | /smarttools/tool-100-comprehensive-report-generator | /smarttools/platform-ai/tool-100-comprehensive-report-generator | /smarttools/tool-100-comprehensive-report-generator | platform-ai | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.101-sarm-to-aas-transition-bridge-predictor | tool-101-sarm-to-aas-transition-bridge-predictor | /smarttools/tool-101-sarm-to-aas-transition-bridge-predictor | /smarttools/cycle-management/tool-101-sarm-to-aas-transition-bridge-predictor | /smarttools/tool-101-sarm-to-aas-transition-bridge-predictor | cycle-management | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.102-subcutaneous-vs-intramuscular-pk-modeler | tool-102-subcutaneous-vs-intramuscular-pk-modeler | /smarttools/tool-102-subcutaneous-vs-intramuscular-pk-modeler | /smarttools/pharmacokinetics/tool-102-subcutaneous-vs-intramuscular-pk-modeler | /smarttools/tool-102-subcutaneous-vs-intramuscular-pk-modeler | pharmacokinetics | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.103-renal-function-hydration-index | tool-103-renal-function-hydration-index | /smarttools/tool-103-renal-function-hydration-index | /smarttools/medical-monitoring/tool-103-renal-function-hydration-index | /smarttools/tool-103-renal-function-hydration-index | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.104-thyroid-metabolic-rate-dynamics | tool-104-thyroid-metabolic-rate-dynamics | /smarttools/tool-104-thyroid-metabolic-rate-dynamics | /smarttools/hormonal-health/tool-104-thyroid-metabolic-rate-dynamics | /smarttools/tool-104-thyroid-metabolic-rate-dynamics | hormonal-health | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.105-ai-health-data-fusion-hub | tool-105-ai-health-data-fusion-hub | /smarttools/tool-105-ai-health-data-fusion-hub | /smarttools/platform-ai/tool-105-ai-health-data-fusion-hub | /smarttools/tool-105-ai-health-data-fusion-hub | platform-ai | category map + dynamic route | Y | Y | Y | Y | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.106-glycogen-supercompensation-water-modeler | tool-106-glycogen-supercompensation-water-modeler | /smarttools/tool-106-glycogen-supercompensation-water-modeler | /smarttools/nutrition/tool-106-glycogen-supercompensation-water-modeler | /smarttools/tool-106-glycogen-supercompensation-water-modeler | nutrition | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.107-contest-prep-peak-week-manipulator | tool-107-contest-prep-peak-week-manipulator | /smarttools/tool-107-contest-prep-peak-week-manipulator | /smarttools/cycle-management/tool-107-contest-prep-peak-week-manipulator | /smarttools/tool-107-contest-prep-peak-week-manipulator | cycle-management | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.108-ai-body-composition-vision-engine | tool-108-ai-body-composition-vision-engine | /smarttools/tool-108-ai-body-composition-vision-engine | /smarttools/body-composition/tool-108-ai-body-composition-vision-engine | /smarttools/tool-108-ai-body-composition-vision-engine | body-composition | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.109-competition-readiness-posing-os | tool-109-competition-readiness-posing-os | /smarttools/tool-109-competition-readiness-posing-os | /smarttools/cycle-management/tool-109-competition-readiness-posing-os | /smarttools/tool-109-competition-readiness-posing-os | cycle-management | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.110-ai-meal-vision-scanner | tool-110-ai-meal-vision-scanner | /smarttools/tool-110-ai-meal-vision-scanner | /smarttools/nutrition/tool-110-ai-meal-vision-scanner | /smarttools/tool-110-ai-meal-vision-scanner | nutrition | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.111-smart-food-macro-substitution | tool-111-smart-food-macro-substitution | /smarttools/nutrition/tool-111-smart-food-macro-substitution | /smarttools/nutrition/tool-111-smart-food-macro-substitution | none | nutrition | category map + dynamic route | Y | Y | Y | N | IMPLEMENTED BUT UNVERIFIED |
| mrx.tool.112-food-quality-micronutrient-diversity-score | tool-112-food-quality-micronutrient-diversity-score | /smarttools/nutrition/tool-112-food-quality-micronutrient-diversity-score | /smarttools/nutrition/tool-112-food-quality-micronutrient-diversity-score | none | nutrition | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.113-ai-grocery-basket-meal-cost-optimizer | tool-113-ai-grocery-basket-meal-cost-optimizer | /smarttools/nutrition/tool-113-ai-grocery-basket-meal-cost-optimizer | /smarttools/nutrition/tool-113-ai-grocery-basket-meal-cost-optimizer | none | nutrition | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.114-restaurant-macro-navigator | tool-114-restaurant-macro-navigator | /smarttools/nutrition/tool-114-restaurant-macro-navigator | /smarttools/nutrition/tool-114-restaurant-macro-navigator | none | nutrition | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.115-supplement-evidence-bio-stack-navigator | tool-115-supplement-evidence-bio-stack-navigator | /smarttools/nutrition/tool-115-supplement-evidence-bio-stack-navigator | /smarttools/nutrition/tool-115-supplement-evidence-bio-stack-navigator | none | nutrition | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.116-nutrition-gap-fasting-window-optimizer | tool-116-nutrition-gap-fasting-window-optimizer | /smarttools/nutrition/tool-116-nutrition-gap-fasting-window-optimizer | /smarttools/nutrition/tool-116-nutrition-gap-fasting-window-optimizer | none | nutrition | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.117-intra-workout-nutrient-volumizer | tool-117-intra-workout-nutrient-volumizer | /smarttools/nutrition/tool-117-intra-workout-nutrient-volumizer | /smarttools/nutrition/tool-117-intra-workout-nutrient-volumizer | none | nutrition | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.118-cns-recovery-score | tool-118-cns-recovery-score | /smarttools/training-recovery/tool-118-cns-recovery-score | /smarttools/training-recovery/tool-118-cns-recovery-score | none | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.119-training-volume-hypertrophy-index | tool-119-training-volume-hypertrophy-index | /smarttools/training-recovery/tool-119-training-volume-hypertrophy-index | /smarttools/training-recovery/tool-119-training-volume-hypertrophy-index | none | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.120-progressive-overload-predictor | tool-120-progressive-overload-predictor | /smarttools/training-recovery/tool-120-progressive-overload-predictor | /smarttools/training-recovery/tool-120-progressive-overload-predictor | none | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.121-muscle-group-recovery-modeler | tool-121-muscle-group-recovery-modeler | /smarttools/training-recovery/tool-121-muscle-group-recovery-modeler | /smarttools/training-recovery/tool-121-muscle-group-recovery-modeler | none | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.122-rpe-rir-1rm-velocity-modeler | tool-122-rpe-rir-1rm-velocity-modeler | /smarttools/training-recovery/tool-122-rpe-rir-1rm-velocity-modeler | /smarttools/training-recovery/tool-122-rpe-rir-1rm-velocity-modeler | none | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.123-joint-stress-connective-tissue-index | tool-123-joint-stress-connective-tissue-index | /smarttools/training-recovery/tool-123-joint-stress-connective-tissue-index | /smarttools/training-recovery/tool-123-joint-stress-connective-tissue-index | none | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.124-deload-frequency-fatigue-modeler | tool-124-deload-frequency-fatigue-modeler | /smarttools/training-recovery/tool-124-deload-frequency-fatigue-modeler | /smarttools/training-recovery/tool-124-deload-frequency-fatigue-modeler | none | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.125-fiber-type-mechanical-tension-score | tool-125-fiber-type-mechanical-tension-score | /smarttools/training-recovery/tool-125-fiber-type-mechanical-tension-score | /smarttools/training-recovery/tool-125-fiber-type-mechanical-tension-score | none | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.053-insulin-conversion-calculator | tool-053-insulin-conversion-calculator | /smarttools/tool-053-insulin-conversion-calculator | /smarttools/hormonal-health/tool-053-insulin-conversion-calculator | /smarttools/tool-053-insulin-conversion-calculator | hormonal-health | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.054-glucose-tracker | tool-054-glucose-tracker | /smarttools/tool-054-glucose-tracker | /smarttools/medical-monitoring/tool-054-glucose-tracker | /smarttools/tool-054-glucose-tracker | medical-monitoring | category map + dynamic route | Y | Y | Y | Y | FILES PRESENT — FUNCTIONAL VERIFICATION NOT EVIDENCED |
| mrx.tool.bmi | bmi | /smarttools/bmi | /smarttools/body-composition/bmi | /smarttools/bmi redirect | body-composition | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.one-rep-max | one-rep-max | /smarttools/one-rep-max | /smarttools/training-recovery/one-rep-max | /smarttools/one-rep-max redirect | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.strength-standards | strength-standards | /smarttools/strength-standards | /smarttools/training-recovery/strength-standards | /smarttools/strength-standards redirect | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.rest-timer | rest-timer | /smarttools/rest-timer | /smarttools/training-recovery/rest-timer | /smarttools/rest-timer redirect | training-recovery | category map + dynamic route | Y | Y | Y | Y | TARGETED TESTS PASS |

## Quality gate evidence (generated)

Audit date: 2026-10-24T19:28:07+03:00
Branch: main
HEAD: 936e996a84b1a417f57946abb216eac57f2e4d85
Working tree: dirty (many untracked/modified files; no application-code changes made in this inventory update)

### TypeScript (`npx tsc --noEmit`)
Exit code: 1 (command reported `EXIT_CODE=False` in PowerShell; tsc emitted 8 diagnostics)
1. app/smarttools/bmr-tdee/page.tsx(8,83): error TS2322: Type 'string' is not assignable to type 'number'.
2. app/smarttools/protein-needs/page.tsx(8,39): error TS2345: Argument of type '{ weightKg: number; goal: "maintain"; }' is not assignable to parameter of type 'ProteinNeedsInput'. Property 'activityLevel' is missing in type '{ weightKg: number; goal: "maintain"; }' but required in type 'ProteinNeedsInput'.
3. app/smarttools/tool-111-smart-food-macro-substitution/page.tsx(6,34): error TS2307: Cannot find module '@/lib/core/adaptive-context.v7' or its corresponding type declarations.
4. app/smarttools/tool-111-smart-food-macro-substitution/page.tsx(7,38): error TS2307: Cannot find module '@/lib/engines/macro.v7' or its corresponding type declarations.
5. app/smarttools/tool-111-smart-food-macro-substitution/page.tsx(8,31): error TS2307: Cannot find module '@/lib/core/event-bus.v7' or its corresponding type declarations.
6. app/smarttools/tool-111-smart-food-macro-substitution/page.tsx(9,25): error TS2307: Cannot find module '@/components/tools/macro/MacroToolUI.v7' or its corresponding type declarations.
7. app/smarttools/water-intake/page.tsx(8,53): error TS2322: Type 'string' is not assignable to type 'number'.
8. lib/legacy-routes.ts(8,14): error TS2739: Type '{ home: string; ... }' is missing the following properties from type 'Record<Page, string>': bmi, "one-rep-max", "strength-standards", "rest-timer"

### Historical Tool 111 missing-module findings (superseded by current route audit)
- @/lib/core/adaptive-context.v7 (imported by app/smarttools/tool-111-smart-food-macro-substitution/page.tsx)
- @/lib/engines/macro.v7 (imported by app/smarttools/tool-111-smart-food-macro-substitution/page.tsx)
- @/lib/core/event-bus.v7 (imported by app/smarttools/tool-111-smart-food-macro-substitution/page.tsx)
- @/components/tools/macro/MacroToolUI.v7 (imported by app/smarttools/tool-111-smart-food-macro-substitution/page.tsx)

### Historical validate-tools snapshot
Command: npm run validate-tools
Exit code: 0
Historical result from the 2026-10-24 snapshot (not current): Catalogue: 159 outils (18 planned roadmap); Registry: 130 entrees; Filesystem verifie: 141/159; Erreurs: 0; tests/unit/validateTools.test.ts: 5 tests passed. Current result is recorded in the 2026-10-25 source-count reconciliation above.

### Test evidence
- Test-file existence does not prove tests run/passed. validate-tools ran 5 tests successfully. Other pilot/engine test files exist but were not executed in this inventory pass.
- Coverage: unavailable.
- Build: blocked by Tool 111 missing v7 modules.
## Crosswalk: TOOL_REGISTRY vs SMART_TOOLS_CATALOG

- Current set intersection contains 154 slugs present in both systems; the 12 remaining catalog slugs are catalog-only, and no registry slug is registry-only. Shared presence is a set overlap and does not establish that every record is a legacy alias.
- No deletion/merge/rename performed in this phase.
- Current local identity-count gap: 86 (252 target minus 166 local catalog/registry union). Exact approved-v7 slug mismatches are 247; these are different measures. See the evidence-backed crosswalk for identity classifications.

## Pilots reconciled
- BMI: components/tools/bmi-pilot.tsx + bmi-pilot.test.tsx (exists).
- One Rep Max: components/tools/one-rep-max-pilot.tsx + test (exists).
- Strength Standards: components/tools/strength-standards-pilot.tsx + test (exists).
- Rest Timer: components/tools/rest-timer-pilot.tsx + test (exists).
- Batch 1-5 pilots exist under their own names; do not classify as missing without path/route checks.

## Route distinction
- Catalog href: entry.href from catalog/registry.
- Canonical route: /smarttools/<category>/<slug> when category mapping exists; otherwise href.
- Legacy route: original standalone href or redirect source.

## Historical unresolved missing identities (superseded by current crosswalk)
- The list retained below belongs to an earlier 163-identity snapshot and is not a current identity classification.
- Use `docs/SMARTTOOLS_252_REGISTRY_IDENTITY_RECONCILIATION_AUDIT.md` and its 252-row crosswalk for current exact, conceptual, and unresolved classifications.

## Historical shared blockers (superseded where current evidence exists)
- These entries describe an earlier snapshot and are not current verification results.
- Current registry/catalog counts and validation output are given in the source-count reconciliation above; current project baseline and Macro v6 verification are recorded in `docs/GENIUS_TOOL_V3_BASELINE_AUDIT.md` and `docs/MACRO_V6_ENGINE_REPORT.md`.

## Approved 252-tool source and named identity gap

Approved source: `lib/engines/core/v6/tools.registry.v7.252.ts` (`TOOLS_REGISTRY_V7_252`), containing 252 numbered tool records.

Current local identity-count gap: 252 target - 166 catalog/registry union = 86. This numerical gap is not the same as the 247 approved-v7 slugs without an exact local slug.

Exact slug overlap between the approved source and current catalogs/registry: 5, recorded in the registry identity reconciliation report. The former count of 3 is superseded.

The remaining 247 approved IDs are not observed as exact slug identities in current catalogs/registry. Some may be conceptual equivalents of existing local identities; the crosswalk records those only as POSSIBLE_CONCEPTUAL_MATCH unless explicit alias evidence exists. No names or IDs were invented.

### Appendix: all 252 approved IDs
- body-fat
- lean-body-mass
- fat-mass-index
- ffmi
- ideal-body-weight
- waist-to-hip-ratio
- waist-to-height-ratio
- body-adiposity-index
- body-shape-index
- ponderal-index
- body-surface-area
- frame-size
- somatotype
- muscle-mass-percentage
- bone-mass
- body-water-percentage
- body-protein-percentage
- bmr
- tdee
- body-fat-distribution
- visceral-fat
- subcutaneous-fat
- limb-length-ratios
- sitting-height-ratio
- arm-span-to-height
- calorie
- macro-split
- protein-needs
- carb-cycling
- fat-needs
- fiber-needs
- meal-timing
- glycemic-load
- insulin-load
- thermic-effect-of-food
- alcohol-calories
- cheat-meal-planner
- refeed
- diet-break-planner
- reverse-dieting
- water-intake
- electrolyte-needs
- vitamin-mineral-needs
- supplement-dosage
- creatine-loading
- caffeine
- pre-workout-timing
- post-workout-nutrition
- intermittent-fasting-timer
- anabolic-window
- training-volume
- intensity
- rpe-to-1rm-converter
- rir
- progressive-overload-planner
- deload
- training-frequency-optimizer
- rest-period
- superset-planner
- drop-set
- myo-reps
- rest-pause
- cluster-sets
- german-volume-training
- 5x5
- 5-3-1
- nsuns
- training-split-generator
- weekly-volume-per-muscle
- effective-reps
- junk-volume-detector
- recovery-time
- sleep-need-for-recovery
- hrv-based-readiness
- acwr
- monotony-strain
- training-stress-score
- fatigue-accumulation
- overtraining-risk
- active-recovery-planner
- mobility-score
- symmetry-index
- injury-risk-predictor
- pain-scale-tracker
- rehab-timeline
- one-rep-max
- wilks-score
- dots-score
- ipf-points
- sinclair-coefficient
- relative-strength
- strength-standards
- power
- force
- work
- impulse-momentum
- rate-of-force-development
- reactive-strength-index
- rsi-modified
- jump-height-to-power
- sprint-speed-acceleration
- agility-t-test
- illinois-agility
- 40-yard-dash-converter
- vertical-jump-power
- broad-jump-power
- medicine-ball-throw
- wingate-power-test
- critical-power
- vo2max-estimator
- lactate-threshold
- heart-rate-zones
- pace
- running-power
- cycling-power-ftp
- golden-ratio-physique
- shoulder-to-waist-ratio
- chest-to-waist-ratio
- arm-to-waist-ratio
- leg-to-torso-ratio
- arm-length-to-height
- calf-to-bicep-ratio
- neck-to-arm-ratio
- physique-rating-scale
- bodybuilding-competition-score
- neuromuscular-performance-modeler
- daily-readiness-cause-explainer
- training-load-balance-acwr
- adaptive-training-program-planner
- plateau-detective-stagnation-analyzer
- transformation-forecast-engine
- pose-form-coach-vision
- rep-tempo-velocity-loss-analyzer
- mobility-symmetry-screen
- exercise-substitution-advisor
- physique-proportion-balance
- testosterone-to-epit-ratio
- free-testosterone
- shbg
- estradiol-management
- prolactin-risk
- hematocrit-hemoglobin-tracker
- blood-pressure-risk
- lipid-panel-analyzer
- liver-enzymes-analyzer
- kidney-function
- thyroid-panel
- insulin-sensitivity
- aromatization-risk
- pct-planner-recovery-timeline
- accumulation-half-life-simulator
- side-effect-tracker
- injection-site-rotator
- compound-stack-builder
- progress-tracker
- water-retention
- multi-compound-half-life
- injection-volume
- compound-half-life-stacker
- genetic-potential
- peptide-protocol-planner
- oral-cycle-planner
- trt-optimization-engine
- post-cycle-bloodwork-interpreter
- drug-interaction-checker-pro
- injection-pain-minimizer
- ester-conversion
- compound-stacking-synergy
- side-effect-early-warning
- cycle-cost
- cycle-length-optimizer
- bloodwork-trend-analyzer
- compound-clearance
- hormone-conversion
- injection-schedule-planner
- side-effect-probability
- stack-compatibility-checker
- dht-side-effect-predictor
- cycle-break-planner
- trt-lifetime
- fertility-preservation-guide
- cardiovascular-risk-assessor
- bone-density-optimizer
- mental-health-monitor
- peptide-dosage
- growth-hormone-protocol-planner
- insulin-conversion
- glucose-tracker
- androgenic-balance
- androgen-receptor-optimizer
- 5-alpha-conversion
- hair-loss-tracker
- prostate-health-manager
- testicular-suppression
- sperm-production-optimizer
- estrogen-sensitivity-manager
- gynecomastia-tracker
- detoxification-optimizer
- oxidative-stress
- antioxidant-manager
- systemic-inflammation
- immune-system-optimizer
- arterial-health-manager
- blood-viscosity
- nitric-oxide-optimizer
- endothelial-health-manager
- fat-metabolism
- mitochondrial-optimizer
- cellular-aging
- telomere-manager
- anti-aging-inflammation
- cognitive-enhancer
- cortisol-stress
- mood-optimizer
- dopamine-tracker
- serotonin-manager
- female-hormone-balance
- female-health-optimizer
- female-dosage
- menstrual-cycle-manager
- pregnancy-risk
- skin-health-optimizer
- hair-nail-tracker
- digestive-health-optimizer
- comprehensive-report-generator
- sarm-to-aas-transition-predictor
- subq-vs-im-pk-modeler
- health-data-fusion-hub
- glycogen-supercompensation-modeler
- peak-week-manipulator
- body-composition-vision-engine
- meal-vision-scanner
- food-substitution-engine
- food-quality-score
- grocery-basket-optimizer
- restaurant-macro-navigator
- intra-workout-volumizer
- fiber-type-adaptation-score
- peptide-reconstitution
- raw-powder-density-engine
- solvent-ratio
- dosage-unit-conversion-engine
- carrier-oil-viscosity-estimator
- purity-yield-estimator
- storage-stability-estimator
- homebrew-chemistry
- habit-intelligence-coach
- safety-gate-emergency-protocol
- scientific-evidence-explorer
- personal-fitness-memory-layer
- physique-trajectory-simulator
- command-center
1. Complete Batch 6 nutrition tools as planned.
2. Repair implemented-but-missing component/engine/schema tools.
3. Add missing intended tool identities to approved catalog with unique IDs.
4. Run validate-tools, tsc, eslint, tests; capture evidence before VERIFIED COMPLETE.

Stop for human review and approval.
## Tool 111 missing v7 modules
- @/lib/core/adaptive-context.v7
- @/lib/engines/macro.v7
- @/lib/core/event-bus.v7
- @/components/tools/macro/MacroToolUI.v7
## Reconciled raw-record crosswalk (generated)

| Slug (intended identity) | Source files | Raw occurrences |
|---|---|---:|
| aromatization-risk | lib/tools/registry.ts, lib/tools/smartToolsCatalog2.ts | 2 |
| bmi | lib/tools/registry.ts | 1 |
| bodyfat | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| cycle | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| genetic | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| halflife | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| hcg-serm-protocol | lib/tools/registry.ts, lib/tools/smartToolsCatalog2.ts | 2 |
| hpta-recovery | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| injection | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| lab | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| macro | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| master-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| multi-ester-pharmacokinetics | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| one-rep-max | lib/tools/registry.ts | 1 |
| pct-timing | lib/tools/registry.ts, lib/tools/smartToolsCatalog2.ts | 2 |
| rest-timer | lib/tools/registry.ts | 1 |
| strength-standards | lib/tools/registry.ts | 1 |
| timeline | lib/tools/registry.ts, lib/tools/smartToolsCatalog.ts | 2 |
| tool-006-estrogen-prolactin | lib/tools/registry.ts, lib/tools/smartToolsCatalog2.ts | 2 |
| tool-007-bloodwork-analyzer | lib/tools/registry.ts, lib/tools/smartToolsCatalog2.ts | 2 |
| tool-008-side-effect-tracker | lib/tools/registry.ts, lib/tools/smartToolsCatalog3.ts | 2 |
| tool-009-injection-site-rotator | lib/tools/registry.ts, lib/tools/smartToolsCatalog3.ts | 2 |
| tool-010-compound-stack-builder | lib/tools/registry.ts, lib/tools/smartToolsCatalog3.ts | 2 |
| tool-011-progress-tracker | lib/tools/registry.ts, lib/tools/smartToolsCatalog3.ts | 2 |
| tool-012-calorie-adjuster | lib/tools/registry.ts, lib/tools/smartToolsCatalog3.ts | 2 |
| tool-013-macro-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog3.ts | 2 |
| tool-014-water-retention | lib/tools/registry.ts, lib/tools/smartToolsCatalog3.ts | 2 |
| tool-015-shbg-modulator | lib/tools/registry.ts, lib/tools/smartToolsCatalog3.ts | 2 |
| tool-016-half-life-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog4.ts | 2 |
| tool-017-drug-interaction | lib/tools/registry.ts, lib/tools/smartToolsCatalog4.ts | 2 |
| tool-018-hpta-recovery | lib/tools/registry.ts, lib/tools/smartToolsCatalog4.ts | 2 |
| tool-019-cardio-monitor | lib/tools/registry.ts, lib/tools/smartToolsCatalog4.ts | 2 |
| tool-020-genetic-potential | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-021-peptide-protocol | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-022-half-life-stacker | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-023-trt-optimization | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-024-bloodwork-interpreter | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-025-drug-interaction-pro | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-026-injection-pain | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-027-ester-conversion | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-028-stacking-synergy | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-029-side-effect-early-warning | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-030-cycle-cost-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog5.ts | 2 |
| tool-031-cycle-length-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-032-advanced-pct-planner | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-033-bloodwork-trend-analyzer | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-034-compound-clearance | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-035-hormone-conversion | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-036-injection-schedule | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-037-side-effect-probability | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-038-stack-compatibility | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-039-liver-enzyme-tracker | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-040-lipid-profile-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-041-hematocrit-monitor | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-042-estrogen-management | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-043-prolactin-management | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-044-dht-side-effects | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-045-cycle-break-planner | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-046-trt-lifetime | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-047-fertility-preservation | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-048-cardiovascular-risk | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-049-bone-density | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-050-mental-health | lib/tools/registry.ts, lib/tools/smartToolsCatalog6.ts | 2 |
| tool-051-peptide-dosage-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-052-growth-hormone-protocol-planner | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-053-insulin-conversion-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-054-glucose-tracker | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-055-insulin-sensitivity-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-056-mini-pct-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-057-free-testosterone-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-058-androgenic-balance-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-059-androgen-receptor-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-060-5-alpha-conversion-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-061-hair-loss-tracker | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-062-prostate-health-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-063-testicular-suppression-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-064-sperm-production-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-065-aromatase-conversion-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-066-estrogen-sensitivity-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-067-estrogen-balance-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-068-gynecomastia-tracker | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-069-detoxification-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-070-oxidative-stress-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-071-antioxidant-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-072-systemic-inflammation-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-073-immune-system-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-074-blood-pressure-tracker | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-075-arterial-health-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog7.ts | 2 |
| tool-076-blood-viscosity-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-077-nitric-oxide-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-078-endothelial-health-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-079-fat-metabolism-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-080-mitochondrial-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-081-cellular-aging-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-082-telomere-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-083-anti-aging-inflammation-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-084-cognitive-enhancer | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-085-sleep-quality-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-086-cortisol-stress-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-087-mood-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-088-dopamine-tracker | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-089-serotonin-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-090-female-hormone-balance-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-091-female-health-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-092-female-dosage-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-093-menstrual-cycle-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-094-pregnancy-risk-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-095-skin-health-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-096-hair-nail-tracker | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-097-hydration-balance-calculator | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-098-sodium-potassium-manager | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-099-digestive-health-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-100-comprehensive-report-generator | lib/tools/registry.ts, lib/tools/smartToolsCatalog8.ts | 2 |
| tool-101-sarm-to-aas-transition-bridge-predictor | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-102-subcutaneous-vs-intramuscular-pk-modeler | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-103-renal-function-hydration-index | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-104-thyroid-metabolic-rate-dynamics | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-105-ai-health-data-fusion-hub | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-106-glycogen-supercompensation-water-modeler | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-107-contest-prep-peak-week-manipulator | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-108-ai-body-composition-vision-engine | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-109-competition-readiness-posing-os | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-110-ai-meal-vision-scanner | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-111-smart-food-macro-substitution | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-112-food-quality-micronutrient-diversity-score | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-113-ai-grocery-basket-meal-cost-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-114-restaurant-macro-navigator | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-115-supplement-evidence-bio-stack-navigator | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-116-nutrition-gap-fasting-window-optimizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-117-intra-workout-nutrient-volumizer | lib/tools/registry.ts, lib/tools/smartToolsCatalog9.ts | 2 |
| tool-118-cns-recovery-score | lib/tools/smartToolsCatalog9.ts | 1 |
| tool-119-training-volume-hypertrophy-index | lib/tools/smartToolsCatalog9.ts | 1 |
| tool-120-progressive-overload-predictor | lib/tools/smartToolsCatalog9.ts | 1 |
| tool-121-muscle-group-recovery-modeler | lib/tools/smartToolsCatalog9.ts | 1 |
| tool-122-rpe-rir-1rm-velocity-modeler | lib/tools/smartToolsCatalog9.ts | 1 |
| tool-123-joint-stress-connective-tissue-index | lib/tools/smartToolsCatalog9.ts | 1 |
| tool-124-deload-frequency-fatigue-modeler | lib/tools/smartToolsCatalog9.ts | 1 |
| tool-125-fiber-type-mechanical-tension-score | lib/tools/smartToolsCatalog9.ts | 1 |
| tool-126-neuromuscular-explosiveness-modeler | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-127-ai-daily-readiness-explainer | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-128-training-load-acute-chronic-ratio | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-129-ai-adaptive-training-planner | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-130-ai-plateau-detective | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-131-transformation-forecast-trajectory-engine | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-132-ai-pose-form-coach | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-133-rep-tempo-velocity-loss-analyzer | lib/tools/smartToolsCatalog10.ts | lib/tools/engines/tool-131-136-batch.test.ts; components/tools/tool-131-136-batch.dom.test.tsx |
| tool-134-mobility-movement-symmetry-screen | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-135-exercise-substitution-ai | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-136-physique-golden-ratio-score | lib/tools/smartToolsCatalog10.ts | lib/tools/engines/tool-131-136-batch.test.ts; components/tools/tool-131-136-batch.dom.test.tsx |
| tool-137-peptide-hormone-reconstitution-calculator | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-138-raw-powder-density-oil-formulation-engine | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-139-solvent-emulsifier-ratio-calculator | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-140-dosage-unit-conversion-engine | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-141-carrier-oil-viscosity-syringe-pressure | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-142-compound-purity-active-yield-estimator | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-143-storage-stability-thermal-degradation-estimator | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-144-homebrew-chemistry-calculator | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-145-habit-intelligence-consistency-coach | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-146-ai-safety-gate-emergency-protocol | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-147-scientific-evidence-explorer | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-148-personal-fitness-memory-layer | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-149-physique-trajectory-simulator | lib/tools/smartToolsCatalog10.ts | 1 |
| tool-150-ai-performance-command-center | lib/tools/smartToolsCatalog10.ts | 1 |

Total unique identities: 163
Total raw records: 289
## Path evidence (generated)

| Slug | componentPath | enginePath | schemaPath | testPath |
|---|---|---|---|---|
| aromatization-risk | components/tools/aromatization-risk.tsx | lib/tools/engines/aromatization-risk.ts | lib/tools/schemas/aromatization-risk.ts | lib/tools/engines/aromatization-risk.test.ts |
| bmi | components/tools/bmi-pilot.tsx | lib/tools/engines/bmi.v6.ts | MISSING | components/tools/bmi-pilot.test.tsx |
| bodyfat | components/tools/bodyfat.tsx | lib/tools/engines/bodyfat.v6.ts | lib/tools/schemas/bodyfat.ts | components/tools/bodyfat-pilot.test.tsx |
| cycle | components/tools/cycle.tsx | lib/tools/engines/cycle.ts | lib/tools/schemas/cycle.ts | MISSING |
| genetic | components/tools/genetic.tsx | lib/tools/engines/genetic.ts | lib/tools/schemas/genetic.ts | MISSING |
| halflife | components/tools/halflife.tsx | lib/tools/engines/halflife.ts | lib/tools/schemas/halflife.ts | MISSING |
| hcg-serm-protocol | components/tools/hcg-serm-protocol.tsx | lib/tools/engines/hcg-serm-protocol.ts | lib/tools/schemas/hcg-serm-protocol.ts | lib/tools/engines/hcg-serm-protocol.test.ts |
| hpta-recovery | components/tools/hpta-recovery.tsx | lib/tools/engines/hpta-recovery.ts | lib/tools/schemas/hpta-recovery.ts | lib/tools/engines/hpta-recovery.test.ts |
| injection | components/tools/injection.tsx | lib/tools/engines/injection.ts | lib/tools/schemas/injection.ts | MISSING |
| lab | components/tools/lab.tsx | lib/tools/engines/lab.ts | lib/tools/schemas/lab.ts | MISSING |
| macro | components/tools/macro-pilot.tsx | lib/tools/engines/macro.v6.ts | lib/tools/schemas/macro.ts | lib/tools/engines/macro.v6.test.ts; components/tools/macro-pilot.test.tsx |
| master-calculator | components/tools/master-calculator.tsx | lib/tools/engines/master-calculator.ts | lib/tools/schemas/master-calculator.ts | MISSING |
| multi-ester-pharmacokinetics | components/tools/multi-ester-pharmacokinetics.tsx | lib/tools/engines/multi-ester-pharmacokinetics.ts | lib/tools/schemas/multi-ester-pharmacokinetics.ts | components/tools/multi-ester-pharmacokinetics.test.tsx |
| one-rep-max | components/tools/one-rep-max-pilot.tsx | lib/tools/engines/one-rep-max.v6.ts | MISSING | components/tools/one-rep-max-pilot.test.tsx |
| pct-timing | components/tools/pct-timing.tsx | lib/tools/engines/pct-timing.ts | lib/tools/schemas/pct-timing.ts | lib/tools/engines/pct-timing.test.ts |
| rest-timer | components/tools/rest-timer-pilot.tsx | lib/tools/engines/rest-timer.v6.ts | MISSING | components/tools/rest-timer-pilot.test.tsx |
| strength-standards | components/tools/strength-standards-pilot.tsx | lib/tools/engines/strength-standards.v6.ts | MISSING | components/tools/strength-standards-pilot.test.tsx |
| timeline | components/tools/timeline.tsx | lib/tools/engines/timeline.ts | lib/tools/schemas/timeline.ts | lib/tools/engines/timeline.test.ts |
| tool-006-estrogen-prolactin | components/tools/tool-006-estrogen-prolactin.tsx | lib/tools/engines/tool-006-estrogen-prolactin.ts | lib/tools/schemas/tool-006-estrogen-prolactin.ts | MISSING |
| tool-007-bloodwork-analyzer | components/tools/tool-007-bloodwork-analyzer.tsx | lib/tools/engines/tool-007-bloodwork-analyzer.ts | lib/tools/schemas/tool-007-bloodwork-analyzer.ts | MISSING |
| tool-008-side-effect-tracker | components/tools/tool-008-side-effect-tracker.tsx | lib/tools/engines/tool-008-side-effect-tracker.ts | lib/tools/schemas/tool-008-side-effect-tracker.ts | MISSING |
| tool-009-injection-site-rotator | components/tools/tool-009-injection-site-rotator.tsx | lib/tools/engines/tool-009-injection-site-rotator.ts | lib/tools/schemas/tool-009-injection-site-rotator.ts | MISSING |
| tool-010-compound-stack-builder | components/tools/tool-010-compound-stack-builder.tsx | lib/tools/engines/tool-010-compound-stack-builder.ts | lib/tools/schemas/tool-010-compound-stack-builder.ts | MISSING |
| tool-011-progress-tracker | components/tools/tool-011-progress-tracker.tsx | lib/tools/engines/tool-011-progress-tracker.ts | lib/tools/schemas/tool-011-progress-tracker.ts | MISSING |
| tool-012-calorie-adjuster | components/tools/tool-012-calorie-adjuster.tsx | lib/tools/engines/tool-012-calorie-adjuster.ts | lib/tools/schemas/tool-012-calorie-adjuster.ts | MISSING |
| tool-013-macro-optimizer | components/tools/tool-013-macro-optimizer.tsx | lib/tools/engines/tool-013-macro-optimizer.ts | lib/tools/schemas/tool-013-macro-optimizer.ts | MISSING |
| tool-014-water-retention | components/tools/tool-014-water-retention.tsx | lib/tools/engines/tool-014-water-retention.ts | lib/tools/schemas/tool-014-water-retention.ts | MISSING |
| tool-015-shbg-modulator | components/tools/tool-015-shbg-modulator.tsx | lib/tools/engines/tool-015-shbg-modulator.ts | lib/tools/schemas/tool-015-shbg-modulator.ts | MISSING |
| tool-016-half-life-calculator | components/tools/tool-016-half-life-calculator.tsx | lib/tools/engines/tool-016-half-life-calculator.ts | lib/tools/schemas/tool-016-half-life-calculator.ts | MISSING |
| tool-017-drug-interaction | components/tools/tool-017-drug-interaction.tsx | lib/tools/engines/tool-017-drug-interaction.ts | lib/tools/schemas/tool-017-drug-interaction.ts | MISSING |
| tool-018-hpta-recovery | components/tools/tool-018-hpta-recovery.tsx | lib/tools/engines/tool-018-hpta-recovery.ts | lib/tools/schemas/tool-018-hpta-recovery.ts | MISSING |
| tool-019-cardio-monitor | components/tools/tool-019-cardio-monitor.tsx | lib/tools/engines/tool-019-cardio-monitor.ts | lib/tools/schemas/tool-019-cardio-monitor.ts | MISSING |
| tool-020-genetic-potential | components/tools/tool-020-genetic-potential.tsx | lib/tools/engines/tool-020-genetic-potential.ts | lib/tools/schemas/tool-020-genetic-potential.ts | MISSING |
| tool-021-peptide-protocol | components/tools/tool-021-peptide-protocol.tsx | lib/tools/engines/tool-021-peptide-protocol.ts | lib/tools/schemas/tool-021-peptide-protocol.ts | MISSING |
| tool-022-half-life-stacker | components/tools/tool-022-half-life-stacker.tsx | lib/tools/engines/tool-022-half-life-stacker.ts | lib/tools/schemas/tool-022-half-life-stacker.ts | lib/tools/engines/tool-022-half-life-stacker.test.ts; components/tools/tool-022-half-life-stacker.test.tsx |
| tool-023-trt-optimization | components/tools/tool-023-trt-optimization.tsx | lib/tools/engines/tool-023-trt-optimization.ts | lib/tools/schemas/tool-023-trt-optimization.ts | lib/tools/engines/tool-023-trt-optimization.test.ts |
| tool-024-bloodwork-interpreter | components/tools/tool-024-bloodwork-interpreter.tsx | lib/tools/engines/tool-024-bloodwork-interpreter.ts | lib/tools/schemas/tool-024-bloodwork-interpreter.ts | MISSING |
| tool-025-drug-interaction-pro | components/tools/tool-025-drug-interaction-pro.tsx | lib/tools/engines/tool-025-drug-interaction-pro.ts | lib/tools/schemas/tool-025-drug-interaction-pro.ts | MISSING |
| tool-026-injection-pain | components/tools/tool-026-injection-pain.tsx | lib/tools/engines/tool-026-injection-pain.ts | lib/tools/schemas/tool-026-injection-pain.ts | MISSING |
| tool-027-ester-conversion | components/tools/tool-027-ester-conversion.tsx | lib/tools/engines/tool-027-ester-conversion.ts | lib/tools/schemas/tool-027-ester-conversion.ts | MISSING |
| tool-028-stacking-synergy | components/tools/tool-028-stacking-synergy.tsx | lib/tools/engines/tool-028-stacking-synergy.ts | lib/tools/schemas/tool-028-stacking-synergy.ts | MISSING |
| tool-029-side-effect-early-warning | components/tools/tool-029-side-effect-early-warning.tsx | lib/tools/engines/tool-029-side-effect-early-warning.ts | lib/tools/schemas/tool-029-side-effect-early-warning.ts | MISSING |
| tool-030-cycle-cost-calculator | components/tools/tool-030-cycle-cost-calculator.tsx | lib/tools/engines/tool-030-cycle-cost-calculator.ts | lib/tools/schemas/tool-030-cycle-cost-calculator.ts | lib/tools/engines/tool-030-cycle-cost-calculator.test.ts; components/tools/tool-030-cycle-cost-calculator.test.tsx |
| tool-031-cycle-length-optimizer | components/tools/tool-031-cycle-length-optimizer.tsx | lib/tools/engines/tool-031-cycle-length-optimizer.ts | lib/tools/schemas/tool-031-cycle-length-optimizer.ts | lib/tools/engines/tool-031-cycle-length-optimizer.test.ts |
| tool-032-advanced-pct-planner | components/tools/tool-032-advanced-pct-planner.tsx | lib/tools/engines/tool-032-advanced-pct-planner.ts | lib/tools/schemas/tool-032-advanced-pct-planner.ts | lib/tools/engines/tool-032-advanced-pct-planner.test.ts |
| tool-033-bloodwork-trend-analyzer | components/tools/tool-033-bloodwork-trend-analyzer.tsx | lib/tools/engines/tool-033-bloodwork-trend-analyzer.ts | lib/tools/schemas/tool-033-bloodwork-trend-analyzer.ts | lib/tools/engines/tool-033-bloodwork-trend-analyzer.test.ts; components/tools/tool-033-bloodwork-trend-analyzer.test.tsx; lib/tools/adapters/tool-031-035-batch.test.ts |
| tool-034-compound-clearance | components/tools/tool-034-compound-clearance.tsx | lib/tools/engines/tool-034-compound-clearance.ts | lib/tools/schemas/tool-034-compound-clearance.ts | lib/tools/engines/tool-034-compound-clearance.test.ts; components/tools/tool-034-compound-clearance.test.tsx; lib/tools/adapters/tool-031-035-batch.test.ts |
| tool-035-hormone-conversion | components/tools/tool-035-hormone-conversion.tsx | lib/tools/engines/tool-035-hormone-conversion.ts | lib/tools/schemas/tool-035-hormone-conversion.ts | lib/tools/engines/tool-035-hormone-conversion.test.ts; components/tools/tool-035-hormone-conversion.test.tsx; lib/tools/adapters/tool-031-035-batch.test.ts |
| tool-036-injection-schedule | components/tools/tool-036-injection-schedule.tsx | lib/tools/engines/tool-036-injection-schedule.ts | lib/tools/schemas/tool-036-injection-schedule.ts | components/tools/tool-036-injection-schedule.test.tsx |
| tool-037-side-effect-probability | components/tools/tool-037-side-effect-probability.tsx | lib/tools/engines/tool-037-side-effect-probability.ts | lib/tools/schemas/tool-037-side-effect-probability.ts | lib/tools/engines/tool-037-side-effect-probability.test.ts |
| tool-038-stack-compatibility | components/tools/tool-038-stack-compatibility.tsx | lib/tools/engines/tool-038-stack-compatibility.ts | lib/tools/schemas/tool-038-stack-compatibility.ts | lib/tools/engines/tool-038-stack-compatibility.test.ts |
| tool-039-liver-enzyme-tracker | components/tools/tool-039-liver-enzyme-tracker.tsx | lib/tools/engines/tool-039-liver-enzyme-tracker.ts | lib/tools/schemas/tool-039-liver-enzyme-tracker.ts | lib/tools/engines/tool-039-liver-enzyme-tracker.test.ts |
| tool-040-lipid-profile-optimizer | components/tools/tool-040-lipid-profile-optimizer.tsx | lib/tools/engines/tool-040-lipid-profile-optimizer.ts | lib/tools/schemas/tool-040-lipid-profile-optimizer.ts | lib/tools/engines/tool-040-lipid-profile-optimizer.test.ts |
| tool-041-hematocrit-monitor | components/tools/tool-041-hematocrit-monitor.tsx | lib/tools/engines/tool-041-hematocrit-monitor.ts | lib/tools/schemas/tool-041-hematocrit-monitor.ts | lib/tools/engines/tool-041-hematocrit-monitor.test.ts |
| tool-042-estrogen-management | components/tools/tool-042-estrogen-management.tsx | lib/tools/engines/tool-042-estrogen-management.ts | lib/tools/schemas/tool-042-estrogen-management.ts | lib/tools/engines/tool-042-estrogen-management.test.ts |
| tool-043-prolactin-management | components/tools/tool-043-prolactin-management.tsx | lib/tools/engines/tool-043-prolactin-management.ts | lib/tools/schemas/tool-043-prolactin-management.ts | lib/tools/engines/tool-043-prolactin-management.test.ts |
| tool-044-dht-side-effects | components/tools/tool-044-dht-side-effects.tsx | lib/tools/engines/tool-044-dht-side-effects.ts | lib/tools/schemas/tool-044-dht-side-effects.ts | lib/tools/engines/tool-044-dht-side-effects.test.ts |
| tool-045-cycle-break-planner | components/tools/tool-045-cycle-break-planner.tsx | lib/tools/engines/tool-045-cycle-break-planner.ts | lib/tools/schemas/tool-045-cycle-break-planner.ts | lib/tools/engines/tool-045-cycle-break-planner.test.ts |
| tool-046-trt-lifetime | components/tools/tool-046-trt-lifetime.tsx | lib/tools/engines/tool-046-trt-lifetime.ts | lib/tools/schemas/tool-046-trt-lifetime.ts | lib/tools/engines/tool-046-trt-lifetime.test.ts |
| tool-047-fertility-preservation | components/tools/tool-047-fertility-preservation.tsx | lib/tools/engines/tool-047-fertility-preservation.ts | lib/tools/schemas/tool-047-fertility-preservation.ts | lib/tools/engines/tool-047-fertility-preservation.test.ts |
| tool-048-cardiovascular-risk | components/tools/tool-048-cardiovascular-risk.tsx | lib/tools/engines/tool-048-cardiovascular-risk.ts | lib/tools/schemas/tool-048-cardiovascular-risk.ts | lib/tools/engines/tool-048-cardiovascular-risk.test.ts |
| tool-049-bone-density | components/tools/tool-049-bone-density.tsx | lib/tools/engines/tool-049-bone-density.ts | lib/tools/schemas/tool-049-bone-density.ts | lib/tools/engines/tool-049-bone-density.test.ts |
| tool-050-mental-health | components/tools/tool-050-mental-health.tsx | lib/tools/engines/tool-050-mental-health.ts | lib/tools/schemas/tool-050-mental-health.ts | lib/tools/engines/tool-050-mental-health.test.ts |
| tool-051-peptide-dosage-calculator | components/tools/tool-051-peptide-dosage-calculator.tsx | lib/tools/engines/tool-051-peptide-dosage-calculator.ts | lib/tools/schemas/tool-051-peptide-dosage-calculator.ts | lib/tools/engines/tool-051-peptide-dosage-calculator.test.ts |
| tool-052-growth-hormone-protocol-planner | components/tools/tool-052-growth-hormone-protocol-planner.tsx | lib/tools/engines/tool-052-growth-hormone-protocol-planner.ts | lib/tools/schemas/tool-052-growth-hormone-protocol-planner.ts | lib/tools/engines/tool-052-growth-hormone-protocol-planner.test.ts |
| tool-053-insulin-conversion-calculator | components/tools/tool-053-insulin-conversion-calculator.tsx | lib/tools/engines/tool-053-insulin-conversion-calculator.ts | lib/tools/schemas/tool-053-insulin-conversion-calculator.ts | lib/tools/engines/tool-053-insulin-conversion-calculator.test.ts |
| tool-054-glucose-tracker | components/tools/tool-054-glucose-tracker.tsx | lib/tools/engines/tool-054-glucose-tracker.ts | lib/tools/schemas/tool-054-glucose-tracker.ts | lib/tools/engines/tool-054-glucose-tracker.test.ts |
| tool-055-insulin-sensitivity-optimizer | components/tools/tool-055-insulin-sensitivity-optimizer.tsx | lib/tools/engines/tool-055-insulin-sensitivity-optimizer.ts | lib/tools/schemas/tool-055-insulin-sensitivity-optimizer.ts | lib/tools/engines/tool-055-insulin-sensitivity-optimizer.test.ts |
| tool-056-mini-pct-calculator | components/tools/tool-056-mini-pct-calculator.tsx | lib/tools/engines/tool-056-mini-pct-calculator.ts | lib/tools/schemas/tool-056-mini-pct-calculator.ts | lib/tools/engines/tool-056-mini-pct-calculator.test.ts |
| tool-057-free-testosterone-manager | components/tools/tool-057-free-testosterone-manager.tsx | lib/tools/engines/tool-057-free-testosterone-manager.ts | lib/tools/schemas/tool-057-free-testosterone-manager.ts | lib/tools/engines/tool-057-free-testosterone-manager.test.ts |
| tool-058-androgenic-balance-calculator | components/tools/tool-058-androgenic-balance-calculator.tsx | lib/tools/engines/tool-058-androgenic-balance-calculator.ts | lib/tools/schemas/tool-058-androgenic-balance-calculator.ts | lib/tools/engines/tool-058-androgenic-balance-calculator.test.ts |
| tool-059-androgen-receptor-optimizer | components/tools/tool-059-androgen-receptor-optimizer.tsx | lib/tools/engines/tool-059-androgen-receptor-optimizer.ts | lib/tools/schemas/tool-059-androgen-receptor-optimizer.ts | lib/tools/engines/tool-059-androgen-receptor-optimizer.test.ts |
| tool-060-5-alpha-conversion-calculator | components/tools/tool-060-5-alpha-conversion-calculator.tsx | lib/tools/engines/tool-060-5-alpha-conversion-calculator.ts | lib/tools/schemas/tool-060-5-alpha-conversion-calculator.ts | lib/tools/engines/tool-060-5-alpha-conversion-calculator.test.ts |
| tool-061-hair-loss-tracker | components/tools/tool-061-hair-loss-tracker.tsx | lib/tools/engines/tool-061-hair-loss-tracker.ts | lib/tools/schemas/tool-061-hair-loss-tracker.ts | lib/tools/engines/tool-061-hair-loss-tracker.test.ts |
| tool-062-prostate-health-manager | components/tools/tool-062-prostate-health-manager.tsx | lib/tools/engines/tool-062-prostate-health-manager.ts | lib/tools/schemas/tool-062-prostate-health-manager.ts | lib/tools/engines/tool-062-prostate-health-manager.test.ts |
| tool-063-testicular-suppression-calculator | components/tools/tool-063-testicular-suppression-calculator.tsx | lib/tools/engines/tool-063-testicular-suppression-calculator.ts | lib/tools/schemas/tool-063-testicular-suppression-calculator.ts | lib/tools/engines/tool-063-testicular-suppression-calculator.test.ts |
| tool-064-sperm-production-optimizer | components/tools/tool-064-sperm-production-optimizer.tsx | lib/tools/engines/tool-064-sperm-production-optimizer.ts | lib/tools/schemas/tool-064-sperm-production-optimizer.ts | lib/tools/engines/tool-064-sperm-production-optimizer.test.ts |
| tool-065-aromatase-conversion-calculator | components/tools/tool-065-aromatase-conversion-calculator.tsx | lib/tools/engines/tool-065-aromatase-conversion-calculator.ts | lib/tools/schemas/tool-065-aromatase-conversion-calculator.ts | lib/tools/engines/tool-065-aromatase-conversion-calculator.test.ts |
| tool-066-estrogen-sensitivity-manager | components/tools/tool-066-estrogen-sensitivity-manager.tsx | lib/tools/engines/tool-066-estrogen-sensitivity-manager.ts | lib/tools/schemas/tool-066-estrogen-sensitivity-manager.ts | lib/tools/engines/tool-066-estrogen-sensitivity-manager.test.ts |
| tool-067-estrogen-balance-calculator | components/tools/tool-067-estrogen-balance-calculator.tsx | lib/tools/engines/tool-067-estrogen-balance-calculator.ts | lib/tools/schemas/tool-067-estrogen-balance-calculator.ts | lib/tools/engines/tool-067-estrogen-balance-calculator.test.ts |
| tool-068-gynecomastia-tracker | components/tools/tool-068-gynecomastia-tracker.tsx | lib/tools/engines/tool-068-gynecomastia-tracker.ts | lib/tools/schemas/tool-068-gynecomastia-tracker.ts | lib/tools/engines/tool-068-gynecomastia-tracker.test.ts |
| tool-069-detoxification-optimizer | components/tools/tool-069-detoxification-optimizer.tsx | lib/tools/engines/tool-069-detoxification-optimizer.ts | lib/tools/schemas/tool-069-detoxification-optimizer.ts | lib/tools/engines/tool-069-detoxification-optimizer.test.ts |
| tool-070-oxidative-stress-calculator | components/tools/tool-070-oxidative-stress-calculator.tsx | lib/tools/engines/tool-070-oxidative-stress-calculator.ts | lib/tools/schemas/tool-070-oxidative-stress-calculator.ts | lib/tools/engines/tool-070-oxidative-stress-calculator.test.ts |
| tool-071-antioxidant-manager | components/tools/tool-071-antioxidant-manager.tsx | lib/tools/engines/tool-071-antioxidant-manager.ts | lib/tools/schemas/tool-071-antioxidant-manager.ts | lib/tools/engines/tool-071-antioxidant-manager.test.ts |
| tool-072-systemic-inflammation-calculator | components/tools/tool-072-systemic-inflammation-calculator.tsx | lib/tools/engines/tool-072-systemic-inflammation-calculator.ts | lib/tools/schemas/tool-072-systemic-inflammation-calculator.ts | lib/tools/engines/tool-072-systemic-inflammation-calculator.test.ts |
| tool-073-immune-system-optimizer | components/tools/tool-073-immune-system-optimizer.tsx | lib/tools/engines/tool-073-immune-system-optimizer.ts | lib/tools/schemas/tool-073-immune-system-optimizer.ts | lib/tools/engines/tool-073-immune-system-optimizer.test.ts |
| tool-074-blood-pressure-tracker | components/tools/tool-074-blood-pressure-tracker.tsx | lib/tools/engines/tool-074-blood-pressure-tracker.ts | lib/tools/schemas/tool-074-blood-pressure-tracker.ts | lib/tools/engines/tool-074-blood-pressure-tracker.test.ts |
| tool-075-arterial-health-manager | components/tools/tool-075-arterial-health-manager.tsx | lib/tools/engines/tool-075-arterial-health-manager.ts | lib/tools/schemas/tool-075-arterial-health-manager.ts | lib/tools/engines/tool-075-arterial-health-manager.test.ts |
| tool-076-blood-viscosity-calculator | components/tools/tool-076-blood-viscosity-calculator.tsx | lib/tools/engines/tool-076-blood-viscosity-calculator.ts | lib/tools/schemas/tool-076-blood-viscosity-calculator.ts | lib/tools/engines/tool-076-blood-viscosity-calculator.test.ts |
| tool-077-nitric-oxide-optimizer | components/tools/tool-077-nitric-oxide-optimizer.tsx | lib/tools/engines/tool-077-nitric-oxide-optimizer.ts | lib/tools/schemas/tool-077-nitric-oxide-optimizer.ts | lib/tools/engines/tool-077-nitric-oxide-optimizer.test.ts |
| tool-078-endothelial-health-manager | components/tools/tool-078-endothelial-health-manager.tsx | lib/tools/engines/tool-078-endothelial-health-manager.ts | lib/tools/schemas/tool-078-endothelial-health-manager.ts | lib/tools/engines/tool-078-endothelial-health-manager.test.ts |
| tool-079-fat-metabolism-calculator | components/tools/tool-079-fat-metabolism-calculator.tsx | lib/tools/engines/tool-079-fat-metabolism-calculator.ts | lib/tools/schemas/tool-079-fat-metabolism-calculator.ts | lib/tools/engines/tool-079-fat-metabolism-calculator.test.ts |
| tool-080-mitochondrial-optimizer | components/tools/tool-080-mitochondrial-optimizer.tsx | lib/tools/engines/tool-080-mitochondrial-optimizer.ts | lib/tools/schemas/tool-080-mitochondrial-optimizer.ts | lib/tools/engines/tool-080-mitochondrial-optimizer.test.ts |
| tool-081-cellular-aging-calculator | components/tools/tool-081-cellular-aging-calculator.tsx | lib/tools/engines/tool-081-cellular-aging-calculator.ts | lib/tools/schemas/tool-081-cellular-aging-calculator.ts | lib/tools/engines/tool-081-cellular-aging-calculator.test.ts |
| tool-082-telomere-manager | components/tools/tool-082-telomere-manager.tsx | lib/tools/engines/tool-082-telomere-manager.ts | lib/tools/schemas/tool-082-telomere-manager.ts | lib/tools/engines/tool-082-telomere-manager.test.ts |
| tool-083-anti-aging-inflammation-calculator | components/tools/tool-083-anti-aging-inflammation-calculator.tsx | lib/tools/engines/tool-083-anti-aging-inflammation-calculator.ts | lib/tools/schemas/tool-083-anti-aging-inflammation-calculator.ts | lib/tools/engines/tool-083-anti-aging-inflammation-calculator.test.ts |
| tool-084-cognitive-enhancer | components/tools/tool-084-cognitive-enhancer.tsx | lib/tools/engines/tool-084-cognitive-enhancer.ts | lib/tools/schemas/tool-084-cognitive-enhancer.ts | lib/tools/engines/tool-084-cognitive-enhancer.test.ts |
| tool-085-sleep-quality-manager | components/tools/tool-085-sleep-quality-manager.tsx | lib/tools/engines/tool-085-sleep-quality-manager.ts | lib/tools/schemas/tool-085-sleep-quality-manager.ts | lib/tools/engines/tool-085-sleep-quality-manager.test.ts |
| tool-086-cortisol-stress-calculator | components/tools/tool-086-cortisol-stress-calculator.tsx | lib/tools/engines/tool-086-cortisol-stress-calculator.ts | lib/tools/schemas/tool-086-cortisol-stress-calculator.ts | lib/tools/engines/tool-086-cortisol-stress-calculator.test.ts |
| tool-087-mood-optimizer | components/tools/tool-087-mood-optimizer.tsx | lib/tools/engines/tool-087-mood-optimizer.ts | lib/tools/schemas/tool-087-mood-optimizer.ts | lib/tools/engines/tool-087-mood-optimizer.test.ts |
| tool-088-dopamine-tracker | components/tools/tool-088-dopamine-tracker.tsx | lib/tools/engines/tool-088-dopamine-tracker.ts | lib/tools/schemas/tool-088-dopamine-tracker.ts | lib/tools/engines/tool-088-dopamine-tracker.test.ts |
| tool-089-serotonin-manager | components/tools/tool-089-serotonin-manager.tsx | lib/tools/engines/tool-089-serotonin-manager.ts | lib/tools/schemas/tool-089-serotonin-manager.ts | lib/tools/engines/tool-089-serotonin-manager.test.ts |
| tool-090-female-hormone-balance-calculator | components/tools/tool-090-female-hormone-balance-calculator.tsx | lib/tools/engines/tool-090-female-hormone-balance-calculator.ts | lib/tools/schemas/tool-090-female-hormone-balance-calculator.ts | lib/tools/engines/tool-090-female-hormone-balance-calculator.test.ts |
| tool-091-female-health-optimizer | components/tools/tool-091-female-health-optimizer.tsx | lib/tools/engines/tool-091-female-health-optimizer.ts | lib/tools/schemas/tool-091-female-health-optimizer.ts | lib/tools/engines/tool-091-female-health-optimizer.test.ts |
| tool-092-female-dosage-calculator | components/tools/tool-092-female-dosage-calculator.tsx | lib/tools/engines/tool-092-female-dosage-calculator.ts | lib/tools/schemas/tool-092-female-dosage-calculator.ts | lib/tools/engines/tool-092-female-dosage-calculator.test.ts |
| tool-093-menstrual-cycle-manager | components/tools/tool-093-menstrual-cycle-manager.tsx | lib/tools/engines/tool-093-menstrual-cycle-manager.ts | lib/tools/schemas/tool-093-menstrual-cycle-manager.ts | lib/tools/engines/tool-093-menstrual-cycle-manager.test.ts |
| tool-094-pregnancy-risk-calculator | components/tools/tool-094-pregnancy-risk-calculator.tsx | lib/tools/engines/tool-094-pregnancy-risk-calculator.ts | lib/tools/schemas/tool-094-pregnancy-risk-calculator.ts | lib/tools/engines/tool-094-pregnancy-risk-calculator.test.ts |
| tool-095-skin-health-optimizer | components/tools/tool-095-skin-health-optimizer.tsx | lib/tools/engines/tool-095-skin-health-optimizer.ts | lib/tools/schemas/tool-095-skin-health-optimizer.ts | lib/tools/engines/tool-095-skin-health-optimizer.test.ts |
| tool-096-hair-nail-tracker | components/tools/tool-096-hair-nail-tracker.tsx | lib/tools/engines/tool-096-hair-nail-tracker.ts | lib/tools/schemas/tool-096-hair-nail-tracker.ts | lib/tools/engines/tool-096-hair-nail-tracker.test.ts |
| tool-097-hydration-balance-calculator | components/tools/tool-097-hydration-balance-calculator.tsx | lib/tools/engines/tool-097-hydration-balance-calculator.ts | lib/tools/schemas/tool-097-hydration-balance-calculator.ts | lib/tools/engines/tool-097-hydration-balance-calculator.test.ts |
| tool-098-sodium-potassium-manager | components/tools/tool-098-sodium-potassium-manager.tsx | lib/tools/engines/tool-098-sodium-potassium-manager.ts | lib/tools/schemas/tool-098-sodium-potassium-manager.ts | lib/tools/engines/tool-098-sodium-potassium-manager.test.ts |
| tool-099-digestive-health-optimizer | components/tools/tool-099-digestive-health-optimizer.tsx | lib/tools/engines/tool-099-digestive-health-optimizer.ts | lib/tools/schemas/tool-099-digestive-health-optimizer.ts | lib/tools/engines/tool-099-digestive-health-optimizer.test.ts |
| tool-100-comprehensive-report-generator | components/tools/tool-100-comprehensive-report-generator.tsx | lib/tools/engines/tool-100-comprehensive-report-generator.ts | lib/tools/schemas/tool-100-comprehensive-report-generator.ts | lib/tools/engines/tool-100-comprehensive-report-generator.test.ts |
| tool-101-sarm-to-aas-transition-bridge-predictor | components/tools/tool-101-sarm-to-aas-transition-bridge-predictor.tsx | lib/tools/engines/tool-101-sarm-to-aas-transition-bridge-predictor.ts | lib/tools/schemas/tool-101-sarm-to-aas-transition-bridge-predictor.ts | lib/tools/engines/tool-101-sarm-to-aas-transition-bridge-predictor.test.ts |
| tool-102-subcutaneous-vs-intramuscular-pk-modeler | components/tools/tool-102-subcutaneous-vs-intramuscular-pk-modeler.tsx | lib/tools/engines/tool-102-subcutaneous-vs-intramuscular-pk-modeler.ts | lib/tools/schemas/tool-102-subcutaneous-vs-intramuscular-pk-modeler.ts | lib/tools/engines/tool-102-subcutaneous-vs-intramuscular-pk-modeler.test.ts |
| tool-103-renal-function-hydration-index | components/tools/tool-103-renal-function-hydration-index.tsx | lib/tools/engines/tool-103-renal-function-hydration-index.ts | lib/tools/schemas/tool-103-renal-function-hydration-index.ts | lib/tools/engines/tool-103-renal-function-hydration-index.test.ts |
| tool-104-thyroid-metabolic-rate-dynamics | components/tools/tool-104-thyroid-metabolic-rate-dynamics.tsx | lib/tools/engines/tool-104-thyroid-metabolic-rate-dynamics.ts | lib/tools/schemas/tool-104-thyroid-metabolic-rate-dynamics.ts | lib/tools/engines/tool-104-thyroid-metabolic-rate-dynamics.test.ts |
| tool-105-ai-health-data-fusion-hub | components/tools/tool-105-ai-health-data-fusion-hub.tsx | lib/tools/engines/tool-105-ai-health-data-fusion-hub.ts | lib/tools/schemas/tool-105-ai-health-data-fusion-hub.ts | lib/tools/engines/tool-105-ai-health-data-fusion-hub.test.ts |
| tool-106-glycogen-supercompensation-water-modeler | components/tools/tool-106-glycogen-supercompensation-water-modeler.tsx | lib/tools/engines/tool-106-glycogen-supercompensation-water-modeler.ts | lib/tools/schemas/tool-106-glycogen-supercompensation-water-modeler.ts | lib/tools/engines/tool-106-glycogen-supercompensation-water-modeler.test.ts |
| tool-107-contest-prep-peak-week-manipulator | components/tools/tool-107-contest-prep-peak-week-manipulator.tsx | lib/tools/engines/tool-107-contest-prep-peak-week-manipulator.ts | lib/tools/schemas/tool-107-contest-prep-peak-week-manipulator.ts | lib/tools/engines/tool-107-contest-prep-peak-week-manipulator.test.ts |
| tool-108-ai-body-composition-vision-engine | components/tools/tool-108-ai-body-composition-vision-engine.tsx | lib/tools/engines/tool-108-ai-body-composition-vision-engine.ts | lib/tools/schemas/tool-108-ai-body-composition-vision-engine.ts | lib/tools/engines/tool-108-ai-body-composition-vision-engine.test.ts |
| tool-109-competition-readiness-posing-os | components/tools/tool-109-competition-readiness-posing-os.tsx | lib/tools/engines/tool-109-competition-readiness-posing-os.ts | lib/tools/schemas/tool-109-competition-readiness-posing-os.ts | lib/tools/engines/tool-109-competition-readiness-posing-os.test.ts |
| tool-110-ai-meal-vision-scanner | components/tools/tool-110-ai-meal-vision-scanner.tsx | lib/tools/engines/tool-110-ai-meal-vision-scanner.ts | lib/tools/schemas/tool-110-ai-meal-vision-scanner.ts | lib/tools/engines/tool-110-ai-meal-vision-scanner.test.ts |
| tool-111-smart-food-macro-substitution | components/tools/tool-111-smart-food-macro-substitution.tsx | lib/tools/engines/tool-111-smart-food-macro-substitution.ts | lib/tools/schemas/tool-111-smart-food-macro-substitution.ts | MISSING |
| tool-112-food-quality-micronutrient-diversity-score | components/tools/tool-112-food-quality-micronutrient-diversity-score.tsx | lib/tools/engines/tool-112-food-quality-micronutrient-diversity-score.ts | lib/tools/schemas/tool-112-food-quality-micronutrient-diversity-score.ts | lib/tools/engines/tool-112-117-batch.test.ts |
| tool-113-ai-grocery-basket-meal-cost-optimizer | components/tools/tool-113-ai-grocery-basket-meal-cost-optimizer.tsx | lib/tools/engines/tool-113-ai-grocery-basket-meal-cost-optimizer.ts | lib/tools/schemas/tool-113-ai-grocery-basket-meal-cost-optimizer.ts | lib/tools/engines/tool-112-117-batch.test.ts |
| tool-114-restaurant-macro-navigator | components/tools/tool-114-restaurant-macro-navigator.tsx | lib/tools/engines/tool-114-restaurant-macro-navigator.ts | lib/tools/schemas/tool-114-restaurant-macro-navigator.ts | lib/tools/engines/tool-112-117-batch.test.ts |
| tool-115-supplement-evidence-bio-stack-navigator | components/tools/tool-115-supplement-evidence-bio-stack-navigator.tsx | lib/tools/engines/tool-115-supplement-evidence-bio-stack-navigator.ts | lib/tools/schemas/tool-115-supplement-evidence-bio-stack-navigator.ts | lib/tools/engines/tool-112-117-batch.test.ts |
| tool-116-nutrition-gap-fasting-window-optimizer | components/tools/tool-116-nutrition-gap-fasting-window-optimizer.tsx | lib/tools/engines/tool-116-nutrition-gap-fasting-window-optimizer.ts | lib/tools/schemas/tool-116-nutrition-gap-fasting-window-optimizer.ts | lib/tools/engines/tool-112-117-batch.test.ts |
| tool-117-intra-workout-nutrient-volumizer | components/tools/tool-117-intra-workout-nutrient-volumizer.tsx | lib/tools/engines/tool-117-intra-workout-nutrient-volumizer.ts | lib/tools/schemas/tool-117-intra-workout-nutrient-volumizer.ts | lib/tools/engines/tool-112-117-batch.test.ts |
| tool-118-cns-recovery-score | components/tools/tool-118-cns-recovery-score.tsx | lib/tools/engines/tool-118-cns-recovery-score.ts | lib/tools/schemas/tool-118-cns-recovery-score.ts | lib/tools/engines/tool-118-121-batch.test.ts |
| tool-119-training-volume-hypertrophy-index | components/tools/tool-119-training-volume-hypertrophy-index.tsx | lib/tools/engines/tool-119-training-volume-hypertrophy-index.ts | lib/tools/schemas/tool-119-training-volume-hypertrophy-index.ts | lib/tools/engines/tool-118-121-batch.test.ts |
| tool-120-progressive-overload-predictor | components/tools/tool-120-progressive-overload-predictor.tsx | lib/tools/engines/tool-120-progressive-overload-predictor.ts | lib/tools/schemas/tool-120-progressive-overload-predictor.ts | lib/tools/engines/tool-118-121-batch.test.ts |
| tool-121-muscle-group-recovery-modeler | components/tools/tool-121-muscle-group-recovery-modeler.tsx | lib/tools/engines/tool-121-muscle-group-recovery-modeler.ts | lib/tools/schemas/tool-121-muscle-group-recovery-modeler.ts | lib/tools/engines/tool-118-121-batch.test.ts |
| tool-122-rpe-rir-1rm-velocity-modeler | components/tools/tool-122-rpe-rir-1rm-velocity-modeler.tsx | lib/tools/engines/tool-122-rpe-rir-1rm-velocity-modeler.ts | lib/tools/schemas/tool-122-rpe-rir-1rm-velocity-modeler.ts | lib/tools/engines/tool-122-125-batch.test.ts |
| tool-123-joint-stress-connective-tissue-index | components/tools/tool-123-joint-stress-connective-tissue-index.tsx | lib/tools/engines/tool-123-joint-stress-connective-tissue-index.ts | lib/tools/schemas/tool-123-joint-stress-connective-tissue-index.ts | lib/tools/engines/tool-122-125-batch.test.ts |
| tool-124-deload-frequency-fatigue-modeler | components/tools/tool-124-deload-frequency-fatigue-modeler.tsx | lib/tools/engines/tool-124-deload-frequency-fatigue-modeler.ts | lib/tools/schemas/tool-124-deload-frequency-fatigue-modeler.ts | lib/tools/engines/tool-122-125-batch.test.ts |
| tool-125-fiber-type-mechanical-tension-score | components/tools/tool-125-fiber-type-mechanical-tension-score.tsx | lib/tools/engines/tool-125-fiber-type-mechanical-tension-score.ts | lib/tools/schemas/tool-125-fiber-type-mechanical-tension-score.ts | lib/tools/engines/tool-122-125-batch.test.ts |
| tool-126-neuromuscular-explosiveness-modeler | components/tools/tool-126-neuromuscular-explosiveness-modeler.tsx | lib/tools/engines/tool-126-neuromuscular-explosiveness-modeler.v6.ts | lib/tools/schemas/tool-126-neuromuscular-explosiveness-modeler.ts | lib/tools/engines/tool-126-130-batch.test.ts; components/tools/tool-126-130-batch.dom.test.tsx |
| tool-127-ai-daily-readiness-explainer | components/tools/tool-127-ai-daily-readiness-explainer.tsx | lib/tools/engines/tool-127-ai-daily-readiness-explainer.v6.ts | lib/tools/schemas/tool-127-ai-daily-readiness-explainer.ts | lib/tools/engines/tool-126-130-batch.test.ts; components/tools/tool-126-130-batch.dom.test.tsx |
| tool-128-training-load-acute-chronic-ratio | components/tools/tool-128-training-load-acute-chronic-ratio.tsx | lib/tools/engines/tool-128-training-load-acute-chronic-ratio.v6.ts | lib/tools/schemas/tool-128-training-load-acute-chronic-ratio.ts | lib/tools/engines/tool-126-130-batch.test.ts; components/tools/tool-126-130-batch.dom.test.tsx |
| tool-129-ai-adaptive-training-planner | components/tools/tool-129-ai-adaptive-training-planner.tsx | lib/tools/engines/tool-129-ai-adaptive-training-planner.v6.ts | lib/tools/schemas/tool-129-ai-adaptive-training-planner.ts | lib/tools/engines/tool-126-130-batch.test.ts; components/tools/tool-126-130-batch.dom.test.tsx |
| tool-130-ai-plateau-detective | components/tools/tool-130-ai-plateau-detective.tsx | lib/tools/engines/tool-130-ai-plateau-detective.v6.ts | lib/tools/schemas/tool-130-ai-plateau-detective.ts | lib/tools/engines/tool-126-130-batch.test.ts; components/tools/tool-126-130-batch.dom.test.tsx |
| tool-131-transformation-forecast-trajectory-engine | components/tools/tool-131-transformation-forecast-trajectory-engine.tsx | lib/tools/engines/tool-131-transformation-forecast-trajectory-engine.v6.ts | lib/tools/schemas/tool-131-transformation-forecast-trajectory-engine.ts | lib/tools/engines/tool-131-136-batch.test.ts; components/tools/tool-131-136-batch.dom.test.tsx |
| tool-132-ai-pose-form-coach | MISSING | MISSING | MISSING | MISSING |
| tool-133-rep-tempo-velocity-loss-analyzer | components/tools/tool-133-rep-tempo-velocity-loss-analyzer.tsx | lib/tools/engines/tool-133-rep-tempo-velocity-loss-analyzer.v6.ts | lib/tools/schemas/tool-133-rep-tempo-velocity-loss-analyzer.ts | lib/tools/engines/tool-131-136-batch.test.ts; components/tools/tool-131-136-batch.dom.test.tsx |
| tool-134-mobility-movement-symmetry-screen | components/tools/tool-134-mobility-movement-symmetry-screen.tsx | lib/tools/engines/tool-134-mobility-movement-symmetry-screen.v6.ts | lib/tools/schemas/tool-134-mobility-movement-symmetry-screen.ts | lib/tools/engines/tool-131-136-batch.test.ts; components/tools/tool-131-136-batch.dom.test.tsx |
| tool-135-exercise-substitution-ai | components/tools/tool-135-exercise-substitution-ai.tsx | lib/tools/engines/tool-135-exercise-substitution-ai.v6.ts | lib/tools/schemas/tool-135-exercise-substitution-ai.ts | lib/tools/engines/tool-131-136-batch.test.ts; components/tools/tool-131-136-batch.dom.test.tsx |
| tool-136-physique-golden-ratio-score | components/tools/tool-136-physique-golden-ratio-score.tsx | lib/tools/engines/tool-136-physique-golden-ratio-score.v6.ts | lib/tools/schemas/tool-136-physique-golden-ratio-score.ts | lib/tools/engines/tool-131-136-batch.test.ts; components/tools/tool-131-136-batch.dom.test.tsx |
| tool-137-peptide-hormone-reconstitution-calculator | MISSING | MISSING | MISSING | MISSING |
| tool-138-raw-powder-density-oil-formulation-engine | MISSING | MISSING | MISSING | MISSING |
| tool-139-solvent-emulsifier-ratio-calculator | MISSING | MISSING | MISSING | MISSING |
| tool-140-dosage-unit-conversion-engine | components/tools/tool-140-dosage-unit-conversion-engine.tsx | lib/tools/engines/tool-140-dosage-unit-conversion-engine.v6.ts | lib/tools/schemas/tool-140-dosage-unit-conversion-engine.ts | lib/tools/engines/tool-140-dosage-unit-conversion-engine.v6.test.ts; components/tools/tool-140-dosage-unit-conversion-engine.test.tsx |
| tool-141-carrier-oil-viscosity-syringe-pressure | MISSING | MISSING | MISSING | MISSING |
| tool-142-compound-purity-active-yield-estimator | MISSING | MISSING | MISSING | MISSING |
| tool-143-storage-stability-thermal-degradation-estimator | components/tools/tool-143-storage-stability-thermal-degradation-estimator.tsx | lib/tools/engines/tool-143-storage-stability-thermal-degradation-estimator.v6.ts | lib/tools/schemas/tool-143-storage-stability-thermal-degradation-estimator.ts | lib/tools/engines/tool-143-storage-stability-thermal-degradation-estimator.v6.test.ts; components/tools/tool-143-storage-stability-thermal-degradation-estimator.test.tsx |
| tool-144-homebrew-chemistry-calculator | components/tools/tool-144-homebrew-chemistry-calculator.tsx | lib/tools/engines/tool-144-homebrew-chemistry-calculator.v6.ts | lib/tools/schemas/tool-144-homebrew-chemistry-calculator.ts | lib/tools/engines/tool-144-homebrew-chemistry-calculator.v6.test.ts; components/tools/tool-144-homebrew-chemistry-calculator.test.tsx |
| tool-145-habit-intelligence-consistency-coach | components/tools/tool-145-habit-intelligence-consistency-coach.tsx | lib/tools/engines/tool-145-habit-intelligence-consistency-coach.v6.ts | lib/tools/schemas/tool-145-habit-intelligence-consistency-coach.ts | lib/tools/engines/tool-145-habit-intelligence-consistency-coach.v6.test.ts; components/tools/tool-145-habit-intelligence-consistency-coach.test.tsx |
| tool-146-ai-safety-gate-emergency-protocol | components/tools/tool-146-emergency-warning-signs-checklist.tsx | lib/tools/engines/tool-146-emergency-warning-signs-checklist.v6.ts | lib/tools/schemas/tool-146-emergency-warning-signs-checklist.ts | lib/tools/engines/tool-146-emergency-warning-signs-checklist.v6.test.ts; components/tools/tool-146-emergency-warning-signs-checklist.test.tsx; lib/legacy-routes.test.ts; lib/tools/registry.test.ts |
| tool-147-scientific-evidence-explorer | MISSING | MISSING | MISSING | MISSING |
| tool-148-personal-fitness-memory-layer | components/tools/tool-148-personal-fitness-memory-layer.tsx | lib/tools/engines/tool-148-personal-fitness-memory-layer.v6.ts | lib/tools/schemas/tool-148-personal-fitness-memory-layer.ts | lib/tools/engines/tool-148-personal-fitness-memory-layer.v6.test.ts; components/tools/tool-148-personal-fitness-memory-layer.test.tsx |
| tool-149-physique-trajectory-simulator | components/tools/tool-149-physique-trajectory-simulator.tsx | lib/tools/engines/tool-149-physique-trajectory-simulator.v6.ts; shared/physique-scenario-kernel.ts | lib/tools/schemas/tool-149-physique-trajectory-simulator.ts | lib/tools/engines/tool-149-physique-trajectory-simulator.v6.test.ts; components/tools/tool-149-physique-trajectory-simulator.test.tsx; lib/legacy-routes.test.ts; lib/tools/registry.test.ts |
| tool-150-ai-performance-command-center | components/tools/tool-150-ai-performance-command-center.tsx | lib/tools/engines/tool-150-ai-performance-command-center.v6.ts | lib/tools/schemas/tool-150-ai-performance-command-center.ts | lib/tools/engines/tool-150-ai-performance-command-center.v6.test.ts; components/tools/tool-150-ai-performance-command-center.test.tsx |

## Next actions
1. Tools 146 and 149 are implemented and verified in Batches 18–19. Before implementing tools 147, 148 or 150, present each audited scope and wait for owner approval.

## Current-checkout correction — Tool 147 — 2026-10-26

The historical inventory rows and aggregate snapshots above predate the approved Tool 147 implementation and must not be read as current #147 status. Current catalog source `lib/tools/smartToolsCatalog10.ts:33` marks it `implemented` at `/smarttools/platform-ai/tool-147-scientific-evidence-explorer`; component, engine, schema, UI-test and API-test files are present, the local route returned HTTP 200 on port 3101, focused UI/API/engine/limiter tests passed 23/23, and `npm run validate-tools` passed 5/5. See `SMARTTOOLS_TOOL_147_IMPLEMENTATION_REPORT.md` for scope and evidence. No other inventory rows or totals are reconciled by this addendum; a full current inventory refresh remains necessary before using the historical counts above.
2. Audit the 72 file-present but functionally unverified tools with focused tests and UI checks, then extend the same per-feature parity ledger.
3. Add missing numbered tool identities to the catalog only with source evidence from the v7 registry/spec.
4. Run validate-tools, tsc, eslint, focused tests and build; capture evidence before VERIFIED COMPLETE.

## Batch 6 unnumbered core nutrition additions

| Tool ID | Slug | Legacy route | Canonical route | Category | Component | Engine | Schema | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|
| mrx.tool.bmr-tdee | bmr-tdee | /smarttools/bmr-tdee | /smarttools/nutrition/bmr-tdee | nutrition | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.protein-needs | protein-needs | /smarttools/protein-needs | /smarttools/nutrition/protein-needs | nutrition | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.water-intake | water-intake | /smarttools/water-intake | /smarttools/nutrition/water-intake | nutrition | Y | Y | Y | Y | TARGETED TESTS PASS |

## Batch 7 repaired legacy tools

| Tool ID | Slug | Legacy route | Canonical route | Category | Component | Engine | Schema | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|
| mrx.tool.bmi | bmi | /smarttools/bmi | /smarttools/body-composition/bmi | body-composition | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.one-rep-max | one-rep-max | /smarttools/one-rep-max | /smarttools/training-recovery/one-rep-max | training-recovery | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.strength-standards | strength-standards | /smarttools/strength-standards | /smarttools/training-recovery/strength-standards | training-recovery | Y | Y | Y | Y | TARGETED TESTS PASS |
| mrx.tool.rest-timer | rest-timer | /smarttools/rest-timer | /smarttools/training-recovery/rest-timer | training-recovery | Y | Y | Y | Y | TARGETED TESTS PASS |

Additional repair: the obsolete flat Tool 111 page now redirects to the catalog-backed nutrition route; the full TypeScript and production build pass after the repair.

## Batch 8 verified nutrition engines

| Tool ID | Focused engine test | Principal repair/evidence | Status |
|---|---|---|---|
| tool-112-food-quality-micronutrient-diversity-score | PASS | Processing shares now use consistent serving-mass units | TARGETED TESTS PASS |
| tool-113-ai-grocery-basket-meal-cost-optimizer | PASS | Explicit greedy heuristic labeling; exact-budget purchase works | TARGETED TESTS PASS |
| tool-114-restaurant-macro-navigator | PASS | Approximate ranges and unsupported ingredients are disclosed | TARGETED TESTS PASS |
| tool-115-supplement-evidence-bio-stack-navigator | PASS | Removed unsourced interaction matrix; unknown pairs remain unassessed | TARGETED TESTS PASS |
| tool-116-nutrition-gap-fasting-window-optimizer | PASS | Unreported nutrients remain unknown; mixed units are labeled; unused profile inputs removed | TARGETED TESTS PASS |
| tool-117-intra-workout-nutrient-volumizer | PASS | Removed unused body-weight input; added direct input guard and EAA comparison | TARGETED TESTS PASS |

Batch 8 automated engine coverage is present in `lib/tools/engines/tool-112-117-batch.test.ts`. Automated browser/visual interaction testing was not performed; build/type checks cover compilation only. The six identities already existed and were not added to the 166 catalog/registry count. Database, migrations, commit, push and deployment were not touched.

### Batch 9 completed — tools 118–121

All four tools now have focused engine tests. See `SMARTTOOLS_BATCH_9_REPORT.md` for changes and verification. Tools 122–125 remain unverified.

### Genius feature parity target — owner clarification

The owner now directs that all SmartTools receive the applicable Tool 111 feature set. The 14-feature benchmark and cross-cutting requirements are recorded in `SMARTTOOLS_GENIUS_PARITY_ROADMAP.md`; source-based gaps for tools 112–121 are recorded in `SMARTTOOLS_PARITY_AUDIT_112_121.md`. Batches 8–9 were engine-focused and are not full parity completions.

### Batch 10 completed — Tool 111 parity foundation for tools 112–117

The six existing tools now use the explicit output envelope and shared result summary, with calculate/reset controls and applicable unit conversions. Uncalibrated confidence is represented as unassessed. TypeScript, 22 focused tests, the two-case Tool 112 DOM suite, five registry-validation tests and the 365-page production build pass. UI/browser evidence for tools 113–117 remains outstanding; the 252-identity count is unchanged. See `SMARTTOOLS_BATCH_10_REPORT.md`.

### Batch 11 completed in source — Tool 111 parity for tools 118–121

Tools 118–121 now use explicit adapter-backed output, reset, applicable unit controls, unassessed provenance and registry identities. Four existing identities were added to the canonical registry without renaming or changing their catalog routes. The 54 focused engine/adapter/contract/registry/route tests, four DOM cases, typecheck, `validate-tools` and 365-page build pass. Targeted lint has zero errors and four existing draft-hydration warnings. See `SMARTTOOLS_BATCH_11_REPORT.md`.

Tools 122–125 are next. The source audit notes an existing adapter for 122 and no adapters for 123–125; review the engines and confidence claims before wiring their result UIs.

### Batch 15 completed — Tool 111 parity for Tool 140

Tool 140 now converts 15 exact analyte/specimen-specific laboratory result pairs using published Labcorp and Mayo Clinic Laboratories factors, with reverse conversion by division. It has typed schema validation, bilingual explicit calculate/reset UI, transparent formula/source, provenance, registry identity and canonical/legacy routes. Medication-dose conversion and clinical interpretation are outside scope. Tools 137–139 and 141–142 remain planned pending separate evidence and safety review. See `SMARTTOOLS_BATCH_15_REPORT.md` and `docs/SMARTTOOLS_UNIT_CONVERSION_SOURCES.md`.

### Batch 16 completed — Tool 111 parity for Tool 145

Tool 145 now summarizes one user-entered week of up to eight named habits, including completed-day rate and current/longest streaks. It uses explicit calculate/reset, blank initial data, bilingual day labels, schema validation, stale-output clearing, provenance and registry routes. It does not save personal data or infer causes. At the Batch 16 checkpoint, tools 143–144 and 146–150 were still planned. Batches 17–19 subsequently implemented tools 143–146 and 149; tools 147, 148 and 150 remain approval-gated, while 137–139 and 141–142 remain planned pending separate evidence and safety review. See `SMARTTOOLS_BATCH_16_REPORT.md` and the later batch reports.

### Tool 111 direct-engine validation follow-up — 2026-10-25
- The active Tool 111 `computeSubstitution` boundary now rejects non-finite or out-of-range quantity, invalid macro profiles/targets, and unknown runtime units instead of silently converting those values to zero. Focused checks: four Tool 111 schema/adapter/UI/DOM files PASS, 49 tests; `npm run validate-tools` PASS, 5 tests; TypeScript PASS; scoped ESLint exit 0 with one existing unused-function warning; `npm run build` PASS, 385/385 static pages.
- Tool 111 remains functionally PARTIAL for unit conversion: volume and count units have no required density or grams-per-unit input despite macro data being per 100 g. This needs a reviewed data contract before broadening calculation behavior; details are in `docs/GENIUS_TOOL_STANDARD_V3.md` and `docs/GENIUS_TOOL_V3_BASELINE_AUDIT.md`.

### Batch 17 completed — Tools 143–144

Tool 143 compares user-entered readings with a selected DailyMed label interval and records product, product state, search-open time and label Set ID/URL. Missing label provenance or range produces `not_evaluable`; readings outside the entered range direct the user to the pharmacist/manufacturer. No stability or product-condition claim is made.

Tool 144 is now a general SI mass-volume-density calculator under the new Measurement & Conversion category. It preserves the numbered ID/slug, moves the canonical route, and redirects both the flat URL and old injection-formulation category URL. Density entry requires source and measurement temperature; no density database is included. Sources, rules and exclusions are in `docs/SMARTTOOLS_STORAGE_AND_DENSITY_SOURCES.md` and the implementation report.

### Current status correction — Tools 148 and 150 — 2026-10-25

- The older route-aware inventory rows and file-presence table above predate the implementation of Tools 148 and 150. Current catalog rows mark both as `implemented`; both use category-first canonical routes under `/smarttools/platform-ai/`, while their former flat paths redirect to the canonical routes. IDs and slugs are unchanged.
- The 2026-10-25 cross-tool exchange slice now covers Tool 148 → Tool 149 and Tool 149 → Tool 150 through the common, explicit-consent session envelope. Other tool pairs remain unaudited for safe data contracts. See `docs/SMARTTOOLS_CROSS_TOOL_DATA_EXCHANGE_V7_REPORT.md` for contract, limits, tests and current full-suite status.
- The moved Tool 149 DOM integration test under `tests/unit/components/` is now included in Vitest's jsdom project. Post-hardening focused verification is 55/55 tests across seven files (41 node tests and 14 jsdom tests); the current full suite remains blocked by the same 16 checkout/payment failures documented in the cross-tool report.
- Tool 148 has a session-only personal context component, engine and schema. The focused combined verification recorded in `docs/SMARTTOOLS_TOOL_148_IMPLEMENTATION_REPORT.md` passed 57 tests across six files, `validate-tools` 5/5, TypeScript, scoped ESLint, and a production build generating 389/389 pages. The report also records canonical-route and legacy-redirect HTTP smoke checks.
- Tool 150 has a manual results organizer component, engine, schema and focused UI/engine tests. Focused verification on 2026-10-25: `npx vitest run lib/tools/engines/tool-150-ai-performance-command-center.v6.test.ts components/tools/tool-150-ai-performance-command-center.test.tsx` PASS, 2 files / 13 tests; `npm run validate-tools` PASS, 5/5. Its canonical route returned HTTP 200 in the existing local preview; the production build evidence above generated 389/389 pages.
- Catalog count is 166 total: 159 implemented and 7 planned. The focused catalog test passed 6/6 and `validate-tools` passed 5/5 on 2026-10-25. The aggregate 170 route-aware rows in this report are a separate, broader inventory count and are not the catalog identity count.
- Remaining browser-level usability/accessibility review for Tool 148 is still outstanding. These verification results do not approve persistence, cross-session memory, or additional cross-tool data sharing. No database writes, migrations, commit, push, or deployment were performed.

### Batch 20 — Tools 008–009 history logging correction — 2026-10-25

- Tool 008 now saves a user-described symptom only after explicit submission; no automatic risk assessment, diagnosis, or treatment recommendation is produced.
- Tool 009 now stores user-entered site history only. Its fixed seven-day “safe date” and rotation recommendation contract were removed; the ID, slug, category, and routes remain unchanged.
- Both use the global language/direction provider and add no local unit or language control. Focused tests, TypeScript, scoped ESLint, `validate-tools`, and the 389-page production build pass. The full suite remains blocked by the same 16 pre-existing checkout/payment failures. See `SMARTTOOLS_BATCH_20_REPORT.md` for exact commands, outputs, privacy limitations, and the Tool 007 follow-up finding.

### Batch 21 — Tool 007 bloodwork record log — 2026-10-25

- Replaced the count-based “optimal/concerning” and HPTA outputs with an explicit session-only log of user-transcribed marker values, units, source and sample date. Interpretation is `NOT_AVAILABLE`; no medical assessment or recommendation is generated.
- Tool ID, slug, category, and route remain unchanged. Focused UI/schema checks passed 5/5; TypeScript, scoped ESLint, `validate-tools`, and the production build passed. The full suite remains at 16 checkout/payment failures; details are in `SMARTTOOLS_BATCH_21_REPORT.md`.

### Batch 22 — Tool 024 lab reference interval comparison — 2026-10-25

- Replaced unsupported default testosterone values/ranges and recovery/PCT conclusions with explicit arithmetic comparison against a reference interval transcribed by the user. Missing or invalid inputs are rejected; no external range, diagnosis, recovery status, risk estimate, or treatment recommendation is generated.
- Tool ID, slug, category and routes remain unchanged. Focused UI/engine/schema tests passed 7/7; TypeScript, scoped ESLint, `validate-tools` and the 389-page production build passed. The complete suite ran 426 files: 418 passed, 7 failed, 1 skipped; 4,359 tests passed, 16 failed, 5 skipped. The same 16 checkout/payment failures across seven files are documented in the previous batch report and remain blockers. See `SMARTTOOLS_BATCH_22_REPORT.md` for exact commands, failure evidence, scope and limitations.

### Batch 23 — Tool 025 medication and compound session list — 2026-10-25

- Removed the unvalidated pairwise interaction rules, severity labels, “safety score,” recommendations, seeded compound and user-state persistence. The tool now records only user-entered items in page state and explicitly returns interaction assessment `NOT_AVAILABLE` because no validated interaction source/rules are configured.
- Preserved identity, slug, category, route and order. Strict schema/engine, bilingual UI, explicit source limitations, clear/remove controls and focused validation tests were added. Focused tests passed 8/8; TypeScript, scoped ESLint, `validate-tools`, and the 389-page production build passed. The full suite ran 429 files: 421 passed, 7 failed, 1 skipped; 4,367 tests passed, 16 failed, 5 skipped. The same checkout/payment blockers remain. See `SMARTTOOLS_BATCH_23_REPORT.md` for exact evidence and limits.

### Batch 24 — Tool 026 injection experience log — 2026-10-25

- Removed unsupported injection-volume “safety” limits, site/rotation instructions, pain score, solvent ratios, oil-warming advice, seeded sites, and persistent health-state saving. The tool now keeps only user-authored experience notes in page state and marks clinical assessment `NOT_AVAILABLE`.
- Preserved identity, slug, category, route and order. Strict input schema/engine validation, bilingual RTL UI, delete/clear controls and focused tests passed 7/7; TypeScript, scoped ESLint, `validate-tools`, and the 389-page production build passed. The full suite ran 432 files: 424 passed, 7 failed, 1 skipped; 4,374 tests passed, 16 failed, 5 skipped. The same checkout/payment blockers remain. See `SMARTTOOLS_BATCH_24_REPORT.md` for exact evidence and limitations.

### Batch 25 — Tool 027 user-provided molar-mass calculator — 2026-10-25

- Removed the unsupported fixed ester-ratio table, potency/base-hormone claims, prefilled drug inputs and persistent saving. The tool now calculates same-amount-of-substance mass from user-entered molar masses and provenance, using the documented `n = m/M` relation. It explicitly excludes medication-dose or biological-equivalence claims.
- Preserved identity, slug, category, route and order. Focused node/UI tests passed 14/14; TypeScript, scoped ESLint, `validate-tools`, and the 389-page production build passed. The full suite ran 435 files: 427 passed, 7 failed, 1 skipped; 4,388 tests passed, 16 failed, 5 skipped. The same checkout/payment blockers remain. IUPAC reference and boundaries are recorded in `docs/SMARTTOOLS_MOLAR_MASS_SOURCES.md`; full evidence is in `SMARTTOOLS_BATCH_25_REPORT.md`.

### Batch 26 — Tool 028 compound scenario comparison worksheet — 2026-10-25

- Removed heuristic “synergy” scores, compatibility/safety claims, testosterone addition and protocol tips, default compounds and persistent saving. The tool now displays two user-entered lists side by side; assessment is `NOT_AVAILABLE` because no validated compatibility source/rules are configured.
- Preserved identity, slug, category, route and order. Focused tests passed 8/8; TypeScript, scoped ESLint, `validate-tools`, and the 389-page production build passed. The full suite ran 438 files: 430 passed, 7 failed, 1 skipped; 4,396 tests passed, 16 failed, 5 skipped. The same checkout/payment blockers remain. See `SMARTTOOLS_BATCH_26_REPORT.md` for evidence and limits.

### Batch 27 — Tool 029 personal measurement summary — 2026-10-25

- Removed unsupported compound-based predictions, fabricated unknown-compound signals, arbitrary risk scoring, dosage/cycle recommendations, defaults and persistence. Tool 029 now calculates descriptive count/minimum/maximum/arithmetic mean summaries for user-entered blood-pressure and pulse readings; clinical assessment is `NOT_AVAILABLE` and no alert thresholds are applied.
- Preserved identity, slug, category, route and order. Focused tests passed 10/10; TypeScript, scoped ESLint, `validate-tools`, and the 389-page production build passed. The full suite ran 441 files: 433 passed, 7 failed, 1 skipped; 4,406 tests passed, 16 failed, 5 skipped. The same checkout/payment blockers remain. See `SMARTTOOLS_BATCH_27_REPORT.md` for evidence and limits.


### Current-checkout recount correction — 2026-10-25

A fresh parse of the current source record rows supersedes the 154-row Registry snapshot above for this checkout: the ten catalog files contain 166 unique records (160 published, 6 planned); `lib/tools/registry.ts` / `TOOL_REGISTRY` contains 157 unique records. Identity-set comparison gives 153 intersection, 13 catalog-only and 4 registry-only (170 union). The former 154 and 130 figures are historical claims; 154 is stale against this current checkout, and the origin/counting rule for 130 remains unresolved. `npx vitest run lib/tools/registry.test.ts tests/unit/smartToolsCatalog.test.ts` passed 28/28; see the current baseline audit addendum for row parsing and limitations. Tool 147 is implemented and marked `implemented` at `lib/tools/smartToolsCatalog10.ts:33`; older inventory classifications that list it as planned are stale. No identities, routes, code, Supabase, or migrations were changed for this recount.

### Tool 142 status and count update — 2026-10-25

The previous inventory row for Tool 142 is a historical `PLANNED/MISSING` snapshot. Tool 142 is now implemented with source-backed, user-provided assay arithmetic; see `SMARTTOOLS_TOOL_142_IMPLEMENTATION_REPORT.md` and `docs/SMARTTOOLS_TOOL_142_SOURCES.md`. It preserves its app ID and slug, publishes under the existing `injection-formulation` category route, and redirects its former flat path. The current six-source recount section above is superseded as to counts: 166 catalog records (161 published, 5 planned), 158 `TOOL_REGISTRY` records, 154 intersection, 12 catalog-only, 4 registry-only, 170 union. The remaining catalog planned set is #132, #137–139, #141. No alias or V7 identity change was made.

### Tool 141 status and count update — 2026-10-25

Tool 141 is implemented locally as an ideal circular-tube pressure-drop calculator; its identity, slug and `injection-formulation` category are preserved. V7 #243 remains a possible conceptual match only. Current catalog count: 166 identities, 162 published and 4 planned (#132, #137, #138 and #139). See `SMARTTOOLS_TOOL_141_IMPLEMENTATION_REPORT.md` and `docs/SMARTTOOLS_TOOL_141_SOURCES.md` for equation, Reynolds gate, limits and checks. Focused tests (67/67), coverage (100%), `validate-tools` (5/5), TypeScript, scoped ESLint and the 395-page build passed. Full repository tests and manual accessibility remain unrun. No database access/write, migration, commit, push or deployment occurred.

### Planned tools scope refresh — 2026-10-25

The four planned catalog entries are #132, #137, #138 and #139. Current evidence and decision gates are in `docs/SMARTTOOLS_PLANNED_TOOLS_SCOPE_AUDIT.md`; the detailed #139 BA/BB and injection-formulation scope audit is in `docs/SMARTTOOLS_TOOL_139_SCOPE_AUDIT.md`. This read-only audit changes no tool status or identity and adds no implementation.

### Tool 150 provenance correction — 2026-10-25

Tool 150 review found that the Tool 149 calculation timestamp had been copied into the imported record's `recordedOn` measurement-date field. It now stores that timestamp separately as `derivedAt`, leaves measurement date missing, and reports the imported row as `PARTIAL`. Focused tests now pass 15/15 for Tool 150. See `SMARTTOOLS_TOOL_150_REVIEW_REPORT.md` for evidence and remaining review gates; no identity, route, persistence, or database behavior changed.

### Current checked-out catalog and registry recount — 2026-10-26

This dated snapshot supersedes the earlier count sections above for the current checkout only. The working tree is `main` at `254ce1299bff227c54809bb7027f9b587d69c143`; `git status --porcelain=v1 --untracked-files=all` returned 954 rows, with 0 staged paths. No files were staged or discarded during this recount.

| Source | Physical files / symbol | Raw records | Unique IDs/slugs | Duplicates |
|---|---|---:|---:|---:|
| App catalog | 10 `lib/tools/smartToolsCatalog*.ts` files; catalog rows parsed by `catalogAll()` | 166 | 166 | 0 |
| Tool registry | `lib/tools/registry.ts`, exported `TOOL_REGISTRY` | 159 | 159 | 0 |

Among the 166 catalog records, 117 explicitly say `status: 'implemented'`, 4 explicitly say `status: 'planned'`, and 45 legacy rows omit `status`. The published catalog selector filters out only `status === 'planned'` (`lib/tools/smartToolsCatalog4.ts:61`), so those 45 status-omitting legacy rows remain published: **162 published and 4 planned**. No status was inferred from filenames or changed in source.

| Catalog/registry comparison by slug | Count |
|---|---:|
| Intersection | 159 |
| Catalog-only | 7 |
| Registry-only | 0 |
| Union | 166 |

Catalog-only slugs: `bmr-tdee`, `protein-needs`, `tool-132-ai-pose-form-coach`, `tool-137-peptide-hormone-reconstitution-calculator`, `tool-138-raw-powder-density-oil-formulation-engine`, `tool-139-solvent-emulsifier-ratio-calculator`, and `water-intake`.

The current catalog's remaining planned identities are **#132, #137, #138 and #139**. Their physical implementation files are absent; each still has a distinct scope gate recorded in `docs/SMARTTOOLS_PLANNED_TOOLS_SCOPE_AUDIT.md` and the #139-specific audit. #132 requires a media-processing/privacy decision; #137 concerns medication reconstitution; #138 concerns raw-material/oil formulation; #139 concerns solvent/emulsifier ratios. Existing implementations for #147–150 and #141–142 do not change their separate V7 identity classifications; the V7 conceptual crosswalk must not be treated as proof of aliases.

Recount method: read the ten catalog files and parse each row's `toolId` and `slug`; group slugs to check duplicates; parse `TOOL_REGISTRY` rows independently; compare the two slug sets. Planned rows were checked with `rg -n --glob 'smartToolsCatalog*.ts' "status: 'planned'" lib/tools`. This is a local source audit only; it does not verify deployment behavior, live Supabase state, or the full behavior of all 162 published tools.
