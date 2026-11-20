# TOOL 041 - CORE-5 / GENIUS-12 CROSSWALK (CURRENT)

**Tool:** Tool 041 - Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` - NOT ACCEPTED - NOT CLOSED

**Implementation state:** the closure-layer CORE-5 and GENIUS-12 content is **not implemented** in the current
shared shell. The shared `R6ToolShell` renders SPEC §5.2 C1-C12, not the closure-layer GENIUS-12. This
crosswalk is a planning artifact; it is not evidence of completion.

---

## 1. CORE-5 to GENIUS-12 map

| CORE-5 box | Meaning | GENIUS box(es) | Current ledger rows | State |
|---|---|---|---|---|
| C1 Primary Result | value, unit, range, confidence | Box 2 Primary Result | `CORE-01` PARTIAL/E3; `G12-03` PARTIAL/E3; `STATE-09` PARTIAL/E2 | Not closed |
| C2 How Calculated | formula, actual inputs, assumptions, uncertainty | Box 3 Formula | `CORE-02` NOT_AVAILABLE/E3; `G12-04` NOT_AVAILABLE/E3 | Not implemented |
| C3 Safety and Warnings | warnings, red flags, contraindications, referral | Box 7 Warnings/Safety | `CORE-03` PARTIAL/E3; `G12-08` PARTIAL/E3 | Partial |
| C4 Evidence and Sources | name, publisher, date, evidence level, link | Box 9 Evidence/Sources | `CORE-04` NOT_AVAILABLE/E3; `G12-10` NOT_AVAILABLE/E3 | Not implemented |
| C5 Next Actions | one next step, what not to do, when to see a doctor | Box 12 Feedback/Next Actions | `CORE-05` NOT_AVAILABLE/E3; `G12-13` NOT_AVAILABLE/E3 | Not implemented |

## 2. GENIUS-12 inventory

| # | Box | Required relationship | Current ledger rows | State |
|---|---|---|---|---|
| 1 | KPI Strip | summarises the primary result | `G12-02` | NOT_AVAILABLE/E2 |
| 2 | Primary Result | equals CORE-5 C1 | `G12-03` | PARTIAL/E3 |
| 3 | Formula / How Calculated | equals CORE-5 C2 | `G12-04` | NOT_AVAILABLE/E3 |
| 4 | Inputs Summary | lists what the user actually entered | `G12-05` | PARTIAL/E3 |
| 5 | What-If | supports alternative scenarios | `G12-06` | NOT_AVAILABLE/E3 |
| 6 | Sensitivity | shows the most influential input | `G12-07` | NOT_AVAILABLE/E3 |
| 7 | Warnings / Safety | equals CORE-5 C3 | `G12-08` | PARTIAL/E3 |
| 8 | Cross-Tool Links | carries freshness | `G12-09` | NOT_AVAILABLE/E3 |
| 9 | Evidence / Sources | equals CORE-5 C4 | `G12-10` | NOT_AVAILABLE/E3 |
| 10 | Export | PDF/ICS/CSV without secrets | `G12-11` | NOT_AVAILABLE/E3 |
| 11 | History | prior results with freshness | `G12-12` | BLOCKED/E2 |
| 12 | Feedback / Next Actions | CORE-5 C5 plus a 1-5 rating | `G12-13` | NOT_AVAILABLE/E3 |

Ordering row: `G12-01` is PARTIAL/E4 (the twelve boxes are not rendered in the fixed closure order).

## 3. Current shell fact

The shared `R6ToolShell` renders SPEC §5.2 C1-C12. It does **not** render the closure-layer GENIUS-12. The
following CORE-5 boxes are absent or partial in the current render:

- C2 absent;
- C4 absent;
- C5 absent;
- C1 partial (range and confidence missing);
- C3 partial (translated warnings, red flags and referral missing).

This is why `CORE-01`..`CORE-05`, `CORE-06`, `CORE-07`, `CORE-08` and `G12-01`..`G12-13` are not complete.

## 4. What a closure would require

1. An owner decision on whether the full closure layer governs Tool 041 (OD-04).
2. Replacement of the tool's slot content with CORE-5 plus the twelve GENIUS boxes, without changing engine
   calculation.
3. Medical review for C3/C4/C5 wording and sources (OD-05).
4. AR/EN coverage for every new label (group D).
5. Keyboard/screen-reader coverage (group E).
6. A published harness re-run only after an authorized deployment (OD-07).

## 5. What this crosswalk does not do

- It does not modify the shared shell.
- It does not claim any box is complete.
- It does not change the completion percentage.
- It does not accept or close Tool 041.

**Current status:** `OWNER_REVIEW` - NOT ACCEPTED - NOT CLOSED.
