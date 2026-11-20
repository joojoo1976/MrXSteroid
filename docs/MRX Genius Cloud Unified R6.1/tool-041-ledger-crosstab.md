# TOOL 041 - 138-ROW CROSS-TABULATION (applicability x B x E)

**Status:** `OWNER_REVIEW` - NOT ACCEPTED - NOT CLOSED. This table is evidence arithmetic, not acceptance.

**As of:** 2026-11-14

**Ledger:** `tool-041-requirements.csv` - 138 rows / 138 unique IDs

**Fingerprint:** `ed1e330faf571789872a8456e1caac723458912eecee8136263bc1076296450d` (78528 bytes)

**Completion rule:** `(applicable rows with B=PASS and E>=E3) / applicable rows x 100`.
`NOT_AVAILABLE` stays in the denominator and is never PASS. `NOT_APPLICABLE` is excluded only with a reason and proof. `PARTIAL`, `FAIL`, `BLOCKED` and `NOT_RUN` are never completion.

## Aggregate result

| Metric | Value |
|---|---:|
| Rows | 138 |
| Applicable (denominator) | 132 |
| NOT_APPLICABLE (excluded with proof) | 6 |
| Completion numerator (B=PASS and E>=E3) | 76 |
| Completion | **76 / 132 = 57.58%** |
| Ledger integrity | OK |

## Cross-tabulation: applicability x B x E

| Applicability | B | E | Rows |
|---|---|---|---:|
| APPLICABLE | PASS | E3 | 53 |
| APPLICABLE | PASS | E4 | 23 |
| APPLICABLE | PARTIAL | E1 | 1 |
| APPLICABLE | PARTIAL | E2 | 14 |
| APPLICABLE | PARTIAL | E3 | 16 |
| APPLICABLE | PARTIAL | E4 | 1 |
| APPLICABLE | FAIL | E2 | 3 |
| APPLICABLE | FAIL | E3 | 6 |
| APPLICABLE | NOT_AVAILABLE | E2 | 1 |
| APPLICABLE | NOT_AVAILABLE | E3 | 11 |
| APPLICABLE | BLOCKED | E2 | 2 |
| APPLICABLE | NOT_RUN | E0 | 1 |
| NOT_APPLICABLE | NOT_APPLICABLE | E2 | 6 |

## Marginals

| B | Rows |
|---|---:|
| PASS | 76 |
| PARTIAL | 32 |
| FAIL | 9 |
| NOT_AVAILABLE | 12 |
| BLOCKED | 2 |
| NOT_RUN | 1 |
| NOT_APPLICABLE | 6 |

| E | Rows (all) | Rows (applicable only) |
|---|---:|---:|
| E0 | 1 | 1 |
| E1 | 1 | 1 |
| E2 | 26 | 20 |
| E3 | 86 | 86 |
| E4 | 24 | 24 |

| Owner decision (C) | Rows |
|---|---:|
| PENDING | 132 |
| NOT_DECISIONED | 6 |

## Family distribution

| Family | Rows | Applicable | NOT_APPLICABLE | B=PASS | Counted completion |
|---|---:|---:|---:|---:|---:|
| A11Y | 8 | 8 | 0 | 5 | 5 |
| CORE | 8 | 8 | 0 | 0 | 0 |
| DEP | 7 | 7 | 0 | 7 | 7 |
| ENG | 16 | 16 | 0 | 10 | 10 |
| G12 | 13 | 13 | 0 | 0 | 0 |
| I18N | 5 | 5 | 0 | 1 | 1 |
| ID | 12 | 12 | 0 | 12 | 12 |
| MED | 8 | 8 | 0 | 3 | 3 |
| NA | 6 | 0 | 6 | 0 | 0 |
| PIPE | 12 | 12 | 0 | 9 | 9 |
| PRIV | 7 | 7 | 0 | 7 | 7 |
| RESP | 5 | 5 | 0 | 4 | 4 |
| SCH | 10 | 10 | 0 | 4 | 4 |
| STATE | 10 | 10 | 0 | 3 | 3 |
| TEST | 11 | 11 | 0 | 11 | 11 |

## Full 138-row table

| req_id | Family | B | E | Counted | Requirement | Gap / next action |
|---|---|---|---|---|---|---|
| ID-01 | ID | PASS | E3 | YES | Tool identity mrx.tool.041-hematocrit-monitor exists and requireTool resolves it | none |
| ID-02 | ID | PASS | E3 | YES | Canonical slug tool-041-hematocrit-monitor is unique and used by the component | none |
| ID-03 | ID | PASS | E4 | YES | Canonical route /smarttools/medical-monitoring/tool-041-hematocrit-monitor resolves | none |
| ID-04 | ID | PASS | E3 | YES | Category segment medical-monitoring matches the registry category | none |
| ID-05 | ID | PASS | E3 | YES | Published catalog entry carries the tool with status implemented, accessTier free and order 570 | none |
| ID-06 | ID | PASS | E4 | YES | Tool 041 is not in R6_EXEMPT_SLUGS, so the shared R6 shell is applied | none |
| ID-07 | ID | PASS | E3 | YES | generateStaticParams includes tool 041 through the published catalog | none |
| ID-08 | ID | PASS | E3 | YES | Page metadata sets title, description, canonical and AR alternate | none |
| ID-09 | ID | PASS | E3 | YES | Page emits WebApplication and FAQ JSON-LD | none |
| ID-10 | ID | PASS | E3 | YES | Breadcrumb, R6 progress line and SafetyNotice render above the tool | none |
| ID-11 | ID | PASS | E3 | YES | Previous and next tool navigation resolves from getToolNeighbors | none |
| ID-12 | ID | PASS | E3 | YES | Tool ID and version are displayed in the footer | none |
| SCH-01 | SCH | PASS | E3 | YES | HematocritInputSchema is the single input validation boundary wrapped by createToolSchema | none |
| SCH-02 | SCH | PARTIAL | E2 | NO | Readings array is constrained to 2 through 24 entries | Add a schema test that accepts 24 readings and rejects 25 |
| SCH-03 | SCH | PASS | E4 | YES | Each HCT reading is a finite number within 20..70 percent | none |
| SCH-04 | SCH | PARTIAL | E2 | NO | Each reading date is a parseable ISO-8601 string | Add a schema test for malformed and empty dates |
| SCH-05 | SCH | PASS | E3 | YES | Sex is restricted to the enum male or female | none |
| SCH-06 | SCH | PASS | E3 | YES | on_cycle is a required boolean | none |
| SCH-07 | SCH | PARTIAL | E2 | NO | weeks_remaining is an integer within 0..52 | Add schema boundary tests for -1, 0, 52, 53 and 1.5 |
| SCH-08 | SCH | FAIL | E3 | NO | The engine result is validated against HematocritResultSchema before it enters the envelope | Smallest fix: call HematocritResultSchema.safeParse(engineResult) and return ok:false on failure; add a malformed-result test. Requires separate authorization because it edits pipeline code. |
| SCH-09 | SCH | PARTIAL | E2 | NO | HematocritOutputSchema exists for the structured envelope | Either enforce HematocritOutputSchema in the pipeline or document isToolOutput as the sole envelope guard and remove dead schema weight |
| SCH-10 | SCH | PARTIAL | E1 | NO | Schema errors are bilingual AR/EN | Add an error-map or localized message layer, and a test that an Arabic locale receives Arabic text |
| ENG-01 | ENG | PASS | E3 | YES | Engine has no React, DOM, Supabase or I/O dependency | none |
| ENG-02 | ENG | PARTIAL | E3 | NO | Engine is free of the Date constructor and of ambient time | Replace Date usage with an injected clock or pure ISO arithmetic, then re-run engine tests; requires authorization |
| ENG-03 | ENG | PASS | E3 | YES | The same inputs always produce the same outputs | none |
| ENG-04 | ENG | PARTIAL | E2 | NO | Readings are sorted by draw date regardless of input order | Add an engine test with reversed and shuffled readings asserting the same result |
| ENG-05 | ENG | PASS | E3 | YES | Baseline is the earliest reading and latest is the most recent reading | none |
| ENG-06 | ENG | PASS | E3 | YES | Slope is least squares in percentage points per 30 days | none |
| ENG-07 | ENG | PASS | E3 | YES | Male bands use upper 50 and intervention 54 | none |
| ENG-08 | ENG | PASS | E3 | YES | Female bands use upper 44.5 and intervention 48 | none |
| ENG-09 | ENG | PASS | E3 | YES | A positive trend below the intervention line projects a crossing date | none |
| ENG-10 | ENG | PARTIAL | E2 | NO | Projection is suppressed beyond the 180-day horizon | Add a shallow-slope test asserting projected_threshold_date is null beyond 180 days |
| ENG-11 | ENG | PARTIAL | E3 | NO | Projection is suppressed when the trend is flat or the latest value is already above the line | Assert null explicitly in the already-above case |
| ENG-12 | ENG | PASS | E3 | YES | Warning on_cycle_elevated_hct is emitted when on_cycle is true and the band is not normal | none |
| ENG-13 | ENG | PASS | E3 | YES | Warning above_intervention_line_seek_physician is emitted above the intervention line | none |
| ENG-14 | ENG | PARTIAL | E2 | NO | Warning rising_trend_30d is emitted when slope exceeds 1.5 | Add an engine test asserting rising_trend_30d for a steep series |
| ENG-15 | ENG | PASS | E3 | YES | donate_eligible is true exactly when latest is at least intervention minus 1 | none |
| ENG-16 | ENG | PARTIAL | E2 | NO | An empty or wholly unparseable reading set fails safely with no_valid_readings | Add a direct engine test with an empty array and with invalid dates |
| PIPE-01 | PIPE | PASS | E3 | YES | The UI calls the R6 pipeline only and never the engine or legacy adapter directly | none |
| PIPE-02 | PIPE | PASS | E3 | YES | The pipeline validates input before the engine runs | none |
| PIPE-03 | PIPE | PASS | E3 | YES | Every successful run returns a ToolOutput envelope | none |
| PIPE-04 | PIPE | PASS | E3 | YES | The envelope passes the runtime isToolOutput guard | none |
| PIPE-05 | PIPE | PASS | E3 | YES | Invalid input fails safely without throwing or returning a partial output | none |
| PIPE-06 | PIPE | PASS | E3 | YES | Provenance records source, recordedAt, timezone, unit, confidence and dataQuality | none |
| PIPE-07 | PIPE | PARTIAL | E3 | NO | Provenance referenceRange carries the clinical hematocrit reference band | Populate the sex-specific band and a citation, or label the field as display bounds; needs medical-source review and code authorization |
| PIPE-08 | PIPE | PASS | E3 | YES | keyFindings exposes result status and latest HCT | none |
| PIPE-09 | PIPE | PARTIAL | E2 | NO | seoLinks are built from the registry entry | Add an assertion on the seoLinks payload or remove it if unused |
| PIPE-10 | PIPE | PASS | E3 | YES | All timestamps and timezone values are injected by the caller | none |
| PIPE-11 | PIPE | PASS | E3 | YES | The pipeline performs no database, Supabase, network or filesystem I/O | none |
| PIPE-12 | PIPE | FAIL | E3 | NO | Engine output is parsed by HematocritResultSchema before the envelope is built | Same smallest fix as SCH-08: safeParse the result and fail closed; separate code authorization required |
| STATE-01 | STATE | FAIL | E3 | NO | EMPTY is an explicit, reachable state | Start with blank readings and no invented defaults; requires code authorization and new render tests |
| STATE-02 | STATE | PARTIAL | E3 | NO | PARTIAL is an explicit state when only some required fields are present | Make fields genuinely optional or remove the claim; add a test that partial renders |
| STATE-03 | STATE | PASS | E4 | YES | FULL renders the engine result panel from the submitted snapshot | none |
| STATE-04 | STATE | PASS | E4 | YES | INVALID rejects an out-of-range value and withdraws the result panel | none |
| STATE-05 | STATE | NOT_AVAILABLE | E3 | NO | DEGRADED is an explicit state | Add a DEGRADED branch with a defined trigger and a test, or record an owner-approved exception |
| STATE-06 | STATE | PARTIAL | E3 | NO | Missing inputs are never invented | Start blank and require explicit entry; code authorization required |
| STATE-07 | STATE | PARTIAL | E2 | NO | Validation errors are actionable and localized | Map issues to field-specific AR/EN messages and add a test |
| STATE-08 | STATE | PASS | E4 | YES | The result panel shows HCT, band, trend, donation eligibility, projection and warnings | none |
| STATE-09 | STATE | PARTIAL | E2 | NO | The result panel shows the unit, the reference range and the confidence level | Render the band range and an explicit confidence or not-assessed label |
| STATE-10 | STATE | FAIL | E2 | NO | Result and error regions are announced through aria-live | Add polite live region for results and assertive for errors, then test |
| CORE-01 | CORE | PARTIAL | E3 | NO | CORE-5 C1 Primary Result shows value, unit, range and confidence | Add range and confidence to the primary panel or to a dedicated CORE-5 box |
| CORE-02 | CORE | NOT_AVAILABLE | E3 | NO | CORE-5 C2 How Calculated shows formula, actual inputs, assumptions and uncertainty | Build a formula box fed from the engine constants and the provenance uncertainty |
| CORE-03 | CORE | PARTIAL | E3 | NO | CORE-5 C3 Safety and Warnings shows warnings, red flags, contraindications and referral | Add translated warnings, red flags and a referral sentence with a source |
| CORE-04 | CORE | NOT_AVAILABLE | E3 | NO | CORE-5 C4 Evidence and Sources lists name, publisher, date, evidence level and link | Obtain specialist-approved sources and encode them in a structured evidence list |
| CORE-05 | CORE | NOT_AVAILABLE | E3 | NO | CORE-5 C5 Next Actions gives one next step, what not to do and when to see a doctor | Add a C5 next-actions block with a medically reviewed escalation rule |
| CORE-06 | CORE | FAIL | E3 | NO | Compact mode shows exactly the closure-layer CORE-5 and full mode embeds the same CORE-5 | Replace the SPEC C1-C12 slot content with the closure CORE-5 plus seven enrichment boxes |
| CORE-07 | CORE | PARTIAL | E3 | NO | CORE-5 content is bilingual AR/EN | Translate band and warning codes through the i18n file |
| CORE-08 | CORE | PARTIAL | E3 | NO | CORE-5 is keyboard reachable and screen-reader accessible | Add live regions and landmark/heading structure, then re-run the accessibility harness |
| G12-01 | G12 | PARTIAL | E4 | NO | GENIUS-12 renders twelve boxes in the fixed closure-layer order | Decide which twelve boxes govern Tool 041 and rebuild the slot content; documentation alone cannot satisfy this |
| G12-02 | G12 | NOT_AVAILABLE | E2 | NO | GENIUS-12 box 1 KPI Strip summarises the primary result | Implement the KPI strip or record an owner-approved exception |
| G12-03 | G12 | PARTIAL | E3 | NO | GENIUS-12 box 2 Primary Result equals CORE-5 C1 | Fold the primary panel into box 2 and complete C1 content |
| G12-04 | G12 | NOT_AVAILABLE | E3 | NO | GENIUS-12 box 3 Formula / How Calculated equals CORE-5 C2 | Implement the formula box from the engine constants |
| G12-05 | G12 | PARTIAL | E3 | NO | GENIUS-12 box 4 Inputs Summary lists what the user actually entered | Add an inputs summary box and remove invented defaults |
| G12-06 | G12 | NOT_AVAILABLE | E3 | NO | GENIUS-12 box 5 What-If supports alternative scenarios | Implement scenario comparison or record a justified Not Applicable with reason |
| G12-07 | G12 | NOT_AVAILABLE | E3 | NO | GENIUS-12 box 6 Sensitivity shows which input affects the result most | Implement a sensitivity analysis or record a justified Not Applicable with reason |
| G12-08 | G12 | PARTIAL | E3 | NO | GENIUS-12 box 7 Warnings / Safety equals CORE-5 C3 | Complete C3 content and translate the codes |
| G12-09 | G12 | NOT_AVAILABLE | E3 | NO | GENIUS-12 box 8 Cross-Tool Links carry freshness | Implement the cross-tool contract or record Not Applicable with reason |
| G12-10 | G12 | NOT_AVAILABLE | E3 | NO | GENIUS-12 box 9 Evidence / Sources equals CORE-5 C4 | Add specialist-reviewed sources and render them |
| G12-11 | G12 | NOT_AVAILABLE | E3 | NO | GENIUS-12 box 10 Export produces PDF, ICS or CSV without secrets | Implement a client-side export or record Not Applicable with reason |
| G12-12 | G12 | BLOCKED | E2 | NO | GENIUS-12 box 11 History shows prior results with freshness | Owner decision on W18 and on a Tool 041 storage exception, then implement |
| G12-13 | G12 | NOT_AVAILABLE | E3 | NO | GENIUS-12 box 12 Feedback and Next Actions equals CORE-5 C5 plus a 1-5 rating | Implement feedback plus C5 next actions |
| A11Y-01 | A11Y | PASS | E4 | YES | Arabic locale renders RTL | none |
| A11Y-02 | A11Y | PASS | E3 | YES | English locale renders LTR | none |
| A11Y-03 | A11Y | PASS | E4 | YES | Keyboard focus opens the field tooltip | none |
| A11Y-04 | A11Y | PASS | E4 | YES | Escape closes the tooltip | none |
| A11Y-05 | A11Y | PASS | E4 | YES | The tooltip stays inside the viewport | none |
| A11Y-06 | A11Y | PARTIAL | E2 | NO | Touch targets are large enough at 390 px | Measure and, if needed, enlarge interactive targets to at least 44 px |
| A11Y-07 | A11Y | PARTIAL | E2 | NO | Every input has a programmatic label | Add indexed accessible names for repeated reading rows |
| A11Y-08 | A11Y | PARTIAL | E2 | NO | Focus indication is visible on all interactive elements | Add focus-visible ring classes and verify with the harness |
| I18N-01 | I18N | PASS | E3 | YES | The AR and EN dictionaries have identical key sets | none |
| I18N-02 | I18N | FAIL | E3 | NO | Band values are translated in the result panel | Add AR/EN band labels and map the value before render |
| I18N-03 | I18N | FAIL | E3 | NO | Warning codes are translated in the result panel | Add AR/EN warning messages and map codes before render |
| I18N-04 | I18N | FAIL | E2 | NO | Validation and error text is available in Arabic | Localize validation messages and add an Arabic render test |
| I18N-05 | I18N | PARTIAL | E3 | NO | No mixed-language labels appear in either locale | Route every displayed string through the dictionary |
| RESP-01 | RESP | PASS | E4 | YES | Desktop 1440 px renders the tool without horizontal overflow | none |
| RESP-02 | RESP | PASS | E4 | YES | Mobile 390 px renders without horizontal overflow | none |
| RESP-03 | RESP | PASS | E4 | YES | All twelve rendered boxes survive at 390 px | none |
| RESP-04 | RESP | PASS | E4 | YES | Arabic RTL at 1440 px renders without horizontal overflow | none |
| RESP-05 | RESP | NOT_RUN | E0 | NO | Arabic RTL at 390 px renders without horizontal overflow | Add an Arabic 390 px pass to the harness and capture a screenshot |
| PRIV-01 | PRIV | PASS | E3 | YES | The tool performs no draft save, dashboard commit or clear | none |
| PRIV-02 | PRIV | PASS | E3 | YES | The tool uses no localStorage, sessionStorage or indexedDB | none |
| PRIV-03 | PRIV | PASS | E3 | YES | The tool imports no Supabase client | none |
| PRIV-04 | PRIV | PASS | E3 | YES | The tool makes no fetch, axios or XHR call | none |
| PRIV-05 | PRIV | PASS | E4 | YES | No entered value is sent to any server | none |
| PRIV-06 | PRIV | PASS | E4 | YES | No medical value reaches the application console | none |
| PRIV-07 | PRIV | PASS | E3 | YES | No server-side persistence path exists for Tool 041 | none |
| MED-01 | MED | PASS | E3 | YES | Elevated and rising results emit safety warnings | none |
| MED-02 | MED | PARTIAL | E3 | NO | The tool provides an explicit medical escalation and referral path | Add a reviewed referral block with urgency and contact guidance |
| MED-03 | MED | PARTIAL | E3 | NO | The tool states its interpretation limits and that it is not a diagnosis | Add tool-specific interpretation limits reviewed by a specialist |
| MED-04 | MED | FAIL | E2 | NO | Every reference band and the intervention line carries a named source | Obtain specialist-approved citations for 50/54 male and 44.5/48 female; do not change thresholds without separate authorization |
| MED-05 | MED | PASS | E3 | YES | Units are percent and consistent across engine, schema, provenance and UI | none |
| MED-06 | MED | PARTIAL | E3 | NO | The displayed or exported reference range matches the clinical band | Display the sex-specific band with a source, or label it explicitly as display bounds |
| MED-07 | MED | BLOCKED | E2 | NO | donate_eligible is clinically valid and correctly labelled | Specialist medical review; do not change the rule or label without separate authorization |
| MED-08 | MED | PASS | E3 | YES | No medical threshold or claim was changed during the acceptance work | none |
| TEST-01 | TEST | PASS | E3 | YES | Engine test suite passes | none |
| TEST-02 | TEST | PASS | E3 | YES | Pipeline test suite passes | none |
| TEST-03 | TEST | PASS | E3 | YES | Component and shared-header suite passes for Tool 041 | none |
| TEST-04 | TEST | PASS | E3 | YES | Existing acceptance-evidence source-scan test passes | none |
| TEST-05 | TEST | PASS | E3 | YES | TypeScript strict check passes | none |
| TEST-06 | TEST | PASS | E3 | YES | ESLint passes with no errors | Resolve the set-state-in-effect warning and the unused import when code changes are authorized |
| TEST-07 | TEST | PASS | E4 | YES | A production Next.js build succeeds for this source | none |
| TEST-08 | TEST | PASS | E3 | YES | Local browser harness passes all checks | none |
| TEST-09 | TEST | PASS | E4 | YES | Published Preview browser harness passes all checks | none |
| TEST-10 | TEST | PASS | E3 | YES | The deployed source hashes match the local working tree | none |
| TEST-11 | TEST | PASS | E3 | YES | Test evidence is not aggregated across environments without overlap analysis | none |
| DEP-01 | DEP | PASS | E4 | YES | Exactly one Preview deployment was created for Tool 041 | none |
| DEP-02 | DEP | PASS | E4 | YES | The deployment target is preview and productionUrl is null | none |
| DEP-03 | DEP | PASS | E4 | YES | Deployment protection stayed enabled and unchanged | none |
| DEP-04 | DEP | PASS | E4 | YES | The deployment reached READY | none |
| DEP-05 | DEP | PASS | E3 | YES | The deployment was built from the uncommitted working tree, not from HEAD | none |
| DEP-06 | DEP | PASS | E4 | YES | No Production deployment or promotion occurred | none |
| DEP-07 | DEP | PASS | E3 | YES | E4 browser evidence was captured against this deployment through the authenticated proxy | none |
| NA-01 | NA | NOT_APPLICABLE | E2 | NO | Draft autosave and restore | Revisit only if the owner grants a storage exception |
| NA-02 | NA | NOT_APPLICABLE | E2 | NO | Dashboard snapshot commit | Revisit only after a W18 and dashboard-scope decision |
| NA-03 | NA | NOT_APPLICABLE | E2 | NO | Session and cloud sync | Revisit after an owner W18 decision |
| NA-04 | NA | NOT_APPLICABLE | E2 | NO | Per-user memory with consent, TTL, view and delete | Revisit at platform level after W18 |
| NA-05 | NA | NOT_APPLICABLE | E2 | NO | Row-level-security negative test for a Tool 041 write path | Track at platform level when a storage path is approved |
| NA-06 | NA | NOT_APPLICABLE | E2 | NO | Backup and disaster recovery for Tool 041 data | Revisit if persistence is approved |

## State meanings

- `APPLICABLE` - the requirement applies to Tool 041 and stays in the denominator.
- `NOT_APPLICABLE` - excluded from the denominator only because the row states a specific reason and carries its own proof.
- `PASS` - the only completion state, and only when `E>=E3`.
- `PARTIAL`, `FAIL`, `BLOCKED`, `NOT_RUN` - never completion.
- `NOT_AVAILABLE` - the requirement applies but the function or evidence is unavailable; it stays in the denominator and is not PASS.
- `E0`-`E4` - evidence strength, not acceptance. `E4` is published/runtime evidence and still does not equal acceptance.
- `C=PENDING` on every applicable row and `C=NOT_DECISIONED` on every excluded row. The calculator never fills the owner decision.

