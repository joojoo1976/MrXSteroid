# Tool 017 — Drug Interaction Checker: Source and Safety Audit

**Review date:** 2026-10-25  
**Tool ID:** `mrx.tool.017-drug-interaction`  
**Route:** `/smarttools/medical-monitoring/tool-017-drug-interaction`

## Why automated checking is currently unavailable

The previous engine classified free-text fragments such as `warfarin`, `liver`, or `heart` using substring rules, generated contraindication/safety labels, and recommended medication changes or supplements. Those rules did not identify exact products, ingredients, route, dose, label versions, evidence provenance, or patient-specific context. One family comparison used JavaScript's `in` operator with an array and did not implement the apparent intended family check. The output `safe` could therefore falsely reassure; `danger` and its treatment advice were not grounded in a verified interaction source.

Tool 017 now returns only `NOT_AVAILABLE / NO_VERIFIED_INTERACTION_SOURCE`. It does not accept or persist medication or condition text and does not claim that an interaction is absent or that a combination is safe.

## Official source references and future-source limits

- [DailyMed developer support](https://dailymed.nlm.nih.gov/dailymed/app-support-web-services.cfm) documents a REST service for retrieving current Structured Product Labeling (SPL) information. DailyMed labels can support retrieval and citation of product-specific label sections, but this codebase does not yet resolve ingredients/products, compare a complete user list, interpret label prose, or establish exhaustive interaction coverage.
- [FDA: Drug Interactions — What You Should Know](https://www.fda.gov/drugs/resources-drugs/drug-interactions-what-you-should-know) advises users to review prescription and OTC product labels and discuss their full medication/supplement lists with a clinician or pharmacist.
- [FDA prescription labeling FAQ](https://www.fda.gov/drugs/fdas-labeling-resources-human-prescription-drugs/frequently-asked-questions-about-labeling-prescription-medicines) describes Section 7 of prescription labeling as the section for clinically significant interactions. This is labeling context, not an interaction database or a complete cross-product checking algorithm.
- FDA's [October 2024 drug-interaction labeling guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/drug-interaction-information-human-prescription-drug-and-biological-product-labeling) is explicitly draft/non-binding. It is not treated as a clinical rule set by this tool.

## Requirements before enabling a checker

An owner-reviewed implementation still needs a licensed/authoritative data source with freshness and coverage policy; normalized ingredient/product matching with user confirmation for ambiguous results; source/version and retrieval timestamps for every finding; explicitly bounded interaction categories; safe handling of no-match, missing, stale, unavailable, and partial results; and clinical/pharmacy review of rules and user-facing escalation. A language model must not infer an interaction or turn absence of a label match into a negative safety finding.

Tool 025 currently contains a separate heuristic scoring engine and is not considered a validated substitute or fallback.
