# SMARTTOOLS 246–252 — execution checkpoint

Date: 2026-10-27

## Implemented in this checkpoint

- **251 — Physique Scenario Simulator** is now a deterministic, independent V7 implementation. It accepts current weight, current/target body-fat percentages, and one to three user-selected positive weekly rates. It returns per-rate target weight and arithmetic duration with `CALCULATED` classification and explicit non-prediction limits. It reuses only the pure constant-lean-mass arithmetic kernel; it does not import Tool 149 user data or merge identities.
- Added strict schema, partial/invalid inspection, UI fields, bilingual output, catalog entry, category mapping, and focused regression coverage.
- Existing constrained implementations for 246, 247, 250, and 252 remain session/manual records with no persistence or automatic cross-tool data flow.

## Scope and release gates

- **248** is implemented as a separate V7 identity using the versioned ACEP/MedlinePlus warning-sign rule pack, explicit answers, and no safety conclusion. See the dedicated checkpoint below.
- **249** is implemented as a separate V7 identity using its own V7 query contract and NCBI tool parameter. It shares only the global fail-closed E-utilities rate limiter with Tool 147; the identities and routes remain separate.
- Browser/accessibility review and live Supabase/profile validation remain release gates and are not claimed as complete here.

## Verification

| Command | Result |
|---|---|
| `npx vitest run lib/tools/engines/tool-246-252.v7.test.ts components/tools/tool-246-252.v7.test.tsx lib/tools/categories.test.ts --reporter=dot` | PASS — 3 files / 19 tests |
| `npm run validate-tools` | PASS — 5 tests |
| `npx tsc --noEmit` | PASS — exit 0 |
| `npx eslint lib/tools/engines/tool-251-physique-trajectory.v7.ts components/tools/tool-251-physique-trajectory-simulator.tsx --no-warn-ignored` | PASS — exit 0 |

No database writes, migrations, commits, pushes, or deployment were performed. This is an implementation checkpoint, not final release approval; full repository checks and browser/accessibility review remain separate gates.

Additional verification: `npm run build` PASS (exit 0), Next.js generated 414/414 pages after publishing Tool 251. Existing Browserslist and metadataBase warnings remain. No deployment was performed.

## Tool 249 implementation checkpoint — 2026-10-27

Tool 249 is now a distinct PubMed evidence explorer, separate from Tool 147. It uses a V7-specific NCBI identity (`NCBI_TOOL_249`, defaulting to `MrXSteroid_Tool249_v7`), the required support email, and the existing global fail-closed Upstash limiter. Missing identity/limiter/upstream data returns an explicit unavailable state; no citation grading, recommendation, or generated reference is added. The catalog, category mapping, schema, engine, UI, and `/api/smarttools/tool-249` endpoint were added.

Verification: Tool 246–252 focused engine/UI/category tests PASS (29 tests in the combined run; 9 engine contract tests after the final disclaimer correction), `npx tsc --noEmit` PASS, `npm run validate-tools` PASS (5 tests), and scoped ESLint PASS with two existing `no-explicit-any` warnings in the compact Tool 249 UI. A production build is still the next verification step after this endpoint addition.

Final checkpoint verification: `npm run build` PASS (exit 0), Next.js generated 416/416 pages after adding Tool 249's endpoint and catalog route. Existing metadataBase/Browserslist warnings remain. No database operation or deployment was performed.

## Tool 249 API boundary hardening — 2026-10-27

- Added a 4096-byte request body cap that checks both a declared `Content-Length` and the actual UTF-8 body size before parsing or invoking PubMed search.
- Preserved `Retry-After` on both HTTP 429 rate-limit responses and HTTP 503 fail-closed limiter responses.
- Added route tests for oversized body/header, malformed JSON, invalid query, `RATE_LIMITED`, limiter `NOT_AVAILABLE`, and successful empty results.

Verification after route hardening:

| Command/check | Result |
|---|---|
| `npx vitest run app/api/smarttools/tool-249/route.test.ts lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts lib/tools/engines/tool-246-252.v7.test.ts --reporter=dot` | PASS — 4 files / 30 tests |
| `npm run validate-tools` | PASS — 1 file / 5 tests |
| `npx tsc --noEmit` | PASS — exit 0 |
| `npx eslint app/api/smarttools/tool-249/route.ts app/api/smarttools/tool-249/route.test.ts --no-warn-ignored` | PASS — exit 0 |
| `npm run build` | PASS — exit 0; generated 502/502 static pages |
| `.next/server/app-paths-manifest.json` | Contains `/api/smarttools/tool-249/route`, `/api/smarttools/tool-147/route`, and `/smarttools/[category]/[tool]/page` |

Build retains the previously observed stale Browserslist-data and missing `metadataBase` warnings. A repository-wide `git diff --check` found pre-existing whitespace/blank-line findings in unrelated files; no changes were made to those files. No database operation, migration, commit, push, or deployment was performed.

## Tool 248 implementation checkpoint — 2026-10-27

Tool 248 now uses the versioned ACEP/MedlinePlus rule pack already documented for the emergency checklist, while retaining its own V7 identity and route. It separates adult/child lists, requires explicit Yes/No/Not sure answers, returns PARTIAL for incomplete answers, MATCHED for explicit warning signs, and NO_MATCH without any safety guarantee. It has no free-text inference, diagnosis, treatment, location inference, or hard-coded emergency number. Added schema, UI, catalog/category mapping, and tests.

Verification: focused 246–252 engine/UI/category tests PASS (19 tests), TypeScript PASS, `validate-tools` PASS (5 tests), scoped ESLint PASS, and production build PASS (417/417 pages). Existing metadataBase/Browserslist warnings remain. No database writes, migrations, commits, pushes, or deployment were performed.

## Tool 251 input, localization, and header-unit follow-up — 2026-10-27

- Rejected malformed or empty comma-separated rate tokens rather than silently filtering them out before calculation.
- Exposed `PARTIAL` and `INVALID_INPUT` feedback in the interface; the engine inspection now treats an empty rate list as `PARTIAL`.
- Applied the shared header's metric/imperial preference to weight and weekly-rate inputs, converting the draft when the preference changes and converting values back to the engine's canonical kilograms before calculation.
- Localized validation, result labels, assumptions, and disclaimers in Arabic and English, with direction inherited from the shared preference hook and no local language/unit controls.

Verification:

| Command | Result |
|---|---|
| `npx vitest run components/tools/tool-251-physique-trajectory-simulator.test.tsx lib/tools/engines/tool-246-252.v7.test.ts components/tools/tool-246-252.v7.test.tsx --reporter=dot` | PASS — 3 files / 18 tests |
| `npm run validate-tools` | PASS — 5 tests |
| `npx tsc --noEmit` | PASS — exit 0 |
| `npx eslint components/tools/tool-251-physique-trajectory-simulator.tsx components/tools/tool-251-physique-trajectory-simulator.test.tsx lib/tools/engines/tool-251-physique-trajectory.v7.ts lib/tools/engines/tool-246-252.v7.test.ts --no-warn-ignored` | PASS — exit 0 |
| `npm run build` | PASS — exit 0; generated 502/502 static pages |

Build continues to emit the existing Browserslist-data and missing `metadataBase` warnings. No database writes, migrations, commits, pushes, or deployment were performed.
