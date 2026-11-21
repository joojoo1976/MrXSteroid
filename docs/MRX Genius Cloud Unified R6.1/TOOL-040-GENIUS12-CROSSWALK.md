# TOOL 040 — GENIUS-12 CROSSWALK (SPEC §5.2 ↔ CLOSURE-LAYER ↔ Tool 040)

**Why this file exists:** two box lists exist in the R6.1 sources — the twelve boxes of `SPEC.md §5.2` (the legacy, owner Add-On list, still implemented by the shared `components/tools/ResultBoxes.tsx`) and the GENIUS-12 list of `R6.1-CLOSURE-LAYER.md` (the operative R6.1 list: CORE-5 embedded + 7 enrichment boxes). Tool 040 renders the **closure-layer** list itself, so this crosswalk states, box by box, where every SPEC box and every legacy concept lives in Tool 040 — and what the honest state is when it is not there.

**Authoritative sources**
- SPEC boxes: `docs/MRX Genius Cloud Unified R6.1/SPEC.md` §5.2 and §5.3 legacy-five and §5.4 mandatory count / unavailable-state rule.
- Closure-layer list: `docs/MRX Genius Cloud Unified R6.1/R6.1-CLOSURE-LAYER.md` §GENIUS-12 and §CORE-5.
- Tool 040 implementation: `components/tools/tool-040-lipid-profile-optimizer.genius.tsx` (boxes `data-r6-box="1".."12"`), `lib/tools/r6/tool-040-lipid-profile-optimizer-contract.ts`.

**Rules applied (SPEC §5.4 + closure layer):** a box that cannot show content stays present with its status and reason; a blank card, hidden card or fabricated text does not pass. A box is never counted as complete because its name exists.

**The one difference from Tool 039, stated up front:** the owner decision D-08 (Option A — local, device-only storage) was granted for **Tool 039 only**. Tool 040 stores nothing, so its two storage-dependent boxes (11 History and the 12 rating) carry a **NOT_APPLICABLE / NOT_AVAILABLE** status with a real reason instead of a blocked one. That is a *scope* difference, not a quality difference: the boxes are still rendered, in place, with their reason.

---

## 1. Box-by-box crosswalk

| SPEC §5.2 box | CLOSURE-LAYER GENIUS-12 box | Tool 040 implementation | Actual content proven by | State |
|---|---|---|---|---|
| Box 1 — Medical Advice | 12 (Next actions, = C5) | Box 12 "Next actions": next step + what not to do + when to see a doctor; plus the referral list inside box 7 | test "C5 gives one next step, what not to do and when to see a doctor" | **Implemented** |
| Box 2 — General Advice | 3 (How calculated, = C2) + 4 (Inputs summary) | Box 3 (the band formula, the non-HDL formula, the assumptions, the uncertainty) and box 4 (the panel, the date and the context actually entered) | tests "C2 states the formula, the assumptions and the uncertainty" + the 12-box order test | **Implemented** |
| Box 3 — Current Feeling / Sensation (5 self-report sliders) | — (not a separate box in GENIUS-12) | The tool has **no self-report input**; its contract is a laboratory panel + a date + five context fields, none of them subjective. No self-report slider exists, and adding one is proposal P-08 (not implemented) | contract test "describes every user-facing field with the attributes SPEC-R6.1-2 requires" (10 fields, none subjective) | **NOT_APPLICABLE** — domain rationale: a lipid-panel tool has no self-report dimension; the five sliders are not applicable and are not fabricated. Recorded as an open proposal, not as a missing box |
| Box 4 — Predictions | 5 (What-if) | Box 5 computes arithmetic scenarios (LDL 100, HDL 60, TG 150 mg/dL) by re-running the same pipeline, explicitly labelled as a scenario rather than a prediction | test "computes the what-if scenarios and the sensitivity through the same pipeline" | **Implemented as a non-probabilistic scenario** — exactly the alternative SPEC §5.2 Box 4 allows ("show `NOT_AVAILABLE` or a non-probabilistic scenario clearly labeled as rule-based/statistical estimate"). No confidence number is ever shown |
| Box 5 — AI Coach | — | No coach, no profile, no model. The tool's contract is deterministic only; the capability contract states it | test "publishes the seven-part capability contract without claiming AI" | **NOT_APPLICABLE** — rationale: no consented profile fields exist in this tool's contract and no model is activated (R6.1-ACTIVATION-DECISION §3.7). Recorded in the system register, not dropped |
| Box 6 — Top-3 Reasoning (three ranked choices) | 6 (Sensitivity) + 3 | The tool has no *choices* to rank. What it does have: the formula/assumptions/uncertainty trail (box 3) and the band severity ordering inside box 2 (the worst marker is named in the KPI strip) | test "C2 states the formula, the assumptions and the uncertainty" | **NOT_APPLICABLE** for the ranked-choices reading (a lipid panel has no options to rank); **Implemented** as the closest honest equivalents (formula trail + severity ordering). SPEC §5.2 forbids inventing a third option to fill the list, so none is invented |
| Box 7 — Safety / Warnings | 7 (Warnings/safety, = C3) | Box 7: engine-derived flags (very-high triglycerides ≥ 500 mg/dL with the pancreatitis referral, a very-high LDL band, a high band combined with hypertension/smoking/age, a stale panel) + the "do not" list + "stop and seek advice" + the explicit statement that the tool does not diagnose or prescribe | test "C3 raises a red flag and a referral for a very-high result" (520 mg/dL) | **Implemented** |
| Box 8 — What-If Engine | 5 (What-if) | Same box 5 (see Box 4 row): real pipeline-computed scenarios with the current overall band shown next to each scenario | test "computes the what-if scenarios and the sensitivity through the same pipeline" | **Implemented** |
| Box 9 — Explainable AI (four traceable steps) | 3 (How calculated, = C2) | Box 3 gives the formula, the actual inputs, the assumptions and the uncertainty — the audit-safe equivalent of the four steps (no private chain-of-thought is exposed) | test "C2 states the formula, the assumptions and the uncertainty" | **Implemented** |
| Box 10 — Uncertainty | 3 (uncertainty paragraph) + 2 (C1 confidence line) | Box 3 explains the uncertainty sources (the bands are general categories, so two results near a band edge can fall on either side); box 2 states "Deterministic — no model, no estimate" and shows the edge of the optimal band beside every marker | test "C1 carries the unit, the reference edge and an honest confidence statement" (asserts that no percentage appears) | **Implemented** |
| Box 11 — Alternative Paths (≥2 alternatives with quantified differences) | 5 (What-if) | The quantified alternative paths of this tool are value scenarios (box 5) — there are no protocol or intervention alternatives to compare, because the tool prescribes nothing | test "computes the what-if scenarios and the sensitivity through the same pipeline" | **Implemented** for the value-path reading; **NOT_APPLICABLE** for intervention alternatives (the tool prescribes nothing). Documented rather than invented |
| Box 12 — Next Step / Cross-Tool / Feedback Rating | 8 (Cross-tool links) + 12 (Next actions) | Box 8 carries the link contract (`sourceToolId → targetToolId`, the mapped fields, the 90-day freshness rule, the stale action, the transfer mode `manual-reentry`) and states that nothing is shared automatically; box 12 carries the next action | test "renders the cross-tool links with their freshness rule and the no-transfer statement" + the contract test for `TOOL_040_CROSS_TOOL_LINKS` | **Implemented** |
| — (no SPEC box) | 1 (KPI strip) | Box 1: the overall band, the worst marker, the non-HDL | the 12-box order test + the browser check "the twelve GENIUS boxes keep their fixed order" | **Implemented** |
| — (no SPEC box) | 2 (Primary result, = C1) | Box 2: per-marker value, unit, band, the edge of the optimal band, plus the confidence statement and the freshness verdict | test "C1 carries the unit, the reference edge and an honest confidence statement" | **Implemented** |
| — (no SPEC box) | 3 (Formula / How calculated, = C2) | Box 3: the band formula, the non-HDL formula, the inputs used, the assumptions and the uncertainty | test "C2 states the formula, the assumptions and the uncertainty" | **Implemented** |
| — (no SPEC box) | 4 (Inputs summary) | Box 4: the entered panel values, the context (age, smoking, blood pressure, on-cycle, weeks remaining), the panel date and its freshness, and the note that the total cholesterol was approximated when it was not entered | the 12-box order test + the C2 inputs assertion | **Implemented** |
| — (no SPEC box) | 5 (What-if) | Box 5: three scenarios re-run through the same pipeline (LDL 100, HDL 60, TG 150 mg/dL), each with the resulting overall band and an explicit "unchanged" label when nothing moves | test "computes the what-if scenarios and the sensitivity through the same pipeline" | **Implemented** |
| — (no SPEC box) | 6 (Sensitivity) | Box 6: five probes, each changing exactly one input (LDL −30, HDL +10, TG −50, age +10, SBP +15), with the measured effect on the overall band | test "computes the what-if scenarios and the sensitivity through the same pipeline" | **Implemented** |
| — (no SPEC box) | 7 (Warnings / safety, = C3) | Box 7: the referral conditions, the do-not list and the stop-and-seek-advice paragraph | test "C3 raises a red flag and a referral for a very-high result" | **Implemented** |
| — (no SPEC box) | 8 (Cross-tool links) | Box 8: two links (Tool 039, Tool 007) with their mapped fields, the 90-day freshness rule, the stale action and the transfer mode | test "renders the cross-tool links with their freshness rule and the no-transfer statement" | **Implemented** |
| — (no SPEC box) | 9 (Evidence / sources, = C4) | Box 9: four public references (MedlinePlus ×3, CDC) with the publisher, the review date, the evidence level E2 and the links | test "C4 publishes the sources with publisher, date, evidence level and link" | **Implemented** |
| — (no SPEC box) | 10 (Export) | Box 10: a client-side CSV of the panel and the computed bands, generated in the browser | contract test "exports the panel and the computed bands as CSV" + the component test "offers a client-side CSV export and never calls a server" | **Implemented** |
| — (no SPEC box) | 11 (History) | Box 11 renders with status `not_applicable` and a reason: **this tool stores nothing**. The owner decision D-08 that allowed a local device history was granted for Tool 039 only, and the cloud / per-tenant history stays behind W18 | test "keeps the history box visible with a real reason instead of hiding it" + the browser check "The history box stays visible with a real reason" | **NOT_APPLICABLE** — the requirement itself does not apply to this tool (no storage scope), and the box is rendered with its reason. Excluded from the denominator **with proof**, unlike Tool 039 where the same box is applicable-but-blocked |
| — (no SPEC box, legacy five) | 12 (second half) | Box 12 also carries the Rating (1–5 + comment), with the status `not_available` (`data-r6-rating="not_available"`): a rating must be bound to a stored result, and this tool stores nothing | the same test + the CORE-5 content test | **NOT_AVAILABLE** — the rating half has no capability behind it, and it says so inside the box. The C5 half of box 12 is complete |

---

## 2. Legacy five concepts (SPEC §5.3) — identifiability in Tool 040

| Legacy concept | Where it stays identifiable in Tool 040 | State |
|---|---|---|
| Advice | Box 12 (next step, what not to do, when to see a doctor) + box 3 (why it was computed) | Identifiable |
| Predictions / What will happen | Box 5 — explicitly a scenario, never a prediction; no confidence number anywhere | Identifiable, non-probabilistic |
| Medical advice | Box 12 + the referral list in box 7 | Identifiable |
| Current status | Box 1 (KPI: overall band, worst marker, non-HDL) + box 2 (primary result) + box 7 (safety status) | Identifiable |
| Current feeling | Not applicable — the tool has no self-report input; the domain rationale is printed in box 7's scope note and the proposal P-08 records the future option | Documented as NOT_APPLICABLE with a domain rationale (no invented sliders) |

---

## 3. The Tool 039 ↔ Tool 040 difference, stated precisely

The Tool 039 crosswalk resolves the same GENIUS12-12 contradiction, but it resolves it **differently**, and the difference must be visible rather than copied.

| | Tool 039 | Tool 040 |
|---|---|---|
| Box 11 (History) | APPLICABLE, **NOT_AVAILABLE**, capability missing (blocked by W18), rendered with a reason, **counted in the denominator** | **NOT_APPLICABLE** — the tool has no storage scope at all, excluded from the denominator **with proof**, rendered with a reason |
| Box 12 rating | APPLICABLE, **NOT_AVAILABLE**, counted in the denominator | **NOT_AVAILABLE** inside an applicable box whose C5 half is complete |
| SPEC-R6.1-4.f (per-user memory) | APPLICABLE, implemented (the D-08 exception) | **NOT_APPLICABLE** with proof — the D-08 exception was granted for Tool 039 only |
| The rule applied | `NOT_APPLICABLE` is used only where the requirement does not apply; a missing capability is **open**, not excluded | The same rule. Tool 040 genuinely has no storage requirement, so its rows are excluded **with a proof** rather than counted as open |

**Why this is not "a copy":** the Tool 039 ledger counted the history rows as open because the owner had *granted* the capability for that tool and only the storage design was missing. For Tool 040 the owner granted nothing, so the requirement does not apply to this tool at all. Claiming it as open would be a false claim of debt; claiming it as implemented would be a false claim of capability. The honest answer is NOT_APPLICABLE with a proof, and the box still says so in the UI.

---

## 4. Visual layer crosswalk (SPEC §6.6 / §6.7 / §7.1 / §7.2 / §7.4 / §15 — ACCEPTANCE §5.5)

The visual requirements are **not** part of the twelve result boxes; they are a separate atomic group in the Tool 040
ledger (`ACC-5.5.1` … `ACC-5.5.11`, `SPEC-6.6-SLIDER`, `SPEC-6.7-TOOLTIP`, `SPEC-7.1-CHART`, `SPEC-7.2-ARROWS`,
`SPEC-7.4-ILLUSTRATION`, `SPEC-15-A11Y`, `ACC-5.5.7-LEGIBILITY`, `ACC-5.5.3-VISIBILITY`). The mapping is:

| Visual requirement | Tool 040 implementation | Proof |
|---|---|---|
| Explanatory illustration (SPEC §7.4) | The five-step SVG diagram (enter the panel → validate → the engine bands each marker → the context is applied → the result and the escalation are shown) + the phone stack + the ordered-list text equivalent, with the marker meanings | the browser checks "EMPTY state: the explanatory illustration is visible before anything is entered" and "EMPTY state: the illustration is labelled as illustrative, not as a measurement" |
| Data visualization (SPEC §7.1) | One gauge per marker on **its own scale**, against the edge of its optimal band, plus the four-band ladder | the browser check "the gauge shows the entered value and its band" + the data-layer test "scales each gauge on its own scale and clamps the fill to 100 percent" |
| Pie / Donut decision (SPEC §7.1) | **NOT APPLICABLE**, with the tool's own technical reason (not shares of a whole; HDL is protective) | the data-layer test "documents why a pie or donut chart is not used here" |
| Tooltip contract (SPEC §6.7) | Per-element payloads with meaning, value, unit, band, explanation, method, source, warning and limitation; hover + focus + touch + Escape + an explicit close; clamped inside the viewport | the browser checks for hover, focus, touch, Escape and the viewport clamp |
| Colour-to-box relationship (SPEC §7.2) | The last diagram node and the primary result box highlight each other through the `r6:tool-040-highlight` event, and the relation is also stated in text | the two-way highlight is implemented in both components; the text statement means colour is never the only signal |
| Accessibility (SPEC §15) | `role="tooltip"`, `aria-label` on every gauge, `aria-labelledby` / `aria-describedby` on the diagram, an equivalent data table, the visible focus ring, `prefers-reduced-motion`, no horizontal overflow at 390 px, AR/EN with RTL/LTR | the browser suite (28 checks) and the component tests |

---

## 5. What this crosswalk does NOT claim

- It does not claim that Tool 040 has a history, a rating, a stored result, an account or a session. It has none of them.
- It does not claim a published deployment. Tool 040 has none; the evidence is a local production build.
- It does not claim an owner decision. Every applicable row in the Tool 040 ledger is `C = PENDING`.
- It does not claim that a box is complete because its name exists. Every box above names the test that proves its content.
