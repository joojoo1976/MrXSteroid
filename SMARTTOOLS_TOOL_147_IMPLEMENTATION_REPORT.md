# Tool 147 Implementation Report

**Status: READY FOR REVIEW (local implementation).** Production NCBI availability still depends on configuring the documented server environment; no live NCBI request or Upstash write was made during verification.

## Identity and scope

- App identity is unchanged: `mrx.tool.147-scientific-evidence-explorer` / `tool-147-scientific-evidence-explorer`.
- Canonical path: `/smarttools/platform-ai/tool-147-scientific-evidence-explorer`.
- V7 #249 remains a distinct identity. No alias, merge, or redirect between app #147 and V7 #249 was added.
- The page searches PubMed through NCBI ESearch and ESummary and renders returned citation metadata only. It does not generate citations, summarize findings, grade evidence, or provide recommendations.
- Query submission is explicit; query history is not persisted by this feature.

## NCBI request controls

- Required server environment: `NCBI_EMAIL=support@mrxsteroid.com` and `NCBI_TOOL=MrXSteroid_Tool147_v6`. The engine rejects missing or altered values before contacting the limiter or NCBI.
- Optional `NCBI_API_KEY` is read only in the server engine and is never sent to client code.
- Both ESearch and ESummary calls must independently acquire a permit.
- Upstash Redis uses one global sorted-set key, `global:ncbi:eutils`, and an atomic Lua script using Redis server time to enforce at most three requests in the trailing 1,000 ms across instances.
- Missing Upstash configuration, script errors, or an invalid limiter response fail closed as `NOT_AVAILABLE`, reason `NCBI_LIMITER_UNAVAILABLE`, `retryAfter: 60`; the engine makes no NCBI request.
- A verified denial returns `RATE_LIMITED`.

## Implementation files

- `lib/ncbi/eutils-rate-limit.ts` — global atomic limiter.
- `lib/tools/schemas/tool-147-scientific-evidence-explorer.ts` — validated request, citation, and result states.
- `lib/tools/engines/tool-147-scientific-evidence-explorer.ts` — bounded NCBI ESearch/ESummary engine.
- `app/api/smarttools/tool-147/route.ts` — bounded POST API with HTTP 429/503 mapping.
- `components/tools/tool-147-scientific-evidence-explorer.tsx` and `i18n/tool-147-scientific-evidence-explorer.json` — bilingual UI using global language context.
- Catalog, category, registry, Page enum, route map, and `lib/tools/loaders.ts` — published hierarchical SmartTools route and component loading.
- `.env.example` — NCBI and existing Upstash variables documented.
- `docs/SMARTTOOLS_TOOL_147_SOURCES.md` — service, scope, and source notes.

## Verification evidence

| Check | Command/result |
|---|---|
| Limiter and engine tests | `npx vitest run lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts` — exit 0, 2 files, 14 tests passed. No upstream request was made. |
| Tool validation | `npm run validate-tools` — exit 0, 1 file, 5 tests passed. |
| TypeScript | `npx tsc --noEmit` — exit 0. |
| Scoped ESLint | `npx eslint ...` over Tool147 source, registry, route, and loader — exit 0, no errors. The project ignore rules emitted warnings for the two test files when they were included in the lint argument list. |
| Production build | `npm run build` — exit 0, Next.js compiled and generated 391/391 pages. Existing Browserslist and `metadataBase` warnings remain. |
| Local production route | Started the built app locally and requested `GET /smarttools/platform-ai/tool-147-scientific-evidence-explorer` — HTTP 200; English title and scope disclosure present. No API search was submitted. |
| Route manifests | `.next/server/app-paths-manifest.json` contains `/smarttools/[category]/[tool]/page` and `/api/smarttools/tool-147/route`. The prerender manifest did not list a static #147 path, but the production server returned HTTP 200 through the dynamic category/tool route. |

## Remaining deployment check

Do not consider upstream search available until the deployment has the exact NCBI email and tool values plus valid `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. If those are absent or unverifiable, the intended behavior is fail-closed `NOT_AVAILABLE`; no fallback permits requests through. Verify operational Upstash connectivity in a controlled deployment check before enabling public search.

No database schema/data, commit, push, or deployment was changed by this work.

## Current-checkout verification update — 2026-10-25

- `npx vitest run lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts tests/unit/smartToolsCatalog.test.ts` — **PASS**, exit 0; 3 files / 20 tests.
- `npx vitest run lib/tools/registry.test.ts tests/unit/smartToolsCatalog.test.ts` — **PASS**, exit 0; 2 files / 28 tests.
- Current catalog row audit marks Tool 147 `implemented` with its category-first canonical route; the current report's prior source-count snapshot is updated in `docs/GENIUS_INTELLIGENCE_V3/GENIUS_TOOL_V3_BASELINE_AUDIT.md` and `SMARTTOOLS_252_MASTER_INVENTORY.md`.
- No live NCBI request or Upstash connectivity verification was made. `.env.example` contains placeholders; do not infer runtime configuration from that template. Production search remains conditional on verified server environment and working Upstash limiter. No database operation, commit, push, or deployment occurred.

### Owner-approved limiter verification — 2026-10-25

- The checked-out implementation already contains the owner-approved global Upstash gate; no replacement limiter or alternate fallback was introduced.
- `npx vitest run lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts components/tools/tool-147-scientific-evidence-explorer.test.tsx` — **PASS**, exit 0; 2 discovered test files / 14 tests passed. The named component test file does not exist in this checkout, so Vitest ran the two existing suites. Vite emitted its existing dynamic-import warning from `lib/tools/loaders.ts`.
- `npx tsc --noEmit` — **PASS**, exit 0.
- `npm run validate-tools` — **PASS**, exit 0; 5 tests passed.
- Scoped ESLint on the limiter, engine, API route, and Tool 147 page — **PASS**, exit 0.
- Inspected the bilingual page: it shows explicit RATE_LIMITED and NOT_AVAILABLE states, and identifies limiter failure as “no request was sent to NCBI.” There is no dedicated component test file for this page in the current checkout.
- No live Upstash verification or NCBI request was performed. Therefore production connectivity is **NOT VERIFIED**; absent or unreachable Upstash yields `NOT_AVAILABLE` / `NCBI_LIMITER_UNAVAILABLE` / `retryAfter: 60`, without calling NCBI. `.env.example` contains only placeholders and is not evidence of deployed configuration.
- No application code, environment file, database, commit, push, or deployment was changed as part of this verification update; only this report was appended.

### Current local preview and verification — 2026-10-26

- `npx vitest run components/tools/tool-147-scientific-evidence-explorer.test.tsx lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts --reporter=dot` — **PASS**, exit 0; 3 files / 17 tests. UI coverage verifies global-language changes with no local preference controls, explicit user submission and NCBI-returned citation display, and the Arabic fail-closed limiter message. Engine/limiter tests use mocks and do not prove external service connectivity.
- `npx tsc --noEmit` — **PASS**, exit 0.
- Scoped ESLint on Tool 147 implementation/API/schema and component test — **PASS**, exit 0. The default project ignore configuration skips the `.test.tsx` file; `npx eslint --no-ignore components/tools/tool-147-scientific-evidence-explorer.test.tsx --no-warn-ignored` also passed, exit 0.
- `npm run validate-tools` — **PASS**, exit 0; 1 file / 5 tests.
- Local preview `GET http://127.0.0.1:3101/smarttools/platform-ai/tool-147-scientific-evidence-explorer` — **PASS**, HTTP 200; the returned page contains the expected English title. Port 3101 is a local preview only, not a public deployment.
- `.env.example:66-73` lists Upstash placeholders, the exact owner-approved `NCBI_EMAIL` and `NCBI_TOOL`, and an optional server-only `NCBI_API_KEY`. Actual deployment values and limiter connectivity were not inspected or tested.
- `docs/SMARTTOOLS_CATALOG_IMPLEMENTATION_PRESENCE_AUDIT.csv` had a stale #147 `planned/missing` row; it now records the current catalog identity, category-first route, and present component/engine/schema paths. This is file-presence evidence, not proof of all Genius V3 platform features.
- Scope remains limited to PubMed citation retrieval and display. Per the accepted tool-specific scope, no AI-generated summaries, evidence grading, medical recommendations, cross-tool data exchange, or persistent user search history is claimed. Thus **Tool 147 is locally implemented for its approved scope; it is not evidence that all 10 platform-wide intelligence features or all 252 tools are complete**.
- The SmartTools master inventory's older #147 planned/missing rows and aggregate snapshot were not overwritten because that file contains a broader stale inventory; this correction is recorded in its dated addendum and in the current-checkout scope audit pending full inventory reconciliation.

No upstream NCBI request, Upstash operation, database change, migration, commit, push, or deployment was performed for this verification.

### API boundary hardening — 2026-10-26

- Added `app/api/smarttools/tool-147/route.test.ts` for request-size/JSON/query validation and HTTP mappings for citation results, `RATE_LIMITED` (429 + `Retry-After`), and fail-closed limiter `NOT_AVAILABLE` (503 + 60 seconds).
- Added a malformed limiter decision case to `lib/ncbi/eutils-rate-limit.test.ts`; malformed Upstash results remain fail-closed.
- `npx vitest run app/api/smarttools/tool-147/route.test.ts components/tools/tool-147-scientific-evidence-explorer.test.tsx lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts --reporter=dot` — **PASS**, exit 0; 4 files / 23 tests.
- `npx tsc --noEmit` — **PASS**, exit 0. Scoped ESLint including the two test files with `--no-ignore` — **PASS**, exit 0. `npm run validate-tools` — **PASS**, 5/5.
- Tests use mocked engine/Upstash/NCBI behavior; no external request was made. No production source, database, migration, commit, push, or deployment was changed in this follow-up.
