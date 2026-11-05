# PHASE R3 — PILOT PROPOSAL

Date: 2026-11-05
Phase: R3 — One Pilot Tool Integration (PROPOSAL ONLY)
Status: PROPOSAL — NOT IMPLEMENTED
Branch: main
HEAD: 108d3063bdcbca9604ad9b7b48844b85763d51a0

## 1. Phase Crosswalk

### PROMPT.md Roadmap (Governing)
- R0: Recovery and truth baseline
- R1: Contract architecture and design
- R2: Shared runtime foundation
- R3: One pilot tool integration
- R4: Pilot evaluation
- R5: Controlled batch expansion
- R6: Persistence and cross-tool integration
- R7: Advanced AI capabilities
- R8: Release and operations

### ACCEPTANCE_CRITERIA.md (Acceptance gates, not roadmap)
- R1: Contract architecture design
- R2: AI Capability and Safety contracts
- R3: Shared runtime foundation
- R4: Pilot tool integration
- R5: Evaluation and pilot release

### Actual Implementation (Historical)
- R1: Contract architecture + Runtime validation (combined PROMPT R1+R2 scope)
- R2: Shared runtime foundation + Template V2 development (traversed PROMPT R2-R3 scope)

### Discrepancy
ACCEPTANCE_CRITERIA.md uses different phase numbers than PROMPT.md. Per owner decision, PROMPT.md governs the roadmap. ACCEPTANCE_CRITERIA.md governs acceptance evidence. Historical phase names (R1, R2) are preserved as-is.

## 2. Requirement Traceability

### SPEC Requirements

| SPEC Section | Requirement | R1 Status | R2 Status | Remaining |
|--------------|-------------|-----------|-----------|-----------|
| Dynamic Input Contract | Field definitions, validation | Type-only + Runtime validators (4) | Template field display | Tool integration |
| Dynamic Output Contract | Result envelope | Type-only + Runtime validators (7) | Template envelope display | Tool integration |
| AI Capability Contract | Per-tool profiles | Type-only | Template AI status display | Per-tool profiles, AI activation |
| Safety & Escalation | Safety contract per tool | Type-only | Template safety display | Per-tool contracts, enforcement |
| UserContext | Context engine | Type-only | Not integrated | Runtime integration |
| Validation & Completeness | Runtime validators | Runtime implemented (4 validators) | Template integration | Tool integration |
| Reasoning & Explanation | Explanation layer | Type-only | Template explanation levels | Runtime implementation |
| What-If & Sensitivity | Scenario engine | Type-only | Template scenario slots | Runtime implementation |
| Confidence & Evidence | Uncertainty layer | Structure validation only | Template uncertainty display | Runtime implementation |
| Audit & Monitoring | Audit layer | Type-only | Not integrated | Runtime implementation |
| Cross-Tool | Knowledge graph | Type-only | Not integrated | Runtime implementation |
| Schema Versioning | Versioning system | Constants + 4 rules | Not integrated | Runtime enforcement |

### PROMPT Requirements

| PROMPT Section | Requirement | R1 Status | R2 Status | Remaining |
|----------------|-------------|-----------|-----------|-----------|
| §5 Execution model | R1 contract design | Contract types created | Runtime validators created | Tool integration |
| §5 Execution model | R2 shared runtime | Runtime validators created | Template V2 created | Pilot integration |
| §6 Operating pipeline | 13-stage pipeline | Type-only | Template stages (partial) | Full pipeline runtime |
| §7 AI behavior rules | AI bounded | Type-only (capability profiles) | Template AI status | AI activation (separate approval) |
| §8 Human approval | Approval boundaries | Type-only (SafetyContract) | Template human review display | Runtime enforcement |

### ACCEPTANCE_CRITERIA Requirements

| AC Section | Gate | Status | Evidence |
|-----------|------|--------|----------|
| §2 Gate R0 | Recovery & preservation | PASS | R0 recovery report |
| §3 Gate R1 | Contract architecture | PASS | Types + runtime validators + 62 tests |
| §4 Gate R2 | AI Capability & Safety contracts | PARTIAL | Types defined, template display, no per-tool profiles |
| §5 Gate R3 | Shared runtime foundation | PASS (as R2) | Runtime validators + Template V2 + 75 tests |
| §6 Gate R4 | Pilot tool integration | NOT RUN | No pilot implemented |
| §7 Gate R5 | Evaluation & pilot release | NOT RUN | No evaluation performed |

## 3. Recommended Pilot Tool

### Macro Calculator (Tool #001)

**Rationale:**
- User value: High (nutrition planning is core use case)
- Risk: Low-Medium (deterministic calculations, no medical diagnosis)
- Data readiness: High (engine, tests, and route already exist)
- Engine readiness: High (Macro V6 with 81 passing tests)
- Architectural compatibility: High (already uses V6 contracts)
- Implementation cost: Low (adapter + template integration only)

### Alternatives Considered

| Tool | User Value | Risk | Readiness | Cost | Decision |
|------|-----------|------|-----------|------|----------|
| Macro Calculator | High | Low-Med | High | Low | **RECOMMENDED** |
| Body Fat Calculator | High | Low | High (46 tests) | Low | Alternative |
| Macro Optimizer (013) | Medium | Low | Medium | Medium | Not recommended (less tested) |
| PCT Timing (004) | High | High (medical) | Medium | High | Not recommended (high risk) |

### Why Macro Over Body Fat
- Macro V6 has more tests (81 vs 46)
- Macro V6 is the original reference engine per V3 SPEC
- Macro V6 already has cross-tool integration (Body Fat adapter)
- Macro V6 route is canonical (`/smarttools/nutrition/macro`)
- Macro V6 is the established architectural reference

## 4. Proposed Integration Scope

### Files to Modify (PROPOSED — Not Implemented)
| File | Change |
|------|--------|
| `app/smarttools/nutrition/macro/page.tsx` | Replace current content with GeniusToolTemplateV4 + MacroPilotTool |
| `components/tools/macro-pilot.tsx` | Wrap existing pilot with V4 Template V2 (additive, preserving calculation logic) |

### Files to Create (PROPOSED — Not Implemented)
| File | Purpose |
|------|---------|
| `lib/engines/core/v4/adapter.macro.v4.ts` | Adapter bridging Macro v6 output to V4 envelope |
| `lib/engines/core/v4/adapter.macro.v4.test.ts` | Adapter unit tests |

### Files NOT Modified
- `lib/tools/engines/macro.v6.ts` — protected (no formula changes)
- `lib/tools/engines/macro.v6.test.ts` — protected (no test weakening)
- `lib/tools/engines/bodyfat.v6.ts` — protected
- `lib/tools/schemas/macro.v6.ts` — protected
- All Registry/Catalog files — protected
- All Supabase files — protected

## 5. V4 Contract Adapter Design

### Adapter: `lib/engines/core/v4/adapter.macro.v4.ts`

```typescript
import { calculateMacrosV6 } from '@/lib/tools/engines/macro.v6';
import { adaptV6ToV4Envelope } from '@/lib/engines/core/v4/runtime.v4';
import type { ToolResultEnvelopeV4 } from '@/lib/engines/core/v4/contracts.v4';

// Adapter function that wraps Macro v6 calculation into V4 envelope
// WITHOUT modifying Macro v6 engine
export async function calculateMacroV4(
  inputs: MacroInputV6,
  userContext?: UserContextV4
): Promise<ToolResultEnvelopeV4<MacroInputV6, MacroOutputV6>> {
  // 1. Call existing Macro v6 engine (unchanged)
  const v6Result = await calculateMacrosV6(inputs, userContext);
  
  // 2. Wrap result in V4 envelope (additive, backward-compatible)
  return adaptV6ToV4Envelope(
    'mrx.tool.macro',
    'macro',
    '6.0.0',  // Macro v6 engine version (preserved)
    'VALID',
    // ... V4 metadata
  );
}
```

### Template Integration
```typescript
<GeniusToolTemplateV4
  toolId="mrx.tool.macro"
  title="Macro Calculator"
  resultEnvelope={envelope}
  fields={dynamicFields}
  // ... V4 props
>
  <MacroPilotTool />  {/* Existing pilot preserved */}
</GeniusToolTemplateV4>
```

## 6. Input/Output Requirements

### Input Requirements
- All 6 required Macro inputs (age, sex, height, weight, activity, phase)
- Field states (MISSING/INVALID/VALID/ESTIMATED/NOT_REQUIRED)
- Input completeness assessment
- Provenance tracking

### Output Requirements
- V4 result envelope with all required fields
- Result type: CALCULATED
- Provenance, assumptions, evidence, uncertainty, validity
- Safety warnings (cut target < BMR)
- Next actions (recalculate, navigate to Body Fat, etc.)

### Safety Requirements
- Cut target < BMR warning (existing in Macro v6)
- No medical diagnosis or dosing recommendations
- Educational disclaimer

### Uncertainty Requirements
- Qualitative uncertainty (LOW/MODERATE/HIGH/INSUFFICIENT_EVIDENCE/NOT_ASSESSED)
- Basis factors (missing inputs, measurement variation, etc.)
- Limitations (Mifflin-St Jeor population limits)

### Evidence Requirements
- Formula references (Mifflin-St Jeor study)
- Assumption documentation
- Version tracking

### Failure-State Requirements
- EMPTY: No inputs → no result, missing field guidance
- PARTIAL: Some inputs → no result, missing field list
- FULL: All inputs → calculated result with envelope
- INVALID: Bad inputs → error state, no result
- DEGRADED: AI unavailable → calculation continues, AI status shows unavailable

## 7. Test Plan

### Focused Tests (New)
- Adapter unit tests (V6 output → V4 envelope)
- Template integration tests (V4 template with Macro envelope)
- V4 contract validation tests (envelope structure)

### Regression Tests (Existing — Must Pass)
- Macro V6 engine tests: 81/81
- Macro pilot tests
- Body Fat V6 tests: 46/46
- V4 contract tests: 12/12
- V4 runtime tests: 50/50
- V4 template tests: 13/13

### Accessibility Tests (New)
- RTL rendering (Arabic)
- LTR rendering (English)
- ARIA labels and roles
- Keyboard navigation
- Screen reader announcements

### Security Tests (New)
- Prompt injection attempts in inputs
- Malformed envelope rejection
- Invalid input handling

## 8. Compatibility and Rollback

### Compatibility Strategy
1. **Additive only:** V4 template wraps existing Macro pilot, doesn't replace it
2. **No engine changes:** Macro v6 calculation logic is untouched
3. **Backward compatible:** Existing Macro v6 tests continue to pass
4. **Optional adoption:** Other tools are not affected

### Rollback Strategy
1. Revert `app/smarttools/nutrition/macro/page.tsx` to pre-R3 content
2. Delete `lib/engines/core/v4/adapter.macro.v4.ts` and test file
3. No database changes to revert
4. No migration to revert

## 9. Unresolved Decisions

1. **Recomp support:** Macro v6 rejects recomp. Requires owner decision on formula approval.
2. **Shared MathEngine confidence:** V4 uses MacroSensitivityReportV6 without confidence. Shared contract migration needed.
3. **Phase-numbering:** Owner must reconcile PROMPT vs ACCEPTANCE_CRITERIA phase numbers.
4. **Template adoption:** No production tool currently uses the template. R3 would be first.
5. **Build timeout:** Previous build timed out at 120s; completed in ~7 min with 10-min timeout.

## 10. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking Macro V6 behavior | High | Adapter is additive; engine untouched; all 81 tests must pass |
| V4 envelope increases complexity | Medium | Template handles envelope display; engine unchanged |
| Performance degradation | Low | V4 validation is lightweight; template is React-only |
| Database changes | Low | No database changes in R3 scope |
| User confusion | Low | Progressive disclosure, clear status indicators |
| Security regression | Low | Security-repair files untouched; input validation added |

## 11. Recommended Next Step

**R3 Pilot Integration (awaiting owner approval)**

Scope: Integrate Macro V6 with V4 Template V2 via adapter. No engine changes. No database changes. No tool migration.

Estimated effort: 2-3 days (adapter + tests + template integration + verification).

Dependencies:
- R1 contracts approved ✅
- R2 template approved ✅
- R2 validation gates: Build PASS, ESLint PASS, validate-tools PASS ✅
- Owner phase-numbering reconciliation (pending)

---

**STOP.** Phase R3 pilot proposal complete. Awaiting owner approval before implementation. No R3 implementation, pilot integration, template rollout, or tool migration was performed. No source files were modified. No database operations were performed. No commits, pushes, or deployments were executed.
