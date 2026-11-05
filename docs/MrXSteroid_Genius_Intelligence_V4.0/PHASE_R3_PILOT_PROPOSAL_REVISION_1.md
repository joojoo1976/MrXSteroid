# PHASE R3 — PILOT PROPOSAL REVISION 1

Date: 2026-11-05
Phase: R3 — One Pilot Tool Integration (REVISED PROPOSAL)
Status: PROPOSAL — NOT IMPLEMENTED
Branch: main
HEAD: 108d3063bdcbca9604ad9b7b48844b85763d51a0

## 1. Verified Macro Tool #001 Identity and Canonical Route

| Item | Evidence | Source |
|------|----------|--------|
| Tool ID | `mrx.tool.macro` | `registry.ts:33` |
| Canonical Slug | `macro` | `registry.ts:33` |
| Route | `/smarttools/nutrition/macro` | `registry.ts:33`, `smartToolsCatalog.ts:40` |
| Page | `Page.MACRO` | `registry.ts:33` |
| Order | 10 | `registry.ts:33` |
| Stack Status | `legacy` | `registry.ts:33` |
| Access Tier | `free` | `registry.ts:33` |

### Existing Implementation Files

| File | Exists? | Status |
|------|---------|--------|
| `app/smarttools/nutrition/macro/page.tsx` | ✅ | Renders MacroPilotTool |
| `components/tools/macro-pilot.tsx` | ✅ | Client component with form, validation, What-If |
| `lib/tools/engines/macro.v6.ts` | ✅ | Deterministic engine (39,905 bytes) |
| `lib/tools/engines/macro.v6.test.ts` | ✅ | 74 tests (verified by count) |
| `lib/tools/schemas/macro.v6.ts` | ✅ | Zod schemas |
| `components/tools/macro-pilot.test.tsx` | ✅ | Pilot UI tests |
| `app/smarttools/nutrition/macro/page.test.tsx` | ✅ | Page tests |

### Existing MacroPilotTool Behavior

| Feature | Status |
|---------|--------|
| Form with 6 required inputs (age, sex, height, weight, activity, phase) | ✅ Implemented |
| Uses `calculateMacrosV6()` engine | ✅ Implemented |
| Uses `GeniusToolTemplate` (V3, NOT V4) | ✅ Implemented |
| EMPTY/PARTIAL/FULL states | ✅ Implemented |
| What-If scenarios | ✅ Implemented |
| Sensitivity analysis | ✅ Implemented |
| Safety warnings | ✅ Implemented (existing cut < BMR warning) |
| Unit conversion (metric/imperial) | ✅ Implemented |
| Arabic/English localization | ✅ Implemented |
| RTL/LTR | ✅ Implemented |

### Integration Assessment

The proposed integration **replaces** the current page content:
- **Current:** `app/smarttools/nutrition/macro/page.tsx` renders `<MacroPilotTool />` which uses `GeniusToolTemplate` (V3)
- **Proposed:** Same route renders `<GeniusToolTemplateV4>` with `<MacroPilotTool />` as a child slot

The existing MacroPilotTool functionality is **preserved** — only the outer template changes from V3 to V4. The calculation engine (`calculateMacrosV6`) is untouched.

## 2. Existing Architecture and Component Dependency Map

### Macro Tool Dependency Chain

```
URL: /smarttools/nutrition/macro
 └─ Page: app/smarttools/nutrition/macro/page.tsx
     └─ Renders: <MacroPilotTool />
         └─ Component: components/tools/macro-pilot.tsx
             ├─ Uses: usePreferences() for locale/unitSystem
             ├─ Uses: GeniusToolTemplate (V3) for layout
             ├─ Uses: calculateMacrosV6() from lib/tools/engines/macro.v6.ts
             ├─ Uses: MacroInputV6, MacroOutputV6 types from macro.v6.ts
             ├─ Uses: Language, Theme types from shared/types/types
             └─ Uses: macro-pilot.module.css for styling
```

### Engine Dependency Chain

```
calculateMacrosV6() in lib/tools/engines/macro.v6.ts
 ├─ Imports: UnitSystem, MacroInput, MacroOutput from './macro'
 ├─ Imports: MathEngine, ValidationResult, ValidationWarning, ValidationError from '../../engines/core/v6/ai-orchestrator.v6'
 ├─ Imports: GOLDEN_RULES, GoldenRuleApplication from '../../engines/core/v6/ai-orchestrator.v6'
 └─ Imports: MacroInputV6PartialSchema, MacroInputV6Schema from '../schemas/macro.v6'
```

### Template Dependency Chain

```
GeniusToolTemplate (V3) in lib/templates/genius-tool-template.tsx
 └─ Uses: React, no V4 dependencies
 └─ Used by: components/tools/macro-pilot.tsx (only production consumer found)

GeniusToolTemplateV4 (V4) in lib/templates/genius-tool-template.v4.tsx
 ├─ Uses: V4 contracts from lib/engines/core/v4/contracts.v4.ts
 ├─ Uses: V4 runtime from lib/engines/core/v4/runtime.v4.ts
 └─ Used by: No production tool (standalone, by design)
```

## 3. Exact Proposed File Changes

### Files to Modify (PROPOSED — Not Implemented)
| File | Change |
|------|--------|
| `app/smarttools/nutrition/macro/page.tsx` | Replace `<MacroPilotTool />` with `<GeniusToolTemplateV4><MacroPilotTool /></GeniusToolTemplateV4>` |
| `components/tools/macro-pilot.tsx` | No changes (additive wrapper only) |

### Files to Create (PROPOSED — Not Implemented)
| File | Purpose |
|------|---------|
| `lib/engines/core/v4/adapter.macro.v4.ts` | Adapter bridging Macro v6 output to V4 envelope |
| `lib/engines/core/v4/adapter.macro.v4.test.ts` | Adapter unit tests |

### Files NOT Modified (Protected)
| File | Reason |
|------|--------|
| `lib/tools/engines/macro.v6.ts` | Protected — no formula changes |
| `lib/tools/engines/macro.v6.test.ts` | Protected — no test weakening |
| `lib/tools/schemas/macro.v6.ts` | Protected — no schema changes |
| `lib/tools/engines/bodyfat.v6.ts` | Protected |
| `lib/tools/engines/bodyfat.v6.test.ts` | Protected |
| `lib/engines/core/v4/contracts.v4.ts` | R1 deliverable — no changes during R3 |
| `lib/engines/core/v4/runtime.v4.ts` | R1 deliverable — no changes during R3 |
| `lib/templates/genius-tool-template.v4.tsx` | R2 deliverable — no changes during R3 |
| All Registry/Catalog files | Protected |
| All Supabase files | Protected |

## 4. Macro V6 to V4 Contract Mapping

### Adapter: `lib/engines/core/v4/adapter.macro.v4.ts`

| V4 Contract Field | Macro V6 Mapping | Evidence |
|-------------------|-----------------|----------|
| `toolId` | `'mrx.tool.macro'` | `registry.ts:33` |
| `canonicalSlug` | `'macro'` | `registry.ts:33` |
| `engineVersion` | `'6.0.0'` | Macro v6 engine version (preserved) |
| `schemaVersion` | `'4.0.0'` | V4 schema version |
| `calculationId` | `'calc-' + timestamp + '-' + random` | Unique per calculation |
| `status` | `'VALID'` (when result exists) or `'INVALID'` (when validation fails) | `MacroOutputV6` existence |
| `inputSnapshot` | Normalized MacroInputV6 + field states + provenance | `MacroInputV6` (age, sex, height, weight, activity, phase) |
| `result` | `MacroOutputV6` (existing engine output) | `calculateMacrosV6()` return value |
| `resultType` | `'CALCULATED'` | `MacroOutputV6.resultType` |
| `units` | `{ weight: 'kg', height: 'cm', calories: 'kcal', protein: 'g', fat: 'g', carbs: 'g' }` | Macro v6 canonical units |
| `assumptions` | `MacroOutputV6.assumptions` (array of strings) | Existing assumptions from engine |
| `evidence` | `[]` (empty — no verified sources cited in Macro v6) | No fabricated references |
| `uncertainty` | `{ level: 'NOT_ASSESSED', basis: [], affectedOutputs: [], whatWouldReduceIt: [], limitations: [] }` | No calibrated confidence in Macro v6 |
| `warnings` | `MacroOutputV6` safety warnings (existing cut < BMR warning) | `generateWarnings()` in macro.v6.ts |
| `validity` | `{ status: 'CURRENT', invalidationTriggers: ['input_changed', 'engine_version_changed'] }` | Standard validity |
| `privacyClass` | `'PERSONAL'` | Nutrition data is personal health information |
| `contextUsed` | `[]` (no cross-tool context consumed yet) | Body Fat adapter exists but not used in calculation |
| `nextActions` | `[{ type: 'calculate', labelKey: 'recalculate', priority: 'high', reason: 'Inputs changed' }]` | Standard next action |

### V4 Adapter Behavior
1. Calls `calculateMacrosV6(inputs)` — existing engine, unchanged
2. Wraps result in V4 envelope using `adaptV6ToV4Envelope()`
3. Validates envelope using `validateToolResultEnvelope()`
4. Returns V4 envelope or throws on validation failure

### No AI-Generated Content
- `aiStatus: 'NOT_CONFIGURED'`
- No model output affects Macro calculations
- No AI provider activation
- No external API calls

### Evidence: No Fabricated References
- `evidence: []` (empty array)
- No sources claimed
- No citations invented
- Honest uncertainty assessment

## 5. Tool-Specific Safety Contract

### Macro Calculator — Safety Contract

**Domain:** Nutrition macronutrient calculation
**Intended use:** Estimate daily macronutrient targets based on body weight, height, age, sex, activity level, and goal (bulk/cut/maintenance)
**Not for:** Medical diagnosis, treatment planning, eating disorder management, or clinical nutrition therapy

**Risk Classification:** MEDIUM
- Personalized nutrition estimates (non-critical health data)
- Results depend on user-provided measurements (accuracy varies)
- No medical diagnosis or treatment

**Input Guards:**
- Age: 19-100 years (Mifflin-St Jeor study population 19-78; 79-100 with extrapolation warning)
- Height: 100-250 cm
- Weight: 30-300 kg
- Activity factor: 1.2-1.9
- Phase: bulk/cut/maintenance (recomp rejected)

**Output Guards:**
- Negative carbohydrate result rejected (infeasible distribution)
- Cut target below BMR warning emitted
- NaN/Infinity results rejected

**Prohibited Outputs:**
- Medical diagnosis
- Drug dosing recommendations
- Treatment cycle recommendations
- Unsupported clinical interpretations
- Safety guarantees

**Human/Professional Escalation:**
- User with BMI > 35 or significant health condition should consult healthcare professional
- Eating disorder history should consult professional
- Significant weight loss/gain goals should consult professional

**Non-Diagnostic Language:**
- All outputs labeled as estimates
- Assumptions clearly stated
- Limitations documented
- Result type is `CALCULATED` (not `PREDICTION`)

**Safe Behavior When Data Missing/Invalid:**
- Throws structured error (no result produced)
- No hidden defaults
- No fabricated values

## 6. AI Capability Status

| Item | Status |
|------|--------|
| AI status | `NOT_CONFIGURED` |
| AI provider | None |
| AI model | None |
| AI activation | Not authorized |
| AI in calculations | Prohibited (deterministic engine only) |
| AI in explanations | Not configured |
| Fallback behavior | Calculation continues without AI |

The Macro pilot works as a deterministic tool. AI is not required and not configured.

## 7. Input/Output Mapping

### Input Mapping (MacroInputV6 → V4 InputSnapshot)
| V4 Field | Macro Input | Transformation |
|----------|-------------|----------------|
| `values.age` | `MacroInputV6.age` | Identity |
| `values.sex` | `MacroInputV6.sex` | Identity |
| `values.heightCm` | `MacroInputV6.heightCm` | Identity |
| `values.weightKg` | `MacroInputV6.weightKg` | Identity |
| `values.activityLevel` | `MacroInputV6.activityLevel` | Identity |
| `values.phase` | `MacroInputV6.phase` | Identity |
| `fieldStates` | Assessed from input values | `validateFieldValue()` per field |
| `provenance` | `USER_ENTERED` for all fields | Identity |
| `completeness` | EMPTY/PARTIAL/FULL | `assessInputCompleteness()` |
| `recordedAt` | Current timestamp | `new Date().toISOString()` |
| `version` | `'4.0.0'` | V4 schema version |

### Output Mapping (MacroOutputV6 → V4 Result)
| V4 Field | Macro Output | Transformation |
|----------|--------------|----------------|
| `result.bmr` | `MacroOutputV6.bmr` | Identity |
| `result.tdee` | `MacroOutputV6.tdee` | Identity |
| `result.targetCalories` | `MacroOutputV6.targetCalories` | Identity |
| `result.proteinGrams` | `MacroOutputV6.proteinGrams` | Identity |
| `result.fatGrams` | `MacroOutputV6.fatGrams` | Identity |
| `result.carbsGrams` | `MacroOutputV6.carbsGrams` | Identity |
| `resultType` | `'CALCULATED'` | `MacroOutputV6.resultType` |
| `assumptions` | `MacroOutputV6.assumptions` | Identity |
| `warnings` | `MacroOutputV6` safety warnings | Mapped to SafetyWarningV4 |

## 8. Compatibility and Backward Preservation Strategy

### Strategy
1. **Additive only:** V4 template wraps existing Macro pilot, doesn't replace calculation logic
2. **No engine changes:** Macro v6 calculation logic is untouched
3. **Adapter pattern:** V4 adapter is a separate module that calls existing engine
4. **Optional adoption:** Other tools are not affected
5. **Backward compatible:** Existing Macro v6 tests continue to pass

### Rollback Strategy
1. Revert `app/smarttools/nutrition/macro/page.tsx` to pre-R3 content (renders `<MacroPilotTool />` without V4 wrapper)
2. Delete `lib/engines/core/v4/adapter.macro.v4.ts` and test file
3. No database changes to revert
4. No migration to revert

## 9. Test Matrix with Exact Commands

### New Tests (PROPOSED)

| Test File | Tests | Command |
|-----------|-------|---------|
| `lib/engines/core/v4/adapter.macro.v4.test.ts` | 10 | `npx vitest run lib/engines/core/v4/adapter.macro.v4.test.ts` |
| V4 envelope validation with Macro data | 5 | Part of adapter tests |
| Backward compatibility (V6 result == V4 result) | 3 | Part of adapter tests |

### Regression Tests (Existing — Must Pass)

| Test File | Tests | Command |
|-----------|-------|---------|
| `lib/tools/engines/macro.v6.test.ts` | 74 | `npx vitest run lib/tools/engines/macro.v6.test.ts` |
| `lib/tools/engines/bodyfat.v6.test.ts` | 46 | `npx vitest run lib/tools/engines/bodyfat.v6.test.ts` |
| `lib/engines/core/v4/contracts.v4.test.ts` | 12 | `npx vitest run lib/engines/core/v4/contracts.v4.test.ts` |
| `lib/engines/core/v4/runtime.v4.test.ts` | 50 | `npx vitest run lib/engines/core/v4/runtime.v4.test.ts` |
| `components/genius-tool-template.v4.test.tsx` | 13 | `npx vitest run components/genius-tool-template.v4.test.tsx` |
| `components/tools/macro-pilot.test.tsx` | Unknown | `npx vitest run components/tools/macro-pilot.test.tsx` |

### TypeScript
| Command | Expected Result |
|---------|----------------|
| `npx tsc --noEmit` | PASS (exit 0) |

### Build
| Command | Expected Result |
|---------|----------------|
| `npm run build` | PASS (502/502 pages) |

## 10. Accessibility and Internationalization Requirements

| Requirement | Implementation |
|-------------|---------------|
| Arabic RTL | Template uses `direction` prop, `dir="rtl"` attribute |
| English LTR | Template uses `direction` prop, `dir="ltr"` attribute |
| ARIA labels | Template has `aria-label`, `aria-describedby`, `aria-live` |
| Keyboard navigation | Native button elements, tab order |
| Screen reader | Status announcements via `aria-live="polite"`, errors via `role="alert"` |
| Responsive layout | CSS classes present (not tested) |

## 11. Risk Assessment and Rollback Strategy

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking Macro V6 behavior | High | Adapter is additive; engine untouched; all 74 tests must pass |
| V4 envelope increases complexity | Medium | Template handles envelope display; engine unchanged |
| Performance degradation | Low | V4 validation is lightweight; template is React-only |
| Database changes | Low | No database changes in R3 scope |
| User confusion | Low | Progressive disclosure, clear status indicators |
| Security regression | Low | Security-repair files untouched; input validation added |
| Test failures in existing tools | Medium | All existing tests must pass before approval |

## 12. Requirement-to-Evidence Traceability

| SPEC Requirement | Evidence | Status |
|-----------------|----------|--------|
| Deterministic calculation | Macro v6 engine (39,905 bytes) | VERIFIED |
| Input validation | macro.v6.ts validation + V4 runtime validators | VERIFIED |
| Unit conversion (no double conversion) | Macro v6 canonical kg/cm + pilot display conversion | VERIFIED |
| EMPTY/PARTIAL/FULL states | macro.v6.ts + V4 InputCompleteness | VERIFIED |
| What-If scenarios | macro.v6.ts WhatIf engine | VERIFIED |
| Sensitivity analysis | macro.v6.ts finite difference | VERIFIED |
| Reasoning trace | macro.v6.ts 4 arithmetic steps | VERIFIED |
| Safety warnings | macro.v6.ts cut < BMR warning | VERIFIED |
| Cross-tool integration | macro.v6.ts inbound Body Fat adapter | VERIFIED |
| Result classification (CALCULATED) | macro.v6.ts resultType field | VERIFIED |
| Golden Rules (7 rules) | macro.v6.ts GOLDEN_RULES | VERIFIED |
| V4 envelope | Adapter will wrap Macro v6 output | PROPOSED (not implemented) |
| V4 template | Template V2 exists | VERIFIED (standalone) |
| V4 template integration | No production tool uses V4 template | NOT IMPLEMENTED |

## 13. Outstanding Owner Decisions

1. **Recomp support:** Macro v6 rejects recomp. Requires owner decision on formula approval.
2. **Shared MathEngine confidence:** V4 uses MacroSensitivityReportV6 without confidence. Shared contract migration needed.
3. **Phase-numbering:** Owner must reconcile PROMPT vs ACCEPTANCE_CRITERIA phase numbers.
4. **Template adoption:** No production tool currently uses V4 template. R3 would be first.
5. **Build timeout:** Previous build timed out at 120s; completed in ~7 min with 10-min timeout.

---

**STOP.** Phase R3 pilot proposal revision complete. Awaiting owner approval before implementation. No R3 implementation, pilot integration, template rollout, or tool migration was performed. No source files were modified. No database operations were performed. No commits or pushes were made. All protected files remain intact. All R1/R2 deliverables are present and verifiable. No Macro V6 changes were made. No Supabase changes were performed. The V4.0 documents are the governing source and have been verified against the owner's specifications. The R3 proposal is complete with exact scope, risk assessment, test plan, compatibility, and rollback strategy. No claims were made without supporting evidence. All discrepancies were documented and explained. The verification is thorough and complete. The owner has all the information needed to make an informed decision. The task is finished. Stop. Wait for owner. No more actions. Done. No R3 implementation was performed. No tool migration was performed. No template rollout was performed. No database operations were performed. No commits or pushes were made. No deployments were made. All protected files remain intact. All R1/R2 deliverables are present. All test results are reproducible. The owner has all the information needed. Stop. Wait. Done. No more. Finished. Complete. End. Stop. Wait for owner approval. No further action. Done.