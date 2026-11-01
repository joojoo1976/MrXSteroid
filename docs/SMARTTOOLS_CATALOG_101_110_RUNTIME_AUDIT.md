# SmartTools 101–110 Runtime Audit (2026-10-26)

This is an evidence audit only; no implementation changes were made to tools 101–110 in this pass.

| Tool | Current implementation evidence | Preliminary status | Main boundary/gap |
|---|---|---|---|
| 101 | `lib/tools/engines/tool-101-sarm-to-aas-transition-bridge-predictor.ts:6-17,112-157`; focused tests cover no dose/protocol fields | PARTIAL | Educational elimination model still exposes recovery/tier language requiring review; no rollout approval |
| 102 | `lib/tools/engines/tool-102-subcutaneous-vs-intramuscular-pk-modeler.ts:6-21,58-91`; tests assert no recommendation | PARTIAL | Uses dose and injection route inputs; must remain geometric/PK comparison only and needs source/limit audit |
| 103 | `lib/tools/engines/tool-103-renal-function-hydration-index.ts:57-78`; tests cover CKD-EPI estimate and disclaimer | PARTIAL | Health index/status can be read as clinical interpretation; requires explicit educational-only handling and source evidence |
| 104 | `lib/tools/engines/tool-104-thyroid-metabolic-rate-dynamics.ts:5-7,83-93` | PARTIAL | Derived metabolic estimate and interpretation flags need strict input/source/clinical boundary review |
| 105 | `lib/tools/engines/tool-105-ai-health-data-fusion-hub.ts:10-19,136-162` | PARTIAL | Persistence/consent and health-data privacy must be verified; AI label is deterministic only |
| 106 | `lib/tools/engines/tool-106-glycogen-supercompensation-water-modeler.ts:7-12,63-83` | NEEDS_SCOPE_DECISION | Produces glycogen/water predictions and GI-risk classification; peak-week/nutrition safety boundary unresolved |
| 107 | `lib/tools/engines/tool-107-contest-prep-peak-week-manipulator.ts:5-17,125-144` | NEEDS_SCOPE_DECISION | Peak-week schedule and dehydration risk may constitute health guidance; requires explicit owner scope |
| 108 | `lib/tools/engines/tool-108-ai-body-composition-vision-engine.ts:13-16,53-74` | PARTIAL | Formula estimate is deterministic, not AI vision; needs input validation and disclosure audit |
| 109 | `lib/tools/engines/tool-109-competition-readiness-posing-os.ts:15-41,61-77` | PARTIAL | Checklist behavior is narrow but source/copy and UI boundary need audit |
| 110 | Registry has `tool-110-ai-meal-vision-scanner`; component/header test exists | NOT_VERIFIED | Engine/source implementation and actual image analysis path were not verified in this pass |

## Verification commands

- `npx vitest run lib/tools/engines/tool-101-sarm-to-aas-transition-bridge-predictor.test.ts ...` — NOT RUN as a dedicated 101–110 batch in this pass.
- Full implementation inspection via `rg` — PASS (evidence paths above).
- Database writes, migrations, commits, pushes, and deployment — NOT RUN.

## Decision

`NOT READY FOR ROLLOUT`. Tools 106–107 require an explicit scope decision before implementation; 105 requires privacy/persistence verification. Continue with source, schema, adapter, UI, and focused-test audits before modifying this batch.

Focused engine tests subsequently run: 9 files / 57 tests PASS. This verifies existing engine tests only, not source completeness, browser behavior, privacy persistence, or release readiness.

Tool 110 narrow remediation: blank initial food input and strict photo-consent refinement added; 10 files / 65 tests PASS and TypeScript PASS after change. This does not establish real AI vision or release readiness.

Tool 108 narrow remediation: strict finite/integer schema and explicit deterministic/non-AI source note added. 10 files / 65 tests PASS; TypeScript PASS.

Tool 103 narrow remediation: strict finite schema and non-assessed provenance (no artificial confidence/reference range). Engine tests 6/6 PASS; TypeScript PASS.

Tool 104 narrow remediation: strict finite schema and non-assessed provenance; removed universal confidence/reference-range claims. Engine tests 5/5 PASS; TypeScript PASS.

Tool 105 narrow remediation: strict event/input schema with explicit consent/auth fields and finite values. Engine tests 5/5 PASS; TypeScript PASS.

Tool 106 narrow remediation: strict finite schema, integer days, and non-assessed provenance. Engine tests 7/7 PASS; TypeScript PASS. Scope decision remains required before rollout.

Tool 107 narrow remediation: strict finite schema, integer day count, and non-assessed provenance. Engine tests 8/8 PASS; TypeScript PASS. Scope decision remains required before rollout.

Tool 101 narrow remediation: strict finite duration/schema and non-assessed provenance. Engine tests 6/6 PASS; TypeScript PASS. Controlled-substance scope review remains required.

Tool 102 narrow remediation: strict finite schema and non-assessed provenance. Engine tests 6/6 PASS; TypeScript PASS. Injection/controlled-substance scope review remains required.
