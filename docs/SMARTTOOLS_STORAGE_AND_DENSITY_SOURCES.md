# SmartTools 143–144 Source Register

Reviewed: 2026-10-25

## Tool 143 — Product Storage Label & Temperature Record Checker

### Sources

- U.S. National Library of Medicine, [DailyMed](https://dailymed.nlm.nih.gov/dailymed/about-dailymed.cfm): public search for current in-use labeling submitted by companies to FDA. NLM states that DailyMed's version may differ from the latest FDA-approved label and that NLM does not review every SPL before publication. The interface therefore asks the user to verify the exact product, strength/package and product state against the label; it stores the selected DailyMed Set ID or label URL and the time the search was opened.
- FDA, [Expiration Dates: Questions and Answers](https://www.fda.gov/drugs/pharmaceutical-quality-resources/expiration-dates-questions-and-answers): labeled expiry is supported by product stability testing under labeled storage conditions; varied conditions after distribution make broad conclusions difficult.
- U.S. Government Publishing Office, [21 CFR § 211.166, Stability Testing](https://www.govinfo.gov/content/pkg/CFR-2024-title21-vol4/pdf/CFR-2024-title21-vol4-sec211-166.pdf): stability programs use defined storage conditions, reliable methods, and the marketed container-closure system. The tool is not such a stability program.
- FDA, [Medication Safety Tips](https://www.fda.gov/consumers/consumer-updates/5-medication-safety-tips-older-adults): follow product-specific storage instructions and consult a pharmacist or health professional with storage questions.

### Calculation and source rules

- Open DailyMed search by the entered product name. Record the search-open timestamp in ISO 8601 UTC. The user then supplies the selected DailyMed `drugInfo.cfm?setid=...` URL or its UUID Set ID and transcribes the product label's storage minimum and maximum in °C.
- The user records the matching product state (unopened, in use or reconstituted per label) and observed minimum/maximum readings. The deterministic comparison checks only whether the observed interval extends outside the entered label interval.
- Temperatures are canonicalized to °C for validation and comparison. The global metric/imperial preference controls whether the form and result summary display °C or °F.
- Missing product/state, timestamp, valid DailyMed label reference, either limit of the labeled range, or either limit of the observed range yields `not_evaluable`; no default interval is inserted.
- An out-of-range result requests product-specific review by a pharmacist or manufacturer and tells the user to follow the product label. An in-range result only reports arithmetic overlap.

### Explicit exclusions

- No thermal degradation/Arrhenius model, potency estimate, expiry or beyond-use dating, shelf-life extension, safety/sterility inference, use/discard decision, or product quality determination.
- No inference between formulations, strengths, containers, manufacturers, unopened/in-use/reconstituted states, or different labels.
- Query metadata and the calculation result remain in the current page session/result; this batch adds no server persistence.

## Tool 144 — General Mass, Volume & Density Calculator

### Sources

- NIST, [Guide for the Use of the International System of Units (SI), §8.6.7](https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8): defines mass density as `ρ = m / V` and gives the coherent SI unit `kg/m³`.
- NIST, [Handbook 130, Appendix A: SI/U.S. Customary Conversion Factors](https://www.nist.gov/document/2025-nist-handbook-130): supports the U.S. customary mass, volume and temperature conversions used by the imperial display (`lb`, `oz`, US gallon/fluid ounce, `ft³`, and °F). NIST's [SI conversion-factor tables](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9) provide additional unit relationships.
- BIPM, [The International System of Units (SI) Brochure](https://www.bipm.org/en/publications/si-brochure): authoritative definitions and structure of SI base and derived units.

### Calculation and source rules

- Solve one of mass, volume or density from the other two using selected-unit factors normalized through g, mL and g/mL, then convert to one of the listed result units. Supported customary factors include 1 lb = 453.59237 g, 1 oz = 28.349523125 g, 1 U.S. gallon = 3785.411784 mL, 1 U.S. fluid ounce = 29.5735295625 mL, 1 in³ = 16.387064 mL, and 1 ft³ = 28,316.846592 mL.
- The global header's metric/imperial setting selects default field/result units. Switching systems converts entered quantities so their physical values are preserved; temperature remains canonical in °C and is displayed/entered as °F in imperial mode.
- If density is entered, require a user-supplied source description and measurement temperature. The calculator does not provide a density database. If density is calculated from mass and volume, require and report the measurement temperature; provenance identifies the calculation as derived from user entries.
- Require positive finite quantities, supported units and finite temperatures in the configured bounds; reject zero denominators and results outside the supported range. Keep unit dimensions distinct.

### Explicit exclusions

- No substance catalog, mixture rules, concentration, solubility, purity, yield, dosage, preparation or sterilization instructions.
- A numerical result does not validate the user's measurement, density source, temperature match or material identity.
