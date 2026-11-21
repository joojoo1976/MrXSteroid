# TOOL 046 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `046` · `mrx.tool.046-trt-lifetime` |
| Canonical name / slug | `TRT Lifetime Calculator` / `tool-046-trt-lifetime` |
| Category | hormonal-health |
| Canonical route | `/smarttools/hormonal-health/tool-046-trt-lifetime` |
| Batch | Batch 2 |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`; 384 dirty worktree entries observed and preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation; no code/contract/schema/ledger/git/build/test/server/browser/calculator writes or executions. |
| Source-ledger refs (observed SHA-256) | atomic CSV `8A84803A4E45F5E9101039951506C77A657208E1ABE47C251862DF27CE642EA4`; atomic MD `D71401D35BC86FB0DD05BDB3F251D4322019B7791AFC72A95842F4180BC28513`; summary `9DCC39CD319B3C7D9CF9C7D035849D6A00DAE9F3742659AE6FB93255D4C1DB0F`; closure MD `DA96F626C0EBA619B266F8A3769B215CA1926E1EFA9A1048A28428022B842960`; closure CSV `69A353055532CC03519491158F8926C96C787E6FC5712EB648A9E92106425A7E` |
| Reference refs (observed SHA-256) | standard `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9`; W2 `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A`; W4b `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263`; B3 `CF3CBE8677F2C5513CE7A3ACEE7E9B5A315A97E6A5CB255FC6DD430CB98E62DF`; 039 profile `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` |
| Tool decision | **CONTINUE / REPAIR (P-03 + gates)** — canonical atomic completion `56/66 = 84.85%`; no owner acceptance implied |

## A. Tool Identity and Historical Lineage

- Registry entry `mrx.tool.046-trt-lifetime` / `tool-046-trt-lifetime`, category `hormonal-health`, route `/smarttools/hormonal-health/tool-046-trt-lifetime`; flat route redirects. `lib/tools/registry.ts` SHA `39891CB920E35838…`, `lib/tools/categories.ts` SHA `E2CC7F4086904107…`.
- 046 is in `R6_EXEMPT_SLUGS` (`manifest.ts` SHA `4AF80EA997096017…`); W4b classifies it as tool-owned boxes. No shared shell edit proposed.
- Engine `projectTrtLifetime` first shipped in commit `0aa2b406ed4970eb5abbf1e3f30f1db0982cd3f7` (2026-10-11, batch #046–#050). Atomic ledger generated 2026-11-18 from clean export `2a647fda`+`37f047a4`; closure ledger records historic snapshot `8d7e406c` and SSO-protected deployment `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL` (historic only).
- Original requirements: 66-row atomic ledger is canonical; 18-row closure grid is operational. No tool-specific requirements CSV/acceptance calculator exists.
- Preserved status: `IN PROGRESS` / `NOT CLOSED`, **Not 100% VERIFIED**. D-C4/C5/CLIN/W18 open; `046-P03-02` PARTIAL E2. No owner acceptance.

## B. Original and R6.1 Requirements

**Canonical denominator recoverability:** FULLY RECOVERABLE from `tool-046-atomic-ledger-2026-11-18.csv|.md` (66 rows), corroborated by B3 and W2. All 66 rows APPLICABLE; 0 NOT_APPLICABLE. `NOT_AVAILABLE`/`BLOCKED` are gate states, not applicability removals. No denominator invented.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| 046-CONTRACT-01 | A046-001 | reproduces the monitoring cadence boundaries | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: reproduces the monitoring cadence boundaries | none; counted PASS(E3+) |
| 046-CONTRACT-02 | A046-002 | reproduces the per-method dosing interval | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: reproduces the per-method dosing interval | none; counted PASS(E3+) |
| 046-CONTRACT-03 | A046-003 | reproduces the age-band boundaries | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: reproduces the age-band boundaries | none; counted PASS(E3+) |
| 046-CONTRACT-04 | A046-004 | reproduces the horizon cost arithmetic for all three horizons | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: reproduces the horizon cost arithmetic for all three horizons | none; counted PASS(E3+) |
| 046-CONTRACT-05 | A046-005 | reproduces the three warning triggers and only those | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: reproduces the three warning triggers and only those | none; counted PASS(E3+) |
| 046-CONTRACT-06 | A046-006 | mirrors the input bounds of the canonical schema | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: mirrors the input bounds of the canonical schema | none; counted PASS(E3+) |
| 046-CONTRACT-07 | A046-007 | maps every warning the engine can emit, and never prints a raw code | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: maps every warning the engine can emit, and never prints a raw code | none; counted PASS(E3+) |
| 046-CONTRACT-08 | A046-008 | maps every age band the engine can emit | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: maps every age band the engine can emit | none; counted PASS(E3+) |
| 046-CONTRACT-09 | A046-009 | formats dollars, counts and intervals without inventing precision | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: formats dollars, counts and intervals without inventing precision | none; counted PASS(E3+) |
| 046-CONTRACT-10 | A046-010 | starts EMPTY with no input and no issue | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: starts EMPTY with no input and no issue | none; counted PASS(E3+) |
| 046-CONTRACT-11 | A046-011 | stays PARTIAL until every required field is answered | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: stays PARTIAL until every required field is answered | none; counted PASS(E3+) |
| 046-CONTRACT-12 | A046-012 | treats a typed zero as a real value, not as "not answered" | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: treats a typed zero as a real value, not as "not answered" | none; counted PASS(E3+) |
| 046-CONTRACT-13 | A046-013 | rejects out-of-range values with an out_of_range issue | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: rejects out-of-range values with an out_of_range issue | none; counted PASS(E3+) |
| 046-CONTRACT-14 | A046-014 | rejects non-numeric text in a hand-typed field | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: rejects non-numeric text in a hand-typed field | none; counted PASS(E3+) |
| 046-CONTRACT-15 | A046-015 | keeps the order EMPTY → INVALID → PARTIAL → READY | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: keeps the order EMPTY → INVALID → PARTIAL → READY | none; counted PASS(E3+) |
| 046-CONTRACT-16 | A046-016 | produces a READY input that the canonical schema accepts | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: produces a READY input that the canonical schema accepts | none; counted PASS(E3+) |
| 046-CONTRACT-17 | A046-017 | records no approved source and therefore no citation | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: records no approved source and therefore no citation | none; counted PASS(E3+) |
| 046-CONTRACT-18 | A046-018 | links only to real registered tools and transfers nothing automatically | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: links only to real registered tools and transfers nothing automatically | none; counted PASS(E3+) |
| 046-CONTRACT-19 | A046-019 | builds a CSV with the inputs, the result and no session identifier | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-contract.test.ts :: builds a CSV with the inputs, the result and no session identifier | none; counted PASS(E3+) |
| 046-PIPELINE-01 | A046-020 | valid input produces a contract-valid ToolOutput from the V6 engine | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts :: valid input produces a contract-valid ToolOutput from the V6 engine | none; counted PASS(E3+) |
| 046-PIPELINE-02 | A046-021 | matches the standalone V6 engine output exactly (engine is authoritative) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts :: matches the standalone V6 engine output exactly (engine is authoritative) | none; counted PASS(E3+) |
| 046-PIPELINE-03 | A046-022 | invalid input fails safely with a structured error (no throw, no partial output) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts :: invalid input fails safely with a structured error (no throw, no partial output) | none; counted PASS(E3+) |
| 046-PIPELINE-04 | A046-023 | rejects invalid input at the schema boundary before the engine runs | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts :: rejects invalid input at the schema boundary before the engine runs | none; counted PASS(E3+) |
| 046-PIPELINE-05 | A046-024 | createToolOutput rejects a malformed envelope (runtime validation guard) | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts :: createToolOutput rejects a malformed envelope (runtime validation guard) | none; counted PASS(E3+) |
| 046-PIPELINE-06 | A046-025 | keeps the engine result type stable for the pipeline export | APPLICABLE | B=PASS; E=E3; lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts :: keeps the engine result type stable for the pipeline export | none; counted PASS(E3+) |
| 046-ENGINE-01 | A046-026 | projects 10/20/30-year costs and cadence for a mid-life injection patient | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-046-trt-lifetime.test.ts :: projects 10/20/30-year costs and cadence for a mid-life injection patient | none; counted PASS(E3+) |
| 046-ENGINE-02 | A046-027 | new patient on gel gets intensified first-year monitoring and daily dosing | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-046-trt-lifetime.test.ts :: new patient on gel gets intensified first-year monitoring and daily dosing | none; counted PASS(E3+) |
| 046-ENGINE-03 | A046-028 | flags high weekly doses as outside physiological TRT ranges | APPLICABLE | B=PASS; E=E3; lib/tools/engines/tool-046-trt-lifetime.test.ts :: flags high weekly doses as outside physiological TRT ranges | none; counted PASS(E3+) |
| 046-TEST-01 | A046-029 | starts EMPTY and invents nothing | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: starts EMPTY and invents nothing | none; counted PASS(E3+) |
| 046-TEST-02 | A046-030 | stays PARTIAL until every required field is answered | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: stays PARTIAL until every required field is answered | none; counted PASS(E3+) |
| 046-TEST-03 | A046-031 | reports INVALID for an out-of-range age and calculates nothing | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: reports INVALID for an out-of-range age and calculates nothing | none; counted PASS(E3+) |
| 046-TEST-04 | A046-032 | reports INVALID for an out-of-range weekly dose | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: reports INVALID for an out-of-range weekly dose | none; counted PASS(E3+) |
| 046-TEST-05 | A046-033 | calculates through the R6 pipeline once the input is complete | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: calculates through the R6 pipeline once the input is complete | none; counted PASS(E3+) |
| 046-TEST-06 | A046-034 | accepts a typed zero for years and costs as a real value | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: accepts a typed zero for years and costs as a real value | none; counted PASS(E3+) |
| 046-TEST-07 | A046-035 | re-renders the projection when the method changes | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: re-renders the projection when the method changes | none; counted PASS(E3+) |
| 046-TEST-08 | A046-036 | reports DEGRADED when the pipeline fails its contract guard | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: reports DEGRADED when the pipeline fails its contract guard | none; counted PASS(E3+) |
| 046-TEST-09 | A046-037 | renders all twelve boxes in their fixed order | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: renders all twelve boxes in their fixed order | none; counted PASS(E3+) |
| 046-TEST-10 | A046-038 | keeps the history box visible with the real W18 reason | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: keeps the history box visible with the real W18 reason | none; counted PASS(E3+) |
| 046-TEST-11 | A046-039 | C1 carries the cost projection, the age band and an honest confidence | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: C1 carries the cost projection, the age band and an honest confidence | none; counted PASS(E3+) |
| 046-TEST-12 | A046-040 | C2 states the formula with the engine limits, the assumptions and the uncertainty | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: C2 states the formula with the engine limits, the assumptions and the uncertainty | none; counted PASS(E3+) |
| 046-TEST-13 | A046-041 | C3 raises all three engine warnings and their red flags | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: C3 raises all three engine warnings and their red flags | none; counted PASS(E3+) |
| 046-TEST-14 | A046-042 | C4 does not invent a source: it says NOT_AVAILABLE with the pending review | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: C4 does not invent a source: it says NOT_AVAILABLE with the pending review | none; counted PASS(E3+) |
| 046-TEST-15 | A046-043 | C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: C5 gives the next step, what not to do and when to seek care, and labels the rating session-only | none; counted PASS(E3+) |
| 046-TEST-16 | A046-044 | runs the what-if and sensitivity probes through the same pipeline | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: runs the what-if and sensitivity probes through the same pipeline | none; counted PASS(E3+) |
| 046-TEST-17 | A046-045 | shows the related tools with a hand-entry rule and no automatic transfer | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: shows the related tools with a hand-entry rule and no automatic transfer | none; counted PASS(E3+) |
| 046-TEST-18 | A046-046 | exports a client-side CSV and never adds a session identifier | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: exports a client-side CSV and never adds a session identifier | none; counted PASS(E3+) |
| 046-TEST-19 | A046-047 | disables the export until a valid result exists | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: disables the export until a valid result exists | none; counted PASS(E3+) |
| 046-TEST-20 | A046-048 | keeps C1 identical in compact mode and shows the five CORE boxes | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: keeps C1 identical in compact mode and shows the five CORE boxes | none; counted PASS(E3+) |
| 046-TEST-21 | A046-049 | flips to RTL and localizes the interface in Arabic | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: flips to RTL and localizes the interface in Arabic | none; counted PASS(E3+) |
| 046-TEST-22 | A046-050 | never prints a raw engine warning code | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: never prints a raw engine warning code | none; counted PASS(E3+) |
| 046-TEST-23 | A046-051 | labels every control, announces the state and marks an invalid input | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: labels every control, announces the state and marks an invalid input | none; counted PASS(E3+) |
| 046-TEST-24 | A046-052 | uses no fixed width that would break a 390 px viewport | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: uses no fixed width that would break a 390 px viewport | none; counted PASS(E3+) |
| 046-TEST-25 | A046-053 | has NO persistence and never calls the network, the engine or the adapter | APPLICABLE | B=PASS; E=E3; components/tools/tool-046-trt-lifetime.test.tsx :: has NO persistence and never calls the network, the engine or the adapter | none; counted PASS(E3+) |
| 046-I18N-01 | A046-054 | AR/EN parity (en 140 / ar 140 keys) | APPLICABLE | B=PASS; E=E3; node tool-046-i18n-check.mjs -> I18N_PARITY: OK; en=140 ar=140 | none; counted PASS(E3+) |
| 046-ROUTE-01 | A046-055 | Canonical route /smarttools/hormonal-health/tool-046-trt-lifetime registered and emitted by the clean build | APPLICABLE | B=PASS; E=E3; lib/tools/categories.ts:128 -> 'hormonal-health'; clean build EXITCODE=0 with 506/506 static pages | none; counted PASS(E3+) |
| 046-P03-01 | A046-056 | ResultSchema gate exists before the envelope builder and the raw engine result is never forwarded | APPLICABLE | B=PASS; E=E3; lib/tools/r6/p03-gate-structural.test.ts covers tool-046-trt-lifetime-pipeline.ts (structural assertion) | none; counted PASS(E3+) |
| 046-P03-02 | A046-057 | A mismatched engine result is rejected at runtime with no envelope produced | APPLICABLE | B=PARTIAL; E=E2; Only structural coverage exists; no runtime negative-branch test targets this pipeline | PARTIAL/E2; not PASS; Add a per-pipeline runtime negative test (mismatched engine result) |
| 046-BROWSER-EN-AR-01 | A046-058 | Authorized EN and AR render on the deployed route | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 046-BROWSER-STATES-5-02 | A046-059 | EMPTY / PARTIAL / INVALID / FULL / DEGRADED exercised in a real browser | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 046-BROWSER-RTL-390-03 | A046-060 | 390 px RTL layout verified in a real browser | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 046-BROWSER-CONSOLE-04 | A046-061 | Console clean: no hydration errors or runtime exceptions | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 046-BROWSER-GENIUS-DOM-05 | A046-062 | GENIUS-12 DOM order verified: 12 boxes, no duplicate shell, no hidden box | APPLICABLE | B=NOT_RUN; E=E0; NOT_RUN - preview is SSO-protected; no authorized session was provided and SSO was not bypassed | NOT_RUN/E0; current-HEAD E4 required; not counted |
| 046-C4-01 | A046-063 | Approved source pack with provenance is attached to clinical claims | APPLICABLE | B=NOT_AVAILABLE; E=E1; No approved source/provenance pack exists for this tool; the UI renders NOT_AVAILABLE (D-C4 open) | NOT_AVAILABLE/E1; owner gate open; not counted |
| 046-C5-01 | A046-064 | Referral / escalation wording is specialist-approved | APPLICABLE | B=NOT_AVAILABLE; E=E1; Referral wording remains pending specialist approval (D-C5) | NOT_AVAILABLE/E1; owner gate open; not counted |
| 046-CLIN-01 | A046-065 | Clinical / model review sign-off recorded | APPLICABLE | B=BLOCKED; E=E1; No qualified specialist review exists; self-approval is not permitted (D-CLIN) | BLOCKED/E1; specialist sign-off required; not counted |
| 046-W18-01 | A046-066 | History capability per W18 | APPLICABLE | B=NOT_AVAILABLE; E=E1; W18 history is NOT_AVAILABLE: no DB / storage / cloud sync by owner decision | NOT_AVAILABLE/E1; owner gate open; not counted |

**Counts:** applicable **66**; justified N/A **0**; unmapped **0**. `PASS(E3+)` = **56/66 = 84.85%** (B3 recorded/corrected unchanged). B-status: 56 PASS, 1 PARTIAL (`046-P03-02`, E2), 5 browser NOT_RUN E0, 3 NOT_AVAILABLE E1, 1 BLOCKED E1. E2 static PASS rows: 0. The 18-row closure grid (`1/18 = 5.56%`) is a broad review bucket, not the official denominator.

**18-row closure-grid reconciliation:**

| Closure grid ID | Grid B/E | Atomic group | Reconciliation |
|---|---|---|---|
| ENG-PIPELINE | PASS/E2 | `046-PIPELINE-01..06`, `046-P03-01` | atomic E3 supersedes stale grid E2 |
| STATE-5 | PASS/E2 | `046-CONTRACT-10..16`, `046-TEST-01..08` | E3 state/validation rows |
| UI-GENIUS12 | PASS/E2 | `046-TEST-09..20`, `046-TEST-22..24` | E3 component; DOM still E0 |
| I18N-PARITY | PASS/E3 | `046-I18N-EVIDENCE-01`, `046-I18N-01` | 140/140 |
| EXPORT-CSV | PASS/E2 | `046-CONTRACT-19`, `046-TEST-18..19` | E3 logic, no E4 |
| TEST-FOCUSED | PARTIAL/E2 | engine/contract/pipeline/component suites | recorded E3, NOT_RUN here |
| BUILD-TSC | PARTIAL/E2 | `046-ROUTE-01` | partial proxy |
| PREVIEW-ROUTE | NOT_RUN/E0 | `046-ROUTE-01` registration | live preview blocked |
| 5 browser buckets | NOT_RUN/E0 | `046-BROWSER-*` (5 rows) | E0 preserved |
| C4/C5/CLIN/W18 | NOT_AVAILABLE/BLOCKED E1 | `046-C4-01`, `046-C5-01`, `046-CLIN-01`, `046-W18-01` | owner gates |
| P03-PIPELINE | NOT_IMPLEMENTED/E1 | `046-P03-01` E3, `046-P03-02` PARTIAL E2 | runtime-negative gap real |

**Source authority conflict log:** atomic (66) vs closure grid (18) → use atomic; historic HEAD/deployment vs `37f047a4` → no E4 transfer; `046-P03-02` E2 PARTIAL must not be relabeled PASS; D-C4/C5/CLIN/W18 open.

## C. Existing Architecture and Implementation

| Exact path | Git status | SHA-256 (first 16) | Role / test | Status |
|---|---|---|---|---|
| `lib/tools/engines/tool-046-trt-lifetime.ts` + `.test.ts` | tracked, clean | `C1C1D6B8028DB2A5`, `7D20D90D313D1759` | pure engine + suite | implemented; NOT_RUN here |
| `lib/tools/schemas/tool-046-trt-lifetime.ts` | tracked, clean | `D7BCC5B924D40068` | Zod contract | E2 static |
| `lib/tools/r6/tool-046-trt-lifetime-pipeline.ts` + `.test.ts` | tracked, clean | `6535C82004108F9E`, `737237CC9DB16B95` | pipeline + suite | implemented |
| `lib/tools/r6/tool-046-trt-lifetime-contract.ts` + `.test.ts` | tracked, clean | `C8C09BE0681FE406`, `862776CD103C83A4` | UI/field/CSV contract | implemented |
| `lib/tools/adapters/tool-046-trt-lifetime.ts` | tracked, clean | `BABDF12FF8814409` | legacy adapter | preserved |
| `components/tools/tool-046-trt-lifetime.tsx` + `.test.tsx` | tracked, clean | `BC4F21852402217A`, `CF46CE63E87B11EF` | UI/state + suite | implemented |
| `components/tools/tool-046-trt-lifetime.genius.tsx` | tracked, clean | `F15FD2220431DDC4` | 12 tool-owned boxes | implemented |
| `i18n/tool-046-trt-lifetime.json` | tracked, clean | `D868D96B10E01A22` | EN/AR 140/140 | ledger E3 |
| `app/smarttools/tool-046-trt-lifetime/page.tsx` | tracked, clean | `02C279265BD7B122` | legacy redirect | static |
| shared `registry.ts`, `categories.ts`, `manifest.ts`, `p03-*.test.ts` | tracked, clean | `39891CB9…`, `E2CC7F40…`, `4AF80EA9…`, `99C28B98…`/`4A25901F…` | identity/ownership/P-03 | no edit |

Dependencies: React, Zod, `createToolSchema`, `createToolOutput`/`isToolOutput`, `requireTool`/`buildSeoLinks`, i18n helper; no DB/network/storage. No build/test/browser run in this audit.

## D. Math Engine and Equation Audit

- Inputs: `age` 18–90, `method ∈ {injection,gel,cream}`, `weekly_testosterone_mg` 25–300, `years_on_trt` 0–60, monthly med cost 0–1000 USD, monitoring annual cost 0–5000 USD.
- Equations: `annual_bloodwork_panels = 3` if `years_on_trt < 1`, `2` if `<3`, else `1`; `age_band = under-40 | 40-55 | 55-plus`; `injection_interval_days = 3.5` injectable / `1` transdermal; `horizon(n).total_cost_usd = round(monthly_cost × 12 × n + monitoring_annual_cost × n)` for n=10,20,30; `lifetime_bloodwork_panels_10y = annual_panels × 10`; warnings age≥40, years≥5, weekly dose>200 deduplicated.
- Pure engine, no I/O/random/time; typed zero valid for years/costs; schema rejects out-of-range/non-numeric; deterministic; currency units never mixed with clinical units. Result schema bounds present.
- Recorded E3 engine rows `046-ENGINE-01..03`; tests declared, not re-run here. No approved source pack (D-C4 open) — cadence is documented educational heuristic.

## E. Pipeline and Schema Audit

Chain: `TrtLifetimeInputSchema` → `createToolSchema` → pipeline → unmodified `projectTrtLifetime` → `TrtLifetimeResultSchema` → `createToolOutput` → `isToolOutput`; invalid input short-circuits. `046-P03-01` PASS E3 (structural); `046-P03-02` **PARTIAL E2** — no runtime negative-branch test for this pipeline; must not be promoted. P-03 shared edits are approval-gated and out of scope.

## F. AI and Intelligence Capabilities

**NotApplicable** — deterministic projection engine, no model/prompt/provider/RAG/prediction. What-if/sensitivity are arithmetic scenarios. RuntimeVerified: No (browser E4 NOT_RUN).

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next |
|---|---|---|---|---|---|---|---|---|
| C1 cost projection + band + honest confidence | YES | YES | YES | E3 `046-TEST-11` | NO | component row | E4 | DOM check |
| C2 formula/limits/assumptions | YES | YES | YES | E3 `046-TEST-12` | NO | component row | E4 | DOM check |
| C3 3 warnings + red flags | YES | YES | YES | E3 `046-TEST-13` | NO | component row | D-C5/CLIN | wording |
| C4 sources | YES | YES | `NOT_AVAILABLE` | E3 `046-TEST-14` | NO | `046-C4-01` E1 | D-C4 | approved pack |
| C5 next steps/session rating | YES | YES | YES | E3 `046-TEST-15` | NO | component row | E4 | DOM check |
| 12 boxes fixed order | YES | YES | YES | E3 `046-TEST-09` | NO | component row | browser E0 | DOM verify |
| Box 11 W18 | YES | YES | `NOT_AVAILABLE` | E3 `046-TEST-10` | NO | `046-W18-01` E1 | W18 | owner decision |
| Compact/full parity | YES | YES | YES | E3 `046-TEST-20` | NO | component row | none | preserve |

Tool-owned boxes; no shared-shell duplication risk. Compact selector uses boxes 2,3,7,9,12 (labeling note preserved).

## H. Dynamic Results and UI Maturity

Static inspection: 5-state derivation, debounce, signature gating, typed-zero acceptance, RTL `dir`, a11y wiring, no fixed-width 390px break, CSV gated on valid result, no persistence/network. Component test E3 recorded (25 rows); integration E3 recorded; true-clean log not re-run (NOT_RUN); browser E4 5 rows NOT_RUN. No empty→zero coercion or invented confidence/source/history.

## I. Cross-Tool and Data Integration

Registered links only via `buildSeoLinks`; hand-entry, no automatic transfer (`046-CONTRACT-18`, `046-TEST-17`). No payload/session/cloud sync. W18 history box honest NOT_AVAILABLE. Cross-tool integration is static/ledger-backed, not browser verified.

## J. Safety, Sources and Privacy

Validated bounds; no network/auth/storage in engine/pipeline. CSV has no session identifier (`046-CONTRACT-19`, `046-TEST-18`). Domain warnings: cardio monitoring ≥40, long-term annual panel, high dose outside TRT range; educational, not a prescription. D-C4 absent, D-C5 unapproved, D-CLIN blocked, W18 open.

## K. Localization and Browser Maturity

i18n `en=140/ar=140` PASS E3; RTL/localization covered by `046-TEST-21`. Browser maturity: 5 rows E0 NOT_RUN. E4 prerequisites: authorized SSO session + preview pinned `37f047a4` + recorded Deployment ID; historic `dpl_E1n1…` not transferable.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command | Environment | SHA (first 16) | Date | Result | Level | Reproducibility | Compatibility |
|---|---|---|---|---|---|---|---|---|---|---|
| E-046-ENG | `046-ENGINE-01..03` | engine test | `npx vitest run --config vitest.config.ts lib/tools/engines/tool-046-trt-lifetime.test.ts lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts lib/tools/r6/tool-046-trt-lifetime-contract.test.ts components/tools/tool-046-trt-lifetime.test.tsx` | recorded clean export; **NOT_RUN here** | `7D20D90D313D1759` | 2026-11-18 | recorded PASS | E3 (ledger) | recorded env only | tracked at `37f047a4` |
| E-046-PIPE | `046-PIPELINE-01..06` | pipeline test | same | same | `737237CC9DB16B95` | as above | recorded PASS | E3 | as above | as above |
| E-046-CON | `046-CONTRACT-01..19` | contract test | same | same | `862776CD103C83A4` | as above | recorded PASS | E3 | as above | as above |
| E-046-UI | `046-TEST-01..25` | component test | same | same | `CF46CE63E87B11EF` | as above | recorded PASS | E3 | as above | as above |
| E-046-P03 | `046-P03-01`, `046-P03-02` | shared P-03 tests | `npx vitest run --config vitest.config.ts lib/tools/r6/p03-gate-structural.test.ts lib/tools/r6/p03-result-schema-validation.test.ts` | same | `99C28B98…`, `4A25901F…` | 2026-11-19 | structural PASS E3; runtime-negative **PARTIAL E2** | E3/E2 | as above | shared; no edit |
| E-046-I18N | `046-I18N-01` | i18n check script | `node tool-046-i18n-check.mjs` | recorded; NOT_RUN here | JSON `D868D96B10E01A22` | 2026-11-18 | 140/140 PASS | E3 | as above | preserved |
| E-046-BROWSER | 5 browser rows | prepared spec | authorized SSO + pinned preview | NOT_AVAILABLE | — | 2026-11-19 | NOT_RUN | E0 | no | external gate |

Build/tsc/eslint/browser/calculator: **NOT_RUN / NOT EXECUTED**. E2 stays E2.

## M. Defect and Gap Register

**Implementation gaps:** one genuine engineering gap — `046-P03-02` runtime negative-branch test missing (MEDIUM/HIGH for closure); engine/UI/code otherwise complete.

**Evidence/gate gaps:**

| ID | Severity | Requirement | Exact file | Actual vs expected | Impact | Root cause | Fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| G-046-P03RUNTIME | HIGH | `046-P03-02` | `lib/tools/r6/p03-result-schema-validation.test.ts` + `tool-046-trt-lifetime-pipeline.ts` | PARTIAL E2 vs runtime reject | 1 row | no per-pipeline negative test | add isolated runtime negative test (scoped, approved) | low |
| G-046-BROWSER | HIGH | 5 `046-BROWSER-*` | prepared spec / preview | E0 NOT_RUN vs E4 | 5 rows | SSO gate | authorized browser run | low |
| G-046-C4 | HIGH | `046-C4-01` | genius C4 box | NOT_AVAILABLE | 1 row | D-C4 | approved pack | low |
| G-046-C5 | MEDIUM | `046-C5-01` | genius C5 box | unapproved | 1 row | D-C5 | approved wording | low |
| G-046-CLIN | HIGH | `046-CLIN-01` | review record | BLOCKED | 1 row | D-CLIN | specialist sign-off | low |
| G-046-W18 | MEDIUM | `046-W18-01` | genius history box | NOT_AVAILABLE | 1 row | W18 | owner decision | low |
| G-046-FRESH | INFO | all E3 rows | test files | recorded, not re-run | 0 | scope | isolated re-run | none |

## N. Development Maturity Matrix (S0–S11)

| Stage | Component | Highest verified | Next missing | Bottleneck |
|---|---|---|---|---|
| S0 Identity | registry/route | S2 | S4 route load | SSO |
| S1 Requirements | 66-row ledger | S3 | owner ratification | none |
| S2 Architecture | engine/schema/pipeline/UI | S3 | S4 runtime | no fresh run |
| S3 Engine | `projectTrtLifetime` | S3 | S4 | E4 |
| S4 Pipeline | pipeline + P-03 structural/runtime | S3 structural / **S2 runtime-negative** | S3 runtime-negative | test authorization |
| S5 UI | 5 states/debounce | S3 | S4 | E4 |
| S6 AI/CORE5/GENIUS12 | tool-owned boxes | S3 | S4 DOM | E4 |
| S7 Cross-tool/safety | links, W18, gates | S2 | S5 approvals | owner |
| S8 Testing | suites + i18n + P-03 | S3 (partial runtime) | S3 P-03 close | scoped test |
| S9 True-clean | `37f047a4` export | S3 recorded | fresh log | scope |
| S10 Browser E4 | 5 checks | S0 | S4 | SSO/pinned preview |
| S11 External | owner/E5 | NOT_VERIFIED | decision | outside |

Engine S9 + browser S0 reported separately; no single-stage maturity claim.

## O. Comparison with Tool 039

| Dimension | Status | Reason | Action |
|---|---|---|---|
| Architecture | APPLICABLE | same layered pure pipeline/tool-owned boxes | Preserve |
| Engine | APPLICABLE | deterministic documented cost/cadence math | Preserve |
| Validation | APPLICABLE | input/result/envelope guards | Preserve |
| AI | NOT_APPLICABLE | no model/prompt/prediction | Preserve non-AI |
| Dynamic results | APPLICABLE | 5 states, debounce, signature | Preserve |
| CORE-5 compact | PARTIALLY_APPLICABLE | selector/label note as 039 | Fix docs only if authorized |
| GENIUS-12 | APPLICABLE | 12 fixed boxes | Preserve |
| Cross-tool | PARTIALLY_APPLICABLE | hand-entry only, W18 open | Preserve boundary |
| Safety/sources | APPLICABLE | warnings present, packs unapproved | Extend after owner |
| Testing | PARTIALLY_APPLICABLE | E3 recorded; P-03 runtime-negative PARTIAL | Extend (scoped test) |
| Browser current E4 | NOT_AVAILABLE | no authorized pinned preview | Extend after gate |
| Browser historic transfer | NOT_VERIFIED | historic deployment not transferable | Preserve history |

No similarity score; no shared-shell edit.

## P. Next Development Tasks

| # | Exact file | Change | Tests | Dependencies | Risk | Outcome | Acceptance |
|---|---|---|---|---|---|---|---|
| 1 | `lib/tools/r6/p03-result-schema-validation.test.ts` | add 046 runtime negative branch test | isolated vitest | scoped approval | low | P03-02 → E3 | PASS with no envelope |
| 2 | prepared browser spec / preview | authorized E4 run | Playwright | SSO, pinned preview, Deployment ID | low | 5 rows E4 | all PASS E4 |
| 3 | genius C4/C5/history boxes + owner record | gate artifacts | review sign-off | owner/specialist | medium | gates resolved | recorded approvals |

Reuse passing code; no shared-component change.

## Q. Current Tool Decision

**Decision: CONTINUE / REPAIR (P-03 + gates).** Completion `100 × 56 / 66 = 84.85%` E3+; closure grid `1/18 = 5.56%` is operational history. Preserve engine/schema/pipeline/contract/UI/i18n; add one scoped runtime-negative test, then close browser and owner gates. Status preserved `IN PROGRESS` / **Not 100% VERIFIED**. **No owner acceptance implied.**

## Integrity note

Body-before-hash convention: SHA below computed over all bytes preceding the final hash line; whole-file SHA is reported in the delivery response. No original was edited to reconcile a hash.

Observed on-disk SHA-256 (body before this line): `D61CAEE62B3D6A9D8C58BAE74F82658B153F2490246C4AE67A68AEB0EC0162B6`
