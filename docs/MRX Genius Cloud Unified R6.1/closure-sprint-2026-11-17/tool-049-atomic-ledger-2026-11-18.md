# Tool 049 - tool-049-bone-density - Atomic Acceptance Ledger

**Generated:** 2026-11-18 (Asia/Hebron)
**Evidence environment:** clean export `E:\p03-clean-build-20261118` = baseline `2a647fda` + P-03 commit `37f047a4`, real `node_modules`
**Formula:** B = PASS and E >= E3, divided by applicable rows. `PARTIAL`, `NOT_RUN`, `NOT_AVAILABLE`, `BLOCKED` are never PASS.

- **Result: 61/71 = 85.92%**
- Rows: 71 total; 61 PASS, 1 PARTIAL, 5 NOT_RUN, 3 NOT_AVAILABLE, 1 BLOCKED
- Status: `IN PROGRESS` (engineering). **Not 100% VERIFIED.** No browser evidence, no source pack, no specialist approval.

## Criteria

| ID | Area | Criterion | B | E | Evidence | Gap / Next |
|---|---|---|---|---|---|---|
| 049-CONTRACT-01 | CONTRACT | reproduces the score on every representative input | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces the score on every representative input | none |
| 049-CONTRACT-02 | CONTRACT | reproduces every individual contribution the engine adds | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces every individual contribution the engine adds | none |
| 049-CONTRACT-03 | CONTRACT | caps the resistance, calcium and vitamin D terms as the engine does | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: caps the resistance, calcium and vitamin D terms as the engine does | none |
| 049-CONTRACT-04 | CONTRACT | reproduces the clamp window, including the floor | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces the clamp window, including the floor | none |
| 049-CONTRACT-05 | CONTRACT | reproduces the four band cut-offs exactly | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces the four band cut-offs exactly | none |
| 049-CONTRACT-06 | CONTRACT | reproduces every risk factor the engine can emit, in order | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces every risk factor the engine can emit, in order | none |
| 049-CONTRACT-07 | CONTRACT | reproduces every intervention the engine can emit, in order | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces every intervention the engine can emit, in order | none |
| 049-CONTRACT-08 | CONTRACT | always emits the educational warning and adds the fracture warning below 40 | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: always emits the educational warning and adds the fracture warning below 40 | none |
| 049-CONTRACT-09 | CONTRACT | mirrors the input bounds of the canonical schema | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: mirrors the input bounds of the canonical schema | none |
| 049-CONTRACT-10 | CONTRACT | maps every band, risk factor, intervention and warning the engine can emit | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: maps every band, risk factor, intervention and warning the engine can emit | none |
| 049-CONTRACT-11 | CONTRACT | formats scores without inventing precision | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: formats scores without inventing precision | none |
| 049-CONTRACT-12 | CONTRACT | starts EMPTY with no input and no issue | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: starts EMPTY with no input and no issue | none |
| 049-CONTRACT-13 | CONTRACT | stays PARTIAL until every required field is answered | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: stays PARTIAL until every required field is answered | none |
| 049-CONTRACT-14 | CONTRACT | treats a typed zero as a real value for the zero-valid fields | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: treats a typed zero as a real value for the zero-valid fields | none |
| 049-CONTRACT-15 | CONTRACT | rejects out-of-range values with an out_of_range issue | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: rejects out-of-range values with an out_of_range issue | none |
| 049-CONTRACT-16 | CONTRACT | rejects non-numeric text in a hand-typed field | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: rejects non-numeric text in a hand-typed field | none |
| 049-CONTRACT-17 | CONTRACT | keeps the order EMPTY → INVALID → PARTIAL → READY | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: keeps the order EMPTY → INVALID → PARTIAL → READY | none |
| 049-CONTRACT-18 | CONTRACT | produces a READY input that the canonical schema accepts | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: produces a READY input that the canonical schema accepts | none |
| 049-CONTRACT-19 | CONTRACT | records no approved source and therefore no citation | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: records no approved source and therefore no citation | none |
| 049-CONTRACT-20 | CONTRACT | links only to real registered tools and transfers nothing automatically | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: links only to real registered tools and transfers nothing automatically | none |
| 049-CONTRACT-21 | CONTRACT | builds a CSV with the inputs, the result and no session identifier | PASS | E3 | lib/tools/r6/tool-049-bone-density-contract.test.ts :: builds a CSV with the inputs, the result and no session identifier | none |
| 049-PIPELINE-01 | PIPELINE | valid input produces a contract-valid ToolOutput from the V6 engine | PASS | E3 | lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: valid input produces a contract-valid ToolOutput from the V6 engine | none |
| 049-PIPELINE-02 | PIPELINE | does not reuse the legacy adapter’s invented confidence or reference range | PASS | E3 | lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: does not reuse the legacy adapter’s invented confidence or reference range | none |
| 049-PIPELINE-03 | PIPELINE | matches the standalone V6 engine output exactly (engine is authoritative) | PASS | E3 | lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: matches the standalone V6 engine output exactly (engine is authoritative) | none |
| 049-PIPELINE-04 | PIPELINE | clamps a worst-case input to 0 (high-risk) | PASS | E3 | lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: clamps a worst-case input to 0 (high-risk) | none |
| 049-PIPELINE-05 | PIPELINE | invalid input fails safely with a structured error (no throw, no partial output) | PASS | E3 | lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: invalid input fails safely with a structured error (no throw, no partial output) | none |
| 049-PIPELINE-06 | PIPELINE | rejects invalid input at the schema boundary before the engine runs | PASS | E3 | lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: rejects invalid input at the schema boundary before the engine runs | none |
| 049-PIPELINE-07 | PIPELINE | createToolOutput rejects a malformed envelope (runtime validation guard) | PASS | E3 | lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: createToolOutput rejects a malformed envelope (runtime validation guard) | none |
| 049-PIPELINE-08 | PIPELINE | keeps the engine result type stable for the pipeline export | PASS | E3 | lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: keeps the engine result type stable for the pipeline export | none |
| 049-ENGINE-01 | ENGINE | strong lifestyle offsets mild AI exposure into the optimal band | PASS | E3 | lib/tools/engines/tool-049-bone-density.test.ts :: strong lifestyle offsets mild AI exposure into the optimal band | none |
| 049-ENGINE-02 | ENGINE | sedentary smoker with long AI exposure lands high-risk | PASS | E3 | lib/tools/engines/tool-049-bone-density.test.ts :: sedentary smoker with long AI exposure lands high-risk | none |
| 049-ENGINE-03 | ENGINE | clamps the score to the 0-100 range | PASS | E3 | lib/tools/engines/tool-049-bone-density.test.ts :: clamps the score to the 0-100 range | none |
| 049-TEST-01 | TEST | starts EMPTY and invents nothing | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: starts EMPTY and invents nothing | none |
| 049-TEST-02 | TEST | stays PARTIAL until every required field is answered | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: stays PARTIAL until every required field is answered | none |
| 049-TEST-03 | TEST | reports INVALID for an out-of-range age and calculates nothing | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: reports INVALID for an out-of-range age and calculates nothing | none |
| 049-TEST-04 | TEST | reports INVALID for an out-of-range vitamin D value | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: reports INVALID for an out-of-range vitamin D value | none |
| 049-TEST-05 | TEST | treats a typed 0 as a real value for the zero-valid fields | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: treats a typed 0 as a real value for the zero-valid fields | none |
| 049-TEST-06 | TEST | calculates through the R6 pipeline once the input is complete | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: calculates through the R6 pipeline once the input is complete | none |
| 049-TEST-07 | TEST | re-renders the score when smoking changes | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: re-renders the score when smoking changes | none |
| 049-TEST-08 | TEST | reports DEGRADED when the pipeline fails its contract guard | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: reports DEGRADED when the pipeline fails its contract guard | none |
| 049-TEST-09 | TEST | renders all twelve boxes in their fixed order | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: renders all twelve boxes in their fixed order | none |
| 049-TEST-10 | TEST | keeps the history box visible with the real W18 reason | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: keeps the history box visible with the real W18 reason | none |
| 049-TEST-11 | TEST | C1 carries the score, the band and an honest "not assessed" confidence | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: C1 carries the score, the band and an honest "not assessed" confidence | none |
| 049-TEST-12 | TEST | C2 states the formula, every contribution and the assumptions | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: C2 states the formula, every contribution and the assumptions | none |
| 049-TEST-13 | TEST | C3 shows the engine risk factors, interventions, warnings and pending referral | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: C3 shows the engine risk factors, interventions, warnings and pending referral | none |
| 049-TEST-14 | TEST | C3 stays calm on a high-scoring non-smoker with no AI exposure | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: C3 stays calm on a high-scoring non-smoker with no AI exposure | none |
| 049-TEST-15 | TEST | C4 does not invent a source, a range or a confidence | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: C4 does not invent a source, a range or a confidence | none |
| 049-TEST-16 | TEST | C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | none |
| 049-TEST-17 | TEST | runs the what-if and sensitivity probes through the same pipeline | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: runs the what-if and sensitivity probes through the same pipeline | none |
| 049-TEST-18 | TEST | shows the related tools with a hand-entry rule and no automatic transfer | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: shows the related tools with a hand-entry rule and no automatic transfer | none |
| 049-TEST-19 | TEST | exports a client-side CSV and never adds a session identifier | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: exports a client-side CSV and never adds a session identifier | none |
| 049-TEST-20 | TEST | disables the export until a valid result exists | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: disables the export until a valid result exists | none |
| 049-TEST-21 | TEST | keeps C1 identical in compact mode and shows the five CORE boxes | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: keeps C1 identical in compact mode and shows the five CORE boxes | none |
| 049-TEST-22 | TEST | flips to RTL and localizes the interface in Arabic | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: flips to RTL and localizes the interface in Arabic | none |
| 049-TEST-23 | TEST | never prints a raw engine risk factor, intervention or warning code | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: never prints a raw engine risk factor, intervention or warning code | none |
| 049-TEST-24 | TEST | labels every control, announces the state and marks an invalid input | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: labels every control, announces the state and marks an invalid input | none |
| 049-TEST-25 | TEST | uses no fixed width that would break a 390 px viewport | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: uses no fixed width that would break a 390 px viewport | none |
| 049-TEST-26 | TEST | has NO persistence and never calls the network, the engine or the adapter | PASS | E3 | components/tools/tool-049-bone-density.test.tsx :: has NO persistence and never calls the network, the engine or the adapter | none |
| 049-I18N-01 | I18N | AR/EN parity (en 174 / ar 174 keys) | PASS | E3 | node tool-049-i18n-check.mjs -> I18N_PARITY: OK; en=174 ar=174 | none |
| 049-ROUTE-01 | ROUTE | Canonical route /smarttools/medical-monitoring/tool-049-bone-density registered and emitted by the clean build | PASS | E3 | lib/tools/categories.ts:131 -> 'medical-monitoring'; clean build EXITCODE=0 with 506/506 static pages | none |
| 049-P03-01 | P-03 | ResultSchema gate exists before the envelope builder and the raw engine result is never forwarded | PASS | E3 | lib/tools/r6/p03-gate-structural.test.ts covers tool-049-bone-density-pipeline.ts (structural assertion) | none |
| 049-P03-02 | P-03 | A mismatched engine result is rejected at runtime with no envelope produced | PARTIAL | E2 | Only structural coverage exists; no runtime negative-branch test targets this pipeline | Add a per-pipeline runtime negative test (mismatched engine result) |
| 049-BROWSER-EN-AR-01 | BROWSER | Authorized EN and AR render on the deployed route | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 049-BROWSER-STATES-5-02 | BROWSER | EMPTY / PARTIAL / INVALID / FULL / DEGRADED exercised in a real browser | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 049-BROWSER-RTL-390-03 | BROWSER | 390 px RTL layout verified in a real browser | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 049-BROWSER-CONSOLE-04 | BROWSER | Console clean: no hydration errors or runtime exceptions | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 049-BROWSER-GENIUS-DOM-05 | BROWSER | GENIUS-12 DOM order verified: 12 boxes, no duplicate shell, no hidden box | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 049-C4-01 | D-C4 | Approved source pack with provenance is attached to clinical claims | NOT_AVAILABLE | E1 | No approved source/provenance pack exists for this tool; the UI renders NOT_AVAILABLE (D-C4 open) | Supply an approved source pack or an explicit owner N/A decision |
| 049-C5-01 | D-C5 | Referral / escalation wording is specialist-approved | NOT_AVAILABLE | E1 | Referral wording remains pending specialist approval (D-C5) | Provide the approved wording pack |
| 049-CLIN-01 | D-CLIN | Clinical / model review sign-off recorded | BLOCKED | E1 | No qualified specialist review exists; self-approval is not permitted (D-CLIN) | Route the unified specialist pack (AR/EN) for review |
| 049-W18-01 | W18 | History capability per W18 | NOT_AVAILABLE | E1 | W18 history is NOT_AVAILABLE: no DB / storage / cloud sync by owner decision | Owner decision on W18 storage; the box must keep stating the real reason |

## What is actually still blocking 100%

- **P-03:** 1 row(s) - 049-P03-02
- **BROWSER:** 5 row(s) - 049-BROWSER-EN-AR-01, 049-BROWSER-STATES-5-02, 049-BROWSER-RTL-390-03, 049-BROWSER-CONSOLE-04, 049-BROWSER-GENIUS-DOM-05
- **D-C4:** 1 row(s) - 049-C4-01
- **D-C5:** 1 row(s) - 049-C5-01
- **D-CLIN:** 1 row(s) - 049-CLIN-01
- **W18:** 1 row(s) - 049-W18-01
