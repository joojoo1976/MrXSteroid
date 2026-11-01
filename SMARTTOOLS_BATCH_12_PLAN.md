# SmartTools Batch 12 Plan — Tool 111 parity for tools 122–125

Status: `IMPLEMENTED — focused tests, DOM check, TypeScript, registry validation and targeted lint pass; production build verification in progress`.

## Scope

- Apply the Tool 111 shared interaction/output pattern to existing training tools 122–125: typed validated inputs, explicit calculation/reset, stale-result hiding, ranked key findings, bilingual provenance and registry-based related links.
- Register current catalog identities in the shared Page/Tool registry and legacy route table without renaming catalog routes or IDs.
- Convert displayed mass inputs/results in tool 122, exercise loads in tool 123, and body mass/length measurements in tool 125 while retaining canonical metric engine inputs. Tool 124 has no physical unit input needing conversion.
- Replace tool 122's fabricated provenance confidence with `not_assessed`; distinguish its model-fit category from calibrated data confidence.
- Add deterministic engine/adapter coverage and a DOM interaction test for conversion, explicit calculation, provenance and stale/reset behavior.

## Acceptance

- All four tools emit canonical ToolOutput envelopes with unassessed provenance and stable registry neighbors.
- TypeScript, focused tests, DOM check, `validate-tools`, targeted ESLint and production build pass.
- Keep results educational and deterministic. No database writes, migrations, commits, pushes or deployments.

## Deferred

Tool-specific DOM coverage for 123–125 and dynamic-copy localization review remain open. Cross-tool eventing, real AI/ML and persistent memory remain platform work under `SMARTTOOLS_PLATFORM_GOVERNANCE.md`.
