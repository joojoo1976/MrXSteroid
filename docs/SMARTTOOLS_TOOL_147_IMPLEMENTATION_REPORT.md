# SmartTool 147 Implementation Checkpoint

**Date:** 2026-10-25 (Africa/Cairo)  
**Application identity:** `mrx.tool.147-scientific-evidence-explorer` / `tool-147-scientific-evidence-explorer`  
**Canonical route:** `/smarttools/platform-ai/tool-147-scientific-evidence-explorer`  
**Status:** `IMPLEMENTED IN SOURCE — LIVE NCBI SEARCH NOT VERIFIED`

## Implemented behavior

- The visitor submits a bounded, validated PubMed query. The server uses NCBI ESearch and ESummary, and displays only citation metadata returned by NCBI; it does not generate citations, summaries, evidence grades, or recommendations.
- NCBI requests include `email=support@mrxsteroid.com` and `tool=MrXSteroid_Tool147_v6`. An optional `NCBI_API_KEY` is read by server-side code only.
- Each E-utilities HTTP request must obtain a permit from the atomic Upstash limiter. All requests share `global:ncbi:eutils`; Redis server time and a sorted set enforce at most three requests in a rolling 1,000 ms window. There is no in-memory fallback.
- A denied permit returns `RATE_LIMITED`. Missing or unverifiable limiter returns `NOT_AVAILABLE / NCBI_LIMITER_UNAVAILABLE` with `retryAfter: 60`; code returns before calling NCBI.
- The UI exposes English and Arabic copy, reports external source attribution, and handles empty, partial, limited, unavailable, and request-error states.
- `.env.example` documents the Upstash URL/token, NCBI email/tool values, and optional API key. No secret values were added.

## Evidence

| Check | Result |
|---|---|
| `npx vitest run lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts --reporter=dot` | PASS — 2 files, 14 tests. Vite emitted an existing dynamic-import warning from `lib/tools/loaders.ts`. |
| `npx tsc --noEmit` | PASS — command completed with exit code 0. |
| `npx eslint lib/ncbi/eutils-rate-limit.ts lib/tools/engines/tool-147-scientific-evidence-explorer.ts lib/tools/schemas/tool-147-scientific-evidence-explorer.ts components/tools/tool-147-scientific-evidence-explorer.tsx app/api/smarttools/tool-147/route.ts` | PASS — no output/errors. |
| `npm run validate-tools` | PASS — 1 file, 5 tests. |
| `HEAD http://localhost:3000/smarttools/platform-ai/tool-147-scientific-evidence-explorer` | PASS — HTTP 200 on the local dev server. |
| `HEAD http://localhost:3000/api/smarttools/tool-147` | Expected HTTP 405; this endpoint only accepts POST. No upstream request was made. |
| Current shell environment variable presence | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NCBI_EMAIL`, `NCBI_TOOL`, and `NCBI_API_KEY` are absent. Values were not read. |
| Live NCBI search / configured Upstash integration | NOT RUN — local required settings are absent; fail-closed behavior prevents a request without a verified limiter. |
| Production build, browser accessibility review | NOT RUN. |

## Remaining readiness limits

The page is available for local preview, but live search will not be usable until valid Upstash credentials and the server-side NCBI settings are configured in the runtime environment. Do not put the optional NCBI API key in client code. A successful mocked limiter test proves the policy logic, not the availability or correctness of the deployed Upstash instance. The app #147 and V7 #249 identities remain separate; no merge or redirect was introduced.

No database writes, migrations, commit, push, or deployment were performed.

## Current-checkout focused verification — 2026-10-26

The four focused Tool 147 suites were rerun against the current worktree:

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts app/api/smarttools/tool-147/route.test.ts components/tools/tool-147-scientific-evidence-explorer.test.tsx --reporter=dot` | **PASS**, exit 0 | 4 files / 23 tests passed. Vite emitted the existing dynamic-import-vars warning from `lib/tools/loaders.ts`; no Tool 147 test failed. |

This verifies the mocked limiter, engine, API mapping, and UI behavior in the current checkout. It does not verify live Upstash or NCBI connectivity, production environment configuration, a production build, or deployment. No upstream NCBI request was made by this test run.

## Current-checkout rerun — 2026-10-27

The same four focused suites were rerun:

`npx vitest run lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts app/api/smarttools/tool-147/route.test.ts components/tools/tool-147-scientific-evidence-explorer.test.tsx --reporter=dot`

Result: **PASS**, exit 0; 4 files and 24 tests passed. The existing Vite dynamic-import-vars warning from `lib/tools/loaders.ts` was emitted. This remains mocked/local evidence; no NCBI request or live Upstash verification occurred.

## Current full-suite and environment verification — 2026-10-27

The required NCBI and Upstash values were checked by presence only in the process environment and `.env`; `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NCBI_EMAIL`, `NCBI_TOOL`, and `NCBI_API_KEY` are all missing in both locations. Values were not read or displayed. As designed, this checkout cannot pass the global limiter and the engine must return `NOT_AVAILABLE / NCBI_LIMITER_UNAVAILABLE`; no live Redis or NCBI request was attempted.

| Exact command | Result |
|---|---|
| `npx vitest run lib/ncbi/eutils-rate-limit.test.ts app/api/smarttools/tool-147/route.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts components/tools/tool-147-scientific-evidence-explorer.test.tsx` | **PASS / exit 0** — 4 files / 24 tests; mocked Upstash and NCBI behavior only. Vite emitted the existing dynamic-import-vars warning in `lib/tools/loaders.ts`. |
| `npx vitest run --reporter=dot` | **FAIL / exit 1** — 510 files: 502 passed, 7 failed, 1 skipped; 4,811 tests: 4,790 passed, 16 failed, 5 skipped. The same seven checkout/payment files and 16 unrelated failures are listed in `docs/GENIUS_TOOL_V3_BASELINE_AUDIT.md`; they are outside Tool 147 and the route/catalog edits. |

This full run is a repository gate result, not a Tool 147 regression. The Tool 147 focused suites remain green. No database operation, migration, commit, push, deployment, Upstash call, or NCBI request occurred.
