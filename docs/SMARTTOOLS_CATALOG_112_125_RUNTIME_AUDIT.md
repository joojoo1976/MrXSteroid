# SmartTools 112–125 Runtime Audit (2026-10-26)

| Group | Evidence | Status | Follow-up |
|---|---|---|---|
| 112–117 nutrition | `lib/tools/engines/tool-112-117-batch.test.ts`, engine files 112–117 | PARTIAL | Review nutrition scoring, cost optimization, supplement evidence, fasting and intra-workout outputs for source/medical boundaries |
| 118–121 training recovery | `lib/tools/engines/tool-118-121-batch.test.ts`, engine files 118–121 | PARTIAL | Review score labels, recovery assumptions, and whether outputs imply training prescriptions |
| 122–125 training modeling | `lib/tools/engines/tool-122-125-batch.test.ts`, engine files 122–125 | PARTIAL | Review 1RM, joint stress, deload and fiber-type claims; add strict schemas and provenance evidence |

## Verification

- `npx vitest run lib/tools/engines/tool-112-117-batch.test.ts lib/tools/engines/tool-118-121-batch.test.ts lib/tools/engines/tool-122-125-batch.test.ts` — PASS, 3 files / 16 tests.
- No implementation changes made in this audit pass.
- Database writes, migrations, commits, pushes, and deployment — NOT RUN.

## Decision

`NOT READY FOR ROLLOUT`. The existing tests pass, but source evidence, adapter provenance, UI header preference compliance, and safety boundaries have not yet been verified for every tool in this group.

Tool 112 narrow remediation: strict finite schema, integer tracking days, trimmed strings, and unknown-field rejection. Batch tests 7/7 PASS; TypeScript PASS.

Tool 113 narrow remediation: strict finite nested schema, integer days, trimmed identifiers, and unknown-field rejection. Batch tests 7/7 PASS; TypeScript PASS.

Tool 114 narrow remediation: strict finite restaurant/ingredient schema and unknown-field rejection. Batch tests 7/7 PASS; TypeScript PASS.

Tool 115 narrow remediation: strict finite evidence schema and unknown-field rejection. Batch tests 7/7 PASS; TypeScript PASS. No literature retrieval or supplement recommendation is implemented.

Tool 116 narrow remediation: strict finite food-log schema and unknown-field rejection. Batch tests 7/7 PASS; TypeScript PASS.

Tool 117 narrow remediation: strict finite schema and nested intake validation. Batch tests 7/7 PASS; TypeScript PASS.

Tools 118–121 narrow remediation: strict finite schemas and unknown-field rejection. Batch tests 6/6 PASS; TypeScript PASS. Created docs/SMARTTOOLS_TOOLS_118_121_SOURCES.md.

Tools 122–125 narrow remediation: finite numeric validation, trimmed labels, strict root schemas, and unknown-field rejection. Batch tests 3/3 PASS; TypeScript PASS. Created docs/SMARTTOOLS_TOOLS_122_125_SOURCES.md.

Unified verification after all changes: 3 files / 16 tests PASS; validate-tools 5/5 PASS; TypeScript PASS. Browser/accessibility/live persistence and full-suite regression remain outside this focused gate.
