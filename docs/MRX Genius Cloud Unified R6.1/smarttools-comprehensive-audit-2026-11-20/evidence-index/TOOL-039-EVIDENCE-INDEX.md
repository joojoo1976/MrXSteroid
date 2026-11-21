# TOOL 039 — EVIDENCE INDEX (comprehensive 2026-11-20)

Companion to `../individual-tools/TOOL-039-R6.1-FORENSIC-AUDIT.md`.

| Field | Value |
|---|---|
| Audit mode | Read-only forensic audit |
| Fixed repository | `E:\MrXSteroid-main` |
| Audited HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (verified with `git rev-parse HEAD`) |
| Audit date | 2026-11-20 |
| Paths | All paths are repository-relative unless an absolute path is shown. |
| Deliverables written | `individual-tools/TOOL-039-R6.1-FORENSIC-AUDIT.md` and this file only |
| Non-execution | No build, test, lint, typecheck, calculator, browser, SSO, deployment, or runtime action was executed for this audit. All such actions are `NOT_RUN`; current-HEAD runtime verification is `NOT_VERIFIED`. |
| Forbidden commands | `node docs/MRX Genius Cloud Unified R6.1/tool-039-acceptance-calc.mjs` and `node docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/generate-audit-reports.mjs` were **not** executed. |
| Self-hash rule | Hashes below are observed on-disk SHA-256 values. No embedded self-hash is treated as authoritative. This file does not contain its own hash because writing it would invalidate that hash. |

---

## 1. Scope and evidence ladder

| Token | Meaning applied in the report |
|---|---|
| `E0` | No evidence / action not performed |
| `E1` | Assertion or narrative claim only |
| `E2` | File/static source presence |
| `E3` | Reproducible test result |
| `E4` | Authorized runtime/browser result |
| `E5` | Independent audit |
| `NOT_RUN` | Action not performed by this audit |
| `NOT_VERIFIED` | Figure or status not proven for current HEAD |
| `NOT_AVAILABLE` | Justified exclusion / unavailable capability or approval |
| `PENDING` / `OWNER-GATED` / `NOT ADOPTED` | P-05 synthetic demo-data status; no adoption implied |

Three-way split used in every report section: **Accepted Baseline** (historic Tool-039-only record, not re-certified), **Post-Baseline Additions** (P-01–P-05 and D-08 local-device exception), **Unresolved/Disputed** (provenance conflicts, missing current-HEAD E4, failing evidence test, textual/behavioral contradictions).

---

## 2. Report figure reconciliation — line by line

Command IDs refer to §8. `R` means the corresponding section/row in `TOOL-039-R6.1-FORENSIC-AUDIT.md`.

| R / figure | Report value | Source artifact and exact locator | Observed/derived value | Classification | Cmd |
|---|---|---|---|---|---|
| Header / audited HEAD | `37f047a4…` | `git rev-parse HEAD` | `37f047a4105d078b22edea2c857bf35aefdbdc7f` | Verified by this audit | C1 |
| Header / true-clean reference | `E:/p03-true-clean-20261118 @ 37f047a4` | `FULL-VITEST-SUMMARY.md:6` | Same text; pre-existing only | Historic / not re-run | C8 |
| Header / excluded worktree | `2a647fda` contaminated | Pre-existing audit notes; excluded by instruction | Not used | Excluded | — |
| A.1 / tool ID, slug, version, tier, order | `mrx.tool.039-liver-enzyme-tracker`, `tool-039-liver-enzyme-tracker`, `1.0.0`, `Page.LIVER_ENZYME_TRACKER`, `free`, `550` | `lib/tools/registry.ts`; `TOOL-SOURCE-SCAN.json:2656+` | Same identity fields | E2 static | C2, C7 |
| A.1 / EN/AR title | `Liver Enzyme Tracker` / `متتبع إنزيمات الكبد` | `lib/tools/registry.ts`; `i18n/tool-039-liver-enzyme-tracker.json` | Same | E2 static | C2 |
| A.1 / flat route absent, dynamic route present | `app/smarttools/[category]/[tool]/page.tsx` | `TOOL-SOURCE-SCAN.json:2662-2664`; source scan | `routeStatic=""`, `routeDynamic=app/smarttools/[category]/[tool]/page.tsx` | E2 static | C2, C7 |
| A.1 / box ownership | `R6_EXEMPT_SLUGS` | `lib/tools/r6/manifest.ts`; `components/tools/r6/R6ToolShell.tsx` | Slug exempt from generic shell boxes | E2 static | C2 |
| A.1 / primary file SHA | `6CD13453…E4A` | `components/tools/tool-039-liver-enzyme-tracker.tsx` | `6CD1345372E9A754600EEB8B74C9D37D51BE75EB0E1CB4A2035D173F76496E4A` | E2 observed | C2 |
| A.2 / Evidence Set A | `dpl_EKUNxn7zVDVYHVcxPkTQ85kCyD67`, 21 checks | `evidence/tool-039/tool-039-browser-verification.json` | `checks=21`, `PASS=21`, `FAIL=0`, date `2026-11-11T16:59:32.192Z`, `baseUrl=http://localhost:3100` | Historic only | C6 |
| A.2 / Evidence Set B | `dpl_JCfgB7Z9dTrVY3kboQCsEjUJL689`, 26/26 | change log Round 5; `evidence/tool039-fix/` | 26 checks, all PASS; published-preview history | Historic only | C6 |
| A.2 / Evidence Set C | `evidence/tool039-fix/`, local 26 checks | `evidence/tool039-fix/tool-039-browser-verification.json` | `checks=26`, `PASS=26`, `FAIL=0`, date `2026-11-11T22:20:26.775Z` | Historic only | C6 |
| A.2 / Evidence Set D | `dpl_AimJXowNb5TCQQZNJR8MCcvE2dHc`, 43/43 | `evidence/tool039-published-d08/tool-039-browser-verification.json` | `checks=43`, `PASS=43`, `FAIL=0`, date `2026-11-13T01:18:15.274Z`, `baseUrl=http://127.0.0.1:3202` | Historic only | C6 |
| A.2 / D-08 source provenance | `5a87f3e5…`, `committed:false` | `evidence/tool039-published-d08/deploy-source-manifest.json`; `deployment-metadata.json:20` | Source HEAD `5a87f3e5271db497a63833bb3cd1bb3df2078497`; deployed from local working tree, no commit/push/merge/rebase | Unresolved for current HEAD | C2, C7 |
| B.1 / Implementation Progress | `95/95 = 100.00%` | Read-only CSV parse of `tool-039-requirements.csv` | `NUM_E3PLUS 95 DEN 95 PCT 100.00` | Historic ledger-internal; requested E3+ lens | C3 |
| B.1 / Verified Completion | `12/95 = 12.63%` | Same parse, row-level `PASS && E>=E4` | `NUM_E4PLUS 12 DEN 95 PCT 12.63` | Historic ledger-internal; requested E4+ lens | C3 |
| B.1 / Runtime Verification | `NOT_RUN` / no percentage | No authorized SSO or Preview pinned to `37f047a4` | No current-HEAD Deployment ID | Unresolved | C1, C9 |
| B.1 / label conflict | Generic `Verified Completion` is E3+; no generic implementation formula | `AUDIT-METHODOLOGY.md` | Report explicitly defines Tool-039 forensic lenses and states non-transferability | Preserved conflict | C7 |
| B.2 / rows | `123` | CSV parse | `ROWS 123` | Recomputed | C3 |
| B.2 / applicable / N/A | `95` / `28` | CSV parse | `APPLICABLE 95`, `NA 28` | Recomputed | C3 |
| B.2 / column A | `SPEC_APPROVED:123` | CSV parse | Same | Recomputed | C3 |
| B.2 / column B | `PASS:95`, `NOT_APPLICABLE:28` | CSV parse | Same | Recomputed | C3 |
| B.2 / column C | `APPROVED:95`, `NOT_DECISIONED:28` | CSV parse | Same | Recomputed | C3 |
| B.2 / E all rows | `E2:26`, `E3:85`, `E4:12` | CSV parse | Same | Recomputed | C3 |
| B.2 / E applicable | `E3:83`, `E4:12` | CSV parse | Same | Recomputed | C3 |
| B.2 / E N/A | `E2:26`, `E3:2` | CSV parse | Same | Recomputed | C3 |
| B.2 / open and cell problems | `[]`, `[]` | CSV parse | `OPEN []`, `CELL_PROBLEMS []` | Recomputed | C3 |
| B.2 / 12 E4 IDs | List of 12 IDs | CSV parse | `ACC-R6.1-3.a`, `ACC-R6.1-3.d`, `LAYER-GENIUS12-11`, `LAYER-GENIUS12-12-RATING`, `ACC-5.5.4`, `ACC-5.5.6`, `ACC-5.5.7`, `ACC-5.5.8`, `ACC-5.5.9`, `SPEC-15-A11Y`, `ACC-5.5.7-LEGIBILITY`, `ACC-5.5.3-VISIBILITY` | Authoritative row-level set | C3 |
| B.2 / stale narrative | “10 E4” superseded | `R6.1-TOOL-039-BASELINE-AND-DELTA-RECONCILIATION.md:31`; reference profile `:210,:228` | Row-level 12 prevails | Unresolved narrative closed by row-level evidence | C7 |
| B.3 / Round 1 | `90/92 = 97.83%` | `tool-039-ledger-change-log.md:30` | Same | Historic | C7 |
| B.3 / Round 2 | `90/93 = 96.77%` | `tool-039-ledger-change-log.md:51` | Same | Historic | C7 |
| B.3 / Round 3 | `90/93 = 96.77%` | Change log Round 3 narrative | No count change | Historic | C7 |
| B.3 / Round 4 | `91/93 = 97.85%` | `tool-039-ledger-change-log.md:83` | Same | Historic | C7 |
| B.3 / Round 5 | `92/94 = 97.87%` | Change log Round 5; `TOOL-039-W18-HISTORY-RATING-PROPOSAL.md:225` | Same | Historic | C7 |
| B.3 / Rounds 6–8 | `95/95 = 100.00%` | E1 `:27`; reconciliation `:34,:62`; change log Round 8 | Same | Historic | C7 |
| B.4 / source presence proxy | `20/20`, proxy `100`, E2-only | `TOOL-SOURCE-SCAN.json:2651-2652`; `SMARTTOOLS-IMPLEMENTATION-SUMMARY.csv` row 039 | Same | Static E2 only; not progress | C2, C7 |
| C.1 / declared test counts | 3, 8, 25, 8, 13, 11, 38, 22, 14, 7 | `it`/`test` declaration counts in ten files | Same counts; visual component corrected from regex 23 to actual 22 | Static declarations; none executed | C5 |
| C.2 / selected hashes | engine `3825C696…`, pipeline `B5EC7073…`, contract `F105761A…`, i18n `B06DC783…`, CSV `CB47C6A2…`, calculator `8149B0E5…` | §4 hash register | All match | E2 observed | C2 |
| D.1 / 31-row original compliance view | 20 static + 6 browser + 4 gates + 1 P-03 | `SMARTTOOLS-R6.1-COMPLIANCE-MATRIX.csv` 039 rows at `:1459+`; `generate-audit-reports.mjs` | 31 Tool-039 rows | E2/E0 mixed; no new award | C7, C9 |
| D.2 / 20 static criteria | `PARTIAL`/E2 each, `20/20` source presence | `SOURCE-SCAN-STATS.md`; compliance CSV | Same | E2 only | C2, C7 |
| D.3 / browser rows | 6 × `NOT_RUN`/E0 | `SHARED-GATES-AND-SPECIAL-CONTROLS.md` | Same | Not run | C9 |
| D.3 / gates | `C4 NOT_AVAILABLE`, `C5 NOT_AVAILABLE`, `CLINICAL BLOCKED`, `W18 NOT_AVAILABLE`, `P03 PARTIAL` | Shared gates report | Same | Approval-gated | C7 |
| E / benchmark count | 23 | `generate-audit-reports.mjs:58-65`; `SMARTTOOLS-TOOL039-COMPARISON.csv` | 23 matching rows (`^039,`) | Reconstructed from script + CSV | C7, C9 |
| E / non-transfer | No specialized feature transferred | `SHARED-GATES-AND-SPECIAL-CONTROLS.md:43,:79` | Same | Binding constraint | C7 |
| F / seven layers | Math, Dynamic, Cross-Tool, Adaptive, Explainable, ML/Prediction, Community | `AUDIT-METHODOLOGY.md` §8; `SPEC.md` §§177–187 | Same; distinct from 12 internal services | Methodology | C7 |
| G / CORE-5 mapping | boxes `2,3,7,9,12` | `TOOL-039-GENIUS12-CROSSWALK.md`; `R6.1-CLOSURE-LAYER.md`; GENIUS component | Selector indices `[1,2,6,8,11]` = 1-based boxes `2,3,7,9,12` | E2; header label discrepancy preserved | C2, C7 |
| H.1 / P taxonomy | Governing P0–P2 only; P3–P9 heuristic; P-01… proposals separate | `AUDIT-METHODOLOGY.md`; `TOOL-039-DEVELOPMENT-PROPOSALS.md` | Same | Methodology | C7 |
| H.2 / phase matrix row | `P7`, `NOT_VERIFIED`, P0 `NOT_STARTED`, P1 `COMPLETED`, P2–P6 `SOURCE_PRESENT_UNVERIFIED`, P7 `TEST_FILE_PRESENT_UNVERIFIED`, P8 `NOT_RUN_SSO_REQUIRED`, P9 `NOT_STARTED`; tests=9 | `SMARTTOOLS-PHASE-MATRIX.csv` row 039 | Same | E2 heuristic, not evidence level | C7 |
| I.3 / full Vitest totals | `30 failed | 563 passed | 1 skipped (594)`; `67 failed | 5530 passed | 5 skipped (5602)`; `372.21s` | `FULL-VITEST-RUN-20261120.txt`; `FULL-VITEST-SUMMARY.md:10-12` | Same | Pre-existing; not re-run | C7, C8 |
| I.3 / Tool-039 acceptance-evidence suite | `7 tests | 3 failed` | `FULL-VITEST-RUN-20261120.txt`; `SMARTTOOLS-TEST-EVIDENCE-MATRIX.csv` 039 rows | Same | Unresolved/disputed | C7 |
| I.4 / acceptance artifact | 0 bytes, empty-file SHA | `TOOL-039-ACCEPTANCE.md` | `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`, 0 bytes | Artifact gap | C2 |
| I.4 / legibility | `4.61px` FAIL → `12.00px` PASS; `5/5` phone steps visible | `evidence/tool-039/legibility-390.json:13-21`; change log Round 4 | `svgRenderedWidthPx=0`, `visibleStepCount=5`, `smallestVisibleFontPx=12`, `largestVisibleFontPx=13` | Historic; internal 12px criterion | C7 |
| J / HTML marker contradiction | Consent strings `0` on both pre/post-D-08 HTML | `published-html-marker-comparison.json:3-20` | `Allow local storage on this device: 0` and `Withdraw consent and delete the stored data: 0` on both | Unresolved | C7 |
| J / bundle proof | `page-f52f77e146012c11.js`, `2,559,445` bytes | `published-bundle-d08-proof.json:6-17` | All four D-08 markers found | Historic bundle proof; interpretation disputed | C7 |
| J / two-browser dispute | `WORKTREE (local production build)`, `http://127.0.0.1:3202` | `two-browsers.json`; change log Round 6 | Same conflict | Unresolved | C7 |
| J / security finding | Shared `SecureStorage` plaintext; Tool 039 per-install Web Crypto + AES | Round 6 change log; history-store source | Same | Historic finding; no absolute claim | C2, C7 |
| J / hash discipline | E1 embedded `f81bb7a5…` vs observed `B54DB867…`; profile embedded `C7FEBA80…` vs observed `16DEE852…` | E1 file; reference profile; `SHARED-GATES-AND-SPECIAL-CONTROLS.md` source register | Observed values listed in §4 | Observed wins | C2, C7 |
| L / final decision | Preserve engineering reference; generator label recorded as `OWNER_ACCEPTED — CLOSED (historic baseline only; post-baseline additions unresolved)` | `generate-audit-reports.mjs` decision text; report §L | Same label recorded; no new acceptance | Historic only | C7 |
| M / report hash | Report file hash in §4 | `Get-FileHash` on final report | `43E21CCAA457132847617BF31DCB273BBCA6040CA5E60C7FDA1BBD0A8FE337F4` | E2 observed | C2 |

---

## 3. Evidence-set and provenance register

| Set / artifact | Historic claim | Current-audit treatment |
|---|---|---|
| Evidence Set A — `evidence/tool-039/` | 21/21 checks, 3 screenshots, local `http://localhost:3100`, date `2026-11-11T16:59:32.192Z` | Superseded history |
| Evidence Set B — `evidence/tool039-fix/` plus published-preview record | 26/26 published checks + 4 screenshots | History only; not tied to `37f047a4` |
| Evidence Set C — local production build | 26 checks, local worktree | History only |
| Evidence Set D — `evidence/tool039-published-d08/` | 43/43; protected Preview `dpl_AimJXowNb5TCQQZNJR8MCcvE2dHc`; `productionUrl: null`; `vercel_authentication`; `all_except_custom_domains`; 0 bypass entries; source `5a87f3e5…`; `committed:false` | Historic Tool-039-only D-08 evidence; no transfer, no W18 implication |
| Empty acceptance artifact | `TOOL-039-ACCEPTANCE.md` is 0 bytes | Provenance/display gap |
| Full Vitest log | Pre-existing run at true-clean `37f047a4`, exit 1, 3 Tool-039 acceptance-evidence failures | Observed only; not re-run; unresolved |

---

## 4. File hash register (observed SHA-256)

All hashes are uppercase on-disk values observed with `Get-FileHash -LiteralPath $p -Algorithm SHA256`. Sizes are bytes. Paths are repository-relative.

### 4.1 Governing documents, audit method, generated matrices

| SHA-256 | Bytes | Path |
|---|---:|---|
| `25F65EEA75891607C08A101A5E3205F6F08AB0A7AFEF00521DDE484A75C1AB60` | 573215 | `docs/MRX Genius Cloud Unified R6.1/PROMPT.md` |
| `2D12E3CAD54C6C408BB9B22F26E799DE29659031A76D715A8C4F0C7271A05826` | 414741 | `docs/MRX Genius Cloud Unified R6.1/SPEC.md` |
| `5FAA4A5A1E5C611A7A64D3B1A1BD4CA8BA36E6E0451FCA5D379EA90382C319F9` | 165935 | `docs/MRX Genius Cloud Unified R6.1/ACCEPTANCE_CRITERIA.md` |
| `AE38AE75AE4AE7829859CEF3C8135859F36FCA8E40F123C45EC46DA46E993188` | 81651 | `docs/MRX Genius Cloud Unified R6.1/R6.1-CLOSURE-LAYER.md` |
| `D3FE2FB9578D94A10AF2D9F66AAD88EEDC7D8337B3262EA2C4A8AF34FDB75E3F` | 9856 | `docs/MRX Genius Cloud Unified R6.1/R6.1-ACTIVATION-DECISION.md` |
| `ADC8E186B8ABD44A801E2BB6C767FB0119D4F19D400BF86DA6723265266841D1` | 5688 | `docs/MRX Genius Cloud Unified R6.1/R6.1-BROWSER-EVIDENCE-INDEX.md` |
| `2C7E1D246ADCA058B7433E5A0A0D1B9008108AB4F3FC6E9F34D45DA3ACD2DE70` | 6180 | `docs/MRX Genius Cloud Unified R6.1/R6.1-TOOL-039-BASELINE-AND-DELTA-RECONCILIATION.md` |
| `CB47C6A2B91E6F4BB3C2DD514B69F95D3BD469A1842F3C125891B1281C6F98B6` | 119573 | `docs/MRX Genius Cloud Unified R6.1/tool-039-requirements.csv` |
| `8149B0E53B69DF39B01A0EB6367657B71F91CCABFD577A4C6CA87711DFA77A24` | 10242 | `docs/MRX Genius Cloud Unified R6.1/tool-039-acceptance-calc.mjs` |
| `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` | 0 | `docs/MRX Genius Cloud Unified R6.1/TOOL-039-ACCEPTANCE.md` |
| `4187FE415179C73BFAF7E2F981B3728FE7F8F59AE261F94D0549EB218FE53378` | 48713 | `docs/MRX Genius Cloud Unified R6.1/tool-039-acceptance.template.md` |
| `0F690A0E5BD367FC65D1C2761F13420DAEB8AACD04EBB1F6B726A45DA7342005` | 29080 | `docs/MRX Genius Cloud Unified R6.1/tool-039-ledger-change-log.md` |
| `899A862EF98D8BFE9F7E4963E7841A965031BD95A6B28D752EC2705EFF8DF542` | 11299 | `docs/MRX Genius Cloud Unified R6.1/TOOL-039-DEVELOPMENT-PROPOSALS.md` |
| `EEA761230C9CD4EB756D9BD72E74ED3F78B6369D0B742A2C50FE1408995A2489` | 18655 | `docs/MRX Genius Cloud Unified R6.1/TOOL-039-NEXT-DEVELOPMENT-SPEC.md` |
| `41FED5D00863B24F6943E40BB60B75F41CC68F0DAC72DA61091F0C0CEF0B8538` | 27211 | `docs/MRX Genius Cloud Unified R6.1/TOOL-039-W18-HISTORY-RATING-PROPOSAL.md` |
| `063D6E5D8FE74BF3E19A2D73765506B5E0E33E95F6DEE0D09DE484256205B506` | 13033 | `docs/MRX Genius Cloud Unified R6.1/TOOL-039-GENIUS12-CROSSWALK.md` |
| `5DBEFB21DB94720F368391CA0B54C4D03C755B55DB97818DA94DBA24ABBB3D94` | 27115 | `docs/MRX Genius Cloud Unified R6.1/HISTORY-CONTEXT-INTEGRATION-REPORT.md` |
| `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9` | 8855 | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/phase-next/00-PLAN-AND-AUDIT-STANDARD.md` |
| `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA` | 31931 | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/phase-next/R6.1-TOOL-039-ENGINEERING-REFERENCE-PROFILE.md` |
| `B54DB8670458CF072D42A9B38B5710A9F6F39DBAB2AB888EBAD7E7EEB46D2161` | 13914729 | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/retry-01/E1-TOOL-039-HISTORIC-BASELINE-AND-DELTA.md` |
| `A8A1A9BA2C87F8B2723B703EA507B19357114269B15CF8EC842C571F38840A0E` | 601 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/README.md` |
| `00C31A4798773E80B196729B7E27DCFD51191AD56C896A5F3C5FABB7008D7C7C` | 26700 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/AUDIT-METHODOLOGY.md` |
| `4D6A47CDD3C17FC67C9F1929051AC7B60595F74CC011D31FF3B9FD0BB2FB31EC` | 15052 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/GOVERNING-DOCUMENT-SHAS.txt` |
| `6DA2C9FE867D483538260160C60696246BE0AE6E85632EC053B3C876242DD3A8` | 821 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/SOURCE-SCAN-STATS.md` |
| `707CB2E4B6888CAFD03E358B38CEBF5E931C0F7AF7ECB6B36F856278D9D9AD15` | 27487 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/SHARED-GATES-AND-SPECIAL-CONTROLS.md` |
| `8DE61FDE61BE0DBAC25C90875A853FA760950990A2490FA2881C1E8281C55E2F` | 31214 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/generate-audit-reports.mjs` |
| `0350BDBA9D7958E83038A71F0DD744D2F7E859F837CB328B4D34CFCFD0C99C57` | 15747 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/scan-tools.mjs` |
| `9B27EF6B95BFCFD3F7C09C158B5BE92DAD873F1D7A1F3160CCB1E5A8A9A02F30` | 3901 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/FULL-VITEST-SUMMARY.md` |
| `37053A3E8DF118E2F3527A3B1D1877EBFAD4827E69DDC1C460571B1BB9AAFAB7` | 561173 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/FULL-VITEST-RUN-20261120.txt` |
| `0B40362329336AF315E2A4927A5233F3FD1AB51ED923C082D560D9B47A974DB8` | 525015 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/TOOL-SOURCE-SCAN.json` |
| `6739C4B0681BA0AB1AA99F2D71580FB8071972AB32EEC2671476DA91ACDB8E00` | 267237 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/SMARTTOOLS-IMPLEMENTATION-SUMMARY.csv` |
| `25F11320B56FBDEE2A2A28E8B274DCBAB40C9160FC02C33D1AC67E279EF8E0B9` | 100113 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/SMARTTOOLS-PHASE-MATRIX.csv` |
| `2F610AA8C8A3DB2A9635751E65DC1EE4D7E503BCB2C099CFA3BE04108EB6C068` | 359192 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/SMARTTOOLS-TEST-EVIDENCE-MATRIX.csv` |
| `D7BA38611C8FA160CCFA834738ACB5829AE43850C80FDFE3046C84DEF43571F6` | 1479272 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/SMARTTOOLS-TOOL039-COMPARISON.csv` |
| `D00EE51427A4088B565D4CBE3750674F018A5B7E7647440F5531AED9E120B926` | 1503873 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/SMARTTOOLS-R6.1-COMPLIANCE-MATRIX.csv` |
| `139DF816203320732F1F8102F27FA264980CA7FA2D05394B2AC250202DA0BC1E` | 360534 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/SMARTTOOLS-REMAINING-GAPS.csv` |
| `033CBDFE96DF6F9EE35BCCBE3BAA25BF030D7EF4E0B1984D6226C55DDC4B0811` | 117 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/SMARTTOOLS-100-PERCENT-VERIFIED-LIST.csv` |
| `43E21CCAA457132847617BF31DCB273BBCA6040CA5E60C7FDA1BBD0A8FE337F4` | 42131 | `docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/individual-tools/TOOL-039-R6.1-FORENSIC-AUDIT.md` |

### 4.2 Tool 039 source and tests

| SHA-256 | Bytes | Path |
|---|---:|---|
| `3825C696826857AD723F67F5F1D2520DAB0A484512829F9E93203AAC417A448A` | 4430 | `lib/tools/engines/tool-039-liver-enzyme-tracker.ts` |
| `3973365A35D17FFE86A69B7A6199E173EF129230C6157EAC070496EDD5F93DC6` | 1979 | `lib/tools/engines/tool-039-liver-enzyme-tracker.test.ts` |
| `C1EEC6B6DD3ED0A8A6A538860EF498474D7D8F4FA8BF12AE57464A5B7DF7A328` | 1415 | `lib/tools/schemas/tool-039-liver-enzyme-tracker.ts` |
| `B5EC7073FC6585578051A4DC79ED87E63F986F90B68F33BB1B8E49A09C3E78BA` | 4383 | `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.ts` |
| `B5F1C38E337CF9170BBBE86FA3FC5F8FC6B0B3C1A806AE0A739FC3D27C551B4B` | 6184 | `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts` |
| `F105761ACEB440DFF21F4798D3E4B458E0282BF99B2C5AAD38A3C8FD890C457C` | 18382 | `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts` |
| `73536135F6892F6DC2E7A9693704A5CCD4F145A6315F8ECA8720DB24386E6A08` | 14732 | `lib/tools/r6/tool-039-liver-enzyme-tracker-contract.test.ts` |
| `7314E0F5CBED0D8BD5F71FE1B67C8EBAD196404AA76F7B265BB5364BB45C1471` | 10549 | `lib/tools/r6/tool-039-liver-enzyme-tracker-visual.ts` |
| `45CA0B79C85E8571A189FFE87A2954F3668BA87042A95C82BB80BE5751EB5ACA` | 6120 | `lib/tools/r6/tool-039-liver-enzyme-tracker-visual.test.ts` |
| `24C0D90137C229F745B773A7495A832E5BB8A7EDB1E799FECC1EB9F1DC7CD79B` | 11541 | `lib/tools/r6/tool-039-liver-enzyme-tracker-history-store.ts` |
| `5A76C47EF4B6BCFBB102DD309D1C69C918F960E389E5145C25F536E2B1CA85F4` | 8405 | `lib/tools/r6/tool-039-liver-enzyme-tracker-history-store.test.ts` |
| `6E1F4CC754F0DA68B09DAE4ECAA302AD42FF2B604871B0FEEC54E7A42CACB52E` | 11360 | `lib/tools/r6/tool-039-liver-enzyme-tracker-history.ts` |
| `7E447B10C9597A499FCACC8483B770D596C3298138B218BF971F4F0B997D3FEC` | 8252 | `lib/tools/r6/tool-039-liver-enzyme-tracker-history.test.ts` |
| `6CD1345372E9A754600EEB8B74C9D37D51BE75EB0E1CB4A2035D173F76496E4A` | 34206 | `components/tools/tool-039-liver-enzyme-tracker.tsx` |
| `5A8F7EBE023AA697AA2D99ED9D2EB0F9049753FF94029D3FF7C30B57F327A590` | 24626 | `components/tools/tool-039-liver-enzyme-tracker.test.tsx` |
| `81218CA2DDE3DF61328D15C8F7E255074C586F363CDE86CFFC80F812AA413A24` | 33949 | `components/tools/tool-039-liver-enzyme-tracker.genius.tsx` |
| `E27B097A3E30147F383F32A15EEA72EE5362F324CEE259849EC655EA72209D09` | 42692 | `components/tools/tool-039-liver-enzyme-tracker.visual.tsx` |
| `0A2AF4E730FF93439739BCCAD0C73CF74AD1F0DC36F0BA083C052D9F54FF6F08` | 19631 | `components/tools/tool-039-liver-enzyme-tracker.visual.test.tsx` |
| `CADB407B9A397C1FB21442FAFBB099DE2B61E5338A94DA835728ED22C55FC827` | 15575 | `components/tools/tool-039-liver-enzyme-tracker.history.tsx` |
| `802D886138DE44626CB8F5B8750490346FB75899692741B6B179CBE254C6B4E1` | 14353 | `components/tools/tool-039-liver-enzyme-tracker.history.test.tsx` |
| `5E6F9C140D952E02247E74899830F96CE0C2302C1ED2038A71D27ADF30C05C21` | 10096 | `components/tools/tool-039-liver-enzyme-tracker.ocr.tsx` |
| `8924C2CA1940F4FF289578C56A47CB0356E92DA193A71843B03188CB4E8DA837` | 8036 | `components/tools/tool-039-liver-enzyme-tracker.pdf.tsx` |
| `B06DC78364BFA40BFCC97D3BF24309CDB98AAF117253D26D97E4873D13D63BF1` | 51009 | `i18n/tool-039-liver-enzyme-tracker.json` |
| `39891CB920E35838C93F899E6EB6EA5461AC4B1567AB55814957178F74B2F638` | 107157 | `lib/tools/registry.ts` |
| `4AF80EA997096017990DD97D4DD2E966AF546B77D4CF818473B1412FFDD86963` | 4609 | `lib/tools/r6/manifest.ts` |
| `53B4C009B84550FA2D02420B9B2B31F856CCC485AA02009A528F1543E16803EC` | 21796 | `components/tools/r6/R6ToolShell.tsx` |
| `351E7CBEA48F863AFB0305CFFB3E950E814F91C00319B4CEBDA982AF8026F4C3` | 6036 | `app/smarttools/[category]/[tool]/page.tsx` |
| `592B19EAA3EDD2419F8446B6B3384A035E7A99B710306777DDF9AACB344FAEE1` | 7734 | `tests/unit/tool-039-acceptance-evidence.test.ts` |

### 4.3 Historic browser/deployment evidence

| SHA-256 | Bytes | Path |
|---|---:|---|
| `E83808145D7523839CAFADE30EEC64473ABE3F64623C82DFE2E4E728C171ACE8` | 19576 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/deployment-metadata.json` |
| `82BB4567FF3773BBCCCAE0405A6FCE8C5820B181E588383FCB5EB56D473BA431` | 4196 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/deploy-source-manifest.json` |
| `6802462C1BF509301170DA215644E13559A4B8AC93B600C679C00DC03B3868AF` | 896 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/published-bundle-d08-proof.json` |
| `A9EF4C8A5DCD6CC2C7037EB667CC066B352A64BF7FE840788C77B7B5A73BA878` | 1315 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/published-html-marker-comparison.json` |
| `1CA30CC6B303D49261A84933942D79E05895BFF56082D0B0D5530AC4B946C20C` | 78862 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/tool-039-arabic-rtl-1440.png` |
| `67311502A5279265E8D4C0BABB53DF0C27382DB11ABF99768705C34EA03F3394` | 8360 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/tool-039-browser-verification.json` |
| `6AA630903680C50E573ACB85B7EE67C04F4C3CE19374E7278900D1C5E9C736D8` | 109567 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/tool-039-desktop-1440.png` |
| `8670AE7103F367035E0FA63118B6D17B92B8AFC4C7250EBD25429B6F5FBD986A` | 97692 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/tool-039-empty-1440.png` |
| `21D727C2869411502D3A40A4F764DEC61B33A7B40973567DC3213A38B413DFB9` | 62578 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/tool-039-history-1440.png` |
| `866CD9B52FD156E2132CB8343DE16096D6A6D809581646B24BE6107705454754` | 155130 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/tool-039-history-390.png` |
| `866CD9B52FD156E2132CB8343DE16096D6A6D809581646B24BE6107705454754` | 155130 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/tool-039-mobile-390.png` |
| `9B106ACDE87C407611370030B9DC2EF6265CF41B40E15758F132F5D3B3CD639C` | 572 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/two-browsers.json` |
| `D257B9B4DDD19566A561962D0CFA3D1174134DD97850AC2020DCC081E026E46B` | 1465 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-fix/deploy-source-manifest.json` |
| `852B7276C621A94B5939B59B8B07329CCFC802ED40DFDBBB6BC8AF2E71B01A3C` | 80520 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-fix/tool-039-arabic-rtl-1440.png` |
| `B9CC139317729E9C0AC8FFF95FFDE87B86EE143DF5605A42F36408202B2E4950` | 4753 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-fix/tool-039-browser-verification.json` |
| `9E9C0889F9F2FEFEB228B6704EEE496BC9535C900EC9C418E3E289B8822D27BD` | 112790 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-fix/tool-039-desktop-1440.png` |
| `0D8110C5BE096A9F44725026BAE8F3182E8BCBB3A276CCCFE0B5F2414609DCBA` | 39850 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-fix/tool-039-empty-1440.png` |
| `8732EE9177A44DC344B497ABA12EC223245CF386B9C51A0835189C87CDA3256C` | 167772 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool039-fix/tool-039-mobile-390.png` |
| `2768BE8023904CC9C20954F871C67F7B7BF08C355B5A4091494A505A5BDB1DA1` | 3917 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/legibility-390.json` |
| `A3FDF6568A0D836E8273C3EA61BAA91A8A4E3AD6F1F9C690E9FA90C90D68C236` | 192194 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/legibility-390.png` |
| `CD809B95B81432833D6BB520F8B914EFA2F8C9D1861E940AB9425ECEC1D544A7` | 80353 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/tool-039-arabic-rtl-1440.png` |
| `F57F336497E5716036989FEA4AF8EEBE5FFED66DBA7617FCC2FAC42A486A21E4` | 3806 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/tool-039-browser-verification.json` |
| `B1E0521E8AE3505EAA9A56087EC1C870468529C8636BB3D8E37B8F8164D3F4B1` | 112248 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/tool-039-desktop-1440.png` |
| `B5FDD6D3FCB28FD8387E0CC9415BF8580856E036F238AB9F4C7B9349EF0BD270` | 199357 | `docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/tool-039-mobile-390.png` |

---

## 5. Reconstructed 23 shared benchmarks

The generated `SMARTTOOLS-TOOL039-COMPARISON.csv` contains 23 rows beginning `039,` at lines 1083–1105. Definitions and `T039_BENCH` statuses are in `generate-audit-reports.mjs:58-90`. No similarity score is computed.

| # | Benchmark | Tool 039 status used in report |
|---:|---|---|
| 1 | Component architecture | `FULL` — layered chain; E2 static; historic E1 |
| 2 | Engine/UI separation | `FULL` — pure engine separated from UI; E2 static |
| 3 | Input validation | `FULL` — field validation + Zod; E2 static |
| 4 | Schema validation | `FULL` — input/result schemas; E2 static |
| 5 | Pipeline integrity | `FULL structural`; current-HEAD E4 `NOT_RUN` |
| 6 | Equation correctness | `FULL declared`; E2 static; historic E1 |
| 7 | Result states (5) | `FULL declared`; E2 static |
| 8 | GENIUS-12 | `FULL`; 12 tool-owned boxes; E2 |
| 9 | CORE-5 | `FULL declared`; boxes `2,3,7,9,12`; label discrepancy preserved |
| 10 | Dynamic results | `FULL declared`; 120 ms debounce + signature gating |
| 11 | What-If (conditional) | `APPLICABLE`; arithmetic scenarios, not predictions |
| 12 | Explainability | `PARTIAL`; confidence `null` |
| 13 | Capability contract | `FULL`; seven-part no-AI/no-diagnosis contract |
| 14 | Warnings and limits | `FULL`; explicit safety wording |
| 15 | EN/AR | `FULL declared`; current-HEAD browser `NOT_RUN` |
| 16 | RTL/LTR | `FULL declared`; historic screenshots only |
| 17 | Responsive UI | `NOT_RUN` current-HEAD |
| 18 | Accessibility | `NOT_VERIFIED` current-HEAD |
| 19 | Security/Privacy | `FULL static`; no network/DB/AI in engine/pipeline |
| 20 | Unit/Integration/Contract tests | `PARTIAL`; suites declared; none run by this audit |
| 21 | Browser/Runtime verification | `NOT_RUN` current-HEAD |
| 22 | Documentation/Sources | `NOT_AVAILABLE`; D-C4 source pack unapproved |
| 23 | Rollback/Reproducibility | `NOT_VERIFIED`; no rollback drill |

---

## 6. Non-transfer and unresolved register

| Control | Observed rule |
|---|---|
| Tool 039 in 29-tool denominator | **NO** — `SHARED-GATES-AND-SPECIAL-CONTROLS.md:43,:79` |
| `OWNER_ACCEPTED` transfer | **NO** — historic Tool-039-only record |
| D-08 transfer | **NO** — local-device history/rating exception only; no DB, migration, Supabase/RLS, Storage, cloud sync, session/shared storage, other-tool extension, commit/push/merge/rebase, or production deploy |
| P-05 synthetic data | `PENDING / OWNER-GATED / NOT ADOPTED` |
| P-03 OCR | Static client-side text parser with simulated image/PDF fallback; capability contract denies lab-report/image/voice reading; unresolved |
| P-04 PDF | Print-summary component; real PDF/Blob delta not proven |
| Current-HEAD E4 | None; no authorized SSO, pinned Preview, or Deployment ID |
| Historic full-run failures | `tests/unit/tool-039-acceptance-evidence.test.ts`: 7 tests, 3 failed; unresolved |
| Acceptance artifact | Empty file; no display/provenance claim supported |

---

## 7. Generated-file presence note

A presence check run during this audit returned `True` for `SMARTTOOLS-TOOL039-COMPARISON.csv`, `SMARTTOOLS-R6.1-COMPLIANCE-MATRIX.csv`, `SMARTTOOLS-REMAINING-GAPS.csv`, and `SMARTTOOLS-100-PERCENT-VERIFIED-LIST.csv`. An earlier check in the working session had found the first two absent. This audit did **not** run `generate-audit-reports.mjs`; the report reconstructs benchmark definitions from the generator source and cites the generated CSVs only as pre-existing artifacts. No status was invented from the earlier absence.

---

## 8. Exact commands used

All commands were run from `E:\MrXSteroid-main` and were read-only. Commands that write were explicitly **not** run.

### C1 — HEAD verification

```powershell
git rev-parse HEAD
```

Observed output:

```text
37f047a4105d078b22edea2c857bf35aefdbdc7f
```

### C2 — SHA-256 and byte-size capture

The following loop body was used for each path group in §4 (the `$paths` array was populated with the exact paths listed in §4.1–§4.3):

```powershell
foreach ($p in $paths) {
  if (Test-Path -LiteralPath $p -PathType Leaf) {
    $h = Get-FileHash -LiteralPath $p -Algorithm SHA256
    $b = (Get-Item -LiteralPath $p).Length
    Write-Output ("{0}`t{1}`t{2}" -f $h.Hash, $b, $p)
  } else {
    Write-Output ("MISSING`t0`t{0}" -f $p)
  }
}
```

For all evidence images, the equivalent directory enumerator was used:

```powershell
$dirs = @(
'docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08',
'docs/MRX Genius Cloud Unified R6.1/evidence/tool039-fix',
'docs/MRX Genius Cloud Unified R6.1/evidence/tool-039'
)
foreach ($d in $dirs) {
  Get-ChildItem -LiteralPath $d -File | Sort-Object Name | ForEach-Object {
    $h = Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256
    Write-Output ("{0}`t{1}`t{2}" -f $h.Hash, $_.Length, $_.FullName.Replace('\','/'))
  }
}
```

### C3 — Read-only CSV recomputation (successful)

A PowerShell here-string was piped to `node -`. The calculator was **not** executed.

```powershell
$script = @'
const fs = require('fs');
const p = 'docs/MRX Genius Cloud Unified R6.1/tool-039-requirements.csv';
const s = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
const rows = []; let row = [], field = '', q = false;
for (let i = 0; i < s.length; i++) {
  const c = s[i];
  if (q) {
    if (c === '"') { if (s[i + 1] === '"') { field += '"'; i++; } else q = false; }
    else field += c;
  } else if (c === '"') q = true;
  else if (c === ',') { row.push(field); field = ''; }
  else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
  else field += c;
}
if (field || row.length) { row.push(field); rows.push(row); }
const h = rows[0];
const expected = ['req_id','requirement','applicability','A','B','C','E','files','test_result','verified_date','head','evidence_uri','gap_next_action','closure_evidence'];
const data = rows.slice(1).filter((r) => r.length === h.length).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i]])));
const tally = (key) => data.reduce((a, r) => { a[r[key]] = (a[r[key]] || 0) + 1; return a; }, {});
const applicable = data.filter((r) => !String(r.applicability || '').toUpperCase().includes('NOT_APPLICABLE'));
const na = data.filter((r) => String(r.applicability || '').toUpperCase().includes('NOT_APPLICABLE'));
const e3plus = applicable.filter((r) => r.B === 'PASS' && ['E3','E4','E5'].includes(r.E));
const e4plus = applicable.filter((r) => r.B === 'PASS' && ['E4','E5'].includes(r.E));
const open = data.filter((r) => !['PASS','NOT_APPLICABLE'].includes(r.B)).map((r) => r.req_id);
const cellProblems = data.filter((r) => !r.req_id || !r.A || !r.B || !r.C || !r.E).map((r) => r.req_id || '<blank id>');
console.log('HEADER_MATCH ' + (JSON.stringify(h) === JSON.stringify(expected)));
console.log('ROWS ' + data.length);
console.log('APPLICABLE ' + applicable.length);
console.log('NA ' + na.length);
console.log('A ' + JSON.stringify(tally('A')));
console.log('B ' + JSON.stringify(tally('B')));
console.log('C ' + JSON.stringify(tally('C')));
console.log('E_ALL ' + JSON.stringify(tally('E')));
console.log('E_APP ' + JSON.stringify(applicable.reduce((a, r) => { a[r.E] = (a[r.E] || 0) + 1; return a; }, {})));
console.log('E_NA ' + JSON.stringify(na.reduce((a, r) => { a[r.E] = (a[r.E] || 0) + 1; return a; }, {})));
console.log('E4_IDS ' + JSON.stringify(e4plus.map((r) => r.req_id)));
console.log('NUM_E3PLUS ' + e3plus.length + ' DEN ' + applicable.length + ' PCT ' + (100 * e3plus.length / applicable.length).toFixed(2));
console.log('NUM_E4PLUS ' + e4plus.length + ' DEN ' + applicable.length + ' PCT ' + (100 * e4plus.length / applicable.length).toFixed(2));
console.log('OPEN ' + JSON.stringify(open));
console.log('CELL_PROBLEMS ' + JSON.stringify(cellProblems));
'@
$script | node -
```

Observed output:

```text
HEADER_MATCH true
ROWS 123
APPLICABLE 95
NA 28
A {"SPEC_APPROVED":123}
B {"PASS":95,"NOT_APPLICABLE":28}
C {"APPROVED":95,"NOT_DECISIONED":28}
E_ALL {"E3":85,"E2":26,"E4":12}
E_APP {"E3":83,"E4":12}
E_NA {"E2":26,"E3":2}
E4_IDS ["ACC-R6.1-3.a","ACC-R6.1-3.d","LAYER-GENIUS12-11","LAYER-GENIUS12-12-RATING","ACC-5.5.4","ACC-5.5.6","ACC-5.5.7","ACC-5.5.8","ACC-5.5.9","SPEC-15-A11Y","ACC-5.5.7-LEGIBILITY","ACC-5.5.3-VISIBILITY"]
NUM_E3PLUS 95 DEN 95 PCT 100.00
NUM_E4PLUS 12 DEN 95 PCT 12.63
OPEN []
CELL_PROBLEMS []
```

**Failed attempt disclosure:** an earlier read-only `node -e` one-liner for the same CSV failed because of PowerShell quoting. It produced no parse result and no figure in this report or index was taken from it. Its exact text was not retained in the evidence notes; the successful here-string command above is the authority.

### C4 — Generated-file presence check

```powershell
$base = 'docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20'
foreach ($n in @('SMARTTOOLS-TOOL039-COMPARISON.csv','SMARTTOOLS-R6.1-COMPLIANCE-MATRIX.csv','SMARTTOOLS-REMAINING-GAPS.csv','SMARTTOOLS-100-PERCENT-VERIFIED-LIST.csv','individual-tools/TOOL-039-R6.1-FORENSIC-AUDIT.md','evidence-index/TOOL-039-EVIDENCE-INDEX.md')) {
  $p = Join-Path $base $n
  Write-Output ("{0}`t{1}" -f (Test-Path -LiteralPath $p -PathType Leaf), $p)
}
```

Observed output (at time of check): the four CSVs and the report existed; the evidence index did not yet exist. This file now exists.

### C5 — Declared test-case counts

First, a broad regex was used; it returned 23 for the visual component because it also matched one `.test(...)` regular-expression call:

```powershell
$files = @(
'lib/tools/engines/tool-039-liver-enzyme-tracker.test.ts',
'lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts',
'lib/tools/r6/tool-039-liver-enzyme-tracker-contract.test.ts',
'lib/tools/r6/tool-039-liver-enzyme-tracker-visual.test.ts',
'lib/tools/r6/tool-039-liver-enzyme-tracker-history.test.ts',
'lib/tools/r6/tool-039-liver-enzyme-tracker-history-store.test.ts',
'components/tools/tool-039-liver-enzyme-tracker.test.tsx',
'components/tools/tool-039-liver-enzyme-tracker.visual.test.tsx',
'components/tools/tool-039-liver-enzyme-tracker.history.test.tsx',
'tests/unit/tool-039-acceptance-evidence.test.ts'
)
foreach ($f in $files) {
  $n = (Select-String -LiteralPath $f -Pattern '\b(it|test)\s*\(' -AllMatches | ForEach-Object { $_.Matches.Count } | Measure-Object -Sum).Sum
  Write-Output ("{0}`t{1}" -f $n, $f)
}
```

Corrected count used in the report:

```powershell
foreach ($f in $files) {
  $n = (Select-String -LiteralPath $f -Pattern '(?<!\.)\b(it|test)\s*\(' -AllMatches | ForEach-Object { $_.Matches.Count } | Measure-Object -Sum).Sum
  Write-Output ("{0}`t{1}" -f $n, $f)
}
```

Observed corrected output:

```text
3	lib/tools/engines/tool-039-liver-enzyme-tracker.test.ts
8	lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts
25	lib/tools/r6/tool-039-liver-enzyme-tracker-contract.test.ts
8	lib/tools/r6/tool-039-liver-enzyme-tracker-visual.test.ts
13	lib/tools/r6/tool-039-liver-enzyme-tracker-history.test.ts
11	lib/tools/r6/tool-039-liver-enzyme-tracker-history-store.test.ts
38	components/tools/tool-039-liver-enzyme-tracker.test.tsx
22	components/tools/tool-039-liver-enzyme-tracker.visual.test.tsx
14	components/tools/tool-039-liver-enzyme-tracker.history.test.tsx
7	tests/unit/tool-039-acceptance-evidence.test.ts
```

### C6 — Historic browser-check counts

```powershell
$files = @(
'docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/tool-039-browser-verification.json',
'docs/MRX Genius Cloud Unified R6.1/evidence/tool039-fix/tool-039-browser-verification.json',
'docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/tool-039-browser-verification.json'
)
foreach ($f in $files) {
  $j = Get-Content -LiteralPath $f -Raw | ConvertFrom-Json
  $checks = @($j.results)
  $pass = @($checks | Where-Object { $_.result -eq 'PASS' }).Count
  $fail = @($checks | Where-Object { $_.result -eq 'FAIL' }).Count
  Write-Output ("{0}`tchecks={1}`tPASS={2}`tFAIL={3}`tdate={4}`tbaseUrl={5}" -f $f, $checks.Count, $pass, $fail, $j.date, $j.baseUrl)
}
```

Observed output:

```text
docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/tool-039-browser-verification.json	checks=21	PASS=21	FAIL=0	date=2026-11-11T16:59:32.192Z	baseUrl=http://localhost:3100
docs/MRX Genius Cloud Unified R6.1/evidence/tool039-fix/tool-039-browser-verification.json	checks=26	PASS=26	FAIL=0	date=2026-11-11T22:20:26.775Z	baseUrl=http://localhost:3100
docs/MRX Genius Cloud Unified R6.1/evidence/tool039-published-d08/tool-039-browser-verification.json	checks=43	PASS=43	FAIL=0	date=2026-11-13T01:18:15.274Z	baseUrl=http://127.0.0.1:3202
```

An earlier attempt counted `$j.checks` and returned `checks=1` because the JSON property is `results`; that attempt produced no figures used in the report.

### C7 — Read-only searches and file reads

Source files were read with the `read` tool and searched with ripgrep-style patterns including `039`, `^039,`, `E4`, `90/92`, `90/93`, `91/93`, `92/94`, `95/95`, `Evidence Set`, `data-r6-acg-gauge`, `role="meter"`, `De Ritis`, and the benchmark names in §5. These operations changed no files. Line locators quoted in §2 are from those reads.

### C8 — Pre-existing full-run summary read

```text
read docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/FULL-VITEST-SUMMARY.md
read docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/FULL-VITEST-RUN-20261120.txt
```

No test command was issued by this audit.

### C9 — Commands explicitly not executed

```text
node docs/MRX Genius Cloud Unified R6.1/tool-039-acceptance-calc.mjs
node docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/generate-audit-reports.mjs
node "E:/p03-true-clean-20261118/node_modules/vitest/vitest.mjs" run --root E:/p03-true-clean-20261118
```

No browser, SSO, deploy, build, lint, or typecheck command was executed.

---

## 9. Delivery statement

- Report: `../individual-tools/TOOL-039-R6.1-FORENSIC-AUDIT.md`
- Index: this file
- Only these two deliverables were written.
- No application source, contract, schema, ledger, registry, git state, prior report, generated CSV, evidence file, build artifact, deployment, browser session, or SSO flow was modified or executed.
- Historic Tool-039 `OWNER_ACCEPTED` and D-08 local-device history/rating authorization are not transferred to any other tool and are not re-awarded for current HEAD.

**End of evidence index.**
