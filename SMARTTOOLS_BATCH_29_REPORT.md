# SmartTools Batch 29 — Tool 141

**Scope:** local implementation of Tool #141 only. Existing app identity and slug remain unchanged; V7 #243 is not merged or treated as an alias.

## Delivery

Tool 141 is now an educational, deterministic ideal-tube calculation using user-sourced viscosity/density inputs, specified geometry and assumed flow. It is no longer presented as a syringe-force or oil-injectability estimator. The model only returns pressure drop when the computed Reynolds number is below 2000. Transitional and turbulent boundaries return `NOT_AVAILABLE` without a pressure value. Arabic/English, RTL and measurement units follow the shared header. Source basis, assumptions and exclusions are documented in `docs/SMARTTOOLS_TOOL_141_SOURCES.md`.

The canonical category-first route is `/smarttools/injection-formulation/tool-141-carrier-oil-viscosity-syringe-pressure`; the prior flat path redirects to it. No database, migration, commit, push or deployment work occurred.

## Verification to complete

- `npx vitest run lib/tools/engines/tool-141-carrier-oil-viscosity-syringe-pressure.v6.test.ts components/tools/tool-141-carrier-oil-viscosity-syringe-pressure.test.tsx lib/tools/registry.test.ts lib/legacy-routes.test.ts tests/unit/smartToolsCatalog.test.ts`: **PASS**, exit 0; 5 files / 67 tests, including invalid-input precedence, shared Arabic/RTL and imperial preference switching/conversion.
- Engine coverage command: **PASS**, exit 0; 15 tests, statements/branches/functions/lines 100%. Vitest 4.1.10 and coverage-v8 4.0.18 version mismatch warning persists.
- `npm run validate-tools`: **PASS**, exit 0; 5/5.
- `npx tsc --noEmit`: **PASS**, exit 0.
- Scoped ESLint command with `--no-ignore` for Tool 141 engine/schema/component/test files: **PASS**, exit 0.
- `npm run build`: **PASS**, exit 0; Next.js generated 395/395 static pages. Existing Browserslist and `metadataBase` warnings remain; build logged configured Supabase environment but made no database request.
- Manifest and local production HTTP smoke: **PASS**. Canonical category-first URL returned 200 and rendered the page title/shared header; former flat URL returned 308 to canonical. Manifest contains `/smarttools/[category]/[tool]/page` and `/smarttools/tool-141-carrier-oil-viscosity-syringe-pressure/page`. Local server stopped after the check.
- Full suite, live upstream/source verification, and manual keyboard/screen reader/contrast/mobile review: **NOT RUN**.
- Existing checkout is heavily modified/untracked before this batch; no unrelated local edits were staged or discarded.

**State:** implementation and the listed automated quality checks are ready for human review. Manual accessibility review and full-suite verification remain open; no release or deployment claim is made.
