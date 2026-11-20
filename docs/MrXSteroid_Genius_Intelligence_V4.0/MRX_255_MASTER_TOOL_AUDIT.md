# MRX_255_MASTER_TOOL_AUDIT.md

**Generated:** 2026-11-07  
**Repository:** `E:\MrXSteroid-main`  
**Branch / HEAD:** `main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0` (unchanged)  
**Frozen master SHA-256:** `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`  
**Source B (owner 255-tool directive) SHA-256:** `4525F3B089A75BCAD5A6CFF2A4F2B07891C68104BA8C69E9A89407506B714D7B`  
**Mode:** Read-only. No code, schema, route, registry, database, RLS, Macro, frozen document, commit, push, merge or deployment was changed.  
**R5 gate:** `PASS` in principle; final owner acceptance is still pending; Batch 2 is blocked.  
**Evidence base:** `C:\Users\foryo\AppData\Local\Temp\opencode\r5-analyze.js`, `C:\Users\foryo\AppData\Local\Temp\opencode\r5-audit.json`, and the historical R5 reports under `docs/MrXSteroid_Genius_Intelligence_V4.0/`.

---

## 1. Executive verdict

The platform has **268 catalog entries**: 264 implemented and 4 planned. The strategic target is 255, but the repository is **not** simply “255 tools plus 9 extras”; it is 247 numbered catalog slots (243 implemented + 4 planned) plus 21 named tools, with 8 numbered slots missing (1–5 and 253–255). The net excess over 255 is 13 catalog entries, or 9 implemented tools, and it is arithmetic, not a clean deletion set.

The audit found a broad surface area with thin verified depth:

- **3** tools are `PASS` for R5 runtime work, but that pass is still awaiting final owner acceptance.
- **58** tools are `FAIL`: 53 record-only raw-JSON tools plus 5 tools with confirmed formula defects (010, 020, 030, 100, 106).
- **203** tools are `PARTIAL`.
- **4** planned tools are `BLOCKED`.
- **11** formulas/rule sets passed a static or R5 runtime check.
- **5** formulas have confirmed defects.
- **248** formulas are `NOT RUN` because no independent sourced golden case was available.
- **34** of 264 implemented tools publish typed AI findings; **230** are AI-result-blind.
- **91** implemented tools have no test file.
- **17** pre-existing full-suite failures remain and are not R5 regressions.

No tool is declared complete merely because it has a page, component, registry entry, or test file. Per-tool dossiers already contain the required Strengths, Weaknesses, Formula Audit, Input Audit, Output Audit, Report Audit, AI Capability Profile, ten unique AI proposals, Safety Profile, Localization, Measurement, History & Context, Visuals, Test Results, Remaining Gaps, and Final Tool Status.

---

## 2. Inventory reconciliation

| Metric | Count | Evidence |
|---|---:|---|
| Catalog entries | 268 | `r5-audit.json.summary.total` |
| Implemented | 264 | `summary.implemented` |
| Planned | 4 | `summary.planned` (slugs `tool-132-ai-pose-form-coach`, `tool-137-peptide-hormone-reconstitution-calculator`, `tool-138-raw-powder-density-oil-formulation-engine`, `tool-139-solvent-emulsifier-ratio-calculator`) |
| Numbered catalog slots | 247 | `tool-006` through `tool-252`, excluding 1–5 and 253–255 |
| Numbered implemented | 243 | 247 numbered − 4 planned |
| Named (non-numbered) tools | 21 | `macro`, `bodyfat`, `injection`, `halflife`, `lab`, `genetic`, `cycle`, `timeline`, `master-calculator`, `multi-ester-pharmacokinetics`, `hpta-recovery`, `aromatization-risk`, `pct-timing`, `hcg-serm-protocol`, `bmi`, `one-rep-max`, `strength-standards`, `rest-timer`, `bmr-tdee`, `protein-needs`, `water-intake` |
| Missing numbered slots | 8 | 1, 2, 3, 4, 5, 253, 254, 255 |
| Catalog/registry identity mismatches | 4 | `tool-016-half-life` vs `tool-016-half-life-calculator`; `tool-018-hpta-recovery-monitor` vs `tool-018-hpta-recovery`; `tool-029-side-effect-warning` vs `tool-029-side-effect-early-warning`; `tool-030-cycle-cost` vs `tool-030-cycle-cost-calculator` |
| Catalog duplicate entries | 0 | `summary.duplicateCatalogEntries` |

Catalog is treated as the user-facing source of truth. No ID, slug, category, route, registry entry, or planned entry was deleted, renumbered, renamed, normalized, or forced to 255.

---

## 3. Status model

| Status | Count | Definition in this audit |
|---|---:|---|
| `PASS` | 3 | R5 pilots (BMI, Protein Needs, Water Intake) with runtime evidence, still awaiting final owner acceptance |
| `FAIL` | 58 | 53 record-only raw-JSON tools + 5 confirmed formula-defect tools |
| `PARTIAL` | 203 | Implemented but incomplete against one or more required domains |
| `BLOCKED` | 4 | Planned tools with no route/component/engine |
| Total | 268 | |

---

## 4. Depth distribution

| Depth | Count | Meaning |
|---|---:|---|
| Rich-output | 37 | Some interpretation/report/scenario surface exists |
| Standard | 111 | Basic calculator or record surface |
| Numeric-minimal | 63 | Minimal calculation with little interpretation |
| Record-only | 53 | User-entered records/raw JSON; no domain calculation |
| Planned | 4 | Roadmap entries only |
| Total | 268 | |

---

## 5. Category distribution

| Category | Implemented entries | Notes |
|---|---:|---|
| Medical Monitoring | 73 | Largest category; 47 tools have tests |
| Pharmacokinetics | 41 | 20 tools have tests |
| Training & Recovery | 23 | 6 engines have no calculation function |
| Hormonal Health | 24 | 3 tools lack finite guards |
| Reproductive Wellbeing | 19 | 2 tools lack finite guards |
| Nutrition | 19 | 1 engine has no calculation function |
| AI Nutrition Vision | 9 | Vision/AI claims require model verification |
| Body Composition | 10 | 4 non-strict schemas |
| Cycle Management | 13 | 3 tools lack finite guards |
| Injection & Formulation | 11 | 1 engine has no calculation function |
| AI Behavior | 6 | 5 tools lack source provenance |
| Homebrew Chemistry | 8 | 4 tools lack source provenance |
| Platform AI | 7 | 1 non-strict schema |
| Contest Prep | 3 | 2 tools lack source provenance |
| Measurement Conversion | 2 | 2 tools lack source provenance |
| Total | 264 | Implemented only |

---

## 6. Formula and reference status

| Status | Count | Meaning |
|---|---:|---|
| `PASS` | 11 | Formula/rule read and checked; scope limits stated |
| `FAIL` | 5 | Confirmed defect requiring owner-approved remediation |
| `NOT RUN` | 248 | No independent sourced golden case verified |
| `BLOCKED` | 4 | Planned tools with no engine |
| Total | 268 | |

Confirmed defects: 010, 020, 030, 100, 106. See `MRX_255_FORMULA_AND_EVIDENCE_REGISTRY.md` and the five independent defect plans.

Systemic formula-risk counts among implemented tools:

| Signal | Count |
|---|---:|
| No test file | 91 |
| Test file but no numeric/golden assertion | 65 |
| No source/provenance | 204 |
| No explicit assumptions | 193 |
| Schema not strict | 85 |
| No finite guard | 10 |
| No typed schema | 11 |
| Engine has no calculation function | 10 |
| No i18n JSON | 142 |
| No global measurement integration | 138 |
| No `<main>` landmark | 204 |
| No ARIA affordance | 166 |
| No result narrative | 84 |
| No scenario surface | 236 |
| No visual primitive | 259 |
| AI result context missing | 230 |
| Raw JSON primary output | 125 |

---

## 7. AI capability status

| Metric | Count |
|---|---:|
| Tools publishing typed findings | 34 |
| AI-result-blind tools | 230 |
| Tools with direct local AI text | 2 (tool-010 and related) |
| Tools with static local AI text | 2 (tool-010 and related) |

The AI contract is implemented in `server/ai/contracts.ts`, `server/ai/explain.ts`, `server/ai/fallback.ts`, `components/smarttools/AIInsightContext.tsx`, and `components/smarttools/AIInsightPanel.tsx`. The model is contractually forbidden from inventing or changing numbers, diagnoses, citations, or doses; the deterministic fallback is always available; only published tools are explainable; result context is capped at 16 findings. See `MRX_255_TOOL_SPECIFIC_AI_CAPABILITY_MATRIX.md` and `MRX_255_AI_RESULT_CONTRACT.md`.

---

## 8. Safety status

- Tool-010 is a **release-blocking safety issue** in code: it contains unsafe aromatase-inhibitor language at component lines 105, 141, and 142, stale Supabase Edge Function copy at lines 158 and 191, an untestable inline aromatization calculation, and an implausible “estradiol equivalent” reported in milligrams.
- It has no engine calculation function (`lib/tools/engines/tool-010-compound-stack-builder.ts` is types only), no typed input schema, no ARIA, no `<main>`, no disclaimer, and no source provenance.
- It is publicly routable: catalog file `lib/tools/smartToolsCatalog3.ts` line 6 marks it `accessTier: 'free'` with no `status: 'planned'`; registry file `lib/tools/registry.ts` line 51 marks it free and layered; `app/smarttools/[category]/[tool]/page.tsx` lines 10–11 and 42–44 generate and render it; `app/smarttools/sitemap.ts` lines 20–23 includes it; `middleware.ts` lines 122–125 only performs locale routing and does not gate access.
- Production deployment status is **NOT VERIFIED** from the repository; the code must be treated as publicly accessible until the owner confirms deployment state.
- See `MRX_255_TOOL_010_SAFETY_AND_CONTAINMENT.md` and `MRX_255_DEFECT_PLAN_010_COMPOUND_STACK_BUILDER.md`.

---

## 9. Testing and regression status

| Metric | Count |
|---|---:|
| Implemented tools with at least one test file | 173 |
| Implemented tools with no test file | 91 |
| Tools with golden/numeric assertions | 108 |
| Tools with tests but no numeric/golden assertion | 65 |
| Full suite files | 559 |
| Full suite passed | 5235 |
| Full suite failed | 17 |
| Full suite skipped | 5 |

The 17 failures are pre-existing payment/checkout/security/merchant failures and are outside R5. They are not ignored; they are a separate release gate. R5 tests are recorded separately: 13/13 accessibility RED→GREEN, R5 batch 17 files/81 tests, targeted regression 45 tests, shared `ui` 20 tests, header preferences 84 tests, `tsc`/lint pass, `validate-tools` 5/5, build 502 pages, Lighthouse accessibility BMI 0.93→1.00, Protein 0.91→1.00, Water 0.91→1.00, zero failing axe audits.

---

## 10. Planned tools

| Slug | Status | Blocker |
|---|---|---|
| `tool-132-ai-pose-form-coach` | BLOCKED | No route, component, engine, schema, category route, or build authorization |
| `tool-137-peptide-hormone-reconstitution-calculator` | BLOCKED | Same |
| `tool-138-raw-powder-density-oil-formulation-engine` | BLOCKED | Same |
| `tool-139-solvent-emulsifier-ratio-calculator` | BLOCKED | Same |

---

## 11. Per-tool records

Per-tool records are not duplicated in this file. The required fields for every tool exist in:

- `docs/MrXSteroid_Genius_Intelligence_V4.0/R5_255_TOOL_PER_TOOL_DOSSIERS.md`
- `docs/MrXSteroid_Genius_Intelligence_V4.0/R5_255_TOOL_DOSSIERS/` (15 category files)
- `docs/MrXSteroid_Genius_Intelligence_V4.0/R5_255_TOOL_AUDIT_EVIDENCE.json`
- `docs/MrXSteroid_Genius_Intelligence_V4.0/R5_255_TOOL_COMPREHENSIVE_AUDIT_AND_ROLLOUT_MATRIX.md`

---

## 12. What is NOT verified

- Formula correctness for 248 tools (`NOT RUN`).
- Runtime input behavior for 256 tools that do not use the R5 slider model.
- Measurement round-trip for 138 tools without global measurement integration.
- Arabic/English completeness for 142 tools without tool i18n JSON.
- AI result grounding for 230 tools.
- Production deployment status for tool-010 and the wider catalog.
- Full-suite green status (17 failures remain).
- R5 final owner acceptance (pending).

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
