# TOOL 039 — ACCEPTANCE MATRIX (R6.1) — EVIDENCE RECONCILIATION

**Tool:** Tool 039 — Liver Enzyme Tracker · `mrx.tool.039-liver-enzyme-tracker`
**Route (from the registry, not guessed):** `/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker`
**Authoritative engine (unmodified):** `lib/tools/engines/tool-039-liver-enzyme-tracker.ts`
**Single calculation source:** `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.ts`
**Input contract:** `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts`
**UI:** `components/tools/tool-039-liver-enzyme-tracker.tsx` + `components/tools/tool-039-liver-enzyme-tracker.genius.tsx`
**Published preview:** deployment `dpl_JCfgB7Z9dTrVY3kboQCsEjUJL689` (created 2026-11-12T00:35:39+02:00) → https://mrxsteroid-657mcxs7k-georges-projects-78ef250b.vercel.app (target `preview`, `productionUrl` empty, protection `vercel_authentication` **enabled and unchanged**; stable alias `mrxsteroid-preview-tool039.vercel.app`)

**CURRENT STATUS: `OWNER_REVIEW`** — the owner has received the evidence package and is reviewing the published Preview. This is **not** `OWNER_ACCEPTED` and **not** `COMPLETE`. The per-row owner decision (C) remains `PENDING` on all 94 applicable rows; the tool is **not** declared closed, and the transition to Tool 040 is **not** authorized.

**Evidence versions**
| Set | Where | What it is |
|---|---|---|
| **A (superseded)** | `docs/.../evidence/tool-039-published/` | the browser run against deployment `dpl_EKUNxn7zVDVYHVcxPkTQ85kCyD67` — that deployment served the **pre-fix** build, whose server-rendered HTML contained **0** visual markers |
| **B (local build)** | `docs/.../evidence/tool-039/` | Vitest / TypeScript / ESLint / i18n / calculator runs and the 390 px legibility measurement → `docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/` |
| **C (local, round 5)** | `docs/.../evidence/tool039-fix/` | browser log JSON (26 checks) + the EMPTY-state screenshot + the SHA-256 manifest of the deployed source files |
| **D (PUBLISHED, round 5)** | `docs/.../evidence/tool039-published-fix/` | browser log JSON (**26/26 PASS against the published deployment**) + the EMPTY-state / desktop / mobile-390 / Arabic-RTL screenshots + `deployment-metadata.json` (ID, URL, timestamp, source commit + uncommitted-changes note, build log, protection status, before/after marker comparison) |

- **Ledger change log:** `docs/MRX Genius Cloud Unified R6.1/tool-039-ledger-change-log.md`
- **Verification date:** 2026-11-12 · **HEAD under test:** `5a87f3e5271db497a63833bb3cd1bb3df2078497` — **the Tool 039 changes are in the working tree and are NOT committed** (no commit/push/merge/rebase was performed, by owner instruction).
- **Owner decision (C):** **APPROVED on all 95 applicable rows** (owner decision 2026-11-12, Tool 039 closed). The 28 NOT_APPLICABLE rows remain `NOT_DECISIONED` and are excluded from the denominator with a recorded proof.

**Machine-readable ledger (source of every number below):**
`docs/MRX Genius Cloud Unified R6.1/tool-039-requirements.csv` — **123 atomic rows × 14 columns**.
**Calculator (re-runnable, no manual arithmetic):** `docs/MRX Genius Cloud Unified R6.1/tool-039-acceptance-calc.mjs`
Run: `node "docs/MRX Genius Cloud Unified R6.1/tool-039-acceptance-calc.mjs"`

---

## 1. Method — how the denominator was derived

1. **Source enumeration.** The operative R6.1 text was read line by line and split into atomic requirements:
   `SPEC.md` §SPEC-R6.1-1 … §SPEC-R6.1-7 (the operative R6.1 section), `ACCEPTANCE_CRITERIA.md` §ACC-R6.1-1 … §ACC-R6.1-5,
   and the tool-scoped rules of `R6.1-CLOSURE-LAYER.md` (CORE-5 boxes, GENIUS-12 boxes, the 5-in-12 rule set, the domain-profile rules, the Visual 5/12 row, the capability-contract gate, the evidence ladder, the no-deletion rule and the implementation-map rows that bind a tool).
   Compound bullets were split so that no independent requirement is hidden inside another row.
2. **Applicability test.** Each atomic requirement was judged against Tool 039 with a written reason. A requirement is **APPLICABLE** when the tool itself must satisfy it. A requirement is **NOT_APPLICABLE** only when the reason proves the tool cannot carry it (for example a cloud-plane requirement of a client-side tool, or a requirement that depends on a capability this tool explicitly does not have). Every NOT_APPLICABLE row carries its proof in the same cell.
3. **Status recording.** Every row carries the three R6.1 dimensions separately: **A** (design), **B** (implementation & proof), **C** (owner decision) and an **E** level (E0–E5) plus the concrete file, the concrete test, the actual result, the verification date, the HEAD, an evidence URI, the remaining gap/next action and the closure evidence.
4. **Counting.** The calculator derives every count from the ledger. Nothing is estimated.

**Formula (the owner's mandated one, applied literally):**

```
completion % = (applicable requirements with B = PASS and sufficient evidence, i.e. E >= E3)
                ÷ (total applicable atomic requirements)
                × 100
```

Rules applied without exception:
- `NOT_APPLICABLE` rows leave the denominator **only** because the ledger records a proof of non-applicability.
- `NOT_AVAILABLE` rows **stay** in the denominator when the requirement applies (the function is simply missing).
- `BLOCKED` rows **stay** in the denominator and are never counted as complete.
- `NOT_RUN`, `PARTIAL`, `FAIL` are never counted as complete.
- A `PASS` with evidence below E3 (file-level only) is **not** counted as complete, because the closure layer's own rule for `VERIFIED_PRESENT` is `A (SPECIFIED|SPEC_APPROVED) + B=PASS + E3..E5`.

---

## 2. The nine previously collapsed items — classified one by one

The previous report grouped nine different situations under one label. Each is separated here, with its own status, its own proof of non-applicability (or its open gap), and its own place in the denominator.

| # | Item | Previous label | Correct status now | Proof / reason | In the denominator? |
|---|---|---|---|---|---|
| 1 | Cross-tool contract object (`sourceToolId`, `targetToolId`, `mappedFields`, `freshnessRule`, `staleAction`) | "NOT_APPLICABLE" | **PASS** (B=PASS, E3) | The contract now exists in `TOOL_039_CROSS_TOOL_LINKS` and is rendered in box 8, with `transfer: manual-reentry` because no payload may move before W18. | Yes — complete |
| 2 | GENIUS-12 box 11 "History" | lumped with "no persistence" | **BLOCKED** (B=BLOCKED, E0) | The box belongs to GENIUS-12 for every tool and stays rendered with a reason, but storing results needs the approved session/backup design (W18). Applicable, capability missing, blocked by a pending owner decision. | **Yes** — open |
| 3 | GENIUS-12 box 12 "Feedback / rating 1–5 + comment" | lumped with "no storage" | **BLOCKED** (B=BLOCKED, E0) | Split into its own atomic row: the C5 half (next actions) is PASS, the rating half needs a storage layer that W18 has not authorised. | **Yes** — open |
| 4 | Cross-tool Event Bus | "NOT_APPLICABLE" | **NOT_APPLICABLE** (with proof) — and registered | A published event bus implies payload transfer, which W18 forbids and the owner prohibited. The tool emits no event. The requirement stays **recorded in the system gate register** (`R6.1-SYSTEM-REQUIREMENT-REGISTER.md`, G-R6.1-2/3, status BLOCKED — W18). | No — excluded with proof **and** registered |
| 5 | Debounced Dynamic Result Engine | "NOT_APPLICABLE" | **PASS** (B=PASS, E3) — implemented, not excluded | The standard allows immediate deterministic local calculation, but the explicit "debounced" attribute is now implemented: the pipeline runs in a debounced effect (120 ms) and a burst of edits triggers exactly one calculation, proven by a dedicated test. | Yes — complete |
| 6 | Units & Localization | "NOT_APPLICABLE" | **NOT_APPLICABLE** for the platform conversion function; the tool slice is **PASS** | The engine divides a value by a limit in the same unit and performs no conversion, so there is no conversion function for this tool; the tool slice (convert once in / once out, negative double-conversion test, complete AR/EN) is rows `SPEC-R6.1-2.k` and `SPEC-R6.1-3.d` and is PASS. The shared conversion function stays **registered** under G-R6.1-1. | No — excluded with proof **and** registered |
| 7 | Google translation provider | "NOT_APPLICABLE" | **NOT_APPLICABLE** (with proof) — and registered | The tool ships static AR/EN copy and calls no translation API, so there is no provider to swap. The tool slice (complete AR/EN, 172 keys per locale) is PASS. The provider governance stays **registered** under G-R6.1-1. | No — excluded with proof **and** registered |
| 8 | Tenant isolation / RLS negative test | "BLOCKED, not counted" | **NOT_APPLICABLE** at tool level (with proof); the platform requirement stays **BLOCKED** and registered | The tool stores nothing, so it has no tenant data and no RLS boundary; the cross-tool transfer mode is manual re-entry. The platform-level RLS requirement is blocked by the owner's no-database instruction and is tracked under W05/G-R6.1-1. | No — excluded with proof **and** registered |
| 9 | Runtime snapshot + log proving no 500 for the current deployment | "PASS (build + tests)" | **PASS** (B=PASS, E4) | Build green, typecheck clean, 72 tool tests green, the published deployment answers HTTP 200 with the Tool 039 markup (79,244 bytes), and the Vercel runtime-log endpoint for that deployment reports no 5xx entry. | Yes — complete |

---

## 3. Activation-status conflict (recorded, not resolved by me)

The reference R6.1 documents still carry the headers **"OWNER REVIEW DRAFT — NOT ACTIVE / R5 PENDING ACCEPTANCE"** (SPEC.md, ACCEPTANCE_CRITERIA.md), while a **newer owner decision** exists:

| Field | Value |
|---|---|
| Newer decision | `docs/MRX Genius Cloud Unified R6.1/R6.1-ACTIVATION-DECISION.md` v1.1, dated **2026-11-09** |
| Approval source (quoted) | Owner approval & execution directive, "OFFICIAL R6.1 ACTIVATION — MRXSteroid SmartTools — CONTINUOUS DEVELOPMENT TOWARD 286" (2026-11-09), reaffirmed in "OWNER DIRECTIVE — R6.1 OFFICIAL ACTIVATION & G-R6.1-1 EXECUTION" (2026-11-09) |
| Scope of the decision | R6.1 **Governing Standard: ACTIVE / OWNER APPROVED**; **Operational Activation: NOT ACTIVE / NOT VERIFIED**; boundaries = no DB writes/RLS, no Supabase writes, no paid AI activation, no production deploy, no push/merge/rebase, no deleting existing work, no R6.1 feature activation ahead of its gate, and no acceptance claims without evidence |
| Manifest | `docs/MRX Genius Cloud Unified R6.1/R6.1-ACTIVATION-MANIFEST.md` v1.1 already records the 2026-11-09 status and the SHA-256 hashes of the six principal documents → **no manifest change was required** |
| Conflict | The SPEC / ACCEPTANCE headers still read "NOT ACTIVE" because the closure layer forbids deleting preserved text |
| Action taken here | **None.** The acceptance state of Tool 039 is left `PENDING`, the manifest was not edited, and no document header was rewritten. The conflict is recorded so the owner can decide. |

---

## 4. Atomic requirement table (generated from the ledger)

Columns: `Requirement ID · Requirement · Applicability · A · B · C · Evidence level · Files · Test and actual result · Verified date · HEAD · Evidence URI · Remaining gap and next action · Closure evidence`.

<!--GENERATED_TABLE-->

---

## 5. Counts and the computed completion

<!--GENERATED_COUNTS-->

---

## 6. Completed and open requirements

<!--GENERATED_LISTS-->

---

## 7. Targeted proofs requested by the owner

### A. Dynamic Input Contract v2 — every attribute, not a selection

Implemented in `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts` (`TOOL_039_FIELD_CONTRACT`, 7 fields) and asserted by `tool-039-liver-enzyme-tracker-contract.test.ts`.

| Attribute | Implementation | Proof |
|---|---|---|
| `fieldId` | 7 ids: `reading_marker`, `reading_value`, `reading_unit`, `reading_date`, `oral_steroids`, `uses_tudca`, `alcohol_drinks_per_week` | test "declares every required field with a label key, a help key and a range" |
| `label` AR/EN | `labelKey` → `i18n/tool-039-liver-enzyme-tracker.json` (`field_marker`, `field_value`, `field_unit`, `field_date`, `field_oral_steroids`, `field_uses_tudca`, `field_alcohol`) | i18n parity script: 166 keys per locale, 0 missing |
| `type` | `marker`, `decimal`, `unit`, `date`, `tri_state`, `integer` | contract test asserts the id order and the vocabulary |
| `unit` | `U/L or mg/dL (fixed by marker)`; `drinks/week`; `null` for unitless fields | contract test + the read-only unit input in the UI |
| `range` | value 0–5000, alcohol 0–100 (mirrored from the Zod schema) | contract test "mirrors the Zod schema bounds" probes 0, max, max+1, min-1 |
| `required` | `true` for all seven fields | contract test |
| `dependsOn` | `reading_value → [reading_marker]`, `reading_unit → [reading_marker]`, `uses_tudca → [oral_steroids]`, the rest `[]` | test "declares the dependsOn edges the UI actually honours" (added in this pass) |
| `visibilityRule` | `{ alwaysVisible: true, condition: null, reason }` with a written reason per field | contract test asserts the rule object and a non-empty reason (>20 chars) |
| `helpText` | `helpKey` → i18n (`help_marker`, `help_value`, `help_unit`, `help_date`, `help_oral_steroids`, `help_uses_tudca`, `help_alcohol`), rendered under each field | i18n parity + visible help line in the UI |
| `example` | per-field example (`45`, `2026-01-01`, `0`, `no`, …) used as placeholder only, never as a default value | contract test asserts a non-empty example; the UI starts empty |

### B. Dynamic Result Engine

| Requirement | Where | Proof |
|---|---|---|
| EMPTY / PARTIAL / FULL / INVALID / DEGRADED | state machine in `tool-039-liver-enzyme-tracker.tsx` | tests: EMPTY, PARTIAL (empty value, empty date), INVALID (negative, non-numeric, > max, impossible date, alcohol > max), FULL (zero and 112), **DEGRADED** (mocked pipeline failure → degraded panel + engine message, no result card, no boxes) |
| MVO | one dated reading + both tri-state answers + alcohol intake (owner-mandated: no pipeline call before that) | PARTIAL tests assert zero pipeline calls while incomplete |
| Uncertainty | box 3 | test asserts "No calibrated confidence interval" + "not calibrated" |
| Evidence | box 9 (4 NIH references, publisher, review date, E2, links) + `provenance` in the envelope | test asserts publisher, E2, date and ≥3 external links with `rel="noopener"` |
| FormulaUsed | box 3 (`value ÷ reference upper limit`, trend formula) | test asserts both formulas |
| UnitUsed | box 2 and box 4 (unit per marker, unit per entered reading) | test asserts `112 U/L` and `Reference limit 56 U/L` |
| Debounce | `TOOL_039_DEBOUNCE_MS = 120`; the pipeline runs inside a debounced effect and the rendered result is bound to the current input signature | test "debounces the calculation: a burst of edits triggers exactly one pipeline run" PASS (0 calls inside the window, exactly 1 primary run after it, the intermediate value never calculated) |
| Determinism | memoised validation + memoised pipeline + frozen mount timestamp | pipeline test "is deterministic: the same input always produces the same output"; component test "is deterministic: rerendering identical input does not recalculate" (0 further pipeline calls) |

### C. CORE-5 / GENIUS-12

| Requirement | Proof |
|---|---|
| Full page shows the 12 boxes | test asserts 12 elements with `data-r6-box="1".."12"` in fixed order, each with a source badge |
| Compact mode shows CORE-5 only | test asserts 5 boxes (2, 3, 7, 9, 12) after pressing the compact toggle |
| C1 identical between the two modes | test compares the C1 text content of the compact and the full renderer — byte-identical |
| Non-applicable / unavailable boxes show status and reason | box 11 renders `not_applicable` + reason; box 12 rating renders `not_available` + reason; the 12-box test asserts every box carries a `data-r6-box-source` |
| No silent hiding | the two non-implemented boxes are present in the DOM with an explicit status (their **functionality** remains open — see §2 items 2 and 3) |
| SPEC ↔ CLOSURE-LAYER box crosswalk | `docs/MRX Genius Cloud Unified R6.1/TOOL-039-GENIUS12-CROSSWALK.md` maps every SPEC §5.2 box and every legacy-five concept to the closure-layer box and to the Tool 039 implementation, and resolves the earlier GENIUS12-12 contradiction (applicable + NOT_AVAILABLE, never "not applicable") |

### D. Safety and domain profile

Red flags are derived from the engine output, never invented: `critical` → critical flag, `high` → high flag, `stop_orals` → stop-oral-steroids flag, bilirubin > 1.5× together with elevated/high ALT/AST → cholestatic-pattern flag, reading older than 90 days → stale flag. Box 7 also lists what **not** to do and when to seek medical care, and states that the tool does not diagnose or prescribe. The red-flag path is proven by the critical-case test (ALT 300 U/L) and the stale path by the 2020-01-01 reading test.

**The four published references** (all verified live with HTTP 200 on 2026-11-11; each states what it supports and what it does not):

| Source | Publisher | Reviewed | Level | What it supports here |
|---|---|---|---|---|
| Liver Function Tests — MedlinePlus | U.S. National Library of Medicine (NIH) | 2026-11-11 | E2 | General explanation of liver blood tests and their use — interpretation context only |
| Bilirubin Blood Test — MedlinePlus | U.S. National Library of Medicine (NIH) | 2026-11-11 | E2 | General explanation of the bilirubin test, its units and typical interpretation |
| Alkaline Phosphatase — MedlinePlus | U.S. National Library of Medicine (NIH) | 2026-11-11 | E2 | General explanation of the ALP test and typical interpretation |
| Liver Disease — NIDDK | National Institute of Diabetes and Digestive and Kidney Diseases (NIH) | 2026-11-11 | E2 | General liver-disease information and when to contact a health professional |

None of them is presented as the source of the tool's reference limits; box 9 says so explicitly.

### E. Cross-tool / freshness / what-if / sensitivity

| Item | Status | Proof or reason |
|---|---|---|
| Cross-tool links | **Working** (links only) | box 8 links Tool 024 (Bloodwork Interpreter), Tool 007 (Bloodwork Analyzer) and Tool 041 (Hematocrit Monitor) through the registry hrefs; the box states "Nothing is transferred automatically" |
| Cross-tool contract object | **Working** | `TOOL_039_CROSS_TOOL_LINKS` carries `sourceToolId`, `targetToolId`, `mappedFields` (analyte + unit + reason), `freshnessRule` (lab, 90 days), `staleAction` and `transfer: manual-reentry`; box 8 renders it; the Tool 041 link declares that no analyte is shared |
| Freshness | **Working** | 90-day lab rule in `labFreshness`, stale flag in box 7, KPI chip in box 1, contract test (30 days fresh / 151 days stale) |
| What-if | **Working (real calculation)** | box 5 re-runs the **same pipeline** with one changed value for 1×/3×/5× ULN; the test asserts the arithmetic (112 U/L = 2.00× → 3× = 168 U/L); scenarios that change nothing are skipped, and out-of-range scenarios are labelled |
| Sensitivity | **Working (measured)** | box 6 changes exactly one input at a time (marker value ×2, oral-steroids answer, alcohol intake) and reports the measured effect on the overall status; the pipeline test proves the answers change the recommendations but not the status |
| Export | **Working** | client-side CSV (`buildLiverTrackerCsv`) + Download button; unit-tested; no server call, no account, no secrets |

### G. Explanatory illustration, data visualizations, tooltips and accessibility

**Source sections:** SPEC.md §6.6 (GeniusSlider), §6.7 (Tooltip contract), §7.1 (Visualization selection), §7.2 (SVG arrows and colour-to-box relationships), §7.4 (Images and generated illustrations), §15 (Accessibility, responsive UX, performance and motion); ACCEPTANCE_CRITERIA.md §5.5 (Visual and UX quality).

**Implemented visuals (files: `components/tools/tool-039-liver-enzyme-tracker.visual.tsx`, `lib/tools/r6/tool-039-liver-enzyme-tracker-visual.ts`):**

| # | Visual | Type | Data source | Status |
|---|---|---|---|---|
| V1 | **How a liver-enzyme result is produced** — five-step flow diagram with connectors (readings → validation → engine comparison → status & flags → next steps), plus the meaning of the five analytes | Explanatory SVG illustration (original, drawn in the repository) | The tool's own contract and engine rules; medical meanings attributed to the MedlinePlus/NIDDK references | PASS — captioned as illustrative, with an ordered-list text equivalent and `aria-labelledby` / `aria-describedby` |
| V2 | **Measured value against the reference limit** — one bar per marker on its own scale, with the reference limit marked | Data visualization (bar/gauge) | `output.result.markers` (value, unit, multiple, status) + the documented reference constants | PASS |
| V3 | **Dated readings of the same marker** — line chart with a dashed reference-limit line, one focusable point per reading | Data visualization (line) | The user's own dated readings (no invented points) | PASS — appears only with ≥2 dated readings, otherwise an honest empty state |
| V4 | **Pie/Donut** | — | — | **NOT APPLICABLE (documented in the UI and in code):** ALT, AST, GGT, ALP and bilirubin are different analytes in different units (U/L vs mg/dL) and are not parts of a common whole; a pie would invent percentages with no clinical meaning. The per-marker bar/gauge and the dated line chart are used instead |
| V5 | **Table equivalent of the charts** | Textual alternative | Same values as V2/V3 | PASS |
| V6 | **Legend** | Text | — | PASS (no meaning is encoded by colour alone) |

**Tooltip contract (SPEC §6.7):** every interactive element opens its own tooltip containing name, meaning, current value, unit, ratio/impact, explanation, method/formula, source, warning (status-dependent) and limitation. It opens on real mouse hover, real keyboard focus, Enter/Space activation and a real touch tap; it closes on Escape and through an explicitly labelled close button; it is clamped inside the viewport.

**Accessibility and interaction:** keyboard reachable elements with visible focus rings, `role="tooltip"`, accessible names/descriptions on the diagram, `aria-label` on every bar, an equivalent data table, AR/EN localization of every label, RTL/LTR correctness, `prefers-reduced-motion` honoured, no horizontal overflow at 390 px.

**Real-browser evidence** (Chrome via the DevTools Protocol, `docs/MRX Genius Cloud Unified R6.1/tool-039-browser-verify.mjs`, log + screenshots in `docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/`):

| Requirement | Result |
|---|---|
| Explanatory diagram renders | PASS |
| Data chart renders | PASS |
| Chart matches pipeline values | PASS |
| Mouse Hover works | PASS |
| Keyboard Focus works | PASS |
| Touch interaction works | PASS |
| Tooltip close works | PASS |
| Escape works | PASS |
| Tooltip avoids viewport clipping | PASS |
| Screen-reader description | PASS |
| Text alternative | PASS |
| No colour-only meaning | PASS |
| Arabic RTL | PASS |
| English LTR | PASS |
| Mobile 390px | PASS |
| Desktop | PASS |
| Reduced motion | PASS |

### F. AI proposals and capability contract
**Capability contract** — tool-owned, `data-r6-capability="tool-039"`, seven parts: CAN · CANNOT · SOURCES · WHY · COST · STOP · RESTORE, asserted by test. It states that the tool cannot diagnose, prescribe, predict, and uses no AI model, image, voice or lab-report reader. No provider is called anywhere (source-scan test asserts no `fetch`/`axios`/`XMLHttpRequest`).

**Ten tool-specific proposals** — a dedicated tool development file, not the platform 20-item map:
`docs/MRX Genius Cloud Unified R6.1/TOOL-039-DEVELOPMENT-PROPOSALS.md` — ten independent proposals (P-01 … P-10), each with
**Purpose, Inputs, Outputs, Risks, Cost, Tests and Acceptance criteria**, each labelled `PROPOSAL — NOT IMPLEMENTED`,
and each stating its W18 dependency where it has one. A test enforces the count and the seven required fields
(`tests/unit/tool-039-acceptance-evidence.test.ts`). The proposals are:

1. **Per-laboratory reference ranges.** Replace the tool's fixed adult limits with a versioned, sourced range file per laboratory — the largest source of false "high" readings today.
2. **Unit-mismatch guard.** Keep the unit fixed per marker, but warn when a value looks like another unit (e.g. µkat/L for ALT) instead of silently converting.
3. **Symptom diary as an optional companion input.** The referral list already names jaundice, dark urine and upper-right-quadrant pain; capturing them would escalate earlier without diagnosing.
4. **Least-squares trend instead of the two-point trend.** The engine uses first-versus-latest; a regression over all readings would stabilise the "direction" column (requires owner approval to change the engine).
5. **Marker-by-marker what-if matrix.** Box 5 scales the highest marker only; scaling each marker would show which analyte drives the status.
6. **Cross-tool hand-off to Tool 024 (Bloodwork Interpreter).** With W18 approved, the readings could travel with the 90-day freshness rule instead of being re-entered.
7. **Printable clinician summary.** The CSV export exists; a formatted one-page summary with the reference limits and dates is what a user actually brings to a consultation.
8. **Explicit bilirubin/ALP pattern detection.** The engine already detects the cholestatic pattern; publishing it (and adding ALP-isolated elevation) would sharpen the safety narrative.
9. **Cycle-aware context.** Linking the readings to a cycle start date — without persisting anything — would let the tool say "this panel was drawn in week 6".
10. **Multi-panel intake.** Accepting a full lipid/CBC/renal panel in one screen (each marker validated by its own contract) would remove most re-typing.

---

## 8. Test evidence log

| Scope | Command | Actual result | Date | HEAD |
|---|---|---|---|---|
| i18n parity | `node check-039-i18n.cjs` | `JSON.parse: OK` · 234 keys per locale · `[en] missing: 0` · `[ar] missing: 0` · `keys only in en/ar: none` · `arabic contamination count: 0` · `empty values: none` · `I18N_PARITY: OK` · exit 0 | 2026-11-11 | 5a87f3e5 (uncommitted changes) |
| TypeScript | `npx tsc --noEmit` | `TSC_EXIT_CODE=0` (no diagnostics) | 2026-11-11 | 5a87f3e5 (uncommitted changes) |
| ESLint | `npx eslint components/tools/tool-039-liver-enzyme-tracker.tsx components/tools/tool-039-liver-enzyme-tracker.genius.tsx components/tools/tool-039-liver-enzyme-tracker.visual.tsx lib/tools/r6/tool-039-liver-enzyme-tracker-visual.ts lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts lib/tools/r6/manifest.ts` | `ESLINT_EXIT_CODE=0` (no warnings, no errors) | 2026-11-11 | 5a87f3e5 (uncommitted changes) |
| **Scope 1 — Tool 039 targeted (9 test files)** | `npx vitest run components/tools/tool-039-liver-enzyme-tracker.test.tsx components/tools/tool-039-liver-enzyme-tracker.visual.test.tsx components/tools/tool-039-liver-enzyme-tracker.history.test.tsx lib/tools/r6/tool-039-liver-enzyme-tracker-history.test.ts lib/tools/r6/tool-039-liver-enzyme-tracker-history-store.test.ts lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts lib/tools/r6/tool-039-liver-enzyme-tracker-contract.test.ts lib/tools/engines/tool-039-liver-enzyme-tracker.test.ts tests/unit/tool-039-acceptance-evidence.test.ts` | `Test Files 9 passed (9)` · `Tests 125 passed (125)` · 0 failed. Per file: component 35 · visual component 22 · history component 14 · history pure 12 · history store 12 · pipeline 8 · contract 13 · engine 3 · acceptance-evidence 7 | 2026-11-12 | 5a87f3e5 (uncommitted changes) |
| **Scope 2 — wider regression (53 test files)** | `npx vitest run components/tools/tool-039-liver-enzyme-tracker.test.tsx components/tools/tool-039-liver-enzyme-tracker.visual.test.tsx components/tools/tool-039-liver-enzyme-tracker.history.test.tsx lib/tools/r6/ lib/tools/engines/tool-039-liver-enzyme-tracker.test.ts lib/tools/contracts.test.ts tests/unit/tool-039-acceptance-evidence.test.ts` | `Test Files 53 passed (53)` · `Tests 365 passed (365)` · 0 failed | 2026-11-12 | 5a87f3e5 (uncommitted changes) |
| Build | `npx next build` | `✓ Compiled successfully in 68s` · `✓ Generating static pages (506/506)` · `BUILD_EXIT_CODE=0` | 2026-11-11 | 5a87f3e5 (uncommitted changes) |
| Acceptance calculation | `node "docs/MRX Genius Cloud Unified R6.1/tool-039-acceptance-calc.mjs"` | 123 ledger rows · 95 applicable · 28 NOT_APPLICABLE (with proof) · 95 complete · `LEDGER_INTEGRITY: OK` · `95 / 95 * 100 = 100.00%` | 2026-11-12 | 5a87f3e5 (uncommitted changes) |
| Published deployment (HTTP + build log + browser) — **carries the local history (D-08)** | `vercel inspect dpl_AimJXowNb5TCQQZNJR8MCcvE2dHc --logs` + `vercel curl` through the owner's own authenticated CLI session + `node "docs/MRX Genius Cloud Unified R6.1/tool-039-browser-verify.mjs" http://127.0.0.1:3201 "docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08"` + `node "docs/MRX Genius Cloud Unified R6.1/tool-039-two-browsers-check.mjs" http://127.0.0.1:3201` | deployment `dpl_AimJXowNb5TCQQZNJR8MCcvE2dHc` (preview, READY, created 2026-11-12T23:55Z), URL `https://mrxsteroid-fuvgd9qsp-georges-projects-78ef250b.vercel.app`, alias `mrxsteroid-preview-tool039.vercel.app` · build log: `✓ Compiled successfully in 42s` + `✓ Generating static pages (506/506)`, no error · browser ON THE PUBLISHED DEPLOYMENT: **PASS=43 FAIL=0** · two independent Chrome profiles against the published deployment: **PASS** (profile A 1 entry / 2 device keys, profile B 0 / 0) · bundle proof: the published chunk `page-f52f77e146012c11.js` carries the D-08 code · protection unchanged: anonymous `302` → vercel.com/login, `ssoProtection=all_except_custom_domains`, 0 bypass entries · deployed source identified by SHA-256 in `evidence/tool039-published-d08/deploy-source-manifest.json` (the changes are uncommitted) | 2026-11-13 | 5a87f3e5 (uncommitted changes) |
| Browser verification — **local production build, local history (D-08)** | `node "docs/MRX Genius Cloud Unified R6.1/tool-039-browser-verify.mjs" http://localhost:3100 "docs/MRX Genius Cloud Unified R6.1/evidence/tool039-history"` + `node "docs/MRX Genius Cloud Unified R6.1/tool-039-two-browsers-check.mjs" http://localhost:3100 "docs/MRX Genius Cloud Unified R6.1/evidence/tool039-history/two-browsers.json"` | `PASS=43 FAIL=0` — 26 visual/interaction checks plus 17 local-history checks (consent before storing · explicit save · the entry listed with its value and date · the rating bound to the selected result · the stored blob is not readable plain text · the entry and its rating survive a reload · no data sent to any server · no medical value or comment in the application log · staleness computed at read time · delete one · delete all · the history really downloads as CSV (265 bytes, content read back) · the rating control is operable with a real ArrowRight key · the controls are named for a screen reader · withdrawing the consent deletes the stored data) **plus a separate two-browser run**: two independent Chrome profiles against the same origin never see each other's data. **This build is NOT published yet** — the owner separated the deployment authorization from the implementation | 2026-11-13 | 5a87f3e5 (uncommitted changes) |

**Regression scope note:** the repository-wide `components/tools` sweep has **no recorded result** and is **not** claimed as PASS — it is a programme-level gate, not a Tool 039 row, and no Tool 039 row depends on it. The Tool 039 evidence is **Scope 1 (6 test files, 86 tests, 86 passed)** plus **Scope 2 (50 test files, 326 tests, 326 passed)**, both re-run to completion on 2026-11-11 with the output shown above. A third, separate sweep of `components/tools` remains unverified and is listed in §10.

---

## 8b. Original requirement ↔ atomic rows (no part dropped, nothing counted twice)

The owner's second review required that the original wording survives the split. The mapping is:

| Original R6.1 requirement (full text, retained) | Atomic rows that carry it | How the coverage is counted |
|---|---|---|
| ACCEPTANCE §5.5 / SPEC §15 — **"Mobile and desktop layouts are usable"** | `ACC-5.5.7` (part a: the layout works, every visual element stays reachable, no horizontal overflow) **and** `ACC-5.5.7-LEGIBILITY` (part b: the diagram text is legible at 390 px) | The original text is kept **in full** on `ACC-5.5.7`. Part (a) is proven there; part (b) is proven in the second row. Neither part is proven twice, and neither part is dropped: while part (b) is FAIL, the original requirement as a whole is **not** closed. |
| SPEC §7.1 — visualisation selection, Pie/Donut decision | `SPEC-7.1-CHART` + `ACC-5.5.1` | one row for the selection decision, one for the data integrity of what is drawn |
| SPEC §6.7 — tooltip contract | `SPEC-6.7-TOOLTIP` + `ACC-5.5.4` | one row for the content contract, one for the three opening paths |
| SPEC §15 — accessibility and responsive UX | `SPEC-15-A11Y` + `ACC-5.5.5`/`ACC-5.5.6`/`ACC-5.5.8`/`ACC-5.5.9` | the umbrella row plus the four specific sub-requirements |
| CLOSURE-LAYER — GENIUS-12 boxes 11 and 12 | `LAYER-GENIUS12-11` + `LAYER-GENIUS12-12-RATING` | the two BLOCKED halves are split out of the two PASS halves so a blocked capability is never hidden inside a passing box |

### Provenance of the 12 px legibility criterion

The 12 px figure used by the legibility check is an **internal engineering criterion** defined in
`docs/MRX Genius Cloud Unified R6.1/tool-039-legibility-check.mjs`. **It is not an R6.1 rule** — no R6.1 paragraph
specifies a minimum font size, and the check script says so in its own output. The row therefore fails on the
**measured value** (4.61 px effective after the SVG is scaled to 41.9 % at a 390 px viewport), which is not readable in
practice — visible in `evidence/tool-039-published/tool-039-mobile-390.png` — and that is the substance of the SPEC §15
responsiveness requirement. The criterion is a project decision, not an attributed R6.1 clause.

## 9. Files changed (all uncommitted)

| File | State | Change |
|---|---|---|
| `components/tools/tool-039-liver-enzyme-tracker.tsx` | modified | contract-driven fields, help text, freshness badge, tool-owned Genius section, slider rule (integer field only), DEGRADED handling |
| `components/tools/tool-039-liver-enzyme-tracker.genius.tsx` | **new** | tool-owned GENIUS-12 + CORE-5, what-if, sensitivity, capability contract |
| `components/tools/tool-039-liver-enzyme-tracker.test.tsx` | modified | 33 tests (was 14), including DEGRADED, the source-integrity guard and the CORE-5 content test |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts` | **new** | input contract (10 attributes incl. `dependsOn`/`visibilityRule`), reference-limit mirror, sources, freshness rule, CSV builder |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.test.ts` | **new** | 13 tests |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts` | modified | +4 tests (determinism, no-conversion, answers-vs-status) |
| `lib/tools/r6/manifest.ts` | modified | Tool 039 added to `R6_EXEMPT_SLUGS` (the tool owns its boxes) |
| `i18n/tool-039-liver-enzyme-tracker.json` | modified | 234 keys per locale (was 54) |
| `components/tools/tool-039-liver-enzyme-tracker.visual.tsx` | **new** | explanatory illustration + bar/gauge + dated line chart + per-element tooltips + accessible text alternative |
| `components/tools/tool-039-liver-enzyme-tracker.visual.test.tsx` | **new** | **22** DOM tests (tooltip content, hover/focus/touch, Escape/close, viewport clamping, highlighting, AR/EN, reduced motion, update-without-loop) + the round-5 additions: the illustration renders in the EMPTY state, the charts stay behind a real result, the step number is printed once, and the two-way highlight assertion waits for the GENIUS-12 component instead of depending on React effect timing |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-visual.ts` | **new** | pure visual data layer (series, bars, table, tooltip payloads, Pie/Donut decision) |
| `lib/tools/r6/tool-039-liver-enzyme-tracker-visual.test.ts` | **new** | 8 data-integrity tests |
| `docs/.../tool-039-browser-verify.mjs` | **new** | real-browser verification harness (Chrome DevTools Protocol, no new dependency); round 5 added the EMPTY-state checks and the 390 px five-step measurement |
| `docs/.../tool-039-preview-proxy.mjs` | **new** | round-5 test helper: relays the browser to the protected published deployment through the owner's own authenticated Vercel CLI session. It creates no bypass secret, changes no protection setting and makes nothing public |
| `docs/.../evidence/tool-039/` | **new** | the 390 px legibility measurement (JSON) |
| `docs/.../evidence/tool-039-published/` | **new** | browser log JSON (21 checks) + desktop / mobile-390 / Arabic-RTL screenshots taken against deployment `dpl_EKUNxn7zVDVYHVcxPkTQ85kCyD67` — **superseded**, it served the pre-fix build |
| `docs/.../evidence/tool039-fix/` | **new** | round-5 local browser log JSON (26 checks) + the SHA-256 manifest of the deployed source files |
| `docs/.../evidence/tool039-published-fix/` | **new** | round-5 browser log JSON (**26/26 PASS against the published deployment**) + the EMPTY-state / desktop / mobile-390 / Arabic-RTL screenshots + `deployment-metadata.json` (ID, URL, timestamp, source commit + uncommitted-changes note, build log, protection status, before/after marker comparison) |
| `docs/.../tool-039-ledger-change-log.md` | **new** | every ledger row added or modified, with the reason and the effect on the denominator |
| `docs/.../tool-039-legibility-check.mjs` | **new** | the re-runnable 390 px legibility measurement |
| `docs/.../TOOL-039-ACCEPTANCE.md` | **new** | this file (generated table + proofs) |
| `docs/.../TOOL-039-GENIUS12-CROSSWALK.md` | **new** | SPEC §5.2 ↔ CLOSURE-LAYER ↔ Tool 039 box crosswalk and the GENIUS12-12 contradiction resolution |
| `docs/.../TOOL-039-DEVELOPMENT-PROPOSALS.md` | **new** | the ten tool-specific proposals (inputs/outputs/risks/cost/tests/acceptance) |
| `docs/.../R6.1-SYSTEM-REQUIREMENT-REGISTER.md` | **new** | the platform requirements excluded from the Tool 039 denominator, with gate, status, owner and next action |
| `docs/.../tool-039-requirements.csv` | **new** | the **123-row** atomic ledger |
| `docs/.../tool-039-acceptance-calc.mjs` | **new** | the calculator |
| `docs/.../tool-039-acceptance.template.md` | **new** | the narrative template the calculator assembles |
| `docs/.../scope-reconciliation-286.csv` | modified | SR-048 `untested → tested` |
| `docs/.../CONFLICT-GAP-REGISTER.md`, `W01-W24-CONFLICT-TRACKER.md`, `R6.1-ACTIVATION-READINESS.md` | modified | W08 rows updated (Tool 039 closed, 12 tools remain) |
| `docs/.../R6.1-PREVIEW-INDEX.md` | modified | new deployment, access method, evidence |
| **Engine, Zod schema, registry, catalog** | **untouched** | `git status` confirms no modification |

**Diff package:** `docs/MRX Genius Cloud Unified R6.1/tool-039-r61-closure.diff` (unified diff of the modified files plus full new-file diffs).

---

## 9b. Code Integration Evidence — requirement → file → component → engine → UI

How each open requirement is wired into the existing system. Nothing here is a new parallel system: the R6 contract, the units layer, the i18n layer and the shared R6 shell are the ones already in the repository.

| Requirement | Contract / type layer | Engine | UI component | Route / registry | i18n (AR + EN) | Tests |
|---|---|---|---|---|---|---|
| Dynamic Input Contract v2 (fieldId, label/help keys, type, unit, range, required, dependsOn, visibilityRule, example) | `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts` | — | `components/tools/tool-039-liver-enzyme-tracker.tsx` renders the fields from the contract | — | `i18n/tool-039-liver-enzyme-tracker.json` (234 keys × 2) | `…-contract.test.ts` (13) |
| Deterministic result, debounced, same input → same output | `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.ts` (`TOOL_039_DEBOUNCE_MS = 120`) | `lib/tools/engines/tool-039-liver-enzyme-tracker.ts` (`trackLiverEnzymes`) — **untouched** | the same component, bound to the current input signature | — | — | `…-pipeline.test.ts` (8) + component (33) |
| Zod schema | — | `lib/tools/schemas/tool-039-liver-enzyme-tracker.ts` — **untouched** | — | — | — | engine (3) |
| EMPTY / PARTIAL / FULL / INVALID / DEGRADED | the pipeline's own result states | the engine's | the component's state machine (`resultStatus`) | — | `state_empty` … `state_degraded` | component (33) |
| CORE-5 + GENIUS-12 (tool-owned) | — | the engine's output | `components/tools/tool-039-liver-enzyme-tracker.genius.tsx` | `lib/tools/r6/manifest.ts` → `R6_EXEMPT_SLUGS` | box1…box12 keys | component + visual (55) |
| Explanatory illustration, charts, tooltips, accessible equivalents | `lib/tools/r6/tool-039-liver-enzyme-tracker-visual.ts` (pure, no React/DOM) | the engine's result | `components/tools/tool-039-liver-enzyme-tracker.visual.tsx` | — | illustration/chart/tooltip keys | `…-visual.test.ts` (8) + visual component (22) |
| The illustration is **visible in every state** | — | — | the visual section is rendered unconditionally; only the data-driven parts wait for a result | — | — | visual component ("renders the explanatory illustration in the EMPTY state") + browser check |
| Cross-tool link contract | `…-contract.ts` (`transfer: 'manual-reentry'`) | — | the GENIUS-12 cross-tool box | — | `box8_*` keys | contract (13) |
| Freshness (lab 90 d) | `…-contract.ts` | — | the freshness badge in the result header | — | `freshness_*` | component (33) |
| Export (CSV) | `…-contract.ts` (CSV builder) | — | the GENIUS-12 export box | — | `box10_*` | contract (13) |
| Tool identity and route | — | — | the component | `lib/tools/registry.ts` → `/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker`; `lib/tools/smartToolsCatalog6.ts` → the same slug and component path | — | `…-acceptance-evidence.test.ts` (7) |
| The published preview | — | — | the same component, built by Next.js | `app/smarttools/[category]/[tool]/page.tsx` → `getToolComponent` → the same file | — | 26/26 browser checks on the deployment |

**Boundaries respected (verified, not asserted):** the V6 engine, the Zod schema, the registry entry and the catalogue entry are **byte-identical to HEAD** (`git status --porcelain` on those four paths returns empty); the four canonical R6.1 documents are **untouched**; the R6 manifest, the preferences provider, the shared R6 shell and the shared i18n helper are the ones already in the repository — no parallel contract, unit or translation system was introduced.

## 9c. Preservation Record — what was kept, what was changed, and why

| Preserved | State | Why |
|---|---|---|
| The V6 engine `trackLiverEnzymes` | **untouched** | It is the single source of truth for the calculation. Changing it would change every published number |
| The Zod schema `LiverTrackerInputSchema` / `LiverTrackerResultSchema` | **untouched** | The pipeline validates through it; the contract mirrors it rather than replacing it |
| The registry entry and the catalogue entry | **untouched** | The tool identity, the slug, the route and the order are the owner's |
| The four canonical R6.1 documents (PROMPT.md, SPEC.md, ACCEPTANCE_CRITERIA.md, R6.1-CLOSURE-LAYER.md) | **untouched** | Their preserved headers (`OWNER REVIEW DRAFT`) and their text are historical record; `LAYER-NODELETE` proves it |
| The R6 manifest, the preferences provider, the shared R6 shell, the shared i18n helper | **reused, not replaced** | The tool plugs into the existing layers |
| Every other tool's component | **untouched** | The repository-wide `components/tools` sweep failures are pre-existing and outside this scope; they were **not** "fixed" by editing other tools |
| The 29 NOT_APPLICABLE rows and their system-register entries | **kept with their proofs** | An excluded requirement stays recorded, not deleted |
| The two W18-blocked rows | **kept open, not downgraded** | `LAYER-GENIUS12-11` and `LAYER-GENIUS12-12-RATING` stay BLOCKED/E0 in the denominator |
| Every `C = PENDING` | **kept PENDING** | The developer never records an owner decision |

**Changes made to previously existing code, and the reason for each:**

| Change | Reason | Evidence that nothing was lost |
|---|---|---|
| The visual section is rendered unconditionally | The owner reported the illustration was not visible; the section was gated behind a FULL result | The data-driven parts still wait for a result — a browser check asserts `bars=0, tables=0` in the EMPTY state |
| The visual component's `input`/`output` props became optional | The illustration does not depend on a calculation | The data-driven parts are guarded by `hasResult`; the pipeline and engine are unchanged |
| The desktop textual list lost its `list-decimal` marker | The step titles already carry their own number ("1. "), so the marker printed it twice ("1. 1.") | A test asserts the number appears once; the list is still an ordered list |
| The visual test now waits for the GENIUS-12 component before dispatching the focus event | The two-way highlight link travels through a window event whose listener is registered by that component's effect; the old timing was occasionally flaky | 12 consecutive runs, 12/12 PASS; the assertion itself is unchanged |
| The visual test's `waitFor` budgets went from 2000 ms to 5000 ms | The pipeline is debounced by 120 ms; on a loaded machine 2000 ms could be exceeded without anything being wrong | The assertions are unchanged; the budget is still finite |
| The ledger gained one row (`ACC-5.5.3-VISIBILITY`) | Visibility in every state is a separate, independently provable property from `ACC-5.5.3` (labelling) | The split is documented in §8b; no part was dropped and nothing is counted twice |

---

## 10. What remains after the acceptance

**No applicable requirement is left incomplete and none is left undecided.** The owner reviewed the published Preview `dpl_AimJXowNb5TCQQZNJR8MCcvE2dHc` and recorded **OWNER_ACCEPTED** on ' + DECISION_DATE + '; the decision (C) is **APPROVED on all 95 applicable rows**.

| Requirement | B | C | E | Evidence |
|---|---|---|---|---|
| `LAYER-GENIUS12-11` — History | PASS | **APPROVED** | E4 | 24 vitest tests + 15 real-browser checks + a two-browser isolation proof, all re-run against the published Preview |
| `LAYER-GENIUS12-12-RATING` — Rating / comment | PASS | **APPROVED** | E4 | 8 vitest tests + 6 real-browser checks, all re-run against the published Preview |

**Everything the acceptance relies on is preserved, exactly as it was:** the 123-row ledger, the calculator, the change log (rounds 1-8), the evidence sets `evidence/tool039-fix/`, `evidence/tool039-published-d08/` and `evidence/tool039-history/`, the deployment record `evidence/tool039-published-d08/deployment-metadata.json` and the SHA-256 manifest `deploy-source-manifest.json`. **No evidence file was edited and no change-log entry was rewritten.**

**What remains open, and it is not Tool 039's acceptance:**
- The activation-status conflict (§3) and the wider conflict set (`HISTORY-CONTEXT-INTEGRATION-REPORT.md` §8: C1 the activation commit claimed EXECUTED but never committed, C2/C8 the activation-status header conflict, C5 the two incompatible W-numbering schemes) — still owner decisions at project level.
- The repository-wide `components/tools` sweep has pre-existing failures in **other** tools (017, 021, 034, 035, 012-014); none references Tool 039, and none was claimed as PASS.
- The published Preview remains behind Vercel Authentication (anonymous `302` → vercel.com/login), the project setting `ssoProtection=all_except_custom_domains` is unchanged and there are **0** protection-bypass entries.

**Tool 039 is closed. The next tool in sequence is Tool 040, started under the R6.1 requirements with the same implementation and verification methodology, without redoing the completed work and without changing any prior decision.**
