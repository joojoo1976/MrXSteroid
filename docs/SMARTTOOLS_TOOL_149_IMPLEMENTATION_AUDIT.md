# SmartTool 149 — Implementation Audit

**Audit date:** 2026-10-25 (Africa/Cairo)  
**Repository snapshot:** `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`  
**Catalog status:** `implemented`  
**Decision:** `IMPLEMENTATION CHECKS PASS; FULL-PLATFORM RELEASE NOT VERIFIED`.

## Scope and source mapping

| Requirement | Evidence | Assessment |
|---|---|---|
| Keep application identity and route; share calculation kernel with Tool 131 | Catalog: `lib/tools/smartToolsCatalog10.ts:35`; registry route: `lib/tools/registry.ts:173`; canonical category-first page: `app/smarttools/body-composition/tool-149-physique-trajectory-simulator/page.tsx:1`; flat route redirects: `app/smarttools/tool-149-physique-trajectory-simulator/page.tsx:1-5`; both engines import `lib/tools/engines/shared/physique-scenario-kernel.ts` | `PASS` by source inspection. The app ID/slug remains independent of V7 numbering. No automatic data import from Tool 131 is present. |
| Mandatory inputs and missing data | `lib/tools/engines/tool-149-physique-trajectory-simulator.v6.ts:6-42`; UI: `components/tools/tool-149-physique-trajectory-simulator.tsx:13-17,94-96` | `PASS`: current weight, current/target body-fat percentage, and at least one user-entered rate are required. Missing values yield `PARTIAL`; invalid values produce validation errors and disable calculation. |
| One to three user-entered rates, order/repeats preserved, no recommended/default rate | Engine schema and `map` at `lib/tools/engines/tool-149-physique-trajectory-simulator.v6.ts:6,69-88`; UI `components/tools/tool-149-physique-trajectory-simulator.tsx:72-88`; tests `lib/tools/engines/tool-149-physique-trajectory-simulator.v6.test.ts:31-49` | `PASS`: 1–3 rates, entered order and duplicate rates are preserved; no rate is ranked. |
| Deterministic result versus prediction | Engine output type, assumptions and disclaimer: `lib/tools/engines/tool-149-physique-trajectory-simulator.v6.ts:18-40,59-66`; bilingual formula and output: `lib/tools/adapters/tool-149-physique-trajectory-simulator.ts:13-68` | `PASS`: `CALCULATED` is described as arithmetic under constant lean mass, and duration is explicitly not a real-world prediction or promise. Infeasible/out-of-bound result returns `NOT_AVAILABLE` with a reason and no scenarios. |
| Units and header controls | `components/tools/tool-149-physique-trajectory-simulator.tsx:23-48,59-71`; shared page shell `app/smarttools/layout.tsx:26-36` | `PASS` in component contract: canonical kg, optional lb display/input conversion, body-fat percent unchanged; component uses shared header preference hooks and defines no local language or measurement toggle. Shared SmartTools layout renders header and footer. |
| No local persistence/network in arithmetic engine | `lib/tools/engines/tool-149-physique-trajectory-simulator.v6.ts` and shared kernel | `PASS` for math modules by inspection: they are deterministic schema/math code with no Supabase, fetch, storage, or date dependency. |
| Cross-tool AI explanation path | `components/tools/ToolOutputSummary.tsx:17-34,45-57`; `components/smarttools/AIInsightPanel.tsx:46-69,84-95`; `server/ai/explain.ts:28-42,58-89`; `app/api/smarttools/ai/explain/route.ts:20-49` | `PARTIAL / shared platform behavior`: result publication is in-memory; result payload is sent only after an explicit checkbox and user action. A user question is separately consent-gated when non-empty. The endpoint may call a live model and relies on its system prompt to refuse unsupported recommendations; this audit did not adversarially evaluate that shared model behavior. The calculator itself does not invoke AI. |
| Header/footer and metadata/runtime accessibility | Layout source exists; no browser, keyboard, screen-reader, contrast, mobile, authenticated-profile, or deployed-domain review was run in this audit | `PARTIAL / NOT RUN`: source establishes shared header/footer composition, not runtime visual or accessibility quality. |

## Current verification

| Exact command | Result |
|---|---|
| `npx vitest run lib/tools/engines/tool-149-physique-trajectory-simulator.v6.test.ts components/tools/tool-149-physique-trajectory-simulator.test.tsx` | **PASS**, 2 files / 17 tests, exit 0. Covers missing input, invalid/bounded values, one and three rates, duplicate/order preservation, Tool 131 shared-kernel agreement, unit/language header preferences, and `NOT_AVAILABLE`. |
| `npm run validate-tools` | **PASS**, 1 file / 5 tests, exit 0. |
| `npx vitest run --reporter=dot` | **FAIL**, exit 1: 7 files / 16 failed tests repository-wide. Payment/checkout baseline details are in `docs/MACRO_V6_ENGINE_REPORT.md`. These failures are outside Tool 149. |
| Browser/accessibility/production-domain checks | `NOT RUN`. |

## Remaining work before calling the tool fully reviewed

1. Review the shared AI explainer's behavior for Tool 149 with adversarial prompts; calculator scope must remain arithmetic-only, and explanations must not add advice or personal predictions.
2. Run browser keyboard, screen-reader, contrast, responsive, authenticated/guest, and deployed-domain checks.
3. Resolve the full-suite payment failures at their owning scope before the repository-wide release gate can pass.

The initial Tool 149 audit changed no source code, routes, registry, database, or migrations. The report does not authorize a template or a general 252-tool rollout.

## Tool-specific AI-explainer boundary follow-up — 2026-10-25

The audit found the optional shared SmartTools explainer could receive a free-form question for Tool 149. Although its shared policy already limits unsupported recommendations, the simulator's explicit scope is narrower. `server/ai/explain.ts` now appends a Tool-149-only bilingual instruction limiting the model to arithmetic, inputs, units, assumptions, and supplied results; it explicitly forbids training/nutrition/medication recommendations and health/safety/attainability judgments. Tests were added in `server/ai/explain.test.ts` for the English and Arabic policy text and a recommendation-seeking question. Existing deterministic fallback remains non-generative and does not repeat user question content.

| Exact command | Result |
|---|---|
| `npx vitest run server/ai/explain.test.ts lib/tools/engines/tool-149-physique-trajectory-simulator.v6.test.ts components/tools/tool-149-physique-trajectory-simulator.test.tsx` | **PASS**, 3 files / 26 tests, exit 0. |
| `npx tsc --noEmit` | **PASS**, exit 0, no output. |
| `npx eslint server/ai/explain.ts server/ai/explain.test.ts --no-warn-ignored` | **PASS**, exit 0, no output. |

This is defense-in-depth at the prompt-policy layer, not a guarantee that a generative model will always obey its instructions. The AI explanation remains opt-in for result submission. Adversarial runtime evaluation and browser accessibility review remain outstanding. The shared explainer files already had local worktree changes before this follow-up; those changes were preserved and not reset. No database, route, registry, migration, commit, push, or deployment action occurred.

## Current-checkout arithmetic and UI rerun — 2026-10-27

`npx vitest run lib/tools/engines/tool-149-physique-trajectory-simulator.v6.test.ts tests/unit/components/tool-149-physique-trajectory-simulator.test.tsx --reporter=dot` — **PASS / exit 0**, 2 files / 19 tests. The current test set covers missing/invalid input, one and three user-selected rates, order and duplicate preservation, Tool 131 shared-kernel output, unit/language preferences, explicit Tool 148 import, and explicit Tool 150 result sharing.

That 2026-10-27 rerun preceded the owner privacy decision and is superseded for the Tool 148→149 flow by `docs/SMARTTOOLS_TOOL_148_PRIVACY_SCOPE_REVIEW.md`'s owner-approved addendum. The current cross-tool consent, revocation, re-grant, imported-copy clearing, TypeScript, ESLint, validator, and build evidence is recorded there. Tool 149 arithmetic behavior and Tool 149→150 sharing scope remain as previously audited. Browser/accessibility and adversarial live-model checks remain outstanding; the repository-wide test gate remains failed as recorded in the Macro report.
