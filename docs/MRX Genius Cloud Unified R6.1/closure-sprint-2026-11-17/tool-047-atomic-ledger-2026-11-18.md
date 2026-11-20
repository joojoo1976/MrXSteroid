# Tool 047 - tool-047-fertility-preservation - Atomic Acceptance Ledger

**Generated:** 2026-11-18 (Asia/Hebron)
**Evidence environment:** clean export `E:\p03-clean-build-20261118` = baseline `2a647fda` + P-03 commit `37f047a4`, real `node_modules`
**Formula:** B = PASS and E >= E3, divided by applicable rows. `PARTIAL`, `NOT_RUN`, `NOT_AVAILABLE`, `BLOCKED` are never PASS.

- **Result: 59/68 = 86.76%**
- Rows: 68 total; 59 PASS, 0 PARTIAL, 5 NOT_RUN, 3 NOT_AVAILABLE, 1 BLOCKED
- Status: `IN PROGRESS` (engineering). **Not 100% VERIFIED.** No browser evidence, no source pack, no specialist approval.

## Criteria

| ID | Area | Criterion | B | E | Evidence | Gap / Next |
|---|---|---|---|---|---|---|
| 047-CONTRACT-01 | CONTRACT | reproduces the impact arithmetic for every level and HCG value | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: reproduces the impact arithmetic for every level and HCG value | none |
| 047-CONTRACT-02 | CONTRACT | reproduces the recovery arithmetic across the age-offset boundaries | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: reproduces the recovery arithmetic across the age-offset boundaries | none |
| 047-CONTRACT-03 | CONTRACT | reproduces the horizon test, including the zero horizon | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: reproduces the horizon test, including the zero horizon | none |
| 047-CONTRACT-04 | CONTRACT | reproduces every protocol hint the engine can emit | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: reproduces every protocol hint the engine can emit | none |
| 047-CONTRACT-05 | CONTRACT | reproduces the two warning triggers and only those | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: reproduces the two warning triggers and only those | none |
| 047-CONTRACT-06 | CONTRACT | mirrors the input bounds of the canonical schema | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: mirrors the input bounds of the canonical schema | none |
| 047-CONTRACT-07 | CONTRACT | maps every hint and warning the engine can emit, and never prints a raw code | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: maps every hint and warning the engine can emit, and never prints a raw code | none |
| 047-CONTRACT-08 | CONTRACT | maps every suppression level the engine accepts | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: maps every suppression level the engine accepts | none |
| 047-CONTRACT-09 | CONTRACT | formats percentages and months without inventing precision | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: formats percentages and months without inventing precision | none |
| 047-CONTRACT-10 | CONTRACT | starts EMPTY with no input and no issue | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: starts EMPTY with no input and no issue | none |
| 047-CONTRACT-11 | CONTRACT | stays PARTIAL until every required field is answered | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: stays PARTIAL until every required field is answered | none |
| 047-CONTRACT-12 | CONTRACT | treats a typed zero horizon as a real value, not as "not answered" | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: treats a typed zero horizon as a real value, not as "not answered" | none |
| 047-CONTRACT-13 | CONTRACT | rejects out-of-range values with an out_of_range issue | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: rejects out-of-range values with an out_of_range issue | none |
| 047-CONTRACT-14 | CONTRACT | rejects non-numeric text in a hand-typed field | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: rejects non-numeric text in a hand-typed field | none |
| 047-CONTRACT-15 | CONTRACT | keeps the order EMPTY → INVALID → PARTIAL → READY | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: keeps the order EMPTY → INVALID → PARTIAL → READY | none |
| 047-CONTRACT-16 | CONTRACT | produces a READY input that the canonical schema accepts | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: produces a READY input that the canonical schema accepts | none |
| 047-CONTRACT-17 | CONTRACT | records no approved source and therefore no citation | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: records no approved source and therefore no citation | none |
| 047-CONTRACT-18 | CONTRACT | links only to real registered tools and transfers nothing automatically | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: links only to real registered tools and transfers nothing automatically | none |
| 047-CONTRACT-19 | CONTRACT | builds a CSV with the inputs, the result and no session identifier | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: builds a CSV with the inputs, the result and no session identifier | none |
| 047-PIPELINE-01 | PIPELINE | valid input produces a contract-valid ToolOutput from the V6 engine | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: valid input produces a contract-valid ToolOutput from the V6 engine | none |
| 047-PIPELINE-02 | PIPELINE | does not reuse the legacy adapter’s invented confidence or reference range | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: does not reuse the legacy adapter’s invented confidence or reference range | none |
| 047-PIPELINE-03 | PIPELINE | matches the standalone V6 engine output exactly (engine is authoritative) | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: matches the standalone V6 engine output exactly (engine is authoritative) | none |
| 047-PIPELINE-04 | PIPELINE | invalid input fails safely with a structured error (no throw, no partial output) | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: invalid input fails safely with a structured error (no throw, no partial output) | none |
| 047-PIPELINE-05 | PIPELINE | rejects invalid input at the schema boundary before the engine runs | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: rejects invalid input at the schema boundary before the engine runs | none |
| 047-PIPELINE-06 | PIPELINE | createToolOutput rejects a malformed envelope (runtime validation guard) | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: createToolOutput rejects a malformed envelope (runtime validation guard) | none |
| 047-PIPELINE-07 | PIPELINE | keeps the engine result type stable for the pipeline export | PASS | E3 | lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: keeps the engine result type stable for the pipeline export | none |
| 047-ENGINE-01 | ENGINE | mid suppression with HCG shortens recovery inside the planning horizon | PASS | E3 | lib/tools/engines/tool-047-fertility-preservation.test.ts :: mid suppression with HCG shortens recovery inside the planning horizon | none |
| 047-ENGINE-02 | ENGINE | heavy 19-nor-style suppression at advanced age exceeds short horizons | PASS | E3 | lib/tools/engines/tool-047-fertility-preservation.test.ts :: heavy 19-nor-style suppression at advanced age exceeds short horizons | none |
| 047-ENGINE-03 | ENGINE | mild suppression plans realistically without HCG | PASS | E3 | lib/tools/engines/tool-047-fertility-preservation.test.ts :: mild suppression plans realistically without HCG | none |
| 047-TEST-01 | TEST | starts EMPTY and invents nothing | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: starts EMPTY and invents nothing | none |
| 047-TEST-02 | TEST | stays PARTIAL until every required field is answered | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: stays PARTIAL until every required field is answered | none |
| 047-TEST-03 | TEST | reports INVALID for an out-of-range age and calculates nothing | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: reports INVALID for an out-of-range age and calculates nothing | none |
| 047-TEST-04 | TEST | reports INVALID for an out-of-range horizon | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: reports INVALID for an out-of-range horizon | none |
| 047-TEST-05 | TEST | calculates through the R6 pipeline once the input is complete | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: calculates through the R6 pipeline once the input is complete | none |
| 047-TEST-06 | TEST | accepts a typed zero horizon as a real value | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: accepts a typed zero horizon as a real value | none |
| 047-TEST-07 | TEST | re-renders the projection when the suppression level changes | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: re-renders the projection when the suppression level changes | none |
| 047-TEST-08 | TEST | reports DEGRADED when the pipeline fails its contract guard | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: reports DEGRADED when the pipeline fails its contract guard | none |
| 047-TEST-09 | TEST | renders all twelve boxes in their fixed order | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: renders all twelve boxes in their fixed order | none |
| 047-TEST-10 | TEST | keeps the history box visible with the real W18 reason | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: keeps the history box visible with the real W18 reason | none |
| 047-TEST-11 | TEST | C1 carries the impact, the recovery, the horizon verdict and an honest confidence | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: C1 carries the impact, the recovery, the horizon verdict and an honest confidence | none |
| 047-TEST-12 | TEST | C2 states the formula with the engine limits, the assumptions and the uncertainty | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: C2 states the formula with the engine limits, the assumptions and the uncertainty | none |
| 047-TEST-13 | TEST | C3 shows the engine hints, the warning and the pending referral | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: C3 shows the engine hints, the warning and the pending referral | none |
| 047-TEST-14 | TEST | C3 raises the age warning only above 40 | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: C3 raises the age warning only above 40 | none |
| 047-TEST-15 | TEST | C4 does not invent a source, a range or a confidence | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: C4 does not invent a source, a range or a confidence | none |
| 047-TEST-16 | TEST | C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | none |
| 047-TEST-17 | TEST | runs the what-if and sensitivity probes through the same pipeline | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: runs the what-if and sensitivity probes through the same pipeline | none |
| 047-TEST-18 | TEST | shows the related tools with a hand-entry rule and no automatic transfer | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: shows the related tools with a hand-entry rule and no automatic transfer | none |
| 047-TEST-19 | TEST | exports a client-side CSV and never adds a session identifier | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: exports a client-side CSV and never adds a session identifier | none |
| 047-TEST-20 | TEST | disables the export until a valid result exists | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: disables the export until a valid result exists | none |
| 047-TEST-21 | TEST | keeps C1 identical in compact mode and shows the five CORE boxes | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: keeps C1 identical in compact mode and shows the five CORE boxes | none |
| 047-TEST-22 | TEST | flips to RTL and localizes the interface in Arabic | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: flips to RTL and localizes the interface in Arabic | none |
| 047-TEST-23 | TEST | never prints a raw engine hint or warning code | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: never prints a raw engine hint or warning code | none |
| 047-TEST-24 | TEST | labels every control, announces the state and marks an invalid input | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: labels every control, announces the state and marks an invalid input | none |
| 047-TEST-25 | TEST | uses no fixed width that would break a 390 px viewport | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: uses no fixed width that would break a 390 px viewport | none |
| 047-TEST-26 | TEST | has NO persistence and never calls the network, the engine or the adapter | PASS | E3 | components/tools/tool-047-fertility-preservation.test.tsx :: has NO persistence and never calls the network, the engine or the adapter | none |
| 047-I18N-01 | I18N | AR/EN parity (en 140 / ar 140 keys) | PASS | E3 | node tool-047-i18n-check.mjs -> I18N_PARITY: OK; en=140 ar=140 | none |
| 047-ROUTE-01 | ROUTE | Canonical route /smarttools/hormonal-health/tool-047-fertility-preservation registered and emitted by the clean build | PASS | E3 | lib/tools/categories.ts:129 -> 'hormonal-health'; clean build EXITCODE=0 with 506/506 static pages | none |
| 047-P03-01 | P-03 | ResultSchema gate exists before the envelope builder and the raw engine result is never forwarded | PASS | E3 | lib/tools/r6/p03-gate-structural.test.ts covers tool-047-fertility-preservation-pipeline.ts (structural assertion) | none |
| 047-P03-02 | P-03 | A mismatched engine result is rejected at runtime with no envelope produced | PASS | E3 | p03-result-schema-validation.test.ts exercises this pipeline's invalid/missing result path | none |
| 047-BROWSER-EN-AR-01 | BROWSER | Authorized EN and AR render on the deployed route | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 047-BROWSER-STATES-5-02 | BROWSER | EMPTY / PARTIAL / INVALID / FULL / DEGRADED exercised in a real browser | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 047-BROWSER-RTL-390-03 | BROWSER | 390 px RTL layout verified in a real browser | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 047-BROWSER-CONSOLE-04 | BROWSER | Console clean: no hydration errors or runtime exceptions | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 047-BROWSER-GENIUS-DOM-05 | BROWSER | GENIUS-12 DOM order verified: 12 boxes, no duplicate shell, no hidden box | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 047-C4-01 | D-C4 | Approved source pack with provenance is attached to clinical claims | NOT_AVAILABLE | E1 | No approved source/provenance pack exists for this tool; the UI renders NOT_AVAILABLE (D-C4 open) | Supply an approved source pack or an explicit owner N/A decision |
| 047-C5-01 | D-C5 | Referral / escalation wording is specialist-approved | NOT_AVAILABLE | E1 | Referral wording remains pending specialist approval (D-C5) | Provide the approved wording pack |
| 047-CLIN-01 | D-CLIN | Clinical / model review sign-off recorded | BLOCKED | E1 | No qualified specialist review exists; self-approval is not permitted (D-CLIN) | Route the unified specialist pack (AR/EN) for review |
| 047-W18-01 | W18 | History capability per W18 | NOT_AVAILABLE | E1 | W18 history is NOT_AVAILABLE: no DB / storage / cloud sync by owner decision | Owner decision on W18 storage; the box must keep stating the real reason |

## What is actually still blocking 100%

- **BROWSER:** 5 row(s) - 047-BROWSER-EN-AR-01, 047-BROWSER-STATES-5-02, 047-BROWSER-RTL-390-03, 047-BROWSER-CONSOLE-04, 047-BROWSER-GENIUS-DOM-05
- **D-C4:** 1 row(s) - 047-C4-01
- **D-C5:** 1 row(s) - 047-C5-01
- **D-CLIN:** 1 row(s) - 047-CLIN-01
- **W18:** 1 row(s) - 047-W18-01
