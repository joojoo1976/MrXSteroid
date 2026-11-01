# SmartTools Batch 11 Plan — Tool 111 parity for tools 118–121

Status: `IMPLEMENTED — TYPECHECK, FOCUSED TESTS, REGISTRY VALIDATION AND PRODUCTION BUILD PASS; PER-TOOL UI EVIDENCE PARTIAL`.

## Scope

- Connect tools 118–121 to their typed canonical ToolOutput adapters using explicit calculate/reset and stale-input hiding.
- Replace uncalibrated hard-coded provenance confidence with an explicit unassessed state.
- Register the four existing catalog identities needed by their adapters, preserving IDs/routes and avoiding order collisions.
- Add metric/imperial conversion only where dimensional inputs/results support it: temperature in 118, load/weight/length in 119–120. Tool 121 has no convertible measured input; its mass-per-body-weight ratio remains invariant.
- Exercise the shared UI on the training-model pattern and update parity/inventory evidence.

## Acceptance

- All four output builders resolve registry identity and produce `confidence: null`, `dataQuality: not_assessed`, ranked findings and registry neighbors.
- TypeScript, focused engine/contract/registry tests, DOM test, `validate-tools`, targeted lint and production build pass.
- Preserve all existing routes, no database write/migration/commit/push/deploy.

## Not in this batch

Cross-tool eventing, predictive AI/ML, persistent result memory, Workspace, live external data, and production Supabase integration remain governed platform-roadmap work. No numeric model confidence is added.
