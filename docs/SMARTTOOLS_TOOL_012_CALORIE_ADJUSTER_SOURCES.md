# Tool 012 — Calorie Adjuster: Sources and Scope

## Formula source

- Mifflin MD, St Jeor ST, Hill LA, Scott BJ, Daugherty SA, Koh YO. “A new predictive equation for resting energy expenditure in healthy individuals.” *The American Journal of Clinical Nutrition*. 1990;51(2):241–247. PMID: 2305711. DOI: 10.1093/ajcn/51.2.241.
- PubMed record: <https://pubmed.ncbi.nlm.nih.gov/2305711/>
- The paper describes a predictive resting-energy equation derived from 498 healthy adults ages 19–78. The tool therefore accepts ages 19–78 and labels the value as an estimate. The study population does not establish validity for every person within that age range or outside it.

## Current calculation and explicit assumptions

- The existing implementation uses the rounded sex-specific Mifflin–St Jeor equations, then multiplies by one of five activity factors (1.2, 1.375, 1.55, 1.725, 1.9).
- The tool applies a fixed +500 kcal/day for `bulk`, −500 kcal/day for `cut`, or 0 for `maintain`. These offsets are preserved from the prior implementation and are shown as scenario assumptions, not individualized prescriptions. This source does not validate those offsets.
- The displayed range remains the existing fixed ±100 kcal/day around the TDEE value. It is explicitly labeled as a model range, not a confidence interval; the source does not validate this range.
- The engine's existing recommendation strings remain outside the AI context payload. The AI summary receives only the selected numeric findings and the assumptions listed above after the user opts in.

## Limits

- The equation predicts resting energy expenditure; the tool's activity multiplier and calorie goal offset are additional assumptions.
- The displayed age interval follows the study sample and is not a guarantee of individualized accuracy.
- No measured energy expenditure, clinical assessment, or external data is used.
- The tool does not provide a personalized nutrition prescription. Its numeric output is deterministic under the stated inputs and assumptions.
