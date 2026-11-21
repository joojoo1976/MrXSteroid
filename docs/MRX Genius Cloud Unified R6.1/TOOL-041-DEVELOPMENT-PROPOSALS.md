# TOOL 041 - DEVELOPMENT PROPOSALS (NOT IMPLEMENTED)

**Tool:** Tool 041 - Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` - NOT ACCEPTED - NOT CLOSED

**Implementation state:** **NONE** of these proposals is implemented or authorized. They are planning items.

> These proposals are **not** part of the completion percentage. The 76/132 = 57.58% figure is computed only
> from the 138-row ledger. A proposal does not become a requirement by being listed here.

---

## Proposal register

| ID | Proposal | Group | Affected rows | Owner decision | Medical review | Code authorization |
|---|---|---|---|---|---|---|
| `P-01` | Replace the tool's SPEC C1-C12 slot with closure-layer CORE-5 | A | `CORE-01`..`CORE-05` | OD-04 | Yes for C3/C4/C5 | Required |
| `P-02` | Render all 12 GENIUS boxes in the fixed closure order | A | `G12-01`..`G12-13` | OD-04 | Yes for boxes 7/9/12 | Required |
| `P-03` | Enforce `HematocritResultSchema` before the envelope | B | `SCH-08`, `PIPE-12` | No | No | Required |
| `P-04` | Add schema boundary tests (readings, dates, weeks) | B | `SCH-02`, `SCH-04`, `SCH-07`, `SCH-09` | No | No | Required |
| `P-05` | Add sourced sex-specific reference bands and provenance | C | `PIPE-07`, `MED-04`, `MED-06` | OD-05 | **Yes** | Required |
| `P-06` | Add referral, interpretation limits and "not a diagnosis" | C | `MED-02`, `MED-03` | OD-05 | **Yes** | Required |
| `P-07` | Review `donate_eligible` wording and clinical validity | C | `MED-07` | OD-05 | **Yes** | Separate explicit authorization |
| `P-08` | Localize bands, warning codes and validation errors | D | `SCH-10`, `STATE-07`, `I18N-02`..`I18N-05`, `CORE-07` | No | Yes for clinical terms | Required |
| `P-09` | Make EMPTY/PARTIAL real and add DEGRADED | E | `STATE-01`, `STATE-02`, `STATE-05`, `STATE-06` | OD-09 | No | Required |
| `P-10` | Complete accessibility and run Arabic RTL at 390 px | E | `STATE-10`, `A11Y-06`..`A11Y-08`, `RESP-05`, `CORE-08` | No | No | Required |

Engine boundary tests (`ENG-02`, `ENG-04`, `ENG-10`, `ENG-11`, `ENG-14`, `ENG-16`) are tracked as group F in
`TOOL-041-REMEDIATION-PLAN.md`; they are test-first work and are not repeated as separate proposals.

---

## Explicit non-goals

- No Engine, Schema, Registry or Catalog change without OD-06.
- No database, Supabase, RLS, W18, Session or Cloud Sync change.
- No commit, push, merge, rebase, deploy or redeploy.
- No Tool 042 start.
- No threshold, band or eligibility change without a separate medical and owner authorization.

---

## Status

All proposals: `PROPOSED - NOT AUTHORIZED - NOT IMPLEMENTED`.

Tool 041: `OWNER_REVIEW` - NOT ACCEPTED - NOT CLOSED.

Tool 042: STOPPED.
