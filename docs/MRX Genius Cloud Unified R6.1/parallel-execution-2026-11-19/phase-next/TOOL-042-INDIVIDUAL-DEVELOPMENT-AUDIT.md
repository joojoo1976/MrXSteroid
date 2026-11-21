# TOOL 042 — INDIVIDUAL DEVELOPMENT AUDIT (R6.1, phase-next)

| Field | Value |
|---|---|
| Tool ID | `042` · `mrx.tool.042-estrogen-management` |
| Canonical name / slug | `Estrogen Management Pro` / `tool-042-estrogen-management` |
| Category | hormonal-health |
| Canonical route | `/smarttools/hormonal-health/tool-042-estrogen-management` |
| Batch | Batch 1 |
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` (branch `feat/r6.1-tools-041-042`, 384 dirty worktree entries observed and preserved) |
| Audit date | 2026-11-19 |
| Audit mode | READ-ONLY forensic documentation. No code, contract, schema, ledger, git, build, test, server or browser write/execution. **Audit only — no restart, activation change, or development task that implies restart.** |
| Primary source ledger | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/tool-042-atomic-ledger-2026-11-18.csv` — observed SHA-256 `E0347AC3F33B5B9B7D248BC8DB959F63FE2E6164E1E82F45F7B4B4744E4DFC0B` (53 atomic rows, all APPLICABLE) |
| Secondary ledgers | `tool-042-atomic-ledger-2026-11-18.md` `D77FE9479F80D89587B5EE33BF11DC01FF6B3E7FC50973F47D9F6249F8A65B27`; closure ledger MD `27C0D7C17283759525B7A2579BB636FF56EBC730E56F3A2756C9DEF8251FE737`; closure CSV `4BB85E58760CF16FC2A84B32DE9FD1020071E5A9E9B8FAD6C7A76AAC41E1FE73`; `tool-042-i18n-check.mjs` `9873A5317B244D43E66B2077D504B2A71501B06D2A14E4BFD0FD3129F881738B`; `TOOL-042-DEVELOPMENT-PROPOSALS.md` `DA1DF8B7BEA8261195F5469EEC230F4A44860D7D32DF782216FBAC31F79B9986` |
| Reference sources | standard `697D6D9435A53CD75A85004B55D52DBFDD709B8E7CD658F93EF7E208013077F9`; W2 inventory `3276ACD111A66506568975ADA721F51FC520F7B28AF6C7CB9AB09916CAC96A6A`; W4b impact map `157FB3DD879BAE4AF66E4B3AA1404788A3AC469FF8AF1B7ED60C6E3D1282C263`; preserved B3 review `CF3CBE8677F2C5513CE7A3ACEE7E9B5A315A97E6A5CB255FC6DD430CB98E62DF`; Tool 039 profile `16DEE852001F2A5E8F0F71A50A98CE4C118C8BCEB86E15B9867CA54B99E4F7FA`; readiness note `F-BROWSER-SOURCE-CLINICAL-READINESS.md` `25F8D43D17DAFD2D0F7EC9A99367447E21671323F15D15C77731F13E9AEDE6B1` |
| Tool decision | **BLOCKED** — status preserved: **`STOPPED — ORDER 580`**; recorded 44/53 (83.02%); no activation advance; no owner acceptance implied |

## A. Tool Identity and Historical Lineage

- **Identity (static):** `mrx.tool.042-estrogen-management`, slug `tool-042-estrogen-management`, `order: 580`, `accessTier: free`, `stackStatus: layered` in `lib/tools/registry.ts`; category `homal-health` in code is `hormonal-health` on the route and in the closure ledger; route confirmed by `app/smarttools/[category]/[tool]/page.tsx`.
- **Implementation paths:** engine `lib/tools/engines/tool-042-estrogen-management.ts`; schema `lib/tools/schemas/tool-042-estrogen-management.ts`; pipeline `lib/tools/r6/tool-042-estrogen-management-pipeline.ts`; contract `lib/tools/r6/tool-042-estrogen-management-contract.ts`; adapters `lib/tools/adapters/tool-042-estrogen-management.ts`; component/genius/test `components/tools/tool-042-estrogen-management*.tsx`; i18n `i18n/tool-042-estrogen-management.json`; proposal + i18n check under `docs/MRX Genius Cloud Unified R6.1/`.
- **Ownership:** 042 is in `R6_EXEMPT_SLUGS` (`manifest.ts` line 50); W4b classifies it as tool-owned-boxes. No shared `R6ToolShell` box layer; no shared edit authorized.
- **Historical start / engine intent:** `manageEstrogen` bands sensitive-assay E2 (adult male optimal 10–40 pg/mL), suggests a direction/size delta only for an **existing** AI (never starts one), never prescribes, and flags the prescriber boundary; deterministic, documented, pure. Band edges, escalation rules and guarded AI deltas are covered by the atomic ledger's 10 `ENG-*` rows.
- **Relevant SHAs / posture sources:** closure snapshot `8d7e406c`; historic deployment `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL` (2026-11-17, SSO-protected) is historic, not a current E4 artifact. `F-BROWSER-SOURCE-CLINICAL-READINESS.md` line 78/143/187/211 records **"Tool 042: STOPPED — do not advance activation (R6.1-SOURCE §3)"**; B3 preserves **`STOPPED — ORDER 580`**. The handover reconciliation flags a `STOPPED/Order 580/registry state conflict` requiring owner reconciliation before any activation-status change.
- **Owner decision:** no owner acceptance recorded; tool is engineering `IN PROGRESS` / formal `NOT CLOSED` in the closure ledger, with the stronger STOPPED posture governing. **Do not advance activation.**
- **Current owner:** R6.1 programme owner for STOPPED/activation reconciliation; qualified specialist for source/referral/clinical review.

## B. Original and R6.1 Requirements

**Canonical denominator finding (explicit):** the canonical denominator for Tool 042 is **fully recoverable and is not the 18-row closure grid**. W2 identifies the **53-row atomic ledger** as authoritative (all 53 rows APPLICABLE), supplemented by the closure ledger MD/CSV and `tool-042-i18n-check.mjs`. No tool-specific `tool-042-requirements.csv` exists; the 18-row `tool-042-closure-ledger.md/.csv` is an **operational review grid at `8d7e406c`** and is reconciled below, never substituted. No denominator is invented.

| Original requirement ID | Audit matrix ID | Canonical requirement | Applicability | Evidence | Difference/missing mapping |
|---|---|---|---|---|---|
| PIPE-01 | PIPE-01 | The tool computes through the R6 pipeline path, never through UI-side engine logic | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts › 'valid input produces a contract-valid ToolOutput from the V6 engine'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| PIPE-02 | PIPE-02 | The V6 engine owns the truth: the pipeline result equals the standalone engine output exactly | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts › 'matches the standalone V6 engine output exactly (engine is authoritative)'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| PIPE-03 | PIPE-03 | Invalid input fails safely: { ok:false, error }, no throw, no partial output | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts › 'invalid input fails safely with a structured error (no throw, no partial output)'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| PIPE-04 | PIPE-04 | Input is rejected at the schema boundary before the engine runs | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts › 'rejects invalid input at the schema boundary before the engine runs'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| PIPE-05 | PIPE-05 | The output envelope itself is runtime-validated (a malformed envelope is refused) | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts › 'createToolOutput rejects a malformed envelope (runtime validation guard)'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| PIPE-06 | PIPE-06 | P03-RESULT-SCHEMA-GATE: the engine result passes EstrogenResultSchema.safeParse before the envelope; failure returns { ok:false } with no envelope | APPLICABLE | status=PASS; E=E3; evidence: p03-gate-structural.test.ts (30/30 pipelines) + p03-result-schema-validation.test.ts (5/5); reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| ENG-01 | ENG-01 | E2 band edges are reproduced exactly by the tool contract (low / optimal / elevated / high) | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'reproduces every band edge exactly'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| ENG-02 | ENG-02 | High E2 on an existing AI suggests +0.5 mg/wk with a prescriber guard | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/engines/tool-042-estrogen-management.test.ts › 'high E2 on existing AI suggests +0.5 mg/wk with prescriber guard'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| ENG-03 | ENG-03 | High E2 without an AI never starts one — the prescriber boundary is flagged | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/engines/tool-042-estrogen-management.test.ts › 'high E2 WITHOUT an AI never starts one - flags the prescriber boundary'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| ENG-04 | ENG-04 | Low E2 on an AI suggests tapering by one step | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/engines/tool-042-estrogen-management.test.ts › 'low E2 on an AI suggests tapering the dose by one step'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| ENG-05 | ENG-05 | Symptom load escalates an in-range lab only when two symptoms are reported | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/engines/tool-042-estrogen-management.test.ts › 'symptom load escalates an in-range lab' + lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'reproduces the two-symptom escalatio... | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| ENG-06 | ENG-06 | An already out-of-range reading is never escalated | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'never escalates a reading that is already out of range'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| ENG-07 | ENG-07 | A zero-dose AI is not adjusted | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'does not adjust a zero-dose AI'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| ENG-08 | ENG-08 | The AI delta is bounded to the engine steps and never suggests an AI that is not taken | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'reproduces the AI-delta steps and never suggests an AI that is not taken'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| ENG-09 | ENG-09 | The extreme-E2 flag fires exactly at the engine boundary (>100 pg/mL), not one unit either side | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'keeps the extreme-E2 flag at the engine boundary, not one unit either side'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| ENG-10 | ENG-10 | Input bounds mirror the canonical Zod schema | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'mirrors the input bounds of the canonical schema'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| STATE-01 | STATE-01 | EMPTY: nothing pre-filled, nothing invented | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'starts EMPTY and invents nothing'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| STATE-02 | STATE-02 | PARTIAL: an incomplete panel is never calculated | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'stays PARTIAL until every required field is answered' + 'stays PARTIAL when an AI is taken but its dose is missing'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| STATE-03 | STATE-03 | INVALID: out-of-range, typed zero and non-numeric input are rejected and nothing is calculated | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'reports INVALID for a typed zero and calculates nothing' + 'cannot hold non-numeric text...' + lib/tools/r6/tool-042-estrogen-management-con... | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| STATE-04 | STATE-04 | FULL: a complete panel calculates through the pipeline | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'calculates through the R6 pipeline once the input is complete'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| STATE-05 | STATE-05 | DEGRADED: a pipeline contract failure is surfaced as DEGRADED, not as a result | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'reports DEGRADED when the pipeline fails its contract guard'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| STATE-06 | STATE-06 | State precedence EMPTY → INVALID → PARTIAL → READY is deterministic | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'keeps the order EMPTY INVALID PARTIAL READY'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| STATE-07 | STATE-07 | A stale result is never shown as the current one | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'shows the newest value immediately and never a stale result'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| G12-01 | G12-01 | GENIUS-12: all twelve boxes render once, in their fixed order | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'renders all twelve boxes in their fixed order'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| G12-02 | G12-02 | The history box stays visible with the real W18 reason instead of being hidden | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'keeps the history box visible with the real W18 reason'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| G12-03 | G12-03 | CORE-5 is present and C1 is identical between compact mode and the full page | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'keeps C1 identical in compact mode and shows the five CORE boxes'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| C1 | C1 | C1 carries the result, the optimal band and an honest confidence statement | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'C1 carries the result, the optimal band and an honest confidence'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| C2 | C2 | C2 states the formula with engine limits, assumptions and uncertainty | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'C2 states the formula with the engine limits, the assumptions and the uncertainty'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| C3 | C3 | C3 raises red flags: high E2 without an AI (pending referral), AI overshoot, extreme E2 | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'C3 raises the engine warning, a red flag and the pending referral...' + 'C3 raises the AI-overshoot red flag...' + 'C3 raises the extreme-E2... | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| C4 | C4 | C4 never invents a source (declares NOT_AVAILABLE with the pending review) | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'C4 does not invent a source: it says NOT_AVAILABLE with the pending review' + lib/tools/r6/tool-042-estrogen-management-contract.test.ts › '... | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| C5 | C5 | C5 gives the next step, what not to do and when to seek care; the rating is labelled session-only | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'C5 gives the next step, what not to do and when to seek care...'; reason: Copy requires specialist approval (D-C5/D-CLIN).; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| HON-01 | HON-01 | No raw engine warning or action code is ever printed to the user | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'never prints a raw engine warning code or a raw action code' + lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'maps every warn... | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| HON-02 | HON-02 | Every band, action and symptom maps to a localisation key with a safe fallback | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'maps every band and action, and falls back for an unknown code' + 'maps every symptom to a distinct localisation key'; reason: ; action:... | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| HON-03 | HON-03 | An AI dose the user says is taken is never silently invented | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'never silently invents an AI dose when the user says an AI is taken'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| HON-04 | HON-04 | E2 and the signed AI delta are formatted without invented precision | APPLICABLE | status=PASS; E=E3; evidence: lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'formats E2 and the signed AI delta without inventing precision'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| W18-01 | W18-01 | No persistence of any kind and no network/engine/adapter call from the component | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'has NO persistence and never calls the network, the engine or the adapter'; reason: D-W18 respected: no storage added.; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| W18-02 | W18-02 | The history box is NOT_AVAILABLE rather than simulated | APPLICABLE | status=NOT_AVAILABLE; E=E2; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'keeps the history box visible with the real W18 reason'; reason: Honest state, but the capability itself does not exist (owner deci... | NOT_AVAILABLE is not NOT_APPLICABLE; row remains in the 53-row denominator and cannot count as completion; owner/specialist gate open. |
| EXP-01 | EXP-01 | Client-side CSV export exists and carries no session identifier | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'exports a client-side CSV and never adds a session identifier' + lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'builds a CSV ... | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| EXP-02 | EXP-02 | Export is disabled until a valid result exists | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'disables the export until a valid result exists'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| LINK-01 | LINK-01 | Cross-tool links point only at registered tools and transfer nothing automatically | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'shows the related tools with a hand-entry rule and no automatic transfer' + lib/tools/r6/tool-042-estrogen-management-contract.test.ts › 'li... | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| I18N-01 | I18N-01 | AR/EN parity: 178 keys per locale, no missing/extra/empty key, no CJK/Hangul contamination | APPLICABLE | status=PASS; E=E3; evidence: tool-042-i18n-check.mjs → I18N_PARITY: OK (en 178 / ar 178), exit 0, re-run 2026-11-18; tests/unit/tool-042-i18n-evidence.test.ts; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| I18N-02 | I18N-02 | Arabic RTL flips direction and localises the interface | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'flips to RTL and localizes the interface in Arabic'; reason: Rendered RTL is additionally a browser item (see BROWSER rows).; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| A11Y-01 | A11Y-01 | Every control is labelled, the state is announced and an invalid input is marked on the offending field only | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'labels every control, announces the state and marks an invalid input' + 'marks an out-of-range field only, not every field'; reason: ; actio... | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| A11Y-02 | A11Y-02 | No fixed width breaks a 390 px viewport | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'uses no fixed width that would break a 390 px viewport'; reason: Static/DOM check only; the measured 390 px layout is a browser item.; actio... | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| DYN-01 | DYN-01 | What-if and sensitivity probes run through the same pipeline | APPLICABLE | status=PASS; E=E3; evidence: components/tools/tool-042-estrogen-management.test.tsx › 'runs the what-if and sensitivity probes through the same pipeline'; reason: ; action: none | Atomic PASS/E3 reused from ledger; grid is operational only; no current E4, restart, activation change or owner acceptance implied. |
| BROWSER-01 | BROWSER-01 | The tool page loads on an authorized deployment and returns its markup | APPLICABLE | status=NOT_RUN; E=E0; evidence: canonical E1 route check (HTTP/SSR) exists for the 29 routes but the interactive deployment is SSO-protected; not re-run for 042 in this pass; reason: Needs an authorized browser session.; action... | NOT_RUN/E0; current E4 prerequisite absent and STOPPED / ORDER 580 posture governs; no activation advance. |
| BROWSER-02 | BROWSER-02 | EN and AR render correctly in a real browser | APPLICABLE | status=NOT_RUN; E=E0; evidence: not executed (SSO); reason: Needs an authorized browser session.; action: Execute the browser checklist on an authorized deployment and attach JSON + screenshots. | NOT_RUN/E0; current E4 prerequisite absent and STOPPED / ORDER 580 posture governs; no activation advance. |
| BROWSER-03 | BROWSER-03 | The five states behave correctly in a real browser | APPLICABLE | status=NOT_RUN; E=E0; evidence: not executed (SSO); component tests cover the state machine only; reason: Needs an authorized browser session.; action: Execute the browser checklist on an authorized deployment and attach JSON +... | NOT_RUN/E0; current E4 prerequisite absent and STOPPED / ORDER 580 posture governs; no activation advance. |
| BROWSER-04 | BROWSER-04 | RTL layout at 390 px has no horizontal overflow | APPLICABLE | status=NOT_RUN; E=E0; evidence: not executed (SSO); reason: Needs an authorized browser session.; action: Execute the browser checklist on an authorized deployment and attach JSON + screenshots. | NOT_RUN/E0; current E4 prerequisite absent and STOPPED / ORDER 580 posture governs; no activation advance. |
| BROWSER-05 | BROWSER-05 | GENIUS-12 DOM contains no duplicate/hidden shell boxes in the real page | APPLICABLE | status=NOT_RUN; E=E0; evidence: not executed (SSO); reason: Needs an authorized browser session.; action: Execute the browser checklist on an authorized deployment and attach JSON + screenshots. | NOT_RUN/E0; current E4 prerequisite absent and STOPPED / ORDER 580 posture governs; no activation advance. |
| BROWSER-06 | BROWSER-06 | No console errors and no hydration warnings on the real page | APPLICABLE | status=NOT_RUN; E=E0; evidence: not executed (SSO); reason: Needs an authorized browser session.; action: Execute the browser checklist on an authorized deployment and attach JSON + screenshots. | NOT_RUN/E0; current E4 prerequisite absent and STOPPED / ORDER 580 posture governs; no activation advance. |
| D-C4 | D-C4 | An approved source pack exists for the tool's clinical claims | APPLICABLE | status=NOT_AVAILABLE; E=E0; evidence: no approved source pack; the tool correctly renders NOT_AVAILABLE; reason: Blocked on specialist/owner approval.; action: Obtain the owner/specialist decision. | NOT_AVAILABLE is not NOT_APPLICABLE; row remains in the 53-row denominator and cannot count as completion; owner/specialist gate open. |
| D-C5 | D-C5 | Referral and red-flag wording is approved by a qualified specialist (AR + EN) | APPLICABLE | status=NOT_AVAILABLE; E=E0; evidence: wording is present and labelled pending review; reason: Blocked on specialist review (no self-approval).; action: Obtain the owner/specialist decision. | NOT_AVAILABLE is not NOT_APPLICABLE; row remains in the 53-row denominator and cannot count as completion; owner/specialist gate open. |

**Counts (authoritative 53-row atomic ledger, read-only parse):** total 53; APPLICABLE 53; justified NOT_APPLICABLE 0; unmapped original ID 0. Status: PASS 44, NOT_RUN 6, NOT_AVAILABLE 3. Evidence level: E3 44, E2 1 (`W18-02`), E0 8 (6 browser NOT_RUN + `D-C4` + `D-C5`). B3-preserved completion: **44/53 = 83.02%**. Recorded assertions (not re-run here): re-verification at `37f047a4` covered 5 files / 62 tests PASS (exit 0); cited files are tracked, so the E3 claim survives a clean clone per the ledger note. No figure was recalculated.

**Reconciliation to the 18-row operational grid:** grid buckets `ENG-PIPELINE`, `STATE-5`, `UI-GENIUS12`, `I18N-PARITY`, `EXPORT-CSV`, `TEST-FOCUSED`, `BUILD-TSC`, `PREVIEW-ROUTE`, `BROWSER-EN-AR`, `BROWSER-5-STATES`, `RTL-390`, `CONSOLE-HYDRATION`, `NO-DUP-GENIUS`, `C4-SOURCES`, `C5-REFERRAL`, `CLINICAL-REVIEW`, `W18-HISTORY`, `P03-PIPELINE` map to atomic families `PIPE/ENG/STATE/G12/C1–C5/HON/W18/EXP/LINK/I18N/A11Y/DYN/BROWSER/D-*`. The grid's `1/18 = 5.56%` and its E2 PASS rows are historic operational values at `8d7e406c`; E2 remains E2 and contributes no completion. The atomic ledger is strictly richer and governs.

**Source authority conflict log:**

| Source | Location | Impact | Resolution required |
|---|---|---|---|
| `STOPPED — ORDER 580` vs registry `order: 580` / `stackStatus: layered` | B3 + readiness note vs `registry.ts` | Activation-state conflict | Owner reconciliation before any activation change; no edit here |
| 53-row atomic ledger vs 18-row grid | `closure-sprint...` | Different denominators | Atomic ledger governs; grid operational only |
| Atomic ledger untracked (`??`) | docs | Clean-clone availability of the denominator | Preserve; owner-scoped commit only |
| `D-C4`/`D-C5` at E0 `NOT_AVAILABLE` | atomic ledger rows 52–53 | Clinical/source gates open | Approved pack + specialist wording; **NOT_AVAILABLE ≠ NOT_APPLICABLE**, stays in denominator |
| Historic deployment `8d7e406c` | closure ledger | Could be mistaken for current E4 | Historic only; no E4 transfer |
| Schema file ` M` in WT | `lib/tools/schemas/tool-042-estrogen-management.ts` | Recorded evidence may not match current bytes | Preserve; re-validate only under authorization |

## C. Existing Architecture and Implementation

| Exact path | Git status (observed) | Role | Test file | Actual status |
|---|---|---|---|---|
| `lib/tools/engines/tool-042-estrogen-management.ts` + `.test.ts` | tracked, clean (`291B86B0D385`, `4A2D2D29A1D5`) | pure engine + suite | same file | static present |
| `lib/tools/schemas/tool-042-estrogen-management.ts` | **modified** (` M`, `90287A749F38`) | Zod guards | no dedicated schema test | WT-only change preserved |
| `lib/tools/r6/tool-042-estrogen-management-pipeline.ts` + `-contract.ts` | tracked, clean (`7700D965FCE0`, `B1C4049F44FF`) | validate→engine→result schema→envelope | both `.test.ts` tracked clean | static present |
| `lib/tools/adapters/tool-042-estrogen-management.ts` | tracked, clean (`63FA91B2C40A`) | legacy adapter | — | static present |
| `components/tools/tool-042-estrogen-management.tsx`, `.genius.tsx`, `.test.tsx` | tracked, clean (`0777F44D0A03`, `B7704A4EE4BA`, `EB4CFE94843E`) | 5-state UI, tool-owned boxes, suite | tracked | static present |
| `i18n/tool-042-estrogen-management.json` | tracked, clean (`222D85640F2E`) | 178 keys/locale (historic) | `tests/unit/tool-042-i18n-evidence.test.ts` tracked clean | static present |
| atomic ledger CSV + MD | **untracked (`??`)** | canonical denominator | — | read-only parsed |
| closure ledger MD/CSV, proposals, i18n check | tracked, clean | operational grid / check | — | NOT_RUN |

**Dependencies:** React client, `useToolDisplayPreferences`, `createToolSchema`/`createToolOutput`/`isToolOutput`, `requireTool`/`buildSeoLinks`, Zod, tool-owned genius component. No Supabase/network/storage observed. Per W4b 042 is **exempt**; no shared-component edit. Nothing built or executed.

## D. Math Engine and Equation Audit

- Inputs: `e2_pg_ml 5..500`, `weekly_testosterone_mg 0..1000`, `taking_ai`, `weekly_ai_dose_mg 0..7` (anastrozole-equivalent), symptoms (≤10), `body_fat_pct 5..60`. Bands `low/optimal/elevated/high`; adult male optimal `10–40 pg/mL` (sensitive assay).
- Deterministic rules evidenced at E3 in the ledger: exact band edges (`ENG-01`); high E2 + existing AI → `+0.5 mg/wk` with prescriber guard (`ENG-02`); high E2 without AI never starts one (`ENG-03`); low E2 on AI → one-step taper (`ENG-04`); symptom escalation only when two symptoms reported (`ENG-05`); out-of-range never escalated (`ENG-06`); zero-dose AI never adjusted (`ENG-07`); delta bounded to engine steps (`ENG-08`); extreme-E2 flag exactly at `>100 pg/mL` (`ENG-09`); input bounds mirror canonical Zod schema (`ENG-10`).
- Validation: Zod schema (WT-modified) + contract guards; no NaN/Infinity path from validated input; no `Date` in engine; caller injects timestamps; unit `pg/mL` consistent. Purity holds structurally.
- Source traceability: `D-C4` approved source pack is `NOT_AVAILABLE` (E0); ledger row `C4` records that no source is invented and declares `NOT_AVAILABLE` with pending review. D-C5/D-CLIN wording/sign-off open.
- **Tests run vs NOT_RUN:** the 44 PASS rows are recorded E3 (ledger note: 5 files / 62 tests PASS at `37f047a4`, cited files tracked). This audit executed nothing. Exact isolated command for a later authorized verification: `npx vitest run --config vitest.config.ts lib/tools/engines/tool-042-estrogen-management.test.ts lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts lib/tools/r6/tool-042-estrogen-management-contract.test.ts components/tools/tool-042-estrogen-management.test.tsx tests/unit/tool-042-i18n-evidence.test.ts` — **NOT_RUN**.

## E. Pipeline and Schema Audit

Chain (static): input schema → `createToolSchema` → pipeline → authoritative `manageEstrogen` → `EstrogenResultSchema.safeParse` (ledger `PIPE-06`, P03-RESULT-SCHEMA-GATE, PASS/E3) → `createToolOutput` → runtime envelope guard (`PIPE-05`, PASS/E3). Invalid input fails safely with `{ ok:false, error }` (`PIPE-03/04`). No throw/partial output. **P-03:** per-tool result-schema gate is evidenced PASS for 042; the frozen shared gate remains a shared, approval-gated concern and is not re-awarded. No runtime execution here.

## F. AI and Intelligence Capabilities

No model, prompt, provider, RAG or prediction: **NotApplicable**. The AI here is *aromatase-inhibitor dose guidance*, a deterministic clinical heuristic, not machine intelligence. `HON-01..04` (no raw warning codes, localized mapping, no invented AI dose, no invented precision) are PASS/E3. **RuntimeVerified: No** in this audit.

## G. CORE-5 and GENIUS-12

| Element | Applicable | Designed | Implemented | Tested | Runtime-verified | Evidence | Gap | Next action |
|---|---|---|---|---|---|---|---|---|
| C1 primary result + band | YES | YES | static | recorded E3 | NO | ledger `C1` | current E4 absent | authorized re-run |
| C2 formula/limits/assumptions | YES | YES | static | recorded E3 | NO | ledger `C2` | — | preserve |
| C3 red flags | YES | YES | static | recorded E3 | NO | ledger `C3` | D-CLIN open | specialist review |
| C4 sources | YES | YES | explicit `NOT_AVAILABLE` | recorded E3 | NO | ledger `C4` | D-C4 open | approved pack |
| C5 next actions | YES | YES | static, session-only rating | recorded E3 | NO | ledger `C5` | D-C5 open | approved wording |
| Boxes 1–12 fixed order | YES | YES | static | recorded E3 | NO | `G12-01` | DOM E4 absent | authorized DOM check |
| Box 11 history | YES | YES | visible with W18 reason | recorded E3 | NO | `G12-02`, `W18-02` | W18 open | owner decision |
| Compact CORE-5 parity | YES | YES | static | recorded E3 | NO | `G12-03` | — | preserve |

042 is exempt (tool-owned boxes); no shared-shell duplicate risk. `BROWSER-05` DOM check remains NOT_RUN.

## H. Dynamic Results and UI Maturity

- **Static inspection:** `EMPTY / PARTIAL / INVALID / FULL / DEGRADED` with deterministic precedence (`STATE-01..06` PASS/E3), no prefill/invention, stale result never presented as current (`STATE-07`).
- **Recorded evidence:** 44 atomic PASS rows at E3; i18n 178/178 historically. **Component test:** tracked suite exists, ledger cites it; **NOT_RUN here**. **True-clean:** ledger asserts tracked-file re-verification at `37f047a4`; this audit did not reproduce it. **Browser E4:** 6 `BROWSER-*` rows are NOT_RUN/E0 (SSO-protected preview); no current E4 claim.

## I. Cross-Tool and Data Integration

`LINK-01` PASS/E3: cross-tool links target registered tools only and transfer nothing automatically. `EXP-01/02`: client CSV export without session identifier, disabled until a valid result. No payload handoff, persistence or cloud sync. W18 boundary: no storage; history box `NOT_AVAILABLE` with a real reason; `W18-02` is E2 and stays out of the completion numerator. Fail-closed envelope propagation evidenced at E3 in the ledger.

## J. Safety, Sources and Privacy

- Engine never prescribes: AI delta is for an existing AI only, prescriber boundary explicit; `C3` red flags (high E2 without AI, AI overshoot, extreme E2) recorded PASS; `HON-01` forbids raw code exposure.
- No network/storage/session persistence (`W18-01` PASS); no value logging observed; console/hydration check `BROWSER-06` NOT_RUN. `D-C4` source pack, `D-C5` specialist AR/EN wording and `D-CLIN` review are open — no self-approval. Referral wording must not be invented.

## K. Localization and Browser Maturity

- i18n JSON tracked clean; `I18N-01` (178 keys/locale, no missing/extra/empty key, no CJK/Hangul) and `I18N-02` (AR RTL) PASS/E3 in the ledger; `node "docs/MRX Genius Cloud Unified R6.1/tool-042-i18n-check.mjs"` — **NOT_RUN** in this audit.
- `BROWSER-01..06` (page load, EN/AR, five states, RTL 390 px, GENIUS-12 DOM, console/hydration) are **NOT_RUN/E0**. Current E4 prerequisites (authorized non-SSO preview pinned to `37f047a4` + Deployment ID) absent. Historic SSO deployment is not transferable.

## L. Tests and Evidence

| ID | Requirement | Source file | Test command | Environment | Source SHA (first 16) | Date | Actual result | Level | Reproducibility / validity | HEAD compat. |
|---|---|---|---|---|---|---|---|---|---|---|
| E-042-01 | 53 atomic rows | `tool-042-atomic-ledger-2026-11-18.csv` | read-only CSV parse | this audit | `E0347AC3F33B5B9` | 2026-11-19 | 53 applicable; 44 PASS / 6 NOT_RUN / 3 N-A | E2 static + E5 reuse | SHA verified | untracked artifact |
| E-042-02 | 44/53 recorded | B3 §042 | reuse preserved evidence | B3 2026-11-19 | `CF3CBE8677F2C55` | 2026-11-19 | 83.02%; tracked-file E3 claim | E5 | SHA verified | fixed baseline lens |
| E-042-03 | focused battery | engine/pipeline/contract/component/i18n tests | isolated `npx vitest run …` (command in D) | isolated clean env | `291B86B0D385…` | 2026-11-19 | **NOT_RUN** | E2 | ledger asserts 5 files/62 tests PASS; not reproduced | tracked files |
| E-042-04 | i18n parity | `tool-042-i18n-check.mjs` | `node "docs/MRX Genius Cloud Unified R6.1/tool-042-i18n-check.mjs"` | local | `9873A5317B24…` | 2026-11-19 | **NOT_RUN** | E2 | historic 178/178 only | tracked @ HEAD |
| E-042-05 | browser rows 6 | authorized preview | browser re-run pinned to `37f047a4` | authorized env | — | 2026-11-19 | **NOT_RUN** | E0 | no artifact | SSO blocked |
| E-042-06 | build/typecheck | build config | `npx tsc --noEmit`, `npm run build` | clean env | — | 2026-11-19 | **NOT_RUN** | E2 | no HEAD artifact | no artifact |

No test/build/browser action executed. No activation or restart action taken.

## M. Defect and Gap Register

**Implementation gaps**

| ID | Severity | Requirement | Exact file | Actual vs expected | Impact | Root cause | Recommended fix | Regression risk |
|---|---|---|---|---|---|---|---|---|
| I-042-1 | HIGH | `D-C4`, `C4` | `lib/tools/r6/tool-042-estrogen-management-contract.ts` + source pack | No approved source pack | Clinical claims ungated | No owner-approved pack | Supply pack (owner/specialist); no invented source | medium |
| I-042-2 | HIGH | `D-C5`, `D-CLIN`, `C3` | component/genius + wording | Referral/red-flag wording not approved | Clinical review open | No specialist sign-off | Approved AR/EN wording + sign-off | medium |
| I-042-3 | MEDIUM | activation state | `lib/tools/registry.ts` (order 580) vs STOPPED posture | STOPPED/registry conflict | Ambiguous operational state | Unreconciled owner decision | Owner reconciliation only; **no activation change in this phase** | high if changed unilaterally |

**Evidence gaps**

| ID | Severity | Requirement | Exact file | Gap | Impact | Next action |
|---|---|---|---|---|---|---|
| V-042-1 | HIGH | `BROWSER-01..06` | authorized preview | 6 rows NOT_RUN/E0 | 6 unresolved rows | Authorized browser run pinned to `37f047a4` |
| V-042-2 | MEDIUM | 44 PASS rows | atomic ledger (untracked) + tests | Current-HEAD run not reproduced here | E3 claim not independently re-awarded | Isolated re-run with archived log (no restart implication) |
| V-042-3 | MEDIUM | `W18-02`, `D-C4`, `D-C5` | atomic ledger | `NOT_AVAILABLE` kept in denominator | 3 rows cannot be completion | Owner packs/decisions; never relabel as N-A |
| V-042-4 | LOW | closure grid | closure ledger | 1/18 + E2 rows | Misleading if used alone | Keep reconciled to 53-row ledger |

## N. Development Maturity Matrix (S0–S11)

| Stage | Component | Highest verified stage | Next missing stage | Bottleneck |
|---|---|---|---|---|
| S0 | Identity / registry | S0 verified; STOPPED/order-580 conflict logged | S1 | owner reconciliation |
| S1 | Requirements | S1 verified (53-row atomic ledger) | S2 | ledger untracked |
| S2 | Architecture | S2 verified (inventory + git) | S3 | schema WT-modified |
| S3 | Engine | S3 static + recorded E3 rules | S4 | D-C4 provenance open |
| S4 | Pipeline | S4 static + recorded E3 (`PIPE-06`) | S5 | no current-HEAD re-run |
| S5 | UI | S5 static + recorded E3 states | S6 | browser DOM proof |
| S6 | AI / CORE-5 / GENIUS-12 | S6 static + recorded E3 | S7 | D-C5/D-CLIN; `BROWSER-05` |
| S7 | Cross-tool / safety | S7 static + recorded E3 | S8 | clinical gates; STOPPED posture |
| S8 | Testing | S8 recorded E3 (5 files/62 tests); NOT_RUN here | S9 | independent log |
| S9 | True-clean | S9 asserted by ledger (tracked files) | S10 | no isolated artifact from this audit |
| S10 | Browser | S0 only — 6 rows NOT_RUN | S1 browser | SSO + pinned preview |
| S11 | External / owner | S0 only — STOPPED, no acceptance | S1 | owner; never from plan |

## O. Comparison with Tool 039 (applicable engineering criteria only)

039 is reference only; no similarity score; no acceptance transfer.

| Dimension | Status | Engineering reason | Action |
|---|---|---|---|
| Architecture | APPLICABLE | Same layer chain and tool-owned boxes | Preserve |
| Engine | PARTIALLY_APPLICABLE | Deterministic bounded AI-delta heuristic; source pack missing | Preserve math; Fix provenance |
| Validation | PARTIALLY_APPLICABLE | Result-schema + envelope guards evidenced E3 in ledger | Preserve; Extend with current re-run |
| AI | NOT_APPLICABLE | No model in either (clinical heuristic ≠ AI) | Preserve |
| Dynamic Results | PARTIALLY_APPLICABLE | Five states recorded E3; browser unproven | Preserve; Extend E4 |
| CORE-5 | PARTIALLY_APPLICABLE | C1–C5 recorded; C4 `NOT_AVAILABLE` by decision | Preserve reason; Fix gates |
| GENIUS-12 | PARTIALLY_APPLICABLE | 12 boxes recorded; DOM E4 absent | Preserve; Extend proof |
| Cross-Tool | PARTIALLY_APPLICABLE | Links transfer nothing; W18 boundary | Preserve boundary |
| Safety | PARTIALLY_APPLICABLE | Prescriber boundary present; D-C4/C5/CLIN open | Preserve; Fix gates |
| Testing | NOT_VERIFIED | recorded E3 not reproduced here | Extend with isolated evidence |
| Browser — current-HEAD E4 | NOT_AVAILABLE | no pinned preview; 6 rows NOT_RUN | Extend only in authorized session |
| Browser — historic transfer | NOT_VERIFIED | historic SSO deployment not pinned | Preserve as history |

## P. Change-Control Register (no restart tasks)

Per the **STOPPED — ORDER 580** posture, this section is a **change-control register, not a development backlog**. No activation, restart, deployment or feature task is authorized or implied. Items below are evidence/owner-gate closures only and must not advance activation status.

| # | Exact file / gate | Nature (evidence / owner gate only) | Required evidence | Dependencies | Risk | Expected outcome | Acceptance criterion |
|---|---|---|---|---|---|---|---|
| 1 | `BROWSER-01..06` rows | evidence gap (not a restart) | authorized browser run pinned to `37f047a4` | owner-authorized environment; SSO decision | low | 6 rows evidenced | JSON/PNG captured; ledger updated by owner |
| 2 | source/referral/clinical gates `D-C4`/`D-C5`/`D-CLIN` | owner/specialist gate | approved pack + AR/EN wording + sign-off | qualified specialist | medium | provenance closed | recorded approvals |
| 3 | STOPPED/order-580/registry reconciliation | owner decision only | written owner reconciliation | programme owner | high | unambiguous status | owner decision recorded; no code change |
| 4 | atomic ledger (untracked) | evidence hygiene | owner-scoped commit decision | owner authorization | low | denominator available in clean clone | committed ledger hash |
| 5 | `W18-02` | owner decision | W18 storage decision | owner | low | history box posture confirmed | recorded decision |

Shared-component changes require a separate Change Impact Matrix; none authorized. **Do not restart or advance Tool 042 under this audit.**

## Q. Current Tool Decision

**Decision: BLOCKED.** Status preserved exactly: **`STOPPED — ORDER 580`**. Recorded completion = `100 × 44 / 53 = 83.02%`; 6 browser rows NOT_RUN/E0; 3 `NOT_AVAILABLE` rows (`W18-02`, `D-C4`, `D-C5`) remain in the denominator and are never completion. Preserved assets: 53-row atomic ledger, pure deterministic engine with prescriber boundary, recorded E3 result-schema/envelope gate, tool-owned boxes, tracked i18n and test suites. Blocking gaps: STOPPED/registry conflict, six browser criteria, open source/referral/clinical gates, W18, and untracked ledger. **No activation change, restart, development task, owner acceptance or closure is implied by this audit.**

## Integrity note

The SHA-256 below is computed over all bytes of this file preceding the final hash line. Because that line is added after hashing, the whole-file hash differs by construction; the recorded body hash is the reproducible content fingerprint and is authoritative for this audit. The true whole-file SHA-256 is reported in the delivery response.

Observed on-disk SHA-256 (body before this line): `29721B98A892685BC2E8944ADDC824883AD56D8EECB4A2CEF974C9722D7A9122`
