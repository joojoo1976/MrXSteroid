# Tool 045 - tool-045-cycle-break-planner - Atomic Acceptance Ledger

**Generated:** 2026-11-18 (Asia/Hebron)
**Evidence environment:** clean export `E:\p03-clean-build-20261118` = baseline `2a647fda` + P-03 commit `37f047a4`, real `node_modules`
**Formula:** B = PASS and E >= E3, divided by applicable rows. `PARTIAL`, `NOT_RUN`, `NOT_AVAILABLE`, `BLOCKED` are never PASS.

- **Result: 59/68 = 86.76%**
- Rows: 68 total; 59 PASS, 0 PARTIAL, 5 NOT_RUN, 3 NOT_AVAILABLE, 1 BLOCKED
- Status: `IN PROGRESS` (engineering). **Not 100% VERIFIED.** No browser evidence, no source pack, no specialist approval.

## Criteria

| ID | Area | Criterion | B | E | Evidence | Gap / Next |
|---|---|---|---|---|---|---|
| 045-CONTRACT-01 | CONTRACT | reproduces the 5× half-life clearance and the 7-day buffer | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: reproduces the 5× half-life clearance and the 7-day buffer | none |
| 045-CONTRACT-02 | CONTRACT | uses the longest half-life when several compounds are entered | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: uses the longest half-life when several compounds are entered | none |
| 045-CONTRACT-03 | CONTRACT | reproduces every PCT duration boundary | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: reproduces every PCT duration boundary | none |
| 045-CONTRACT-04 | CONTRACT | reproduces the four milestones and the total baseline week | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: reproduces the four milestones and the total baseline week | none |
| 045-CONTRACT-05 | CONTRACT | reproduces the two warning triggers and only those | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: reproduces the two warning triggers and only those | none |
| 045-CONTRACT-06 | CONTRACT | mirrors the input bounds of the canonical schema | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: mirrors the input bounds of the canonical schema | none |
| 045-CONTRACT-07 | CONTRACT | maps every warning the engine can emit, and never prints a raw code | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: maps every warning the engine can emit, and never prints a raw code | none |
| 045-CONTRACT-08 | CONTRACT | formats whole days and weeks without inventing precision | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: formats whole days and weeks without inventing precision | none |
| 045-CONTRACT-09 | CONTRACT | shows the engine milestone labels in the requested locale | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: shows the engine milestone labels in the requested locale | none |
| 045-CONTRACT-10 | CONTRACT | starts EMPTY with no input and no issue | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: starts EMPTY with no input and no issue | none |
| 045-CONTRACT-11 | CONTRACT | stays PARTIAL until every required field is answered | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: stays PARTIAL until every required field is answered | none |
| 045-CONTRACT-12 | CONTRACT | ignores an entirely empty extra row but refuses a half-filled one | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: ignores an entirely empty extra row but refuses a half-filled one | none |
| 045-CONTRACT-13 | CONTRACT | rejects a typed zero cycle length and out-of-range values | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: rejects a typed zero cycle length and out-of-range values | none |
| 045-CONTRACT-14 | CONTRACT | rejects non-numeric text in a hand-typed field | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: rejects non-numeric text in a hand-typed field | none |
| 045-CONTRACT-15 | CONTRACT | rejects an out-of-range suppression estimate | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: rejects an out-of-range suppression estimate | none |
| 045-CONTRACT-16 | CONTRACT | produces a READY input that the canonical schema accepts | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: produces a READY input that the canonical schema accepts | none |
| 045-CONTRACT-17 | CONTRACT | keeps the order EMPTY → INVALID → PARTIAL → READY | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: keeps the order EMPTY → INVALID → PARTIAL → READY | none |
| 045-CONTRACT-18 | CONTRACT | never invents a suppression estimate or a half-life | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: never invents a suppression estimate or a half-life | none |
| 045-CONTRACT-19 | CONTRACT | records no approved source and therefore no citation | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: records no approved source and therefore no citation | none |
| 045-CONTRACT-20 | CONTRACT | links only to real registered tools and transfers nothing automatically | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: links only to real registered tools and transfers nothing automatically | none |
| 045-CONTRACT-21 | CONTRACT | builds a CSV with the inputs, the result and no session identifier | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-contract.test.ts :: builds a CSV with the inputs, the result and no session identifier | none |
| 045-PIPELINE-01 | PIPELINE | valid input produces a contract-valid ToolOutput from the V6 engine | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts :: valid input produces a contract-valid ToolOutput from the V6 engine | none |
| 045-PIPELINE-02 | PIPELINE | matches the standalone V6 engine output exactly (engine is authoritative) | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts :: matches the standalone V6 engine output exactly (engine is authoritative) | none |
| 045-PIPELINE-03 | PIPELINE | invalid input fails safely with a structured error (no throw, no partial output) | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts :: invalid input fails safely with a structured error (no throw, no partial output) | none |
| 045-PIPELINE-04 | PIPELINE | rejects invalid input at the schema boundary before the engine runs | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts :: rejects invalid input at the schema boundary before the engine runs | none |
| 045-PIPELINE-05 | PIPELINE | createToolOutput rejects a malformed envelope (runtime validation guard) | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts :: createToolOutput rejects a malformed envelope (runtime validation guard) | none |
| 045-PIPELINE-06 | PIPELINE | keeps the engine result type stable for the pipeline export | PASS | E3 | lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts :: keeps the engine result type stable for the pipeline export | none |
| 045-ENGINE-01 | ENGINE | 12-week Test E cycle: 23-day clear, PCT opens week 5 for 6 weeks | PASS | E3 | lib/tools/engines/tool-045-cycle-break-planner.test.ts :: 12-week Test E cycle: 23-day clear, PCT opens week 5 for 6 weeks | none |
| 045-ENGINE-02 | ENGINE | heavily suppressive stacks add the longer-recovery warning | PASS | E3 | lib/tools/engines/tool-045-cycle-break-planner.test.ts :: heavily suppressive stacks add the longer-recovery warning | none |
| 045-TEST-01 | TEST | starts EMPTY and invents nothing | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: starts EMPTY and invents nothing | none |
| 045-TEST-02 | TEST | stays PARTIAL until every required field is answered | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: stays PARTIAL until every required field is answered | none |
| 045-TEST-03 | TEST | stays PARTIAL when a compound row is only half-filled | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: stays PARTIAL when a compound row is only half-filled | none |
| 045-TEST-04 | TEST | reports INVALID for a typed zero cycle length and calculates nothing | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: reports INVALID for a typed zero cycle length and calculates nothing | none |
| 045-TEST-05 | TEST | reports INVALID for an out-of-range half-life | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: reports INVALID for an out-of-range half-life | none |
| 045-TEST-06 | TEST | calculates through the R6 pipeline once the input is complete | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: calculates through the R6 pipeline once the input is complete | none |
| 045-TEST-07 | TEST | re-renders the plan when the cycle length crosses a PCT boundary | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: re-renders the plan when the cycle length crosses a PCT boundary | none |
| 045-TEST-08 | TEST | reports DEGRADED when the pipeline fails its contract guard | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: reports DEGRADED when the pipeline fails its contract guard | none |
| 045-TEST-09 | TEST | adds and removes compound rows without inventing values | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: adds and removes compound rows without inventing values | none |
| 045-TEST-10 | TEST | renders all twelve boxes in their fixed order | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: renders all twelve boxes in their fixed order | none |
| 045-TEST-11 | TEST | keeps the history box visible with the real W18 reason | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: keeps the history box visible with the real W18 reason | none |
| 045-TEST-12 | TEST | C1 carries the clearance plan, the milestones and an honest confidence | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: C1 carries the clearance plan, the milestones and an honest confidence | none |
| 045-TEST-13 | TEST | C2 states the formula with the engine limits, the assumptions and the uncertainty | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: C2 states the formula with the engine limits, the assumptions and the uncertainty | none |
| 045-TEST-14 | TEST | C3 raises both engine warnings and their red flags for a suppressive stack without baseline bloodwork | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: C3 raises both engine warnings and their red flags for a suppressive stack without baseline bloodwork | none |
| 045-TEST-15 | TEST | C4 does not invent a source: it says NOT_AVAILABLE with the pending review | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: C4 does not invent a source: it says NOT_AVAILABLE with the pending review | none |
| 045-TEST-16 | TEST | C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | none |
| 045-TEST-17 | TEST | runs the what-if and sensitivity probes through the same pipeline | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: runs the what-if and sensitivity probes through the same pipeline | none |
| 045-TEST-18 | TEST | shows the related tools with a hand-entry rule and no automatic transfer | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: shows the related tools with a hand-entry rule and no automatic transfer | none |
| 045-TEST-19 | TEST | exports a client-side CSV and never adds a session identifier | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: exports a client-side CSV and never adds a session identifier | none |
| 045-TEST-20 | TEST | disables the export until a valid result exists | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: disables the export until a valid result exists | none |
| 045-TEST-21 | TEST | keeps C1 identical in compact mode and shows the five CORE boxes | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: keeps C1 identical in compact mode and shows the five CORE boxes | none |
| 045-TEST-22 | TEST | flips to RTL and localizes the interface in Arabic | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: flips to RTL and localizes the interface in Arabic | none |
| 045-TEST-23 | TEST | never prints a raw engine warning code | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: never prints a raw engine warning code | none |
| 045-TEST-24 | TEST | labels every control, announces the state and marks an invalid input | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: labels every control, announces the state and marks an invalid input | none |
| 045-TEST-25 | TEST | uses no fixed width that would break a 390 px viewport | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: uses no fixed width that would break a 390 px viewport | none |
| 045-TEST-26 | TEST | has NO persistence and never calls the network, the engine or the adapter | PASS | E3 | components/tools/tool-045-cycle-break-planner.test.tsx :: has NO persistence and never calls the network, the engine or the adapter | none |
| 045-I18N-01 | I18N | AR/EN parity (en 140 / ar 140 keys) | PASS | E3 | node tool-045-i18n-check.mjs -> I18N_PARITY: OK; en=140 ar=140 | none |
| 045-ROUTE-01 | ROUTE | Canonical route /smarttools/cycle-management/tool-045-cycle-break-planner registered and emitted by the clean build | PASS | E3 | lib/tools/categories.ts:126 -> 'cycle-management'; clean build EXITCODE=0 with 506/506 static pages | none |
| 045-P03-01 | P-03 | ResultSchema gate exists before the envelope builder and the raw engine result is never forwarded | PASS | E3 | lib/tools/r6/p03-gate-structural.test.ts covers tool-045-cycle-break-planner-pipeline.ts (structural assertion) | none |
| 045-P03-02 | P-03 | A mismatched engine result is rejected at runtime with no envelope produced | PASS | E3 | p03-result-schema-validation.test.ts exercises this pipeline's invalid/missing result path | none |
| 045-BROWSER-EN-AR-01 | BROWSER | Authorized EN and AR render on the deployed route | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 045-BROWSER-STATES-5-02 | BROWSER | EMPTY / PARTIAL / INVALID / FULL / DEGRADED exercised in a real browser | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 045-BROWSER-RTL-390-03 | BROWSER | 390 px RTL layout verified in a real browser | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 045-BROWSER-CONSOLE-04 | BROWSER | Console clean: no hydration errors or runtime exceptions | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 045-BROWSER-GENIUS-DOM-05 | BROWSER | GENIUS-12 DOM order verified: 12 boxes, no duplicate shell, no hidden box | NOT_RUN | E0 | NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | Provide an authorized browser session; then run the prepared Playwright spec and attach trace/screenshots |
| 045-C4-01 | D-C4 | Approved source pack with provenance is attached to clinical claims | NOT_AVAILABLE | E1 | No approved source/provenance pack exists for this tool; the UI renders NOT_AVAILABLE (D-C4 open) | Supply an approved source pack or an explicit owner N/A decision |
| 045-C5-01 | D-C5 | Referral / escalation wording is specialist-approved | NOT_AVAILABLE | E1 | Referral wording remains pending specialist approval (D-C5) | Provide the approved wording pack |
| 045-CLIN-01 | D-CLIN | Clinical / model review sign-off recorded | BLOCKED | E1 | No qualified specialist review exists; self-approval is not permitted (D-CLIN) | Route the unified specialist pack (AR/EN) for review |
| 045-W18-01 | W18 | History capability per W18 | NOT_AVAILABLE | E1 | W18 history is NOT_AVAILABLE: no DB / storage / cloud sync by owner decision | Owner decision on W18 storage; the box must keep stating the real reason |

## What is actually still blocking 100%

- **BROWSER:** 5 row(s) - 045-BROWSER-EN-AR-01, 045-BROWSER-STATES-5-02, 045-BROWSER-RTL-390-03, 045-BROWSER-CONSOLE-04, 045-BROWSER-GENIUS-DOM-05
- **D-C4:** 1 row(s) - 045-C4-01
- **D-C5:** 1 row(s) - 045-C5-01
- **D-CLIN:** 1 row(s) - 045-CLIN-01
- **W18:** 1 row(s) - 045-W18-01
