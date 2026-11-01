# Tool 002 — Aromatization Scenario Model: Sources and Limits

**Review date:** 2026-10-27  
**Application identity and route:** unchanged (`aromatization-risk`)  
**Evidence status:** the existing E2 curve constants and clinical cutoffs are not validated by the sources below.

## What the reviewed research supports

1. **Wu et al., 2018, longitudinal study in men.** Changes in testosterone were associated with changes in circulating estradiol in the cohort; changes in fat mass were not associated with estradiol change in the adjusted analysis. This does not validate a linear body-fat multiplier for an individual. [PubMed PMID 30071117](https://pubmed.ncbi.nlm.nih.gov/30071117/).
2. **2025 adipose-tissue study in men.** Aromatase expression was higher in subcutaneous adipose tissue from men with obesity, but tissue aromatase expression was not associated with circulating estradiol in the study. This is not a person-level E2 prediction equation. [PubMed PMID 39833659](https://pubmed.ncbi.nlm.nih.gov/39833659/).
3. **Burnett-Bowie et al., 2009, randomized trial in hypogonadal older men.** Anastrozole 1 mg daily lowered measured estradiol in that specific trial population. It does not validate the model's `mild` / `standard` / `aggressive` suppression factors or predict effects in anabolic-steroid protocols. [PubMed PMID 18616708](https://pubmed.ncbi.nlm.nih.gov/18616708/).

## Unsupported inherited assumptions

The following remaining scenario constants/formulas in `lib/tools/engines/aromatization-risk.ts` have no claim-level evidence in the sources above. The chapter attribution in the former catalog entry was removed because it could not be verified against the local book PDFs:

- Arbitrary scenario baseline E2 = 30 pg/mL, maximum elevation of 100 pg/mL at the legacy reference inputs (500 mg/week), compound-specific model coefficients, and 50% / 72% / 88% suppression factors.
- Rise and decay time constants of 3 and 2 weeks, respectively.
- Linear body-fat scenario multiplier and displayed aromatase activity values.

Clinical threshold zones and gynecomastia, water-retention, and E2-crash risk scores were removed from the engine. The engine now returns `not_assessed` for classification and null for those scores. Medication recommendations were removed.

The repository has two local book PDFs under `private/books/`, but the checked-out PDF runtime exposes `pdfinfo` and `pdftoppm` only; `pdftotext` and `pypdf` are unavailable. The files are 10 pages each, and the cited Chapter 4 claims/constants could not be verified from extracted text in this audit. The code's chapter attribution is therefore not treated as proof.

## Current implementation boundary

The legacy formula is retained only as an **unvalidated arithmetic scenario**. Its E2 curve is not a lab measurement, personal forecast, or clinical estimate. The engine returns null for unsupported clinical risk scores and `NOT_ASSESSED` for risk classification and medication recommendations. The adapter marks confidence and data quality as unassessed, emits informational findings only, and attaches no clinical reference range. The UI removes threshold bands, product/dose names from the suppression-factor selector, and treatment recommendations. The registry and catalog label the tool as an unvalidated scenario, and the scenario input is explicitly not a dose recommendation.

Do not restore clinical cutoffs, risk scores, or medication advice without source-to-claim review and approval of a validated model and intended-use boundary.
