# Tool 140 Laboratory Conversion Source Register

## Scope

These are analyte-specific conversion factors for transforming a laboratory result between the exact conventional and SI units shown. They are not reference intervals, diagnoses, medication-dose conversions, or evidence that two assays are interchangeable. The UI must disclose the analyte, direction, factor and source with every result.

## Primary sources

- Labcorp, [SI Unit Conversion Table](https://www.labcorp.com/test-menu/resources/si-unit-conversion-table), retrieved 2026-10-24. The table states that the conversion factor multiplies conventional units to obtain SI units. Supported mappings transcribed for glucose, cholesterol fractions, triglycerides, serum creatinine, total bilirubin, total calcium, BUN, uric acid, albumin, testosterone, and TSH.
- Mayo Clinic Laboratories, [International System of Units (SI) Conversion](https://www.mayocliniclabs.com/order-tests/si-unit-conversion.html), retrieved 2026-10-24. The table states conventional × factor = SI and SI ÷ factor = conventional. Supported mappings transcribed for total 25-hydroxy vitamin D and estradiol measured by mass spectrometry; it also cross-checks several factors.

## Supported allowlist

| Analyte / specimen | Conventional unit | SI unit | Conventional → SI factor | Source note |
|---|---:|---:|---:|---|
| Glucose, blood | mg/dL | mmol/L | 0.0555 | Labcorp table labels blood; not a medication or glucose target calculator. |
| Total cholesterol, serum | mg/dL | mmol/L | 0.0259 | Labcorp. |
| HDL cholesterol, serum | mg/dL | mmol/L | 0.0259 | Labcorp. |
| LDL cholesterol, serum | mg/dL | mmol/L | 0.0259 | Labcorp. |
| Triglycerides, serum | mg/dL | mmol/L | 0.0113 | Labcorp. |
| Creatinine, serum | mg/dL | µmol/L | 88.4 | Labcorp. Not urine creatinine. |
| Bilirubin, total serum | mg/dL | µmol/L | 17.1 | Labcorp. |
| Calcium, total serum | mg/dL | mmol/L | 0.25 | Labcorp/Mayo. Not ionized calcium. |
| Urea nitrogen (BUN), blood | mg/dL | mmol/L | 0.357 | Labcorp. Do not label as total urea. |
| Uric acid, serum | mg/dL | mmol/L | 0.059 | Labcorp. |
| Albumin, serum | g/dL | g/L | 10 | Labcorp/Mayo. |
| Testosterone, total | ng/dL | nmol/L | 0.0347 | Labcorp/Mayo total testosterone table; free testosterone is a different mapping. |
| Estradiol, serum by mass spectrometry | pg/mL | pmol/L | 3.671 | Mayo's listed assay-specific row; do not claim assay interchangeability. |
| TSH | µIU/mL | mIU/L | 1 | Labcorp. |
| 25-hydroxy vitamin D, total | ng/mL | nmol/L | 2.496 | Mayo total D2/D3 row; not 1,25-dihydroxy vitamin D. |

## Implementation rules

- Reverse conversion divides by the same analyte-specific factor; it is not independently rounded from a second factor.
- Preserve the factor's published precision and disclose that rounded source factors can cause small rounding differences.
- Reject mismatched analyte/specimen/units and all values outside the finite nonnegative safety bounds.
- Do not compare converted values against reference intervals. Lab-specific assay methods and clinical interpretation remain outside this utility.
- Changes to this allowlist require source review, regression tests and an update to this register.
