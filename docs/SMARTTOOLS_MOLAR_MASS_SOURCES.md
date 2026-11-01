# Tool 027 — Molar Mass Source and Calculation Contract

**Reviewed:** 2026-10-25  
**Tool:** `mrx.tool.027-ester-conversion` (identity, slug and route retained)

## Authoritative definition

IUPAC Gold Book defines molar mass (M) as mass divided by amount of substance, with units including g mol⁻¹. This supports `n = m / M` and, for the same calculated amount `n`, `m₂ = n × M₂`.

- IUPAC Gold Book, **molar mass (12214)**: <https://goldbook.iupac.org/terms/view/12214>
- DOI: <https://doi.org/10.1351/goldbook.12214>
- NIST Guide to the SI, §8.6.4 (corroborating definition): <https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8>

## Product behavior

- The user supplies both material labels, both molar-mass values in g/mol, a source label for each molar mass, the starting mass and its unit, and the target mass unit.
- The engine converts the starting mass to grams, computes `n = m / M`, computes target mass as `n × M_target`, then converts the target mass to the selected output unit.
- Every numeric input must be finite, positive, and bounded; labels and both provenance fields are required. There is no built-in substance/molar-mass database or preset value.
- The result is labeled `CALCULATED` and identifies its method as `SAME_AMOUNT_OF_SUBSTANCE`. It is mathematical output from user-provided inputs, not independent verification.

## Explicit exclusions

The calculation does not establish pharmaceutical or biological equivalence, active-moiety equivalence, potency, bioavailability, effect, dosing, route, safety, or substitution. It provides no administration or preparation instructions. In particular, it must not be used as a drug-dose conversion tool. If the product is used with medicines or hormones, clinical interpretation is outside this tool's scope.

## Versioning and limitations

The IUPAC definition supports the dimensional relationship only. Users remain responsible for the chemical identity, formula, purity, salt/solvate form, stoichiometry, and correctness of each entered molar mass and source. The UI does not verify source links or chemical structures. No third-party database lookup or AI interpretation is implemented.
