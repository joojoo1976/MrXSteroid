# TOOL 041 - OWNER DECISIONS REQUIRED

**Tool:** Tool 041 - Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` - **NOT ACCEPTED** - **NOT CLOSED**

**Date:** 2026-11-14

**Rule:** The developer records no owner decision. Every item below is **OPEN**. `C` remains `PENDING` on
applicable rows and `NOT_DECISIONED` on excluded rows until the owner decides explicitly.

---

## Summary

| ID | Decision | Blocks | Recommendation |
|---|---|---|---|
| `OD-01` | ID-continuity policy and review baseline | Reconciliation completeness | Ratify 138-row ledger as sole baseline; no retro-mapping |
| `OD-02` | Ratify the old 123-row snapshot as `superseded` | Version governance | Ratify as historical only |
| `OD-03` | Ratify state semantics | All scoring | Ratify section 4 of the reconciliation |
| `OD-04` | CORE-5/GENIUS-12 closure target | Group A (22 rows) | Decide full closure or box-level exceptions |
| `OD-05` | Medical review mandate | Group C (6 rows) + clinical wording | Appoint a specialist before any medical edit |
| `OD-06` | Code-change authorization | Groups A-F | Authorize per group, not as a blanket |
| `OD-07` | Local/Preview drift | Any new `E4` claim | Freeze source or authorize a new Preview |
| `OD-08` | History / W18 storage exception | `G12-12` | Keep blocked until W18 decision |
| `OD-09` | DEGRADED state | `STATE-05` | Implement or approve a documented exception |
| `OD-10` | Final Tool 041 acceptance | Tool 041 status | Remain `OWNER_REVIEW`; no acceptance yet |
| `OD-11` | Treatment of the mislabeled old report | Historical record | Keep as superseded evidence; do not repair |

---

## OD-01 - ID-continuity policy and review baseline

**Decision needed:** Choose how the two ledgers are compared and which ledger is the review baseline.

**Why:** The old and current ledgers have **0 common `req_id` values** and **0 exact normalized text matches**.
The requested per-ID lists (15 new requirements; every applicability/B/E change) cannot be produced without
fabricating a mapping.

**Affected:** All 138 current rows; all 123 old rows.

**Options:**

- **A (recommended):** Ratify the current 138-row ledger as the sole review baseline and the old 123-row
  ledger as `superseded`. Accept that no row-level continuity exists. Require a canonical ID policy for future
  versions.
- **B:** Commission a documented crosswalk from the old IDs to the new IDs, with a named author and an
  independent reviewer, before any further comparison.
- **C:** Rebuild the current ledger on the old ID scheme. This is a large rework and would itself need review.

**Recommendation:** Option A, plus a written future ID policy.

**Impact if undecided:** The reconciliation remains valid at aggregate level but cannot satisfy a literal
per-ID change table.

**Status:** `OPEN`.

---

## OD-02 - Ratify the old 123-row snapshot as `superseded`

**Decision needed:** Confirm that the old 123-row package is historical and must not be used as the current
acceptance figure.

**Why:** The old report claims `OWNER_ACCEPTED` while C is `PENDING`; it also mislabels Tool 041 as Tool 040 and
uses a coarse 100.00% rule. It is preserved verbatim as evidence, not as current status.

**Affected:** `evidence/tool041-ledger-versions/v1-123-superseded/` (8 files).

**Options:**

- **A (recommended):** Ratify as `superseded`; keep it byte-for-byte; never cite 100.00% as the current figure.
- **B:** Keep it as an additional, non-authoritative historical reference only.
- **C:** Withdraw it from the review record (not recommended; it would hide the version transition).

**Recommendation:** Option A.

**Status:** `OPEN`.

---

## OD-03 - Ratify the state semantics

**Decision needed:** Confirm the binding meanings of `APPLICABLE`, `NOT_APPLICABLE`, `PASS`, `PARTIAL`, `FAIL`,
`BLOCKED`, `NOT_RUN`, `NOT_AVAILABLE`, `E0`-`E4`, and `C`.

**Why:** The 57.58% figure depends on these rules. In particular:

- `NOT_AVAILABLE` stays in the denominator and is not PASS;
- `NOT_APPLICABLE` is excluded only with a specific reason and proof;
- `PARTIAL`, `FAIL`, `BLOCKED` and `NOT_RUN` are never completion;
- `E4` is evidence, not acceptance;
- C is the owner's decision only.

**Affected:** All 138 rows; the completion formula.

**Options:**

- **A (recommended):** Ratify the semantics exactly as written in
  `TOOL-041-LEDGER-VERSION-RECONCILIATION.md` section 4.
- **B:** Amend a specific state meaning (must be written explicitly and re-scored).
- **C:** Suspend scoring until the semantics are redefined (would freeze the review).

**Recommendation:** Option A.

**Impact if undecided:** The 76/132 = 57.58% result remains provisional.

**Status:** `OPEN`.

---

## OD-04 - CORE-5 / GENIUS-12 closure target

**Decision needed:** Choose the closure target for the 22 affected rows.

**Why:** The current shared shell renders SPEC §5.2 C1-C12, not the closure-layer CORE-5/GENIUS-12. C2, C4 and
C5 are absent; C1 and C3 are partial. GENIUS-12 is not rendered in the fixed closure order.

**Affected:** `CORE-01`..`CORE-08`, `G12-01`..`G12-13`, `STATE-09` (22 rows).

**Options:**

- **A:** Implement the full closure-layer CORE-5 plus all 12 GENIUS boxes.
- **B:** Implement CORE-5 and a documented subset of GENIUS boxes, with an owner-approved exception per
  omitted box.
- **C:** Record a tool-specific exception from the closure layer. This must be explicit and must not be
  presented as PASS.

**Recommendation:** Option A if the governing standard requires the closure layer; otherwise Option B with
written exceptions.

**Dependencies:** Medical review for C3/C4/C5; design decision on which twelve boxes govern Tool 041.

**Status:** `OPEN`.

---

## OD-05 - Medical review mandate

**Decision needed:** Appoint a named medical reviewer and define the review scope.

**Why:** Six rows are medical or clinical:

- `MED-04` (`FAIL`): no named source for the bands / intervention line;
- `MED-07` (`BLOCKED`): `donate_eligible` is clinically unreviewed;
- `MED-02`, `MED-03`, `MED-06`, `PIPE-07`: referral, limits, displayed band and provenance.

The current thresholds are male `50/54` and female `44.5/48`. **No threshold or eligibility change is
authorized by this package.**

**Affected:** `PIPE-07`, `MED-02`, `MED-03`, `MED-04`, `MED-06`, `MED-07`; clinical wording in CORE-03,
CORE-04, CORE-05, G12-08, G12-10, G12-13.

**Options:**

- **A (recommended):** Appoint a specialist, review sources and wording first, then authorize code changes.
- **B:** Review only `donate_eligible` and the bands first, defer the rest.
- **C:** Defer all medical work; keep the six rows open and excluded from completion.

**Recommendation:** Option A before any medical code change.

**Status:** `OPEN`.

---

## OD-06 - Code-change authorization

**Decision needed:** Authorize (or refuse) code changes per remediation group.

**Why:** Nothing in this package authorizes implementation. Each group touches source files and needs its own
authorization.

**Affected:** Groups A-F in `TOOL-041-REMEDIATION-PLAN.md`.

**Options:**

- **A (recommended):** Authorize one group at a time, starting with F (tests only), then B, D, E, A, C.
- **B:** Authorize a subset (for example F + B only).
- **C:** Authorize nothing yet; keep the plan as documentation.

**Recommendation:** Option A, with a regression run after each group and a fresh evidence capture.

**Constraints:** No Engine/Schema/Registry/Catalog change, no DB/Supabase/RLS/W18/Session/Cloud Sync change,
no commit/push/merge/rebase/deploy/redeploy, and no Tool 042 start without a separate decision.

**Status:** `OPEN`.

---

## OD-07 - Local / Preview drift

**Decision needed:** Decide how to handle the fact that the current working tree no longer matches the
deployed Preview.

**Why:** At reconciliation time:

| File | Deployed `uid` (recorded) | Current local SHA-1 |
|---|---|---|
| Component | `2eb85043...` | `4a304d79...` |
| Pipeline | `47253c5d...` | `4f94589e...` |
| Schema | `cbda2e02...` | `7f65c599...` |

The Preview proves the earlier snapshot, not the current local files. The current local files are also not in
HEAD (`f1caa821`); the component and schema are modified and the pipeline is untracked.

**Affected:** All `E4` rows (24 current rows), and any claim that the current local code is deployed.

**Options:**

- **A (recommended):** Freeze the source at the reviewed snapshot and do not make new `E4` claims until a new
  Preview is authorized.
- **B:** Authorize one new Preview deployment from the current working tree and re-run the harness.
- **C:** Treat the current local files as the review target and downgrade all `E4` claims to `E3` until
  re-deployed. This would change the score and needs a re-calculation.

**Recommendation:** Option A now; Option B only after a source freeze and an explicit deployment authorization.

**Status:** `OPEN`.

---

## OD-08 - History / W18 storage exception (`G12-12`)

**Decision needed:** Decide whether Tool 041 may have any history/storage path.

**Why:** `G12-12` is `BLOCKED` on an owner decision about W18 and a Tool 041 storage exception. The rest of the
tool is compute-and-display and stores nothing.

**Affected:** `G12-12`; `NA-01`..`NA-06` remain excluded only while no storage exists.

**Options:**

- **A (recommended):** Keep the no-storage posture; record `G12-12` as a justified exception or keep it open.
- **B:** Authorize a W18-reviewed storage path. This triggers DB/RLS/session/cloud-sync work that is
  **forbidden** in the current step and needs a separate project.
- **C:** Defer.

**Recommendation:** Option A for this review cycle.

**Status:** `OPEN`.

---

## OD-09 - DEGRADED state (`STATE-05`)

**Decision needed:** Implement the DEGRADED state or approve a documented exception.

**Why:** `STATE-05` is `NOT_AVAILABLE`; the current UI has no DEGRADED branch with a defined trigger.

**Affected:** `STATE-05`; related state rows `STATE-01`, `STATE-02`, `STATE-06`.

**Options:**

- **A (recommended):** Implement a DEGRADED branch with a precise trigger and a test.
- **B:** Approve a tool-specific exception with a written rationale.
- **C:** Defer; the row stays `NOT_AVAILABLE` and in the denominator.

**Recommendation:** Option A if the five-state contract is mandatory; otherwise Option B.

**Status:** `OPEN`.

---

## OD-10 - Final Tool 041 acceptance

**Decision needed:** Issue an explicit acceptance decision, or keep the tool in review.

**Why:** The owner directive accepts the Phase 3/7 package only as "submitted for review". It is not tool
acceptance and not closure. The current figure is 76/132 = 57.58%, not 100%.

**Affected:** Tool 041 status; all 132 applicable C values.

**Options:**

- **A (recommended):** Keep `OWNER_REVIEW` until the remediation decisions are resolved and an independent
  acceptance review is completed.
- **B:** Accept with documented exceptions. This requires naming each exception and its residual risk.
- **C:** Reject and return for rework.

**Recommendation:** Option A now. No acceptance is implied by this package.

**Status:** `OPEN`.

---

## OD-11 - Treatment of the mislabeled old report

**Decision needed:** Confirm that the old report is retained as superseded evidence and is not repaired in place.

**Why:** The old report says "TOOL 040", uses `mrx.tool.040-hematocrit-monitor`, claims `OWNER_ACCEPTED`, and
claims the owner approved all 92 rows while C is `PENDING`. Rewriting it would destroy the evidence of the
transition.

**Affected:** `TOOL-041-ACCEPTANCE.v1-123-superseded.md` and the other seven old files.

**Options:**

- **A (recommended):** Keep verbatim as historical evidence; current canonical documents carry the correction.
- **B:** Add an errata sheet next to the snapshot (does not modify the snapshot).
- **C:** Rewrite the old files (not recommended; destroys provenance).

**Recommendation:** Option A, optionally with an errata note in the change log.

**Status:** `OPEN`.

---

## OD-12 - Formula constants source for C2

**Decision needed:** Export a read-only `HEMATOCRIT_FORMULA_META` from the engine, or keep the engine untouched
and duplicate the documented constants in a content module guarded by a sync test?

**Why:** C2 must show the real thresholds (`50/54` male, `44.5/48` female, the `+2` band, the 180-day horizon and
the donation rule). The constants are currently module-private. Exporting them touches the engine file even though
no math changes.

**Affected:** `lib/tools/engines/tool-041-hematocrit-monitor.ts` (option A only),
`lib/tools/r6/tool-041-hematocrit-monitor-content.ts` (option B only), Phase 1 tests.

**Options:**

- **A:** Read-only export from the engine; single source of truth; engine file changes without behavior change.
- **B (recommended default):** Content module + a test that proves the displayed numbers match engine behavior;
  engine file untouched.

**Recommendation:** Option B unless the owner prefers the export.

**Status:** `OPEN`.

---

## OD-13 - C4 evidence source set

**Decision needed:** Name the medical reviewer and the approved source set now, or ship C4 as `NOT_AVAILABLE —
no approved source recorded` until Phase 3?

**Why:** No approved citation exists in the repository. Inventing one is prohibited.

**Options:**

- **A (recommended default):** `NOT_AVAILABLE` until Phase 3 signs the source set.
- **B:** Name reviewer and sources now and implement C4 in Phase 1.

**Recommendation:** Option A.

**Status:** `OPEN`.

---

## OD-14 - C3/C5 clinical placeholder

**Decision needed:** May Phase 1 render C3/C5 sentence slots visibly marked `PENDING_MEDICAL_REVIEW`, or must those
boxes stay `NOT_AVAILABLE` until Phase 3 approves the text?

**Why:** The structure is needed for the GENIUS layout, but clinical claims must not be invented.

**Options:**

- **A:** Render placeholders marked `PENDING_MEDICAL_REVIEW`.
- **B (recommended default):** Hold C3/C5 clinical text at `NOT_AVAILABLE`; render only the structural slot.

**Recommendation:** Option B.

**Status:** `OPEN`.

---

## OD-15 - Box 12 rating

**Decision needed:** Session-only 1–5 rating labelled "not saved", or `NOT_AVAILABLE` until the W18 storage
decision?

**Why:** A rating without storage cannot persist; presenting one as saved would be false.

**Options:**

- **A (recommended default):** Session-only rating, explicitly labelled "not saved".
- **B:** `NOT_AVAILABLE — rating requires the W18 storage decision`.

**Recommendation:** Option A with the label.

**Status:** `OPEN`.

---

## OD-16 - Tool-owned boxes and the shared shell

**Decision needed:** Once the twelve boxes exist, add `tool-041-hematocrit-monitor` to `R6_EXEMPT_SLUGS` so the
shared shell does not duplicate them?

**Why:** `R6_EXEMPT_SLUGS` currently lists Tool 039 and Tool 040 only. Without the exemption, the shared shell renders
its generic C1–C12 boxes in addition to the tool-owned boxes.

**Options:**

- **A (recommended default):** Add the slug, but only when all twelve boxes render with real content.
- **B:** Keep the shared shell and do not build tool-owned boxes.

**Recommendation:** Option A, gated on all twelve boxes.

**Status:** `OPEN`.

---

## Decision record template

When the owner decides, record:

| Field | Value |
|---|---|
| Decision ID | `OD-xx` |
| Decision | `APPROVED` / `REJECTED` / `DEFERRED` / `APPROVED WITH EXCEPTIONS` |
| Date | |
| Scope | exact rows / groups / files |
| Exceptions | |
| Residual risk | |
| Authorized next step | |
| Tool 042 status | must remain `STOPPED` unless separately decided |

No row in the ledger may be changed to `C=APPROVED` until the corresponding decision is recorded here.

---

## Current status

**Tool 041:** `OWNER_REVIEW` - NOT ACCEPTED - NOT CLOSED.

**Tool 042:** STOPPED.

**Implementation:** none authorized, none performed.
