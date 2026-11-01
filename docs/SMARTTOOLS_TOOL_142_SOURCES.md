# Tool 142 — User-Provided Assay Mass Arithmetic: Sources and Limits

**Current scope:** deterministic arithmetic from a user-transcribed mass-fraction assay value and the interval the cited report itself states. No material database, assay interpretation, or external lookup is used.

## Calculation

`component mass = sample mass × assay percentage ÷ 100`

The lower and upper arithmetic amounts map the two endpoints of the user-entered assay interval through the same multiplication. The tool does not interpret whether the stated uncertainty is standard or expanded, assign coverage/confidence, or propagate uncertainty from underlying measurements.

## Source basis

- BIPM/JCGM, *International Vocabulary of Metrology (VIM), 3rd edition*, quantity values include a number and unit; examples express mass fraction as a ratio such as `3 µg/kg` ([VIM 1.19](https://jcgm.bipm.org/vim/en/1.19.html)). This supports treating value and unit together; it does not validate any user-entered assay.
- NIST, *Methods for the SI Value Assignment of the Purity of Organic Compounds* (IUPAC Technical Report, 2023) describes traceability, calibrated primary references, stated uncertainty, and analytical methods as part of defensible purity value assignment ([NIST publication](https://www.nist.gov/publications/methods-si-value-assignment-purity-organic-compounds-iupac-technical-report)). The tool does not perform those procedures and therefore makes no purity certification.
- NIST SRM certificate example documents certified mass-fraction values with method-specific uncertainty and traceability statements ([NIST SRM C2415a certificate](https://tsapps.nist.gov/srmext/certificates/C2415a.pdf)). It illustrates why the assay source, method and uncertainty description must remain attached to the copied numeric value. It is not an assay reference database for this tool.

## Required input provenance

- Sample mass and explicit mass unit.
- Assay percentage on a mass basis, as stated by the user-selected report.
- Absolute uncertainty in percentage points plus the source's own uncertainty description.
- Report reference, method description and report date.

Missing or invalid fields prevent calculation. Assay plus/minus the entered interval must remain within 0–100%. Inputs are user-transcribed and are not checked against the cited report.

## Explicit exclusions

- No conclusion about purity, identity, authenticity, product quality, sterility, safety, or suitability.
- No dosage, concentration, mixing, reconstitution, formulation, preparation, manufacturing-yield, or administration calculation or instruction.
- No defaults, assay library, recommendations, persistent storage, external transmission, or automatic cross-tool import.
- The result type `CALCULATED` describes arithmetic only. It does not describe a laboratory measurement, verified assay, or medical/chemical decision.

Sources reviewed 2026-10-25. Verify source revisions before future changes to the scientific claims or calculation model.
