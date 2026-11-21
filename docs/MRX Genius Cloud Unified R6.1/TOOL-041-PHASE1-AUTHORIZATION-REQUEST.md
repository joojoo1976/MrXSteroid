# TOOL 041 — PHASE 1 CODE AUTHORIZATION REQUEST

**Tool:** Tool 041 — Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` — **NOT ACCEPTED** — **NOT CLOSED**

**Request date:** 2026-11-14

**Requested phase:** **Phase 1 only** — CORE-5 / GENIUS-12 content (remediation group A)

**State:** **AWAITING OWNER AUTHORIZATION — NO CODE HAS BEEN WRITTEN AND NONE WILL BE UNTIL THIS REQUEST IS
APPROVED.**

---

## 1. What is being requested

Explicit authorization to implement the **group A** content layer described in
`TOOL-041-PHASE1-CORE5-GENIUS12-CONTENT-SPEC.md`:

- build the Tool 041-owned CORE-5 and GENIUS-12 presentation layer;
- make the tool render its own twelve boxes instead of the generic SPEC §5.2 boxes;
- remove the invented component defaults so EMPTY is reachable;
- add structural AR/EN keys with clinical values held `PENDING_MEDICAL_REVIEW`;
- add the Phase 1 acceptance tests.

This is a **presentation and information-architecture** change. It does **not** change the calculation.

### 1.1 The 22 requirements in scope


**Group A — CORE-5 / GENIUS-12 content and information architecture (22 requirements).** State mix:
`PARTIAL` 9 · `NOT_AVAILABLE` 11 · `FAIL` 1 · `BLOCKED` 1.

| req_id | B | E | Requirement | Gap next action |
|---|---|---|---|---|
| `CORE-01` | PARTIAL | E3 | CORE-5 C1 Primary Result shows value, unit, range and confidence | Add range and confidence to the primary panel or to a dedicated CORE-5 box |
| `CORE-02` | NOT_AVAILABLE | E3 | CORE-5 C2 How Calculated shows formula, actual inputs, assumptions an… | Build a formula box fed from the engine constants and the provenance uncertainty |
| `CORE-03` | PARTIAL | E3 | CORE-5 C3 Safety and Warnings shows warnings, red flags, contraindica… | Add translated warnings, red flags and a referral sentence with a source |
| `CORE-04` | NOT_AVAILABLE | E3 | CORE-5 C4 Evidence and Sources lists name, publisher, date, evidence … | Obtain specialist-approved sources and encode them in a structured evidence list |
| `CORE-05` | NOT_AVAILABLE | E3 | CORE-5 C5 Next Actions gives one next step, what not to do and when t… | Add a C5 next-actions block with a medically reviewed escalation rule |
| `CORE-06` | FAIL | E3 | Compact mode shows exactly the closure-layer CORE-5 and full mode emb… | Replace the SPEC C1-C12 slot content with the closure CORE-5 plus seven enrichm… |
| `CORE-07` | PARTIAL | E3 | CORE-5 content is bilingual AR/EN | Translate band and warning codes through the i18n file |
| `CORE-08` | PARTIAL | E3 | CORE-5 is keyboard reachable and screen-reader accessible | Add live regions and landmark/heading structure, then re-run the accessibility … |
| `G12-01` | PARTIAL | E4 | GENIUS-12 renders twelve boxes in the fixed closure-layer order | Decide which twelve boxes govern Tool 041 and rebuild the slot content; documen… |
| `G12-02` | NOT_AVAILABLE | E2 | GENIUS-12 box 1 KPI Strip summarises the primary result | Implement the KPI strip or record an owner-approved exception |
| `G12-03` | PARTIAL | E3 | GENIUS-12 box 2 Primary Result equals CORE-5 C1 | Fold the primary panel into box 2 and complete C1 content |
| `G12-04` | NOT_AVAILABLE | E3 | GENIUS-12 box 3 Formula / How Calculated equals CORE-5 C2 | Implement the formula box from the engine constants |
| `G12-05` | PARTIAL | E3 | GENIUS-12 box 4 Inputs Summary lists what the user actually entered | Add an inputs summary box and remove invented defaults |
| `G12-06` | NOT_AVAILABLE | E3 | GENIUS-12 box 5 What-If supports alternative scenarios | Implement scenario comparison or record a justified Not Applicable with reason |
| `G12-07` | NOT_AVAILABLE | E3 | GENIUS-12 box 6 Sensitivity shows which input affects the result most | Implement a sensitivity analysis or record a justified Not Applicable with reas… |
| `G12-08` | PARTIAL | E3 | GENIUS-12 box 7 Warnings / Safety equals CORE-5 C3 | Complete C3 content and translate the codes |
| `G12-09` | NOT_AVAILABLE | E3 | GENIUS-12 box 8 Cross-Tool Links carry freshness | Implement the cross-tool contract or record Not Applicable with reason |
| `G12-10` | NOT_AVAILABLE | E3 | GENIUS-12 box 9 Evidence / Sources equals CORE-5 C4 | Add specialist-reviewed sources and render them |
| `G12-11` | NOT_AVAILABLE | E3 | GENIUS-12 box 10 Export produces PDF, ICS or CSV without secrets | Implement a client-side export or record Not Applicable with reason |
| `G12-12` | BLOCKED | E2 | GENIUS-12 box 11 History shows prior results with freshness | Owner decision on W18 and on a Tool 041 storage exception, then implement |
| `G12-13` | NOT_AVAILABLE | E3 | GENIUS-12 box 12 Feedback and Next Actions equals CORE-5 C5 plus a 1-… | Implement feedback plus C5 next actions |
| `STATE-09` | PARTIAL | E2 | The result panel shows the unit, the reference range and the confiden… | Render the band range and an explicit confidence or not-assessed label |

### 1.2 What Phase 1 will deliberately leave open

| Row | Why it stays open after Phase 1 | Revisit |
|---|---|---|
| `CORE-03`, `CORE-04`, `CORE-05`, `G12-08`, `G12-10`, `G12-13` | clinical wording and sources need Phase 3 sign-off | Phase 3 |
| `CORE-07` | clinical terms cannot be translated before Phase 3 | Phase 3 + Phase 4 |
| `CORE-08` | keyboard/screen-reader verification belongs to Phase 5 | Phase 5 |
| `G12-12` | History is blocked on the W18/storage decision | separate W18 authorization |
| `STATE-09` | closes with C1 only if the confidence/range labels are accepted | Phase 1 review |

Phase 1 may reduce these rows to `PARTIAL` with new evidence, but it must not mark them `PASS` unless the
acceptance test actually passes and the wording is approved.

---

## 2. Exact files and changes

### 2.1 New files

| File | Purpose | Approx. size |
|---|---|---|
| `components/tools/tool-041-hematocrit-monitor.genius.tsx` | twelve boxes, CORE-5 renderers, compact mode, `data-r6-core` hooks | ~450 lines |
| `lib/tools/r6/tool-041-hematocrit-monitor-content.ts` | read-only formula metadata, band mapping, evidence and next-action slot definitions, localized-code maps | ~180 lines |
| `tests/unit/tool-041-hematocrit-monitor-genius.test.tsx` | the acceptance tests in section 4 | ~300 lines |

### 2.2 Modified files

| File | Minimal change | Risk |
|---|---|---|
| `components/tools/tool-041-hematocrit-monitor.tsx` | render `<Tool041Genius … />`; start from blank readings (remove `45`/`48`, male, `on_cycle: true`, `weeks_remaining: 8` defaults); keep the pipeline call unchanged | medium — state behavior changes |
| `i18n/tool-041-hematocrit-monitor.json` | add structural AR/EN keys; existing 15 keys unchanged | low |
| `lib/tools/r6/manifest.ts` | add `tool-041-hematocrit-monitor` to `R6_EXEMPT_SLUGS` **only if** OD-16 is approved | low, but affects the shared shell contract |

### 2.3 Files that must NOT change in Phase 1

- `lib/tools/engines/tool-041-hematocrit-monitor.ts` — **math, thresholds, `Date` usage and eligibility rule are
  frozen.** (If OD-12 is approved, the only permitted change is adding an exported read-only constants object; no
  expression inside `monitorHematocrit` may change.)
- `lib/tools/schemas/tool-041-hematocrit-monitor.ts` — Phase 2 owns schema enforcement.
- `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts` — Phase 2 owns result validation.
- `components/tools/r6/R6ToolShell.tsx` — no shared-shell logic change.
- any database, Supabase, RLS, W18, session, storage or cloud-sync file.

---

## 3. Implementation rules for Phase 1

1. **No invented values.** Empty state shows empty inputs and prompts, never `45`/`48` or default sex/cycle/weeks.
2. **No invented clinical content.** C4 shows `NOT_AVAILABLE — no approved source`; C3/C5 clinical sentences carry
   `PENDING_MEDICAL_REVIEW` or stay `NOT_AVAILABLE` per OD-14.
3. **Single calculation source.** Every box reads the result of `runHematocritMonitor`; no component computes
   hematocrit, slope, band or projection independently.
4. **Fixed order.** The twelve boxes always render in the order 1–12; none is hidden.
5. **Honest NOT_AVAILABLE.** Box 11 and any unapproved box renders `NOT_AVAILABLE` with a specific reason.
6. **No storage or network.** No `localStorage`, `sessionStorage`, `indexedDB`, Supabase, fetch or session call.
7. **No raw codes in the DOM.** Band and warning codes are mapped to localized keys before render.
8. **Engine untouched** unless OD-12 explicitly authorizes the constants export.

---

## 4. Test plan and commands

### 4.1 New tests (Phase 1)

- C1 renders value, unit, band, range-or-display-bounds, confidence `not assessed`.
- C2 renders formula and actual inputs; asserts no invented defaults.
- C3 renders one message per warning code plus red-flag and referral slots.
- C4 renders `NOT_AVAILABLE` with reason while no source exists.
- C5 renders next step / do-not / seek-care slots.
- twelve boxes in fixed order; compact mode = boxes 2, 3, 7, 9, 12.
- box 2 === C1, box 3 === C2, box 7 === C3, box 9 === C4, box 12 === C5.
- KPI strip equals the primary result.
- inputs summary lists only entered values.
- what-if re-runs the same pipeline; sensitivity is truthful.
- export CSV contains no secrets.
- history shows `blocked_w18_storage_decision`.
- no storage/network call in the new code.
- AR/EN structural key parity; no raw codes in the DOM.

### 4.2 Commands to run and capture

```text
npx vitest run tests/unit/tool-041-hematocrit-monitor-genius.test.tsx ^
  lib/tools/engines/tool-041-hematocrit-monitor.test.ts ^
  lib/tools/r6/tool-041-hematocrit-monitor-pipeline.test.ts ^
  tests/unit/tool-041-acceptance-evidence.test.ts ^
  tests/unit/tool-041-acceptance-evidence-ledger.test.ts ^
  components/tools/tool-041-060-header-preferences.test.tsx

npx tsc --noEmit
npx eslint components/tools/tool-041-hematocrit-monitor.tsx ^
  components/tools/tool-041-hematocrit-monitor.genius.tsx ^
  lib/tools/r6/tool-041-hematocrit-monitor-content.ts ^
  lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts ^
  lib/tools/schemas/tool-041-hematocrit-monitor.ts ^
  lib/tools/engines/tool-041-hematocrit-monitor.ts
```

### 4.3 Evidence to capture

- `evidence/tool041-verification-phase1/tool041-phase1-tests.log`
- `evidence/tool041-verification-phase1/tool041-phase1-tsc.log`
- `evidence/tool041-verification-phase1/tool041-phase1-eslint.log`
- `evidence/tool041-verification-phase1/source-fingerprints-phase1.json`
- a before/after render note for EMPTY, PARTIAL, FULL and DEGRADED (DOM-level, no deployment required)

**No browser/Preview claim** will be made in Phase 1. Preview evidence requires a separate deployment authorization.

---

## 5. Rollback

Phase 1 is additive and reversible:

1. delete the three new files;
2. revert the three modified files to their pre-Phase-1 content (fingerprints recorded before the change);
3. re-run the current 34-test battery and `tsc`;
4. confirm the ledger is untouched (`76 / 132 = 57.58%`).

No database, migration or deployment rollback is needed because Phase 1 touches none.

---

## 6. Explicit exclusions

This authorization does **not** permit:

- any change to engine math, thresholds, bands, projection, donation rule or `Date` usage (beyond OD-12's
  read-only export, if approved);
- any change to schema semantics or the output envelope (Phase 2);
- any clinical citation, referral text or recommendation without Phase 3 approval;
- any database, Supabase, RLS, W18, session, storage or cloud-sync work;
- `git commit`, `git push`, merge, rebase, deploy or redeploy;
- a new Preview or any production action;
- starting Tool 042;
- marking Tool 041 accepted or closed.

---

## 7. Authorization decision

Please answer each item explicitly:

| # | Decision | Options |
|---|---|---|
| 1 | Authorize Phase 1 code implementation? | `YES` / `NO` / `HOLD` |
| 2 | Closure target for group A | full CORE-5 + GENIUS-12 as specified / other |
| 3 | `OD-12` formula constants | engine read-only export / content module + sync test |
| 4 | `OD-13` C4 evidence | `NOT_AVAILABLE` until Phase 3 / name reviewer now |
| 5 | `OD-14` C3/C5 placeholder | visible `PENDING_MEDICAL_REVIEW` / hold at `NOT_AVAILABLE` |
| 6 | `OD-15` box 12 rating | session-only "not saved" / `NOT_AVAILABLE` until W18 |
| 7 | `OD-16` tool-owned boxes | add to `R6_EXEMPT_SLUGS` / keep shared shell |
| 8 | Confirm Tool 042 remains stopped | `YES` |

A single approval line is enough if all defaults are accepted:

> **"Authorize Phase 1 (group A) with defaults OD-12=B, OD-13=A, OD-14=B, OD-15=A, OD-16=A. No commit, push, deploy,
> DB, RLS, Supabase, W18, or Tool 042. Tool 041 remains OWNER_REVIEW."**

Until that line is received: **no code change, no engine change, no schema change, no deployment.**

**Status remains:** `OWNER_REVIEW` — NOT ACCEPTED — NOT CLOSED.
