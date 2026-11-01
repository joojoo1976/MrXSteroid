# SMARTTOOLS 252 — Identity Reconciliation Audit

Status: **READY FOR HUMAN REVIEW**. The embedded crosswalk table and unresolved identity list have been synchronized to the independently validated CSV. This remains a read-only identity/count audit; it does not change the master inventory, registry, catalog, application routes, or tool identities.

Generated from the checked-out source on 2026-10-25. Branch: `main`; HEAD: `254ce1299bff227c54809bb7027f9b587d69c143`.

## Revalidation correction — 2026-10-25

The current `SMARTTOOLS_252_IDENTITY_CROSSWALK.csv` was revalidated against cited source files and lines: 252 unique IDs, **5 EXACT_MATCH**, **93 POSSIBLE_CONCEPTUAL_MATCH**, **154 UNRESOLVED**, **0 VERIFIED_ALIAS**, and zero evidence errors. IDs 151–252 contain 88 possible conceptual matches and 14 unresolved entries. Revalidation found **30/252 rows** whose candidate/classification differed from the older embedded table; those rows and the exact unresolved list below are now synchronized to the validated CSV. No conceptual candidate is an approved alias. No tool identity, route, source record, or CSV row was changed by this correction.

## A. Registry and catalog counts

| Source file | Exported symbol | Raw records | Unique slug/ID | Duplicate |
|---|---:|---:|---:|---:|
| `lib/tools/registry.ts` | `TOOL_REGISTRY` | 154 | 154 | 0 |
| `lib/engines/core/v6/tools.registry.v7.252.ts` | `TOOLS_REGISTRY_V7_252` | 252 | 252 approved IDs / 252 numbers | 0 ID / 0 number duplicates |

The present checked-out `TOOL_REGISTRY` has **154 raw records, 154 unique slugs, and 0 duplicates**. The often-quoted 130 count is not reproducible from `lib/tools/registry.ts` / `TOOL_REGISTRY`; it likely came from a different snapshot or a filtered set, but this audit does not guess which. It cannot be reconciled to the current 154 by assumption.

| Catalog source | Exported symbol | Records |
|---|---|---:|
| `lib/tools/smartToolsCatalog.ts` | `SMART_TOOLS_CATALOG` | 11 |
| `lib/tools/smartToolsCatalog10.ts` | `SMART_TOOLS_CATALOG_10` | 32 |
| `lib/tools/smartToolsCatalog2.ts` | `SMART_TOOLS_CATALOG_2` | 5 |
| `lib/tools/smartToolsCatalog3.ts` | `SMART_TOOLS_CATALOG_3` | 8 |
| `lib/tools/smartToolsCatalog4.ts` | `SMART_TOOLS_CATALOG_4` | 4 |
| `lib/tools/smartToolsCatalog5.ts` | `SMART_TOOLS_CATALOG_5` | 11 |
| `lib/tools/smartToolsCatalog6.ts` | `SMART_TOOLS_CATALOG_6` | 20 |
| `lib/tools/smartToolsCatalog7.ts` | `SMART_TOOLS_CATALOG_7` | 25 |
| `lib/tools/smartToolsCatalog8.ts` | `SMART_TOOLS_CATALOG_8` | 25 |
| `lib/tools/smartToolsCatalog9.ts` | `SMART_TOOLS_CATALOG_9` | 25 |
| **Combined via `catalogAll()`** | `getCatalogTools()` | **166** |
| **User-visible subset** | `getPublishedCatalogTools()` | **159** (7 planned excluded) |

Combined local catalog: 166 raw records, 166 unique tool IDs, 166 unique slugs, and 0 duplicate slugs. Current status counts: {"implemented":159,"planned":7}. All 159 published entries have category mappings and component/engine/schema files according to the current file check.

Exact local catalog slug vs app registry slug sets: catalog-only **12**, registry-only **0**, intersection **154**, union **166**.

Catalog-only slugs: `bmr-tdee`, `protein-needs`, `tool-132-ai-pose-form-coach`, `tool-137-peptide-hormone-reconstitution-calculator`, `tool-138-raw-powder-density-oil-formulation-engine`, `tool-139-solvent-emulsifier-ratio-calculator`, `tool-141-carrier-oil-viscosity-syringe-pressure`, `tool-142-compound-purity-active-yield-estimator`, `tool-147-scientific-evidence-explorer`, `tool-148-personal-fitness-memory-layer`, `tool-150-ai-performance-command-center`, `water-intake`

Registry-only slugs: none

The V7 registry has 252 unique numbered identities. The local catalog has 166 identities (157 published + 9 planned); the numerical difference is 86 records, but **that arithmetic is not proof that 86 specific V7 tools are missing**. Identity matching below uses direct slug equality as exact; suffix/title-based candidates remain possible conceptual matches pending owner confirmation. No conceptual candidate is elevated to VERIFIED_ALIAS.

Reproducible source reads: `git branch --show-current`; `git rev-parse HEAD`; `npm run validate-tools`; and the checked-out exports in the paths above. Catalog set comparison was made by importing `getCatalogTools()` / `getPublishedCatalogTools()` from `lib/tools/smartToolsCatalog4.ts` and comparing their `slug` values with the parsed `TOOL_REGISTRY[].slug` values.

## B. Approved V7 identity crosswalk (252 rows)

The approved slug column is the V7 `id` field (this registry does not expose a separate `slug` property). Candidate matching rules are deliberately narrow: exact slug → `EXACT_MATCH`; one unique local slug ending in `-${approvedId}` or one unique exact English title → `POSSIBLE_CONCEPTUAL_MATCH`; otherwise `UNRESOLVED`. No explicit crosswalk source was found for assigning `VERIFIED_ALIAS`. Evidence points to the exact source line in each registry/catalog shard. Local routes are preserved as recorded in catalog `href`; approved V7 routes are copied from `navigation.toolPage`.

| V7 # | Approved slug / ID | Candidate local slug | Source path:line evidence | Approved route; local route | Classification |
|---:|---|---|---|---|---|
| 1 | `body-fat` | `bodyfat` | `lib/engines/core/v6/tools.registry.v7.252.ts:20; lib/tools/smartToolsCatalog.ts:42; lib/tools/registry.ts:34` | `v7 /tools/body-fat; local /smarttools/body-composition/bodyfat` | POSSIBLE_CONCEPTUAL_MATCH |
| 2 | `lean-body-mass` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:21` | `v7 /tools/lean-body-mass; local —` | UNRESOLVED |
| 3 | `fat-mass-index` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:22` | `v7 /tools/fat-mass-index; local —` | UNRESOLVED |
| 4 | `ffmi` | `bodyfat` | `lib/engines/core/v6/tools.registry.v7.252.ts:23; lib/tools/smartToolsCatalog.ts:42; lib/tools/registry.ts:34` | `v7 /tools/ffmi; local /smarttools/body-composition/bodyfat` | POSSIBLE_CONCEPTUAL_MATCH |
| 5 | `ideal-body-weight` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:24` | `v7 /tools/ideal-body-weight; local —` | UNRESOLVED |
| 6 | `waist-to-hip-ratio` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:25` | `v7 /tools/waist-to-hip-ratio; local —` | UNRESOLVED |
| 7 | `waist-to-height-ratio` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:26` | `v7 /tools/waist-to-height-ratio; local —` | UNRESOLVED |
| 8 | `body-adiposity-index` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:27` | `v7 /tools/body-adiposity-index; local —` | UNRESOLVED |
| 9 | `body-shape-index` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:28` | `v7 /tools/body-shape-index; local —` | UNRESOLVED |
| 10 | `ponderal-index` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:29` | `v7 /tools/ponderal-index; local —` | UNRESOLVED |
| 11 | `body-surface-area` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:30` | `v7 /tools/body-surface-area; local —` | UNRESOLVED |
| 12 | `frame-size` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:31` | `v7 /tools/frame-size; local —` | UNRESOLVED |
| 13 | `somatotype` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:32` | `v7 /tools/somatotype; local —` | UNRESOLVED |
| 14 | `muscle-mass-percentage` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:33` | `v7 /tools/muscle-mass-percentage; local —` | UNRESOLVED |
| 15 | `bone-mass` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:34` | `v7 /tools/bone-mass; local —` | UNRESOLVED |
| 16 | `body-water-percentage` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:35` | `v7 /tools/body-water-percentage; local —` | UNRESOLVED |
| 17 | `body-protein-percentage` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:36` | `v7 /tools/body-protein-percentage; local —` | UNRESOLVED |
| 18 | `bmr` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:37` | `v7 /tools/bmr; local —` | UNRESOLVED |
| 19 | `tdee` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:38` | `v7 /tools/tdee; local —` | UNRESOLVED |
| 20 | `body-fat-distribution` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:39` | `v7 /tools/body-fat-distribution; local —` | UNRESOLVED |
| 21 | `visceral-fat` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:40` | `v7 /tools/visceral-fat; local —` | UNRESOLVED |
| 22 | `subcutaneous-fat` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:41` | `v7 /tools/subcutaneous-fat; local —` | UNRESOLVED |
| 23 | `limb-length-ratios` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:42` | `v7 /tools/limb-length-ratios; local —` | UNRESOLVED |
| 24 | `sitting-height-ratio` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:43` | `v7 /tools/sitting-height-ratio; local —` | UNRESOLVED |
| 25 | `arm-span-to-height` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:44` | `v7 /tools/arm-span-to-height; local —` | UNRESOLVED |
| 26 | `calorie` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:45` | `v7 /tools/calorie; local —` | UNRESOLVED |
| 27 | `macro-split` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:46` | `v7 /tools/macro-split; local —` | UNRESOLVED |
| 28 | `protein-needs` | `protein-needs` | `lib/engines/core/v6/tools.registry.v7.252.ts:47; lib/tools/smartToolsCatalog10.ts:10` | `v7 /tools/protein-needs; local /smarttools/nutrition/protein-needs` | EXACT_MATCH |
| 29 | `carb-cycling` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:48` | `v7 /tools/carb-cycling; local —` | UNRESOLVED |
| 30 | `fat-needs` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:49` | `v7 /tools/fat-needs; local —` | UNRESOLVED |
| 31 | `fiber-needs` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:50` | `v7 /tools/fiber-needs; local —` | UNRESOLVED |
| 32 | `meal-timing` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:51` | `v7 /tools/meal-timing; local —` | UNRESOLVED |
| 33 | `glycemic-load` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:52` | `v7 /tools/glycemic-load; local —` | UNRESOLVED |
| 34 | `insulin-load` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:53` | `v7 /tools/insulin-load; local —` | UNRESOLVED |
| 35 | `thermic-effect-of-food` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:54` | `v7 /tools/thermic-effect-of-food; local —` | UNRESOLVED |
| 36 | `alcohol-calories` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:55` | `v7 /tools/alcohol-calories; local —` | UNRESOLVED |
| 37 | `cheat-meal-planner` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:56` | `v7 /tools/cheat-meal-planner; local —` | UNRESOLVED |
| 38 | `refeed` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:57` | `v7 /tools/refeed; local —` | UNRESOLVED |
| 39 | `diet-break-planner` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:58` | `v7 /tools/diet-break-planner; local —` | UNRESOLVED |
| 40 | `reverse-dieting` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:59` | `v7 /tools/reverse-dieting; local —` | UNRESOLVED |
| 41 | `water-intake` | `water-intake` | `lib/engines/core/v6/tools.registry.v7.252.ts:60; lib/tools/smartToolsCatalog10.ts:11` | `v7 /tools/water-intake; local /smarttools/nutrition/water-intake` | EXACT_MATCH |
| 42 | `electrolyte-needs` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:61` | `v7 /tools/electrolyte-needs; local —` | UNRESOLVED |
| 43 | `vitamin-mineral-needs` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:62` | `v7 /tools/vitamin-mineral-needs; local —` | UNRESOLVED |
| 44 | `supplement-dosage` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:63` | `v7 /tools/supplement-dosage; local —` | UNRESOLVED |
| 45 | `creatine-loading` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:64` | `v7 /tools/creatine-loading; local —` | UNRESOLVED |
| 46 | `caffeine` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:65` | `v7 /tools/caffeine; local —` | UNRESOLVED |
| 47 | `pre-workout-timing` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:66` | `v7 /tools/pre-workout-timing; local —` | UNRESOLVED |
| 48 | `post-workout-nutrition` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:67` | `v7 /tools/post-workout-nutrition; local —` | UNRESOLVED |
| 49 | `intermittent-fasting-timer` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:68` | `v7 /tools/intermittent-fasting-timer; local —` | UNRESOLVED |
| 50 | `anabolic-window` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:69` | `v7 /tools/anabolic-window; local —` | UNRESOLVED |
| 51 | `training-volume` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:70` | `v7 /tools/training-volume; local —` | UNRESOLVED |
| 52 | `intensity` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:71` | `v7 /tools/intensity; local —` | UNRESOLVED |
| 53 | `rpe-to-1rm-converter` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:72` | `v7 /tools/rpe-to-1rm-converter; local —` | UNRESOLVED |
| 54 | `rir` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:73` | `v7 /tools/rir; local —` | UNRESOLVED |
| 55 | `progressive-overload-planner` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:74` | `v7 /tools/progressive-overload-planner; local —` | UNRESOLVED |
| 56 | `deload` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:75` | `v7 /tools/deload; local —` | UNRESOLVED |
| 57 | `training-frequency-optimizer` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:76` | `v7 /tools/training-frequency-optimizer; local —` | UNRESOLVED |
| 58 | `rest-period` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:77` | `v7 /tools/rest-period; local —` | UNRESOLVED |
| 59 | `superset-planner` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:78` | `v7 /tools/superset-planner; local —` | UNRESOLVED |
| 60 | `drop-set` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:79` | `v7 /tools/drop-set; local —` | UNRESOLVED |
| 61 | `myo-reps` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:80` | `v7 /tools/myo-reps; local —` | UNRESOLVED |
| 62 | `rest-pause` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:81` | `v7 /tools/rest-pause; local —` | UNRESOLVED |
| 63 | `cluster-sets` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:82` | `v7 /tools/cluster-sets; local —` | UNRESOLVED |
| 64 | `german-volume-training` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:83` | `v7 /tools/german-volume-training; local —` | UNRESOLVED |
| 65 | `5x5` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:84` | `v7 /tools/5x5; local —` | UNRESOLVED |
| 66 | `5-3-1` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:85` | `v7 /tools/5-3-1; local —` | UNRESOLVED |
| 67 | `nsuns` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:86` | `v7 /tools/nsuns; local —` | UNRESOLVED |
| 68 | `training-split-generator` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:87` | `v7 /tools/training-split-generator; local —` | UNRESOLVED |
| 69 | `weekly-volume-per-muscle` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:88` | `v7 /tools/weekly-volume-per-muscle; local —` | UNRESOLVED |
| 70 | `effective-reps` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:89` | `v7 /tools/effective-reps; local —` | UNRESOLVED |
| 71 | `junk-volume-detector` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:90` | `v7 /tools/junk-volume-detector; local —` | UNRESOLVED |
| 72 | `recovery-time` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:91` | `v7 /tools/recovery-time; local —` | UNRESOLVED |
| 73 | `sleep-need-for-recovery` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:92` | `v7 /tools/sleep-need-for-recovery; local —` | UNRESOLVED |
| 74 | `hrv-based-readiness` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:93` | `v7 /tools/hrv-based-readiness; local —` | UNRESOLVED |
| 75 | `acwr` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:94` | `v7 /tools/acwr; local —` | UNRESOLVED |
| 76 | `monotony-strain` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:95` | `v7 /tools/monotony-strain; local —` | UNRESOLVED |
| 77 | `training-stress-score` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:96` | `v7 /tools/training-stress-score; local —` | UNRESOLVED |
| 78 | `fatigue-accumulation` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:97` | `v7 /tools/fatigue-accumulation; local —` | UNRESOLVED |
| 79 | `overtraining-risk` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:98` | `v7 /tools/overtraining-risk; local —` | UNRESOLVED |
| 80 | `active-recovery-planner` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:99` | `v7 /tools/active-recovery-planner; local —` | UNRESOLVED |
| 81 | `mobility-score` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:100` | `v7 /tools/mobility-score; local —` | UNRESOLVED |
| 82 | `symmetry-index` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:101` | `v7 /tools/symmetry-index; local —` | UNRESOLVED |
| 83 | `injury-risk-predictor` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:102` | `v7 /tools/injury-risk-predictor; local —` | UNRESOLVED |
| 84 | `pain-scale-tracker` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:103` | `v7 /tools/pain-scale-tracker; local —` | UNRESOLVED |
| 85 | `rehab-timeline` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:104` | `v7 /tools/rehab-timeline; local —` | UNRESOLVED |
| 86 | `one-rep-max` | `one-rep-max` | `lib/engines/core/v6/tools.registry.v7.252.ts:105; lib/tools/smartToolsCatalog10.ts:6; lib/tools/registry.ts:184` | `v7 /tools/one-rep-max; local /smarttools/training-recovery/one-rep-max` | EXACT_MATCH |
| 87 | `wilks-score` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:106` | `v7 /tools/wilks-score; local —` | UNRESOLVED |
| 88 | `dots-score` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:107` | `v7 /tools/dots-score; local —` | UNRESOLVED |
| 89 | `ipf-points` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:108` | `v7 /tools/ipf-points; local —` | UNRESOLVED |
| 90 | `sinclair-coefficient` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:109` | `v7 /tools/sinclair-coefficient; local —` | UNRESOLVED |
| 91 | `relative-strength` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:110` | `v7 /tools/relative-strength; local —` | UNRESOLVED |
| 92 | `strength-standards` | `strength-standards` | `lib/engines/core/v6/tools.registry.v7.252.ts:111; lib/tools/smartToolsCatalog10.ts:7; lib/tools/registry.ts:185` | `v7 /tools/strength-standards; local /smarttools/training-recovery/strength-standards` | EXACT_MATCH |
| 93 | `power` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:112` | `v7 /tools/power; local —` | UNRESOLVED |
| 94 | `force` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:113` | `v7 /tools/force; local —` | UNRESOLVED |
| 95 | `work` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:114` | `v7 /tools/work; local —` | UNRESOLVED |
| 96 | `impulse-momentum` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:115` | `v7 /tools/impulse-momentum; local —` | UNRESOLVED |
| 97 | `rate-of-force-development` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:116` | `v7 /tools/rate-of-force-development; local —` | UNRESOLVED |
| 98 | `reactive-strength-index` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:117` | `v7 /tools/reactive-strength-index; local —` | UNRESOLVED |
| 99 | `rsi-modified` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:118` | `v7 /tools/rsi-modified; local —` | UNRESOLVED |
| 100 | `jump-height-to-power` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:119` | `v7 /tools/jump-height-to-power; local —` | UNRESOLVED |
| 101 | `sprint-speed-acceleration` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:120` | `v7 /tools/sprint-speed-acceleration; local —` | UNRESOLVED |
| 102 | `agility-t-test` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:121` | `v7 /tools/agility-t-test; local —` | UNRESOLVED |
| 103 | `illinois-agility` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:122` | `v7 /tools/illinois-agility; local —` | UNRESOLVED |
| 104 | `40-yard-dash-converter` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:123` | `v7 /tools/40-yard-dash-converter; local —` | UNRESOLVED |
| 105 | `vertical-jump-power` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:124` | `v7 /tools/vertical-jump-power; local —` | UNRESOLVED |
| 106 | `broad-jump-power` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:125` | `v7 /tools/broad-jump-power; local —` | UNRESOLVED |
| 107 | `medicine-ball-throw` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:126` | `v7 /tools/medicine-ball-throw; local —` | UNRESOLVED |
| 108 | `wingate-power-test` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:127` | `v7 /tools/wingate-power-test; local —` | UNRESOLVED |
| 109 | `critical-power` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:128` | `v7 /tools/critical-power; local —` | UNRESOLVED |
| 110 | `vo2max-estimator` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:129` | `v7 /tools/vo2max-estimator; local —` | UNRESOLVED |
| 111 | `lactate-threshold` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:130` | `v7 /tools/lactate-threshold; local —` | UNRESOLVED |
| 112 | `heart-rate-zones` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:131` | `v7 /tools/heart-rate-zones; local —` | UNRESOLVED |
| 113 | `pace` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:132` | `v7 /tools/pace; local —` | UNRESOLVED |
| 114 | `running-power` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:133` | `v7 /tools/running-power; local —` | UNRESOLVED |
| 115 | `cycling-power-ftp` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:134` | `v7 /tools/cycling-power-ftp; local —` | UNRESOLVED |
| 116 | `golden-ratio-physique` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:135` | `v7 /tools/golden-ratio-physique; local —` | UNRESOLVED |
| 117 | `shoulder-to-waist-ratio` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:136` | `v7 /tools/shoulder-to-waist-ratio; local —` | UNRESOLVED |
| 118 | `chest-to-waist-ratio` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:137` | `v7 /tools/chest-to-waist-ratio; local —` | UNRESOLVED |
| 119 | `arm-to-waist-ratio` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:138` | `v7 /tools/arm-to-waist-ratio; local —` | UNRESOLVED |
| 120 | `leg-to-torso-ratio` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:139` | `v7 /tools/leg-to-torso-ratio; local —` | UNRESOLVED |
| 121 | `arm-length-to-height` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:140` | `v7 /tools/arm-length-to-height; local —` | UNRESOLVED |
| 122 | `calf-to-bicep-ratio` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:141` | `v7 /tools/calf-to-bicep-ratio; local —` | UNRESOLVED |
| 123 | `neck-to-arm-ratio` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:142` | `v7 /tools/neck-to-arm-ratio; local —` | UNRESOLVED |
| 124 | `physique-rating-scale` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:143` | `v7 /tools/physique-rating-scale; local —` | UNRESOLVED |
| 125 | `bodybuilding-competition-score` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:144` | `v7 /tools/bodybuilding-competition-score; local —` | UNRESOLVED |
| 126 | `neuromuscular-performance-modeler` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:145` | `v7 /tools/neuromuscular-performance-modeler; local —` | UNRESOLVED |
| 127 | `daily-readiness-cause-explainer` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:146` | `v7 /tools/daily-readiness-cause-explainer; local —` | UNRESOLVED |
| 128 | `training-load-balance-acwr` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:147` | `v7 /tools/training-load-balance-acwr; local —` | UNRESOLVED |
| 129 | `adaptive-training-program-planner` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:148` | `v7 /tools/adaptive-training-program-planner; local —` | UNRESOLVED |
| 130 | `plateau-detective-stagnation-analyzer` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:149` | `v7 /tools/plateau-detective-stagnation-analyzer; local —` | UNRESOLVED |
| 131 | `transformation-forecast-engine` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:150` | `v7 /tools/transformation-forecast-engine; local —` | UNRESOLVED |
| 132 | `pose-form-coach-vision` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:151` | `v7 /tools/pose-form-coach-vision; local —` | UNRESOLVED |
| 133 | `rep-tempo-velocity-loss-analyzer` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:152` | `v7 /tools/rep-tempo-velocity-loss-analyzer; local —` | UNRESOLVED |
| 134 | `mobility-symmetry-screen` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:153` | `v7 /tools/mobility-symmetry-screen; local —` | UNRESOLVED |
| 135 | `exercise-substitution-advisor` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:154` | `v7 /tools/exercise-substitution-advisor; local —` | UNRESOLVED |
| 136 | `physique-proportion-balance` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:155` | `v7 /tools/physique-proportion-balance; local —` | UNRESOLVED |
| 137 | `testosterone-to-epit-ratio` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:156` | `v7 /tools/testosterone-to-epit-ratio; local —` | UNRESOLVED |
| 138 | `free-testosterone` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:157` | `v7 /tools/free-testosterone; local —` | UNRESOLVED |
| 139 | `shbg` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:158` | `v7 /tools/shbg; local —` | UNRESOLVED |
| 140 | `estradiol-management` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:159` | `v7 /tools/estradiol-management; local —` | UNRESOLVED |
| 141 | `prolactin-risk` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:160` | `v7 /tools/prolactin-risk; local —` | UNRESOLVED |
| 142 | `hematocrit-hemoglobin-tracker` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:161` | `v7 /tools/hematocrit-hemoglobin-tracker; local —` | UNRESOLVED |
| 143 | `blood-pressure-risk` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:162` | `v7 /tools/blood-pressure-risk; local —` | UNRESOLVED |
| 144 | `lipid-panel-analyzer` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:163` | `v7 /tools/lipid-panel-analyzer; local —` | UNRESOLVED |
| 145 | `liver-enzymes-analyzer` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:164` | `v7 /tools/liver-enzymes-analyzer; local —` | UNRESOLVED |
| 146 | `kidney-function` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:165` | `v7 /tools/kidney-function; local —` | UNRESOLVED |
| 147 | `thyroid-panel` | `tool-104-thyroid-metabolic-rate-dynamics` | `lib/engines/core/v6/tools.registry.v7.252.ts:166; lib/tools/smartToolsCatalog9.ts:8; lib/tools/registry.ts:145` | `v7 /tools/thyroid-panel; local /smarttools/tool-104-thyroid-metabolic-rate-dynamics` | POSSIBLE_CONCEPTUAL_MATCH |
| 148 | `insulin-sensitivity` | `tool-055-insulin-sensitivity-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:167; lib/tools/smartToolsCatalog7.ts:14; lib/tools/registry.ts:96` | `v7 /tools/insulin-sensitivity; local /smarttools/tool-055-insulin-sensitivity-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 149 | `aromatization-risk` | `aromatization-risk` | `lib/engines/core/v6/tools.registry.v7.252.ts:168; lib/tools/smartToolsCatalog2.ts:4; lib/tools/registry.ts:44` | `v7 /tools/aromatization-risk; local /smarttools/aromatization-risk` | EXACT_MATCH |
| 150 | `pct-planner-recovery-timeline` | `tool-032-advanced-pct-planner` | `lib/engines/core/v6/tools.registry.v7.252.ts:169; lib/tools/smartToolsCatalog6.ts:5; lib/tools/registry.ts:73` | `v7 /tools/pct-planner-recovery-timeline; local /smarttools/tool-032-advanced-pct-planner` | POSSIBLE_CONCEPTUAL_MATCH |
| 151 | `accumulation-half-life-simulator` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:170` | `v7 /tools/accumulation-half-life-simulator; local —` | UNRESOLVED |
| 152 | `side-effect-tracker` | `tool-008-side-effect-tracker` | `lib/engines/core/v6/tools.registry.v7.252.ts:171; lib/tools/smartToolsCatalog3.ts:4; lib/tools/registry.ts:49` | `v7 /tools/side-effect-tracker; local /smarttools/tool-008-side-effect-tracker` | POSSIBLE_CONCEPTUAL_MATCH |
| 153 | `injection-site-rotator` | `tool-009-injection-site-rotator` | `lib/engines/core/v6/tools.registry.v7.252.ts:172; lib/tools/smartToolsCatalog3.ts:5; lib/tools/registry.ts:50` | `v7 /tools/injection-site-rotator; local /smarttools/tool-009-injection-site-rotator` | POSSIBLE_CONCEPTUAL_MATCH |
| 154 | `compound-stack-builder` | `tool-010-compound-stack-builder` | `lib/engines/core/v6/tools.registry.v7.252.ts:173; lib/tools/smartToolsCatalog3.ts:6; lib/tools/registry.ts:51` | `v7 /tools/compound-stack-builder; local /smarttools/tool-010-compound-stack-builder` | POSSIBLE_CONCEPTUAL_MATCH |
| 155 | `progress-tracker` | `tool-011-progress-tracker` | `lib/engines/core/v6/tools.registry.v7.252.ts:174; lib/tools/smartToolsCatalog3.ts:7; lib/tools/registry.ts:52` | `v7 /tools/progress-tracker; local /smarttools/tool-011-progress-tracker` | POSSIBLE_CONCEPTUAL_MATCH |
| 156 | `water-retention` | `tool-014-water-retention` | `lib/engines/core/v6/tools.registry.v7.252.ts:175; lib/tools/smartToolsCatalog3.ts:10; lib/tools/registry.ts:55` | `v7 /tools/water-retention; local /smarttools/tool-014-water-retention` | POSSIBLE_CONCEPTUAL_MATCH |
| 157 | `multi-compound-half-life` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:176` | `v7 /tools/multi-compound-half-life; local —` | UNRESOLVED |
| 158 | `injection-volume` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:177` | `v7 /tools/injection-volume; local —` | UNRESOLVED |
| 159 | `compound-half-life-stacker` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:178` | `v7 /tools/compound-half-life-stacker; local —` | UNRESOLVED |
| 160 | `genetic-potential` | `tool-020-genetic-potential` | `lib/engines/core/v6/tools.registry.v7.252.ts:179; lib/tools/smartToolsCatalog5.ts:4; lib/tools/registry.ts:61` | `v7 /tools/genetic-potential; local /smarttools/tool-020-genetic-potential` | POSSIBLE_CONCEPTUAL_MATCH |
| 161 | `peptide-protocol-planner` | `tool-021-peptide-protocol` | `lib/engines/core/v6/tools.registry.v7.252.ts:180; lib/tools/smartToolsCatalog5.ts:5; lib/tools/registry.ts:62` | `v7 /tools/peptide-protocol-planner; local /smarttools/tool-021-peptide-protocol` | POSSIBLE_CONCEPTUAL_MATCH |
| 162 | `oral-cycle-planner` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:181` | `v7 /tools/oral-cycle-planner; local —` | UNRESOLVED |
| 163 | `trt-optimization-engine` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:182` | `v7 /tools/trt-optimization-engine; local —` | UNRESOLVED |
| 164 | `post-cycle-bloodwork-interpreter` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:183` | `v7 /tools/post-cycle-bloodwork-interpreter; local —` | UNRESOLVED |
| 165 | `drug-interaction-checker-pro` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:184` | `v7 /tools/drug-interaction-checker-pro; local —` | UNRESOLVED |
| 166 | `injection-pain-minimizer` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:185` | `v7 /tools/injection-pain-minimizer; local —` | UNRESOLVED |
| 167 | `ester-conversion` | `tool-027-ester-conversion` | `lib/engines/core/v6/tools.registry.v7.252.ts:186; lib/tools/smartToolsCatalog5.ts:11; lib/tools/registry.ts:68` | `v7 /tools/ester-conversion; local /smarttools/tool-027-ester-conversion` | POSSIBLE_CONCEPTUAL_MATCH |
| 168 | `compound-stacking-synergy` | `tool-028-stacking-synergy` | `lib/engines/core/v6/tools.registry.v7.252.ts:187; lib/tools/smartToolsCatalog5.ts:12; lib/tools/registry.ts:69` | `v7 /tools/compound-stacking-synergy; local /smarttools/tool-028-stacking-synergy` | POSSIBLE_CONCEPTUAL_MATCH |
| 169 | `side-effect-early-warning` | `tool-029-side-effect-early-warning` | `lib/engines/core/v6/tools.registry.v7.252.ts:188; lib/tools/smartToolsCatalog5.ts:13; lib/tools/registry.ts:70` | `v7 /tools/side-effect-early-warning; local /smarttools/tool-029-side-effect-early-warning` | POSSIBLE_CONCEPTUAL_MATCH |
| 170 | `cycle-cost` | `tool-030-cycle-cost-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:189; lib/tools/smartToolsCatalog5.ts:14; lib/tools/registry.ts:71` | `v7 /tools/cycle-cost; local /smarttools/tool-030-cycle-cost-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 171 | `cycle-length-optimizer` | `tool-031-cycle-length-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:190; lib/tools/smartToolsCatalog6.ts:4; lib/tools/registry.ts:72` | `v7 /tools/cycle-length-optimizer; local /smarttools/tool-031-cycle-length-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 172 | `bloodwork-trend-analyzer` | `tool-033-bloodwork-trend-analyzer` | `lib/engines/core/v6/tools.registry.v7.252.ts:191; lib/tools/smartToolsCatalog6.ts:6; lib/tools/registry.ts:74` | `v7 /tools/bloodwork-trend-analyzer; local /smarttools/tool-033-bloodwork-trend-analyzer` | POSSIBLE_CONCEPTUAL_MATCH |
| 173 | `compound-clearance` | `tool-034-compound-clearance` | `lib/engines/core/v6/tools.registry.v7.252.ts:192; lib/tools/smartToolsCatalog6.ts:7; lib/tools/registry.ts:75` | `v7 /tools/compound-clearance; local /smarttools/tool-034-compound-clearance` | POSSIBLE_CONCEPTUAL_MATCH |
| 174 | `hormone-conversion` | `tool-035-hormone-conversion` | `lib/engines/core/v6/tools.registry.v7.252.ts:193; lib/tools/smartToolsCatalog6.ts:8; lib/tools/registry.ts:81` | `v7 /tools/hormone-conversion; local /smarttools/tool-035-hormone-conversion` | POSSIBLE_CONCEPTUAL_MATCH |
| 175 | `injection-schedule-planner` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:194` | `v7 /tools/injection-schedule-planner; local —` | UNRESOLVED |
| 176 | `side-effect-probability` | `tool-037-side-effect-probability` | `lib/engines/core/v6/tools.registry.v7.252.ts:195; lib/tools/smartToolsCatalog6.ts:10; lib/tools/registry.ts:77` | `v7 /tools/side-effect-probability; local /smarttools/tool-037-side-effect-probability` | POSSIBLE_CONCEPTUAL_MATCH |
| 177 | `stack-compatibility-checker` | `tool-038-stack-compatibility` | `lib/engines/core/v6/tools.registry.v7.252.ts:196; lib/tools/smartToolsCatalog6.ts:11; lib/tools/registry.ts:78` | `v7 /tools/stack-compatibility-checker; local /smarttools/tool-038-stack-compatibility` | POSSIBLE_CONCEPTUAL_MATCH |
| 178 | `dht-side-effect-predictor` | `tool-044-dht-side-effects` | `lib/engines/core/v6/tools.registry.v7.252.ts:197; lib/tools/smartToolsCatalog6.ts:17; lib/tools/registry.ts:85` | `v7 /tools/dht-side-effect-predictor; local /smarttools/tool-044-dht-side-effects` | POSSIBLE_CONCEPTUAL_MATCH |
| 179 | `cycle-break-planner` | `tool-045-cycle-break-planner` | `lib/engines/core/v6/tools.registry.v7.252.ts:198; lib/tools/smartToolsCatalog6.ts:18; lib/tools/registry.ts:86` | `v7 /tools/cycle-break-planner; local /smarttools/tool-045-cycle-break-planner` | POSSIBLE_CONCEPTUAL_MATCH |
| 180 | `trt-lifetime` | `tool-046-trt-lifetime` | `lib/engines/core/v6/tools.registry.v7.252.ts:199; lib/tools/smartToolsCatalog6.ts:19; lib/tools/registry.ts:87` | `v7 /tools/trt-lifetime; local /smarttools/tool-046-trt-lifetime` | POSSIBLE_CONCEPTUAL_MATCH |
| 181 | `fertility-preservation-guide` | `tool-047-fertility-preservation` | `lib/engines/core/v6/tools.registry.v7.252.ts:200; lib/tools/smartToolsCatalog6.ts:20; lib/tools/registry.ts:88` | `v7 /tools/fertility-preservation-guide; local /smarttools/tool-047-fertility-preservation` | POSSIBLE_CONCEPTUAL_MATCH |
| 182 | `cardiovascular-risk-assessor` | `tool-048-cardiovascular-risk` | `lib/engines/core/v6/tools.registry.v7.252.ts:201; lib/tools/smartToolsCatalog6.ts:21; lib/tools/registry.ts:89` | `v7 /tools/cardiovascular-risk-assessor; local /smarttools/tool-048-cardiovascular-risk` | POSSIBLE_CONCEPTUAL_MATCH |
| 183 | `bone-density-optimizer` | `tool-049-bone-density` | `lib/engines/core/v6/tools.registry.v7.252.ts:202; lib/tools/smartToolsCatalog6.ts:22; lib/tools/registry.ts:90` | `v7 /tools/bone-density-optimizer; local /smarttools/tool-049-bone-density` | POSSIBLE_CONCEPTUAL_MATCH |
| 184 | `mental-health-monitor` | `tool-050-mental-health` | `lib/engines/core/v6/tools.registry.v7.252.ts:203; lib/tools/smartToolsCatalog6.ts:23; lib/tools/registry.ts:91` | `v7 /tools/mental-health-monitor; local /smarttools/tool-050-mental-health` | POSSIBLE_CONCEPTUAL_MATCH |
| 185 | `peptide-dosage` | `tool-051-peptide-dosage-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:204; lib/tools/smartToolsCatalog7.ts:10; lib/tools/registry.ts:92` | `v7 /tools/peptide-dosage; local /smarttools/tool-051-peptide-dosage-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 186 | `growth-hormone-protocol-planner` | `tool-052-growth-hormone-protocol-planner` | `lib/engines/core/v6/tools.registry.v7.252.ts:205; lib/tools/smartToolsCatalog7.ts:11; lib/tools/registry.ts:93` | `v7 /tools/growth-hormone-protocol-planner; local /smarttools/tool-052-growth-hormone-protocol-planner` | POSSIBLE_CONCEPTUAL_MATCH |
| 187 | `insulin-conversion` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:206` | `v7 /tools/insulin-conversion; local —` | UNRESOLVED |
| 188 | `glucose-tracker` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:207` | `v7 /tools/glucose-tracker; local —` | UNRESOLVED |
| 189 | `androgenic-balance` | `tool-058-androgenic-balance-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:208; lib/tools/smartToolsCatalog7.ts:17; lib/tools/registry.ts:99` | `v7 /tools/androgenic-balance; local /smarttools/tool-058-androgenic-balance-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 190 | `androgen-receptor-optimizer` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:209` | `v7 /tools/androgen-receptor-optimizer; local —` | UNRESOLVED |
| 191 | `5-alpha-conversion` | — | `lib/engines/core/v6/tools.registry.v7.252.ts:210` | `v7 /tools/5-alpha-conversion; local —` | UNRESOLVED |
| 192 | `hair-loss-tracker` | `tool-061-hair-loss-tracker` | `lib/engines/core/v6/tools.registry.v7.252.ts:211; lib/tools/smartToolsCatalog7.ts:20; lib/tools/registry.ts:102` | `v7 /tools/hair-loss-tracker; local /smarttools/tool-061-hair-loss-tracker` | POSSIBLE_CONCEPTUAL_MATCH |
| 193 | `prostate-health-manager` | `tool-062-prostate-health-manager` | `lib/engines/core/v6/tools.registry.v7.252.ts:212; lib/tools/smartToolsCatalog7.ts:21; lib/tools/registry.ts:103` | `v7 /tools/prostate-health-manager; local /smarttools/tool-062-prostate-health-manager` | POSSIBLE_CONCEPTUAL_MATCH |
| 194 | `testicular-suppression` | `tool-063-testicular-suppression-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:213; lib/tools/smartToolsCatalog7.ts:22; lib/tools/registry.ts:104` | `v7 /tools/testicular-suppression; local /smarttools/tool-063-testicular-suppression-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 195 | `sperm-production-optimizer` | `tool-064-sperm-production-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:214; lib/tools/smartToolsCatalog7.ts:23; lib/tools/registry.ts:105` | `v7 /tools/sperm-production-optimizer; local /smarttools/tool-064-sperm-production-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 196 | `estrogen-sensitivity-manager` | `tool-066-estrogen-sensitivity-manager` | `lib/engines/core/v6/tools.registry.v7.252.ts:215; lib/tools/smartToolsCatalog7.ts:25; lib/tools/registry.ts:107` | `v7 /tools/estrogen-sensitivity-manager; local /smarttools/tool-066-estrogen-sensitivity-manager` | POSSIBLE_CONCEPTUAL_MATCH |
| 197 | `gynecomastia-tracker` | `tool-068-gynecomastia-tracker` | `lib/engines/core/v6/tools.registry.v7.252.ts:216; lib/tools/smartToolsCatalog7.ts:27; lib/tools/registry.ts:109` | `v7 /tools/gynecomastia-tracker; local /smarttools/tool-068-gynecomastia-tracker` | POSSIBLE_CONCEPTUAL_MATCH |
| 198 | `detoxification-optimizer` | `tool-069-detoxification-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:217; lib/tools/smartToolsCatalog7.ts:28; lib/tools/registry.ts:110` | `v7 /tools/detoxification-optimizer; local /smarttools/tool-069-detoxification-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 199 | `oxidative-stress` | `tool-070-oxidative-stress-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:218; lib/tools/smartToolsCatalog7.ts:29; lib/tools/registry.ts:111` | `v7 /tools/oxidative-stress; local /smarttools/tool-070-oxidative-stress-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 200 | `antioxidant-manager` | `tool-071-antioxidant-manager` | `lib/engines/core/v6/tools.registry.v7.252.ts:219; lib/tools/smartToolsCatalog7.ts:30; lib/tools/registry.ts:112` | `v7 /tools/antioxidant-manager; local /smarttools/tool-071-antioxidant-manager` | POSSIBLE_CONCEPTUAL_MATCH |
| 201 | `systemic-inflammation` | `tool-072-systemic-inflammation-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:220; lib/tools/smartToolsCatalog7.ts:31; lib/tools/registry.ts:113` | `v7 /tools/systemic-inflammation; local /smarttools/tool-072-systemic-inflammation-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 202 | `immune-system-optimizer` | `tool-073-immune-system-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:221; lib/tools/smartToolsCatalog7.ts:32; lib/tools/registry.ts:114` | `v7 /tools/immune-system-optimizer; local /smarttools/tool-073-immune-system-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 203 | `arterial-health-manager` | `tool-075-arterial-health-manager` | `lib/engines/core/v6/tools.registry.v7.252.ts:222; lib/tools/smartToolsCatalog7.ts:34; lib/tools/registry.ts:116` | `v7 /tools/arterial-health-manager; local /smarttools/tool-075-arterial-health-manager` | POSSIBLE_CONCEPTUAL_MATCH |
| 204 | `blood-viscosity` | `tool-076-blood-viscosity-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:223; lib/tools/smartToolsCatalog8.ts:10; lib/tools/registry.ts:117` | `v7 /tools/blood-viscosity; local /smarttools/tool-076-blood-viscosity-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 205 | `nitric-oxide-optimizer` | `tool-077-nitric-oxide-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:224; lib/tools/smartToolsCatalog8.ts:11; lib/tools/registry.ts:118` | `v7 /tools/nitric-oxide-optimizer; local /smarttools/tool-077-nitric-oxide-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 206 | `endothelial-health-manager` | `tool-078-endothelial-health-manager` | `lib/engines/core/v6/tools.registry.v7.252.ts:225; lib/tools/smartToolsCatalog8.ts:12; lib/tools/registry.ts:119` | `v7 /tools/endothelial-health-manager; local /smarttools/tool-078-endothelial-health-manager` | POSSIBLE_CONCEPTUAL_MATCH |
| 207 | `fat-metabolism` | `tool-079-fat-metabolism-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:226; lib/tools/smartToolsCatalog8.ts:13; lib/tools/registry.ts:120` | `v7 /tools/fat-metabolism; local /smarttools/tool-079-fat-metabolism-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 208 | `mitochondrial-optimizer` | `tool-080-mitochondrial-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:227; lib/tools/smartToolsCatalog8.ts:14; lib/tools/registry.ts:121` | `v7 /tools/mitochondrial-optimizer; local /smarttools/tool-080-mitochondrial-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 209 | `cellular-aging` | `tool-081-cellular-aging-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:228; lib/tools/smartToolsCatalog8.ts:15; lib/tools/registry.ts:122` | `v7 /tools/cellular-aging; local /smarttools/tool-081-cellular-aging-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 210 | `telomere-manager` | `tool-082-telomere-manager` | `lib/engines/core/v6/tools.registry.v7.252.ts:229; lib/tools/smartToolsCatalog8.ts:16; lib/tools/registry.ts:123` | `v7 /tools/telomere-manager; local /smarttools/tool-082-telomere-manager` | POSSIBLE_CONCEPTUAL_MATCH |
| 211 | `anti-aging-inflammation` | `tool-083-anti-aging-inflammation-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:230; lib/tools/smartToolsCatalog8.ts:17; lib/tools/registry.ts:124` | `v7 /tools/anti-aging-inflammation; local /smarttools/tool-083-anti-aging-inflammation-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 212 | `cognitive-enhancer` | `tool-084-cognitive-enhancer` | `lib/engines/core/v6/tools.registry.v7.252.ts:231; lib/tools/smartToolsCatalog8.ts:18; lib/tools/registry.ts:125` | `v7 /tools/cognitive-enhancer; local /smarttools/tool-084-cognitive-enhancer` | POSSIBLE_CONCEPTUAL_MATCH |
| 213 | `cortisol-stress` | `tool-086-cortisol-stress-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:232; lib/tools/smartToolsCatalog8.ts:20; lib/tools/registry.ts:127` | `v7 /tools/cortisol-stress; local /smarttools/tool-086-cortisol-stress-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 214 | `mood-optimizer` | `tool-087-mood-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:233; lib/tools/smartToolsCatalog8.ts:21; lib/tools/registry.ts:128` | `v7 /tools/mood-optimizer; local /smarttools/tool-087-mood-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 215 | `dopamine-tracker` | `tool-088-dopamine-tracker` | `lib/engines/core/v6/tools.registry.v7.252.ts:234; lib/tools/smartToolsCatalog8.ts:22; lib/tools/registry.ts:129` | `v7 /tools/dopamine-tracker; local /smarttools/tool-088-dopamine-tracker` | POSSIBLE_CONCEPTUAL_MATCH |
| 216 | `serotonin-manager` | `tool-089-serotonin-manager` | `lib/engines/core/v6/tools.registry.v7.252.ts:235; lib/tools/smartToolsCatalog8.ts:23; lib/tools/registry.ts:130` | `v7 /tools/serotonin-manager; local /smarttools/tool-089-serotonin-manager` | POSSIBLE_CONCEPTUAL_MATCH |
| 217 | `female-hormone-balance` | `tool-090-female-hormone-balance-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:236; lib/tools/smartToolsCatalog8.ts:24; lib/tools/registry.ts:131` | `v7 /tools/female-hormone-balance; local /smarttools/tool-090-female-hormone-balance-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 218 | `female-health-optimizer` | `tool-091-female-health-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:237; lib/tools/smartToolsCatalog8.ts:25; lib/tools/registry.ts:132` | `v7 /tools/female-health-optimizer; local /smarttools/tool-091-female-health-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 219 | `female-dosage` | `tool-092-female-dosage-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:238; lib/tools/smartToolsCatalog8.ts:26; lib/tools/registry.ts:133` | `v7 /tools/female-dosage; local /smarttools/tool-092-female-dosage-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 220 | `menstrual-cycle-manager` | `tool-093-menstrual-cycle-manager` | `lib/engines/core/v6/tools.registry.v7.252.ts:239; lib/tools/smartToolsCatalog8.ts:27; lib/tools/registry.ts:134` | `v7 /tools/menstrual-cycle-manager; local /smarttools/tool-093-menstrual-cycle-manager` | POSSIBLE_CONCEPTUAL_MATCH |
| 221 | `pregnancy-risk` | `tool-094-pregnancy-risk-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:240; lib/tools/smartToolsCatalog8.ts:28; lib/tools/registry.ts:135` | `v7 /tools/pregnancy-risk; local /smarttools/tool-094-pregnancy-risk-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 222 | `skin-health-optimizer` | `tool-095-skin-health-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:241; lib/tools/smartToolsCatalog8.ts:29; lib/tools/registry.ts:136` | `v7 /tools/skin-health-optimizer; local /smarttools/tool-095-skin-health-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 223 | `hair-nail-tracker` | `tool-096-hair-nail-tracker` | `lib/engines/core/v6/tools.registry.v7.252.ts:242; lib/tools/smartToolsCatalog8.ts:30; lib/tools/registry.ts:137` | `v7 /tools/hair-nail-tracker; local /smarttools/tool-096-hair-nail-tracker` | POSSIBLE_CONCEPTUAL_MATCH |
| 224 | `digestive-health-optimizer` | `tool-099-digestive-health-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:243; lib/tools/smartToolsCatalog8.ts:33; lib/tools/registry.ts:140` | `v7 /tools/digestive-health-optimizer; local /smarttools/tool-099-digestive-health-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 225 | `comprehensive-report-generator` | `tool-100-comprehensive-report-generator` | `lib/engines/core/v6/tools.registry.v7.252.ts:244; lib/tools/smartToolsCatalog8.ts:34; lib/tools/registry.ts:141` | `v7 /tools/comprehensive-report-generator; local /smarttools/tool-100-comprehensive-report-generator` | POSSIBLE_CONCEPTUAL_MATCH |
| 226 | `sarm-to-aas-transition-predictor` | `tool-101-sarm-to-aas-transition-bridge-predictor` | `lib/engines/core/v6/tools.registry.v7.252.ts:245; lib/tools/smartToolsCatalog9.ts:5; lib/tools/registry.ts:142` | `v7 /tools/sarm-to-aas-transition-predictor; local /smarttools/tool-101-sarm-to-aas-transition-bridge-predictor` | POSSIBLE_CONCEPTUAL_MATCH |
| 227 | `subq-vs-im-pk-modeler` | `tool-102-subcutaneous-vs-intramuscular-pk-modeler` | `lib/engines/core/v6/tools.registry.v7.252.ts:246; lib/tools/smartToolsCatalog9.ts:6; lib/tools/registry.ts:143` | `v7 /tools/subq-vs-im-pk-modeler; local /smarttools/tool-102-subcutaneous-vs-intramuscular-pk-modeler` | POSSIBLE_CONCEPTUAL_MATCH |
| 228 | `health-data-fusion-hub` | `tool-105-ai-health-data-fusion-hub` | `lib/engines/core/v6/tools.registry.v7.252.ts:247; lib/tools/smartToolsCatalog9.ts:9; lib/tools/registry.ts:146` | `v7 /tools/health-data-fusion-hub; local /smarttools/tool-105-ai-health-data-fusion-hub` | POSSIBLE_CONCEPTUAL_MATCH |
| 229 | `glycogen-supercompensation-modeler` | `tool-106-glycogen-supercompensation-water-modeler` | `lib/engines/core/v6/tools.registry.v7.252.ts:248; lib/tools/smartToolsCatalog9.ts:10; lib/tools/registry.ts:147` | `v7 /tools/glycogen-supercompensation-modeler; local /smarttools/tool-106-glycogen-supercompensation-water-modeler` | POSSIBLE_CONCEPTUAL_MATCH |
| 230 | `peak-week-manipulator` | `tool-107-contest-prep-peak-week-manipulator` | `lib/engines/core/v6/tools.registry.v7.252.ts:249; lib/tools/smartToolsCatalog9.ts:11; lib/tools/registry.ts:148` | `v7 /tools/peak-week-manipulator; local /smarttools/tool-107-contest-prep-peak-week-manipulator` | POSSIBLE_CONCEPTUAL_MATCH |
| 231 | `body-composition-vision-engine` | `tool-108-ai-body-composition-vision-engine` | `lib/engines/core/v6/tools.registry.v7.252.ts:250; lib/tools/smartToolsCatalog9.ts:12; lib/tools/registry.ts:149` | `v7 /tools/body-composition-vision-engine; local /smarttools/tool-108-ai-body-composition-vision-engine` | POSSIBLE_CONCEPTUAL_MATCH |
| 232 | `meal-vision-scanner` | `tool-110-ai-meal-vision-scanner` | `lib/engines/core/v6/tools.registry.v7.252.ts:251; lib/tools/smartToolsCatalog9.ts:14; lib/tools/registry.ts:151` | `v7 /tools/meal-vision-scanner; local /smarttools/tool-110-ai-meal-vision-scanner` | POSSIBLE_CONCEPTUAL_MATCH |
| 233 | `food-substitution-engine` | `tool-111-smart-food-macro-substitution` | `lib/engines/core/v6/tools.registry.v7.252.ts:252; lib/tools/smartToolsCatalog9.ts:15; lib/tools/registry.ts:152` | `v7 /tools/food-substitution-engine; local /smarttools/nutrition/tool-111-smart-food-macro-substitution` | POSSIBLE_CONCEPTUAL_MATCH |
| 234 | `food-quality-score` | `tool-112-food-quality-micronutrient-diversity-score` | `lib/engines/core/v6/tools.registry.v7.252.ts:253; lib/tools/smartToolsCatalog9.ts:16; lib/tools/registry.ts:153` | `v7 /tools/food-quality-score; local /smarttools/nutrition/tool-112-food-quality-micronutrient-diversity-score` | POSSIBLE_CONCEPTUAL_MATCH |
| 235 | `grocery-basket-optimizer` | `tool-113-ai-grocery-basket-meal-cost-optimizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:254; lib/tools/smartToolsCatalog9.ts:17; lib/tools/registry.ts:154` | `v7 /tools/grocery-basket-optimizer; local /smarttools/nutrition/tool-113-ai-grocery-basket-meal-cost-optimizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 236 | `restaurant-macro-navigator` | `tool-114-restaurant-macro-navigator` | `lib/engines/core/v6/tools.registry.v7.252.ts:255; lib/tools/smartToolsCatalog9.ts:18; lib/tools/registry.ts:155` | `v7 /tools/restaurant-macro-navigator; local /smarttools/nutrition/tool-114-restaurant-macro-navigator` | POSSIBLE_CONCEPTUAL_MATCH |
| 237 | `intra-workout-volumizer` | `tool-117-intra-workout-nutrient-volumizer` | `lib/engines/core/v6/tools.registry.v7.252.ts:256; lib/tools/smartToolsCatalog9.ts:21; lib/tools/registry.ts:158` | `v7 /tools/intra-workout-volumizer; local /smarttools/nutrition/tool-117-intra-workout-nutrient-volumizer` | POSSIBLE_CONCEPTUAL_MATCH |
| 238 | `fiber-type-adaptation-score` | `tool-125-fiber-type-mechanical-tension-score` | `lib/engines/core/v6/tools.registry.v7.252.ts:257; lib/tools/smartToolsCatalog9.ts:29; lib/tools/registry.ts:166` | `v7 /tools/fiber-type-adaptation-score; local /smarttools/training-recovery/tool-125-fiber-type-mechanical-tension-score` | POSSIBLE_CONCEPTUAL_MATCH |
| 239 | `peptide-reconstitution` | `tool-137-peptide-hormone-reconstitution-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:258; lib/tools/smartToolsCatalog10.ts:23` | `v7 /tools/peptide-reconstitution; local /smarttools/tool-137-peptide-hormone-reconstitution-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 240 | `raw-powder-density-engine` | `tool-138-raw-powder-density-oil-formulation-engine` | `lib/engines/core/v6/tools.registry.v7.252.ts:259; lib/tools/smartToolsCatalog10.ts:24` | `v7 /tools/raw-powder-density-engine; local /smarttools/tool-138-raw-powder-density-oil-formulation-engine` | POSSIBLE_CONCEPTUAL_MATCH |
| 241 | `solvent-ratio` | `tool-139-solvent-emulsifier-ratio-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:260; lib/tools/smartToolsCatalog10.ts:25` | `v7 /tools/solvent-ratio; local /smarttools/tool-139-solvent-emulsifier-ratio-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 242 | `dosage-unit-conversion-engine` | `tool-140-dosage-unit-conversion-engine` | `lib/engines/core/v6/tools.registry.v7.252.ts:261; lib/tools/smartToolsCatalog10.ts:26; lib/tools/registry.ts:178` | `v7 /tools/dosage-unit-conversion-engine; local /smarttools/tool-140-dosage-unit-conversion-engine` | POSSIBLE_CONCEPTUAL_MATCH |
| 243 | `carrier-oil-viscosity-estimator` | `tool-141-carrier-oil-viscosity-syringe-pressure` | `lib/engines/core/v6/tools.registry.v7.252.ts:262; lib/tools/smartToolsCatalog10.ts:27` | `v7 /tools/carrier-oil-viscosity-estimator; local /smarttools/tool-141-carrier-oil-viscosity-syringe-pressure` | POSSIBLE_CONCEPTUAL_MATCH |
| 244 | `purity-yield-estimator` | `tool-142-compound-purity-active-yield-estimator` | `lib/engines/core/v6/tools.registry.v7.252.ts:263; lib/tools/smartToolsCatalog10.ts:28` | `v7 /tools/purity-yield-estimator; local /smarttools/tool-142-compound-purity-active-yield-estimator` | POSSIBLE_CONCEPTUAL_MATCH |
| 245 | `storage-stability-estimator` | `tool-143-storage-stability-thermal-degradation-estimator` | `lib/engines/core/v6/tools.registry.v7.252.ts:264; lib/tools/smartToolsCatalog10.ts:29; lib/tools/registry.ts:181` | `v7 /tools/storage-stability-estimator; local /smarttools/tool-143-storage-stability-thermal-degradation-estimator` | POSSIBLE_CONCEPTUAL_MATCH |
| 246 | `homebrew-chemistry` | `tool-144-homebrew-chemistry-calculator` | `lib/engines/core/v6/tools.registry.v7.252.ts:265; lib/tools/smartToolsCatalog10.ts:30; lib/tools/registry.ts:182` | `v7 /tools/homebrew-chemistry; local /smarttools/tool-144-homebrew-chemistry-calculator` | POSSIBLE_CONCEPTUAL_MATCH |
| 247 | `habit-intelligence-coach` | `tool-145-habit-intelligence-consistency-coach` | `lib/engines/core/v6/tools.registry.v7.252.ts:266; lib/tools/smartToolsCatalog10.ts:31; lib/tools/registry.ts:179` | `v7 /tools/habit-intelligence-coach; local /smarttools/tool-145-habit-intelligence-consistency-coach` | POSSIBLE_CONCEPTUAL_MATCH |
| 248 | `safety-gate-emergency-protocol` | `tool-146-ai-safety-gate-emergency-protocol` | `lib/engines/core/v6/tools.registry.v7.252.ts:267; lib/tools/smartToolsCatalog10.ts:32; lib/tools/registry.ts:180` | `v7 /tools/safety-gate-emergency-protocol; local /smarttools/tool-146-ai-safety-gate-emergency-protocol` | POSSIBLE_CONCEPTUAL_MATCH |
| 249 | `scientific-evidence-explorer` | `tool-147-scientific-evidence-explorer` | `lib/engines/core/v6/tools.registry.v7.252.ts:268; lib/tools/smartToolsCatalog10.ts:33` | `v7 /tools/scientific-evidence-explorer; local /smarttools/tool-147-scientific-evidence-explorer` | POSSIBLE_CONCEPTUAL_MATCH |
| 250 | `personal-fitness-memory-layer` | `tool-148-personal-fitness-memory-layer` | `lib/engines/core/v6/tools.registry.v7.252.ts:269; lib/tools/smartToolsCatalog10.ts:34` | `v7 /tools/personal-fitness-memory-layer; local /smarttools/tool-148-personal-fitness-memory-layer` | POSSIBLE_CONCEPTUAL_MATCH |
| 251 | `physique-trajectory-simulator` | `tool-149-physique-trajectory-simulator` | `lib/engines/core/v6/tools.registry.v7.252.ts:270; lib/tools/smartToolsCatalog10.ts:35; lib/tools/registry.ts:173` | `v7 /tools/physique-trajectory-simulator; local /smarttools/tool-149-physique-trajectory-simulator` | POSSIBLE_CONCEPTUAL_MATCH |
| 252 | `command-center` | `tool-150-ai-performance-command-center` | `lib/engines/core/v6/tools.registry.v7.252.ts:271; lib/tools/smartToolsCatalog10.ts:36` | `v7 /tools/command-center; local /smarttools/tool-150-ai-performance-command-center` | POSSIBLE_CONCEPTUAL_MATCH |

Classification totals: UNRESOLVED=154, POSSIBLE_CONCEPTUAL_MATCH=93, EXACT_MATCH=5, VERIFIED_ALIAS=0.

### Exact unresolved identity list

- V7 #2 `lean-body-mass` — source `lib/engines/core/v6/tools.registry.v7.252.ts:21`; approved route `/tools/lean-body-mass`.
- V7 #3 `fat-mass-index` — source `lib/engines/core/v6/tools.registry.v7.252.ts:22`; approved route `/tools/fat-mass-index`.
- V7 #5 `ideal-body-weight` — source `lib/engines/core/v6/tools.registry.v7.252.ts:24`; approved route `/tools/ideal-body-weight`.
- V7 #6 `waist-to-hip-ratio` — source `lib/engines/core/v6/tools.registry.v7.252.ts:25`; approved route `/tools/waist-to-hip-ratio`.
- V7 #7 `waist-to-height-ratio` — source `lib/engines/core/v6/tools.registry.v7.252.ts:26`; approved route `/tools/waist-to-height-ratio`.
- V7 #8 `body-adiposity-index` — source `lib/engines/core/v6/tools.registry.v7.252.ts:27`; approved route `/tools/body-adiposity-index`.
- V7 #9 `body-shape-index` — source `lib/engines/core/v6/tools.registry.v7.252.ts:28`; approved route `/tools/body-shape-index`.
- V7 #10 `ponderal-index` — source `lib/engines/core/v6/tools.registry.v7.252.ts:29`; approved route `/tools/ponderal-index`.
- V7 #11 `body-surface-area` — source `lib/engines/core/v6/tools.registry.v7.252.ts:30`; approved route `/tools/body-surface-area`.
- V7 #12 `frame-size` — source `lib/engines/core/v6/tools.registry.v7.252.ts:31`; approved route `/tools/frame-size`.
- V7 #13 `somatotype` — source `lib/engines/core/v6/tools.registry.v7.252.ts:32`; approved route `/tools/somatotype`.
- V7 #14 `muscle-mass-percentage` — source `lib/engines/core/v6/tools.registry.v7.252.ts:33`; approved route `/tools/muscle-mass-percentage`.
- V7 #15 `bone-mass` — source `lib/engines/core/v6/tools.registry.v7.252.ts:34`; approved route `/tools/bone-mass`.
- V7 #16 `body-water-percentage` — source `lib/engines/core/v6/tools.registry.v7.252.ts:35`; approved route `/tools/body-water-percentage`.
- V7 #17 `body-protein-percentage` — source `lib/engines/core/v6/tools.registry.v7.252.ts:36`; approved route `/tools/body-protein-percentage`.
- V7 #18 `bmr` — source `lib/engines/core/v6/tools.registry.v7.252.ts:37`; approved route `/tools/bmr`.
- V7 #19 `tdee` — source `lib/engines/core/v6/tools.registry.v7.252.ts:38`; approved route `/tools/tdee`.
- V7 #20 `body-fat-distribution` — source `lib/engines/core/v6/tools.registry.v7.252.ts:39`; approved route `/tools/body-fat-distribution`.
- V7 #21 `visceral-fat` — source `lib/engines/core/v6/tools.registry.v7.252.ts:40`; approved route `/tools/visceral-fat`.
- V7 #22 `subcutaneous-fat` — source `lib/engines/core/v6/tools.registry.v7.252.ts:41`; approved route `/tools/subcutaneous-fat`.
- V7 #23 `limb-length-ratios` — source `lib/engines/core/v6/tools.registry.v7.252.ts:42`; approved route `/tools/limb-length-ratios`.
- V7 #24 `sitting-height-ratio` — source `lib/engines/core/v6/tools.registry.v7.252.ts:43`; approved route `/tools/sitting-height-ratio`.
- V7 #25 `arm-span-to-height` — source `lib/engines/core/v6/tools.registry.v7.252.ts:44`; approved route `/tools/arm-span-to-height`.
- V7 #26 `calorie` — source `lib/engines/core/v6/tools.registry.v7.252.ts:45`; approved route `/tools/calorie`.
- V7 #27 `macro-split` — source `lib/engines/core/v6/tools.registry.v7.252.ts:46`; approved route `/tools/macro-split`.
- V7 #29 `carb-cycling` — source `lib/engines/core/v6/tools.registry.v7.252.ts:48`; approved route `/tools/carb-cycling`.
- V7 #30 `fat-needs` — source `lib/engines/core/v6/tools.registry.v7.252.ts:49`; approved route `/tools/fat-needs`.
- V7 #31 `fiber-needs` — source `lib/engines/core/v6/tools.registry.v7.252.ts:50`; approved route `/tools/fiber-needs`.
- V7 #32 `meal-timing` — source `lib/engines/core/v6/tools.registry.v7.252.ts:51`; approved route `/tools/meal-timing`.
- V7 #33 `glycemic-load` — source `lib/engines/core/v6/tools.registry.v7.252.ts:52`; approved route `/tools/glycemic-load`.
- V7 #34 `insulin-load` — source `lib/engines/core/v6/tools.registry.v7.252.ts:53`; approved route `/tools/insulin-load`.
- V7 #35 `thermic-effect-of-food` — source `lib/engines/core/v6/tools.registry.v7.252.ts:54`; approved route `/tools/thermic-effect-of-food`.
- V7 #36 `alcohol-calories` — source `lib/engines/core/v6/tools.registry.v7.252.ts:55`; approved route `/tools/alcohol-calories`.
- V7 #37 `cheat-meal-planner` — source `lib/engines/core/v6/tools.registry.v7.252.ts:56`; approved route `/tools/cheat-meal-planner`.
- V7 #38 `refeed` — source `lib/engines/core/v6/tools.registry.v7.252.ts:57`; approved route `/tools/refeed`.
- V7 #39 `diet-break-planner` — source `lib/engines/core/v6/tools.registry.v7.252.ts:58`; approved route `/tools/diet-break-planner`.
- V7 #40 `reverse-dieting` — source `lib/engines/core/v6/tools.registry.v7.252.ts:59`; approved route `/tools/reverse-dieting`.
- V7 #42 `electrolyte-needs` — source `lib/engines/core/v6/tools.registry.v7.252.ts:61`; approved route `/tools/electrolyte-needs`.
- V7 #43 `vitamin-mineral-needs` — source `lib/engines/core/v6/tools.registry.v7.252.ts:62`; approved route `/tools/vitamin-mineral-needs`.
- V7 #44 `supplement-dosage` — source `lib/engines/core/v6/tools.registry.v7.252.ts:63`; approved route `/tools/supplement-dosage`.
- V7 #45 `creatine-loading` — source `lib/engines/core/v6/tools.registry.v7.252.ts:64`; approved route `/tools/creatine-loading`.
- V7 #46 `caffeine` — source `lib/engines/core/v6/tools.registry.v7.252.ts:65`; approved route `/tools/caffeine`.
- V7 #47 `pre-workout-timing` — source `lib/engines/core/v6/tools.registry.v7.252.ts:66`; approved route `/tools/pre-workout-timing`.
- V7 #48 `post-workout-nutrition` — source `lib/engines/core/v6/tools.registry.v7.252.ts:67`; approved route `/tools/post-workout-nutrition`.
- V7 #49 `intermittent-fasting-timer` — source `lib/engines/core/v6/tools.registry.v7.252.ts:68`; approved route `/tools/intermittent-fasting-timer`.
- V7 #50 `anabolic-window` — source `lib/engines/core/v6/tools.registry.v7.252.ts:69`; approved route `/tools/anabolic-window`.
- V7 #51 `training-volume` — source `lib/engines/core/v6/tools.registry.v7.252.ts:70`; approved route `/tools/training-volume`.
- V7 #52 `intensity` — source `lib/engines/core/v6/tools.registry.v7.252.ts:71`; approved route `/tools/intensity`.
- V7 #53 `rpe-to-1rm-converter` — source `lib/engines/core/v6/tools.registry.v7.252.ts:72`; approved route `/tools/rpe-to-1rm-converter`.
- V7 #54 `rir` — source `lib/engines/core/v6/tools.registry.v7.252.ts:73`; approved route `/tools/rir`.
- V7 #55 `progressive-overload-planner` — source `lib/engines/core/v6/tools.registry.v7.252.ts:74`; approved route `/tools/progressive-overload-planner`.
- V7 #56 `deload` — source `lib/engines/core/v6/tools.registry.v7.252.ts:75`; approved route `/tools/deload`.
- V7 #57 `training-frequency-optimizer` — source `lib/engines/core/v6/tools.registry.v7.252.ts:76`; approved route `/tools/training-frequency-optimizer`.
- V7 #58 `rest-period` — source `lib/engines/core/v6/tools.registry.v7.252.ts:77`; approved route `/tools/rest-period`.
- V7 #59 `superset-planner` — source `lib/engines/core/v6/tools.registry.v7.252.ts:78`; approved route `/tools/superset-planner`.
- V7 #60 `drop-set` — source `lib/engines/core/v6/tools.registry.v7.252.ts:79`; approved route `/tools/drop-set`.
- V7 #61 `myo-reps` — source `lib/engines/core/v6/tools.registry.v7.252.ts:80`; approved route `/tools/myo-reps`.
- V7 #62 `rest-pause` — source `lib/engines/core/v6/tools.registry.v7.252.ts:81`; approved route `/tools/rest-pause`.
- V7 #63 `cluster-sets` — source `lib/engines/core/v6/tools.registry.v7.252.ts:82`; approved route `/tools/cluster-sets`.
- V7 #64 `german-volume-training` — source `lib/engines/core/v6/tools.registry.v7.252.ts:83`; approved route `/tools/german-volume-training`.
- V7 #65 `5x5` — source `lib/engines/core/v6/tools.registry.v7.252.ts:84`; approved route `/tools/5x5`.
- V7 #66 `5-3-1` — source `lib/engines/core/v6/tools.registry.v7.252.ts:85`; approved route `/tools/5-3-1`.
- V7 #67 `nsuns` — source `lib/engines/core/v6/tools.registry.v7.252.ts:86`; approved route `/tools/nsuns`.
- V7 #68 `training-split-generator` — source `lib/engines/core/v6/tools.registry.v7.252.ts:87`; approved route `/tools/training-split-generator`.
- V7 #69 `weekly-volume-per-muscle` — source `lib/engines/core/v6/tools.registry.v7.252.ts:88`; approved route `/tools/weekly-volume-per-muscle`.
- V7 #70 `effective-reps` — source `lib/engines/core/v6/tools.registry.v7.252.ts:89`; approved route `/tools/effective-reps`.
- V7 #71 `junk-volume-detector` — source `lib/engines/core/v6/tools.registry.v7.252.ts:90`; approved route `/tools/junk-volume-detector`.
- V7 #72 `recovery-time` — source `lib/engines/core/v6/tools.registry.v7.252.ts:91`; approved route `/tools/recovery-time`.
- V7 #73 `sleep-need-for-recovery` — source `lib/engines/core/v6/tools.registry.v7.252.ts:92`; approved route `/tools/sleep-need-for-recovery`.
- V7 #74 `hrv-based-readiness` — source `lib/engines/core/v6/tools.registry.v7.252.ts:93`; approved route `/tools/hrv-based-readiness`.
- V7 #75 `acwr` — source `lib/engines/core/v6/tools.registry.v7.252.ts:94`; approved route `/tools/acwr`.
- V7 #76 `monotony-strain` — source `lib/engines/core/v6/tools.registry.v7.252.ts:95`; approved route `/tools/monotony-strain`.
- V7 #77 `training-stress-score` — source `lib/engines/core/v6/tools.registry.v7.252.ts:96`; approved route `/tools/training-stress-score`.
- V7 #78 `fatigue-accumulation` — source `lib/engines/core/v6/tools.registry.v7.252.ts:97`; approved route `/tools/fatigue-accumulation`.
- V7 #79 `overtraining-risk` — source `lib/engines/core/v6/tools.registry.v7.252.ts:98`; approved route `/tools/overtraining-risk`.
- V7 #80 `active-recovery-planner` — source `lib/engines/core/v6/tools.registry.v7.252.ts:99`; approved route `/tools/active-recovery-planner`.
- V7 #81 `mobility-score` — source `lib/engines/core/v6/tools.registry.v7.252.ts:100`; approved route `/tools/mobility-score`.
- V7 #82 `symmetry-index` — source `lib/engines/core/v6/tools.registry.v7.252.ts:101`; approved route `/tools/symmetry-index`.
- V7 #83 `injury-risk-predictor` — source `lib/engines/core/v6/tools.registry.v7.252.ts:102`; approved route `/tools/injury-risk-predictor`.
- V7 #84 `pain-scale-tracker` — source `lib/engines/core/v6/tools.registry.v7.252.ts:103`; approved route `/tools/pain-scale-tracker`.
- V7 #85 `rehab-timeline` — source `lib/engines/core/v6/tools.registry.v7.252.ts:104`; approved route `/tools/rehab-timeline`.
- V7 #87 `wilks-score` — source `lib/engines/core/v6/tools.registry.v7.252.ts:106`; approved route `/tools/wilks-score`.
- V7 #88 `dots-score` — source `lib/engines/core/v6/tools.registry.v7.252.ts:107`; approved route `/tools/dots-score`.
- V7 #89 `ipf-points` — source `lib/engines/core/v6/tools.registry.v7.252.ts:108`; approved route `/tools/ipf-points`.
- V7 #90 `sinclair-coefficient` — source `lib/engines/core/v6/tools.registry.v7.252.ts:109`; approved route `/tools/sinclair-coefficient`.
- V7 #91 `relative-strength` — source `lib/engines/core/v6/tools.registry.v7.252.ts:110`; approved route `/tools/relative-strength`.
- V7 #93 `power` — source `lib/engines/core/v6/tools.registry.v7.252.ts:112`; approved route `/tools/power`.
- V7 #94 `force` — source `lib/engines/core/v6/tools.registry.v7.252.ts:113`; approved route `/tools/force`.
- V7 #95 `work` — source `lib/engines/core/v6/tools.registry.v7.252.ts:114`; approved route `/tools/work`.
- V7 #96 `impulse-momentum` — source `lib/engines/core/v6/tools.registry.v7.252.ts:115`; approved route `/tools/impulse-momentum`.
- V7 #97 `rate-of-force-development` — source `lib/engines/core/v6/tools.registry.v7.252.ts:116`; approved route `/tools/rate-of-force-development`.
- V7 #98 `reactive-strength-index` — source `lib/engines/core/v6/tools.registry.v7.252.ts:117`; approved route `/tools/reactive-strength-index`.
- V7 #99 `rsi-modified` — source `lib/engines/core/v6/tools.registry.v7.252.ts:118`; approved route `/tools/rsi-modified`.
- V7 #100 `jump-height-to-power` — source `lib/engines/core/v6/tools.registry.v7.252.ts:119`; approved route `/tools/jump-height-to-power`.
- V7 #101 `sprint-speed-acceleration` — source `lib/engines/core/v6/tools.registry.v7.252.ts:120`; approved route `/tools/sprint-speed-acceleration`.
- V7 #102 `agility-t-test` — source `lib/engines/core/v6/tools.registry.v7.252.ts:121`; approved route `/tools/agility-t-test`.
- V7 #103 `illinois-agility` — source `lib/engines/core/v6/tools.registry.v7.252.ts:122`; approved route `/tools/illinois-agility`.
- V7 #104 `40-yard-dash-converter` — source `lib/engines/core/v6/tools.registry.v7.252.ts:123`; approved route `/tools/40-yard-dash-converter`.
- V7 #105 `vertical-jump-power` — source `lib/engines/core/v6/tools.registry.v7.252.ts:124`; approved route `/tools/vertical-jump-power`.
- V7 #106 `broad-jump-power` — source `lib/engines/core/v6/tools.registry.v7.252.ts:125`; approved route `/tools/broad-jump-power`.
- V7 #107 `medicine-ball-throw` — source `lib/engines/core/v6/tools.registry.v7.252.ts:126`; approved route `/tools/medicine-ball-throw`.
- V7 #108 `wingate-power-test` — source `lib/engines/core/v6/tools.registry.v7.252.ts:127`; approved route `/tools/wingate-power-test`.
- V7 #109 `critical-power` — source `lib/engines/core/v6/tools.registry.v7.252.ts:128`; approved route `/tools/critical-power`.
- V7 #110 `vo2max-estimator` — source `lib/engines/core/v6/tools.registry.v7.252.ts:129`; approved route `/tools/vo2max-estimator`.
- V7 #111 `lactate-threshold` — source `lib/engines/core/v6/tools.registry.v7.252.ts:130`; approved route `/tools/lactate-threshold`.
- V7 #112 `heart-rate-zones` — source `lib/engines/core/v6/tools.registry.v7.252.ts:131`; approved route `/tools/heart-rate-zones`.
- V7 #113 `pace` — source `lib/engines/core/v6/tools.registry.v7.252.ts:132`; approved route `/tools/pace`.
- V7 #114 `running-power` — source `lib/engines/core/v6/tools.registry.v7.252.ts:133`; approved route `/tools/running-power`.
- V7 #115 `cycling-power-ftp` — source `lib/engines/core/v6/tools.registry.v7.252.ts:134`; approved route `/tools/cycling-power-ftp`.
- V7 #116 `golden-ratio-physique` — source `lib/engines/core/v6/tools.registry.v7.252.ts:135`; approved route `/tools/golden-ratio-physique`.
- V7 #117 `shoulder-to-waist-ratio` — source `lib/engines/core/v6/tools.registry.v7.252.ts:136`; approved route `/tools/shoulder-to-waist-ratio`.
- V7 #118 `chest-to-waist-ratio` — source `lib/engines/core/v6/tools.registry.v7.252.ts:137`; approved route `/tools/chest-to-waist-ratio`.
- V7 #119 `arm-to-waist-ratio` — source `lib/engines/core/v6/tools.registry.v7.252.ts:138`; approved route `/tools/arm-to-waist-ratio`.
- V7 #120 `leg-to-torso-ratio` — source `lib/engines/core/v6/tools.registry.v7.252.ts:139`; approved route `/tools/leg-to-torso-ratio`.
- V7 #121 `arm-length-to-height` — source `lib/engines/core/v6/tools.registry.v7.252.ts:140`; approved route `/tools/arm-length-to-height`.
- V7 #122 `calf-to-bicep-ratio` — source `lib/engines/core/v6/tools.registry.v7.252.ts:141`; approved route `/tools/calf-to-bicep-ratio`.
- V7 #123 `neck-to-arm-ratio` — source `lib/engines/core/v6/tools.registry.v7.252.ts:142`; approved route `/tools/neck-to-arm-ratio`.
- V7 #124 `physique-rating-scale` — source `lib/engines/core/v6/tools.registry.v7.252.ts:143`; approved route `/tools/physique-rating-scale`.
- V7 #125 `bodybuilding-competition-score` — source `lib/engines/core/v6/tools.registry.v7.252.ts:144`; approved route `/tools/bodybuilding-competition-score`.
- V7 #126 `neuromuscular-performance-modeler` — source `lib/engines/core/v6/tools.registry.v7.252.ts:145`; approved route `/tools/neuromuscular-performance-modeler`.
- V7 #127 `daily-readiness-cause-explainer` — source `lib/engines/core/v6/tools.registry.v7.252.ts:146`; approved route `/tools/daily-readiness-cause-explainer`.
- V7 #128 `training-load-balance-acwr` — source `lib/engines/core/v6/tools.registry.v7.252.ts:147`; approved route `/tools/training-load-balance-acwr`.
- V7 #129 `adaptive-training-program-planner` — source `lib/engines/core/v6/tools.registry.v7.252.ts:148`; approved route `/tools/adaptive-training-program-planner`.
- V7 #130 `plateau-detective-stagnation-analyzer` — source `lib/engines/core/v6/tools.registry.v7.252.ts:149`; approved route `/tools/plateau-detective-stagnation-analyzer`.
- V7 #131 `transformation-forecast-engine` — source `lib/engines/core/v6/tools.registry.v7.252.ts:150`; approved route `/tools/transformation-forecast-engine`.
- V7 #132 `pose-form-coach-vision` — source `lib/engines/core/v6/tools.registry.v7.252.ts:151`; approved route `/tools/pose-form-coach-vision`.
- V7 #133 `rep-tempo-velocity-loss-analyzer` — source `lib/engines/core/v6/tools.registry.v7.252.ts:152`; approved route `/tools/rep-tempo-velocity-loss-analyzer`.
- V7 #134 `mobility-symmetry-screen` — source `lib/engines/core/v6/tools.registry.v7.252.ts:153`; approved route `/tools/mobility-symmetry-screen`.
- V7 #135 `exercise-substitution-advisor` — source `lib/engines/core/v6/tools.registry.v7.252.ts:154`; approved route `/tools/exercise-substitution-advisor`.
- V7 #136 `physique-proportion-balance` — source `lib/engines/core/v6/tools.registry.v7.252.ts:155`; approved route `/tools/physique-proportion-balance`.
- V7 #137 `testosterone-to-epit-ratio` — source `lib/engines/core/v6/tools.registry.v7.252.ts:156`; approved route `/tools/testosterone-to-epit-ratio`.
- V7 #138 `free-testosterone` — source `lib/engines/core/v6/tools.registry.v7.252.ts:157`; approved route `/tools/free-testosterone`.
- V7 #139 `shbg` — source `lib/engines/core/v6/tools.registry.v7.252.ts:158`; approved route `/tools/shbg`.
- V7 #140 `estradiol-management` — source `lib/engines/core/v6/tools.registry.v7.252.ts:159`; approved route `/tools/estradiol-management`.
- V7 #141 `prolactin-risk` — source `lib/engines/core/v6/tools.registry.v7.252.ts:160`; approved route `/tools/prolactin-risk`.
- V7 #142 `hematocrit-hemoglobin-tracker` — source `lib/engines/core/v6/tools.registry.v7.252.ts:161`; approved route `/tools/hematocrit-hemoglobin-tracker`.
- V7 #143 `blood-pressure-risk` — source `lib/engines/core/v6/tools.registry.v7.252.ts:162`; approved route `/tools/blood-pressure-risk`.
- V7 #144 `lipid-panel-analyzer` — source `lib/engines/core/v6/tools.registry.v7.252.ts:163`; approved route `/tools/lipid-panel-analyzer`.
- V7 #145 `liver-enzymes-analyzer` — source `lib/engines/core/v6/tools.registry.v7.252.ts:164`; approved route `/tools/liver-enzymes-analyzer`.
- V7 #146 `kidney-function` — source `lib/engines/core/v6/tools.registry.v7.252.ts:165`; approved route `/tools/kidney-function`.
- V7 #151 `accumulation-half-life-simulator` — source `lib/engines/core/v6/tools.registry.v7.252.ts:170`; approved route `/tools/accumulation-half-life-simulator`.
- V7 #157 `multi-compound-half-life` — source `lib/engines/core/v6/tools.registry.v7.252.ts:176`; approved route `/tools/multi-compound-half-life`.
- V7 #158 `injection-volume` — source `lib/engines/core/v6/tools.registry.v7.252.ts:177`; approved route `/tools/injection-volume`.
- V7 #159 `compound-half-life-stacker` — source `lib/engines/core/v6/tools.registry.v7.252.ts:178`; approved route `/tools/compound-half-life-stacker`.
- V7 #162 `oral-cycle-planner` — source `lib/engines/core/v6/tools.registry.v7.252.ts:181`; approved route `/tools/oral-cycle-planner`.
- V7 #163 `trt-optimization-engine` — source `lib/engines/core/v6/tools.registry.v7.252.ts:182`; approved route `/tools/trt-optimization-engine`.
- V7 #164 `post-cycle-bloodwork-interpreter` — source `lib/engines/core/v6/tools.registry.v7.252.ts:183`; approved route `/tools/post-cycle-bloodwork-interpreter`.
- V7 #165 `drug-interaction-checker-pro` — source `lib/engines/core/v6/tools.registry.v7.252.ts:184`; approved route `/tools/drug-interaction-checker-pro`.
- V7 #166 `injection-pain-minimizer` — source `lib/engines/core/v6/tools.registry.v7.252.ts:185`; approved route `/tools/injection-pain-minimizer`.
- V7 #175 `injection-schedule-planner` — source `lib/engines/core/v6/tools.registry.v7.252.ts:194`; approved route `/tools/injection-schedule-planner`.
- V7 #187 `insulin-conversion` — source `lib/engines/core/v6/tools.registry.v7.252.ts:206`; approved route `/tools/insulin-conversion`.
- V7 #188 `glucose-tracker` — source `lib/engines/core/v6/tools.registry.v7.252.ts:207`; approved route `/tools/glucose-tracker`.
- V7 #190 `androgen-receptor-optimizer` — source `lib/engines/core/v6/tools.registry.v7.252.ts:209`; approved route `/tools/androgen-receptor-optimizer`.
- V7 #191 `5-alpha-conversion` — source `lib/engines/core/v6/tools.registry.v7.252.ts:210`; approved route `/tools/5-alpha-conversion`.

## C. Proposed application #147–150 ↔ V7 #249–252 (separate review)

These are candidates based on the consecutive numbering and matching concepts/titles in the two source files. They are **not verified aliases**. Preserve application tool IDs and current routes.

| Application # | Local slug / status / route | V7 # / approved ID / route | Evidence | Classification / confidence |
|---:|---|---|---|---|
| 147 | `tool-147-scientific-evidence-explorer` (planned); `/smarttools/tool-147-scientific-evidence-explorer` | #249 `scientific-evidence-explorer`; `/tools/scientific-evidence-explorer` | `lib/tools/smartToolsCatalog10.ts:33; lib/engines/core/v6/tools.registry.v7.252.ts:268` | POSSIBLE_CONCEPTUAL_MATCH / possible conceptual match; no explicit alias source |
| 148 | `tool-148-personal-fitness-memory-layer` (planned); `/smarttools/tool-148-personal-fitness-memory-layer` | #250 `personal-fitness-memory-layer`; `/tools/personal-fitness-memory-layer` | `lib/tools/smartToolsCatalog10.ts:34; lib/engines/core/v6/tools.registry.v7.252.ts:269` | POSSIBLE_CONCEPTUAL_MATCH / possible conceptual match; no explicit alias source |
| 149 | `tool-149-physique-trajectory-simulator` (implemented); `/smarttools/tool-149-physique-trajectory-simulator` | #251 `physique-trajectory-simulator`; `/tools/physique-trajectory-simulator` | `lib/tools/smartToolsCatalog10.ts:35; lib/engines/core/v6/tools.registry.v7.252.ts:270` | POSSIBLE_CONCEPTUAL_MATCH / high conceptual similarity; no explicit alias source |
| 150 | `tool-150-ai-performance-command-center` (planned); `/smarttools/tool-150-ai-performance-command-center` | #252 `command-center`; `/tools/command-center` | `lib/tools/smartToolsCatalog10.ts:36; lib/engines/core/v6/tools.registry.v7.252.ts:271` | POSSIBLE_CONCEPTUAL_MATCH / possible conceptual match; no explicit alias source |

## D. Quality checks and scope

| Check | Result | Evidence / exact output |
|---|---|---|
| `git branch --show-current` / `git rev-parse HEAD` | PASS | `main`; `254ce1299bff227c54809bb7027f9b587d69c143` |
| `npm run validate-tools` | PASS, exit 0 | 1 test file, 5 tests passed; checks 166 catalog entries for duplicates and required files, but not v7 identity equivalence |
| `npx tsc --noEmit` | PASS, exit 0 | Latest execution after header-control changes |
| `npm run build` | PASS observed; exit code not captured by terminal wrapper | Next.js final route summary; 385/385 static pages; `.next/BUILD_ID` present |
| `npx vitest run` full suite | NOT RUN in this audit | Latest known historical report had checkout/payment failures; not revalidated here |
| Coverage command | NOT RUN | No coverage result is asserted by this reconciliation |
| `git diff --check` | FAIL, exit 2 | Existing trailing whitespace at `app/smarttools/page.tsx:57` |
| Supabase live state | NOT RUN | `.env`/build log shows a configured URL only; no DB request/read/write was made for this audit |
| Index / Git mutation | PASS, no staged changes | `git diff --cached --quiet` exit 0; no stage/unstage/commit/stash/reset/clean/move/delete/push/deploy |

The main inventory `SMARTTOOLS_252_MASTER_INVENTORY.md` was not overwritten. This report is a separate evidence artifact. No application code, test, registry, catalog, route, database, migration, or deployment state was changed to produce it.

## Owner review decisions requested

1. Confirm whether the approved V7 252 identities are the intended authority for the current 166-entry app catalog, or whether they describe a separate roadmap/version.
2. Review the 252-row crosswalk; approve/reject candidate conceptual matches, especially app #147–150 ↔ V7 #249–252.
3. Confirm the intended scope before starting further implementation; the SPEC v3 currently says the active execution scope is Phase 0 and Macro v6, while later thread directives also requested work on specific approved tools.

Final status: **READY FOR HUMAN REVIEW**. The CSV and its synchronized Markdown table provide the reviewed candidate evidence; identity equivalence for unresolved rows remains unverified. Do not infer aliases or change IDs/routes based on this report alone.


## Current catalog status addendum — 2026-10-25

The prior count snapshot above is superseded for status totals only: Tools 148 and 150 are now marked `implemented`; the catalog still has 166 records and the approved-v7 identity classifications remain unchanged. The updated split is 159 implemented / 7 planned. Tool 148 current route: `/smarttools/platform-ai/tool-148-personal-fitness-memory-layer`; Tool 150 current route: `/smarttools/platform-ai/tool-150-ai-performance-command-center`. The 252-row identity crosswalk classifications remain 5 EXACT_MATCH, 93 POSSIBLE_CONCEPTUAL_MATCH, 154 UNRESOLVED, and 0 VERIFIED_ALIAS; no conceptual match was promoted to an alias.
