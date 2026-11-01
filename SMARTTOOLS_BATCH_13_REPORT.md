# SmartTools Batch 13 Report — Tool 111 parity for tools 126–130

Date: 2026-10-24

Status: `IMPLEMENTED — focused tests, typecheck, catalog validation, targeted lint and production build pass; parity evidence partial.`

## Scope and governance

- Applied the owner's direct phased-rollout request to existing tools 126–130; the attached V3 master prompt and repository spec are used as architecture/governance references. Tool 111 is a domain-sensitive feature baseline, not a literal page template.
- Preserved tool identities and existing flat catalog routes; added registry/Page/legacy route entries for canonical `training-recovery` routes.
- No AI/ML service, persistence, database access/write, migration, commit, push or deployment was introduced.
- Cross-tool graph/events, opt-in user memory, predictions, voice, vision, workspace and live Supabase remain gated capabilities under `SMARTTOOLS_PLATFORM_GOVERNANCE.md`.

## Implementation

- Replaced the five partial forms with typed schemas, bilingual AR/EN and RTL/LTR controls, validation feedback, deliberate calculate/reset actions, current-result invalidation on edits, and the shared ToolOutput summary with ranked findings, provenance, scope notices and registry-derived related links.
- Added canonical adapters with user-input provenance, fixed calculation method, and explicitly unassessed confidence/data quality.
- Tool 126: no test markers now produce an unavailable score; engine guards require positive body mass and positive sprint/1RM values. Kg/lb and cm/in display conversions retain canonical values.
- Tool 127: reports which of five markers were supplied and states neutral assumptions for the optional missing inputs. Deterministic readiness rules are identified as non-AI.
- Tool 128: removed the generated 28-day sample history; users enter dated sessions. Seven-day and 28-day windows use UTC dates; a full elapsed 28-day window is required; zero-baseline ACWR stays unavailable and is not treated as an injury prediction.
- Tool 129: experience level affects the outline's focus; equipment selection is required; the page describes a deterministic outline rather than an AI-generated detailed prescription.
- Tool 130: replaced pasted JSON with structured trend points; dates and metric values are schema-validated; the uncalibrated numeric “confidence” was replaced with categorical rule signal strength and labeled explicitly as not calibrated confidence. Kg/lb conversion is tested against the trend rule.
- Added bilingual method labels to the shared output summary and reset output on locale changes so result values cannot remain in the former language.

## Verification

| Check | Status | Evidence |
|---|---|---|
| Focused engine/adapter, DOM, registry and route tests | `PASS` | `npx vitest run components/tools/tool-126-130-batch.dom.test.tsx lib/tools/engines/tool-126-130-batch.test.ts lib/legacy-routes.test.ts lib/tools/registry.test.ts` — 36 tests across 4 files. |
| Tool catalog validation | `PASS` | `npm run validate-tools` — 5 tests. |
| TypeScript | `PASS` | `npx tsc --noEmit` — exit 0. The production build type-check also passed. |
| Targeted ESLint | `PASS` | Changed runtime files: zero errors and zero warnings. Ignored test files are governed by repository ESLint ignore rules. |
| Production build | `PASS` | `npm run build` — Next.js 15 compiled successfully and generated 365 static pages. Existing `metadataBase` warnings were emitted. |
| Browser/manual accessibility review | `NOT RUN` | JSDOM control checks pass; this does not establish browser rendering, keyboard-only operation, contrast or screen-reader behavior. |
| Live Supabase/RLS | `NOT RUN` | No production DB access or changes were made. |

## Remaining limits

- These tools still use the existing fixed deterministic heuristics/reference ratios. No external AI or calibrated model was added, and model validity is not established by these tests.
- The brief planner does not provide exercise-specific sets/reps or medical clearance; the plateau signal does not infer causes from measured data.
- DOM tests cover explicit calculate, invalid-state blocking, results, stale-output clearing, structured history and representative unit conversion. They do not replace full browser-based interaction/accessibility evidence.
- Existing platform inventory remains incomplete relative to the stated target of 252. This batch verified five existing identities; it did not create new catalog identities.

## Decision

`READY FOR REVIEW` — all recorded implementation gates passed; browser/manual accessibility review remains `NOT RUN`.


## Follow-up wiring correction (Batch 14 audit)

The Batch 14 route audit found that the canonical pages for tools 126 and 128, plus the existing tool 136 page, still mounted their earlier pilot components. The pages now mount the tested shared-output components. The Batch 14 DOM suite tests those components and the production build is the route-import gate.
