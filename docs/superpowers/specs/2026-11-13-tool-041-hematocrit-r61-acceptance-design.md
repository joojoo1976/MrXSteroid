# Design — R6.1 Acceptance Procedure for Tool 041 — Hematocrit Monitor

**Date:** 2026-11-13
**Tool under acceptance:** Tool 041 — Hematocrit Monitor · `mrx.tool.041-hematocrit-monitor`
**Canonical route:** `/smarttools/medical-monitoring/tool-041-hematocrit-monitor`
**Branch:** `docs/r6.1-r0-evidence` · **HEAD at design time:** `7cac0d1f983c6456d395b73cd05cf6c9290a93a4` (2026-11-13) · all prior Tool 039/040 changes uncommitted per owner instruction

## Approved design (owner directive, 2026-11-13)

The owner approved, for Tool 041, the **full R6.1 acceptance procedure** under the
**Verification-First — Preserve Existing Work — Close Actual Gaps Only** path:

1. No rebuild of the tool from scratch; no redoing completed work; no rewriting existing
   work just to re-apply a prior pattern.
2. Phase 1 — Forensic Discovery before any edit.
3. Phase 2 — R6.1 Acceptance Audit across all applicable requirement families.
4. Phase 3 — Exact completion percentage from the real requirement ledger.
5. Phase 4 — Close actual gaps only, with minimal fixes + tests, preserving the original
   engine and results.
6. Phase 5 — Verification and tests (local build evidence kept separate from published
   preview evidence).
7. Phase 6 — Deploy and Preview (no Preview before a separate owner authorization; after
   authorization: deploy the version that passed, verify on the published deployment, no
   Production / no Promotion).
8. Phase 7 — Final delivery report.
9. Phase 8 — Fixed constraints (no commit/push/merge/rebase without authorization, no
   destructive checkout, no DB/RLS/Supabase/W18/cloud-sync changes, no paid AI, no Tool ID or
   route edits, no edits outside the tool scope, no Tool 042 before Tool 041 closure).

## Design decisions

- **Source of truth for implementation:** the existing working-tree artifacts for Tool 041
  (engine, Zod schema, R6 pipeline, adapter, component, page, registry, i18n, tests) plus the
  uncommitted follow-up edits (schema type export, pipeline) identified in the forensic
  discovery phase. The forensic discovery must classify every artifact as committed or
  uncommitted before anything else.
- **Requirement accounting:** the same atomic requirement set used for Tools 039/040; the
  completion figure must come from the Tool 041 ledger computation, not estimation.
- **Gap handling:** gaps discovered by the audit are closed with the minimal change and a new
  test; no feature additions outside R6.1.
- **Evidence handling:** local verification evidence (E3) and published Preview evidence (E4)
  remain separate; E4 requires a fresh owner Preview authorization.

## Success criteria

- Tool 041 implementation correctness proven against the engine, schema, pipeline, UI and i18n.
- Exact completion percentage computed from the ledger with `LEDGER_INTEGRITY: OK`.
- All applicable requirements either completed-with-E3+ or explicitly closed; nothing counted
  without evidence.
- Final delivery report delivered with actual test outputs and (after authorization) Preview data.
