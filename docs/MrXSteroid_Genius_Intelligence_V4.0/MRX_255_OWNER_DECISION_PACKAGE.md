# MRX_255_OWNER_DECISION_PACKAGE.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Frozen master SHA-256:** `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`  
**Source B SHA-256:** `4525F3B089A75BCAD5A6CFF2A4F2B07891C68104BA8C69E9A89407506B714D7B`  
**Mode:** Read-only. No implementation, commit, push, merge, or deployment performed.

## 1. Executive answer to “Have you completed the prompt in full?”

No, not as implementation. The read-only audit, dossiers, matrices, defect plans, and decision package are complete. Implementation remains blocked by owner decisions. R5 is not accepted, Batch 2 has not started, and no formula has been changed.

## 2. True tool count and reconciliation

- Catalog entries: 268.
- Implemented: 264.
- Planned: 4 (`tool-132`, `tool-137`, `tool-138`, `tool-139`).
- Numbered slots: 247 (243 implemented + 4 planned).
- Missing numbered slots: 8 (1–5, 253–255).
- Named tools: 21.
- Implemented surplus over 255: 9.
- Catalog surplus over 255: 13.
- There is no clean set of nine removable tools. The 9 is arithmetic, not identity.
- Four catalog/registry identity mismatches remain reported, not normalized.

Status model: 3 `PASS` (R5 pilots, pending acceptance), 58 `FAIL` (53 record-only + 5 formula defects), 203 `PARTIAL`, 4 `BLOCKED`.

See `MRX_255_TOOL_COUNT_RECONCILIATION.md`.

## 3. Safety priorities

1. **Tool-010 is a release-blocking safety issue.** It is publicly routable, free, sitemap-visible, and has no auth/feature gate. It contains unsafe aromatase-inhibitor advice at component lines 105, 141, and 142, stale AI/provider copy at lines 158 and 191, and an implausible “estradiol equivalent” in milligrams. Its engine file is types only.
2. **30 record-only tools** are classified as suspend/redesign because they imply medical, hormonal, cardiovascular, reproductive, or neurological risk assessment without calculation or source.
3. **Shared safety defects** affect every tool: `SafetyNotice.tsx` lines 24/27 always renders both languages with fixed `dir`; breadcrumb/metadata in `app/smarttools/[category]/[tool]/page.tsx` lines 72/74 and metadata are English-only; 204 implemented tools lack `<main>`; 166 lack ARIA.
4. **No external AI provider, subscription, or recurring cost** may be added without owner authorization.

See `MRX_255_TOOL_010_SAFETY_AND_CONTAINMENT.md` and `MRX_255_SAFETY_AND_PRIVACY_MATRIX.md`.

## 4. Classification of the 53 raw-JSON tools

| Class | Count | Meaning |
|---|---:|---|
| A — Needs a real engine | 4 | Title implies analysis; build only with source and validation |
| B — Relabel as honest record/log | 13 | Useful as private record if renamed honestly |
| C — Needs verified source before rebuild | 6 | Calculation plausible only after source and golden cases |
| D — Suspend or redesign | 30 | Calculation unsafe or unsupported |
| Total | 53 | |

No tool is converted into a fake calculator. Each tool has an individual classification and recommended action.

See `MRX_255_RECORD_ONLY_TOOL_CLASSIFICATION.md`.

## 5. Repair plans for the five confirmed defects

| Tool | Defect | Plan file |
|---|---|---|
| 010 | Unsafe advice, stale AI copy, invalid unit, no engine | `MRX_255_DEFECT_PLAN_010_COMPOUND_STACK_BUILDER.md` |
| 020 | Unsourced genetic-potential score | `MRX_255_DEFECT_PLAN_020_GENETIC_POTENTIAL.md` |
| 030 | Hardcoded PCT costs and empty savings tips | `MRX_255_DEFECT_PLAN_030_CYCLE_COST.md` |
| 100 | Report is an input echo | `MRX_255_DEFECT_PLAN_100_COMPREHENSIVE_REPORT.md` |
| 106 | Arbitrary cap, duplicate water fields, unused input | `MRX_255_DEFECT_PLAN_106_GLYCOGEN_WATER.md` |

All five plans include responsible code, current behavior, defect, suitable reference, proposed correct behavior, golden tests, risks, rollback, and an owner approval gate. No formula or constant is changed.

## 6. AI review

- AI is an explanation layer, not a calculation authority.
- 34 tools publish typed findings; 230 are AI-result-blind.
- The contract uses `ToolOutput` → `AIInsightContext` → `AIInsightPanel`, max 16 findings, max 600-character question, explicit consent, and deterministic fallback.
- The model is forbidden from inventing or changing numbers, diagnoses, citations, or doses.
- Tool-010 violates the contract with local medical-advice strings.
- 2,680 tool-specific AI proposals exist as designs only.

See `MRX_255_TOOL_SPECIFIC_AI_CAPABILITY_MATRIX.md` and `MRX_255_AI_RESULT_CONTRACT.md`.

## 7. Revised batch order

The old 88-batch sequence is withdrawn as execution order. The proposed priority order is:

1. S1: tool-010 containment.
2. S2: 030, 106, 100.
3. S3: 020, 131, 143.
4. S4: shared infrastructure with full consumer regression.
5. S5: owner-selected rich-output tools.
6. S6: owner-selected record-only scope decisions.
7. Remaining tools by priority band, not by old batch number.

No batch is authorized by number alone. Every tool must pass individual acceptance criteria.

See `MRX_255_BATCH_ROLLOUT_PLAN.md`.

## 8. Risks and pending decisions

Pending owner decisions:

- D1: Accept or reject R5.
- D2: Tool-count scope rule.
- D3: Tool-010 containment authorization.
- D4: 53 record-only classifications.
- D5: Formula remediation for 010/020/030/100/106.
- D6: AI result contract and provider policy.
- D7: Shared chrome fixes.
- D8: Revised batch priority order.
- D9: Planned tools 132/137/138/139.
- D10: Full-suite failure ownership.
- D11: Production publication confirmation for tool-010.

Key risks:

- Tool-010 may be publicly accessible with unsafe medical advice.
- Record-only tools may be mistaken for calculators.
- Formula defects may be shipped as authoritative.
- AI may invent numbers or advice if result context is not enforced.
- Measurement switching may change canonical values if not tested.
- Shared fixes may break consumers.
- Full suite remains red with 17 failures.
- R5 acceptance must not be recorded prematurely.

## 9. Approval block

No implementation is authorized by this package. The owner must sign or reject each decision. Batch 2 remains blocked until explicit final owner acceptance of R5.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
