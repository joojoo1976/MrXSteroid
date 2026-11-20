# TOOL 049 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `049` · `mrx.tool.049-bone-density` |
| Canonical name / slug | `Bone Density Optimizer` / `tool-049-bone-density` |
| Category | medical-monitoring |
| Canonical route | `/smarttools/medical-monitoring/tool-049-bone-density` |
| Batch | Batch 2 |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`; 384 dirty worktree entries observed and preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation; no code/contract/schema/ledger/git/build/test/server/browser/calculator writes or executions. |
| Source-ledger refs (observed SHA-256) | atomic CSV `246F0B30DD8480FC1039DF660F340B455B50ECB1D6B35471AB26C1C94D492ED8`; atomic MD `57A5BB3C96D9546DF5F132648DCDBBEE00F9003B3932B445FF1EBB03E7EBF409`; summary `9DCC39CD319B3C7D9CF9C7D035849D6A00DAE9F3742659AE6FB93255D4C1DB0F`; closure MD `3BE34D885E681FE784DD2BC5B5EACE3067DB5D0BD33F192B028CB02F470E4186`; closure CSV `D1115209F0AD0F733FF9B21EE9DD9F6A26B27C2295A8E68260824DEEB84614C4` |
| Reference refs (observed SHA-256) | standard `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9`; W2 `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A`; W4b `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263`; B3 `CF3CBE8677F2C5513CE7A3ACEE7E9B5A315A97E6A5CB255FC6DD430CB98E62DF`; 039 profile `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |
| Tool decision | **CONTINUE / REPAIR (P-03 + gates)** — canonical atomic completion `61/71 = 85.92%`; no owner acceptance implied |

## A. Tool Identity and Historical Lineage

- Registry `mrx.tool.049-bone-density` / `tool-049-bone-density`, category `medical-monitoring`, route `/smarttools/medical-monitoring/tool-049-bone-density`; flat route redirects. `registry.ts` SHA `39891CB920E35838…`, `categories.ts` SHA `E2CC7F4086904107…`.
- 049 is in `R6_EXEMPT_SLUGS` (`manifest.ts` SHA `4AF80EA997096017…`); W4b classifies it as tool-owned boxes. No shared-shell edit proposed.
- Engine `assessBoneDensity` first shipped in commit `0aa2b406ed4970eb5abbf1e3f30f1db0982cd3f7` (2026-10-11). Atomic ledger generated 2026-11-18 from clean export `2a647fda`+`37f047a4`; closure ledger records historic `8d7e406c`, SSO-protected deployment `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL`, and stale slug `tool-049-bone-density-optimizer` (historic only).
- Original requirements: 71-row atomic ledger canonical; 18-row closure grid operational. No tool-specific requirements CSV/acceptance calculator exists.
- Preserved status `IN PROGRESS` / `NOT CLOSED`, **Not 100% VERIFIED**. D-C4/C5/CLIN/W18 open; `049-P03-02` PARTIAL E2. No owner acceptance.

## B. Original and R6.1 Requirements

**Canonical denominator recoverability:** FULLY RECOVERABLE from `tool-049-atomic-ledger-2026-11-18.csv|.md` (71 rows), corroborated by B3 and W2. All 71 rows APPLICABLE; 0 NOT_APPLICABLE. `NOT_AVAILABLE`/`BLOCKED` are gate states, not applicability removals. No denominator invented.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| 049-CONTRACT-01 | A049-001 | reproduces the score on every representative input | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces the score on every representative input | none; counted PASS(E3+) |
| 049-CONTRACT-02 | A049-002 | reproduces every individual contribution the engine adds | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces every individual contribution the engine adds | none; counted PASS(E3+) |
| 049-CONTRACT-03 | A049-003 | caps the resistance, calcium and vitamin D terms as the engine does | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: caps the resistance, calcium and vitamin D terms as the engine does | none; counted PASS(E3+) |
| 049-CONTRACT-04 | A049-004 | reproduces the clamp window, including the floor | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces the clamp window, including the floor | none; counted PASS(E3+) |
| 049-CONTRACT-05 | A049-005 | reproduces the four band cut-offs exactly | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces the four band cut-offs exactly | none; counted PASS(E3+) |
| 049-CONTRACT-06 | A049-006 | reproduces every risk factor the engine can emit, in order | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces every risk factor the engine can emit, in order | none; counted PASS(E3+) |
| 049-CONTRACT-07 | A049-007 | reproduces every intervention the engine can emit, in order | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: reproduces every intervention the engine can emit, in order | none; counted PASS(E3+) |
| 049-CONTRACT-08 | A049-008 | always emits the educational warning and adds the fracture warning below 40 | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: always emits the educational warning and adds the fracture warning below 40 | none; counted PASS(E3+) |
| 049-CONTRACT-09 | A049-009 | mirrors the input bounds of the canonical schema | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: mirrors the input bounds of the canonical schema | none; counted PASS(E3+) |
| 049-CONTRACT-10 | A049-010 | maps every band, risk factor, intervention and warning the engine can emit | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: maps every band, risk factor, intervention and warning the engine can emit | none; counted PASS(E3+) |
| 049-CONTRACT-11 | A049-011 | formats scores without inventing precision | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: formats scores without inventing precision | none; counted PASS(E3+) |
| 049-CONTRACT-12 | A049-012 | starts EMPTY with no input and no issue | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: starts EMPTY with no input and no issue | none; counted PASS(E3+) |
| 049-CONTRACT-13 | A049-013 | stays PARTIAL until every required field is answered | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: stays PARTIAL until every required field is answered | none; counted PASS(E3+) |
| 049-CONTRACT-14 | A049-014 | treats a typed zero as a real value for the zero-valid fields | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: treats a typed zero as a real value for the zero-valid fields | none; counted PASS(E3+) |
| 049-CONTRACT-15 | A049-015 | rejects out-of-range values with an out_of_range issue | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: rejects out-of-range values with an out_of_range issue | none; counted PASS(E3+) |
| 049-CONTRACT-16 | A049-016 | rejects non-numeric text in a hand-typed field | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: rejects non-numeric text in a hand-typed field | none; counted PASS(E3+) |
| 049-CONTRACT-17 | A049-017 | keeps the order EMPTY → INVALID → PARTIAL → READY | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: keeps the order EMPTY → INVALID → PARTIAL → READY | none; counted PASS(E3+) |
| 049-CONTRACT-18 | A049-018 | produces a READY input that the canonical schema accepts | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: produces a READY input that the canonical schema accepts | none; counted PASS(E3+) |
| 049-CONTRACT-19 | A049-019 | records no approved source and therefore no citation | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: records no approved source and therefore no citation | none; counted PASS(E3+) |
| 049-CONTRACT-20 | A049-020 | links only to real registered tools and transfers nothing automatically | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: links only to real registered tools and transfers nothing automatically | none; counted PASS(E3+) |
| 049-CONTRACT-21 | A049-021 | builds a CSV with the inputs, the result and no session identifier | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-contract.test.ts :: builds a CSV with the inputs, the result and no session identifier | none; counted PASS(E3+) |
| 049-PIPELINE-01 | A049-022 | valid input produces a contract-valid ToolOutput from the V6 engine | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: valid input produces a contract-valid ToolOutput from the V6 engine | none; counted PASS(E3+) |
| 049-PIPELINE-02 | A049-023 | does not reuse the legacy adapter’s invented confidence or reference range | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: does not reuse the legacy adapter’s invented confidence or reference range | none; counted PASS(E3+) |
| 049-PIPELINE-03 | A049-024 | matches the standalone V6 engine output exactly (engine is authoritative) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: matches the standalone V6 engine output exactly (engine is authoritative) | none; counted PASS(E3+) |
| 049-PIPELINE-04 | A049-025 | clamps a worst-case input to 0 (high-risk) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: clamps a worst-case input to 0 (high-risk) | none; counted PASS(E3+) |
| 049-PIPELINE-05 | A049-026 | invalid input fails safely with a structured error (no throw, no partial output) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: invalid input fails safely with a structured error (no throw, no partial output) | none; counted PASS(E3+) |
| 049-PIPELINE-06 | A049-027 | rejects invalid input at the schema boundary before the engine runs | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: rejects invalid input at the schema boundary before the engine runs | none; counted PASS(E3+) |
| 049-PIPELINE-07 | A049-028 | createToolOutput rejects a malformed envelope (runtime validation guard) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: createToolOutput rejects a malformed envelope (runtime validation guard) | none; counted PASS(E3+) |
| 049-PIPELINE-08 | A049-029 | keeps the engine result type stable for the pipeline export | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-049-bone-density-pipeline.test.ts :: keeps the engine result type stable for the pipeline export | none; counted PASS(E3+) |
| 049-ENGINE-01 | A049-030 | strong lifestyle offsets mild AI exposure into the optimal band | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-049-bone-density.test.ts :: strong lifestyle offsets mild AI exposure into the optimal band | none; counted PASS(E3+) |
| 049-ENGINE-02 | A049-031 | sedentary smoker with long AI exposure lands high-risk | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-049-bone-density.test.ts :: sedentary smoker with long AI exposure lands high-risk | none; counted PASS(E3+) |
| 049-ENGINE-03 | A049-032 | clamps the score to the 0-100 range | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-049-bone-density.test.ts :: clamps the score to the 0-100 range | none; counted PASS(E3+) |
| 049-TEST-01 | A049-033 | starts EMPTY and invents nothing | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: starts EMPTY and invents nothing | none; counted PASS(E3+) |
| 049-TEST-02 | A049-034 | stays PARTIAL until every required field is answered | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: stays PARTIAL until every required field is answered | none; counted PASS(E3+) |
| 049-TEST-03 | A049-035 | reports INVALID for an out-of-range age and calculates nothing | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: reports INVALID for an out-of-range age and calculates nothing | none; counted PASS(E3+) |
| 049-TEST-04 | A049-036 | reports INVALID for an out-of-range vitamin D value | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: reports INVALID for an out-of-range vitamin D value | none; counted PASS(E3+) |
| 049-TEST-05 | A049-037 | treats a typed 0 as a real value for the zero-valid fields | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: treats a typed 0 as a real value for the zero-valid fields | none; counted PASS(E3+) |
| 049-TEST-06 | A049-038 | calculates through the R6 pipeline once the input is complete | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: calculates through the R6 pipeline once the input is complete | none; counted PASS(E3+) |
| 049-TEST-07 | A049-039 | re-renders the score when smoking changes | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: re-renders the score when smoking changes | none; counted PASS(E3+) |
| 049-TEST-08 | A049-040 | reports DEGRADED when the pipeline fails its contract guard | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: reports DEGRADED when the pipeline fails its contract guard | none; counted PASS(E3+) |
| 049-TEST-09 | A049-041 | renders all twelve boxes in their fixed order | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: renders all twelve boxes in their fixed order | none; counted PASS(E3+) |
| 049-TEST-10 | A049-042 | keeps the history box visible with the real W18 reason | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: keeps the history box visible with the real W18 reason | none; counted PASS(E3+) |
| 049-TEST-11 | A049-043 | C1 carries the score, the band and an honest "not assessed" confidence | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: C1 carries the score, the band and an honest "not assessed" confidence | none; counted PASS(E3+) |
| 049-TEST-12 | A049-044 | C2 states the formula, every contribution and the assumptions | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: C2 states the formula, every contribution and the assumptions | none; counted PASS(E3+) |
| 049-TEST-13 | A049-045 | C3 shows the engine risk factors, interventions, warnings and pending referral | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: C3 shows the engine risk factors, interventions, warnings and pending referral | none; counted PASS(E3+) |
| 049-TEST-14 | A049-046 | C3 stays calm on a high-scoring non-smoker with no AI exposure | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: C3 stays calm on a high-scoring non-smoker with no AI exposure | none; counted PASS(E3+) |
| 049-TEST-15 | A049-047 | C4 does not invent a source, a range or a confidence | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: C4 does not invent a source, a range or a confidence | none; counted PASS(E3+) |
| 049-TEST-16 | A049-048 | C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | none; counted PASS(E3+) |
| 049-TEST-17 | A049-049 | runs the what-if and sensitivity probes through the same pipeline | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: runs the what-if and sensitivity probes through the same pipeline | none; counted PASS(E3+) |
| 049-TEST-18 | A049-050 | shows the related tools with a hand-entry rule and no automatic transfer | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: shows the related tools with a hand-entry rule and no automatic transfer | none; counted PASS(E3+) |
| 049-TEST-19 | A049-051 | exports a client-side CSV and never adds a session identifier | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: exports a client-side CSV and never adds a session identifier | none; counted PASS(E3+) |
| 049-TEST-20 | A049-052 | disables the export until a valid result exists | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: disables the export until a valid result exists | none; counted PASS(E3+) |
| 049-TEST-21 | A049-053 | keeps C1 identical in compact mode and shows the five CORE boxes | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: keeps C1 identical in compact mode and shows the five CORE boxes | none; counted PASS(E3+) |
| 049-TEST-22 | A049-054 | flips to RTL and localizes the interface in Arabic | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: flips to RTL and localizes the interface in Arabic | none; counted PASS(E3+) |
| 049-TEST-23 | A049-055 | never prints a raw engine risk factor, intervention or warning code | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: never prints a raw engine risk factor, intervention or warning code | none; counted PASS(E3+) |
| 049-TEST-24 | A049-056 | labels every control, announces the state and marks an invalid input | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: labels every control, announces the state and marks an invalid input | none; counted PASS(E3+) |
| 049-TEST-25 | A049-057 | uses no fixed width that would break a 390 px viewport | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: uses no fixed width that would break a 390 px viewport | none; counted PASS(E3+) |
| 049-TEST-26 | A049-058 | has NO persistence and never calls the network, the engine or the adapter | APPLICABLE | B=PASS; E=E3; components/tools/tool-049-bone-density.test.tsx :: has NO persistence and never calls the network, the engine or the adapter | none; counted PASS(E3+) |
| 049-I18N-01 | A049-059 | AR/EN parity (en 174 / ar 174 keys) | APPLICABLE | B=PASS; E=E3; node tool-049-i18n-check.mjs -> I18N_PARITY: OK; en=174 ar=174 | none; counted PASS(E3+) |
| 049-ROUTE-01 | A049-060 | Canonical route /smarttools/medical-monitoring/tool-049-bone-density registered and emitted by the clean build | APPLICABLE | B=PASS; E=E3; lib/tools/categories.ts:131 -> 'medical-monitoring'; clean build EXITCODE=0 with 506/506 static pages | none; counted PASS(E3+) |
| 049-P03-01 | A049-061 | ResultSchema gate exists before the envelope builder and the raw engine result is never forwarded | APPLICABLE | B=PASS; E=E3; lib/tools/r6/p03-gate-structural.test.ts covers tool-049-bone-density-pipeline.ts (structural assertion) | none; counted PASS(E3+) |
| 049-P03-02 | A049-062 | A mismatched engine result is rejected at runtime with no envelope produced | APPLICABLE | B=PARTIAL; E=E2; Only structural coverage exists; no runtime negative-branch test targets this pipeline | PARTIAL/E2; not PASS; Add a per-pipeline runtime negative test (mismatched engine result) |
| 049-BROWSER-EN-AR-01 | A049-063 | Authorized EN and AR render on the deployed route | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 049-BROWSER-STATES-5-02 | A049-064 | EMPTY / PARTIAL / INVALID / FULL / DEGRADED exercised in a real browser | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 049-BROWSER-RTL-390-03 | A049-065 | 390 px RTL layout verified in a real browser | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 049-BROWSER-CONSOLE-04 | A049-066 | Console clean: no hydration errors or runtime exceptions | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 049-BROWSER-GENIUS-DOM-05 | A049-067 | GENIUS-12 DOM order verified: 12 boxes, no duplicate shell, no hidden box | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 049-C4-01 | A049-068 | Approved source pack with provenance is attached to clinical claims | APPLICABLE | B=NOT_AVAILABLE; E=E1; No approved source/provenance pack exists for this tool; the UI renders NOT_AVAILABLE (D-C4 open) | NOT_AVAILABLE/E1; owner gate open; not counted |
| 049-C5-01 | A049-069 | Referral / escalation wording is specialist-approved | APPLICABLE | B=NOT_AVAILABLE; E=E1; Referral wording remains pending specialist approval (D-C5) | NOT_AVAILABLE/E1; owner gate open; not counted |
| 049-CLIN-01 | A049-070 | Clinical / model review sign-off recorded | APPLICABLE | B=BLOCKED; E=E1; No qualified specialist review exists; self-approval is not permitted (D-CLIN) | BLOCKED/E1; specialist sign-off required; not counted |
| 049-W18-01 | A049-071 | History capability per W18 | APPLICABLE | B=NOT_AVAILABLE; E=E1; W18 history is NOT_AVAILABLE: no DB / storage / cloud sync by owner decision | NOT_AVAILABLE/E1; owner gate open; not counted |

**Counts:** applicable **71**; justified N/A **0**; unmapped **0**. `PASS(E3+)` = **61/71 = 85.92%** (B3 recorded/corrected unchanged). B-states: 61 PASS E3, 1 PARTIAL (`049-P03-02`, E2), 5 browser NOT_RUN E0, 3 NOT_AVAILABLE E1, 1 BLOCKED E1. E2 static PASS: 0. 18-row closure grid recorded `1/18 = 5.56%` — operational only.

**18-row closure-grid reconciliation:**

| Closure grid ID | Grid B/E | Atomic group | Reconciliation |
|---|---|---|---|
| ENG-PIPELINE | PASS/E2 | `049-PIPELINE-01..08`, `049-P03-01` | atomic E3 supersedes grid |
| STATE-5 | PASS/E2 | `049-CONTRACT-12..18`, `049-TEST-01..08` | E3 |
| UI-GENIUS12 | PASS/E2 | `049-TEST-09..25` | E3 component; DOM still E0 |
| I18N-PARITY | PASS/E3 | `049-I18N-EVIDENCE-01`, `049-I18N-01` | 174/174 |
| EXPORT-CSV | PASS/E2 | `049-CONTRACT-21`, `049-TEST-19..20` | E3 |
| TEST-FOCUSED | PARTIAL/E2 | engine/contract/pipeline/component/i18n suites | recorded E3, NOT_RUN here |
| BUILD-TSC | PARTIAL/E2 | `049-ROUTE-01` | partial proxy |
| PREVIEW-ROUTE | NOT_RUN/E0 | `049-ROUTE-01` registration | live preview blocked |
| 5 browser buckets | NOT_RUN/E0 | `049-BROWSER-*` | E0 preserved |
| C4/C5/CLIN/W18 | NOT_AVAILABLE/BLOCKED E1 | `049-C4-01`, `049-C5-01`, `049-CLIN-01`, `049-W18-01` | owner gates |
| P03-PIPELINE | NOT_IMPLEMENTED/E1 | `049-P03-01` E3, `049-P03-02` PARTIAL E2 | runtime-negative gap real |

**Source authority conflict log:** atomic (71) vs grid (18) → atomic; closure slug `tool-049-bone-density-optimizer` vs registry `tool-049-bone-density` → registry/atomic canonical, grid historic; historic HEAD/deployment vs `37f047a4` → no E4 transfer; `049-P03-02` E2 PARTIAL must not be relabeled; D-C4/C5/CLIN/W18 open.

## C. Existing Architecture and Implementation

| Exact path | Git status | SHA-256 (first 16) | Role / test | Status |
|---|---|---|---|---|
| `lib/tools/engines/tool-049-bone-density.ts` + `.test.ts` | tracked, clean | `85EAD58849F22E20`, `B5DF5EA40E0E3B6D` | pure engine + suite | implemented; NOT_RUN here |
| `lib/tools/schemas/tool-049-bone-density.ts` | tracked, clean | `2428F5F7C1521745` | Zod contract | E2 static |
| `lib/tools/r6/tool-049-bone-density-pipeline.ts` + `.test.ts` | tracked, clean | `F5DA305A50791756`, `D974C6E7C25DC3E` | pipeline + suite | implemented |
| `lib/tools/r6/tool-049-bone-density-contract.ts` + `.test.ts` | tracked, clean | `B19609FDE18B6A3C`, `22BFC1737FC78D5C` | UI/field/CSV contract | implemented |
| `lib/tools/adapters/tool-049-bone-density.ts` | tracked, clean | `922F7EF5EC3728FE` | legacy adapter | preserved (invented confidence rejected) |
| `components/tools/tool-049-bone-density.tsx` + `.test.tsx` | tracked, clean | `F64A099A0D7E1E8A`, `64C91EAE6B9B4735` | UI/state + suite | implemented |
| `components/tools/tool-049-bone-density.genius.tsx` | tracked, clean | `B47AEF64EC22DD3B` | 12 tool-owned boxes | implemented |
| `i18n/tool-049-bone-density.json`, `tests/unit/tool-049-i18n-evidence.test.ts` | tracked, clean | `0E33D97D33A64388`, `51B26C87AAC6093` | EN/AR 174/174 + evidence test | ledger E3 |
| `app/smarttools/tool-049-bone-density/page.tsx` | tracked, clean | `437ECCA59E66AB0C` | legacy redirect | static |
| shared `registry.ts`, `categories.ts`, `manifest.ts`, `p03-*.test.ts` | tracked, clean | `39891CB9…`, `E2CC7F40…`, `4AF80EA9…`, `99C28B98…`/`4A25901F…` | identity/ownership/P-03 | no edit |

Dependencies: React, Zod, `createToolSchema`, `createToolOutput`/`isToolOutput`, `requireTool`/`buildSeoLinks`, i18n helper; no DB/network/storage. No build/test/browser run here.

## D. Math Engine and Equation Audit

- Inputs: `age` 18–90, `sex ∈ {male,female}`, `uses_ai_years` 0–30, `weekly_resistance_sessions` 0–14, `calcium_mg_daily` 0–3000 mg, `vitamin_d_iu_daily` 0–10000 IU, `smoker` boolean.
- Equations: `score = clamp100(60 + min(20, resistance×3) + min(15, calcium/100) + min(15, vitaminD/400) − AIyears×2.5 − (smoker?8:0) − (age>50 && female ?8:0) − (age>65 ?5:0))`; `bone_health_score = round(score)`; bands `optimal ≥80`, `good ≥60`, `at-risk ≥40`, else `high-risk`; risk factors/interventions emitted by observed thresholds; warnings educational always + fracture warning below 40.
- Pure, deterministic, no I/O/time/random; typed zero valid for continuous zero-valid fields; schema rejects out-of-range/non-numeric; result bounded 0–100. Recorded E3 engine rows `049-ENGINE-01..03`; declared tests not re-run here. No approved source pack (D-C4 open).

## E. Pipeline and Schema Audit

Chain: `BoneDensityInputSchema` → `createToolSchema` → pipeline → unmodified `assessBoneDensity` → `BoneDensityResultSchema` → `createToolOutput` → `isToolOutput`; invalid input short-circuits. `049-P03-01` PASS E3 (structural); `049-P03-02` **PARTIAL E2** — no runtime negative-branch test for this pipeline. Do not promote. Shared P-03 files unchanged/approval-gated.

## F. AI and Intelligence Capabilities

**NotApplicable** — deterministic educational score, no model/prompt/provider/RAG/prediction. What-if probes are arithmetic scenarios. Confidence honestly "not assessed" (`049-TEST-11`). RuntimeVerified: No (browser E4 NOT_RUN).

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next |
|---|---|---|---|---|---|---|---|---|
| C1 score/band/honest confidence | YES | YES | YES | E3 `049-TEST-11` | NO | component row | E4 | DOM check |
| C2 formula/contributions/assumptions | YES | YES | YES | E3 `049-TEST-12` | NO | component row | E4 | DOM check |
| C3 risk factors/interventions/warnings | YES | YES | YES | E3 `049-TEST-13/14` | NO | component row | D-C5/CLIN | wording |
| C4 sources | YES | YES | `NOT_AVAILABLE` | E3 `049-TEST-15` | NO | `049-C4-01` E1 | D-C4 | approved pack |
| C5 next steps/session rating | YES | YES | YES | E3 `049-TEST-16` | NO | component row | E4 | DOM check |
| 12 boxes fixed order | YES | YES | YES | E3 `049-TEST-09` | NO | component row | browser E0 | DOM verify |
| Box 11 W18 | YES | YES | `NOT_AVAILABLE` | E3 `049-TEST-10` | NO | `049-W18-01` E1 | W18 | owner decision |
| Compact/full parity | YES | YES | YES | E3 `049-TEST-21` | NO | component row | none | preserve |

Tool-owned boxes; compact selector uses boxes 2,3,7,9,12 (labeling note preserved).

## H. Dynamic Results and UI Maturity

Static: 5 states, debounce, signature gating, typed-zero handling, RTL `dir`, a11y, 390px, CSV gating, no persistence/network. Component E3 recorded (26 rows); integration E3 recorded; true-clean not re-run (NOT_RUN); browser E4 5 rows NOT_RUN. No empty→zero coercion or invented confidence/source/AI.

## I. Cross-Tool and Data Integration

Registered links only; hand-entry rule, no automatic transfer (`049-CONTRACT-20`, `049-TEST-18`); no payload/session/cloud sync. W18 history box honest NOT_AVAILABLE. Cross-tool integration static/ledger-backed, not browser verified.

## J. Safety, Sources and Privacy

Schema bounds; no network/auth/storage. CSV has no session identifier. Warnings: educational-not-clinical, fracture below 40, factor-driven referral; D-C4 absent, D-C5 unapproved, D-CLIN blocked, W18 open. Never a diagnosis or bone-density substitute for clinical assessment.

## K. Localization and Browser Maturity

i18n `en=174/ar=174` E3; RTL/localization `049-TEST-22` E3. Browser: 5 rows E0 NOT_RUN. E4 requires authorized SSO session + preview pinned `37f047a4` + Deployment ID; historic deployment not transferable.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command | Environment | SHA (first 16) | Date | Result | Level | Reproducibility | Compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-049-ENG | `049-ENGINE-01..03` | engine test | `npx vitest run --config vitest.config.ts lib/tools/engines/tool-049-bone-density.test.ts lib/tools/r6/tool-049-bone-density-pipeline.test.ts lib/tools/r6/tool-049-bone-density-contract.test.ts components/tools/tool-049-bone-density.test.tsx tests/unit/tool-049-i18n-evidence.test.ts` | recorded clean export; NOT_RUN here | `B5DF5EA40E0E3B6D` | 2026-11-18 | recorded PASS | E3 | recorded env | tracked at `37f047a4` |
| E-049-PIPE | `049-PIPELINE-01..08` | pipeline test | same | same | `D974C6E7C25DC3E` | as above | recorded PASS | E3 | as above | as above |
| E-049-CON | `049-CONTRACT-01..21` | contract test | same | same | `22BFC1737FC78D5C` | as above | recorded PASS | E3 | as above | as above |
| E-049-UI | `049-TEST-01..26` | component test | same | same | `64C91EAE6B9B4735` | as above | recorded PASS | E3 | as above | as above |
| E-049-I18N | `049-I18N-EVIDENCE-01`, `049-I18N-01` | evidence test / i18n check | `node tool-049-i18n-check.mjs` | recorded; NOT_RUN here | JSON `0E33D97D33A64388`; test `51B26C87AAC6093` | 2026-11-18 | 174/174 PASS | E3 | as above | preserved |
| E-049-P03 | `049-P03-01`, `049-P03-02` | shared P-03 tests | `npx vitest run --config vitest.config.ts lib/tools/r6/p03-gate-structural.test.ts lib/tools/r6/p03-result-schema-validation.test.ts` | same | `99C28B98…`, `4A25901F…` | 2026-11-19 | structural E3; runtime-negative PARTIAL E2 | E3/E2 | as above | shared; no edit |
| E-049-BROWSER | 5 browser rows | prepared spec | `node tool-049-browser-verify.mjs` after authorized SSO + preview pinned `37f047a4` | NOT_AVAILABLE | — | 2026-11-19 | NOT_RUN | E0 | no | external gate |

Build/`tsc`/eslint/browser/calculator: **NOT_RUN / NOT EXECUTED** (`npx tsc --noEmit`, `npm run build`, `npx eslint .` not executed). E2 stays E2.

## M. Defect and Gap Register

**Implementation gaps:** one genuine engineering gap — `049-P03-02` runtime negative-branch test missing. Other code complete.

**Evidence/gate gaps:** G-049-P03RUNTIME (HIGH, `049-P03-02`, `lib/tools/r6/p03-result-schema-validation.test.ts` + `tool-049-bone-density-pipeline.ts`, PARTIAL E2 vs reject, scoped test needed); G-049-BROWSER (HIGH, 5 `049-BROWSER-*`, E0 vs E4, SSO); G-049-C4 (HIGH, `049-C4-01`, genius C4 box, D-C4); G-049-C5 (MEDIUM, C5 box, D-C5); G-049-CLIN (HIGH, review record, BLOCKED); G-049-W18 (MEDIUM, history box, W18); G-049-FRESH (INFO, recorded E3 not re-run). Regression risk low for all evidence/gate fixes.

## N. Development Maturity Matrix (S0–S11)

| Stage | Component | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|
| S0 Identity | registry/route | S2 | S4 route load | SSO |
| S1 Requirements | 71-row ledger | S3 | owner ratification | none |
| S2 Architecture | engine/schema/pipeline/UI | S3 | S4 runtime | no fresh run |
| S3 Engine | `assessBoneDensity` | S3 | S4 | E4 |
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
| Engine | APPLICABLE | deterministic bounded educational score | Preserve |
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
| 1 | `lib/tools/r6/p03-result-schema-validation.test.ts` | add 049 runtime negative branch | isolated vitest | scoped approval | low | P03-02 → E3 | no envelope on invalid result |
| 2 | prepared browser spec / preview | authorized E4 run | Playwright | SSO, pinned `37f047a4`, Deployment ID | low | 5 rows E4 | PASS E4 |
| 3 | `components/tools/tool-049-bone-density.genius.tsx` + owner record | gate artifacts | review sign-off | owner/specialist | medium | gates closed | approvals recorded |

Reuse passing code; no shared-component change.

## Q. Current Tool Decision

**Decision: CONTINUE / REPAIR (P-03 + gates).** Completion `100 × 61 / 71 = 85.92%` E3+; closure grid `1/18 = 5.56%` is operational history. Preserve implementation; add one scoped runtime-negative test, then close browser and owner gates. Status preserved `IN PROGRESS` / **Not 100% VERIFIED**. **No owner acceptance implied.**

## Integrity note

Body-before-hash convention: SHA below computed over bytes preceding the final hash line; whole-file SHA reported in delivery response. No original edited to reconcile a hash.

Observed on-disk SHA-256 (body before this line): `FF23662B3E7D7FE35390BC928A3CBE4215278C9E373AF1509C26F1FDD4F3DA23`
