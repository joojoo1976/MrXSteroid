# SmartTools 241–245: Sources, formulas, and boundaries

Reviewed: 2026-10-27

## Unit conversion reference — Tool 242

Tool 242 uses a finite unit whitelist and converts only within one physical dimension. Its conversion factors are based on NIST Guide to the SI, Special Publication 811, Appendix B.9: [NIST SP 811 Appendix B.9](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9). The implementation uses the published rounded factors for pound-to-kilogram, U.S. cup and U.S. fluid ounce to liter, inch/foot to meter, bar to pascal, and conventional mmHg to pascal. The converter's temperature equations follow NIST's exact temperature table: [NIST SI Units — Temperature](https://www.nist.gov/pml/owm/si-units-temperature).

The source provides measurement conversion factors; it does not provide medical reference intervals, analyte-specific conversions, or medication/dose conversions. No such inference is made by this tool. Supported dimensions are mass, volume, length, pressure, and temperature. An incompatible pair is rejected; mass, volume, length, and pressure inputs must be nonnegative, and temperature cannot fall below absolute zero.

## Other tools in this batch

| Tool | Data basis | Formula or behavior | Boundary |
| --- | --- | --- | --- |
| 241 — Generic Mathematical Ratio Calculator | Two abstract finite values supplied by the user | `a / b`; denominator must be greater than zero. | The tool assigns no chemical meaning to either value. No BA/BB, solvent, mixing, concentration, dose, or preparation calculation or instruction. |
| 243 — Carrier Oil Observation Log | User-written observation | Records a trimmed note of 1–400 characters in the current interface state. | No oil ranking, viscosity estimate, syringe-pressure estimate, or formulation advice. Not independently verified or persisted by this tool. |
| 244 — Generic Input/Output Ratio Calculator | User-defined input and output values assumed to share the same units | `output / input`, plus the arithmetic ratio multiplied by 100. Input must be greater than zero. | Does not assess purity, process yield, efficiency, dose, concentration, or preparation. It does not determine or validate units. |
| 245 — Storage Observation Log | User-written observation | Records a trimmed note of 1–400 characters in the current interface state. | No stability, degradation, expiration, sterility, safety, or shelf-life conclusion. Not independently verified or persisted by this tool. |

## Data handling

No external service or Supabase call is made by these five engines, and this batch adds no persistent storage. The interfaces read shared language and measurement preferences. Tool 242 uses the shared measurement preference only to select its initial unit pair; the visitor explicitly chooses a dimension and compatible source/target units. No language or measurement toggle is added inside a tool.
