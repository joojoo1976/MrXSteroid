# Tool 048 - tool-048-cardiovascular-risk - Atomic Acceptance Ledger

**Generated:** 2026-11-18 (Asia/Hebron)
**Evidence environment:** clean export `E:\p03-clean-build-20261118` = baseline `2a647fda` + P-03 commit `37f047a4`, real `node_modules`
**Formula:** B = PASS and E >= E3, divided by applicable rows. `PARTIAL`, `NOT_RUN`, `NOT_AVAILABLE`, `BLOCKED` are never PASS.

- **Result: 62/72 = 86.11%**
- Rows: 72 total; 62 PASS, 1 PARTIAL, 5 NOT_RUN, 3 NOT_AVAILABLE, 1 BLOCKED
- Status: `IN PROGRESS` (engineering). **Not 100% VERIFIED.** No browser evidence, no source pack, no specialist approval.

## Criteria

| ID | Area | Criterion | B | E | Evidence | Gap / Next |
|---|---|---|---|---|---|---|
| 048-CONTRACT-01 | CONTRACT | reproduces the additive risk arithmetic on every representative input | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: reproduces the additive risk arithmetic on every representative input | none |
| 048-CONTRACT-02 | CONTRACT | reproduces every individual contribution the engine adds | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: reproduces every individual contribution the engine adds | none |
| 048-CONTRACT-03 | CONTRACT | never reaches the educational ceiling from schema-valid inputs, and says so | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: never reaches the educational ceiling from schema-valid inputs, and says so | none |
| 048-CONTRACT-04 | CONTRACT | reproduces the four band cut-offs exactly | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: reproduces the four band cut-offs exactly | none |
| 048-CONTRACT-05 | CONTRACT | reproduces every driver threshold and the 1:1 mitigation mapping in order | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: reproduces every driver threshold and the 1:1 mitigation mapping in order | none |
| 048-CONTRACT-06 | CONTRACT | always emits the educational warning and adds the consultation warning at 20 % | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: always emits the educational warning and adds the consultation warning at 20 % | none |
| 048-CONTRACT-07 | CONTRACT | mirrors the input bounds of the canonical schema | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: mirrors the input bounds of the canonical schema | none |
| 048-CONTRACT-08 | CONTRACT | maps every band, driver, mitigation and warning the engine can emit | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: maps every band, driver, mitigation and warning the engine can emit | none |
| 048-CONTRACT-09 | CONTRACT | formats percentages and points without inventing precision | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: formats percentages and points without inventing precision | none |
| 048-CONTRACT-10 | CONTRACT | starts EMPTY with no input and no issue | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: starts EMPTY with no input and no issue | none |
| 048-CONTRACT-11 | CONTRACT | stays PARTIAL until every required field is answered | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: stays PARTIAL until every required field is answered | none |
| 048-CONTRACT-12 | CONTRACT | rejects a typed zero as out of range instead of treating it as unanswered | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: rejects a typed zero as out of range instead of treating it as unanswered | none |
| 048-CONTRACT-13 | CONTRACT | rejects out-of-range values with an out_of_range issue | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: rejects out-of-range values with an out_of_range issue | none |
| 048-CONTRACT-14 | CONTRACT | rejects non-numeric text in a hand-typed field | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: rejects non-numeric text in a hand-typed field | none |
| 048-CONTRACT-15 | CONTRACT | keeps the order EMPTY → INVALID → PARTIAL → READY | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: keeps the order EMPTY → INVALID → PARTIAL → READY | none |
| 048-CONTRACT-16 | CONTRACT | produces a READY input that the canonical schema accepts | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: produces a READY input that the canonical schema accepts | none |
| 048-CONTRACT-17 | CONTRACT | accepts a female non-smoker off cycle without inventing a driver | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: accepts a female non-smoker off cycle without inventing a driver | none |
| 048-CONTRACT-18 | CONTRACT | records no approved source and therefore no citation | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: records no approved source and therefore no citation | none |
| 048-CONTRACT-19 | CONTRACT | links only to real registered tools and transfers nothing automatically | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: links only to real registered tools and transfers nothing automatically | none |
| 048-CONTRACT-20 | CONTRACT | builds a CSV with the inputs, the result and no session identifier | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: builds a CSV with the inputs, the result and no session identifier | none |
| 048-PIPELINE-01 | PIPELINE | valid input produces a contract-valid ToolOutput from the V6 engine | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: valid input produces a contract-valid ToolOutput from the V6 engine | none |
| 048-PIPELINE-02 | PIPELINE | does not reuse the legacy adapter’s invented confidence or reference range | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: does not reuse the legacy adapter’s invented confidence or reference range | none |
| 048-PIPELINE-03 | PIPELINE | matches the standalone V6 engine output exactly (engine is authoritative) | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: matches the standalone V6 engine output exactly (engine is authoritative) | none |
| 048-PIPELINE-04 | PIPELINE | keeps a low-risk input low and emits only the educational warning | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: keeps a low-risk input low and emits only the educational warning | none |
| 048-PIPELINE-05 | PIPELINE | invalid input fails safely with a structured error (no throw, no partial output) | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: invalid input fails safely with a structured error (no throw, no partial output) | none |
| 048-PIPELINE-06 | PIPELINE | rejects invalid input at the schema boundary before the engine runs | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: rejects invalid input at the schema boundary before the engine runs | none |
| 048-PIPELINE-07 | PIPELINE | createToolOutput rejects a malformed envelope (runtime validation guard) | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: createToolOutput rejects a malformed envelope (runtime validation guard) | none |
| 048-PIPELINE-08 | PIPELINE | keeps the engine result type stable for the pipeline export | PASS | E3 | lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: keeps the engine result type stable for the pipeline export | none |
| 048-ENGINE-01 | ENGINE | accumulates documented risk factors into the high band | PASS | E3 | lib/tools/engines/tool-048-cardiovascular-risk.test.ts :: accumulates documented risk factors into the high band | none |
| 048-ENGINE-02 | ENGINE | young healthy profile stays low with no drivers | PASS | E3 | lib/tools/engines/tool-048-cardiovascular-risk.test.ts :: young healthy profile stays low with no drivers | none |
| 048-ENGINE-03 | ENGINE | peaks at 53 for maximal documented inputs — under the 60 ceiling | PASS | E3 | lib/tools/engines/tool-048-cardiovascular-risk.test.ts :: peaks at 53 for maximal documented inputs — under the 60 ceiling | none |
| 048-TEST-01 | TEST | starts EMPTY and invents nothing | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: starts EMPTY and invents nothing | none |
| 048-TEST-02 | TEST | stays PARTIAL until every required field is answered | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: stays PARTIAL until every required field is answered | none |
| 048-TEST-03 | TEST | reports INVALID for an out-of-range age and calculates nothing | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: reports INVALID for an out-of-range age and calculates nothing | none |
| 048-TEST-04 | TEST | reports INVALID for an out-of-range HDL | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: reports INVALID for an out-of-range HDL | none |
| 048-TEST-05 | TEST | treats a typed 0 as out of range instead of unanswered | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: treats a typed 0 as out of range instead of unanswered | none |
| 048-TEST-06 | TEST | calculates through the R6 pipeline once the input is complete | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: calculates through the R6 pipeline once the input is complete | none |
| 048-TEST-07 | TEST | re-renders the estimate and the band when smoking changes | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: re-renders the estimate and the band when smoking changes | none |
| 048-TEST-08 | TEST | reports DEGRADED when the pipeline fails its contract guard | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: reports DEGRADED when the pipeline fails its contract guard | none |
| 048-TEST-09 | TEST | renders all twelve boxes in their fixed order | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: renders all twelve boxes in their fixed order | none |
| 048-TEST-10 | TEST | keeps the history box visible with the real W18 reason | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: keeps the history box visible with the real W18 reason | none |
| 048-TEST-11 | TEST | C1 carries the risk, the band and an honest "not assessed" confidence | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: C1 carries the risk, the band and an honest "not assessed" confidence | none |
| 048-TEST-12 | TEST | C2 states the formula, every contribution and the assumptions | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: C2 states the formula, every contribution and the assumptions | none |
| 048-TEST-13 | TEST | C3 shows the engine drivers, mitigations, warnings, red flags and pending referral | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: C3 shows the engine drivers, mitigations, warnings, red flags and pending referral | none |
| 048-TEST-14 | TEST | C3 does not raise the on-cycle red flag when the user is off cycle | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: C3 does not raise the on-cycle red flag when the user is off cycle | none |
| 048-TEST-15 | TEST | C3 stays calm on a low-risk input | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: C3 stays calm on a low-risk input | none |
| 048-TEST-16 | TEST | C4 does not invent a source, a range or a confidence | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: C4 does not invent a source, a range or a confidence | none |
| 048-TEST-17 | TEST | C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | none |
| 048-TEST-18 | TEST | runs the what-if and sensitivity probes through the same pipeline | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: runs the what-if and sensitivity probes through the same pipeline | none |
| 048-TEST-19 | TEST | shows a band crossing in the what-if rows | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: shows a band crossing in the what-if rows | none |
| 048-TEST-20 | TEST | shows the related tools with a hand-entry rule and no automatic transfer | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: shows the related tools with a hand-entry rule and no automatic transfer | none |
| 048-TEST-21 | TEST | exports a client-side CSV and never adds a session identifier | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: exports a client-side CSV and never adds a session identifier | none |
| 048-TEST-22 | TEST | disables the export until a valid result exists | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: disables the export until a valid result exists | none |
| 048-TEST-23 | TEST | keeps C1 identical in compact mode and shows the five CORE boxes | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: keeps C1 identical in compact mode and shows the five CORE boxes | none |
| 048-TEST-24 | TEST | flips to RTL and localizes the interface in Arabic | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: flips to RTL and localizes the interface in Arabic | none |
| 048-TEST-25 | TEST | never prints a raw engine driver, mitigation or warning code | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: never prints a raw engine driver, mitigation or warning code | none |
| 048-TEST-26 | TEST | labels every control, announces the state and marks an invalid input | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: labels every control, announces the state and marks an invalid input | none |
| 048-TEST-27 | TEST | uses no fixed width that would break a 390 px viewport | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: uses no fixed width that would break a 390 px viewport | none |
| 048-TEST-28 | TEST | has NO persistence and never calls the network, the engine or the adapter | PASS | E3 | components/tools/tool-048-cardiovascular-risk.test.tsx :: has NO persistence and never calls the network, the engine or the adapter | none |
| 048-I18N-01 | I18N | AR/EN parity (en 169 / ar 169 keys) | PASS | E3 | node tool-048-i18n-check.mjs -> I18N_PARITY: OK; en=169 ar=169 | none |
| 048-ROUTE-01 | ROUTE | Canonical route /smarttools/medical-monitoring/tool-048-cardiovascular-risk registered and emitted by the clean build | PASS | E3 | lib/tools/categories.ts:130 -> 'medical-monitoring'; clean build EXITCODE=0 with 506/506 static pages | none |
| 048-P03-01 | P-03 | ResultSchema gate exists before the envelope builder and the raw engine result is never forwarded | PASS | E3 | lib/tools/r6/p03-gate-structural.test.ts covers tool-048-cardiovascular-risk-pipeline.ts (structural assertion) | none |
| 048-P03-02 | P-03 | A mismatched engine result is rejected at runtime with no envelope produced | PARTIAL | E2 | Only structural coverage exists; no runtime negative-branch test targets this pipeline | Add a per-pipeline runtime negative test (mismatched engine result) |
| 048-BROWSER-EN-AR-01 | BROWSER | Authorized EN and AR render on the deployed route | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 048-BROWSER-STATES-5-02 | BROWSER | EMPTY / PARTIAL / INVALID / FULL / DEGRADED exercised in a real browser | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 048-BROWSER-RTL-390-03 | BROWSER | 390 px RTL layout verified in a real browser | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 048-BROWSER-CONSOLE-04 | BROWSER | Console clean: no hydration errors or runtime exceptions | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 048-BROWSER-GENIUS-DOM-05 | BROWSER | GENIUS-12 DOM order verified: 12 boxes, no duplicate shell, no hidden box | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 048-C4-01 | D-C4 | Approved source pack with provenance is attached to clinical claims | NOT_AVAILABLE | E1 | No approved source/provenance pack exists for this tool; the UI renders NOT_AVAILABLE (D-C4 open) | Supply an approved source pack or an explicit owner N/A decision |
| 048-C5-01 | D-C5 | Referral / escalation wording is specialist-approved | NOT_AVAILABLE | E1 | Referral wording remains pending specialist approval (D-C5) | Provide the approved wording pack |
| 048-CLIN-01 | D-CLIN | Clinical / model review sign-off recorded | BLOCKED | E1 | No qualified specialist review exists; self-approval is not permitted (D-CLIN) | Route the unified specialist pack (AR/EN) for review |
| 048-W18-01 | W18 | History capability per W18 | NOT_AVAILABLE | E1 | W18 history is NOT_AVAILABLE: no DB / storage / cloud sync by owner decision | Owner decision on W18 storage; the box must keep stating the real reason |

## What is actually still blocking 100%

- **P-03:** 1 row(s) - 048-P03-02
- **BROWSER:** 5 row(s) - 048-BROWSER-EN-AR-01, 048-BROWSER-STATES-5-02, 048-BROWSER-RTL-390-03, 048-BROWSER-CONSOLE-04, 048-BROWSER-GENIUS-DOM-05
- **D-C4:** 1 row(s) - 048-C4-01
- **D-C5:** 1 row(s) - 048-C5-01
- **D-CLIN:** 1 row(s) - 048-CLIN-01
- **W18:** 1 row(s) - 048-W18-01
