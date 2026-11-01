# Tool 111 feature-parity audit — tools 112–121

## Evidence basis

Compared components, schemas, engines, adapters and catalog-backed routes for existing Nutrition tools 112–117 and Training & Recovery tools 118–121 against the 14 observable Tool 111 capabilities in `docs/GENIUS_INTELLIGENCE_V3/GENIUS_TOOL_STANDARD_V3.md`.

This is source inspection, not browser proof. `PASS` means source evidence exists; it does not mean the feature has passed a UI interaction check.

## Aggregate matrix

| Ref | Feature | Current evidence in 112–121 | Parity state |
|---|---|---|---|
| T111-01 | Component boundary and canonical route | Components, schemas, engines, adapters and registry/category routes exist for all ten. | `PASS — source` |
| T111-02 | Strongly typed state | Draft input and result types are present. Tool 111 itself still has an `any` output-state debt and should not be copied there. | `PASS with quality debt in reference` |
| T111-03 | Validation | Zod schemas run before result calculation. Most UIs show a generic invalid message rather than field-level errors. Direct engine boundary validation varies. | `PARTIAL` |
| T111-04 | Explicit calculate and reset | These components calculate reactively from form state. No explicit calculate/reset workflow was established in the inspected forms. | `PARTIAL — live calculation` |
| T111-05 | Unit-system toggle | Several tools accept or display physical quantities, but the forms are predominantly fixed to metric and do not provide a user-facing conversion toggle. Non-dimensional tools do not need one. | `PARTIAL — applicable tools only` |
| T111-06 | Arabic/English and RTL/LTR | Components include locale toggles and `dir`; dynamic engine copy and visible report completeness need interaction review. | `PARTIAL — source` |
| T111-07 | Domain data input | Each form captures fields relevant to its own domain; Tool 119 and 121 were trimmed to avoid asking for ignored data. | `PASS — form source` |
| T111-08 | Unit conversion and defensive numeric helpers | Zod bounds and some finite checks exist. A consistent shared conversion layer is not used across all applicable tools. | `PARTIAL` |
| T111-09 | Deterministic calculation | Engines are pure deterministic functions after the Tool 121 repair; Tool 113 and Tool 120 are explicitly labeled as heuristic models. | `PASS — engine source` |
| T111-10 | Severity-ranked key findings | Adapters create key findings, but the component forms render their own result sections and do not display the adapter envelope/findings. | `PARTIAL — not surfaced` |
| T111-11 | Warnings and limitations | Engines return flags/scope notices and UIs render some of them. Coverage and localization vary by tool. | `PARTIAL` |
| T111-12 | Data provenance | Adapters create provenance envelopes, but UIs do not display them. Several adapters assign hard-coded confidence values (0.65–0.75) without a calibration method. | `FAIL — must correct before parity` |
| T111-13 | Localized copy | Arabic and English JSON exist. Dynamic engine messages and some labels remain English/raw keys or need visual review. | `PARTIAL — source` |
| T111-14 | Registry identity and SEO links | Registry lookup, output builders and SEO links exist in adapter source; the user-facing result path has not been verified to use them. | `PARTIAL — source only` |

## Work completed before the parity request

- Batch 8: corrected the Tool 112 processing-share unit mismatch, fixed Tool 113 exact-budget handling and false AI/LP wording, clarified Tool 114 estimation limits, removed unsourced Tool 115 interaction claims, represented unreported Tool 116 nutrients correctly, and added Tool 117 input guards.
- Batch 9: added Tool 118 coverage reporting, removed unused Tool 119 inputs and an uncalibrated warning, clarified Tool 120 heuristic projections, and removed random output and ignored inputs from Tool 121.
- Those changes improve calculation reliability and evidence labeling. They do not close the UI/output-envelope/provenance parity gaps listed above.

## Immediate parity implementation order

1. Design the shared output envelope/provenance contract so unknown confidence and unavailable sources are valid states. Replace hard-coded confidence in the audited adapters before exposing provenance.
2. Add a common result view for key findings, warnings, limitations, source classification and data provenance; wire the existing adapters into the tool UIs.
3. Add reset actions and a clear calculate workflow or document each deliberate live-calculation pattern.
4. Add unit toggles and conversion tests only to tools with convertible inputs/outputs.
5. Finish AR/EN dynamic copy and add component interaction tests plus browser checks for representative tools in each domain.
6. Repeat this audit for tools 126–130, then proceed by domain through the remaining current identities.

At the time of the original 112–121 source audit, no live database, migrations, commit, push, deploy, or browser UI action was performed.

## Addendum — tools 122–125

- Tools 122–125 now have canonical output adapters, explicit calculate/reset controls, stale-result hiding, provenance and related-tool navigation.
- Tool 122's model-fit category is distinct from provenance confidence; all four adapters report confidence/data quality as unassessed.
- Unit conversions apply to tool 122 load, tool 123 exercise mass, and tool 125 mass/length inputs. Tool 124 has no convertible physical measurement input.
- The batch has 50 focused/regression tests and two DOM tests for tool 122. DOM evidence for 123–125 remains outstanding; dynamic-copy localization also requires a per-tool review. See `SMARTTOOLS_BATCH_12_REPORT.md`.

## Implementation progress (Batches 10–12)

- Tools 112–117: canonical adapters now feed explicit calculate/reset UI state; shared output/provenance/navigation panel is visible. DOM interaction test covers tool 112. Metric/imperial conversion was added where applicable. See `SMARTTOOLS_BATCH_10_REPORT.md`.
- Tools 118–121: same shared flow is in place; provenance confidence is unassessed rather than hard-coded; registry identities/routes now resolve. DOM interaction test covers tool 120, including kg/lb and cm/in display conversion. See `SMARTTOOLS_BATCH_11_REPORT.md`.
- Tools 122–125: same shared flow and applicable unit conversions are in place; tool 122 model fit remains distinct from unassessed data confidence. DOM test covers tool 122. See `SMARTTOOLS_BATCH_12_REPORT.md`.
- Current residuals: per-tool browser checks for tools 113–119, 121, 123–125; dynamic result localization audit; platform output-kind classification; future context/knowledge graph, memory/workspace, evaluation and configured AI capabilities. These are not claimed complete.
