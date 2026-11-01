# Tool 094 — Pregnancy exposure source and scope

**Reviewed:** 2026-10-26
**Current behavior:** `NOT_AVAILABLE` for individual risk, clearance, or conception timing.

## Evidence reviewed

- NLM DailyMed, [Isotretinoin capsule, liquid filled — product label updated 2026-02-13](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c369e1c3-90c5-4768-9741-56c62253a2c4). This is a specific prescription-product label with pregnancy contraindication/warnings and product-specific risk-management instructions. It is an example of why users must consult the exact product label; it does not validate a generic waiting period for isotretinoin as a class or any other medication/compound class.
- NLM DailyMed, [Isotretinoin capsule product label](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=189c014a-1d66-4ba9-ae47-9ed6138ca82b). This separately maintained label includes its own product-specific reproductive-risk instructions. Do not assume that one product label can be generalized to other products or patient circumstances.

## Product and model boundary

Tool 094 previously mapped broad classes (anabolic steroids, SARMs, SERM/AI, isotretinoin, and thermogenics) to fixed washout intervals and then described exposure as cleared or risk as low. The current source review does not establish a validated class-wide pregnancy-risk or conception-timing model for those categories. The isotretinoin references are included solely to show product-specific labeling, not to calculate a personalized risk or timing result.

## Implementation boundary

- The engine returns `NOT_AVAILABLE / NO_PRODUCT_SPECIFIC_PREGNANCY_GUIDANCE` for every input.
- No risk tier, fetal-safety conclusion, clearance status, washout interval, or conception date is generated.
- The interface no longer asks or stores pregnancy/exposure details.
- Output provenance uses `confidence: null` and `dataQuality: not_assessed`; no synthetic reference range or confidence is emitted.
- The numeric ID and route remain unchanged; the registry and catalog name now describe an information page rather than a risk calculator.

## Verification limits

The source review establishes product-specific warnings only. It is not medical or obstetric review, does not establish a user-specific exposure outcome, and does not determine current status for every product or jurisdiction. No live DailyMed fetch, live Supabase query, or professional clinical review was performed.
