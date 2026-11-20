# TOOL 048 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `048` · `mrx.tool.048-cardiovascular-risk` |
| Canonical name / slug | `Cardiovascular Risk Assessor` / `tool-048-cardiovascular-risk` |
| Category | medical-monitoring |
| Canonical route | `/smarttools/medical-monitoring/tool-048-cardiovascular-risk` |
| Batch | Batch 2 |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`; 384 dirty worktree entries observed and preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation; no code/contract/schema/ledger/git/build/test/server/browser/calculator writes or executions. |
| Source-ledger refs (observed SHA-256) | atomic CSV `AA5F7B4BEE9912AC44A788C5D500DA6E7A86D16EE2989F1C37D308FA77B33437`; atomic MD `5AF87DF0FDC1E4647F83CCD2A95DEDFA13C31F115CA8934A9015179A46AD3021`; summary `9DCC39CD319B3C7D9CF9C7D035849D6A00DAE9F3742659AE6FB93255D4C1DB0F`; closure MD `C1FE5D96733A82ADA032F0A5E7D8B06FA2C3A5E65E482704C2BBBE54F64531A7`; closure CSV `7736DF214096FDABB9713BEB8A7453E205263D6CABB6D50D167D7EB32C31F0C5` |
| Reference refs (observed SHA-256) | standard `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9`; W2 `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A`; W4b `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263`; B3 `CF3CBE8677F2C5513CE7A3ACEE7E9B5A315A97E6A5CB255FC6DD430CB98E62DF`; 039 profile `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |
| Tool decision | **CONTINUE / REPAIR (P-03 + gates)** — canonical atomic completion `62/72 = 86.11%`; no owner acceptance implied |

## A. Tool Identity and Historical Lineage

- Registry `mrx.tool.048-cardiovascular-risk` / `tool-048-cardiovascular-risk`; category `medical-monitoring`; route `/smarttools/medical-monitoring/tool-048-cardiovascular-risk`; flat route redirects.
- 048 is in `R6_EXEMPT_SLUGS` (`manifest.ts` SHA `4AF80EA997096017…`); tool-owned boxes per W4b; no shared shell change.
- Engine `assessCardiovascularRisk` first shipped in commit `0aa2b406ed4970eb5abbf1e3f30f1db0982cd3f7` (2026-10-11). Atomic ledger generated 2026-11-18 from clean export `2a647fda`+`37f047a4`; closure ledger records historic `8d7e406c` and SSO-protected `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL` (historic only).
- Original requirements: 72-row atomic ledger canonical; 18-row closure grid operational. No tool-specific requirements CSV/acceptance calculator.
- Preserved status `IN PROGRESS` / `NOT CLOSED`, **Not 100% VERIFIED**. D-C4/C5/CLIN/W18 open; `048-P03-02` PARTIAL E2. No owner acceptance.

## B. Original and R6.1 Requirements

**Canonical denominator recoverability:** FULLY RECOVERABLE from `tool-048-atomic-ledger-2026-11-18.csv|.md` (72 rows), corroborated by B3/W2. All 72 rows APPLICABLE; 0 NOT_APPLICABLE. Gate states are not applicability removals. No invented denominator.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| 048-CONTRACT-01 | A048-001 | reproduces the additive risk arithmetic on every representative input | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: reproduces the additive risk arithmetic on every representative input | none; counted PASS(E3+) |
| 048-CONTRACT-02 | A048-002 | reproduces every individual contribution the engine adds | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: reproduces every individual contribution the engine adds | none; counted PASS(E3+) |
| 048-CONTRACT-03 | A048-003 | never reaches the educational ceiling from schema-valid inputs, and says so | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: never reaches the educational ceiling from schema-valid inputs, and says so | none; counted PASS(E3+) |
| 048-CONTRACT-04 | A048-004 | reproduces the four band cut-offs exactly | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: reproduces the four band cut-offs exactly | none; counted PASS(E3+) |
| 048-CONTRACT-05 | A048-005 | reproduces every driver threshold and the 1:1 mitigation mapping in order | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: reproduces every driver threshold and the 1:1 mitigation mapping in order | none; counted PASS(E3+) |
| 048-CONTRACT-06 | A048-006 | always emits the educational warning and adds the consultation warning at 20 % | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: always emits the educational warning and adds the consultation warning at 20 % | none; counted PASS(E3+) |
| 048-CONTRACT-07 | A048-007 | mirrors the input bounds of the canonical schema | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: mirrors the input bounds of the canonical schema | none; counted PASS(E3+) |
| 048-CONTRACT-08 | A048-008 | maps every band, driver, mitigation and warning the engine can emit | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: maps every band, driver, mitigation and warning the engine can emit | none; counted PASS(E3+) |
| 048-CONTRACT-09 | A048-009 | formats percentages and points without inventing precision | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: formats percentages and points without inventing precision | none; counted PASS(E3+) |
| 048-CONTRACT-10 | A048-010 | starts EMPTY with no input and no issue | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: starts EMPTY with no input and no issue | none; counted PASS(E3+) |
| 048-CONTRACT-11 | A048-011 | stays PARTIAL until every required field is answered | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: stays PARTIAL until every required field is answered | none; counted PASS(E3+) |
| 048-CONTRACT-12 | A048-012 | rejects a typed zero as out of range instead of treating it as unanswered | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: rejects a typed zero as out of range instead of treating it as unanswered | none; counted PASS(E3+) |
| 048-CONTRACT-13 | A048-013 | rejects out-of-range values with an out_of_range issue | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: rejects out-of-range values with an out_of_range issue | none; counted PASS(E3+) |
| 048-CONTRACT-14 | A048-014 | rejects non-numeric text in a hand-typed field | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: rejects non-numeric text in a hand-typed field | none; counted PASS(E3+) |
| 048-CONTRACT-15 | A048-015 | keeps the order EMPTY → INVALID → PARTIAL → READY | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: keeps the order EMPTY → INVALID → PARTIAL → READY | none; counted PASS(E3+) |
| 048-CONTRACT-16 | A048-016 | produces a READY input that the canonical schema accepts | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: produces a READY input that the canonical schema accepts | none; counted PASS(E3+) |
| 048-CONTRACT-17 | A048-017 | accepts a female non-smoker off cycle without inventing a driver | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: accepts a female non-smoker off cycle without inventing a driver | none; counted PASS(E3+) |
| 048-CONTRACT-18 | A048-018 | records no approved source and therefore no citation | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: records no approved source and therefore no citation | none; counted PASS(E3+) |
| 048-CONTRACT-19 | A048-019 | links only to real registered tools and transfers nothing automatically | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: links only to real registered tools and transfers nothing automatically | none; counted PASS(E3+) |
| 048-CONTRACT-20 | A048-020 | builds a CSV with the inputs, the result and no session identifier | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts :: builds a CSV with the inputs, the result and no session identifier | none; counted PASS(E3+) |
| 048-PIPELINE-01 | A048-021 | valid input produces a contract-valid ToolOutput from the V6 engine | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: valid input produces a contract-valid ToolOutput from the V6 engine | none; counted PASS(E3+) |
| 048-PIPELINE-02 | A048-022 | does not reuse the legacy adapter’s invented confidence or reference range | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: does not reuse the legacy adapter’s invented confidence or reference range | none; counted PASS(E3+) |
| 048-PIPELINE-03 | A048-023 | matches the standalone V6 engine output exactly (engine is authoritative) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: matches the standalone V6 engine output exactly (engine is authoritative) | none; counted PASS(E3+) |
| 048-PIPELINE-04 | A048-024 | keeps a low-risk input low and emits only the educational warning | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: keeps a low-risk input low and emits only the educational warning | none; counted PASS(E3+) |
| 048-PIPELINE-05 | A048-025 | invalid input fails safely with a structured error (no throw, no partial output) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: invalid input fails safely with a structured error (no throw, no partial output) | none; counted PASS(E3+) |
| 048-PIPELINE-06 | A048-026 | rejects invalid input at the schema boundary before the engine runs | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: rejects invalid input at the schema boundary before the engine runs | none; counted PASS(E3+) |
| 048-PIPELINE-07 | A048-027 | createToolOutput rejects a malformed envelope (runtime validation guard) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: createToolOutput rejects a malformed envelope (runtime validation guard) | none; counted PASS(E3+) |
| 048-PIPELINE-08 | A048-028 | keeps the engine result type stable for the pipeline export | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts :: keeps the engine result type stable for the pipeline export | none; counted PASS(E3+) |
| 048-ENGINE-01 | A048-029 | accumulates documented risk factors into the high band | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-048-cardiovascular-risk.test.ts :: accumulates documented risk factors into the high band | none; counted PASS(E3+) |
| 048-ENGINE-02 | A048-030 | young healthy profile stays low with no drivers | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-048-cardiovascular-risk.test.ts :: young healthy profile stays low with no drivers | none; counted PASS(E3+) |
| 048-ENGINE-03 | A048-031 | peaks at 53 for maximal documented inputs — under the 60 ceiling | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-048-cardiovascular-risk.test.ts :: peaks at 53 for maximal documented inputs — under the 60 ceiling | none; counted PASS(E3+) |
| 048-TEST-01 | A048-032 | starts EMPTY and invents nothing | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: starts EMPTY and invents nothing | none; counted PASS(E3+) |
| 048-TEST-02 | A048-033 | stays PARTIAL until every required field is answered | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: stays PARTIAL until every required field is answered | none; counted PASS(E3+) |
| 048-TEST-03 | A048-034 | reports INVALID for an out-of-range age and calculates nothing | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: reports INVALID for an out-of-range age and calculates nothing | none; counted PASS(E3+) |
| 048-TEST-04 | A048-035 | reports INVALID for an out-of-range HDL | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: reports INVALID for an out-of-range HDL | none; counted PASS(E3+) |
| 048-TEST-05 | A048-036 | treats a typed 0 as out of range instead of unanswered | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: treats a typed 0 as out of range instead of unanswered | none; counted PASS(E3+) |
| 048-TEST-06 | A048-037 | calculates through the R6 pipeline once the input is complete | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: calculates through the R6 pipeline once the input is complete | none; counted PASS(E3+) |
| 048-TEST-07 | A048-038 | re-renders the estimate and the band when smoking changes | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: re-renders the estimate and the band when smoking changes | none; counted PASS(E3+) |
| 048-TEST-08 | A048-039 | reports DEGRADED when the pipeline fails its contract guard | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: reports DEGRADED when the pipeline fails its contract guard | none; counted PASS(E3+) |
| 048-TEST-09 | A048-040 | renders all twelve boxes in their fixed order | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: renders all twelve boxes in their fixed order | none; counted PASS(E3+) |
| 048-TEST-10 | A048-041 | keeps the history box visible with the real W18 reason | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: keeps the history box visible with the real W18 reason | none; counted PASS(E3+) |
| 048-TEST-11 | A048-042 | C1 carries the risk, the band and an honest "not assessed" confidence | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: C1 carries the risk, the band and an honest "not assessed" confidence | none; counted PASS(E3+) |
| 048-TEST-12 | A048-043 | C2 states the formula, every contribution and the assumptions | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: C2 states the formula, every contribution and the assumptions | none; counted PASS(E3+) |
| 048-TEST-13 | A048-044 | C3 shows the engine drivers, mitigations, warnings, red flags and pending referral | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: C3 shows the engine drivers, mitigations, warnings, red flags and pending referral | none; counted PASS(E3+) |
| 048-TEST-14 | A048-045 | C3 does not raise the on-cycle red flag when the user is off cycle | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: C3 does not raise the on-cycle red flag when the user is off cycle | none; counted PASS(E3+) |
| 048-TEST-15 | A048-046 | C3 stays calm on a low-risk input | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: C3 stays calm on a low-risk input | none; counted PASS(E3+) |
| 048-TEST-16 | A048-047 | C4 does not invent a source, a range or a confidence | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: C4 does not invent a source, a range or a confidence | none; counted PASS(E3+) |
| 048-TEST-17 | A048-048 | C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | none; counted PASS(E3+) |
| 048-TEST-18 | A048-049 | runs the what-if and sensitivity probes through the same pipeline | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: runs the what-if and sensitivity probes through the same pipeline | none; counted PASS(E3+) |
| 048-TEST-19 | A048-050 | shows a band crossing in the what-if rows | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: shows a band crossing in the what-if rows | none; counted PASS(E3+) |
| 048-TEST-20 | A048-051 | shows the related tools with a hand-entry rule and no automatic transfer | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: shows the related tools with a hand-entry rule and no automatic transfer | none; counted PASS(E3+) |
| 048-TEST-21 | A048-052 | exports a client-side CSV and never adds a session identifier | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: exports a client-side CSV and never adds a session identifier | none; counted PASS(E3+) |
| 048-TEST-22 | A048-053 | disables the export until a valid result exists | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: disables the export until a valid result exists | none; counted PASS(E3+) |
| 048-TEST-23 | A048-054 | keeps C1 identical in compact mode and shows the five CORE boxes | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: keeps C1 identical in compact mode and shows the five CORE boxes | none; counted PASS(E3+) |
| 048-TEST-24 | A048-055 | flips to RTL and localizes the interface in Arabic | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: flips to RTL and localizes the interface in Arabic | none; counted PASS(E3+) |
| 048-TEST-25 | A048-056 | never prints a raw engine driver, mitigation or warning code | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: never prints a raw engine driver, mitigation or warning code | none; counted PASS(E3+) |
| 048-TEST-26 | A048-057 | labels every control, announces the state and marks an invalid input | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: labels every control, announces the state and marks an invalid input | none; counted PASS(E3+) |
| 048-TEST-27 | A048-058 | uses no fixed width that would break a 390 px viewport | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: uses no fixed width that would break a 390 px viewport | none; counted PASS(E3+) |
| 048-TEST-28 | A048-059 | has NO persistence and never calls the network, the engine or the adapter | APPLICABLE | B=PASS; E=E3; components/tools/tool-048-cardiovascular-risk.test.tsx :: has NO persistence and never calls the network, the engine or the adapter | none; counted PASS(E3+) |
| 048-I18N-01 | A048-060 | AR/EN parity (en 169 / ar 169 keys) | APPLICABLE | B=PASS; E=E3; node tool-048-i18n-check.mjs -> I18N_PARITY: OK; en=169 ar=169 | none; counted PASS(E3+) |
| 048-ROUTE-01 | A048-061 | Canonical route /smarttools/medical-monitoring/tool-048-cardiovascular-risk registered and emitted by the clean build | APPLICABLE | B=PASS; E=E3; lib/tools/categories.ts:130 -> 'medical-monitoring'; clean build EXITCODE=0 with 506/506 static pages | none; counted PASS(E3+) |
| 048-P03-01 | A048-062 | ResultSchema gate exists before the envelope builder and the raw engine result is never forwarded | APPLICABLE | B=PASS; E=E3; lib/tools/r6/p03-gate-structural.test.ts covers tool-048-cardiovascular-risk-pipeline.ts (structural assertion) | none; counted PASS(E3+) |
| 048-P03-02 | A048-063 | A mismatched engine result is rejected at runtime with no envelope produced | APPLICABLE | B=PARTIAL; E=E2; Only structural coverage exists; no runtime negative-branch test targets this pipeline | PARTIAL/E2; not PASS; Add a per-pipeline runtime negative test (mismatched engine result) |
| 048-BROWSER-EN-AR-01 | A048-064 | Authorized EN and AR render on the deployed route | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 048-BROWSER-STATES-5-02 | A048-065 | EMPTY / PARTIAL / INVALID / FULL / DEGRADED exercised in a real browser | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 048-BROWSER-RTL-390-03 | A048-066 | 390 px RTL layout verified in a real browser | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 048-BROWSER-CONSOLE-04 | A048-067 | Console clean: no hydration errors or runtime exceptions | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 048-BROWSER-GENIUS-DOM-05 | A048-068 | GENIUS-12 DOM order verified: 12 boxes, no duplicate shell, no hidden box | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 048-C4-01 | A048-069 | Approved source pack with provenance is attached to clinical claims | APPLICABLE | B=NOT_AVAILABLE; E=E1; No approved source/provenance pack exists for this tool; the UI renders NOT_AVAILABLE (D-C4 open) | NOT_AVAILABLE/E1; owner gate open; not counted |
| 048-C5-01 | A048-070 | Referral / escalation wording is specialist-approved | APPLICABLE | B=NOT_AVAILABLE; E=E1; Referral wording remains pending specialist approval (D-C5) | NOT_AVAILABLE/E1; owner gate open; not counted |
| 048-CLIN-01 | A048-071 | Clinical / model review sign-off recorded | APPLICABLE | B=BLOCKED; E=E1; No qualified specialist review exists; self-approval is not permitted (D-CLIN) | BLOCKED/E1; specialist sign-off required; not counted |
| 048-W18-01 | A048-072 | History capability per W18 | APPLICABLE | B=NOT_AVAILABLE; E=E1; W18 history is NOT_AVAILABLE: no DB / storage / cloud sync by owner decision | NOT_AVAILABLE/E1; owner gate open; not counted |

**Counts:** applicable **72**; justified N/A **0**; unmapped **0**. `PASS(E3+)` = **62/72 = 86.11%** (B3 recorded/corrected unchanged). B-states: 62 PASS E3, 1 PARTIAL (`048-P03-02` E2), 5 browser NOT_RUN E0, 3 NOT_AVAILABLE E1, 1 BLOCKED E1. E2 static PASS: 0. Closure grid recorded `1/18 = 5.56%` — operational only.

**18-row closure-grid reconciliation:**

| Closure grid ID | Grid B/E | Atomic group | Reconciliation |
|---|---|---|---|
| ENG-PIPELINE | PASS/E2 | `048-PIPELINE-01..08`, `048-P03-01` | atomic E3 supersedes grid |
| STATE-5 | PASS/E2 | `048-CONTRACT-10..17`, `048-TEST-01..08` | E3 |
| UI-GENIUS12 | PASS/E2 | `048-TEST-09..17`, `048-TEST-23..27` | E3 component; DOM E0 |
| I18N-PARITY | PASS/E3 | `048-I18N-EVIDENCE-01`, `048-I18N-01` | 169/169 |
| EXPORT-CSV | PASS/E2 | `048-CONTRACT-20`, `048-TEST-21..22` | E3 |
| TEST-FOCUSED | PARTIAL/E2 | engine/contract/pipeline/component suites | recorded E3, NOT_RUN here |
| BUILD-TSC | PARTIAL/E2 | `048-ROUTE-01` | proxy |
| PREVIEW-ROUTE | NOT_RUN/E0 | `048-ROUTE-01` registration | live blocked |
| 5 browser buckets | NOT_RUN/E0 | `048-BROWSER-*` | E0 |
| C4/C5/CLIN/W18 | NOT_AVAILABLE/BLOCKED E1 | `048-C4-01`, `048-C5-01`, `048-CLIN-01`, `048-W18-01` | owner gates |
| P03-PIPELINE | NOT_IMPLEMENTED/E1 | `048-P03-01` E3, `048-P03-02` PARTIAL E2 | runtime-negative gap real |

**Source authority conflict log:** atomic (72) vs grid (18) → atomic; historic HEAD/deployment vs `37f047a4` → no E4 transfer; `048-P03-02` E2 PARTIAL must not be relabeled; D-C4/C5/CLIN/W18 open.

## C. Existing Architecture and Implementation

| Exact path | Git status | SHA-256 (first 16) | Role / test | Status |
|---|---|---|---|---|
| `lib/tools/engines/tool-048-cardiovascular-risk.ts` + `.test.ts` | tracked, clean | `15235849697F8EC`, `1C9BF75F85740DE` | pure engine + suite | implemented; NOT_RUN here |
| `lib/tools/schemas/tool-048-cardiovascular-risk.ts` | tracked, clean | `87C192FF9B45C2BA` | Zod contract | E2 static |
| `lib/tools/r6/tool-048-cardiovascular-risk-pipeline.ts` + `.test.ts` | tracked, clean | `32F003ED7584E13C`, `76DB681C80562A55` | pipeline + suite | implemented |
| `lib/tools/r6/tool-048-cardiovascular-risk-contract.ts` + `.test.ts` | tracked, clean | `9A8CBB1F8EE82B52`, `1917E930AA360538` | UI/field/CSV contract | implemented |
| `lib/tools/adapters/tool-048-cardiovascular-risk.ts` | tracked, clean | `F4F63FCA7DFF2764` | legacy adapter | preserved (invented confidence rejected) |
| `components/tools/tool-048-cardiovascular-risk.tsx` + `.test.tsx` | tracked, clean | `24B9F7079AA942D3`, `4951F7A04DB53B3C` | UI/state + suite | implemented |
| `components/tools/tool-048-cardiovascular-risk.genius.tsx` | tracked, clean | `0FBCF9BA5AB85A29` | 12 tool-owned boxes | implemented |
| `i18n/tool-048-cardiovascular-risk.json` | tracked, clean | `CEE33E7AC17DF228` | EN/AR 169/169 | ledger E3 |
| `app/smarttools/tool-048-cardiovascular-risk/page.tsx` | tracked, clean | `F46A11BF77ED6E5B` | legacy redirect | static |
| shared `registry.ts`, `categories.ts`, `manifest.ts`, `p03-*.test.ts` | tracked, clean | `39891CB9…`, `E2CC7F40…`, `4AF80EA9…`, `99C28B98…`/`4A25901F…` | identity/ownership/P-03 | no edit |

Dependencies: React, Zod, `createToolSchema`, `createToolOutput`/`isToolOutput`, `requireTool`/`buildSeoLinks`, i18n helper; no DB/network/storage. No build/test/browser run here.

## D. Math Engine and Equation Audit

- Inputs: `age` 18–90, `sex ∈ {male,female}`, `smoker` bool, `systolic_bp` 80–220 mmHg, `total_cholesterol` 100–400 mg/dL, `hdl` 20–110 mg/dL, `on_cycle` bool.
- Equations: `raw = (age−18)×0.35 + max(0,sbp−120)×0.08 + max(0,tc−180)×0.04 + max(0,45−hdl)×0.1 + (smoker?4:0) + (on_cycle?3:0) + (male?1:0)`; `risk_pct_10yr = min(60,max(0,round(raw)))`; bands `<5 low`, `<10 moderate`, `<20 elevated`, else `high`; six fixed driver thresholds map 1:1 to mitigations in order; warnings `educational_not_clinical_ascvd` always, `consult_physician` at ≥20%. Explicitly **not** the clinical ASCVD PCE.
- Pure, deterministic, no I/O/time/random; typed zero rejected as out-of-range per schema for these fields; recorded engine test `048-ENGINE-03` confirms peak 53 < ceiling 60. Recorded E3, not re-run here. No approved source pack (D-C4 open).

## E. Pipeline and Schema Audit

Chain: `CardioRiskInputSchema` → `createToolSchema` → pipeline → unmodified `assessCardiovascularRisk` → `CardioRiskResultSchema` → `createToolOutput` → `isToolOutput`; invalid input short-circuits. `048-P03-01` PASS E3 (structural); `048-P03-02` **PARTIAL E2** — no runtime negative-branch test. Do not promote. Shared P-03 files unchanged/approval-gated.

## F. AI and Intelligence Capabilities

**NotApplicable** — deterministic educational additive heuristic; no model/prompt/provider/RAG/prediction. Confidence is honestly "not assessed" (`048-TEST-11`). RuntimeVerified: No (E4 NOT_RUN).

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next |
|---|---|---|---|---|---|---|---|---|
| C1 risk + band + honest confidence | YES | YES | YES | E3 `048-TEST-11` | NO | component row | E4 | DOM check |
| C2 formula/contributions/assumptions | YES | YES | YES | E3 `048-TEST-12` | NO | component row | E4 | DOM check |
| C3 drivers/mitigations/warnings/referral | YES | YES | YES | E3 `048-TEST-13..15` | NO | component row | D-C5/CLIN | wording |
| C4 sources | YES | YES | `NOT_AVAILABLE` | E3 `048-TEST-16` | NO | `048-C4-01` E1 | D-C4 | approved pack |
| C5 next steps/session rating | YES | YES | YES | E3 `048-TEST-17` | NO | component row | E4 | DOM check |
| 12 boxes fixed order | YES | YES | YES | E3 `048-TEST-09` | NO | component row | browser E0 | DOM verify |
| Box 11 W18 | YES | YES | `NOT_AVAILABLE` | E3 `048-TEST-10` | NO | `048-W18-01` E1 | W18 | owner decision |
| Compact/full parity + what-if band crossing | YES | YES | YES | E3 `048-TEST-19/23` | NO | component row | none | preserve |

Tool-owned boxes; compact selector uses boxes 2,3,7,9,12 (labeling note preserved).

## H. Dynamic Results and UI Maturity

Static: 5 states, debounce, signature gating, typed-zero rejection, RTL `dir`, a11y, 390px, CSV gating, no persistence/network. Component E3 recorded (28 rows); integration E3 recorded; true-clean not re-run (NOT_RUN); browser E4 5 rows NOT_RUN. No empty→zero coercion or invented confidence/source/AI.

## I. Cross-Tool and Data Integration

Registered links only; hand-entry rule, no automatic transfer (`048-CONTRACT-19`, `048-TEST-20`); no payload/session/cloud sync. W18 history box honest NOT_AVAILABLE. Cross-tool integration static/ledger-backed, not browser verified.

## J. Safety, Sources and Privacy

Schema bounds; no network/auth/storage. CSV has no session identifier. Warnings: educational-not-clinical, physician consult at ≥20%, drivers/mitigations; D-C4 source pack absent, D-C5 wording unapproved, D-CLIN blocked, W18 open. Never a diagnosis or clinical PCE substitute.

## K. Localization and Browser Maturity

i18n `en=169/ar=169` E3; RTL/localization `048-TEST-24` E3. Browser: 5 rows E0 NOT_RUN. E4 requires authorized SSO session + preview pinned `37f047a4` + Deployment ID; historic deployment not transferable.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command | Environment | SHA (first 16) | Date | Result | Level | Reproducibility | Compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-048-ENG | `048-ENGINE-01..03` | engine test | `npx vitest run --config vitest.config.ts lib/tools/engines/tool-048-cardiovascular-risk.test.ts lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts lib/tools/r6/tool-048-cardiovascular-risk-contract.test.ts components/tools/tool-048-cardiovascular-risk.test.tsx` | recorded clean export; NOT_RUN here | `1C9BF75F85740DE` | 2026-11-18 | recorded PASS | E3 | recorded env | tracked at `37f047a4` |
| E-048-PIPE | `048-PIPELINE-01..08` | pipeline test | same | same | `76DB681C80562A55` | as above | recorded PASS | E3 | as above | as above |
| E-048-CON | `048-CONTRACT-01..20` | contract test | same | same | `1917E930AA360538` | as above | recorded PASS | E3 | as above | as above |
| E-048-UI | `048-TEST-01..28` | component test | same | same | `4951F7A04DB53B3C` | as above | recorded PASS | E3 | as above | as above |
| E-048-P03 | `048-P03-01`, `048-P03-02` | shared P-03 tests | `npx vitest run --config vitest.config.ts lib/tools/r6/p03-gate-structural.test.ts lib/tools/r6/p03-result-schema-validation.test.ts` | same | `99C28B98…`, `4A25901F…` | 2026-11-19 | structural E3; runtime-negative PARTIAL E2 | E3/E2 | as above | shared; no edit |
| E-048-I18N | `048-I18N-01` | i18n check | `node tool-048-i18n-check.mjs` | recorded; NOT_RUN here | JSON `CEE33E7AC17DF228` | 2026-11-18 | 169/169 PASS | E3 | as above | preserved |
| E-048-BROWSER | 5 browser rows | prepared spec | authorized SSO + pinned preview | NOT_AVAILABLE | — | 2026-11-19 | NOT_RUN | E0 | no | external gate |

Build/tsc/eslint/browser/calculator: **NOT_RUN / NOT EXECUTED**; E2 never promoted.

## M. Defect and Gap Register

**Implementation gaps:** one genuine engineering gap — `048-P03-02` runtime negative-branch test missing. All other code complete.

**Evidence/gate gaps:** G-048-P03RUNTIME (HIGH, `048-P03-02`, `lib/tools/r6/p03-result-schema-validation.test.ts` + `tool-048-cardiovascular-risk-pipeline.ts`, PARTIAL E2 vs reject, scoped test needed); G-048-BROWSER (HIGH, 5 `048-BROWSER-*`, E0 vs E4, SSO); G-048-C4 (HIGH, `048-C4-01`, genius C4 box, D-C4); G-048-C5 (MEDIUM, C5 box, D-C5); G-048-CLIN (HIGH, review record, BLOCKED); G-048-W18 (MEDIUM, history box, W18); G-048-FRESH (INFO, recorded E3 not re-run). Regression risk low for all evidence/gate fixes.

## N. Development Maturity Matrix (S0–S11)

| Stage | Component | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|
| S0 Identity | registry/route | S2 | S4 route load | SSO |
| S1 Requirements | 72-row ledger | S3 | owner ratification | none |
| S2 Architecture | engine/schema/pipeline/UI | S3 | S4 runtime | no fresh run |
| S3 Engine | `assessCardiovascularRisk` | S3 | S4 | E4 |
| S4 Pipeline | pipeline + P-03 | S3 structural / **S2 runtime-negative** | S3 runtime-negative | scoped test |
| S5 UI | 5 states/debounce | S3 | S4 | E4 |
| S6 AI/CORE5/GENIUS12 | tool-owned boxes | S3 | S4 DOM | E4 |
| S7 Cross-tool/safety | links, W18, gates | S2 | S5 approvals | owner |
| S8 Testing | suites + i18n + P-03 | S3 partial | S3 P-03 close | scoped test |
| S9 True-clean | `37f047a4` export | S3 recorded | fresh log | scope |
| S10 Browser E4 | 5 checks | S0 | S4 | SSO/pinned preview |
| S11 External | owner/E5 | NOT_VERIFIED | decision | outside |

Engine S9 + browser S0 reported separately.

## O. Comparison with Tool 039

| Dimension | Status | Reason | Action |
|---|---|---|---|
| Architecture | APPLICABLE | layered pure pipeline / tool-owned boxes | Preserve |
| Engine | APPLICABLE | deterministic bounded additive heuristic | Preserve |
| Validation | APPLICABLE | input/result/envelope guards, honest confidence | Preserve |
| AI | NOT_APPLICABLE | no model/prompt/prediction | Preserve non-AI |
| Dynamic results | APPLICABLE | 5 states, debounce, signature | Preserve |
| CORE-5 compact | PARTIALLY_APPLICABLE | selector/label note as 039 | Fix docs only if authorized |
| GENIUS-12 | APPLICABLE | 12 fixed boxes | Preserve |
| Cross-tool | PARTIALLY_APPLICABLE | hand-entry, W18 open | Preserve boundary |
| Safety/sources | APPLICABLE | warnings present, packs unapproved | Extend after owner |
| Testing | PARTIALLY_APPLICABLE | E3 recorded; P-03 runtime-negative PARTIAL | Extend scoped test |
| Browser current E4 | NOT_AVAILABLE | no authorized pinned preview | Extend after gate |
| Browser historic transfer | NOT_VERIFIED | historic deployment not transferable | Preserve history |

No similarity score; no shared-shell edit.

## P. Next Development Tasks

| # | Exact file | Change | Tests | Dependencies | Risk | Outcome | Acceptance |
|---|---|---|---|---|---|---|---|
| 1 | `lib/tools/r6/p03-result-schema-validation.test.ts` | add 048 runtime negative branch | isolated vitest | scoped approval | low | P03-02 → E3 | no envelope on invalid result |
| 2 | prepared browser spec / preview | authorized E4 run | Playwright | SSO, pinned `37f047a4`, Deployment ID | low | 5 rows E4 | PASS E4 |
| 3 | `components/tools/tool-048-cardiovascular-risk.genius.tsx` + owner record | gate artifacts | review sign-off | owner/specialist | medium | gates closed | approvals recorded |

Reuse passing code; no shared-component change.

## Q. Current Tool Decision

**Decision: CONTINUE / REPAIR (P-03 + gates).** Completion `100 × 62 / 72 = 86.11%` E3+; closure grid `1/18 = 5.56%` is operational history. Preserve implementation; add one scoped runtime-negative test, then close browser and owner gates. Status preserved `IN PROGRESS` / **Not 100% VERIFIED**. **No owner acceptance implied.**

## Integrity note

Body-before-hash convention: SHA below computed over bytes preceding the final hash line; whole-file SHA reported in delivery response. No original edited to reconcile a hash.

Observed on-disk SHA-256 (body before this line): `8C118B850917C52CEF9ECD0EED8FF5101B394B23C7D0DB0DA57F35E894E8831A`
