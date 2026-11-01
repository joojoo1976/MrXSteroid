# Tool 016 — Half-Life Scenario Calculator: Sources and Scope

**Review date:** 2026-10-25  
**Registry identity:** `mrx.tool.016-half-life-calculator` / `tool-016-half-life-calculator`  
**Canonical route:** `/smarttools/pharmacokinetics/tool-016-half-life-calculator`

## Mathematical source

The calculator applies the single-exponential form `C(t) = C0 × e^(−kt)` and the half-life relation `t½ = ln(2)/k`, which yields `t = t½ × ln(fraction remaining) / ln(0.5)`.

The [European Medicines Agency guideline on statistical approaches to withdrawal periods](https://www.ema.europa.eu/en/documents/scientific-guideline/note-guidance-approach-towards-harmonisation-withdrawal-periods_en.pdf) describes terminal elimination using a one-compartment, first-order exponential term and defines the elimination rate constant. That document concerns veterinary residue withdrawal-period calculations; it is cited here only as a source for the mathematical form of exponential elimination. It does not validate an individual human medication estimate or this app's user-entered half-life values.

## Boundaries

- The user must enter each half-life and its source. The application has no drug/compound database and makes no claim that a source is current or clinically applicable.
- Each entry is calculated independently. The engine does not combine substances or account for absorption, depot release, distribution, accumulation, active metabolites, enzyme interactions, renal/hepatic function, body fat, dose, route, or formulation.
- The displayed elapsed time is a mathematical scenario for a selected remaining fraction. It is not a real-world clearance time, safe-use interval, drug-testing estimate, washout instruction, or PCT timing recommendation.
- Compound names and source text stay in the displayed local calculation result and are omitted from the structured findings offered to the shared assistant. Result sharing still requires the assistant panel's explicit user consent.

## Registry identity discrepancy found during the same audit

The registry binds the half-life slug to `mrx.tool.016-half-life-calculator`; `lib/tools/smartToolsCatalog4.ts` currently assigns `mrx.tool.016-half-life`. A separate local component and engine named `tool-016-libido-calculator` also exist, while the current catalog/registry scan does not register that second slug. Its component contains hormone/compound scoring and drug adjustment recommendations. This delivery does not merge, renumber, or route that component. The duplicate numeric identity and catalog/registry ID mismatch require owner-reviewed identity reconciliation before these artifacts can be considered aligned.
