# Tool 015 — Free Testosterone Calculation: Sources and Limits

**Review date:** 2026-10-25  
**Tool ID:** `mrx.tool.015-shbg-modulator`  
**Route:** `/smarttools/body-composition/tool-015-shbg-modulator`

## Source basis

- Vermeulen A, Verdonck L, Kaufman JM. “A Critical Evaluation of Simple Methods for the Estimation of Free Testosterone in Serum.” *The Journal of Clinical Endocrinology & Metabolism*. 1999;84(10):3666–3672. DOI: [10.1210/jc.84.10.6079](https://doi.org/10.1210/jc.84.10.6079); PMID: [10523012](https://pubmed.ncbi.nlm.nih.gov/10523012/). This is the named source for the mass-action calculation selected by the implementation. The constants are explicitly surfaced in the result and schema.
- Bhasin S, et al. Endocrine Society Clinical Practice Guideline, “Testosterone Therapy in Men With Hypogonadism.” *JCEM*. 2018;103(5):1715–1744. DOI: [10.1210/jc.2018-00229](https://doi.org/10.1210/jc.2018-00229). The guideline describes calculated free testosterone from total testosterone, SHBG, and albumin as an option when indicated, emphasizes accurate assay inputs, and notes that free-testosterone reference ranges vary by method and assay. This tool therefore does not interpret or classify the result.

## Implemented calculation and scope

The engine consumes user-entered total testosterone (`ng/dL`), SHBG (`nmol/L`), and albumin (`g/dL`), converts them to molar units, solves the mass-action quadratic, and returns calculated free testosterone, calculated bioavailable testosterone, and the free fraction. The output is tagged `CALCULATED` and provenance confidence/data quality are unassessed.

The tool does not diagnose hypogonadism, classify a result as low/normal/high, infer symptoms or causes, recommend treatment or dose changes, or claim assay equivalence. The application does not transmit raw lab inputs into the shared assistant context; only calculated results and method provenance are publishable after the user opts in to result sharing. No persistence or database write is added by this integration.

## Review limitations

This documentation establishes the selected formula source and an authoritative guideline limitation; it does not independently validate every implementation constant against the complete article text or establish a live clinical laboratory reference range. Users must rely on their own laboratory and clinician for interpretation.
