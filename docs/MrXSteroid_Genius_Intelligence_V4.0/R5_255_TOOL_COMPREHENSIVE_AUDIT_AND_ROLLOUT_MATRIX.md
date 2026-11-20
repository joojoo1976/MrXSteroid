# R5 255-TOOL COMPREHENSIVE AUDIT AND ROLLOUT MATRIX

**Read-only full-inventory audit of every catalogued SmartTool**

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

> Read-only audit. No code, schema, route, registry, database, RLS, Macro or frozen document was changed. No commit, push, merge or deployment was performed.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

## 0. Owner decision summary

The inventory is **not** 255 clean, complete tools. It is **268 catalog entries = 264 implemented + 4 planned**, and “implemented” means only that a route and files exist. The audit found:

- **58 FAIL**: 53 record-only tools that echo input as raw JSON, plus 5 tools with a confirmed formula/provenance defect (one of them also ships unsafe medical advice).
- **203 PARTIAL**: implemented tools whose formula, tests, i18n, measurement, narrative and/or AI result context are incomplete.
- **3 PASS**: the three R5 pilots, and that PASS is **pending the owner’s final acceptance**.
- **4 BLOCKED**: planned entries with no component, engine or schema.

Central conclusion: **the platform has broad surface area but thin verified depth.** 91 implemented tools have no test file, 248 have no independently verified formula, 204 have no source provenance, 138 do not read the global measurement control, and only 34 publish typed result findings to the AI layer. The full suite is also not green: 17 pre-existing payment/checkout/security failures remain.

Requested owner decisions:

1. **Accept or reject R5.** Batch 2 is blocked until this decision.
2. **Approve the 88-batch execution order** in `R5_255_TOOL_EXECUTION_PLAN.md` (maximum three tools per batch).
3. **Decide the 53 record-only tools**: keep them as neutral records (rename/relabel), or authorize calculator rebuilds with validated sources. The audit does not invent formulas for them.
4. **Authorize formula remediation** for the confirmed defects, starting with tool-010’s unsafe advice and tools 020/030/100/106.

## 1. Scope, method and non-claims

**Scope.** All 268 entries in `lib/tools/smartToolsCatalog*.ts`, the 264-entry registry, every referenced component/engine/schema, test files, i18n JSON, shared route shell, `SafetyNotice`, the AI explain route/provider and the Header language/measurement state.

**Method.** Static analysis was performed by `C:\Users\foryo\AppData\Local\Temp\opencode\r5-analyze.js`, which resolves re-export shims, extracts Zod fields, result interfaces, JSX input types, sliders, test references, i18n files, formula signals and issue flags into `r5-audit.json`. Targeted manual reads verified the shared defects and 12 formula cases. Runtime evidence is taken from the recorded R5 live/Lighthouse/full-suite run; other tools were **not** executed in this read-only pass.

**Status vocabulary.** `PASS` = current evidence satisfies the audit gate (only R5, pending acceptance). `PARTIAL` = implemented but incomplete. `FAIL` = confirmed defect or record-only substitution. `NOT RUN` = no independent verification yet. `BLOCKED` = cannot proceed without an owner decision or missing implementation. `NOT APPLICABLE` = the capability does not fit the tool.

**Non-claims.** This audit does not claim that 264 tools are complete, accurate, accessible or AI-capable. A catalog entry is not proof of implementation. A passing existing test is not proof of an independent formula match. Static review is not a runtime browser verification.

## 2. Inventory reconciliation

| Fact | Verified value | Evidence |
|---|---:|---|
| Catalog entries | 268 | 30 `smartToolsCatalog*.ts` files |
| Implemented / published | 264 | status field in catalog |
| Planned | 4 | `tool-132`, `tool-137`, `tool-138`, `tool-139` |
| Registry entries | 264 | `lib/tools/registry.ts` |
| Numbered tools | 243 | IDs `mrx.tool.006` … `mrx.tool.252` |
| Named tools | 21 | `macro`, `bmi`, `protein-needs`, … |
| Missing numbers in the 255 sequence | 12 | 1–5, 132, 137–139, 253–255 |
| Duplicate catalog keys | 0 | analyzer dedupe |
| Duplicate registry IDs/slugs | 0 | inventory script |

### 2.1 Identity discrepancies (must not be silently normalized)

| # | Catalog toolId | Registry toolId | Consequence |
|---|---|---|---|
| 016 | `mrx.tool.016-half-life` | `mrx.tool.016-half-life-calculator` | cross-reference by toolId can miss |
| 018 | `mrx.tool.018-hpta-recovery-monitor` | `mrx.tool.018-hpta-recovery` | cross-reference by toolId can miss |
| 029 | `mrx.tool.029-side-effect-warning` | `mrx.tool.029-side-effect-early-warning` | cross-reference by toolId can miss |
| 030 | `mrx.tool.030-cycle-cost` | `mrx.tool.030-cycle-cost-calculator` | cross-reference by toolId can miss |

The four planned catalog entries also have hrefs without a category segment: `/smarttools/tool-132-ai-pose-form-coach`, `/smarttools/tool-137-peptide-hormone-reconstitution-calculator`, `/smarttools/tool-138-raw-powder-density-oil-formulation-engine`, `/smarttools/tool-139-solvent-emulsifier-ratio-calculator`. The implemented route expects `/smarttools/[category]/[tool]`. They are not routable until built and categorized.

### 2.2 What “implemented” actually covers

| Depth | Tools | Meaning |
|---|---:|---|
| Rich output | 37 | typed summary/finding path; still not necessarily independently verified |
| Standard | 111 | form + result, usually numeric |
| Numeric-minimal | 63 | compact form, minimal interpretation |
| Record-only | 53 | one text/array field echoed as raw JSON |
| Planned | 4 | no implementation |

## 3. Coverage dashboard

| Capability | Tools with it | Implemented total | Coverage | Missing (implemented) |
|---|---:|---:|---:|---:|
| Test file matched by ID/slug | 173 | 264 | 65.5% | 91 |
| Numeric/golden assertion in tests | 108 | 264 | 40.9% | 156 |
| Tool-specific i18n JSON | 122 | 264 | 46.2% | 142 |
| Reads global measurement preference | 126 | 264 | 47.7% | 138 |
| Result narrative/interpretation signal | 180 | 264 | 68.2% | 84 |
| What-if/scenario surface | 28 | 264 | 10.6% | 236 |
| Visual/chart output | 5 | 264 | 1.9% | 259 |
| ARIA/role/sr-only | 98 | 264 | 37.1% | 166 |
| `<main>` landmark | 60 | 264 | 22.7% | 204 |
| Typed result findings to AI | 34 | 264 | 12.9% | 230 |
| Typed result contract (interface or output Zod) | 140 | 264 | 53.0% | 124 (71 non-record) |
| Slider input | 8 | 264 | 3.0% | 256 |
| Source/provenance signal | 60 | 264 | 22.7% | 204 |
| Explicit assumptions | 71 | 264 | 26.9% | 193 |
| Strict schema | 179 | 264 | 67.8% | 85 |
| Finite numeric guard | 254 | 264 | 96.2% | 10 |

**Formula status:** PASS 11 · FAIL 5 · NOT RUN 248 · BLOCKED 4. This is the most important number in the audit: **93.9% of implemented tools have no independently verified formula** in this pass.

## 4. Systemic findings

### F-01 — Catalog breadth is being mistaken for product completeness

268 catalog entries resolve to 264 routes, but only 37 have a rich output path, 53 are record-only, and 63 are compact numeric forms. The catalog is the user-facing source of truth, so an “implemented” label currently over-promises capability. **Status: FAIL (inventory honesty).**

### F-02 — 53 record-only tools replace the advertised function with a text echo

Examples: `components/tools/tool-200-antioxidant-manager.tsx` and `components/tools/tool-235-grocery-basket-optimizer.tsx` accept a bounded `items` array and render `<pre>{JSON.stringify(...)}</pre>`. 125 tools use raw JSON in the primary output path. Tool-200’s catalog title is “Item Record” while the slug promises an antioxidant manager; tool-235’s title is “Basket Record” while the slug promises a grocery-basket optimizer. **Status: FAIL; requires an owner scope decision, not an invented formula.**

### F-03 — Formula provenance is largely absent

204 implemented tools have no source/provenance signal; 193 have no explicit assumptions; 91 have no test file; 65 tested tools have no numeric/golden assertion; 85 schemas are not strict; 10 lack a finite-number guard. Confirmed defects: tool-020 (unsourced “genetic potential”), tool-030 (hardcoded PCT $50/$60), tool-100 (echoes input scores), tool-106 (arbitrary 600 g cap and duplicate water fields). **Status: FAIL for the confirmed cases; NOT RUN for the rest.**

### F-04 — One shipped tool contains unsafe medical/AI advice (release blocker)

`components/tools/tool-010-compound-stack-builder.tsx`:

- L105: `"CRITICAL aromatization risk - AI strongly recommends aromatase inhibitor support and bloodwork within 48 hours."`
- L141: `"High aromatization risk. Significant estrogen conversion likely; AI recommends supportive therapy."`
- L142: `"Critical aromatization risk. Immediate medical review and aromatase inhibitor consideration required."`
- L158/L191: claims `AI-powered explanation available when Supabase Edge Function service is operational` — a stale, false capability claim.

The engine file (`lib/tools/engines/tool-010-compound-stack-builder.ts`) has no calculation function; the logic is inline in the component. The “estradiol equivalent” is reported in **mg** from arbitrary weights, without a validated assay conversion. **Status: FAIL; must be fixed before any Batch 2 work.**

### F-05 — Engine and result contracts are missing or inline

Engine files with **zero exported functions**: tool-008-side-effect-tracker, tool-009-injection-site-rotator, tool-010-compound-stack-builder, tool-113-ai-grocery-basket-meal-cost-optimizer, tool-120-progressive-overload-predictor, tool-121-muscle-group-recovery-modeler, tool-122-rpe-rir-1rm-velocity-modeler, tool-123-joint-stress-connective-tissue-index, tool-124-deload-frequency-fatigue-modeler, tool-125-fiber-type-mechanical-tension-score. These tools either compute inline in a large component or do not compute at all, so a formula cannot be unit-tested in isolation. 11 tools also have no typed input schema: tool-008-side-effect-tracker, tool-009-injection-site-rotator, tool-010-compound-stack-builder, tool-011-progress-tracker, tool-018-hpta-recovery, tool-019-cardio-monitor, tool-023-trt-optimization, tool-102-subcutaneous-vs-intramuscular-pk-modeler, tool-131-transformation-forecast-trajectory-engine, tool-149-physique-trajectory-simulator, tool-251-physique-trajectory-simulator. Only **140/264** expose a typed result contract (named Output/Result interface or output Zod schema); **71 non-record analytical tools** return an untyped/raw surface that the narrative and AI layers cannot consume safely. **Status: PARTIAL/FAIL by tool.**

### F-06 — AI is explain-only and mostly result-blind

The platform route `app/api/smarttools/ai/explain/route.ts` and `server/ai/explain.ts` accept a tool explanation request with a deterministic fallback. `SmartToolsAIExperience` shows an explainer on every numbered tool, but only 34 tools publish typed findings through `ToolOutputSummary`/`AIInsightContext`; 230 do not. No tool directly calls a model to generate a result, analyze an image, or personalize a report. AI cannot override engine numbers by contract, but most tools give it nothing to explain. **Status: PARTIAL.**

### F-07 — Language control is structurally incomplete

142 implemented tools have no tool-specific i18n JSON. `components/tools/SafetyNotice.tsx` always renders both Arabic (L24, fixed `dir="rtl"`) and English (L27, fixed `dir="ltr"`) regardless of the selected locale. The canonical route breadcrumb uses `cat.nameEn` (L72) and `entry.titleEn` (L74) in both languages. 39 catalog titles narrow the slug’s scope (mostly to “Record”), creating language-independent product-promise drift. **Status: FAIL at the shared layer; per-tool NOT RUN.**

### F-08 — Measurement control reaches only 126 of 264 tools

138 implemented tools do not read `unitSystem`. Only 8 tools render a slider at all: macro (1), hpta-recovery (1), aromatization-risk (3), pct-timing (3), hcg-serm-protocol (2), bmi (3), protein-needs (2), water-intake (2). The R5 pilots prove the shared model works (canonical value preserved; 70 kg / 175 cm → 22.9; 154.3 lb / 68.9 in → 22.9; water 2.5 L → 85 US fl oz), but it is not the default. **Status: PASS for R5; NOT RUN/FAIL elsewhere.**

### F-09 — Accessibility remediation is pilot-scoped

204 implemented tools do not render a `<main>` landmark and 166 have no ARIA/role/sr-only signal. The shared route shell also has no `<main>` (it renders `<SmartToolsAIExperience>{children}</SmartToolsAIExperience>`), so tools that do not supply one have no main landmark. R5 tools now supply exactly one `<main>`, pass 13/13 accessibility tests and score Lighthouse 1.00. **Status: PASS for R5; FAIL/NOT RUN for the rest.**

### F-10 — Results are mostly numbers, not reports

84 implemented tools have no narrative signal; 236 have no what-if surface; 259 have no chart/visual output. The 12-point narrative contract in the governing prompt is not implemented as a shared typed contract. **Status: FAIL for the majority.**

### F-11 — Test volume is not formula verification

173 tools match at least one test file, but 65 of those have no numeric assertion. Tool-016’s test recomputes the same expression as the engine, so it proves code-path stability, not an independent reference. The full suite result is **559 files, 17 failed / 5235 passed / 5 skipped** and is **not green**. **Status: PARTIAL.**

### F-12 — Planned routes are not routable

The four planned entries lack a category in `href`, a component, an engine and a schema. They are correctly excluded from the 264 implemented count but should not appear as if they were launch-ready. **Status: BLOCKED.**

### F-13 — Shared measurement/language assertions in the route shell are English-only

Metadata, breadcrumb labels and route-level `aria-label="Breadcrumb"` are English constants. Even a fully translated tool can show an English breadcrumb in Arabic mode. **Status: FAIL at the shared layer.**

### F-14 — Visual/interactive coverage is near-zero

Only 5 tools contain a chart/visual primitive, while 259 do not. This is not a request to add a chart to every tool; it means the result-reading experience is text-and-number only for almost the whole catalog. **Status: NOT APPLICABLE for record/log tools; FAIL for analytical tools.**

### F-15 — Pre-existing suite failures remain a separate release gate

The recorded full-suite failures are confined to eight payment/checkout/security/merchant files (17 failing tests). None touch R5 or shared accessibility, but they mean the repository cannot be called green. **Status: FAIL (platform release gate), outside this audit’s change surface.**

## 5. Category matrix

| Category | Entries | Impl. | Planned | Tests | i18n | Meas. | Narrative | AI findings | Raw JSON | Record-only | No source | No assumptions | Non-strict | No finite |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| AI Behavior | 6 | 6 | 0 | 1 | 0 | 1 | 4 | 0 | 0 | 0 | 5 | 5 | 0 | 0 |
| AI Nutrition Vision | 9 | 9 | 0 | 2 | 0 | 1 | 5 | 0 | 7 | 7 | 6 | 2 | 0 | 0 |
| Body Composition | 10 | 10 | 0 | 9 | 4 | 8 | 7 | 3 | 1 | 0 | 9 | 7 | 4 | 0 |
| Contest Prep | 3 | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 2 | 2 | 2 | 1 | 0 | 0 |
| Cycle Management | 13 | 13 | 0 | 13 | 11 | 10 | 9 | 0 | 4 | 0 | 9 | 12 | 7 | 3 |
| Homebrew Chemistry | 8 | 8 | 0 | 2 | 0 | 2 | 3 | 0 | 0 | 0 | 4 | 8 | 0 | 0 |
| Hormonal Health | 24 | 24 | 0 | 23 | 22 | 19 | 23 | 1 | 16 | 0 | 19 | 23 | 17 | 3 |
| Injection & Formulation | 11 | 8 | 3 | 8 | 4 | 4 | 7 | 1 | 1 | 0 | 4 | 8 | 3 | 0 |
| Measurement Conversion | 2 | 2 | 0 | 1 | 0 | 1 | 2 | 1 | 1 | 0 | 2 | 2 | 1 | 0 |
| Medical Monitoring | 73 | 73 | 0 | 47 | 43 | 34 | 45 | 0 | 62 | 22 | 64 | 50 | 32 | 0 |
| Nutrition | 19 | 19 | 0 | 16 | 14 | 18 | 13 | 8 | 0 | 0 | 10 | 16 | 8 | 0 |
| Pharmacokinetics | 41 | 41 | 0 | 20 | 8 | 9 | 27 | 2 | 16 | 9 | 37 | 26 | 4 | 1 |
| Platform AI | 7 | 7 | 0 | 7 | 3 | 2 | 6 | 2 | 1 | 0 | 2 | 6 | 1 | 0 |
| Reproductive Wellbeing | 19 | 19 | 0 | 9 | 4 | 2 | 11 | 0 | 14 | 13 | 18 | 6 | 2 | 2 |
| Training & Recovery | 23 | 22 | 1 | 15 | 9 | 15 | 17 | 16 | 0 | 0 | 13 | 21 | 6 | 1 |
| **Total** | **268** | **264** | **4** | **173** | **122** | **126** | **180** | **34** | **125** | **53** | **204** | **193** | **85** | **10** |

Reading the matrix: medical monitoring is the largest category (73 entries) and accounts for 26 of the 91 no-test entries; reproductive wellbeing has 13 record-only tools; pharmacokinetics has 16 raw-JSON tools; nutrition has the best measurement coverage (18/19).

## 6. Full rollout matrix (268 entries)

Status codes are defined in §1. “Batch” is the proposed ≤3-tool execution batch; all batches after 1 are blocked by the R5 gate. The per-tool dossier has the full five-strengths/five-gaps/ten-proposals record.

| # | Tool | ID | Category | Status | Depth | Tests | i18n | Meas. | Narr. | AI | Top issues | Batch |
|---:|---|---|---|---|---|---:|---|---|---|---|---|---|
| named | Adaptive Macro Calculator | `mrx.tool.macro` | Nutrition | PARTIAL | standard | 21 | — | Y | Y | — | NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_MAIN_LANDMARK, NO_VISUAL | B42 |
| named | FFMI & Body Fat Analyzer | `mrx.tool.bodyfat` | Body Composition | PARTIAL | standard | 3 | — | — | — | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B17 |
| named | Interactive Injection Map | `mrx.tool.injection` | Injection & Formulation | PARTIAL | standard | 7 | — | — | Y | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_ARIA | B26 |
| named | Half-Life Simulator | `mrx.tool.halflife` | Pharmacokinetics | PARTIAL | standard | 0 | — | — | — | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B44 |
| named | Smart Lab Reference | `mrx.tool.lab` | Medical Monitoring | PARTIAL | standard | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B29 |
| named | Genetic Potential Calculator | `mrx.tool.genetic` | Training & Recovery | PARTIAL | standard | 4 | — | — | — | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B51 |
| named | Cycle Architect | `mrx.tool.cycle` | Cycle Management | PARTIAL | standard | 6 | — | — | Y | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B18 |
| named | Transformation Timeline | `mrx.tool.timeline` | Training & Recovery | PARTIAL | standard | 2 | — | — | — | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B51 |
| named | Master Calculator | `mrx.tool.master-calculator` | Nutrition | PARTIAL | standard | 0 | — | — | — | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B42 |
| named | Multi-Ester PK Simulator | `mrx.tool.multi-ester-pharmacokinetics` | Pharmacokinetics | PARTIAL | standard | 3 | — | Y | Y | — | NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_MAIN_LANDMARK | B44 |
| named | HPTA Recovery Modeler | `mrx.tool.hpta-recovery` | Hormonal Health | PARTIAL | standard | 2 | — | Y | Y | — | NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_FINITE_GUARD | B22 |
| named | Unvalidated Aromatization Scenario | `mrx.tool.aromatization-risk` | Hormonal Health | PARTIAL | standard | 2 | — | Y | Y | — | NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_MAIN_LANDMARK | B22 |
| named | PCT Timing Engine | `mrx.tool.pct-timing` | Cycle Management | PARTIAL | standard | 2 | — | Y | — | — | NO_I18N_JSON, NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_ARIA | B19 |
| named | HCG & SERM Protocol | `mrx.tool.hcg-serm-protocol` | Reproductive Wellbeing | PARTIAL | standard | 2 | Y | Y | Y | — | AI_NO_RESULT_CONTEXT, NO_ARIA, NO_MAIN_LANDMARK, NO_VISUAL | B49 |
| 006 | Estradiol & Prolactin Record | `mrx.tool.006-estrogen-prolactin` | Hormonal Health | PARTIAL | numeric-minimal | 1 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT | B56 |
| 007 | Bloodwork Record Log | `mrx.tool.007-bloodwork-analyzer` | Medical Monitoring | PARTIAL | numeric-minimal | 2 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, TITLE_SCOPE_MISMATCH | B59 |
| 008 | Side Effect Tracker | `mrx.tool.008-side-effect-tracker` | Medical Monitoring | PARTIAL | standard | 1 | Y | — | — | — | ENGINE_NO_FUNCTION, NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B29 |
| 009 | Injection Site History Log | `mrx.tool.009-injection-site-rotator` | Injection & Formulation | PARTIAL | standard | 1 | Y | — | Y | — | ENGINE_NO_FUNCTION, NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B27 |
| 010 | Compound Stack Builder | `mrx.tool.010-compound-stack-builder` | Cycle Management | FAIL | standard | 5 | Y | Y | Y | — | UNSAFE_MEDICAL_ADVICE, STALE_AI_COPY, ENGINE_NO_FUNCTION, AI_NO_RESULT_CONTEXT | B2 |
| 011 | Progress Tracker | `mrx.tool.011-progress-tracker` | Body Composition | PARTIAL | numeric-minimal | 1 | Y | Y | — | — | NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_ARIA | B52 |
| 012 | Calorie Adjuster | `mrx.tool.012-calorie-adjuster` | Nutrition | PARTIAL | rich-output | 1 | Y | Y | Y | Y | NO_SOURCE_PROVENANCE, NO_MAIN_LANDMARK, NO_VISUAL | B5 |
| 013 | Macro Optimizer | `mrx.tool.013-macro-optimizer` | Nutrition | PARTIAL | rich-output | 2 | Y | Y | Y | Y | NO_SOURCE_PROVENANCE, NO_MAIN_LANDMARK, NO_VISUAL | B6 |
| 014 | Water Retention Assessor | `mrx.tool.014-water-retention` | Body Composition | PARTIAL | standard | 1 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B17 |
| 015 | SHBG Modulator | `mrx.tool.015-shbg-modulator` | Hormonal Health | PARTIAL | rich-output | 3 | Y | Y | Y | Y | NO_SOURCE_PROVENANCE, NO_MAIN_LANDMARK, NO_VISUAL | B4 |
| 016 | Half-Life Calculator | `mrx.tool.016-half-life` | Pharmacokinetics | PARTIAL | rich-output | 3 | Y | Y | Y | Y | NO_MAIN_LANDMARK, NO_VISUAL | B8 |
| 017 | Drug Interaction Checker | `mrx.tool.017-drug-interaction` | Medical Monitoring | PARTIAL | standard | 2 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_MAIN_LANDMARK | B29 |
| 018 | HPTA Recovery Monitor | `mrx.tool.018-hpta-recovery-monitor` | Hormonal Health | PARTIAL | numeric-minimal | 0 | Y | — | — | — | NO_TESTS, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B56 |
| 019 | Cardio Monitor | `mrx.tool.019-cardio-monitor` | Medical Monitoring | PARTIAL | numeric-minimal | 0 | Y | — | Y | — | NO_TESTS, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B59 |
| 020 | Genetic Potential Calculator | `mrx.tool.020-genetic-potential` | Training & Recovery | FAIL | numeric-minimal | 2 | Y | Y | Y | — | NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B3 |
| 021 | Peptide Protocol Planner | `mrx.tool.021-peptide-protocol` | Cycle Management | PARTIAL | numeric-minimal | 1 | Y | Y | Y | — | NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B53 |
| 022 | Half-Life Stacker | `mrx.tool.022-half-life-stacker` | Pharmacokinetics | PARTIAL | numeric-minimal | 2 | Y | — | Y | — | NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B64 |
| 023 | TRT Optimization | `mrx.tool.023-trt-optimization` | Hormonal Health | PARTIAL | numeric-minimal | 1 | Y | — | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B56 |
| 024 | Lab Reference Interval Comparison | `mrx.tool.024-bloodwork-interpreter` | Medical Monitoring | PARTIAL | numeric-minimal | 3 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_MAIN_LANDMARK | B60 |
| 025 | Medication & Compound Session List | `mrx.tool.025-drug-interaction-pro` | Medical Monitoring | PARTIAL | standard | 3 | Y | — | — | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B30 |
| 026 | Injection Experience Log | `mrx.tool.026-injection-pain` | Injection & Formulation | PARTIAL | standard | 3 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B27 |
| 027 | User-Provided Molar Mass Calculator | `mrx.tool.027-ester-conversion` | Pharmacokinetics | PARTIAL | standard | 3 | Y | — | — | — | NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B44 |
| 028 | Compound Scenario Comparison Worksheet | `mrx.tool.028-stacking-synergy` | Cycle Management | PARTIAL | standard | 3 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B19 |
| 029 | Personal Measurement Summary | `mrx.tool.029-side-effect-warning` | Medical Monitoring | PARTIAL | standard | 3 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B30 |
| 030 | Cycle Cost Calculator | `mrx.tool.030-cycle-cost` | Cycle Management | FAIL | numeric-minimal | 2 | Y | — | — | — | NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B2 |
| 031 | Cycle Length Optimizer | `mrx.tool.031-cycle-length-optimizer` | Cycle Management | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT, NO_ARIA | B19 |
| 032 | Advanced PCT Planner | `mrx.tool.032-advanced-pct-planner` | Hormonal Health | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B22 |
| 033 | Lab Reading Trend Summary | `mrx.tool.033-bloodwork-trend-analyzer` | Medical Monitoring | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B30 |
| 034 | Single-dose Fractional Decay Scenario | `mrx.tool.034-compound-clearance` | Pharmacokinetics | PARTIAL | standard | 3 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_VISUAL | B45 |
| 035 | Testosterone and Estradiol Unit Converter | `mrx.tool.035-hormone-conversion` | Pharmacokinetics | PARTIAL | standard | 2 | Y | Y | Y | — | AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_VISUAL | B45 |
| 036 | Injection Schedule Planner | `mrx.tool.036-injection-schedule` | Injection & Formulation | PARTIAL | standard | 5 | Y | — | Y | — | NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT, NO_MAIN_LANDMARK | B27 |
| 037 | Side Effect Probability Calculator | `mrx.tool.037-side-effect-probability` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT, NO_ARIA | B31 |
| 038 | Stack Compatibility Checker | `mrx.tool.038-stack-compatibility` | Cycle Management | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B20 |
| 039 | Liver Enzyme Tracker | `mrx.tool.039-liver-enzyme-tracker` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT, NO_ARIA | B31 |
| 040 | Lipid Profile Optimizer | `mrx.tool.040-lipid-profile-optimizer` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B31 |
| 041 | Hematocrit Monitor | `mrx.tool.041-hematocrit-monitor` | Medical Monitoring | PARTIAL | standard | 3 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT, NO_ARIA | B32 |
| 042 | Estrogen Management Pro | `mrx.tool.042-estrogen-management` | Hormonal Health | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT, NO_ARIA | B23 |
| 043 | Prolactin Management Pro | `mrx.tool.043-prolactin-management` | Hormonal Health | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT, NO_ARIA | B23 |
| 044 | DHT Side Effect Predictor | `mrx.tool.044-dht-side-effects` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT, NO_ARIA | B32 |
| 045 | Cycle Break Planner | `mrx.tool.045-cycle-break-planner` | Cycle Management | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B20 |
| 046 | TRT Lifetime Calculator | `mrx.tool.046-trt-lifetime` | Hormonal Health | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B23 |
| 047 | Fertility Preservation Guide | `mrx.tool.047-fertility-preservation` | Hormonal Health | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B24 |
| 048 | Cardiovascular Risk Assessor | `mrx.tool.048-cardiovascular-risk` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B32 |
| 049 | Bone Density Optimizer | `mrx.tool.049-bone-density` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B33 |
| 050 | Mental Health Monitor | `mrx.tool.050-mental-health` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B33 |
| 051 | Peptide Dosage Calculator | `mrx.tool.051-peptide-dosage-calculator` | Injection & Formulation | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B28 |
| 052 | Growth Hormone Protocol Planner | `mrx.tool.052-growth-hormone-protocol-planner` | Hormonal Health | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B24 |
| 053 | Insulin Conversion Calculator | `mrx.tool.053-insulin-conversion-calculator` | Hormonal Health | PARTIAL | numeric-minimal | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B57 |
| 054 | Glucose Tracker | `mrx.tool.054-glucose-tracker` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B33 |
| 055 | Insulin Sensitivity Optimizer | `mrx.tool.055-insulin-sensitivity-optimizer` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B34 |
| 056 | Mini PCT Calculator | `mrx.tool.056-mini-pct-calculator` | Cycle Management | PARTIAL | numeric-minimal | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B53 |
| 057 | Free Testosterone Manager | `mrx.tool.057-free-testosterone-manager` | Hormonal Health | PARTIAL | numeric-minimal | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B57 |
| 058 | Androgenic Balance Calculator | `mrx.tool.058-androgenic-balance-calculator` | Hormonal Health | PARTIAL | numeric-minimal | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B57 |
| 059 | Androgen Receptor Optimizer | `mrx.tool.059-androgen-receptor-optimizer` | Hormonal Health | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B24 |
| 060 | 5-Alpha Conversion Calculator | `mrx.tool.060-5-alpha-conversion-calculator` | Pharmacokinetics | PARTIAL | numeric-minimal | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B64 |
| 061 | Hair Loss Tracker | `mrx.tool.061-hair-loss-tracker` | Medical Monitoring | PARTIAL | standard | 3 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B34 |
| 062 | Prostate Health Manager | `mrx.tool.062-prostate-health-manager` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT, NO_ARIA | B34 |
| 063 | Testicular Suppression Calculator | `mrx.tool.063-testicular-suppression-calculator` | Hormonal Health | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B25 |
| 064 | Sperm Production Optimizer | `mrx.tool.064-sperm-production-optimizer` | Reproductive Wellbeing | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B50 |
| 065 | Aromatase Conversion Calculator | `mrx.tool.065-aromatase-conversion-calculator` | Pharmacokinetics | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B45 |
| 066 | Estrogen Sensitivity Manager | `mrx.tool.066-estrogen-sensitivity-manager` | Hormonal Health | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B25 |
| 067 | Estrogen Balance Calculator | `mrx.tool.067-estrogen-balance-calculator` | Hormonal Health | PARTIAL | numeric-minimal | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B58 |
| 068 | Gynecomastia Tracker | `mrx.tool.068-gynecomastia-tracker` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B35 |
| 069 | Detoxification Optimizer | `mrx.tool.069-detoxification-optimizer` | Medical Monitoring | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B35 |
| 070 | Oxidative Stress Calculator | `mrx.tool.070-oxidative-stress-calculator` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B35 |
| 071 | Antioxidant Manager | `mrx.tool.071-antioxidant-manager` | Medical Monitoring | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B36 |
| 072 | Systemic Inflammation Calculator | `mrx.tool.072-systemic-inflammation-calculator` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B36 |
| 073 | Immune System Optimizer | `mrx.tool.073-immune-system-optimizer` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B36 |
| 074 | Blood Pressure Tracker | `mrx.tool.074-blood-pressure-tracker` | Medical Monitoring | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B37 |
| 075 | Arterial Health Manager | `mrx.tool.075-arterial-health-manager` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B37 |
| 076 | Blood Viscosity Calculator | `mrx.tool.076-blood-viscosity-calculator` | Medical Monitoring | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B37 |
| 077 | Nitric Oxide Optimizer | `mrx.tool.077-nitric-oxide-optimizer` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B38 |
| 078 | Endothelial Health Manager | `mrx.tool.078-endothelial-health-manager` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B38 |
| 079 | Fat Metabolism Calculator | `mrx.tool.079-fat-metabolism-calculator` | Body Composition | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B18 |
| 080 | Mitochondrial Optimizer | `mrx.tool.080-mitochondrial-optimizer` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B38 |
| 081 | Cellular Aging Calculator | `mrx.tool.081-cellular-aging-calculator` | Medical Monitoring | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B39 |
| 082 | Telomere Manager | `mrx.tool.082-telomere-manager` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B39 |
| 083 | Anti-Aging Inflammation Calculator | `mrx.tool.083-anti-aging-inflammation-calculator` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B39 |
| 084 | Cognitive Enhancer | `mrx.tool.084-cognitive-enhancer` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B40 |
| 085 | Sleep Quality Manager | `mrx.tool.085-sleep-quality-manager` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B40 |
| 086 | Cortisol Stress Calculator | `mrx.tool.086-cortisol-stress-calculator` | Hormonal Health | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B25 |
| 087 | Mood Optimizer | `mrx.tool.087-mood-optimizer` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B40 |
| 088 | Dopamine Tracker | `mrx.tool.088-dopamine-tracker` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B41 |
| 089 | Serotonin Manager | `mrx.tool.089-serotonin-manager` | Medical Monitoring | PARTIAL | standard | 1 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B41 |
| 090 | Female Hormone Balance Calculator | `mrx.tool.090-female-hormone-balance-calculator` | Hormonal Health | PARTIAL | standard | 2 | Y | Y | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B26 |
| 091 | Female Health Observation Log | `mrx.tool.091-female-health-optimizer` | Hormonal Health | PARTIAL | numeric-minimal | 2 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B58 |
| 092 | Female Androgen Dose Evidence Check | `mrx.tool.092-female-dosage-calculator` | Hormonal Health | PARTIAL | standard | 2 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B26 |
| 093 | Menstrual Cycle Calendar Log | `mrx.tool.093-menstrual-cycle-manager` | Reproductive Wellbeing | PARTIAL | numeric-minimal | 1 | Y | — | — | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B69 |
| 094 | Pregnancy Exposure Information | `mrx.tool.094-pregnancy-risk-calculator` | Reproductive Wellbeing | PARTIAL | standard | 2 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B50 |
| 095 | Skin Observation Log | `mrx.tool.095-skin-health-optimizer` | Medical Monitoring | PARTIAL | standard | 1 | Y | — | — | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B41 |
| 096 | Hair & Nail Observation Log | `mrx.tool.096-hair-nail-tracker` | Medical Monitoring | PARTIAL | standard | 2 | Y | — | — | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B42 |
| 097 | Exercise Sweat-Rate Measurement | `mrx.tool.097-hydration-balance-calculator` | Nutrition | PARTIAL | standard | 3 | Y | Y | — | — | NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_VISUAL | B43 |
| 098 | Sodium-to-Potassium Ratio Calculator | `mrx.tool.098-sodium-potassium-manager` | Nutrition | PARTIAL | numeric-minimal | 1 | Y | Y | — | — | NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_VISUAL | B63 |
| 099 | Digestive Observation Log | `mrx.tool.099-digestive-health-optimizer` | Nutrition | PARTIAL | numeric-minimal | 1 | Y | Y | — | — | NO_GOLDEN_CASE, NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B63 |
| 100 | Comprehensive Report Generator | `mrx.tool.100-comprehensive-report-generator` | Platform AI | FAIL | numeric-minimal | 1 | Y | — | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B3 |
| 101 | SARM-to-AAS Transition & Bridge Predictor | `mrx.tool.101-sarm-to-aas-transition-bridge-predictor` | Cycle Management | PARTIAL | numeric-minimal | 3 | Y | Y | Y | — | AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_ARIA, NO_MAIN_LANDMARK | B53 |
| 102 | Subcutaneous vs. Intramuscular PK Modeler | `mrx.tool.102-subcutaneous-vs-intramuscular-pk-modeler` | Pharmacokinetics | PARTIAL | numeric-minimal | 1 | Y | Y | Y | — | AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_ARIA, NO_MAIN_LANDMARK | B64 |
| 103 | Renal Function & Hydration Index | `mrx.tool.103-renal-function-hydration-index` | Medical Monitoring | PARTIAL | numeric-minimal | 2 | Y | Y | Y | — | AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_ARIA, NO_MAIN_LANDMARK | B60 |
| 104 | Thyroid Function & Metabolic Rate Dynamics | `mrx.tool.104-thyroid-metabolic-rate-dynamics` | Hormonal Health | PARTIAL | numeric-minimal | 2 | Y | Y | Y | — | AI_NO_RESULT_CONTEXT, NO_ARIA, NO_MAIN_LANDMARK, NO_VISUAL | B58 |
| 105 | AI Health Data Fusion Hub & Timeline | `mrx.tool.105-ai-health-data-fusion-hub` | Platform AI | PARTIAL | numeric-minimal | 1 | Y | Y | Y | — | AI_NO_RESULT_CONTEXT, NO_ARIA, NO_MAIN_LANDMARK, NO_VISUAL | B69 |
| 106 | Glycogen Supercompensation & Water Retention Modeler | `mrx.tool.106-glycogen-supercompensation-water-modeler` | Nutrition | FAIL | numeric-minimal | 2 | Y | Y | — | — | NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_ARIA, NO_MAIN_LANDMARK | B2 |
| 107 | Contest Prep Peak-Week Manipulator | `mrx.tool.107-contest-prep-peak-week-manipulator` | Cycle Management | PARTIAL | numeric-minimal | 2 | Y | Y | — | — | NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_ARIA, NO_MAIN_LANDMARK | B54 |
| 108 | AI Body Composition Vision Engine | `mrx.tool.108-ai-body-composition-vision-engine` | Body Composition | PARTIAL | numeric-minimal | 1 | Y | Y | — | — | NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_ARIA, NO_MAIN_LANDMARK | B52 |
| 109 | Competition Readiness & Stage Posing OS | `mrx.tool.109-competition-readiness-posing-os` | Cycle Management | PARTIAL | numeric-minimal | 1 | Y | Y | — | — | NO_GOLDEN_CASE, NO_NARRATIVE, AI_NO_RESULT_CONTEXT, SCHEMA_NOT_STRICT | B54 |
| 110 | AI Meal Vision Scanner & Portion Estimator | `mrx.tool.110-ai-meal-vision-scanner` | Nutrition | PARTIAL | standard | 1 | Y | Y | Y | — | AI_NO_RESULT_CONTEXT, NO_ARIA, NO_MAIN_LANDMARK, NO_VISUAL | B43 |
| 111 | Smart Food & Macro Substitution Engine | `mrx.tool.111-smart-food-macro-substitution` | Nutrition | PARTIAL | standard | 6 | Y | Y | — | — | NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, NO_ARIA | B43 |
| 112 | Food Quality & Micronutrient Diversity Score | `mrx.tool.112-food-quality-micronutrient-diversity-score` | Nutrition | PARTIAL | rich-output | 2 | Y | Y | Y | Y | SCHEMA_NOT_STRICT, NO_ARIA, NO_MAIN_LANDMARK, NO_VISUAL | B6 |
| 113 | AI Grocery Basket & Meal Cost Optimizer | `mrx.tool.113-ai-grocery-basket-meal-cost-optimizer` | Nutrition | PARTIAL | rich-output | 1 | Y | Y | Y | Y | ENGINE_NO_FUNCTION, NO_GOLDEN_CASE, SCHEMA_NOT_STRICT, NO_ARIA | B6 |
| 114 | Restaurant Macro Navigator & Fast-Food Estimator | `mrx.tool.114-restaurant-macro-navigator` | Nutrition | PARTIAL | rich-output | 1 | Y | Y | Y | Y | NO_GOLDEN_CASE, NO_ARIA, NO_MAIN_LANDMARK, NO_VISUAL | B7 |
| 115 | Supplement Evidence & Bio-Stack Navigator | `mrx.tool.115-supplement-evidence-bio-stack-navigator` | Nutrition | PARTIAL | rich-output | 0 | Y | Y | Y | Y | NO_TESTS, SCHEMA_NOT_STRICT, NO_ARIA, NO_MAIN_LANDMARK | B7 |
| 116 | Nutrition Gap & Fasting Window Optimizer | `mrx.tool.116-nutrition-gap-fasting-window-optimizer` | Nutrition | PARTIAL | rich-output | 0 | Y | Y | Y | Y | NO_TESTS, SCHEMA_NOT_STRICT, NO_ARIA, NO_MAIN_LANDMARK | B7 |
| 117 | Intra-Workout Nutrient Volumizer & Transport Engine | `mrx.tool.117-intra-workout-nutrient-volumizer` | Nutrition | PARTIAL | rich-output | 1 | Y | Y | Y | Y | NO_GOLDEN_CASE, SCHEMA_NOT_STRICT, NO_ARIA, NO_MAIN_LANDMARK | B8 |
| 118 | CNS Recovery Score | `mrx.tool.118-cns-recovery-score` | Training & Recovery | PARTIAL | rich-output | 1 | Y | Y | Y | Y | NO_ARIA, NO_MAIN_LANDMARK, NO_VISUAL | B9 |
| 119 | Training Volume Load & Hypertrophy Index | `mrx.tool.119-training-volume-hypertrophy-index` | Training & Recovery | PARTIAL | rich-output | 0 | Y | Y | Y | Y | NO_TESTS, NO_ARIA, NO_MAIN_LANDMARK, NO_VISUAL | B10 |
| 120 | Progressive Overload & Adaptive Reserve Capacity Predictor | `mrx.tool.120-progressive-overload-predictor` | Training & Recovery | PARTIAL | rich-output | 1 | Y | Y | Y | Y | ENGINE_NO_FUNCTION, NO_GOLDEN_CASE, NO_ARIA, NO_MAIN_LANDMARK | B10 |
| 121 | Muscle Group Recovery Time-Course Modeler | `mrx.tool.121-muscle-group-recovery-modeler` | Training & Recovery | PARTIAL | rich-output | 0 | Y | Y | Y | Y | ENGINE_NO_FUNCTION, NO_TESTS, NO_ARIA, NO_MAIN_LANDMARK | B10 |
| 122 | RPE / RIR to 1RM Dynamic Velocity Modeler | `mrx.tool.122-rpe-rir-1rm-velocity-modeler` | Training & Recovery | PARTIAL | rich-output | 2 | Y | Y | Y | Y | ENGINE_NO_FUNCTION, NO_GOLDEN_CASE, NO_ARIA, NO_MAIN_LANDMARK | B11 |
| 123 | Joint Stress & Connective Tissue Load Risk Index | `mrx.tool.123-joint-stress-connective-tissue-index` | Training & Recovery | PARTIAL | rich-output | 0 | Y | Y | Y | Y | ENGINE_NO_FUNCTION, NO_TESTS, NO_ARIA, NO_MAIN_LANDMARK | B11 |
| 124 | Deload Frequency & Fatigue Accumulation Modeler | `mrx.tool.124-deload-frequency-fatigue-modeler` | Training & Recovery | PARTIAL | rich-output | 0 | Y | Y | Y | Y | ENGINE_NO_FUNCTION, NO_TESTS, NO_ARIA, NO_MAIN_LANDMARK | B11 |
| 125 | Fiber Type Adaptation & Mechanical Tension Score | `mrx.tool.125-fiber-type-mechanical-tension-score` | Training & Recovery | PARTIAL | rich-output | 0 | Y | Y | Y | Y | ENGINE_NO_FUNCTION, NO_TESTS, NO_ARIA, NO_MAIN_LANDMARK | B12 |
| named | Body Mass Index Calculator | `mrx.tool.bmi` | Body Composition | PASS | rich-output | 8 | — | Y | Y | — | NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B1 |
| named | One-Rep Max Estimator | `mrx.tool.one-rep-max` | Training & Recovery | PARTIAL | numeric-minimal | 3 | — | Y | — | — | NO_I18N_JSON, NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B70 |
| named | Strength Standards | `mrx.tool.strength-standards` | Training & Recovery | PARTIAL | numeric-minimal | 3 | — | Y | — | — | NO_I18N_JSON, NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B70 |
| named | Training Rest Timer | `mrx.tool.rest-timer` | Training & Recovery | PARTIAL | numeric-minimal | 3 | — | Y | — | — | NO_I18N_JSON, NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B71 |
| named | BMR / TDEE Calculator | `mrx.tool.bmr-tdee` | Nutrition | PARTIAL | numeric-minimal | 2 | — | Y | Y | — | NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B63 |
| named | Protein Needs Estimate | `mrx.tool.protein-needs` | Nutrition | PASS | rich-output | 7 | — | Y | Y | — | NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B1 |
| named | Daily Water Intake Estimate | `mrx.tool.water-intake` | Nutrition | PASS | rich-output | 7 | — | Y | Y | — | NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B1 |
| 126 | Neuromuscular Performance & Explosiveness Modeler | `mrx.tool.126-neuromuscular-explosiveness-modeler` | Training & Recovery | PARTIAL | rich-output | 4 | — | Y | Y | Y | NO_I18N_JSON, NO_VISUAL | B12 |
| 127 | AI Daily Readiness & Cause Explainer Engine | `mrx.tool.127-ai-daily-readiness-explainer` | Training & Recovery | PARTIAL | rich-output | 1 | — | — | Y | Y | NO_GOLDEN_CASE, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_SOURCE_PROVENANCE | B12 |
| 128 | Training Load Balance & Acute-to-Chronic Ratio | `mrx.tool.128-training-load-acute-chronic-ratio` | Training & Recovery | PARTIAL | rich-output | 2 | — | — | Y | Y | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_SOURCE_PROVENANCE, NO_VISUAL | B13 |
| 129 | AI Adaptive Training Program Planner | `mrx.tool.129-ai-adaptive-training-planner` | Training & Recovery | PARTIAL | rich-output | 1 | — | — | Y | Y | NO_GOLDEN_CASE, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_SOURCE_PROVENANCE | B13 |
| 130 | AI Plateau Detective & Stagnation Analyzer | `mrx.tool.130-ai-plateau-detective` | Training & Recovery | PARTIAL | rich-output | 1 | — | Y | Y | Y | NO_GOLDEN_CASE, NO_I18N_JSON, NO_SOURCE_PROVENANCE, NO_VISUAL | B13 |
| 131 | Body Transformation Scenario Calculator | `mrx.tool.131-transformation-forecast-trajectory-engine` | Body Composition | PARTIAL | rich-output | 2 | — | Y | Y | Y | NO_I18N_JSON, NO_SOURCE_PROVENANCE, NO_VISUAL | B3 |
| 132 | AI Pose & Exercise Form Coach | `mrx.tool.132-ai-pose-form-coach` | Training & Recovery | BLOCKED | planned | 0 | — | — | — | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | — |
| 133 | Rep Tempo & Velocity Loss Analyzer | `mrx.tool.133-rep-tempo-velocity-loss-analyzer` | Training & Recovery | PARTIAL | rich-output | 2 | — | Y | Y | Y | NO_I18N_JSON, NO_SOURCE_PROVENANCE, NO_VISUAL | B14 |
| 134 | Side-to-side Movement Screening Comparison | `mrx.tool.134-mobility-movement-symmetry-screen` | Training & Recovery | PARTIAL | rich-output | 0 | — | — | Y | Y | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_SOURCE_PROVENANCE | B14 |
| 135 | Rule-based Exercise Substitution Options | `mrx.tool.135-exercise-substitution-ai` | Training & Recovery | PARTIAL | rich-output | 0 | — | — | Y | Y | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_SOURCE_PROVENANCE | B14 |
| 136 | Physique Circumference Ratio Comparison | `mrx.tool.136-physique-golden-ratio-score` | Body Composition | PARTIAL | rich-output | 2 | — | Y | Y | Y | NO_I18N_JSON, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT, NO_VISUAL | B4 |
| 137 | Peptide & Hormone Reconstitution Calculator | `mrx.tool.137-peptide-hormone-reconstitution-calculator` | Injection & Formulation | BLOCKED | planned | 0 | — | — | — | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | — |
| 138 | Raw Powder Density & Oil Formulation Engine | `mrx.tool.138-raw-powder-density-oil-formulation-engine` | Injection & Formulation | BLOCKED | planned | 0 | — | — | — | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | — |
| 139 | Solvent & Emulsifier Ratio Calculator (BA/BB) | `mrx.tool.139-solvent-emulsifier-ratio-calculator` | Injection & Formulation | BLOCKED | planned | 0 | — | — | — | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | — |
| 140 | Lab Result Unit Converter | `mrx.tool.140-dosage-unit-conversion-engine` | Pharmacokinetics | PARTIAL | rich-output | 2 | — | — | Y | Y | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, SCHEMA_NOT_STRICT, NO_VISUAL | B8 |
| 141 | Ideal Circular-Tube Pressure Drop Calculator | `mrx.tool.141-carrier-oil-viscosity-syringe-pressure` | Injection & Formulation | PARTIAL | standard | 2 | — | Y | — | — | NO_I18N_JSON, NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B28 |
| 142 | Mass Arithmetic from a User-Provided Assay | `mrx.tool.142-compound-purity-active-yield-estimator` | Injection & Formulation | PARTIAL | standard | 2 | — | Y | Y | — | NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_VISUAL | B28 |
| 143 | Product Storage Label & Temperature Record Checker | `mrx.tool.143-storage-stability-thermal-degradation-estimator` | Injection & Formulation | PARTIAL | rich-output | 2 | — | Y | Y | Y | NO_GOLDEN_CASE, NO_I18N_JSON, SCHEMA_NOT_STRICT, TITLE_SCOPE_MISMATCH | B5 |
| 144 | General Mass, Volume & Density Calculator | `mrx.tool.144-homebrew-chemistry-calculator` | Measurement Conversion | PARTIAL | rich-output | 2 | — | Y | Y | Y | NO_I18N_JSON, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT, NO_VISUAL | B5 |
| 145 | Weekly Habit Consistency Tracker | `mrx.tool.145-habit-intelligence-consistency-coach` | Platform AI | PARTIAL | rich-output | 2 | — | — | Y | Y | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_SOURCE_PROVENANCE, SCHEMA_NOT_STRICT | B9 |
| 146 | Emergency Warning Signs Checklist | `mrx.tool.146-ai-safety-gate-emergency-protocol` | Platform AI | PARTIAL | rich-output | 3 | — | — | Y | Y | NO_GOLDEN_CASE, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_VISUAL | B9 |
| 147 | Scientific Evidence Explorer & Citation Search | `mrx.tool.147-scientific-evidence-explorer` | Platform AI | PARTIAL | standard | 2 | Y | — | Y | — | NO_GOLDEN_CASE, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_MAIN_LANDMARK | B48 |
| 148 | Session-only Personal Fitness Context | `mrx.tool.148-personal-fitness-memory-layer` | Platform AI | PARTIAL | standard | 2 | — | Y | — | — | NO_GOLDEN_CASE, NO_I18N_JSON, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B49 |
| 149 | Physique Trajectory Scenario Simulator | `mrx.tool.149-physique-trajectory-simulator` | Body Composition | PARTIAL | rich-output | 2 | — | Y | Y | Y | NO_I18N_JSON, NO_SOURCE_PROVENANCE, NO_VISUAL | B4 |
| 150 | Manual Performance Results Organizer | `mrx.tool.150-ai-performance-command-center` | Platform AI | PARTIAL | standard | 2 | — | — | Y | — | NO_GOLDEN_CASE, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B49 |
| 236 | Restaurant Menu Label Calculator | `mrx.tool.236-restaurant-macro-navigator` | AI Nutrition Vision | PARTIAL | standard | 2 | — | — | Y | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_VISUAL | B17 |
| 237 | Intra-Workout Product Label Calculator | `mrx.tool.237-intra-workout-volumizer` | AI Nutrition Vision | PARTIAL | numeric-minimal | 0 | — | Y | Y | — | NO_TESTS, NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_VISUAL | B51 |
| 238 | Fiber-Related Performance Observation Log | `mrx.tool.238-fiber-type-adaptation-score` | Contest Prep | PARTIAL | standard | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B18 |
| 239 | Peptide Product Label Reference Record | `mrx.tool.239-peptide-reconstitution` | Homebrew Chemistry | PARTIAL | standard | 0 | — | — | — | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B20 |
| 240 | Measured Sample Density Calculator | `mrx.tool.240-raw-powder-density-engine` | Homebrew Chemistry | PARTIAL | numeric-minimal | 0 | — | Y | — | — | NO_TESTS, NO_I18N_JSON, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B54 |
| 241 | Generic Mathematical Ratio Calculator | `mrx.tool.241-solvent-ratio` | Homebrew Chemistry | PARTIAL | numeric-minimal | 2 | — | — | Y | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B55 |
| 242 | General Measurement Unit Converter | `mrx.tool.242-dosage-unit-conversion-engine` | Homebrew Chemistry | PARTIAL | numeric-minimal | 0 | — | Y | Y | — | NO_TESTS, NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_MAIN_LANDMARK | B55 |
| 243 | Carrier Oil Observation Log | `mrx.tool.243-carrier-oil-viscosity-estimator` | Homebrew Chemistry | PARTIAL | standard | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B21 |
| 244 | Generic Input/Output Ratio Calculator | `mrx.tool.244-purity-yield-estimator` | Homebrew Chemistry | PARTIAL | numeric-minimal | 0 | — | — | — | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B55 |
| 245 | Storage Observation Log | `mrx.tool.245-storage-stability-estimator` | Homebrew Chemistry | PARTIAL | standard | 0 | — | — | — | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B21 |
| 248 | Emergency Warning Checklist | `mrx.tool.248-safety-gate-emergency-protocol` | AI Behavior | PARTIAL | standard | 0 | — | — | — | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B15 |
| 249 | Scientific Evidence Explorer | `mrx.tool.249-scientific-evidence-explorer` | AI Behavior | PARTIAL | standard | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B15 |
| 251 | Physique Scenario Simulator | `mrx.tool.251-physique-trajectory-simulator` | AI Behavior | PARTIAL | standard | 1 | — | Y | Y | — | NO_GOLDEN_CASE, NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B16 |
| 246 | Chemistry Observation Log | `mrx.tool.246-homebrew-chemistry` | Homebrew Chemistry | PARTIAL | standard | 2 | — | — | — | — | NO_GOLDEN_CASE, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B21 |
| 247 | Habit Check-in Log | `mrx.tool.247-habit-intelligence-coach` | AI Behavior | PARTIAL | standard | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B15 |
| 250 | Session-Only Fitness Notes | `mrx.tool.250-personal-fitness-memory-layer` | AI Behavior | PARTIAL | standard | 0 | — | — | — | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B16 |
| 252 | Manual Context Board | `mrx.tool.252-command-center` | AI Behavior | PARTIAL | standard | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B16 |
| 151 | Accumulation Half-Life Simulator | `mrx.tool.151-accumulation-half-life-simulator` | Pharmacokinetics | PARTIAL | numeric-minimal | 3 | — | — | Y | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B65 |
| 152 | Side-Effect Observation Log | `mrx.tool.152-side-effect-tracker` | Reproductive Wellbeing | PARTIAL | standard | 2 | — | — | Y | — | NO_GOLDEN_CASE, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B50 |
| 153 | Injection Site Observation Log | `mrx.tool.153-injection-site-rotator` | Pharmacokinetics | PARTIAL | standard | 1 | — | — | Y | — | NO_GOLDEN_CASE, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B46 |
| 154 | Compound Observation Record | `mrx.tool.154-compound-stack-builder` | Pharmacokinetics | PARTIAL | standard | 1 | — | — | — | — | NO_GOLDEN_CASE, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B46 |
| 155 | Progress Observation Log | `mrx.tool.155-progress-tracker` | Reproductive Wellbeing | PARTIAL | numeric-minimal | 1 | — | — | — | — | NO_GOLDEN_CASE, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B70 |
| 156 | Water Weight Observation | `mrx.tool.156-water-retention` | Pharmacokinetics | PARTIAL | numeric-minimal | 2 | — | Y | — | — | NO_I18N_JSON, NO_NARRATIVE, AI_NO_RESULT_CONTEXT, NO_VISUAL | B65 |
| 157 | Multi-Compound Half-Life Calculator | `mrx.tool.157-multi-compound-half-life` | Pharmacokinetics | PARTIAL | numeric-minimal | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B65 |
| 158 | Volume Measurement Ratio | `mrx.tool.158-volume-measurement` | Pharmacokinetics | PARTIAL | numeric-minimal | 0 | — | Y | — | — | NO_TESTS, NO_I18N_JSON, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B66 |
| 159 | Half-Life Decay Scenario | `mrx.tool.159-compound-half-life-stacker` | Pharmacokinetics | PARTIAL | numeric-minimal | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B66 |
| 160 | Illustrative Measurement Index | `mrx.tool.160-genetic-potential` | Body Composition | PARTIAL | numeric-minimal | 0 | — | Y | Y | — | NO_TESTS, NO_I18N_JSON, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B52 |
| 161 | Peptide Note Record | `mrx.tool.161-peptide-protocol-planner` | Pharmacokinetics | PARTIAL | standard | 2 | — | — | Y | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT, NO_SOURCE_PROVENANCE | B46 |
| 162 | Oral Cycle Note Record | `mrx.tool.162-oral-cycle-planner` | Pharmacokinetics | PARTIAL | standard | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B47 |
| 163 | Value Comparison | `mrx.tool.163-trt-optimization-engine` | Pharmacokinetics | PARTIAL | numeric-minimal | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B66 |
| 164 | Lab Observation Record | `mrx.tool.164-post-cycle-bloodwork-interpreter` | Pharmacokinetics | PARTIAL | numeric-minimal | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B67 |
| 165 | Interaction Item Record | `mrx.tool.165-drug-interaction-checker-pro` | Pharmacokinetics | PARTIAL | standard | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B47 |
| 166 | Pain Note Record | `mrx.tool.166-injection-pain-minimizer` | Pharmacokinetics | PARTIAL | standard | 2 | — | — | — | — | NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE, AI_NO_RESULT_CONTEXT | B47 |
| 167 | Generic Unit Conversion | `mrx.tool.167-ester-conversion` | Pharmacokinetics | PARTIAL | numeric-minimal | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B67 |
| 168 | Item List Record | `mrx.tool.168-compound-stacking-synergy` | Pharmacokinetics | PARTIAL | standard | 0 | — | — | — | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B48 |
| 169 | User-Selected Signal Checklist | `mrx.tool.169-side-effect-early-warning` | Pharmacokinetics | PARTIAL | standard | 0 | — | — | — | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B48 |
| 170 | Cost Sum Calculator | `mrx.tool.170-cycle-cost` | Pharmacokinetics | PARTIAL | numeric-minimal | 0 | — | — | Y | — | NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, AI_NO_RESULT_CONTEXT | B67 |
| 171 | Interval Record | `mrx.tool.171-cycle-length-optimizer` | Pharmacokinetics | FAIL | record-only | 1 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B81 |
| 172 | Value Delta | `mrx.tool.172-bloodwork-trend-analyzer` | Pharmacokinetics | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B82 |
| 173 | Decay Scenario | `mrx.tool.173-compound-clearance` | Pharmacokinetics | PARTIAL | numeric-minimal | 0 | — | — | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B68 |
| 174 | Unit Conversion | `mrx.tool.174-hormone-conversion` | Pharmacokinetics | PARTIAL | numeric-minimal | 0 | — | — | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B68 |
| 175 | Date Record | `mrx.tool.175-injection-schedule-planner` | Pharmacokinetics | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B82 |
| 176 | Symptom Note Record | `mrx.tool.176-side-effect-probability` | Pharmacokinetics | FAIL | record-only | 1 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, NO_I18N_JSON | B82 |
| 177 | Compatibility Item Record | `mrx.tool.177-stack-compatibility-checker` | Pharmacokinetics | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B83 |
| 178 | DHT Observation Record | `mrx.tool.178-dht-side-effect-predictor` | Reproductive Wellbeing | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B84 |
| 179 | Break Date Record | `mrx.tool.179-cycle-break-planner` | Reproductive Wellbeing | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B85 |
| 180 | TRT Note Record | `mrx.tool.180-trt-lifetime` | Reproductive Wellbeing | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B85 |
| 181 | Fertility Note Record | `mrx.tool.181-fertility-preservation-guide` | Reproductive Wellbeing | FAIL | record-only | 1 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B85 |
| 182 | Cardiovascular Note Record | `mrx.tool.182-cardiovascular-risk-assessor` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B74 |
| 183 | Bone Note Record | `mrx.tool.183-bone-density-optimizer` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B74 |
| 184 | Mood Note Record | `mrx.tool.184-mental-health-monitor` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B75 |
| 185 | Generic Amount Arithmetic | `mrx.tool.185-peptide-dosage` | Pharmacokinetics | PARTIAL | numeric-minimal | 0 | — | — | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B68 |
| 186 | GH Note Record | `mrx.tool.186-growth-hormone-protocol-planner` | Medical Monitoring | FAIL | record-only | 1 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B75 |
| 187 | Generic Unit Arithmetic | `mrx.tool.187-insulin-conversion` | Medical Monitoring | PARTIAL | numeric-minimal | 0 | — | — | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B60 |
| 188 | Glucose Observation Log | `mrx.tool.188-glucose-tracker` | Medical Monitoring | PARTIAL | numeric-minimal | 0 | — | — | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B61 |
| 189 | Androgen Item Record | `mrx.tool.189-androgenic-balance` | Pharmacokinetics | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B83 |
| 190 | Receptor Note Record | `mrx.tool.190-androgen-receptor-optimizer` | Pharmacokinetics | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B83 |
| 191 | Generic Unit Arithmetic | `mrx.tool.191-5-alpha-conversion` | Pharmacokinetics | PARTIAL | numeric-minimal | 1 | — | — | — | — | RAW_JSON_PRIMARY_OUTPUT, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT, NO_NARRATIVE | B69 |
| 192 | Hair Observation Log | `mrx.tool.192-hair-loss-tracker` | Reproductive Wellbeing | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B86 |
| 193 | Prostate Data Record | `mrx.tool.193-prostate-health-manager` | Medical Monitoring | PARTIAL | numeric-minimal | 0 | — | — | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B61 |
| 194 | Suppression Note Record | `mrx.tool.194-testicular-suppression` | Reproductive Wellbeing | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B86 |
| 195 | Fertility Note Record | `mrx.tool.195-sperm-production-optimizer` | Reproductive Wellbeing | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B86 |
| 196 | Estrogen Note Record | `mrx.tool.196-estrogen-sensitivity-manager` | Reproductive Wellbeing | FAIL | record-only | 1 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, NO_I18N_JSON | B87 |
| 197 | Observation Log | `mrx.tool.197-gynecomastia-tracker` | Reproductive Wellbeing | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B87 |
| 198 | Note Record | `mrx.tool.198-detoxification-optimizer` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B75 |
| 199 | Value Record | `mrx.tool.199-oxidative-stress` | Medical Monitoring | PARTIAL | numeric-minimal | 0 | — | — | — | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B61 |
| 200 | Item Record | `mrx.tool.200-antioxidant-manager` | Medical Monitoring | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B76 |
| 201 | Inflammation Note Record | `mrx.tool.201-systemic-inflammation` | Medical Monitoring | FAIL | record-only | 1 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, NO_I18N_JSON | B76 |
| 202 | Immune Note Record | `mrx.tool.202-immune-system-optimizer` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B76 |
| 203 | Arterial Note Record | `mrx.tool.203-arterial-health-manager` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B77 |
| 204 | Viscosity Value Record | `mrx.tool.204-blood-viscosity` | Medical Monitoring | PARTIAL | numeric-minimal | 0 | — | — | — | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B62 |
| 205 | Nitric Oxide Note Record | `mrx.tool.205-nitric-oxide-optimizer` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B77 |
| 206 | Endothelial Note Record | `mrx.tool.206-endothelial-health-manager` | Medical Monitoring | FAIL | record-only | 1 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, NO_I18N_JSON | B77 |
| 207 | Metabolism Value Record | `mrx.tool.207-fat-metabolism` | Medical Monitoring | PARTIAL | numeric-minimal | 0 | — | — | — | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B62 |
| 208 | Mitochondrial Note Record | `mrx.tool.208-mitochondrial-optimizer` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B78 |
| 209 | Cellular Value Record | `mrx.tool.209-cellular-aging` | Medical Monitoring | PARTIAL | numeric-minimal | 0 | — | — | — | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B62 |
| 210 | Telomere Note Record | `mrx.tool.210-telomere-manager` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B78 |
| 211 | Anti-Aging Note Record | `mrx.tool.211-anti-aging-inflammation` | Medical Monitoring | FAIL | record-only | 1 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, NO_I18N_JSON | B78 |
| 212 | Cognitive Note Record | `mrx.tool.212-cognitive-enhancer` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B79 |
| 213 | Stress Note Record | `mrx.tool.213-cortisol-stress` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B79 |
| 214 | Mood Record | `mrx.tool.214-mood-optimizer` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B79 |
| 215 | Dopamine Note Record | `mrx.tool.215-dopamine-tracker` | Medical Monitoring | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B80 |
| 216 | Serotonin Note Record | `mrx.tool.216-serotonin-manager` | Medical Monitoring | FAIL | record-only | 1 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B80 |
| 217 | Hormone Note Record | `mrx.tool.217-female-hormone-balance` | Reproductive Wellbeing | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B87 |
| 218 | Health Note Record | `mrx.tool.218-female-health-optimizer` | Reproductive Wellbeing | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B88 |
| 219 | Generic Arithmetic | `mrx.tool.219-female-dosage` | Measurement Conversion | PARTIAL | numeric-minimal | 0 | — | — | Y | — | RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON, NO_GLOBAL_MEASUREMENT | B59 |
| 220 | Date Record | `mrx.tool.220-menstrual-cycle-manager` | Reproductive Wellbeing | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B88 |
| 221 | Pregnancy Note Record | `mrx.tool.221-pregnancy-risk` | Reproductive Wellbeing | FAIL | record-only | 1 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, NO_I18N_JSON | B88 |
| 222 | Skin Note Record | `mrx.tool.222-skin-health-optimizer` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B80 |
| 223 | Hair and Nail Log | `mrx.tool.223-hair-nail-tracker` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B81 |
| 224 | Digestive Note Record | `mrx.tool.224-digestive-health-optimizer` | Medical Monitoring | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B81 |
| 225 | User Entry Aggregator | `mrx.tool.225-comprehensive-report-generator` | AI Nutrition Vision | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B71 |
| 226 | Transition Note Record | `mrx.tool.226-sarm-to-aas-transition-predictor` | Pharmacokinetics | FAIL | record-only | 1 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, NO_I18N_JSON | B84 |
| 227 | Route Note Record | `mrx.tool.227-subq-vs-im-pk-modeler` | Pharmacokinetics | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B84 |
| 228 | Data Record | `mrx.tool.228-health-data-fusion-hub` | AI Nutrition Vision | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B71 |
| 229 | Carbohydrate Note Record | `mrx.tool.229-glycogen-supercompensation-modeler` | Contest Prep | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B73 |
| 230 | Peak Week Note Record | `mrx.tool.230-peak-week-manipulator` | Contest Prep | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B74 |
| 231 | Body Reference Record | `mrx.tool.231-body-composition-vision-engine` | AI Nutrition Vision | FAIL | record-only | 1 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_GOLDEN_CASE, NO_I18N_JSON | B72 |
| 232 | Meal Description Record | `mrx.tool.232-meal-vision-scanner` | AI Nutrition Vision | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B72 |
| 233 | Food List Record | `mrx.tool.233-food-substitution-engine` | AI Nutrition Vision | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B72 |
| 234 | Food Note Record | `mrx.tool.234-food-quality-score` | AI Nutrition Vision | FAIL | record-only | 0 | — | — | — | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B73 |
| 235 | Basket Record | `mrx.tool.235-grocery-basket-optimizer` | AI Nutrition Vision | FAIL | record-only | 0 | — | — | Y | — | RECORD_ONLY, RAW_JSON_PRIMARY_OUTPUT, NO_TESTS, NO_I18N_JSON | B73 |

## 7. Risk register

| Risk | Severity | Evidence | Required control |
|---|---|---|---|
| Unsafe aromatase-inhibitor advice reaches users | Critical | tool-010 L105/L141/L142 | Remove advice before Batch 2; add safety regression test; owner review |
| Formula changes without an approved source | Critical | 020/030/100/106 confirmed; 252 tools NOT RUN | Source + version + golden case before any change |
| Record-only tools misrepresent capability | High | 53 tools; tool-200/235 | Owner decision: relabel as records or authorize rebuild |
| Unit switching without rescaling | High | 138 tools no measurement; only 8 sliders | Field-level canonical/display metadata + round-trip tests |
| English leakage in Arabic mode | High | SafetyNotice L24/L27; breadcrumb L72/L74; 142 no i18n JSON | Shared locale contract + per-tool locale matrix |
| AI overrides or invents numbers | High | 34 publish findings; 230 result-blind | Engine-authoritative contract; deterministic fallback; no-advice test |
| Untested boundary values (NaN/Infinity) | Medium | 10 no finite guard; 85 non-strict | Strict schemas + boundary tests |
| Accessibility regression | Medium | 204 no `<main>`; 166 no ARIA | Shared primitives + axe gate per batch |
| Catalog/registry identity drift | Medium | 4 toolId mismatches | Resolve by compatibility alias, not renumbering |
| Full suite treated as green | High | 17 failures | Keep the known-failure baseline in every report |

## 8. Rollout gates and owner decisions

**Gate 0 (now).** R5 final owner acceptance. Until it is recorded, Batch 2 and all code changes are blocked.

**Gate 1 (before Batch 2).** Safety remediation plan for tool-010 and formula remediation plan for 020/030/100/106 approved. No source, no formula change.

**Gate 2 (per batch).** Implementation report, tests, live preview, language/measurement matrix, accessibility check and explicit owner approval before the next batch.

**Gate 3 (record-only).** Owner decides record vs calculator for all 53; calculators require a validated source and a new engine, not a renamed BMI equation.

**Gate 4 (planned tools).** Build authorization for 132/137/138/139, including category routes and schemas.

## 9. Deliverables and evidence

| Document | Purpose |
|---|---|
| `R5_255_TOOL_COMPREHENSIVE_AUDIT_AND_ROLLOUT_MATRIX.md` | this inventory, findings and 268-row matrix |
| `R5_255_TOOL_PER_TOOL_DOSSIERS.md` + `R5_255_TOOL_DOSSIERS/` | per-tool strengths, gaps, formula status and 10 proposals |
| `R5_255_TOOL_EXECUTION_PLAN.md` | 88 batches of ≤3 tools, gates and definition of done |
| `R5_RESULT_NARRATIVE_AND_PERSONALIZATION_AUDIT.md` | result/report capability |
| `R5_FORMULA_INTELLIGENCE_AND_REFERENCE_AUDIT.md` | formula evidence and verification protocol |
| `R5_GLOBAL_HEADER_LANGUAGE_MEASUREMENT_AUDIT.md` | language/measurement state flow |
| `R5_DYNAMIC_INPUT_SLIDER_CROSS_TOOL_TEST_REPORT.md` | slider suitability and R5 runtime evidence |
| `R5_255_TOOL_HISTORY_AND_REQUIREMENTS_TRACEABILITY.md` | chronological decisions and requirement status |
| `R5_FIRST_BATCH_CORRECTION_AND_REMEDIATION_REPORT.md` | what R5 fixed |
| `R5_FIRST_BATCH_FINAL_PREVIEW_AND_ACCEPTANCE_REPORT.md` | acceptance checklist (pending owner) |
| `R5_255_TOOL_AUDIT_EVIDENCE.json` | machine-readable inventory and evidence |

**Primary evidence commands:**

- `node C:\Users\foryo\AppData\Local\Temp\opencode\r5-analyze.js` → `r5-audit.json` (268 entries; counts above).
- `Get-FileHash docs\...\MRX_GI_MASTER_EXECUTION_PROMPT.md -Algorithm SHA256` → `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`.
- `git rev-parse HEAD` → `108d3063bdcbca9604ad9b7b48844b85763d51a0`.
- `npx vitest run` (recorded R5 full suite) → 559 files, 17 failed / 5235 passed / 5 skipped. **Not green.**
- Lighthouse 12.2.1 accessibility → BMI 1.00, Protein 1.00, Water 1.00; zero failing axe audits.

**Hard boundary:** no Batch 2 work begins before the owner records R5 acceptance. Batch 2 is BLOCKED until explicit final owner acceptance of R5.
