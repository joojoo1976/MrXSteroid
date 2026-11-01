# SMARTTOOLS_BATCH_10_PLAN

Status: `IMPLEMENTED — SOURCE, TEST, TYPECHECK AND BUILD PASS; PARITY EVIDENCE PARTIAL`. See `SMARTTOOLS_BATCH_10_REPORT.md` for delivered changes and remaining checks.

## Purpose

Start the owner's expanded requirement: close the applicable Tool 111 feature gaps for the already-developed Nutrition tools 112–117. The source-level audit is in `SMARTTOOLS_PARITY_AUDIT_112_121.md`.

## Scope

1. Harden the shared `DataProvenance` contract to represent unassessed confidence/source quality without made-up numeric confidence. Audit contract formatting, validators, schemas and consumers before changing it; preserve valid existing outputs.
2. Add a shared, accessible result-envelope view for severity-ranked findings, localized warnings/limitations, source classification and provenance.
3. Wire the existing 112–117 adapters into their UI result flow with typed output states and invalid-input/stale-result handling.
4. Add explicit reset actions and a clear calculation action to submit-style forms. Keep live calculation only when the interaction is intentional and add reset.
5. Add unit-system selection/conversion only where the tool accepts measurable values that can be converted consistently. Preserve canonical engine units; do not add meaningless toggles.
6. Complete AR/EN dynamic output strings and RTL/LTR labels for findings, warnings, errors and provenance.

## Acceptance

- T111-01 through T111-14 each get `PASS`, `PARTIAL`, or `NOT_APPLICABLE` with source and test evidence; don't report parity on build evidence alone.
- No fixed confidence estimates without a cited/calibrated method. `NOT_AVAILABLE` is valid where no supported source exists.
- Focused engine and component tests cover calculation, validation, reset, stale results, source rendering and AR/EN. Browser checks cover one representative route per distinct UI pattern.
- `npm run validate-tools`, TypeScript, targeted lint and production build pass. Full repository lint is rerun only after the shared contract change set is complete.
- No DB write, migration, commit, push or deployment.

## Out of scope for this batch

AI/ML inference, live restaurant or grocery feeds, cross-tool-derived predictions, exports, voice, Vision, persistence of result envelopes, and any claim that an API/database save succeeded. Those features were not established for Tool 111 and need separate explicit requirements and evidence.

## Sequence after Batch 10

Batch 11 applied the shared UI/output foundation to tools 118–121. Next audit and implement 122–125. Continue category batches until all existing identities are covered, then reconcile missing identities against the source of truth for the 252-tool target.

## Governance expansion from the owner-provided master prompt

Use `SMARTTOOLS_PLATFORM_GOVERNANCE.md` for the platform-wide architecture layers, output classifications, future capability boundaries, 15 shared product/quality areas and batch gates. These are not all features for every calculator: each batch must mark applicability and evidence. The current user request explicitly expands the rollout beyond the attached prompt's original Phase 1-only stop; this does not authorize production DB writes, migrations, commits, pushes or deployment.
