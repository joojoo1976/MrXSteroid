# Tool 092 — Dose evidence and safety scope

**Reviewed:** 2026-10-26  
**Current behavior:** `NOT_AVAILABLE` for dose safety classification and exposure duration.

## Evidence reviewed

- U.S. FDA / DailyMed, [Oxandrolone tablet labeling](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a6f42739-5bfc-4b76-8795-e93fa58f3d29). The labeling describes virilization effects in women and warns that some changes may be irreversible. It does not establish the former tool's bodybuilding dose ceilings, percentage “safety” tiers, or exposure durations.
- FDA, [Oxandrin label archive](https://www.accessdata.fda.gov/drugsatfda_docs/label/2003/13718slr022_Oxandrin_lbl.pdf). This archived label includes product-specific warnings; it must not be represented as the latest approved label.

## Product boundary

The reviewed product label is for oxandrolone only. It does not support dose claims for methenolone, nandrolone, or testosterone, nor a class-wide model for women. Tool 092 therefore does not infer or calculate a dose ceiling, risk percentage, or safe exposure duration for any listed compound. A user-entered value remains user-provided and is not assessed as safe, unsafe, appropriate, or approved.

## Implementation boundary

- The engine returns `NOT_AVAILABLE / NO_VALIDATED_FEMALE_DOSING_MODEL` for every input.
- The interface explicitly states that no dose safety classification or exposure duration is produced.
- Tool output provenance has `confidence: null` and `dataQuality: not_assessed`; no synthetic reference range or confidence score is emitted.
- The numeric ID and route are preserved. The visible name and catalog description now disclose that this is an evidence check with no configured validated model.
- The tool does not provide dosing, titration, cycle, discontinuation, or treatment instructions.

## Verification limits

The cited product label is source context, not validation of a female anabolic-steroid dose model. No clinical professional review was performed. The tests verify that unsupported dose-risk and duration outputs stay unavailable; they do not establish clinical validity or live product-label currency.
