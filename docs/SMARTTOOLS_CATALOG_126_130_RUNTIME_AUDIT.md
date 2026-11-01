# SmartTools 126–130 Runtime Audit (2026-10-26)

| Tool | Evidence | Status | Gap |
|---|---|---|---|
| 126 | `lib/tools/engines/tool-126-neuromuscular-explosiveness-modeler.v6.ts` and v6 test | PARTIAL | Verify input validation, source assumptions, and UI/header preference integration |
| 127 | `lib/tools/engines/tool-127-ai-daily-readiness-explainer.v6.ts` and v6 test | PARTIAL | Deterministic explainer must not imply external AI or medical readiness diagnosis |
| 128 | `lib/tools/engines/tool-128-training-load-acute-chronic-ratio.v6.ts` and v6 test | PARTIAL | Ratio thresholds need source/limits disclosure; no clinical injury prediction claim |
| 129 | `lib/tools/engines/tool-129-ai-adaptive-training-planner.v6.ts` and v6 test | NEEDS_SCOPE_REVIEW | Planner output can be interpreted as personalized training prescription |
| 130 | `lib/tools/engines/tool-130-ai-plateau-detective.v6.ts` and v6 test | PARTIAL | Plateau detection is deterministic and needs explicit data sufficiency/uncertainty disclosure |

## Verification

- `npx vitest run lib/tools/engines/tool-126-130-batch.test.ts` — PASS, 1 file / 5 tests.
- No implementation changes made in this initial audit.
- Database, migrations, commits, pushes, deployment — NOT RUN.

Decision: `NOT READY FOR ROLLOUT` pending schema/source/UI review.

Tool 128 narrow remediation: finite bounded load values, strict schemas, and explicit relative-indicator boundary. Batch tests 5/5 PASS; TypeScript PASS.

Tools 126–127 narrow remediation: finite bounded numeric inputs and strict schemas. Batch tests 5/5 PASS; TypeScript PASS. Created docs/SMARTTOOLS_TOOLS_126_127_SOURCES.md.

Tool 129 narrow remediation: finite bounded schema, integer session count, trimmed equipment labels, and strict unknown-field rejection. Batch tests 5/5 PASS; TypeScript PASS. Output remains a model scenario, not a personalized prescription.

Tool 130 narrow remediation: finite positive metrics, strict point/root schemas, and explicit rule-signal boundary. Batch tests 5/5 PASS; TypeScript PASS.
