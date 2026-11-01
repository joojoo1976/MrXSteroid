
# SMARTTOOLS_BATCH_6_PLAN (Final Lock)

## 1. Source of truth and registry integration
Exact paths inspected:
- lib/tools/smartToolsCatalog.ts (SmartToolEntry type; SMART_TOOLS_CATALOG)
- lib/tools/smartToolsCatalog4.ts (validateCatalog, catalogAll, getPublishedCatalogTools; exact registration shard)
- lib/tools/smartToolsCatalog10.ts (last catalog shard; new entries append here)
- lib/tools/categories.ts (category definitions; TOOL_CATEGORY mapping; getCategoryOfSlug; toHierarchicalHref)
- lib/tools/loaders.ts (component loader by slug)
- app/smarttools/[category]/[tool]/page.tsx (dynamic canonical route consumer)
- app/smarttools/nutrition/macro/page.tsx (standalone canonical nutrition page precedent)
- components/smarttools/AIInsightPanel.tsx
- lib/templates/genius-tool-template.tsx
- lib/tools/engines/bmr-tdee.v6.ts, protein-needs.v6.ts, water-intake.v6.ts

Registry integration is mandatory:
- Add three entries to lib/tools/smartToolsCatalog10.ts with status implemented.
- Add three slug mappings to lib/tools/categories.ts TOOL_CATEGORY as nutrition.
- This gives tool identity, category membership, canonical metadata, and dynamic route resolution.
- Avoid duplicate identities by using unique toolIds/slugs/hrefs and running validate-tools.

## 2. Exact file inventory
BMR/TDEE:
- Registry: lib/tools/smartToolsCatalog10.ts; lib/tools/categories.ts
- Canonical page: app/smarttools/nutrition/bmr-tdee/page.tsx
- Legacy redirect: app/smarttools/bmr-tdee/page.tsx
- Pilot: components/tools/bmr-tdee-pilot.tsx
- Engine tests: lib/tools/engines/bmr-tdee.v6.test.ts
- Pilot tests: components/tools/bmr-tdee-pilot.test.tsx

Protein Needs:
- Registry: lib/tools/smartToolsCatalog10.ts; lib/tools/categories.ts
- Canonical page: app/smarttools/nutrition/protein-needs/page.tsx
- Legacy redirect: app/smarttools/protein-needs/page.tsx
- Pilot: components/tools/protein-needs-pilot.tsx
- Engine tests: lib/tools/engines/protein-needs.v6.test.ts
- Pilot tests: components/tools/protein-needs-pilot.test.tsx

Water Intake:
- Registry: lib/tools/smartToolsCatalog10.ts; lib/tools/categories.ts
- Canonical page: app/smarttools/nutrition/water-intake/page.tsx
- Legacy redirect: app/smarttools/water-intake/page.tsx
- Pilot: components/tools/water-intake-pilot.tsx
- Engine tests: lib/tools/engines/water-intake.v6.test.ts
- Pilot tests: components/tools/water-intake-pilot.test.tsx

Shared required files:
- AI: components/smarttools/AIInsightPanel.tsx; /api/smarttools/ai/explain
- Template: lib/templates/genius-tool-template.tsx
- Route validation: lib/tools/smartToolsCatalog4.ts; lib/tools/categories.ts

## 3. Engine contracts
BMR/TDEE (lib/tools/engines/bmr-tdee.v6.ts):
- Input: { weightKg:number; heightCm:number; age:number; sex:'male'|'female'; activityLevel:number }
- Constraints: finite; weight>0; height>0; age>0; activity>0.
- Output: { bmrKcal:number; tdeeKcal:number }
- Formula: Mifflin-St Jeor base=10w+6.25h-5a; male +5, female -161; tdee=bmr*activity; rounded.
- Activity multipliers: 1.2, 1.375, 1.55, 1.725, 1.9.
- Errors: Invalid numeric input, Inputs must be positive.

Protein Needs (lib/tools/engines/protein-needs.v6.ts):
- Input: { weightKg:number; goal:'maintain'|'bulk'|'cut'; activityLevel:number }
- Constraints: finite; weight>0; activity>0.
- Output: { dailyProteinGrams:number }
- Formula: base g/kg 1.6/2.0/2.2; factor=1+(activity-1)*0.05; daily=round(weight*base*factor).
- Errors as above.

Water Intake (lib/tools/engines/water-intake.v6.ts):
- Input: { weightKg:number; activityLevel:number }
- Constraints: finite; weight>0; activity>0.
- Output: { dailyWaterLiters:number }
- Formula: baseMl=weight*35; adjusted=baseMl*(1+(activity-1)*0.1); liters=round(adjusted/1000,2).
- Errors as above.

No silent defaults or clamping. Missing inputs remain invalid.


## 4. Activity and unit behavior
Visible activity options and multipliers:
- BMR/TDEE: Sedentary 1.2, Light 1.375, Moderate 1.55, Active 1.725, Very Active 1.9.
- Protein Needs: Baseline activity 1.0, then 1.1, 1.2, 1.3, 1.4 using factor formula.
- Water Intake: Baseline 1.0, then 1.1, 1.2, 1.3, 1.4 using adjustment formula.
Unit behavior uses existing shared preferences for metric/imperial display conversions only; engine remains metric. Estimates labeled as estimates, not medical precision.

## 5. Route and metadata tests
- Canonical route resolves for each tool via catalog+category mapping.
- Legacy route redirects to canonical route.
- No redirect loops.
- Correct tool identity, category, canonical metadata.
- Registry uniqueness via validate-tools.
- Pilot tests: rendered results, validation messages, no stale result after failed calculation, disclaimer visible, AR/EN, RTL/LTR, metric/imperial, AI loading/success/failure/safe empty states.
- AI explains deterministic result only; no numeric replacement.

## 6. TypeScript and quality gates
Eight baseline diagnostics:
1. app/smarttools/bmr-tdee/page.tsx(8,83) TS2322
2. app/smarttools/protein-needs/page.tsx(8,39) TS2345
3. app/smarttools/tool-111-smart-food-macro-substitution/page.tsx(6,34) TS2307
4. same (7,38)
5. same (8,31)
6. same (9,25)
7. app/smarttools/water-intake/page.tsx(8,53) TS2322
8. lib/legacy-routes.ts(8,14) TS2739

Five unrelated baseline errors: Tool 111 four plus legacy-routes. Three target-page errors must be resolved. Acceptance: zero new TS errors, zero target-file errors, zero ESLint errors, validate-tools passes. Build BLOCKED and Coverage UNAVAILABLE unless fresh evidence.

## 7. Safety and scope
Planning only. No code/test edits, DB writes, migrations, commits, pushes, deployments, Batch 7. Frozen payment/Fourthwall/Shippo/SEO untouched.

## Verification status
- Git HEAD: PASS
- Source paths: PASS
- Registry integration: PASS planned
- Engine contracts: PASS
- Route architecture: PASS planned
- TypeScript baseline: PASS (8)
- Build: BLOCKED
- Coverage: UNAVAILABLE
- validate-tools: PASS

READY FOR HUMAN APPROVAL
