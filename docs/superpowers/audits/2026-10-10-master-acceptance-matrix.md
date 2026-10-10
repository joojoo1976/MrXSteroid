# Acceptance Matrix — SmartTools Master Session (2026-10-10)

Scope: user directive (phases A–F) on top of SMARTTOOLS_SPEC.md. Baseline: `main` @ 6a84b3d.
Final tree: cf3180f (batch #041-#045) + e1d9762 (AI) + 374a923 (batch #031-#040) + 572409c (docs).

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
| B5 | Flip catalog6 #036–#040 → implemented | **PASS** | smartToolsCatalog.test counts 40/10 (now 45/5); all 5 leaks tests ✓ |
| B6 | planned never leaks into user-facing views | **PASS** | getPublishedCatalogTools/getPublishedToolsByCategory consumed by category page, sitemap, [tool] page (params+metadata+render); tests prove #046-#050 invisible |
| B7 | Adapter envelope tests + gates | **PASS** | tool-036-040-batch.test.ts 5/5; validateTools gate understands planned status; 5/5 |
| C | Regression #001–#030 | **PASS (SmartTools domain)** | Full vitest: 3028 passed; all 16 failures = checkout/payments, byte-identical on pristine baseline worktree C:/MrXSBaseline @ 6a84b3d (out-of-scope domain per user rule #4: no payments/auth changes) |
| D | Tools toward #150 | **PARTIAL** | #041–#045 shipped end-to-end (44 files, commit cf3180f). #046–#050 remain planned (registered, gated, invisible). #051–#150 remain per §50/§ONBOARDING — not started (documented, no fake entries) |
| E1 | Real AI + functional fallback (§11) | **PASS** | server/ai/{contracts,provider,fallback,explain}.ts + /api/smarttools/ai/explain; 12 route/runtime tests; env-driven provider (OPENAI_API_KEY/BASE_URL/MODEL), 12s timeout, credential isolation; deterministic bilingual fallback restates engine values only (test forbids invented numbers) |
| E2 | AI wired into tools | **PASS** | AIInsightPanel on hierarchical tool pages (all published tools) with explicit model/deterministic source badge + disclaimer; ai-registry slug-prefix hack replaced by real TOOL_CATEGORY (latent nameEn + broken /smarttools/tool/... routing fixed); 4 tests |
| F | Full verification + matrix | **PASS** | tsc EXIT=0; vitest 3028 pass / 16 pre-existing payments failures (baseline-proven); validate-tools 5/5; eslint clean on all touched files; next build ✓ 179 static pages incl. /api/smarttools/ai/explain |

## Key contract guards added
- tests/unit/legacyRoutes.test.ts — every Page key must exist in PAGE_TO_PATH.
- tests/unit/schemasClean.test.ts — no generator artifacts in schema files.
- tests/unit/smartToolsCatalog.test.ts — counts 45/5; planned entries have NO files; published views exclude planned; filesystem wiring for all implemented tools.
- lib/tools/validation.ts — validation gate understands the planned-status contract (planned ⇒ files must NOT exist; implemented ⇒ files must exist).
- server/ai/* — planned tools are 404 for AI explain (never explainable before launch).
- app/api/smarttools/ai/explain/route.test.ts — invalid payload 400, unknown 404, fallback determinism, no credential leakage in GET.

## Blockers / NOT RUN
- **BLOCKED (pre-existing, out of scope):** 16 checkout/payments test failures — proven identical on baseline worktree (8 checkoutCountryRouting + 8 across checkoutSessionService/createInvoiceKashier/merchantResolver/orderProducersStatus/instapayPreservationLock/paymentReceiptsAdmin). Payments/auth explicitly off-limits this session.
- **NOT RUN:** live-provider (CONFIRMED-LIVE) AI test — requires a real provider key; deterministic fallback fully tested instead (by design, fail-open service level).
- **NOT STARTED:** tools #046–#050 (registered, planned, gated) and #051–#150 roadmap.

## Commits
1. `374a923` — batch #031-#040 complete + platform hardening (published gate).
2. `572409c` — superpowers docs (plan, Phase A audit, ledger).
3. `e1d9762` — AI explain service + route + tests + AI navigation fixes + panel.
4. `cf3180f` — tools #041-#045 full stack (44 files).
