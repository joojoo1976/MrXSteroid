# Tool 034 — Single-dose Fractional Decay Sources and Limits

**Reviewed:** 2026-10-25  
**Application identity:** `mrx.tool.034-compound-clearance` (ID, slug, and legacy path preserved)

## Mathematical basis

For a first-order exponential model, the relative fraction at elapsed time `t` is represented as:

`fraction(t) = 0.5 ^ (t / halfLife)`

Solving for a selected fraction `f` gives `t = halfLife × log2(1/f)`. The code rounds time to the next whole day for the displayed threshold date. This is a deterministic arithmetic model. The user supplies the half-life and an accompanying source label or URL; the application does not retrieve, validate, or endorse that source.

## Sources reviewed

1. European Medicines Agency, *Statistical approach to the establishment of withdrawal periods*, §1.1.1. It states the exponential first-order relationship `Cₜ = C₀' e^-kt` for a terminal-elimination model. This guidance concerns veterinary residue withdrawal periods; it is used here only as documentation of the mathematical form, not as human drug advice or a clearance threshold.  
   <https://www.ema.europa.eu/en/documents/scientific-guideline/note-guidance-approach-towards-harmonisation-withdrawal-periods_en.pdf>
2. U.S. FDA, Clinical Pharmacology Review, NDA 203414, glossary definition `T1/2 = ln(2)/λz` for a terminal elimination half-life. This is a product-specific review and does not establish a half-life for other compounds or individuals.  
   <https://www.accessdata.fda.gov/drugsatfda_docs/nda/2013/203414Orig1s000ClinPharmR.pdf>
3. Jusko WJ et al. (2022), *Determinants of Biological Half-Lives and Terminal Slopes in Physiologically Based Pharmacokinetic Systems: Assessment of Limiting Conditions*. This primary research discusses how terminal slopes arise in more complex multi-compartment PBPK systems, supporting the need to label the tool's single-exponential simplification explicitly.  
   <https://pmc.ncbi.nlm.nih.gov/articles/PMC9589903/> (PMID 36042121)

## Tool contract and explicit non-claims

- The user enters a scenario label, a positive half-life in days, the source label/URL for that value, a reference start date, an evaluation date, and a selected mathematical percentage threshold.
- The threshold is user-selected from 0.1% to 20%. It is not a medical clearance, detection, safety, competition, or treatment threshold.
- Results contain elapsed whole days, the model threshold date, a modeled fraction, and fractional curve points. No dose amount or estimated mass remaining is produced.
- The model is a single exponential beginning at the entered date. It does not model absorption, distribution, depot release, repeated dosing, interactions, active metabolites, nonlinear kinetics, assay detection, or person-specific physiology.
- The feature does not identify the compound, verify the half-life/source, establish drug clearance from a person, determine safety or fitness to use, or recommend dosing, stopping, waiting, testing, or treatment.
- The UI is bilingual and uses the global header's language and measurement-system context; the numerical model uses days and percentages and performs no unit conversion. It creates no local preference controls.

## Provenance and verification boundary

The adapter records `confidence: null`, `dataQuality: not_assessed`, and informational key findings. The entered source is displayed as user-supplied and unverified. Formula tests establish arithmetic behavior only; they do not validate compound-specific pharmacokinetics or any clinical interpretation.
