# TOOL 047 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `047` · `mrx.tool.047-fertility-preservation` |
| Canonical name / slug | `Fertility Preservation Guide` / `tool-047-fertility-preservation` |
| Category | hormonal-health |
| Canonical route | `/smarttools/hormonal-health/tool-047-fertility-preservation` |
| Batch | Batch 2 |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`; 384 dirty worktree entries observed and preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation; no code/contract/schema/ledger/git/build/test/server/browser/calculator writes or executions. |
| Source-ledger refs (observed SHA-256) | atomic CSV `CCCF0C9D6BFE553577AF207B3B6185C0F84404306C204A1C0BE26DF178AA83C6`; atomic MD `23AEB81B8E0DE6ABF11946E11A42D98D63C87FCAC17E4CE78F5D3AB446EBBA6C`; summary `9DCC39CD319B3C7D9CF9C7D035849D6A00DAE9F3742659AE6FB93255D4C1DB0F`; closure MD `931448B5E92702A05855E728E25318CBC03366BE97DAE3F9BC1D25388F39EC7F`; closure CSV `78639F49AB95C7606B4F5A26ADAE0D4A5E68A37083B283A2E93ACE489E6AC42C` |
| Reference refs (observed SHA-256) | standard `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9`; W2 `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A`; W4b `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263`; B3 `CF3CBE8677F2C5513CE7A3ACEE7E9B5A315A97E6A5CB255FC6DD430CB98E62DF`; 039 profile `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |
| Tool decision | **CONTINUE / REPAIR (gates only)** — canonical atomic completion `59/68 = 86.76%`; no owner acceptance implied |

## A. Tool Identity and Historical Lineage

- Registry `mrx.tool.047-fertility-preservation` / `tool-047-fertility-preservation`; category `hormonal-health`; route `/smarttools/hormonal-health/tool-047-fertility-preservation`; flat route redirects.
- 047 is in `R6_EXEMPT_SLUGS` (`manifest.ts` SHA `4AF80EA997096017…`); tool-owned boxes per W4b; no shared shell change.
- Engine `assessFertility` first shipped in commit `0aa2b406ed4970eb5abbf1e3f30f1db0982cd3f7` (2026-10-11). Atomic ledger generated 2026-11-18 from clean export `2a647fda`+`37f047a4`; closure ledger records historic `8d7e406c` and SSO-protected `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL` (historic only).
- Original requirements: 68-row atomic ledger canonical; 18-row closure grid operational. No tool-specific requirements CSV/acceptance calculator.
- Preserved status `IN PROGRESS` / `NOT CLOSED`, **Not 100% VERIFIED**. D-C4/C5/CLIN/W18 open; `047-P03-02` is PASS E3 (runtime negative proven per ledger). No owner acceptance.

## B. Original and R6.1 Requirements

**Canonical denominator recoverability:** FULLY RECOVERABLE from `tool-047-atomic-ledger-2026-11-18.csv|.md` (68 rows), corroborated by B3/W2. All 68 rows APPLICABLE; 0 NOT_APPLICABLE. `NOT_AVAILABLE`/`BLOCKED` are gate states, not removals. No invented denominator.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| 047-CONTRACT-01 | A047-001 | reproduces the impact arithmetic for every level and HCG value | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: reproduces the impact arithmetic for every level and HCG value | none; counted PASS(E3+) |
| 047-CONTRACT-02 | A047-002 | reproduces the recovery arithmetic across the age-offset boundaries | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: reproduces the recovery arithmetic across the age-offset boundaries | none; counted PASS(E3+) |
| 047-CONTRACT-03 | A047-003 | reproduces the horizon test, including the zero horizon | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: reproduces the horizon test, including the zero horizon | none; counted PASS(E3+) |
| 047-CONTRACT-04 | A047-004 | reproduces every protocol hint the engine can emit | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: reproduces every protocol hint the engine can emit | none; counted PASS(E3+) |
| 047-CONTRACT-05 | A047-005 | reproduces the two warning triggers and only those | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: reproduces the two warning triggers and only those | none; counted PASS(E3+) |
| 047-CONTRACT-06 | A047-006 | mirrors the input bounds of the canonical schema | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: mirrors the input bounds of the canonical schema | none; counted PASS(E3+) |
| 047-CONTRACT-07 | A047-007 | maps every hint and warning the engine can emit, and never prints a raw code | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: maps every hint and warning the engine can emit, and never prints a raw code | none; counted PASS(E3+) |
| 047-CONTRACT-08 | A047-008 | maps every suppression level the engine accepts | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: maps every suppression level the engine accepts | none; counted PASS(E3+) |
| 047-CONTRACT-09 | A047-009 | formats percentages and months without inventing precision | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: formats percentages and months without inventing precision | none; counted PASS(E3+) |
| 047-CONTRACT-10 | A047-010 | starts EMPTY with no input and no issue | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: starts EMPTY with no input and no issue | none; counted PASS(E3+) |
| 047-CONTRACT-11 | A047-011 | stays PARTIAL until every required field is answered | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: stays PARTIAL until every required field is answered | none; counted PASS(E3+) |
| 047-CONTRACT-12 | A047-012 | treats a typed zero horizon as a real value, not as "not answered" | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: treats a typed zero horizon as a real value, not as "not answered" | none; counted PASS(E3+) |
| 047-CONTRACT-13 | A047-013 | rejects out-of-range values with an out_of_range issue | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: rejects out-of-range values with an out_of_range issue | none; counted PASS(E3+) |
| 047-CONTRACT-14 | A047-014 | rejects non-numeric text in a hand-typed field | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: rejects non-numeric text in a hand-typed field | none; counted PASS(E3+) |
| 047-CONTRACT-15 | A047-015 | keeps the order EMPTY → INVALID → PARTIAL → READY | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: keeps the order EMPTY → INVALID → PARTIAL → READY | none; counted PASS(E3+) |
| 047-CONTRACT-16 | A047-016 | produces a READY input that the canonical schema accepts | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: produces a READY input that the canonical schema accepts | none; counted PASS(E3+) |
| 047-CONTRACT-17 | A047-017 | records no approved source and therefore no citation | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: records no approved source and therefore no citation | none; counted PASS(E3+) |
| 047-CONTRACT-18 | A047-018 | links only to real registered tools and transfers nothing automatically | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: links only to real registered tools and transfers nothing automatically | none; counted PASS(E3+) |
| 047-CONTRACT-19 | A047-019 | builds a CSV with the inputs, the result and no session identifier | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-contract.test.ts :: builds a CSV with the inputs, the result and no session identifier | none; counted PASS(E3+) |
| 047-PIPELINE-01 | A047-020 | valid input produces a contract-valid ToolOutput from the V6 engine | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: valid input produces a contract-valid ToolOutput from the V6 engine | none; counted PASS(E3+) |
| 047-PIPELINE-02 | A047-021 | does not reuse the legacy adapter’s invented confidence or reference range | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: does not reuse the legacy adapter’s invented confidence or reference range | none; counted PASS(E3+) |
| 047-PIPELINE-03 | A047-022 | matches the standalone V6 engine output exactly (engine is authoritative) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: matches the standalone V6 engine output exactly (engine is authoritative) | none; counted PASS(E3+) |
| 047-PIPELINE-04 | A047-023 | invalid input fails safely with a structured error (no throw, no partial output) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: invalid input fails safely with a structured error (no throw, no partial output) | none; counted PASS(E3+) |
| 047-PIPELINE-05 | A047-024 | rejects invalid input at the schema boundary before the engine runs | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: rejects invalid input at the schema boundary before the engine runs | none; counted PASS(E3+) |
| 047-PIPELINE-06 | A047-025 | createToolOutput rejects a malformed envelope (runtime validation guard) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: createToolOutput rejects a malformed envelope (runtime validation guard) | none; counted PASS(E3+) |
| 047-PIPELINE-07 | A047-026 | keeps the engine result type stable for the pipeline export | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts :: keeps the engine result type stable for the pipeline export | none; counted PASS(E3+) |
| 047-ENGINE-01 | A047-027 | mid suppression with HCG shortens recovery inside the planning horizon | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-047-fertility-preservation.test.ts :: mid suppression with HCG shortens recovery inside the planning horizon | none; counted PASS(E3+) |
| 047-ENGINE-02 | A047-028 | heavy 19-nor-style suppression at advanced age exceeds short horizons | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-047-fertility-preservation.test.ts :: heavy 19-nor-style suppression at advanced age exceeds short horizons | none; counted PASS(E3+) |
| 047-ENGINE-03 | A047-029 | mild suppression plans realistically without HCG | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-047-fertility-preservation.test.ts :: mild suppression plans realistically without HCG | none; counted PASS(E3+) |
| 047-TEST-01 | A047-030 | starts EMPTY and invents nothing | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: starts EMPTY and invents nothing | none; counted PASS(E3+) |
| 047-TEST-02 | A047-031 | stays PARTIAL until every required field is answered | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: stays PARTIAL until every required field is answered | none; counted PASS(E3+) |
| 047-TEST-03 | A047-032 | reports INVALID for an out-of-range age and calculates nothing | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: reports INVALID for an out-of-range age and calculates nothing | none; counted PASS(E3+) |
| 047-TEST-04 | A047-033 | reports INVALID for an out-of-range horizon | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: reports INVALID for an out-of-range horizon | none; counted PASS(E3+) |
| 047-TEST-05 | A047-034 | calculates through the R6 pipeline once the input is complete | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: calculates through the R6 pipeline once the input is complete | none; counted PASS(E3+) |
| 047-TEST-06 | A047-035 | accepts a typed zero horizon as a real value | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: accepts a typed zero horizon as a real value | none; counted PASS(E3+) |
| 047-TEST-07 | A047-036 | re-renders the projection when the suppression level changes | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: re-renders the projection when the suppression level changes | none; counted PASS(E3+) |
| 047-TEST-08 | A047-037 | reports DEGRADED when the pipeline fails its contract guard | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: reports DEGRADED when the pipeline fails its contract guard | none; counted PASS(E3+) |
| 047-TEST-09 | A047-038 | renders all twelve boxes in their fixed order | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: renders all twelve boxes in their fixed order | none; counted PASS(E3+) |
| 047-TEST-10 | A047-039 | keeps the history box visible with the real W18 reason | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: keeps the history box visible with the real W18 reason | none; counted PASS(E3+) |
| 047-TEST-11 | A047-040 | C1 carries the impact, the recovery, the horizon verdict and an honest confidence | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: C1 carries the impact, the recovery, the horizon verdict and an honest confidence | none; counted PASS(E3+) |
| 047-TEST-12 | A047-041 | C2 states the formula with the engine limits, the assumptions and the uncertainty | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: C2 states the formula with the engine limits, the assumptions and the uncertainty | none; counted PASS(E3+) |
| 047-TEST-13 | A047-042 | C3 shows the engine hints, the warning and the pending referral | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: C3 shows the engine hints, the warning and the pending referral | none; counted PASS(E3+) |
| 047-TEST-14 | A047-043 | C3 raises the age warning only above 40 | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: C3 raises the age warning only above 40 | none; counted PASS(E3+) |
| 047-TEST-15 | A047-044 | C4 does not invent a source, a range or a confidence | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: C4 does not invent a source, a range or a confidence | none; counted PASS(E3+) |
| 047-TEST-16 | A047-045 | C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | none; counted PASS(E3+) |
| 047-TEST-17 | A047-046 | runs the what-if and sensitivity probes through the same pipeline | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: runs the what-if and sensitivity probes through the same pipeline | none; counted PASS(E3+) |
| 047-TEST-18 | A047-047 | shows the related tools with a hand-entry rule and no automatic transfer | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: shows the related tools with a hand-entry rule and no automatic transfer | none; counted PASS(E3+) |
| 047-TEST-19 | A047-048 | exports a client-side CSV and never adds a session identifier | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: exports a client-side CSV and never adds a session identifier | none; counted PASS(E3+) |
| 047-TEST-20 | A047-049 | disables the export until a valid result exists | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: disables the export until a valid result exists | none; counted PASS(E3+) |
| 047-TEST-21 | A047-050 | keeps C1 identical in compact mode and shows the five CORE boxes | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: keeps C1 identical in compact mode and shows the five CORE boxes | none; counted PASS(E3+) |
| 047-TEST-22 | A047-051 | flips to RTL and localizes the interface in Arabic | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: flips to RTL and localizes the interface in Arabic | none; counted PASS(E3+) |
| 047-TEST-23 | A047-052 | never prints a raw engine hint or warning code | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: never prints a raw engine hint or warning code | none; counted PASS(E3+) |
| 047-TEST-24 | A047-053 | labels every control, announces the state and marks an invalid input | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: labels every control, announces the state and marks an invalid input | none; counted PASS(E3+) |
| 047-TEST-25 | A047-054 | uses no fixed width that would break a 390 px viewport | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: uses no fixed width that would break a 390 px viewport | none; counted PASS(E3+) |
| 047-TEST-26 | A047-055 | has NO persistence and never calls the network, the engine or the adapter | APPLICABLE | B=PASS; E=E3; components/tools/tool-047-fertility-preservation.test.tsx :: has NO persistence and never calls the network, the engine or the adapter | none; counted PASS(E3+) |
| 047-I18N-01 | A047-056 | AR/EN parity (en 140 / ar 140 keys) | APPLICABLE | B=PASS; E=E3; node tool-047-i18n-check.mjs -> I18N_PARITY: OK; en=140 ar=140 | none; counted PASS(E3+) |
| 047-ROUTE-01 | A047-057 | Canonical route /smarttools/hormonal-health/tool-047-fertility-preservation registered and emitted by the clean build | APPLICABLE | B=PASS; E=E3; lib/tools/categories.ts:129 -> 'hormonal-health'; clean build EXITCODE=0 with 506/506 static pages | none; counted PASS(E3+) |
| 047-P03-01 | A047-058 | ResultSchema gate exists before the envelope builder and the raw engine result is never forwarded | APPLICABLE | B=PASS; E=E3; lib/tools/r6/p03-gate-structural.test.ts covers tool-047-fertility-preservation-pipeline.ts (structural assertion) | none; counted PASS(E3+) |
| 047-P03-02 | A047-059 | A mismatched engine result is rejected at runtime with no envelope produced | APPLICABLE | B=PASS; E=E3; p03-result-schema-validation.test.ts exercises this pipeline's invalid/missing result path | none; counted PASS(E3+) |
| 047-BROWSER-EN-AR-01 | A047-060 | Authorized EN and AR render on the deployed route | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 047-BROWSER-STATES-5-02 | A047-061 | EMPTY / PARTIAL / INVALID / FULL / DEGRADED exercised in a real browser | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 047-BROWSER-RTL-390-03 | A047-062 | 390 px RTL layout verified in a real browser | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 047-BROWSER-CONSOLE-04 | A047-063 | Console clean: no hydration errors or runtime exceptions | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 047-BROWSER-GENIUS-DOM-05 | A047-064 | GENIUS-12 DOM order verified: 12 boxes, no duplicate shell, no hidden box | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 047-C4-01 | A047-065 | Approved source pack with provenance is attached to clinical claims | APPLICABLE | B=NOT_AVAILABLE; E=E1; No approved source/provenance pack exists for this tool; the UI renders NOT_AVAILABLE (D-C4 open) | NOT_AVAILABLE/E1; owner gate open; not counted |
| 047-C5-01 | A047-066 | Referral / escalation wording is specialist-approved | APPLICABLE | B=NOT_AVAILABLE; E=E1; Referral wording remains pending specialist approval (D-C5) | NOT_AVAILABLE/E1; owner gate open; not counted |
| 047-CLIN-01 | A047-067 | Clinical / model review sign-off recorded | APPLICABLE | B=BLOCKED; E=E1; No qualified specialist review exists; self-approval is not permitted (D-CLIN) | BLOCKED/E1; specialist sign-off required; not counted |
| 047-W18-01 | A047-068 | History capability per W18 | APPLICABLE | B=NOT_AVAILABLE; E=E1; W18 history is NOT_AVAILABLE: no DB / storage / cloud sync by owner decision | NOT_AVAILABLE/E1; owner gate open; not counted |

**Counts:** applicable **68**; justified N/A **0**; unmapped **0**. `PASS(E3+)` = **59/68 = 86.76%** (B3 recorded/corrected unchanged). B-states: 59 PASS E3 (including `047-P03-02`), 0 PARTIAL, 5 browser NOT_RUN E0, 3 NOT_AVAILABLE E1, 1 BLOCKED E1. E2 static PASS: 0. 18-row closure grid recorded `1/18 = 5.56%` — operational only.

**18-row closure-grid reconciliation:**

| Closure grid ID | Grid B/E | Atomic group | Reconciliation |
|---|---|---|---|
| ENG-PIPELINE | PASS/E2 | `047-PIPELINE-01..07`, `047-P03-01` | atomic E3 supersedes grid |
| STATE-5 | PASS/E2 | `047-CONTRACT-10..16`, `047-TEST-01..08` | E3 |
| UI-GENIUS12 | PASS/E2 | `047-TEST-09..16`, `047-TEST-21..25` | E3 component; DOM E0 |
| I18N-PARITY | PASS/E3 | `047-I18N-EVIDENCE-01`, `047-I18N-01` | 140/140 |
| EXPORT-CSV | PASS/E2 | `047-CONTRACT-19`, `047-TEST-19..20` | E3 |
| TEST-FOCUSED | PARTIAL/E2 | engine/contract/pipeline/component suites | recorded E3, NOT_RUN here |
| BUILD-TSC | PARTIAL/E2 | `047-ROUTE-01` | proxy |
| PREVIEW-ROUTE | NOT_RUN/E0 | `047-ROUTE-01` registration | live blocked |
| 5 browser buckets | NOT_RUN/E0 | `047-BROWSER-*` | E0 |
| C4/C5/CLIN/W18 | NOT_AVAILABLE/BLOCKED E1 | `047-C4-01`, `047-C5-01`, `047-CLIN-01`, `047-W18-01` | owner gates |
| P03-PIPELINE | NOT_IMPLEMENTED/E1 | `047-P03-01` + `047-P03-02` both E3 | atomic supersedes frozen grid |

**Source authority conflict log:** atomic (68) vs grid (18) → atomic; historic HEAD/deployment vs `37f047a4` → no E4 transfer; D-C4/C5/CLIN/W18 open; browser E0 rows unresolved.

## C. Existing Architecture and Implementation

| Exact path | Git status | SHA-256 (first 16) | Role / test | Status |
|---|---|---|---|---|
| `lib/tools/engines/tool-047-fertility-preservation.ts` + `.test.ts` | tracked, clean | `5ECAC7491DD4A4F5`, `40291352669DEC04` | pure engine + suite | implemented; NOT_RUN here |
| `lib/tools/schemas/tool-047-fertility-preservation.ts` | tracked, clean | `C4B0C1D3BF7928EA` | Zod contract | E2 static |
| `lib/tools/r6/tool-047-fertility-preservation-pipeline.ts` + `.test.ts` | tracked, clean | `26D2B2F3E3FC6E46`, `EEE60046A3ACBA5A` | pipeline + suite | implemented |
| `lib/tools/r6/tool-047-fertility-preservation-contract.ts` + `.test.ts` | tracked, clean | `F51EEFF79D39AFA3`, `0E8B8FA6E8773E5C` | UI/field/CSV contract | implemented |
| `lib/tools/adapters/tool-047-fertility-preservation.ts` | tracked, clean | `1EE5B94834E6058A` | legacy adapter | preserved (invented confidence rejected by `047-PIPELINE-02`) |
| `components/tools/tool-047-fertility-preservation.tsx` + `.test.tsx` | tracked, clean | `74D7FA11F97E683B`, `0D673704B9963496` | UI/state + suite | implemented |
| `components/tools/tool-047-fertility-preservation.genius.tsx` | tracked, clean | `B3A07CD58A63B7AE` | 12 tool-owned boxes | implemented |
| `i18n/tool-047-fertility-preservation.json` | tracked, clean | `D8968DCC438F7573` | EN/AR 140/140 | ledger E3 |
| `app/smarttools/tool-047-fertility-preservation/page.tsx` | tracked, clean | `182410BA791730D9` | legacy redirect | static |
| shared `registry.ts`, `categories.ts`, `manifest.ts`, `p03-*.test.ts` | tracked, clean | `39891CB9…`, `E2CC7F40…`, `4AF80EA9…`, `99C28B98…`/`4A25901F…` | identity/ownership/P-03 | no edit |

Dependencies: React, Zod, `createToolSchema`, `createToolOutput`/`isToolOutput`, `requireTool`/`buildSeoLinks`, i18n helper; no DB/network/storage. No build/test/browser run here.

## D. Math Engine and Equation Audit

- Inputs: `age` 18–60, `suppression_level ∈ {1,2,3}`, `uses_hcg` boolean, `planning_horizon_months` 0–36.
- Equations: `BASE_IMPACT = {1:40, 2:65, 3:85}`; `fertility_impact_pct = max(10, BASE_IMPACT[level] − (uses_hcg ? 15 : 0))`; `BASE_RECOVERY_MONTHS = {1:3, 2:6, 3:12}`; `recovery = base − (uses_hcg ? 2 : 0) + (age>35 ? 3 : age>28 ? 1 : 0)`; `recovery_projection_months = max(1, recovery)`; `within_horizon = horizon>0 && recovery≤horizon`; protocol hints baseline semen analysis plus HCG/19-nor/family-planning hints by level; warnings high impact ≥65 and age>40 decline not modeled.
- Pure engine, deterministic, no I/O/time/random; typed zero horizon valid; schema rejects out-of-range/non-string; result bounded. Recorded E3 engine rows `047-ENGINE-01..03`; declared tests not re-run here. No approved external source pack (D-C4 open).

## E. Pipeline and Schema Audit

Chain: `FertilityInputSchema` → `createToolSchema` → pipeline → unmodified `assessFertility` → `FertilityResultSchema` → `createToolOutput` → `isToolOutput`; invalid input short-circuits. `047-P03-01` PASS E3 (structural) and `047-P03-02` PASS E3 (`p03-result-schema-validation.test.ts` invalid/missing result path at lines 117+). No P-03 engineering gap. Shared P-03 files unchanged/approval-gated.

## F. AI and Intelligence Capabilities

**NotApplicable** — deterministic informational guide; no model/prompt/provider/RAG/prediction. Risk impact/recovery are documented heuristics; no invented confidence/range (ledger rows `047-PIPELINE-02`, `047-TEST-15`). RuntimeVerified: No (E4 NOT_RUN).

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next |
|---|---|---|---|---|---|---|---|---|
| C1 impact/recovery/horizon + confidence | YES | YES | YES | E3 `047-TEST-11` | NO | component row | E4 | DOM check |
| C2 formula/limits/assumptions | YES | YES | YES | E3 `047-TEST-12` | NO | component row | E4 | DOM check |
| C3 hints/warning/referral, age>40 rule | YES | YES | YES | E3 `047-TEST-13/14` | NO | component row | D-C5/CLIN | wording |
| C4 sources | YES | YES | `NOT_AVAILABLE` | E3 `047-TEST-15` | NO | `047-C4-01` E1 | D-C4 | approved pack |
| C5 next steps/session rating | YES | YES | YES | E3 `047-TEST-16` | NO | component row | E4 | DOM check |
| 12 boxes fixed order | YES | YES | YES | E3 `047-TEST-09` | NO | component row | browser E0 | DOM verify |
| Box 11 W18 | YES | YES | `NOT_AVAILABLE` | E3 `047-TEST-10` | NO | `047-W18-01` E1 | W18 | owner decision |
| Compact/full parity | YES | YES | YES | E3 `047-TEST-21` | NO | component row | none | preserve |

Tool-owned boxes; compact selector uses boxes 2,3,7,9,12 (labeling note preserved).

## H. Dynamic Results and UI Maturity

Static: 5 states, debounce, signature gating, typed-zero horizon, RTL `dir`, a11y, 390px, CSV gating, no persistence/network. Component E3 recorded (26 rows); integration E3 recorded; true-clean not re-run (NOT_RUN); browser E4 5 rows NOT_RUN. No empty→zero coercion or invented values.

## I. Cross-Tool and Data Integration

Registered links only (`requireTool`/`buildSeoLinks`); hand-entry rule, no automatic transfer (`047-CONTRACT-18`, `047-TEST-18`); no payload/session/cloud sync. W18 history box honest NOT_AVAILABLE. Cross-tool integration static/ledger-backed, not browser verified.

## J. Safety, Sources and Privacy

Schema bounds; no network/auth/storage. CSV has no session identifier. Warnings: high suppression impact → medical consult; age-related decline not modeled; semen analysis and fertility medicine own decisions — never a prescription. D-C4 absent, D-C5 unapproved, D-CLIN blocked, W18 open.

## K. Localization and Browser Maturity

i18n `en=140/ar=140` E3; RTL/localization `047-TEST-22` E3. Browser: 5 rows E0 NOT_RUN. E4 requires authorized SSO session + preview pinned `37f047a4` + Deployment ID; historic deployment not transferable.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command | Environment | SHA (first 16) | Date | Result | Level | Reproducibility | Compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-047-ENG | `047-ENGINE-01..03` | engine test | `npx vitest run --config vitest.config.ts lib/tools/engines/tool-047-fertility-preservation.test.ts lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts lib/tools/r6/tool-047-fertility-preservation-contract.test.ts components/tools/tool-047-fertility-preservation.test.tsx` | recorded clean export; NOT_RUN here | `40291352669DEC04` | 2026-11-18 | recorded PASS | E3 | recorded env | tracked at `37f047a4` |
| E-047-PIPE | `047-PIPELINE-01..07` | pipeline test | same | same | `EEE60046A3ACBA5A` | as above | recorded PASS | E3 | as above | as above |
| E-047-CON | `047-CONTRACT-01..19` | contract test | same | same | `0E8B8FA6E8773E5C` | as above | recorded PASS | E3 | as above | as above |
| E-047-UI | `047-TEST-01..26` | component test | same | same | `0D673704B9963496` | as above | recorded PASS | E3 | as above | as above |
| E-047-P03 | `047-P03-01/02` | shared P-03 tests | `npx vitest run --config vitest.config.ts lib/tools/r6/p03-gate-structural.test.ts lib/tools/r6/p03-result-schema-validation.test.ts` | same | `99C28B98…`, `4A25901F…` | 2026-11-19 | recorded PASS | E3 | as above | shared; no edit |
| E-047-I18N | `047-I18N-01` | i18n check | `node tool-047-i18n-check.mjs` | recorded; NOT_RUN here | JSON `D8968DCC438F7573` | 2026-11-18 | 140/140 PASS | E3 | as above | preserved |
| E-047-BROWSER | 5 browser rows | prepared spec | authorized SSO + pinned preview | NOT_AVAILABLE | — | 2026-11-19 | NOT_RUN | E0 | no | external gate |

Build/tsc/eslint/browser/calculator: **NOT_RUN / NOT EXECUTED**; E2 never promoted.

## M. Defect and Gap Register

**Implementation gaps:** none observed; engine, schema, pipeline, contract, component, genius, i18n, route and both P-03 rows are E3-backed in the source ledger.

**Evidence/gate gaps:** G-047-BROWSER (HIGH, 5 `047-BROWSER-*`, prepared spec/preview, E0 vs E4, SSO gate); G-047-C4 (HIGH, `047-C4-01`, genius C4 box, NOT_AVAILABLE, D-C4); G-047-C5 (MEDIUM, `047-C5-01`, C5 box, unapproved, D-C5); G-047-CLIN (HIGH, `047-CLIN-01`, no review record, BLOCKED, D-CLIN); G-047-W18 (MEDIUM, `047-W18-01`, history box, NOT_AVAILABLE, W18); G-047-FRESH (INFO, recorded E3 not re-run here scope). Exact files: `components/tools/tool-047-fertility-preservation.genius.tsx`, `lib/tools/r6/p03-*.test.ts`, prepared browser spec, owner decision records. Recommended fixes: authorized browser E4, approved source/wording packs, owner decisions, isolated test re-run. Regression risk low (evidence/gates only).

## N. Development Maturity Matrix (S0–S11)

| Stage | Component | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|
| S0 Identity | registry/route | S2 | S4 route load | SSO |
| S1 Requirements | 68-row ledger | S3 | owner ratification | none |
| S2 Architecture | engine/schema/pipeline/UI | S3 | S4 runtime | no fresh run |
| S3 Engine | `assessFertility` | S3 | S4 | E4 |
| S4 Pipeline | pipeline + P-03 structural+runtime | S3 (both E3) | S4 current-head re-run | isolated run |
| S5 UI | 5 states/debounce | S3 | S4 | E4 |
| S6 AI/CORE5/GENIUS12 | tool-owned boxes | S3 | S4 DOM | E4 |
| S7 Cross-tool/safety | links, W18, gates | S2 | S5 approvals | owner |
| S8 Testing | suites + i18n + P-03 | S3 | S4 re-run | authorization |
| S9 True-clean | `37f047a4` export | S3 recorded | fresh log | scope |
| S10 Browser E4 | 5 checks | S0 | S4 | SSO/pinned preview |
| S11 External | owner/E5 | NOT_VERIFIED | decision | outside |

Engine S9 + browser S0 reported separately.

## O. Comparison with Tool 039

| Dimension | Status | Reason | Action |
|---|---|---|---|
| Architecture | APPLICABLE | same layered pure pipeline / tool-owned boxes | Preserve |
| Engine | APPLICABLE | deterministic bounded impact/recovery math | Preserve |
| Validation | APPLICABLE | input/result/envelope guards, no invented confidence | Preserve |
| AI | NOT_APPLICABLE | no model/prompt/prediction | Preserve non-AI |
| Dynamic results | APPLICABLE | 5 states, debounce, signature, typed zero | Preserve |
| CORE-5 compact | PARTIALLY_APPLICABLE | selector/label note as 039 | Fix docs only if authorized |
| GENIUS-12 | APPLICABLE | 12 fixed boxes | Preserve |
| Cross-tool | PARTIALLY_APPLICABLE | hand-entry only, W18 open | Preserve boundary |
| Safety/sources | APPLICABLE | warnings present, packs unapproved | Extend after owner |
| Testing | PARTIALLY_APPLICABLE | E3 recorded, not re-run | Extend isolated re-run |
| Browser current E4 | NOT_AVAILABLE | no authorized pinned preview | Extend after gate |
| Browser historic transfer | NOT_VERIFIED | historic deployment not transferable | Preserve history |

No similarity score; no shared-shell edit.

## P. Next Development Tasks

| # | Exact file | Change | Tests | Dependencies | Risk | Outcome | Acceptance |
|---|---|---|---|---|---|---|---|
| 1 | prepared browser spec / preview | authorized E4 run | Playwright | SSO, pinned `37f047a4`, Deployment ID | low | 5 rows E4 | PASS E4 |
| 2 | `components/tools/tool-047-fertility-preservation.genius.tsx` | gate artifacts via owner | D-C4/C5/CLIN review | owner/specialist | medium | gates closed | approvals recorded |
| 3 | owner decision record | W18 decision | none | owner | low | W18 closed | decision recorded |

Reuse passing code; no shared-component change.

## Q. Current Tool Decision

**Decision: CONTINUE / REPAIR (gates only).** Completion `100 × 59 / 68 = 86.76%` E3+; closure grid `1/18 = 5.56%` is operational history. Preserve implementation and both P-03 E3 rows; close browser and owner gates. Status preserved `IN PROGRESS` / **Not 100% VERIFIED**. **No owner acceptance implied.**

## Integrity note

Body-before-hash convention: SHA below computed over bytes preceding the final hash line; whole-file SHA reported in delivery response. No original edited to reconcile a hash.

Observed on-disk SHA-256 (body before this line): `0F4B1C4D936D66B5A84AE5B23549E60DC4F85B8C3DCA9FD4D53E7B7E920899E5`
