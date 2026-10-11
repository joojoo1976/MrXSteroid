# Acceptance Matrix — SmartTools Master Session (2026-10-10 → 2026-10-11)

Scope: user directive (phases A–F) on top of SMARTTOOLS_SPEC.md. Baseline: `main` @ 6a84b3d.
Final tree: 062528d (batch #051–#055) + 01a3d82 (roadmap #051–#150 registration) + 1cfd356 (matrix/ledger) + 0aa2b40 (batch #046–#050) + cf3180f (batch #041–#045) + e1d9762 (AI) + 374a923 (batch #031–#040) + 572409c (docs) + 88f1bd3 (matrix).

## Governing sources
- `2gpt MASTER v3.0` + "second merge list": **NOT FOUND** in repo or git history (Phase A audit). Work governed by SMARTTOOLS_SPEC.md + user directive (rule 4: document blocker, continue).

## Phase matrix

| Phase | Requirement | Status | Evidence |
|---|---|---|---|
| A | Audit before work | **PASS** | docs/superpowers/audits/2026-10-10-master-phaseA-audit.md (git state, test state, 88-file inventory, blockers) |
| B1 | PAGE_TO_PATH completeness | **PASS** | tests/unit/legacyRoutes.test.ts 3/3 (RED→GREEN; 5 keys added) |
| B2 | Complete truncated component 036 | **PASS** | tsc EXIT=0; full JSX rebuilt per 031 pattern |
| B3 | Remove generator artifacts from schemas 036–040 | **PASS** | tests/unit/schemasClean.test.ts 2/2; grep proves 0 backtick artifacts |
| B3+ | Restore accidentally deleted engine symbol | **PASS** | SideEffectRiskResultSchema restored; engines 031–040 16 files/140 tests ✓ |
| B4 | Components 037–040 + i18n | **PASS** | 4 components + AR/EN JSONs; tsc green; eslint clean |
| B5 | Flip catalog6 #036–#040 → implemented | **PASS** | smartToolsCatalog.test counts (now 50/0 after batch #046-#050); all leak tests ✓ |
| B6 | planned never leaks into user-facing views | **PASS** | getPublishedCatalogTools/getPublishedToolsByCategory consumed by category page, sitemap, [tool] page (params+metadata+render); planned queue now empty (50/0) — guard stays conditional |
| B7 | Adapter envelope tests + gates | **PASS** | tool-036-040-batch.test.ts 5/5; validateTools gate understands planned status; 5/5 |
| C | Regression #001–#030 | **PASS (SmartTools domain)** | Full vitest: 3028 passed; all 16 failures = checkout/payments, byte-identical on pristine baseline worktree C:/MrXSBaseline @ 6a84b3d (out-of-scope domain per user rule #4: no payments/auth changes) |
| D | Tools toward #150 | **PARTIAL** | Roadmap #051–#150 fully registered as planned identities (commit `01a3d82`: catalogs 7–10, TOOL_CATEGORY +100, orders num×10+160, conditional leak guards, counts 50+100=150, gates 18/18). #051–#055 shipped end-to-end (commit `062528d`: 41 files — TDD engines 15 golden tests, adapters batch 5/5, i18n AR/EN, components, 301 routes, Page/PAGE_TO_PATH/registry orders 670–710, catalog7 flip). **55 implemented / 95 planned / 150 total**; #056–#150 remain (planned queue, no fake entries) |
| E1 | Real AI + functional fallback (§11) | **PASS** | server/ai/{contracts,provider,fallback,explain}.ts + /api/smarttools/ai/explain; 12 route/runtime tests; env-driven provider (OPENAI_API_KEY/BASE_URL/MODEL), 12s timeout, credential isolation; deterministic bilingual fallback restates engine values only (test forbids invented numbers) |
| E2 | AI wired into tools | **PASS** | AIInsightPanel on hierarchical tool pages (all published tools) with explicit model/deterministic source badge + disclaimer; ai-registry slug-prefix hack replaced by real TOOL_CATEGORY (latent nameEn + broken /smarttools/tool/... routing fixed); 4 tests |
| F | Full verification + matrix | **PASS** | tsc EXIT=0; vitest 3048 pass / 16 pre-existing payments failures (baseline-proven); validate-tools 5/5; eslint clean on all touched files; next build ✓ 189 static pages incl. /api/smarttools/ai/explain |

## Key contract guards added
- tests/unit/legacyRoutes.test.ts — every Page key must exist in PAGE_TO_PATH.
- tests/unit/schemasClean.test.ts — no generator artifacts in schema files.
- tests/unit/smartToolsCatalog.test.ts — counts 45/5; planned entries have NO files; published views exclude planned; filesystem wiring for all implemented tools.
- lib/tools/validation.ts — validation gate understands the planned-status contract (planned ⇒ files must NOT exist; implemented ⇒ files must exist).
- server/ai/* — planned tools are 404 for AI explain (never explainable before launch).
- app/api/smarttools/ai/explain/route.test.ts — invalid payload 400, unknown 404, fallback determinism, no credential leakage in GET.

## Blockers / NOT RUN
- **BLOCKED (pre-existing, out of scope):** 16 checkout/payments test failures — proven identical on baseline worktree (8 checkoutCountryRouting + 8 across checkoutSessionService/createInvoiceKashier/merchantResolver/orderProducersStatus/instapayPreservationLock/paymentReceiptsAdmin). Re-confirmed byte-identical after batch #046-#050 (full-suite2 run, 2026-10-11). Payments/auth explicitly off-limits this session.
- **NOT RUN:** live-provider (CONFIRMED-LIVE) AI test — requires a real provider key; deterministic fallback fully tested instead (by design, fail-open service level).
- **NOT STARTED:** tools #051–#150 roadmap (§50 table + §ONBOARDING pattern).

## Batch #046–#050 detail (2026-10-11, commit `0aa2b40`)
| Item | Status | Evidence |
|---|---|---|
| Engines 046–050 (TDD golden) | **PASS** | RED: 5 files failed (module-not-found) → GREEN 15/15 (`tmp/green3-046-050.log`): trt-lifetime (cost horizons 7800/15600/23400 @ 40USD/300USD), fertility (impact 50 / recovery 5 w/ HCG age>28), cardio (factor-sum 23 high; max peak 53 < 60 ceiling), bone (84 optimal / 33 high-risk / clamp 0), mental-health (improving/watch, red-flag escalation, 19nor declining flag) |
| Schemas 046–050 | **PASS** | zod in/out contracts; tsc EXIT=0 |
| Adapters + batch test | **PASS** | RED (registry missing) → GREEN 5/5; canonical buildXProvenance/KeyFindings/Output; registry orders 620–660 |
| i18n AR/EN ×5 | **PASS** | i18n/tool-046..050-*.json; Arabic via write-tool (no console mojibake) |
| Components ×5 | **PASS** | draft autosave + zod + Bio-Dashboard save + prev/next + RTL/LTR; red-flag escalation banner on 050; single default-export per file (grep proven) |
| Routes 301 ×5 | **PASS** | app/smarttools/tool-046..050-*/page.tsx → toHierarchicalHref |
| Catalog flip | **PASS** | catalog6 50 implemented / 0 planned; counts test updated; published=50 |
| AI explain gate | **PASS** | planned-fixture moved to `tool-999-not-in-catalog` (published-only gate unchanged); 12/12 AI tests |
| Full suite | **PASS (SmartTools domain)** | 3048 passed / 16 payments (documented pre-existing) / 5 skipped |
| next build | **PASS** | 189 static pages (was 179) |

## Batch #051–#055 detail (2026-10-11, commit `062528d`)
| Item | Status | Evidence |
|---|---|---|
| Roadmap #051–#150 registration | **PASS** | commit `01a3d82`: catalogs 7/8/9/10 planned identities verbatim from SPEC §4 (orders 670–1660), TOOL_CATEGORY +100, counters 50+100=150, 18/18 gates — later 23/23 + 9/9 after batch |
| Engines 051–055 (TDD golden) | **PASS** | RED: 5 files failed (module-not-found) → GREEN 15/15 (`tmp/green2-051-055.log`): 051 (conc 2.5 / vol 0.15 / units 15 / doses 6, clamp <2 IU), 052 (daily=weekly/5, monthly 61 @ 14 weekly, high-dose ≥6), 053 (U-100 vol=dose/100, U-40 ×2.5 reading exposure), 054 (fasting bands 99/126, hypo <70), 055 (HOMA-IR=(G×I)/405, bands 1/1.9/2.9) |
| Golden-deviation rule applied | **PASS** | manual arithmetic fixed in tests (051 test-3 volume 0.15/units 15/doses 6; 053 U-40 goldens 8IU→0.2ml; 054 reading 20), intended behavior fixed in engine (052 ceiling `>= 6`) — deviation rule documented and applied both directions |
| Schemas 051–055 | **PASS** | zod in/out contracts; tsc EXIT=0 |
| Adapters + batch test | **PASS** | RED (module-not-found) → GREEN 5/5 (`tmp/green-adapter4.log` 8/8 incl. legacyRoutes); canonical buildXProvenance/KeyFindings/Output; registry orders 670–710; enum fix INSULIN_CONVERSION→INSULIN_CONVERSION_CALCULATOR; DataSource fix ('lab' invalid → 'device') |
| i18n AR/EN ×5 | **PASS** | i18n/tool-051..055-*.json; Arabic via write-tool (no console mojibake) |
| Components ×5 | **PASS** | draft autosave + zod + Bio-Dashboard save + prev/next + RTL/LTR + AI-context `<details>` panel (canonical 046 pattern); 054/055 rewritten complete after truncated-write catch (rule: author full content before write); 053 mismatch warning rendered as loud red banner |
| Routes 301 ×5 | **PASS** | app/smarttools/tool-051..055-*/page.tsx → toHierarchicalHref |
| Catalog flip | **PASS** | catalog7 #051–#055 planned→implemented (bookContext omitted — no chapter references invented; type optional, gate + [tool] page don't require it); counts 55/95/150; published=55 |
| AI explain gate | **PASS** | published-only gate unchanged; fixture stays `tool-999-not-in-catalog`; ai-registry tests pass |
| Full suite | **PASS (SmartTools domain)** | 3068 passed / 16 payments (documented pre-existing, byte-identical 8+1+3+1+1+1+1 across 7 files) / 5 skipped |
| next build | **PASS** | 199 static pages (was 189) |


## Batch #056–#060 detail (2026-10-11, commit `1ba881c`)
| Item | Status | Evidence |
|---|---|---|
| Engines 056–060 (TDD golden) | **PASS** | RED: 5 files failed (module-not-found) → GREEN 15/15 (`tmp/green2-056-060.log`): 056 (washout 21/14/7 +7 long-cycle, duration 28+14 @ ≥12w, start=max(0,…)), 057 (Vermeulen simplified: T 500/SHBG 30 → 93.1 pg/mL, 1.9%; bands 1.5/2.5), 058 (DHT/T 10–25 balanced; E2/T ≤0.6 balanced), 059 (score 60±: sleep+10, training 4-5 +8/>6 −8, break +12/+6, cycle>12 −10; bands 50/75), 060 (DHT=T×0.10; fin5 0.03, dut 0.01; bands 30/85; suppression 70/90) |
| Golden-deviation rule applied | **PASS** | engine fixed where test expresses intended behavior (056 `>= 12` duration; 059 partial-credit break keeps the 8-week recommendation); test goldens recomputed where hand math drifted (057 exact Vermeulen values 93.1/1.9/2.6/1.2; 058 E2/T extra ×100 caught by goldens; 060 dotted enum key `'dutasteride_0.5mg'` needed quoting) |
| Schemas 056–060 | **PASS** | zod in/out contracts; tsc EXIT=0 |
| Adapters + batch test | **PASS** | RED (module-not-found) → GREEN 5/5 (`tmp/green-adapter5.log` 8/8 incl. legacyRoutes); canonical buildXProvenance/KeyFindings/Output; registry orders 720–760; DataSource 'lab' union-invalid (055 lesson) — defaults 'manual' |
| i18n AR/EN ×5 | **PASS** | i18n/tool-056..060-*.json; Arabic via write-tool (no console mojibake) |
| Components ×5 | **PASS** | draft autosave + zod + Bio-Dashboard save + prev/next + RTL/LTR + AI-context `<details>` panel written in from the start; all five composed complete (no truncated writes this batch); stray `.keep` junk file caught and deleted |
| Routes 301 ×5 | **PASS** | app/smarttools/tool-056..060-*/page.tsx → toHierarchicalHref |
| Catalog flip | **PASS** | catalog7 #056–#060 planned→implemented; counts 60/90/150; published=60 |
| AI explain gate | **PASS** | published-only gate unchanged; ai-registry tests pass |
| Full suite | **PASS (SmartTools domain)** | 3088 passed / 16 payments (documented pre-existing) / 5 skipped |
| next build | **PASS** | 209 static pages (was 199) |

## Commits
1. `374a923` — batch #031-#040 complete + platform hardening (published gate).
2. `572409c` — superpowers docs (plan, Phase A audit, ledger).
3. `e1d9762` — AI explain service + route + tests + AI navigation fixes + panel.
4. `cf3180f` — tools #041-#045 full stack (44 files).
5. `88f1bd3` — acceptance matrix + ledger close-out (2026-10-10).
6. `0aa2b40` — tools #046-#050 full stack (2026-10-11): 50 implemented / 0 planned.
7. `1cfd356` — matrix + session ledger update for batch #046–#050.
8. `01a3d82` — roadmap #051–#150 registered as planned identities (catalogs 7–10, TOOL_CATEGORY +100).
9. `062528d` — tools #051–#055 full stack (41 files): 55 implemented / 95 planned / 150 total.
10. `20fd04b` — matrix + ledger for batch #051–#055 and roadmap registration.
11. `1ba881c` — tools #056–#060 full stack (41 files): 60 implemented / 90 planned / 150 total.
12. `10493b4` — docs: acceptance matrix + ledger for batch #056-#060 (60/90/150).
13. `204c1eb` — feat(tools): ship batch #061-#065 — TDD engines, schemas, adapters, i18n, UI, routes (65/150 implemented).
14. `ed99a10` — docs: acceptance matrix + ledger for batch #061-#065 (65/85/150).
15. `53bf333` — feat(tools): ship batch #066-#070 — TDD engines, schemas, adapters, i18n, UI, routes (70/150 implemented).
16. `79a8d51` — docs: acceptance matrix + ledger for batch #066-#070 (70/80/150).
17. `635b6a5` — feat(tools): ship batch #071-#075 — TDD engines, schemas, adapters, i18n, UI, routes (75/150 implemented).

## Batch #061–#065 detail (2026-10-11, commit `204c1eb`)
| Item | Status | Evidence |
|---|---|---|
| Engines 061–065 (TDD golden) | **PASS** | GREEN 15/15: 061 (avg shed, Norwood trend bands stable/monitor/accelerated), 062 (PSA age ceiling <40 2.0 / 40-49 2.5 / 50-59 3.5 / 60-69 4.5 / >=70 6.5, delta >0.75 rise warning), 063 (suppression baseline 40/70/90 + 5%/8wks capped 95%, recovery months), 064 (sperm score baseline 30/55/75, hcg +5, age>=40 -10, sleep +5), 065 (E2 = test × (0.15 + bf/200) × AI factor) |
| Schemas 061–065 | **PASS** | zod in/out contracts; tsc EXIT=0 |
| Adapters + batch test | **PASS** | GREEN 5/5 (`lib/tools/adapters/tool-061-065-batch.test.ts`); canonical buildXProvenance/KeyFindings/Output; registry orders 770–810 |
| i18n AR/EN ×5 | **PASS** | i18n/tool-061..065-*.json; Arabic via write-tool |
| Components ×5 | **PASS** | draft autosave + zod + Bio-Dashboard save + prev/next + RTL/LTR + AI-context `<details>` panel |
| Routes 301 ×5 | **PASS** | app/smarttools/tool-061..065-*/page.tsx → toHierarchicalHref |
| Catalog flip | **PASS** | catalog7 #061–#065 planned→implemented; counts 65/85/150; published=65 |
| Full suite | **PASS (SmartTools domain)** | 3108 passed / 16 payments (documented pre-existing baseline) / 5 skipped |
| next build | **PASS** | All routes built statically and SSR valid |

## Batch #066–#070 detail (2026-10-11, commit `53bf333`)
| Item | Status | Evidence |
|---|---|---|
| Engines 066–070 (TDD golden) | **PASS** | GREEN 15/15: 066 (symptom burden vs E2 sensitivity pattern), 067 (T:E2 physiological ratio, 14–30:1 optimal), 068 (gyno staging, subareolar mass progression, fibrosis risk), 069 (evidence-based hepatic lifestyle score, avoids detox myths), 070 (redox burden index, sleep/training/androgen/antioxidant factors) |
| Schemas 066–070 | **PASS** | zod in/out contracts; tsc EXIT=0 |
| Adapters + batch test | **PASS** | GREEN 5/5 (`lib/tools/adapters/tool-066-070-batch.test.ts`); canonical buildXProvenance/KeyFindings/Output; registry orders 820–860 |
| i18n AR/EN ×5 | **PASS** | i18n/tool-066..070-*.json; Arabic via write-tool |
| Components ×5 | **PASS** | draft autosave + zod + Bio-Dashboard save + prev/next + RTL/LTR + AI-context `<details>` panel |
| Routes 301 ×5 | **PASS** | app/smarttools/tool-066..070-*/page.tsx → toHierarchicalHref |
| Catalog flip | **PASS** | catalog7 #066–#070 planned→implemented; counts 70/80/150; published=70 |
| Full suite | **PASS (SmartTools domain)** | All tests passing (16 pre-existing baseline payment failures untouched) |
| next build | **PASS** | All 5 new routes built statically and SSR valid |

## Batch #071–#075 detail (2026-10-11, commit `635b6a5`)
| Item | Status | Evidence |
|---|---|---|
| Engines 071–075 (TDD golden) | **PASS** | GREEN 15/15: 071 (antioxidant defense score, CoQ10/polyphenols), 072 (hs-CRP, waist circ, systemic cytokine risk), 073 (25(OH)D, sleep architecture, training strain resilience), 074 (AHA/ACC BP staging, MAP & PP calculations, emergency crisis escalation), 075 (pulse pressure stiffness, TC:HDL, TG:HDL atherogenic screening) |
| Schemas 071–075 | **PASS** | zod in/out contracts; tsc EXIT=0 |
| Adapters + batch test | **PASS** | GREEN 5/5 (`lib/tools/adapters/tool-071-075-batch.test.ts`); canonical buildXProvenance/KeyFindings/Output; registry orders 870–910 |
| i18n AR/EN ×5 | **PASS** | i18n/tool-071..075-*.json; Arabic via write-tool |
| Components ×5 | **PASS** | draft autosave + zod + Bio-Dashboard save + prev/next + RTL/LTR + AI-context `<details>` panel |
| Routes 301 ×5 | **PASS** | app/smarttools/tool-071..075-*/page.tsx → toHierarchicalHref |
| Catalog flip | **PASS** | catalog7 #071–#075 planned→implemented; counts 75/75/150; published=75 |
| Full suite | **PASS (SmartTools domain)** | All tests passing (16 pre-existing baseline payment failures untouched) |
| next build | **PASS** | All 5 new routes built statically and SSR valid |
