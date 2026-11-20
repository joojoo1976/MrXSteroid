# TOOL 041 — PHASE 1 CONTENT SPECIFICATION: CORE-5 / GENIUS-12

**Tool:** Tool 041 — Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` — **NOT ACCEPTED** — **NOT CLOSED**

**Artifact date:** 2026-11-14

**Phase:** 1 of 6 (owner priority: CORE-5 and GENIUS-12, define the required content)

**Implementation state:** **SPECIFICATION ONLY — NOTHING IS CODED.** This document defines exactly what each box
must contain and where each value comes from. It does not change the engine, the schema, the pipeline or the UI.

---

## 0. Phase 1 boundary

**In scope:** the information architecture and content contract for CORE-5 (C1–C5) and the twelve GENIUS boxes,
plus the structural AR/EN keys and the acceptance tests for group A.

**Out of scope (later phases):** medical sign-off of clinical wording (Phase 3), full localization pass (Phase 4),
EMPTY/DEGRADED and accessibility execution (Phase 5), boundary/regression suite (Phase 6). Phase 1 builds the
**slots** for those and marks clinical copy `PENDING_MEDICAL_REVIEW`.

**Hard rule:** no clinical value, threshold, citation or recommendation may be invented in Phase 1. If the approved
input does not exist yet, the box renders `NOT_AVAILABLE` with a reason, not a guess.

---

## 1. Sources of truth available today

### 1.1 Engine result (`monitorHematocrit`)

| Field | Type | Phase 1 use |
|---|---|---|
| `latest_hct_pct` | number | C1 value, KPI strip, inputs summary |
| `baseline_hct_pct` | number | C1 secondary value, KPI strip |
| `slope_per_30d` | number | C1 trend, C2, KPI strip |
| `band` | `normal \| borderline \| high \| very-high` | C1 band label, C3, C5 |
| `projected_threshold_date` | ISO date \| null | C1 projection, C2, KPI strip |
| `donate_eligible` | boolean | C1/C3 supporting statement (wording pending Phase 3) |
| `warnings` | string[] (codes) | C3, mapped to localized messages in Phase 4 |

### 1.2 Provenance (`buildHematocritMonitorOutput`)

| Field | Current value | Phase 1 use |
|---|---|---|
| `unit` | `percent` | C1 unit |
| `confidence` | `null` | C1 confidence → explicit `not assessed` label |
| `dataQuality` | `not_assessed` | C2 uncertainty |
| `referenceRange` | `{ low: 0, high: 70, source: 'hematocrit monitor' }` | **display bounds only** until Phase 3 supplies the sex-specific clinical band |
| `recordedAt`, `timezone`, `source` | caller-supplied | C2 assumptions, box 8 freshness |

### 1.3 Engine constants (currently module-private)

| Constant | Male | Female | Use |
|---|---:|---:|---|
| `UPPER` (lab upper reference) | 50.0 | 44.5 | C2 formula, band explanation |
| `INTERVENE` (intervention line) | 54.0 | 48.0 | C2 formula, C3 red flag, C5 escalation |
| Band rule | `> INTERVENE` very-high; `> UPPER+2` high; `> UPPER` borderline; else normal | same | C2 |
| Projection horizon | 180 days, only when `slope > 0` and `latest < INTERVENE` | same | C2 |
| Donation rule | `latest >= INTERVENE - 1` | same | C1/C3, wording pending |
| Rising-trend flag | `slope > 1.5` pp/30d | same | C3 |

**Decision required (OD-12):** either export a read-only `HEMATOCRIT_FORMULA_META` from the engine (no math change),
or keep the engine untouched and add a content module plus a sync test that proves the displayed numbers match
engine behavior. **Default if not approved: the second option — do not touch the engine.**

### 1.4 Registry and catalog

`requireTool()` and `getToolNeighbors()` supply tool identity, access tier, unit-system default and the previous/next
tool. They supply no clinical content.

---

## 2. CORE-5 contract (C1–C5)

### C1 — Primary Result

| Element | Source | Required render | Medical review |
|---|---|---|---|
| Latest HCT value | `result.latest_hct_pct` | number with one decimal and `%` | No (value) |
| Unit | `provenance.unit` | `%` | No |
| Reference range | Phase 3 approved band, else display bounds | `50–54%` style band, or `input display bounds 20–70%` clearly labelled | **Yes** (clinical band + wording) |
| Band classification | `result.band` → localized label | `normal / borderline / high / very high` | **Yes** (labels) |
| Confidence | `provenance.confidence` (null) | explicit `Confidence: not assessed` | No |
| Trend | `result.slope_per_30d` | `+x.x pp / 30 days` | No |
| Projection | `result.projected_threshold_date` | date, or `not projected within 180 days` | **Yes** (wording) |
| Baseline | `result.baseline_hct_pct` | secondary line | No |

C1 must never show the `0–70` display bounds as if they were a clinical reference range. Until Phase 3 signs a
sex-specific band, the label is explicitly `display bounds`.

### C2 — How Calculated

| Element | Source | Required render | Medical review |
|---|---|---|---|
| Slope method | engine formula | `least-squares trend, percentage points per 30 days` | **Yes** (wording) |
| Band thresholds | engine constants | male `50 / 54`, female `44.5 / 48`, with the `+2` high band | **Yes** (sources) |
| Projection rule | engine | `linear crossing of the intervention line, only within 180 days` | **Yes** |
| Donation rule | engine | `latest ≥ intervention − 1`, labelled `not a clinical eligibility decision` until reviewed | **Yes** |
| Actual inputs | user input | readings used (count, dates, values), sex, on-cycle, weeks remaining | No |
| Assumptions | static | readings sorted by draw date; unparseable dates dropped; linear trend | **Yes** |
| Uncertainty | provenance | `confidence: not assessed`, `dataQuality: not_assessed`, slope is an estimate | **Yes** |

C2 must show **actual entered inputs**, never the invented component defaults.

### C3 — Safety and Warnings

| Element | Source | Required render | Medical review |
|---|---|---|---|
| Warning codes | `result.warnings` | localized message per code: `on_cycle_elevated_hct`, `rising_trend_30d`, `above_intervention_line_seek_physician`, `no_valid_readings` | **Yes** |
| Red flags | derived from band + engine | above intervention line; `very-high` band; rapid rise | **Yes** |
| Contraindications | **none approved** | must not be invented; omit with a reason or use approved text only | **Yes** |
| Referral | Phase 3 approved text | urgency + who to contact + when | **Yes (mandatory)** |

If no warning applies, C3 renders an explicit `no warnings triggered` state — not an empty box.

### C4 — Evidence and Sources

| Element | Source | Required render | Medical review |
|---|---|---|---|
| Name | Phase 3 evidence file | title | **Yes** |
| Publisher | Phase 3 evidence file | organisation | **Yes** |
| Date | Phase 3 evidence file | publication/review date | **Yes** |
| Evidence level | Phase 3 evidence file | agreed level label | **Yes** |
| Link | Phase 3 evidence file | URL | **Yes** |

There is **no approved source in the repository today**. Phase 1 therefore renders C4 as
`NOT_AVAILABLE — no approved source recorded` and must not fabricate a citation. The structured evidence file is a
Phase 3 deliverable.

### C5 — Next Actions

| Element | Source | Required render | Medical review |
|---|---|---|---|
| One next step | band-driven rule, Phase 3 approved | single action | **Yes** |
| What not to do | Phase 3 approved | explicit prohibition | **Yes** |
| When to seek care | band + intervention line | urgency statement | **Yes (mandatory)** |

Phase 1 implements the C5 **slot and band mapping**; the sentence text is a placeholder marked
`PENDING_MEDICAL_REVIEW` until Phase 3 signs it.

---

## 3. GENIUS-12 contract

The order is fixed. Every box is always present; a box with no valid content shows `NOT_AVAILABLE` with a reason.

| # | Box | Content contract | Source | Equals | Phase 1 behavior | Medical review |
|---:|---|---|---|---|---|---|
| 1 | KPI Strip | latest, band, slope, next crossing | engine | — | implement | Yes for labels |
| 2 | Primary Result | full C1 | engine + provenance | C1 | implement | Yes |
| 3 | Formula / How Calculated | full C2 | engine + input | C2 | implement structure | Yes |
| 4 | Inputs Summary | actual readings table + sex, on-cycle, weeks; no defaults | input state | — | implement | No |
| 5 | What-If | re-run pipeline with one value changed; show delta | pipeline | — | implement scenarios | No |
| 6 | Sensitivity | deterministic probes: latest ±1 pp, sex change, on-cycle toggle; report which flips band/projection | pipeline | — | implement; if no probe changes the outcome, state that honestly | No |
| 7 | Warnings / Safety | full C3 | engine + Phase 3 | C3 | implement slot | Yes |
| 8 | Cross-Tool Links | prev/next tool + related reading; freshness = `calculatedAt`; no data transfer | registry | — | implement | No |
| 9 | Evidence / Sources | full C4 | Phase 3 evidence file | C4 | render NOT_AVAILABLE until approved | Yes |
| 10 | Export | client-side CSV of inputs + result; no secrets | input + result | — | implement CSV | No |
| 11 | History | prior results with freshness | — | — | **NOT_AVAILABLE** — `blocked_w18_storage_decision` | No |
| 12 | Feedback / Next Actions | full C5 + 1–5 rating | C5 + component state | C5 | implement C5; rating decision below | Yes for C5 |

### 3.1 Compact mode

Compact mode shows exactly the closure CORE-5: boxes **2, 3, 7, 9, 12**. Full mode shows all twelve. Both modes
reuse the same renderers, so C1 is identical in both.

### 3.2 Box 6 — Sensitivity honesty rule

A sensitivity claim is only valid if the probe actually changes the result. Phase 1 runs the probe; if no single
input change flips the band or the projection, box 6 states `no single input change flips the outcome in this
range` rather than inventing a "most influential input".

### 3.3 Box 11 — History

History requires storage, which W18 has not approved. The box renders `NOT_AVAILABLE` with the reason
`blocked_w18_storage_decision`. It never shows fake history and never writes to storage.

### 3.4 Box 12 — rating

The requirement includes a 1–5 rating. With no storage, a rating cannot persist. Phase 1 default: the rating is
**session-only and explicitly labelled "not saved"**. If the owner rejects a non-persistent rating, box 12 renders
`NOT_AVAILABLE — rating requires the W18 storage decision` and C5 still renders.

---

## 4. State model interaction

| State | Trigger | Box behavior |
|---|---|---|
| `EMPTY` | no readings entered, or no result | all boxes present in fixed order; C1/C2/C3/C5 show an empty prompt; no invented values |
| `PARTIAL` | fewer than 2 readings, or a required field missing | inputs summary shows only entered values; result boxes show `waiting for input`; calculation not run |
| `FULL` | valid input and successful pipeline run | all boxes render from the result |
| `DEGRADED` | engine returns `no_valid_readings` or all dates unparseable | C1 shows no numbers; C3 shows `no_valid_readings`; C5 asks to re-enter dates; defined banner |
| `INVALID` | schema validation fails | no result; field-specific error in an assertive live region |

`STATE-01`, `STATE-02`, `STATE-05`, `STATE-06` and `STATE-10` are group E rows; Phase 1 defines the contract but does
not implement the states.

---

## 5. Arabic / English key inventory (proposed)

Phase 1 adds **non-clinical structural keys** in both languages. Clinical values (band labels, warning sentences,
red flags, referral, C5 text, evidence text) are added now as keys but their AR/EN values stay
`PENDING_MEDICAL_REVIEW` until Phase 3/4.

| Group | Keys |
|---|---|
| CORE titles | `core_c1_title`, `core_c2_title`, `core_c3_title`, `core_c4_title`, `core_c5_title` |
| C1 | `latest`, `baseline`, `unit_pct`, `reference_range`, `display_bounds`, `confidence`, `confidence_not_assessed`, `trend_per_30d`, `projected_date`, `not_projected` |
| Bands | `band_normal`, `band_borderline`, `band_high`, `band_very_high` |
| C2 | `formula_slope`, `formula_band`, `formula_projection`, `formula_donate`, `assumptions`, `uncertainty`, `inputs_used` |
| C3 | `warnings_title`, `warning_on_cycle_elevated_hct`, `warning_rising_trend_30d`, `warning_above_intervention_line_seek_physician`, `warning_no_valid_readings`, `no_warnings`, `red_flags`, `referral_title` |
| C4 | `evidence_title`, `evidence_none`, `evidence_pending_review`, `evidence_name`, `evidence_publisher`, `evidence_date`, `evidence_level`, `evidence_link` |
| C5 | `next_step`, `do_not`, `seek_care`, `not_a_diagnosis` |
| GENIUS | `box1_title` … `box12_title`, `genius_title`, `genius_title_compact`, `genius_compact`, `genius_full` |
| Box 4 | `input_readings`, `input_reading_n`, `input_sex`, `input_on_cycle`, `input_weeks` |
| Box 5/6 | `whatif_title`, `whatif_delta`, `sensitivity_title`, `sensitivity_no_effect` |
| Box 8 | `cross_tool_title`, `cross_tool_freshness` |
| Box 10 | `export_title`, `export_csv`, `export_disclaimer` |
| Box 11/12 | `history_title`, `history_blocked_w18`, `feedback_title`, `rating_label`, `rating_not_saved` |
| States | `state_empty`, `state_partial`, `state_full`, `state_degraded`, `state_invalid` |

Existing keys (`tool_name`, `readings`, `add_reading`, `hct`, `date`, `sex`, `male`, `female`, `on_cycle`,
`weeks_remaining`, `band`, `trend`, `projected`, `donate`, `warnings`) are retained unchanged.

**Rule:** no raw engine code (`very-high`, `on_cycle_elevated_hct`, …) may reach the DOM. Codes are mapped to keys
before render.

---

## 6. Acceptance tests for Phase 1 (group A)

| Test | Covers |
|---|---|
| C1 renders latest, unit, band, range-or-display-bounds, confidence `not assessed` | `CORE-01`, `G12-03`, `STATE-09` |
| C2 renders formula text and actual entered inputs, with no invented defaults | `CORE-02`, `G12-04` |
| C3 renders one message per warning code, plus red flags and referral slot | `CORE-03`, `G12-08` |
| C4 renders `NOT_AVAILABLE — no approved source` while no source exists | `CORE-04`, `G12-10` |
| C5 renders next step / do-not / seek-care slots | `CORE-05`, `G12-13` |
| twelve boxes render in fixed order via `data-r6-core` attributes | `G12-01` |
| compact mode shows exactly boxes 2, 3, 7, 9, 12 | `CORE-06` |
| box 2 === C1, box 3 === C2, box 7 === C3, box 9 === C4, box 12 === C5 | `G12-03`, `G12-04`, `G12-08`, `G12-10`, `G12-13` |
| KPI strip summarises the same result | `G12-02` |
| inputs summary lists only entered values | `G12-05` |
| what-if re-runs the same pipeline and reports the delta | `G12-06` |
| sensitivity reports a real flip or states that none occurs | `G12-07` |
| cross-tool links carry `calculatedAt` freshness | `G12-09` |
| export CSV contains inputs + result and no secrets | `G12-11` |
| history renders `NOT_AVAILABLE — blocked_w18_storage_decision` | `G12-12` |
| no storage/network/session call in the new code | `G12-12`, `NA-01`…`NA-06` |
| AR/EN structural keys have parity and no raw codes in the DOM | `CORE-07` |
| keyboard tab order reaches every box control | `CORE-08` |

---

## 7. Files that Phase 1 would touch (only after authorization)

| File | Change |
|---|---|
| `components/tools/tool-041-hematocrit-monitor.genius.tsx` | **new** — twelve boxes, CORE-5 renderers, compact mode |
| `components/tools/tool-041-hematocrit-monitor.tsx` | render the genius component; remove invented defaults |
| `i18n/tool-041-hematocrit-monitor.json` | structural keys, AR/EN parity |
| `lib/tools/r6/manifest.ts` | add Tool 041 to `R6_EXEMPT_SLUGS` **only if** the tool-owned boxes fully replace the shared shell |
| `lib/tools/r6/tool-041-hematocrit-monitor-content.ts` | **new (default option)** — formula metadata + evidence/next-action slot definitions |
| `tests/unit/tool-041-hematocrit-monitor-genius.test.tsx` | **new** — the acceptance tests above |

**Not touched in Phase 1:** engine math, thresholds, schema semantics, pipeline behavior, shared shell logic,
database, Supabase, W18, session, storage.

---

## 8. Open decisions for the owner

| ID | Decision | Default if not answered |
|---|---|---|
| `OD-12` | Export read-only formula metadata from the engine, or duplicate it in a content module with a sync test? | content module + sync test; engine untouched |
| `OD-13` | C4 evidence: name the medical reviewer and the approved source set now, or ship `NOT_AVAILABLE` until Phase 3? | `NOT_AVAILABLE` until Phase 3 |
| `OD-14` | C5 and C3 wording: approve a placeholder that is visibly `PENDING_MEDICAL_REVIEW`, or hold those boxes at `NOT_AVAILABLE`? | hold at `NOT_AVAILABLE` |
| `OD-15` | Box 12 rating: session-only "not saved", or `NOT_AVAILABLE` until W18? | session-only, labelled "not saved" |
| `OD-16` | Does the tool-owned GENIUS component fully replace the shared shell for Tool 041 (add to `R6_EXEMPT_SLUGS`)? | yes, if all twelve boxes render with real content |

---

## 9. What this specification does not do

- It does not code any box.
- It does not change the engine, schema, pipeline or shared shell.
- It does not invent clinical wording, thresholds or citations.
- It does not mark any group A row complete.
- It does not start Phase 2–6.
- It does not change `76 / 132 = 57.58%`.

**Status remains:** `OWNER_REVIEW` — NOT ACCEPTED — NOT CLOSED.
