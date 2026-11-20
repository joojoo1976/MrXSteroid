# TOOL 039 — GENIUS-12 CROSSWALK (SPEC §5.2 ↔ CLOSURE-LAYER ↔ Tool 039)

**Why this file exists:** two box lists exist in the R6.1 sources — the twelve boxes of `SPEC.md §5.2` (the legacy, owner Add-On list, still implemented by the shared `components/tools/ResultBoxes.tsx`) and the GENIUS-12 list of `R6.1-CLOSURE-LAYER.md` (the operative R6.1 list: CORE-5 embedded + 7 enrichment boxes). Tool 039 renders the **closure-layer** list itself, so this crosswalk states, box by box, where every SPEC box and every legacy concept lives in Tool 039 — and what the honest state is when it is not there.

**Authoritative sources**
- SPEC boxes: `docs/MRX Genius Cloud Unified R6.1/SPEC.md` §5.2 (lines 342–378) and §5.3 legacy-five (lines 380–390), §5.4 mandatory count / unavailable-state rule (lines 392–394).
- Closure-layer list: `docs/MRX Genius Cloud Unified R6.1/R6.1-CLOSURE-LAYER.md` §GENIUS-12 (lines 374–389) and §CORE-5 (lines 364–372).
- Tool 039 implementation: `components/tools/tool-039-liver-enzyme-tracker.genius.tsx` (boxes `data-r6-box="1".."12"`), `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts`.

**Rules applied (SPEC §5.4 + closure layer):** a box that cannot show content stays present with its status and reason; a blank card, hidden card or fabricated text does not pass. A box is never counted as complete because its name exists.

---

## 1. Box-by-box crosswalk

| SPEC §5.2 box | CLOSURE-LAYER GENIUS-12 box | Tool 039 implementation | Actual content proven by | State |
|---|---|---|---|---|
| Box 1 — Medical Advice | 12 (Next actions, = C5) | Box 12 "Next actions": next step + what not to do + when to see a doctor; plus the referral list inside box 7 | test "C5 gives one next step, what not to do and when to see a doctor" | **Implemented** |
| Box 2 — General Advice | 3 (How calculated, = C2) + 4 (Inputs summary) | Box 3 (formula, assumptions, uncertainty) and box 4 (the readings, answers and alcohol actually entered) | tests "C2 states the formula, the assumptions and the uncertainty" + the 12-box order test | **Implemented** |
| Box 3 — Current Feeling / Sensation (5 self-report sliders) | — (not a separate box in GENIUS-12) | The tool has **no self-report input**; its contract is lab values + two answers + alcohol. No self-report slider exists, and adding one is proposal P-03 (not implemented) | contract test "declares every required field…" (7 fields, none subjective) | **NOT_APPLICABLE** — domain rationale: a laboratory-value tool has no self-report dimension; the five sliders are not applicable and are not fabricated. Recorded as an open proposal, not as a missing box |
| Box 4 — Predictions | 5 (What-if) | Box 5 computes arithmetic scenarios (1×/3×/5× ULN) by re-running the same pipeline, explicitly labelled "arithmetic scenarios, not predictions" | test "computes what-if scenarios and sensitivity through the same pipeline" (asserts the 168 U/L arithmetic) | **Implemented as a non-probabilistic scenario** — exactly the alternative SPEC §5.2 Box 4 allows ("show `NOT_AVAILABLE` or a non-probabilistic scenario clearly labeled as rule-based/statistical estimate"). No confidence number is ever shown |
| Box 5 — AI Coach | — | No coach, no profile, no model. The tool's contract is deterministic only; the capability contract states it | test "publishes the seven-part capability contract without claiming AI" | **NOT_APPLICABLE** — rationale: no consented profile fields exist in this tool's contract and no model is activated (R6.1-ACTIVATION-DECISION §3.7). Recorded in the system register, not dropped |
| Box 6 — Top-3 Reasoning (three ranked choices) | 6 (Sensitivity) + 3 | The tool has no *choices* to rank. What it does have: the formula/assumptions/uncertainty trail (box 3) and the marker severity ordering inside box 2 | test "C2 states the formula…" | **NOT_APPLICABLE** for the ranked-choices reading (a lab panel has no options to rank); **Implemented** as the closest honest equivalents (formula trail + severity ordering). SPEC §5.2 forbids inventing a third option to fill the list, so none is invented |
| Box 7 — Safety / Warnings | 7 (Warnings/safety, = C3) | Box 7: engine-derived red flags (critical, high, stop-orals, cholestatic pattern, stale) + "do not" list + "when to seek medical care" + the engine's own recommendations | tests "C3 raises a red flag and a referral for a critical result" + "flags stale lab data…" | **Implemented** |
| Box 8 — What-If Engine | 5 (What-if) | Same box 5 (see Box 4 row): real pipeline-computed scenarios with the current value shown next to each scenario | test "computes what-if scenarios…" | **Implemented** |
| Box 9 — Explainable AI (four traceable steps) | 3 (How calculated, = C2) | Box 3 gives the formula, the actual inputs, the assumptions and the uncertainty — the audit-safe equivalent of the four steps (no private chain-of-thought is exposed) | test "C2 states the formula, the assumptions and the uncertainty" | **Implemented** |
| Box 10 — Uncertainty | 3 (uncertainty paragraph) + 2 (C1 confidence line) | Box 3 explains the uncertainty sources; box 2 states "not calibrated — no published confidence interval"; freshness and the laboratory's own range are named as uncertainty sources | test "C1 carries the unit, the reference range and an honest confidence statement" | **Implemented** |
| Box 11 — Alternative Paths (≥2 alternatives with quantified differences) | 5 (What-if) | The quantified alternative paths of this tool are value scenarios (box 5) — there are no protocol/intervention alternatives to compare | test "computes what-if scenarios…" | **Implemented** for the value-path reading; **NOT_APPLICABLE** for intervention alternatives (the tool prescribes nothing). Documented rather than invented |
| Box 12 — Next Step / Cross-Tool | 8 (Cross-tool links) + 12 (Next actions) | Box 8 carries the link contract (`sourceToolId → targetToolId`, mapped fields, 90-day freshness rule, stale action, transfer mode `manual-reentry`); box 12 carries the next action | test "offers a client-side CSV export and links the related tools" + the contract test for `TOOL_039_CROSS_TOOL_LINKS` | **Implemented** |
| — (no SPEC box) | 1 (KPI strip) | Box 1: overall status, highest multiple, marker count, freshness | 12-box order test + the browser check of the previous deployment | **Implemented** |
| — (no SPEC box) | 2 (Primary result, = C1) | Box 2: per-marker value, unit, reference limit, multiple, status + the confidence statement | test "C1 carries the unit, the reference range and an honest confidence statement" | **Implemented** |
| — (no SPEC box) | 4 (Inputs summary) | Box 4: the entered readings, the two answers, the alcohol value, the freshness note | 12-box order test | **Implemented** |
| — (no SPEC box) | 6 (Sensitivity) | Box 6: one input changed at a time (marker value ×2, oral-steroids answer, alcohol) with the measured effect on the status | test "computes what-if scenarios and sensitivity through the same pipeline" | **Implemented** |
| — (no SPEC box) | 9 (Evidence/sources, = C4) | Box 9: four NIH references with publisher, review date, evidence level E2 and links | test "C4 publishes sources with publisher, review date, evidence level and link" | **Implemented** |
| — (no SPEC box) | 10 (Export) | Box 10: client-side CSV of the readings and the computed result | contract test "exports a CSV with the readings, the answers and the computed result" + the Download button test | **Implemented** |
| — (no SPEC box) | 11 (History) | Box 11 renders with status `not_applicable` and a reason, but **no history data source exists**: storing results needs the approved session/backup design (W18), which is not approved | test "marks the history box NOT_APPLICABLE with a real reason instead of hiding it" | **NOT_AVAILABLE** — applicable requirement, capability missing (BLOCKED by W18). Counted as open |
| — (no SPEC box, legacy five) | 12 (second half) | Box 12 also carries the 1–5 rating + comment | the rating control is not rendered; the box states the reason (`data-r6-rating="not_available"`) | **NOT_AVAILABLE** — applicable requirement, capability missing (no storage layer). Counted as open |

---

## 2. Legacy five concepts (SPEC §5.3) — identifiability in Tool 039

| Legacy concept | Where it stays identifiable in Tool 039 | State |
|---|---|---|
| Advice | Box 12 (next step, what not to do, when to see a doctor) + box 3 (why it was computed) | Identifiable |
| Predictions / What will happen | Box 5 — explicitly a scenario, never a prediction; no confidence number anywhere | Identifiable, non-probabilistic |
| Medical advice | Box 12 + the referral list in box 7 | Identifiable |
| Current status | Box 1 (KPI) + box 2 (primary result) + box 7 (safety status) | Identifiable |
| Current feeling | Not applicable — the tool has no self-report input; the domain rationale is printed in box 7's scope note and the proposal P-03 records the future option | Documented as NOT_APPLICABLE with a domain rationale (no invented sliders) |

---

## 3. Contradiction resolved

The previous report contained an internal inconsistency: **GENIUS12-12** was described in one place as "not applicable" and in another as "NOT_AVAILABLE, open".

**Resolution (now binding on the ledger):**

- GENIUS12-12 is **APPLICABLE** to Tool 039 (it is one of the twelve mandatory boxes and its C5 half is implemented).
- Its **rating/comment half is NOT_AVAILABLE**: the requirement applies, the capability does not exist, and it is therefore **not** excluded from the denominator and **not** counted as complete.
- The box **is rendered**, with its status and reason visible (SPEC §5.4).
- The same rule is applied to GENIUS12-11 (History): applicable, NOT_AVAILABLE, rendered with a reason, counted as open.
- `NOT_APPLICABLE` is used only where the requirement itself does not apply to this tool, and every such row carries its proof in the ledger.

---

## 4. Visual layer crosswalk (SPEC §6.6 / §6.7 / §7.1 / §7.2 / §7.4 / §15 — ACCEPTANCE §5.5)

The visual requirements are **not** part of the twelve result boxes; they are a separate atomic group in the Tool 039
ledger (`ACC-5.5.1` … `ACC-5.5.11`, `SPEC-6.6-SLIDER`, `SPEC-6.7-TOOLTIP`, `SPEC-7.1-CHART`, `SPEC-7.2-ARROWS`,
`SPEC-7.4-ILLUSTRATION`, `SPEC-15-A11Y`) and they are implemented in
`components/tools/tool-039-liver-enzyme-tracker.visual.tsx` with the pure data layer
`lib/tools/r6/tool-039-liver-enzyme-tracker-visual.ts`.

| SPEC section | Requirement | Tool 039 implementation | Status |
|---|---|---|---|
| §7.4 | Explanatory illustrations, labelled, with a text equivalent | Five-step flow diagram ("How a liver-enzyme result is produced") + the meaning of the five analytes, captioned as illustrative | PASS |
| §7.1 | A chart that accurately represents the information; no forced Pie/Donut | Per-marker bar/gauge against the documented reference limit + dated line chart of the real readings; the Pie/Donut decision is documented in the UI and in code | PASS |
| §6.7 | Tooltip contract (name, meaning, value, unit, ratio, explanation, method, source, warning, limits; hover/focus/touch/close/Escape) | `buildLiverTrackerBarTooltip` / `buildLiverTrackerPointTooltip` produce a per-element payload; the tooltip is opened by hover, focus, Enter and tap | PASS |
| §7.2 | SVG arrows and colour-to-box relationships | Directional connectors in the diagram; the last node and the primary result box highlight each other through a DOM event, with a text label | PASS |
| §6.6 | GeniusSlider quality and the "AI hint" clause | The shared slider is applied only to the coarse integer field; no AI suggestion is fabricated because no model is activated | PASS |
| §15 | Accessibility and responsive UX | Keyboard reachability, focus rings, `role="tooltip"`, accessible names/descriptions, an equivalent data table, AR/EN RTL/LTR, `prefers-reduced-motion`, no horizontal overflow at 390 px | PASS |
| ACCEPTANCE §5.5 | Visual and UX quality (11 bullets) | Each bullet is a separate ledger row with its own evidence | PASS (11/11) |

Browser evidence for the whole group: `docs/MRX Genius Cloud Unified R6.1/evidence/tool-039-published/`
(21/21 checks on the published preview) and `.../evidence/tool-039/` (the same run against the local production build).

---

## 5. What this crosswalk does not claim

- It does not claim that Tool 039 renders the shared `ResultBoxes` component's legacy numbering; it does not, and the shared component is not used for this tool (the slug is in `R6_EXEMPT_SLUGS`).
- It does not claim History, Rating, Current Feeling, AI Coach or intervention-alternatives exist. Each of them is either rendered as a status + reason, or recorded as an open/blocked row in the ledger, or recorded in the system register for platform ownership.
- It does not claim an independent E5 audit; the owner review is the remaining step.
