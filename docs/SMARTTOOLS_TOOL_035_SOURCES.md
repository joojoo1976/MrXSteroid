# Tool 035 — Hormone Lab Unit Conversion Sources and Contract

**Reviewed:** 2026-10-25  
**Identity:** `mrx.tool.035-hormone-conversion` (ID, slug, and legacy path preserved)

## Supported conversions

This tool converts a user-entered concentration for one selected analyte at a time:

- Testosterone: `ng/dL` ↔ `nmol/L`
- Estradiol: `pg/mL` ↔ `pmol/L`

It does not convert between analytes. It uses molar-mass-derived factors:

- PubChem molecular weight for testosterone: 288.4 g/mol. `ng/dL → nmol/L` factor is `10 / 288.4`; reverse factor is its reciprocal.
- PubChem molecular weight for estradiol: 272.4 g/mol. `pg/mL → pmol/L` factor is `1,000 / 272.4`; reverse factor is its reciprocal.

The arithmetic follows dimensional conversion through mass concentration and amount-of-substance concentration. Result values are rounded to four decimal places; conversion factors are rounded to eight decimal places for display/provenance.

## Sources

- PubChem, Testosterone, CID 6013; formula C19H28O2; molecular weight reported as 288.4 g/mol: <https://pubchem.ncbi.nlm.nih.gov/compound/testosterone>
- PubChem, Estradiol, CID 5757; formula C18H24O2; molecular weight reported as 272.4 g/mol: <https://pubchem.ncbi.nlm.nih.gov/compound/estradiol>
- NIST Guide to the SI, Chapter 8; definitions of molar mass and amount-of-substance concentration: <https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8>

These molecular weights are rounded PubChem values, so converted results can differ slightly from a laboratory's own factor, method, or displayed rounding. The UI links the sources directly.

## Input, provenance, and exclusions

- The visitor enters the value, analyte, matching source unit, result date, and a lab/report source label. The source label is user-entered and is not independently verified.
- Inputs must be finite and nonnegative; dates must be real `YYYY-MM-DD` calendar dates. Testosterone accepts only `ng/dL` or `nmol/L`; estradiol accepts only `pg/mL` or `pmol/L`.
- Provenance is `confidence: null` and `dataQuality: not_assessed`. The output is `CALCULATED`, meaning arithmetic conversion only.
- The tool has no reference intervals, hormone estimates, analyte status, diagnosis, prediction, or medication/dose advice. It does not change user values into free/total analyte interpretations, and it does not determine what a result means clinically.
- English/Arabic language follows the global header. Header measurement preference is carried as metadata; the analyte-specific lab units are selected explicitly and are not converted according to a metric/imperial preference. No local language or unit controls are added beyond the input unit selector required for the calculation.
