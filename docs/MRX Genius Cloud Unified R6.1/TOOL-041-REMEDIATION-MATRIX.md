# TOOL 041 — REMEDIATION MATRIX A–F (EXACT `req_id` LISTS)

**Tool:** Tool 041 — Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` — **NOT ACCEPTED** — **NOT CLOSED**

**Artifact date:** 2026-11-14

**Companion CSV:** `tool-041-remediation-matrix.csv` (56 rows, one per incomplete requirement)

**Execution state:** **NOTHING BELOW IS IMPLEMENTED OR AUTHORIZED.** This is a planning and de-duplication
artifact. Every code change still requires the separate Phase authorization named at the end of this document.

---

## 0. The unique incomplete count

The current ledger has **138 rows**:

| State | Rows |
|---|---:|
| `APPLICABLE` | 132 |
| `NOT_APPLICABLE` | 6 |
| `PASS` (applicable) | 76 |
| **Incomplete (applicable, not PASS)** | **56** |
| Declared arithmetic | `76 / 132 = 57.58%` |

The 56 incomplete rows break down as `PARTIAL` 32 · `FAIL` 9 · `NOT_AVAILABLE` 12 · `BLOCKED` 2 · `NOT_RUN` 1.

**The six remediation groups partition those 56 rows exactly once.** Each requirement has one **primary** group
that owns its closure; cross-references are secondary work, not a second row.

---

## 1. Exact `req_id` list per group

| Group | Count | req_id list |
|---|---:|---|
| **A** | 22 | `CORE-01`, `CORE-02`, `CORE-03`, `CORE-04`, `CORE-05`, `CORE-06`, `CORE-07`, `CORE-08`, `G12-01`, `G12-02`, `G12-03`, `G12-04`, `G12-05`, `G12-06`, `G12-07`, `G12-08`, `G12-09`, `G12-10`, `G12-11`, `G12-12`, `G12-13`, `STATE-09` |
| **B** | 7 | `SCH-02`, `SCH-04`, `SCH-07`, `SCH-08`, `SCH-09`, `PIPE-09`, `PIPE-12` |
| **C** | 6 | `PIPE-07`, `MED-02`, `MED-03`, `MED-04`, `MED-06`, `MED-07` |
| **D** | 6 | `SCH-10`, `STATE-07`, `I18N-02`, `I18N-03`, `I18N-04`, `I18N-05` |
| **E** | 9 | `STATE-01`, `STATE-02`, `STATE-05`, `STATE-06`, `STATE-10`, `A11Y-06`, `A11Y-07`, `A11Y-08`, `RESP-05` |
| **F** | 6 | `ENG-02`, `ENG-04`, `ENG-10`, `ENG-11`, `ENG-14`, `ENG-16` |

**Arithmetic proof of the unique count:**

- A `22` + B `7` + C `6` + D `6` + E `9` + F `6` = **56** assignments;
- distinct `req_id` values = **56**;
- duplicate assignments = **0**;
- the 56 assigned ids equal the 56 applicable non-`PASS` ledger rows exactly (no missing row, no extra row).

---

## 2. Group E and the overlap question

Group E contains **9** rows. The earlier planning table showed a tenth line, `CORE-08`, marked "also group A".
That line is a **cross-reference, not a tenth E row**. `CORE-08` is owned and counted once in group A.

The owner asked specifically to clarify the E overlap. The full overlap map is:

| req_id | Primary group | Also required by | Why the overlap exists |
|---|---|---|---|
| `CORE-03` | A | D | C3 safety warnings need translated clinical wording (group D). |
| `CORE-04` | A | C | C4 evidence list needs specialist-approved sources (group C). |
| `CORE-05` | A | C | C5 next actions need reviewed referral wording (group C). |
| `CORE-07` | A | D | CORE-5 must be bilingual (group D). |
| `CORE-08` | A | E | CORE-5 accessibility is also an accessibility requirement (group E). |
| `G12-08` | A | D | Box 7 warning text needs translated clinical wording (group D). |
| `G12-10` | A | C | Box 9 evidence list needs specialist-approved sources (group C). |
| `G12-13` | A | C | Box 12 next actions need reviewed referral wording (group C). |
| `SCH-02` | B | F | The 2..24 boundary is both a schema and an engine boundary test. |
| `SCH-04` | B | F | ISO date handling is both a schema and an engine boundary test. |
| `SCH-07` | B | F | The 0..52 week boundary is both a schema and an engine boundary test. |
| `STATE-07` | D | E | Field-specific validation errors must also be localized (group D). |

Reading of the E overlaps:

- `CORE-08` is counted in **A** (CORE-5 accessibility). Group E must verify the keyboard/screen-reader behavior
  but does not add a second incomplete row.
- `STATE-07` is counted in **D** (localized validation errors). Group E's DEGRADED/error live-region work depends on
  the same messages but does not add a second row.

No other requirement is shared between two groups. `SCH-02`, `SCH-04`, `SCH-07` are counted in **B**; group F
reuses their boundary tests but does not add rows.

---

## 3. Group detail


### Group A — CORE-5 / GENIUS-12 content and information architecture (22 requirements)

State mix: `PARTIAL` 9 · `NOT_AVAILABLE` 11 · `FAIL` 1 · `BLOCKED` 1

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

### Group B — Output contract / Zod schema enforcement (7 requirements)

State mix: `PARTIAL` 5 · `FAIL` 2

| req_id | B | E | Requirement | Gap next action |
|---|---|---|---|---|
| `SCH-02` | PARTIAL | E2 | Readings array is constrained to 2 through 24 entries | Add a schema test that accepts 24 readings and rejects 25 |
| `SCH-04` | PARTIAL | E2 | Each reading date is a parseable ISO-8601 string | Add a schema test for malformed and empty dates |
| `SCH-07` | PARTIAL | E2 | weeks_remaining is an integer within 0..52 | Add schema boundary tests for -1, 0, 52, 53 and 1.5 |
| `SCH-08` | FAIL | E3 | The engine result is validated against HematocritResultSchema before … | Smallest fix: call HematocritResultSchema.safeParse(engineResult) and return ok… |
| `SCH-09` | PARTIAL | E2 | HematocritOutputSchema exists for the structured envelope | Either enforce HematocritOutputSchema in the pipeline or document isToolOutput … |
| `PIPE-09` | PARTIAL | E2 | seoLinks are built from the registry entry | Add an assertion on the seoLinks payload or remove it if unused |
| `PIPE-12` | FAIL | E3 | Engine output is parsed by HematocritResultSchema before the envelope… | Same smallest fix as SCH-08: safeParse the result and fail closed; separate cod… |

### Group C — Medical sources and clinical semantics (6 requirements)

State mix: `PARTIAL` 4 · `FAIL` 1 · `BLOCKED` 1

| req_id | B | E | Requirement | Gap next action |
|---|---|---|---|---|
| `PIPE-07` | PARTIAL | E3 | Provenance referenceRange carries the clinical hematocrit reference b… | Populate the sex-specific band and a citation, or label the field as display bo… |
| `MED-02` | PARTIAL | E3 | The tool provides an explicit medical escalation and referral path | Add a reviewed referral block with urgency and contact guidance |
| `MED-03` | PARTIAL | E3 | The tool states its interpretation limits and that it is not a diagno… | Add tool-specific interpretation limits reviewed by a specialist |
| `MED-04` | FAIL | E2 | Every reference band and the intervention line carries a named source | Obtain specialist-approved citations for 50/54 male and 44.5/48 female; do not … |
| `MED-06` | PARTIAL | E3 | The displayed or exported reference range matches the clinical band | Display the sex-specific band with a source, or label it explicitly as display … |
| `MED-07` | BLOCKED | E2 | donate_eligible is clinically valid and correctly labelled | Specialist medical review; do not change the rule or label without separate aut… |

### Group D — Arabic / English localization (6 requirements)

State mix: `PARTIAL` 3 · `FAIL` 3

| req_id | B | E | Requirement | Gap next action |
|---|---|---|---|---|
| `SCH-10` | PARTIAL | E1 | Schema errors are bilingual AR/EN | Add an error-map or localized message layer, and a test that an Arabic locale r… |
| `STATE-07` | PARTIAL | E2 | Validation errors are actionable and localized | Map issues to field-specific AR/EN messages and add a test |
| `I18N-02` | FAIL | E3 | Band values are translated in the result panel | Add AR/EN band labels and map the value before render |
| `I18N-03` | FAIL | E3 | Warning codes are translated in the result panel | Add AR/EN warning messages and map codes before render |
| `I18N-04` | FAIL | E2 | Validation and error text is available in Arabic | Localize validation messages and add an Arabic render test |
| `I18N-05` | PARTIAL | E3 | No mixed-language labels appear in either locale | Route every displayed string through the dictionary |

### Group E — EMPTY / DEGRADED states and accessibility (9 requirements)

State mix: `FAIL` 2 · `PARTIAL` 5 · `NOT_AVAILABLE` 1 · `NOT_RUN` 1

| req_id | B | E | Requirement | Gap next action |
|---|---|---|---|---|
| `STATE-01` | FAIL | E3 | EMPTY is an explicit, reachable state | Start with blank readings and no invented defaults; requires code authorization… |
| `STATE-02` | PARTIAL | E3 | PARTIAL is an explicit state when only some required fields are prese… | Make fields genuinely optional or remove the claim; add a test that partial ren… |
| `STATE-05` | NOT_AVAILABLE | E3 | DEGRADED is an explicit state | Add a DEGRADED branch with a defined trigger and a test, or record an owner-app… |
| `STATE-06` | PARTIAL | E3 | Missing inputs are never invented | Start blank and require explicit entry; code authorization required |
| `STATE-10` | FAIL | E2 | Result and error regions are announced through aria-live | Add polite live region for results and assertive for errors, then test |
| `A11Y-06` | PARTIAL | E2 | Touch targets are large enough at 390 px | Measure and, if needed, enlarge interactive targets to at least 44 px |
| `A11Y-07` | PARTIAL | E2 | Every input has a programmatic label | Add indexed accessible names for repeated reading rows |
| `A11Y-08` | PARTIAL | E2 | Focus indication is visible on all interactive elements | Add focus-visible ring classes and verify with the harness |
| `RESP-05` | NOT_RUN | E0 | Arabic RTL at 390 px renders without horizontal overflow | Add an Arabic 390 px pass to the harness and capture a screenshot |

### Group F — Engine / schema boundary and regression tests (6 requirements)

State mix: `PARTIAL` 6

| req_id | B | E | Requirement | Gap next action |
|---|---|---|---|---|
| `ENG-02` | PARTIAL | E3 | Engine is free of the Date constructor and of ambient time | Replace Date usage with an injected clock or pure ISO arithmetic, then re-run e… |
| `ENG-04` | PARTIAL | E2 | Readings are sorted by draw date regardless of input order | Add an engine test with reversed and shuffled readings asserting the same result |
| `ENG-10` | PARTIAL | E2 | Projection is suppressed beyond the 180-day horizon | Add a shallow-slope test asserting projected_threshold_date is null beyond 180 … |
| `ENG-11` | PARTIAL | E3 | Projection is suppressed when the trend is flat or the latest value i… | Assert null explicitly in the already-above case |
| `ENG-14` | PARTIAL | E2 | Warning rising_trend_30d is emitted when slope exceeds 1.5 | Add an engine test asserting rising_trend_30d for a steep series |
| `ENG-16` | PARTIAL | E2 | An empty or wholly unparseable reading set fails safely with no_valid… | Add a direct engine test with an empty array and with invalid dates |

---

## 4. Full requirement table (56 rows)

| req_id | Requirement | B | E | Primary | Cross-ref | Evidence class | Binding |
|---|---|---|---|---|---|---|---|
| `CORE-01` | CORE-5 C1 Primary Result shows value, unit, range and confidence | PARTIAL | E3 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `CORE-02` | CORE-5 C2 How Calculated shows formula, actual inputs, assumptions and uncertai… | NOT_AVAILABLE | E3 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `CORE-03` | CORE-5 C3 Safety and Warnings shows warnings, red flags, contraindications and … | PARTIAL | E3 | A | D | WT_LOCAL_HARNESS | DRIFT |
| `CORE-04` | CORE-5 C4 Evidence and Sources lists name, publisher, date, evidence level and … | NOT_AVAILABLE | E3 | A | C | WT_LOCAL_HARNESS | HEAD_TRACKED_MATCH |
| `CORE-05` | CORE-5 C5 Next Actions gives one next step, what not to do and when to see a do… | NOT_AVAILABLE | E3 | A | C | WT_LOCAL_HARNESS | DRIFT |
| `CORE-06` | Compact mode shows exactly the closure-layer CORE-5 and full mode embeds the sa… | FAIL | E3 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `CORE-07` | CORE-5 content is bilingual AR/EN | PARTIAL | E3 | A | D | WT_VERIFICATION_LOG | DRIFT |
| `CORE-08` | CORE-5 is keyboard reachable and screen-reader accessible | PARTIAL | E3 | A | E | PREVIEW_PUBLISHED | DRIFT |
| `G12-01` | GENIUS-12 renders twelve boxes in the fixed closure-layer order | PARTIAL | E4 | A | — | PREVIEW_PUBLISHED | DRIFT |
| `G12-02` | GENIUS-12 box 1 KPI Strip summarises the primary result | NOT_AVAILABLE | E2 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `G12-03` | GENIUS-12 box 2 Primary Result equals CORE-5 C1 | PARTIAL | E3 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `G12-04` | GENIUS-12 box 3 Formula / How Calculated equals CORE-5 C2 | NOT_AVAILABLE | E3 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `G12-05` | GENIUS-12 box 4 Inputs Summary lists what the user actually entered | PARTIAL | E3 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `G12-06` | GENIUS-12 box 5 What-If supports alternative scenarios | NOT_AVAILABLE | E3 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `G12-07` | GENIUS-12 box 6 Sensitivity shows which input affects the result most | NOT_AVAILABLE | E3 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `G12-08` | GENIUS-12 box 7 Warnings / Safety equals CORE-5 C3 | PARTIAL | E3 | A | D | WT_LOCAL_HARNESS | DRIFT |
| `G12-09` | GENIUS-12 box 8 Cross-Tool Links carry freshness | NOT_AVAILABLE | E3 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `G12-10` | GENIUS-12 box 9 Evidence / Sources equals CORE-5 C4 | NOT_AVAILABLE | E3 | A | C | WT_LOCAL_HARNESS | HEAD_TRACKED_MATCH |
| `G12-11` | GENIUS-12 box 10 Export produces PDF, ICS or CSV without secrets | NOT_AVAILABLE | E3 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `G12-12` | GENIUS-12 box 11 History shows prior results with freshness | BLOCKED | E2 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `G12-13` | GENIUS-12 box 12 Feedback and Next Actions equals CORE-5 C5 plus a 1-5 rating | NOT_AVAILABLE | E3 | A | C | WT_LOCAL_HARNESS | DRIFT |
| `STATE-09` | The result panel shows the unit, the reference range and the confidence level | PARTIAL | E2 | A | — | WT_LOCAL_HARNESS | DRIFT |
| `SCH-02` | Readings array is constrained to 2 through 24 entries | PARTIAL | E2 | B | F | WT_VERIFICATION_LOG | DRIFT |
| `SCH-04` | Each reading date is a parseable ISO-8601 string | PARTIAL | E2 | B | F | WT_LOCAL_HARNESS | DRIFT |
| `SCH-07` | weeks_remaining is an integer within 0..52 | PARTIAL | E2 | B | F | WT_LOCAL_HARNESS | DRIFT |
| `SCH-08` | The engine result is validated against HematocritResultSchema before it enters … | FAIL | E3 | B | — | WT_VERIFICATION_LOG | DRIFT_LOCAL_UNTRACKED |
| `SCH-09` | HematocritOutputSchema exists for the structured envelope | PARTIAL | E2 | B | — | WT_LOCAL_HARNESS | DRIFT |
| `PIPE-09` | seoLinks are built from the registry entry | PARTIAL | E2 | B | — | WT_LOCAL_HARNESS | DRIFT_LOCAL_UNTRACKED |
| `PIPE-12` | Engine output is parsed by HematocritResultSchema before the envelope is built | FAIL | E3 | B | — | WT_VERIFICATION_LOG | DRIFT_LOCAL_UNTRACKED |
| `PIPE-07` | Provenance referenceRange carries the clinical hematocrit reference band | PARTIAL | E3 | C | — | WT_LOCAL_HARNESS | DRIFT_LOCAL_UNTRACKED |
| `MED-02` | The tool provides an explicit medical escalation and referral path | PARTIAL | E3 | C | — | WT_LOCAL_HARNESS | DRIFT |
| `MED-03` | The tool states its interpretation limits and that it is not a diagnosis | PARTIAL | E3 | C | — | WT_LOCAL_HARNESS | DRIFT |
| `MED-04` | Every reference band and the intervention line carries a named source | FAIL | E2 | C | — | WT_LOCAL_HARNESS | HEAD_TRACKED_MATCH |
| `MED-06` | The displayed or exported reference range matches the clinical band | PARTIAL | E3 | C | — | WT_LOCAL_HARNESS | DRIFT_LOCAL_UNTRACKED |
| `MED-07` | donate_eligible is clinically valid and correctly labelled | BLOCKED | E2 | C | — | WT_LOCAL_HARNESS | HEAD_TRACKED_MATCH |
| `SCH-10` | Schema errors are bilingual AR/EN | PARTIAL | E1 | D | — | WT_LOCAL_HARNESS | DRIFT |
| `STATE-07` | Validation errors are actionable and localized | PARTIAL | E2 | D | E | WT_LOCAL_HARNESS | DRIFT |
| `I18N-02` | Band values are translated in the result panel | FAIL | E3 | D | — | WT_VERIFICATION_LOG | DRIFT |
| `I18N-03` | Warning codes are translated in the result panel | FAIL | E3 | D | — | WT_VERIFICATION_LOG | DRIFT |
| `I18N-04` | Validation and error text is available in Arabic | FAIL | E2 | D | — | WT_LOCAL_HARNESS | DRIFT |
| `I18N-05` | No mixed-language labels appear in either locale | PARTIAL | E3 | D | — | WT_LOCAL_HARNESS | DRIFT |
| `STATE-01` | EMPTY is an explicit, reachable state | FAIL | E3 | E | — | WT_LOCAL_HARNESS | DRIFT |
| `STATE-02` | PARTIAL is an explicit state when only some required fields are present | PARTIAL | E3 | E | — | WT_LOCAL_HARNESS | DRIFT |
| `STATE-05` | DEGRADED is an explicit state | NOT_AVAILABLE | E3 | E | — | WT_LOCAL_HARNESS | DRIFT |
| `STATE-06` | Missing inputs are never invented | PARTIAL | E3 | E | — | WT_LOCAL_HARNESS | DRIFT |
| `STATE-10` | Result and error regions are announced through aria-live | FAIL | E2 | E | — | WT_LOCAL_HARNESS | DRIFT |
| `A11Y-06` | Touch targets are large enough at 390 px | PARTIAL | E2 | E | — | PREVIEW_PUBLISHED | DRIFT |
| `A11Y-07` | Every input has a programmatic label | PARTIAL | E2 | E | — | WT_LOCAL_HARNESS | DRIFT |
| `A11Y-08` | Focus indication is visible on all interactive elements | PARTIAL | E2 | E | — | WT_LOCAL_HARNESS | DRIFT |
| `RESP-05` | Arabic RTL at 390 px renders without horizontal overflow | NOT_RUN | E0 | E | — | WT_LOCAL_HARNESS | DRIFT |
| `ENG-02` | Engine is free of the Date constructor and of ambient time | PARTIAL | E3 | F | — | WT_LOCAL_HARNESS | HEAD_TRACKED_MATCH |
| `ENG-04` | Readings are sorted by draw date regardless of input order | PARTIAL | E2 | F | — | WT_LOCAL_HARNESS | HEAD_TRACKED_MATCH |
| `ENG-10` | Projection is suppressed beyond the 180-day horizon | PARTIAL | E2 | F | — | WT_LOCAL_HARNESS | HEAD_TRACKED_MATCH |
| `ENG-11` | Projection is suppressed when the trend is flat or the latest value is already … | PARTIAL | E3 | F | — | WT_VERIFICATION_LOG | HEAD_TRACKED_MATCH |
| `ENG-14` | Warning rising_trend_30d is emitted when slope exceeds 1.5 | PARTIAL | E2 | F | — | WT_LOCAL_HARNESS | HEAD_TRACKED_MATCH |
| `ENG-16` | An empty or wholly unparseable reading set fails safely with no_valid_readings | PARTIAL | E2 | F | — | WT_LOCAL_HARNESS | HEAD_TRACKED_MATCH |

---

## 5. Owner execution order vs. dependency order

The owner's phase order is authoritative:

| Phase | Owner priority | Group | Why this position |
|---|---|---|---|
| 1 | CORE-5 and GENIUS-12 content | A | Defines what the tool must display before anything is styled or tested |
| 2 | Output contract and Zod enforcement | B | Guarantees the data the content layer will render |
| 3 | Medical sources, boundary and recommendation safety | C | Supplies the reviewed words and citations used by A (C3/C4/C5) and D |
| 4 | Arabic and English completeness | D | Needs stable medical wording from C |
| 5 | EMPTY / DEGRADED and accessibility | E | Depends on final layout from A and messages from D |
| 6 | Boundary and regression tests | F | Closes the loop after the behavior is final |

Dependency notes that do **not** change the owner's order:

- Phase 1 (A) cannot finalize C3/C4/C5 physical copy before Phase 3 (C) sign-off. Phase 1 therefore implements the
  **structure and data contract** for those boxes and marks clinical text `PENDING_MEDICAL_REVIEW`; it does not
  invent wording.
- Phase 4 (D) must not translate clinical terms before Phase 3 signs them.
- Phase 6 (F) test-only rows can be written earlier, but they are only *closed* after the behavior they assert is
  final.
- `G12-12` (History) is `BLOCKED` on the W18/storage decision and cannot close through UI work. It stays counted in
  A and stays blocked.

---

## 6. Per-group authorization state

| Group | Rows | Code authorized? | Owner decision needed | Medical review | Current state |
|---|---:|---|---|---|---|
| A | 22 | No | CORE-5/GENIUS-12 closure target | Yes for C3/C4/C5 | Not started |
| B | 7 | No | Envelope decision for `SCH-09` | No | Not started |
| C | 6 | No | Source set + `donate_eligible` wording | **Mandatory** | Not started |
| D | 6 | No | Arabic clinical terminology | Yes for clinical terms | Not started |
| E | 9 | No | DEGRADED exception (if any) | No | Not started |
| F | 6 | No | None for tests; `ENG-02` needs engine change | No | Not started |

---

## 7. What this matrix does not do

- It does not mark any row complete.
- It does not change the engine, schema, thresholds or eligibility rule.
- It does not merge groups or authorize their execution.
- It does not count a cross-reference as a second requirement.
- It does not alter `76 / 132 = 57.58%`.

**Status remains:** `OWNER_REVIEW` — NOT ACCEPTED — NOT CLOSED. Tool 042 remains stopped.
