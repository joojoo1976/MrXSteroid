# R5 255-TOOL EXECUTION PLAN

**88 controlled batches of at most three tools each**

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

> Read-only audit. No code, schema, route, registry, database, RLS, Macro or frozen document was changed. No commit, push, merge or deployment was performed.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

## 1. Rules

1. **Maximum three tools per batch.** Batch 1 is the R5 pilots and is closed.
2. **No Batch 2 before explicit final owner acceptance of R5.** This is a hard stop, not a scheduling preference.
3. **Every later batch requires the previous batch’s acceptance.** A batch is not “done” because tests pass; the owner gate is part of done.
4. **Shared fixes are implemented once**, then regression-tested against every affected consumer. Do not clone a BMI narrative into unrelated tools.
5. **No formula change without a source, version, population and independent golden case.** If no source exists, the tool is relabeled, deferred or blocked.
6. **No database, RLS, Macro, route/ID/registry or frozen-document change** without a separate owner authorization.
7. **No commit/push/merge/deployment** as part of a batch unless separately authorized.

## 2. Stop conditions

Stop the batch and report if: a source cannot be verified; the formula would materially change without owner approval; a shared change breaks a consumer; the measurement switch changes the canonical value; the AI explanation diverges from the engine; the accessibility gate fails; or the batch would exceed three tools.

## 3. Batch 1 — R5 (closed, awaiting acceptance)

| Tool | Status | Evidence |
|---|---|---|
| Body Mass Index Calculator (`bmi`) | PASS pending owner acceptance | `R5_FIRST_BATCH_EVIDENCE_REPORT.md` |
| Protein Needs Estimate (`protein-needs`) | PASS pending owner acceptance | `R5_FIRST_BATCH_EVIDENCE_REPORT.md` |
| Daily Water Intake Estimate (`water-intake`) | PASS pending owner acceptance | `R5_FIRST_BATCH_EVIDENCE_REPORT.md` |

Batch 1 fixed the pilot engines, narratives/advice/scenarios, Arabic/English copy, measurement bounds, 44px slider target and the shared accessibility defects (breadcrumb contrast, one `<main>`, header controls, footer hierarchy, logo target). It does **not** close the shared `SafetyNotice`, breadcrumb/metadata localization or the rest of the catalog.

## 4. Batch 2 preview (blocked)

Batch 2 is **not started**. It contains the highest-risk inherited defects:

| Tool | Why first | Required work |
|---|---|---|
| 010 Compound Stack Builder | unsafe aromatase-inhibitor advice; no engine function; estradiol “mg” claim | remove advice/stale AI copy; extract deterministic engine or relabel; add regression test; owner safety review |
| 030 Cycle Cost Calculator | hardcoded PCT $50/$60; empty savings tips | remove/flag assumptions; source the cost inputs or present them as user-entered; add breakdown narrative |
| 106 Glycogen/Water Modeler | arbitrary 600 g cap; duplicate water fields; unused input | remove cap or source it; fix duplicate accounting; use or remove `training_load`; add golden cases |

After Batch 2, Batch 3 covers 100 (report echo), 020 (unsourced genetic score) and 131 (scope/formula provenance).

## 5. All 88 batches

| Batch | Tools (≤3) | Category | Phase | Entry gate | Status |
|---|---|---|---|---|---|
| B1 | Body Mass Index Calculator (`bmi`)<br>Protein Needs Estimate (`protein-needs`)<br>Daily Water Intake Estimate (`water-intake`) | Body Composition, Nutrition | R5 pilot correction (closed) | Owner R5 acceptance | **CLOSED — awaiting owner acceptance** |
| B2 | Compound Stack Builder (`tool-010-compound-stack-builder`)<br>Cycle Cost Calculator (`tool-030-cycle-cost-calculator`)<br>Glycogen Supercompensation & Water Retention Modeler (`tool-106-glycogen-supercompensation-water-modeler`) | Cycle Management, Nutrition | Safety remediation | R5 accepted + safety/formula plan approved | BLOCKED |
| B3 | Comprehensive Report Generator (`tool-100-comprehensive-report-generator`)<br>Genetic Potential Calculator (`tool-020-genetic-potential`)<br>Body Transformation Scenario Calculator (`tool-131-transformation-forecast-trajectory-engine`) | Platform AI, Training & Recovery, Body Composition | Formula/provenance remediation | Batch 2 accepted | BLOCKED |
| B4 | Physique Circumference Ratio Comparison (`tool-136-physique-golden-ratio-score`)<br>Physique Trajectory Scenario Simulator (`tool-149-physique-trajectory-simulator`)<br>SHBG Modulator (`tool-015-shbg-modulator`) | Body Composition, Hormonal Health | Rich-output deepening | Batch 3 accepted | BLOCKED |
| B5 | Product Storage Label & Temperature Record Checker (`tool-143-storage-stability-thermal-degradation-estimator`)<br>General Mass, Volume & Density Calculator (`tool-144-homebrew-chemistry-calculator`)<br>Calorie Adjuster (`tool-012-calorie-adjuster`) | Injection & Formulation, Measurement Conversion, Nutrition | Rich-output deepening | Batch 4 accepted | BLOCKED |
| B6 | Macro Optimizer (`tool-013-macro-optimizer`)<br>Food Quality & Micronutrient Diversity Score (`tool-112-food-quality-micronutrient-diversity-score`)<br>AI Grocery Basket & Meal Cost Optimizer (`tool-113-ai-grocery-basket-meal-cost-optimizer`) | Nutrition | Rich-output deepening | Batch 5 accepted | BLOCKED |
| B7 | Restaurant Macro Navigator & Fast-Food Estimator (`tool-114-restaurant-macro-navigator`)<br>Supplement Evidence & Bio-Stack Navigator (`tool-115-supplement-evidence-bio-stack-navigator`)<br>Nutrition Gap & Fasting Window Optimizer (`tool-116-nutrition-gap-fasting-window-optimizer`) | Nutrition | Rich-output deepening | Batch 6 accepted | BLOCKED |
| B8 | Intra-Workout Nutrient Volumizer & Transport Engine (`tool-117-intra-workout-nutrient-volumizer`)<br>Half-Life Calculator (`tool-016-half-life-calculator`)<br>Lab Result Unit Converter (`tool-140-dosage-unit-conversion-engine`) | Nutrition, Pharmacokinetics | Rich-output deepening | Batch 7 accepted | BLOCKED |
| B9 | Weekly Habit Consistency Tracker (`tool-145-habit-intelligence-consistency-coach`)<br>Emergency Warning Signs Checklist (`tool-146-ai-safety-gate-emergency-protocol`)<br>CNS Recovery Score (`tool-118-cns-recovery-score`) | Platform AI, Training & Recovery | Rich-output deepening | Batch 8 accepted | BLOCKED |
| B10 | Training Volume Load & Hypertrophy Index (`tool-119-training-volume-hypertrophy-index`)<br>Progressive Overload & Adaptive Reserve Capacity Predictor (`tool-120-progressive-overload-predictor`)<br>Muscle Group Recovery Time-Course Modeler (`tool-121-muscle-group-recovery-modeler`) | Training & Recovery | Rich-output deepening | Batch 9 accepted | BLOCKED |
| B11 | RPE / RIR to 1RM Dynamic Velocity Modeler (`tool-122-rpe-rir-1rm-velocity-modeler`)<br>Joint Stress & Connective Tissue Load Risk Index (`tool-123-joint-stress-connective-tissue-index`)<br>Deload Frequency & Fatigue Accumulation Modeler (`tool-124-deload-frequency-fatigue-modeler`) | Training & Recovery | Rich-output deepening | Batch 10 accepted | BLOCKED |
| B12 | Fiber Type Adaptation & Mechanical Tension Score (`tool-125-fiber-type-mechanical-tension-score`)<br>Neuromuscular Performance & Explosiveness Modeler (`tool-126-neuromuscular-explosiveness-modeler`)<br>AI Daily Readiness & Cause Explainer Engine (`tool-127-ai-daily-readiness-explainer`) | Training & Recovery | Rich-output deepening | Batch 11 accepted | BLOCKED |
| B13 | Training Load Balance & Acute-to-Chronic Ratio (`tool-128-training-load-acute-chronic-ratio`)<br>AI Adaptive Training Program Planner (`tool-129-ai-adaptive-training-planner`)<br>AI Plateau Detective & Stagnation Analyzer (`tool-130-ai-plateau-detective`) | Training & Recovery | Rich-output deepening | Batch 12 accepted | BLOCKED |
| B14 | Rep Tempo & Velocity Loss Analyzer (`tool-133-rep-tempo-velocity-loss-analyzer`)<br>Side-to-side Movement Screening Comparison (`tool-134-mobility-movement-symmetry-screen`)<br>Rule-based Exercise Substitution Options (`tool-135-exercise-substitution-ai`) | Training & Recovery | Rich-output deepening | Batch 13 accepted | BLOCKED |
| B15 | Habit Check-in Log (`tool-247-habit-intelligence-coach`)<br>Emergency Warning Checklist (`tool-248-safety-gate-emergency-protocol`)<br>Scientific Evidence Explorer (`tool-249-scientific-evidence-explorer`) | AI Behavior | Standard engine hardening | Batch 14 accepted | BLOCKED |
| B16 | Session-Only Fitness Notes (`tool-250-personal-fitness-memory-layer`)<br>Physique Scenario Simulator (`tool-251-physique-trajectory-simulator`)<br>Manual Context Board (`tool-252-command-center`) | AI Behavior | Standard engine hardening | Batch 15 accepted | BLOCKED |
| B17 | Restaurant Menu Label Calculator (`tool-236-restaurant-macro-navigator`)<br>FFMI & Body Fat Analyzer (`bodyfat`)<br>Water Retention Assessor (`tool-014-water-retention`) | AI Nutrition Vision, Body Composition | Standard engine hardening | Batch 16 accepted | BLOCKED |
| B18 | Fat Metabolism Calculator (`tool-079-fat-metabolism-calculator`)<br>Fiber-Related Performance Observation Log (`tool-238-fiber-type-adaptation-score`)<br>Cycle Architect (`cycle`) | Body Composition, Contest Prep, Cycle Management | Standard engine hardening | Batch 17 accepted | BLOCKED |
| B19 | PCT Timing Engine (`pct-timing`)<br>Compound Scenario Comparison Worksheet (`tool-028-stacking-synergy`)<br>Cycle Length Optimizer (`tool-031-cycle-length-optimizer`) | Cycle Management | Standard engine hardening | Batch 18 accepted | BLOCKED |
| B20 | Stack Compatibility Checker (`tool-038-stack-compatibility`)<br>Cycle Break Planner (`tool-045-cycle-break-planner`)<br>Peptide Product Label Reference Record (`tool-239-peptide-reconstitution`) | Cycle Management, Homebrew Chemistry | Standard engine hardening | Batch 19 accepted | BLOCKED |
| B21 | Carrier Oil Observation Log (`tool-243-carrier-oil-viscosity-estimator`)<br>Storage Observation Log (`tool-245-storage-stability-estimator`)<br>Chemistry Observation Log (`tool-246-homebrew-chemistry`) | Homebrew Chemistry | Standard engine hardening | Batch 20 accepted | BLOCKED |
| B22 | HPTA Recovery Modeler (`hpta-recovery`)<br>Unvalidated Aromatization Scenario (`aromatization-risk`)<br>Advanced PCT Planner (`tool-032-advanced-pct-planner`) | Hormonal Health | Standard engine hardening | Batch 21 accepted | BLOCKED |
| B23 | Estrogen Management Pro (`tool-042-estrogen-management`)<br>Prolactin Management Pro (`tool-043-prolactin-management`)<br>TRT Lifetime Calculator (`tool-046-trt-lifetime`) | Hormonal Health | Standard engine hardening | Batch 22 accepted | BLOCKED |
| B24 | Fertility Preservation Guide (`tool-047-fertility-preservation`)<br>Growth Hormone Protocol Planner (`tool-052-growth-hormone-protocol-planner`)<br>Androgen Receptor Optimizer (`tool-059-androgen-receptor-optimizer`) | Hormonal Health | Standard engine hardening | Batch 23 accepted | BLOCKED |
| B25 | Testicular Suppression Calculator (`tool-063-testicular-suppression-calculator`)<br>Estrogen Sensitivity Manager (`tool-066-estrogen-sensitivity-manager`)<br>Cortisol Stress Calculator (`tool-086-cortisol-stress-calculator`) | Hormonal Health | Standard engine hardening | Batch 24 accepted | BLOCKED |
| B26 | Female Hormone Balance Calculator (`tool-090-female-hormone-balance-calculator`)<br>Female Androgen Dose Evidence Check (`tool-092-female-dosage-calculator`)<br>Interactive Injection Map (`injection`) | Hormonal Health, Injection & Formulation | Standard engine hardening | Batch 25 accepted | BLOCKED |
| B27 | Injection Site History Log (`tool-009-injection-site-rotator`)<br>Injection Experience Log (`tool-026-injection-pain`)<br>Injection Schedule Planner (`tool-036-injection-schedule`) | Injection & Formulation | Standard engine hardening | Batch 26 accepted | BLOCKED |
| B28 | Peptide Dosage Calculator (`tool-051-peptide-dosage-calculator`)<br>Ideal Circular-Tube Pressure Drop Calculator (`tool-141-carrier-oil-viscosity-syringe-pressure`)<br>Mass Arithmetic from a User-Provided Assay (`tool-142-compound-purity-active-yield-estimator`) | Injection & Formulation | Standard engine hardening | Batch 27 accepted | BLOCKED |
| B29 | Smart Lab Reference (`lab`)<br>Side Effect Tracker (`tool-008-side-effect-tracker`)<br>Drug Interaction Checker (`tool-017-drug-interaction`) | Medical Monitoring | Standard engine hardening | Batch 28 accepted | BLOCKED |
| B30 | Medication & Compound Session List (`tool-025-drug-interaction-pro`)<br>Personal Measurement Summary (`tool-029-side-effect-early-warning`)<br>Lab Reading Trend Summary (`tool-033-bloodwork-trend-analyzer`) | Medical Monitoring | Standard engine hardening | Batch 29 accepted | BLOCKED |
| B31 | Side Effect Probability Calculator (`tool-037-side-effect-probability`)<br>Liver Enzyme Tracker (`tool-039-liver-enzyme-tracker`)<br>Lipid Profile Optimizer (`tool-040-lipid-profile-optimizer`) | Medical Monitoring | Standard engine hardening | Batch 30 accepted | BLOCKED |
| B32 | Hematocrit Monitor (`tool-041-hematocrit-monitor`)<br>DHT Side Effect Predictor (`tool-044-dht-side-effects`)<br>Cardiovascular Risk Assessor (`tool-048-cardiovascular-risk`) | Medical Monitoring | Standard engine hardening | Batch 31 accepted | BLOCKED |
| B33 | Bone Density Optimizer (`tool-049-bone-density`)<br>Mental Health Monitor (`tool-050-mental-health`)<br>Glucose Tracker (`tool-054-glucose-tracker`) | Medical Monitoring | Standard engine hardening | Batch 32 accepted | BLOCKED |
| B34 | Insulin Sensitivity Optimizer (`tool-055-insulin-sensitivity-optimizer`)<br>Hair Loss Tracker (`tool-061-hair-loss-tracker`)<br>Prostate Health Manager (`tool-062-prostate-health-manager`) | Medical Monitoring | Standard engine hardening | Batch 33 accepted | BLOCKED |
| B35 | Gynecomastia Tracker (`tool-068-gynecomastia-tracker`)<br>Detoxification Optimizer (`tool-069-detoxification-optimizer`)<br>Oxidative Stress Calculator (`tool-070-oxidative-stress-calculator`) | Medical Monitoring | Standard engine hardening | Batch 34 accepted | BLOCKED |
| B36 | Antioxidant Manager (`tool-071-antioxidant-manager`)<br>Systemic Inflammation Calculator (`tool-072-systemic-inflammation-calculator`)<br>Immune System Optimizer (`tool-073-immune-system-optimizer`) | Medical Monitoring | Standard engine hardening | Batch 35 accepted | BLOCKED |
| B37 | Blood Pressure Tracker (`tool-074-blood-pressure-tracker`)<br>Arterial Health Manager (`tool-075-arterial-health-manager`)<br>Blood Viscosity Calculator (`tool-076-blood-viscosity-calculator`) | Medical Monitoring | Standard engine hardening | Batch 36 accepted | BLOCKED |
| B38 | Nitric Oxide Optimizer (`tool-077-nitric-oxide-optimizer`)<br>Endothelial Health Manager (`tool-078-endothelial-health-manager`)<br>Mitochondrial Optimizer (`tool-080-mitochondrial-optimizer`) | Medical Monitoring | Standard engine hardening | Batch 37 accepted | BLOCKED |
| B39 | Cellular Aging Calculator (`tool-081-cellular-aging-calculator`)<br>Telomere Manager (`tool-082-telomere-manager`)<br>Anti-Aging Inflammation Calculator (`tool-083-anti-aging-inflammation-calculator`) | Medical Monitoring | Standard engine hardening | Batch 38 accepted | BLOCKED |
| B40 | Cognitive Enhancer (`tool-084-cognitive-enhancer`)<br>Sleep Quality Manager (`tool-085-sleep-quality-manager`)<br>Mood Optimizer (`tool-087-mood-optimizer`) | Medical Monitoring | Standard engine hardening | Batch 39 accepted | BLOCKED |
| B41 | Dopamine Tracker (`tool-088-dopamine-tracker`)<br>Serotonin Manager (`tool-089-serotonin-manager`)<br>Skin Observation Log (`tool-095-skin-health-optimizer`) | Medical Monitoring | Standard engine hardening | Batch 40 accepted | BLOCKED |
| B42 | Hair & Nail Observation Log (`tool-096-hair-nail-tracker`)<br>Adaptive Macro Calculator (`macro`)<br>Master Calculator (`master-calculator`) | Medical Monitoring, Nutrition | Standard engine hardening | Batch 41 accepted | BLOCKED |
| B43 | Exercise Sweat-Rate Measurement (`tool-097-hydration-balance-calculator`)<br>AI Meal Vision Scanner & Portion Estimator (`tool-110-ai-meal-vision-scanner`)<br>Smart Food & Macro Substitution Engine (`tool-111-smart-food-macro-substitution`) | Nutrition | Standard engine hardening | Batch 42 accepted | BLOCKED |
| B44 | Half-Life Simulator (`halflife`)<br>Multi-Ester PK Simulator (`multi-ester-pharmacokinetics`)<br>User-Provided Molar Mass Calculator (`tool-027-ester-conversion`) | Pharmacokinetics | Standard engine hardening | Batch 43 accepted | BLOCKED |
| B45 | Single-dose Fractional Decay Scenario (`tool-034-compound-clearance`)<br>Testosterone and Estradiol Unit Converter (`tool-035-hormone-conversion`)<br>Aromatase Conversion Calculator (`tool-065-aromatase-conversion-calculator`) | Pharmacokinetics | Standard engine hardening | Batch 44 accepted | BLOCKED |
| B46 | Injection Site Observation Log (`tool-153-injection-site-rotator`)<br>Compound Observation Record (`tool-154-compound-stack-builder`)<br>Peptide Note Record (`tool-161-peptide-protocol-planner`) | Pharmacokinetics | Standard engine hardening | Batch 45 accepted | BLOCKED |
| B47 | Oral Cycle Note Record (`tool-162-oral-cycle-planner`)<br>Interaction Item Record (`tool-165-drug-interaction-checker-pro`)<br>Pain Note Record (`tool-166-injection-pain-minimizer`) | Pharmacokinetics | Standard engine hardening | Batch 46 accepted | BLOCKED |
| B48 | Item List Record (`tool-168-compound-stacking-synergy`)<br>User-Selected Signal Checklist (`tool-169-side-effect-early-warning`)<br>Scientific Evidence Explorer & Citation Search (`tool-147-scientific-evidence-explorer`) | Pharmacokinetics, Platform AI | Standard engine hardening | Batch 47 accepted | BLOCKED |
| B49 | Session-only Personal Fitness Context (`tool-148-personal-fitness-memory-layer`)<br>Manual Performance Results Organizer (`tool-150-ai-performance-command-center`)<br>HCG & SERM Protocol (`hcg-serm-protocol`) | Platform AI, Reproductive Wellbeing | Standard engine hardening | Batch 48 accepted | BLOCKED |
| B50 | Sperm Production Optimizer (`tool-064-sperm-production-optimizer`)<br>Pregnancy Exposure Information (`tool-094-pregnancy-risk-calculator`)<br>Side-Effect Observation Log (`tool-152-side-effect-tracker`) | Reproductive Wellbeing | Standard engine hardening | Batch 49 accepted | BLOCKED |
| B51 | Genetic Potential Calculator (`genetic`)<br>Transformation Timeline (`timeline`)<br>Intra-Workout Product Label Calculator (`tool-237-intra-workout-volumizer`) | Training & Recovery, AI Nutrition Vision | Standard engine hardening | Batch 50 accepted | BLOCKED |
| B52 | Progress Tracker (`tool-011-progress-tracker`)<br>AI Body Composition Vision Engine (`tool-108-ai-body-composition-vision-engine`)<br>Illustrative Measurement Index (`tool-160-genetic-potential`) | Body Composition | Numeric-minimal expansion | Batch 51 accepted | BLOCKED |
| B53 | Peptide Protocol Planner (`tool-021-peptide-protocol`)<br>Mini PCT Calculator (`tool-056-mini-pct-calculator`)<br>SARM-to-AAS Transition & Bridge Predictor (`tool-101-sarm-to-aas-transition-bridge-predictor`) | Cycle Management | Numeric-minimal expansion | Batch 52 accepted | BLOCKED |
| B54 | Contest Prep Peak-Week Manipulator (`tool-107-contest-prep-peak-week-manipulator`)<br>Competition Readiness & Stage Posing OS (`tool-109-competition-readiness-posing-os`)<br>Measured Sample Density Calculator (`tool-240-raw-powder-density-engine`) | Cycle Management, Homebrew Chemistry | Numeric-minimal expansion | Batch 53 accepted | BLOCKED |
| B55 | Generic Mathematical Ratio Calculator (`tool-241-solvent-ratio`)<br>General Measurement Unit Converter (`tool-242-dosage-unit-conversion-engine`)<br>Generic Input/Output Ratio Calculator (`tool-244-purity-yield-estimator`) | Homebrew Chemistry | Numeric-minimal expansion | Batch 54 accepted | BLOCKED |
| B56 | Estradiol & Prolactin Record (`tool-006-estrogen-prolactin`)<br>HPTA Recovery Monitor (`tool-018-hpta-recovery`)<br>TRT Optimization (`tool-023-trt-optimization`) | Hormonal Health | Numeric-minimal expansion | Batch 55 accepted | BLOCKED |
| B57 | Insulin Conversion Calculator (`tool-053-insulin-conversion-calculator`)<br>Free Testosterone Manager (`tool-057-free-testosterone-manager`)<br>Androgenic Balance Calculator (`tool-058-androgenic-balance-calculator`) | Hormonal Health | Numeric-minimal expansion | Batch 56 accepted | BLOCKED |
| B58 | Estrogen Balance Calculator (`tool-067-estrogen-balance-calculator`)<br>Female Health Observation Log (`tool-091-female-health-optimizer`)<br>Thyroid Function & Metabolic Rate Dynamics (`tool-104-thyroid-metabolic-rate-dynamics`) | Hormonal Health | Numeric-minimal expansion | Batch 57 accepted | BLOCKED |
| B59 | Generic Arithmetic (`tool-219-female-dosage`)<br>Bloodwork Record Log (`tool-007-bloodwork-analyzer`)<br>Cardio Monitor (`tool-019-cardio-monitor`) | Measurement Conversion, Medical Monitoring | Numeric-minimal expansion | Batch 58 accepted | BLOCKED |
| B60 | Lab Reference Interval Comparison (`tool-024-bloodwork-interpreter`)<br>Renal Function & Hydration Index (`tool-103-renal-function-hydration-index`)<br>Generic Unit Arithmetic (`tool-187-insulin-conversion`) | Medical Monitoring | Numeric-minimal expansion | Batch 59 accepted | BLOCKED |
| B61 | Glucose Observation Log (`tool-188-glucose-tracker`)<br>Prostate Data Record (`tool-193-prostate-health-manager`)<br>Value Record (`tool-199-oxidative-stress`) | Medical Monitoring | Numeric-minimal expansion | Batch 60 accepted | BLOCKED |
| B62 | Viscosity Value Record (`tool-204-blood-viscosity`)<br>Metabolism Value Record (`tool-207-fat-metabolism`)<br>Cellular Value Record (`tool-209-cellular-aging`) | Medical Monitoring | Numeric-minimal expansion | Batch 61 accepted | BLOCKED |
| B63 | Sodium-to-Potassium Ratio Calculator (`tool-098-sodium-potassium-manager`)<br>Digestive Observation Log (`tool-099-digestive-health-optimizer`)<br>BMR / TDEE Calculator (`bmr-tdee`) | Nutrition | Numeric-minimal expansion | Batch 62 accepted | BLOCKED |
| B64 | Half-Life Stacker (`tool-022-half-life-stacker`)<br>5-Alpha Conversion Calculator (`tool-060-5-alpha-conversion-calculator`)<br>Subcutaneous vs. Intramuscular PK Modeler (`tool-102-subcutaneous-vs-intramuscular-pk-modeler`) | Pharmacokinetics | Numeric-minimal expansion | Batch 63 accepted | BLOCKED |
| B65 | Accumulation Half-Life Simulator (`tool-151-accumulation-half-life-simulator`)<br>Water Weight Observation (`tool-156-water-retention`)<br>Multi-Compound Half-Life Calculator (`tool-157-multi-compound-half-life`) | Pharmacokinetics | Numeric-minimal expansion | Batch 64 accepted | BLOCKED |
| B66 | Volume Measurement Ratio (`tool-158-volume-measurement`)<br>Half-Life Decay Scenario (`tool-159-compound-half-life-stacker`)<br>Value Comparison (`tool-163-trt-optimization-engine`) | Pharmacokinetics | Numeric-minimal expansion | Batch 65 accepted | BLOCKED |
| B67 | Lab Observation Record (`tool-164-post-cycle-bloodwork-interpreter`)<br>Generic Unit Conversion (`tool-167-ester-conversion`)<br>Cost Sum Calculator (`tool-170-cycle-cost`) | Pharmacokinetics | Numeric-minimal expansion | Batch 66 accepted | BLOCKED |
| B68 | Decay Scenario (`tool-173-compound-clearance`)<br>Unit Conversion (`tool-174-hormone-conversion`)<br>Generic Amount Arithmetic (`tool-185-peptide-dosage`) | Pharmacokinetics | Numeric-minimal expansion | Batch 67 accepted | BLOCKED |
| B69 | Generic Unit Arithmetic (`tool-191-5-alpha-conversion`)<br>AI Health Data Fusion Hub & Timeline (`tool-105-ai-health-data-fusion-hub`)<br>Menstrual Cycle Calendar Log (`tool-093-menstrual-cycle-manager`) | Pharmacokinetics, Platform AI, Reproductive Wellbeing | Numeric-minimal expansion | Batch 68 accepted | BLOCKED |
| B70 | Progress Observation Log (`tool-155-progress-tracker`)<br>One-Rep Max Estimator (`one-rep-max`)<br>Strength Standards (`strength-standards`) | Reproductive Wellbeing, Training & Recovery | Numeric-minimal expansion | Batch 69 accepted | BLOCKED |
| B71 | Training Rest Timer (`rest-timer`)<br>User Entry Aggregator (`tool-225-comprehensive-report-generator`)<br>Data Record (`tool-228-health-data-fusion-hub`) | Training & Recovery, AI Nutrition Vision | Standard engine hardening | Batch 70 accepted | BLOCKED |
| B72 | Body Reference Record (`tool-231-body-composition-vision-engine`)<br>Meal Description Record (`tool-232-meal-vision-scanner`)<br>Food List Record (`tool-233-food-substitution-engine`) | AI Nutrition Vision | Record-only scope decision | Batch 71 accepted | BLOCKED |
| B73 | Food Note Record (`tool-234-food-quality-score`)<br>Basket Record (`tool-235-grocery-basket-optimizer`)<br>Carbohydrate Note Record (`tool-229-glycogen-supercompensation-modeler`) | AI Nutrition Vision, Contest Prep | Record-only scope decision | Batch 72 accepted | BLOCKED |
| B74 | Peak Week Note Record (`tool-230-peak-week-manipulator`)<br>Cardiovascular Note Record (`tool-182-cardiovascular-risk-assessor`)<br>Bone Note Record (`tool-183-bone-density-optimizer`) | Contest Prep, Medical Monitoring | Record-only scope decision | Batch 73 accepted | BLOCKED |
| B75 | Mood Note Record (`tool-184-mental-health-monitor`)<br>GH Note Record (`tool-186-growth-hormone-protocol-planner`)<br>Note Record (`tool-198-detoxification-optimizer`) | Medical Monitoring | Record-only scope decision | Batch 74 accepted | BLOCKED |
| B76 | Item Record (`tool-200-antioxidant-manager`)<br>Inflammation Note Record (`tool-201-systemic-inflammation`)<br>Immune Note Record (`tool-202-immune-system-optimizer`) | Medical Monitoring | Record-only scope decision | Batch 75 accepted | BLOCKED |
| B77 | Arterial Note Record (`tool-203-arterial-health-manager`)<br>Nitric Oxide Note Record (`tool-205-nitric-oxide-optimizer`)<br>Endothelial Note Record (`tool-206-endothelial-health-manager`) | Medical Monitoring | Record-only scope decision | Batch 76 accepted | BLOCKED |
| B78 | Mitochondrial Note Record (`tool-208-mitochondrial-optimizer`)<br>Telomere Note Record (`tool-210-telomere-manager`)<br>Anti-Aging Note Record (`tool-211-anti-aging-inflammation`) | Medical Monitoring | Record-only scope decision | Batch 77 accepted | BLOCKED |
| B79 | Cognitive Note Record (`tool-212-cognitive-enhancer`)<br>Stress Note Record (`tool-213-cortisol-stress`)<br>Mood Record (`tool-214-mood-optimizer`) | Medical Monitoring | Record-only scope decision | Batch 78 accepted | BLOCKED |
| B80 | Dopamine Note Record (`tool-215-dopamine-tracker`)<br>Serotonin Note Record (`tool-216-serotonin-manager`)<br>Skin Note Record (`tool-222-skin-health-optimizer`) | Medical Monitoring | Record-only scope decision | Batch 79 accepted | BLOCKED |
| B81 | Hair and Nail Log (`tool-223-hair-nail-tracker`)<br>Digestive Note Record (`tool-224-digestive-health-optimizer`)<br>Interval Record (`tool-171-cycle-length-optimizer`) | Medical Monitoring, Pharmacokinetics | Record-only scope decision | Batch 80 accepted | BLOCKED |
| B82 | Value Delta (`tool-172-bloodwork-trend-analyzer`)<br>Date Record (`tool-175-injection-schedule-planner`)<br>Symptom Note Record (`tool-176-side-effect-probability`) | Pharmacokinetics | Record-only scope decision | Batch 81 accepted | BLOCKED |
| B83 | Compatibility Item Record (`tool-177-stack-compatibility-checker`)<br>Androgen Item Record (`tool-189-androgenic-balance`)<br>Receptor Note Record (`tool-190-androgen-receptor-optimizer`) | Pharmacokinetics | Record-only scope decision | Batch 82 accepted | BLOCKED |
| B84 | Transition Note Record (`tool-226-sarm-to-aas-transition-predictor`)<br>Route Note Record (`tool-227-subq-vs-im-pk-modeler`)<br>DHT Observation Record (`tool-178-dht-side-effect-predictor`) | Pharmacokinetics, Reproductive Wellbeing | Record-only scope decision | Batch 83 accepted | BLOCKED |
| B85 | Break Date Record (`tool-179-cycle-break-planner`)<br>TRT Note Record (`tool-180-trt-lifetime`)<br>Fertility Note Record (`tool-181-fertility-preservation-guide`) | Reproductive Wellbeing | Record-only scope decision | Batch 84 accepted | BLOCKED |
| B86 | Hair Observation Log (`tool-192-hair-loss-tracker`)<br>Suppression Note Record (`tool-194-testicular-suppression`)<br>Fertility Note Record (`tool-195-sperm-production-optimizer`) | Reproductive Wellbeing | Record-only scope decision | Batch 85 accepted | BLOCKED |
| B87 | Estrogen Note Record (`tool-196-estrogen-sensitivity-manager`)<br>Observation Log (`tool-197-gynecomastia-tracker`)<br>Hormone Note Record (`tool-217-female-hormone-balance`) | Reproductive Wellbeing | Record-only scope decision | Batch 86 accepted | BLOCKED |
| B88 | Health Note Record (`tool-218-female-health-optimizer`)<br>Date Record (`tool-220-menstrual-cycle-manager`)<br>Pregnancy Note Record (`tool-221-pregnancy-risk`) | Reproductive Wellbeing | Record-only scope decision | Batch 87 accepted | BLOCKED |

**Totals:** 88 batches · 264 implemented tools · 0 batches with more than three tools.

## 6. Phase summary

| Phase | Batches | Intent |
|---|---:|---|
| R5 pilot correction | 1 | closed; acceptance pending |
| Safety remediation | 1 | tool-010 release blocker |
| Formula/provenance remediation | 1 | 020/030/100/106/131 decisions |
| Rich-output deepening | 11 | narrative, scenarios, visuals, AI findings |
| Standard engine hardening | 38 | schema, source, tests, narrative, measurement |
| Numeric-minimal expansion | 19 | add interpretation, units, tests, reports |
| Record-only scope decision | 17 | owner decides record vs calculator; no invented formulas |

## 7. Definition of done (per batch)

1. **Audit update:** the tool dossier reflects the current engine, schema, inputs, outputs, formula source and assumptions.
2. **Formula:** source/version/population recorded; three independent golden cases + min-1/min/max/max+1/NaN/Infinity.
3. **Schema:** strict, finite guards where numeric, clear error messages.
4. **Narrative:** primary result, why, status, limitations, provenance; scenarios only where supported.
5. **Language:** EN/AR labels, errors, result, AI copy; RTL; no English fragment; no reload.
6. **Measurement:** canonical/display metadata; switch before/after input; round-trip; no drift.
7. **Accessibility:** one `<main>`, labelled controls, 44px targets, keyboard, reduced motion, axe.
8. **AI:** only if it adds grounded value; consent; deterministic fallback; zero numeric divergence; no medical advice.
9. **Tests:** new engine/UI/locale/measurement/a11y tests; targeted regression; full-suite baseline recorded, not called green.
10. **Preview:** live route at 375px, EN/AR, metric/imperial, invalid input, empty state.
11. **Report:** batch implementation/evidence report; owner gate.

## 8. Record-only decision (batches 72–88)

The 53 record-only tools cannot be “fixed” by adding a BMI-style formula. Before those batches, the owner must choose per tool:

- **A — Keep as a record:** relabel title/slug promise, add typed capture, timeline, export and neutral completeness summary.
- **B — Rebuild as a calculator:** requires a validated domain formula, input schema, reference cases and a new engine. Until then it stays record-only.

No medical inference is allowed from a record. No AI summary may diagnose or recommend treatment.

## 9. Planned tools backlog

| # | Tool | Blocker |
|---:|---|---|
| 132 | AI Pose & Exercise Form Coach (`tool-132-ai-pose-form-coach`) | no component/engine/schema; href lacks category; build authorization required |
| 137 | Peptide & Hormone Reconstitution Calculator (`tool-137-peptide-hormone-reconstitution-calculator`) | no component/engine/schema; href lacks category; build authorization required |
| 138 | Raw Powder Density & Oil Formulation Engine (`tool-138-raw-powder-density-oil-formulation-engine`) | no component/engine/schema; href lacks category; build authorization required |
| 139 | Solvent & Emulsifier Ratio Calculator (BA/BB) (`tool-139-solvent-emulsifier-ratio-calculator`) | no component/engine/schema; href lacks category; build authorization required |

These four are outside the 88 batches and must not be counted as launched tools.

## 10. First action after owner acceptance

1. Record the R5 acceptance in `R5_FIRST_BATCH_FINAL_PREVIEW_AND_ACCEPTANCE_REPORT.md`.
2. Run Batch 2: tool-010 safety remediation, then 030/106 formula decisions.
3. Fix the shared `SafetyNotice` and breadcrumb/metadata localization once, with consumer regression tests.
4. Do not start Batch 3 until Batch 2 is accepted.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
