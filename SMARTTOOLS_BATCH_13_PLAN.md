# SmartTools Batch 13 Plan — Tool 111 parity for tools 126–130

Status: `IN PROGRESS`.

## Source audit

- Catalog identities, category mappings, schemas and V6 deterministic engines already exist for 126–130; shared `TOOL_REGISTRY`, `Page` identities and `PAGE_TO_PATH` entries do not.
- Components use `any`, fixed/sample data, incomplete controls and inline results; none surfaces canonical ToolOutput provenance/findings/navigation or common unit/interaction controls.
- Tool 128 generates 28 fabricated daily load records on click. Tool 130 uses pasted JSON instead of structured metric history. Tool 129 accepts but ignores experience level and all tools with “AI” in their names use deterministic rules.
- Tool 130's numeric `confidence` is an uncalibrated rule constant and must not be presented as data/model confidence.

## Scope

- Register existing tool IDs with canonical training-recovery routes while preserving flat catalog/legacy routes.
- Add typed canonical adapters for all five engines; provenance confidence and data quality remain unassessed.
- Replace all five UIs with validated, bilingual, explicit calculate/reset flows and stale-output clearing. Apply mass conversions only to convertible fields.
- Improve ACWR timeline sufficiency so 28 days of elapsed history, not 28 recorded training dates, determines whether a ratio is reportable; missing/zero-baseline ratios stay unavailable.
- Make Tool 126's no-test state unavailable, expose Tool 127 marker coverage, use experience level in Tool 129's deterministic outline, and relabel Tool 130's rule signal without calibrated confidence.
- Add focused engine/adapter/registry/route tests and DOM controls tests; update inventory, parity/governance and baseline records.

## Gates and non-goals

- Keep engine math deterministic; no external AI claims, data persistence, database writes, migrations, commits, pushes or deployment.
- Preserve all pre-existing worktree edits. Do not renumber IDs or replace legacy routes.
- Run focused tests, DOM checks, TypeScript, `validate-tools`, targeted lint and production build; document remaining UI evidence separately.
