# Master Phases A–F — SmartTools 150 Platform (2026-10-10)

## Governing documents
- **User directive (2026-10-10)** — highest authority: complete batch #031–#040 without losing work, build toward #150, real AI (§11 of the referenced master file), acceptance matrix with PASS/FAIL/NOT RUN/PARTIAL/BLOCKED.
- **`SMARTTOOLS_SPEC.md`** — in-repo governing spec (150 tools, §19/§39 AI governance, §46 acceptance, §47 conflict precedence, §50 decisive category table). `2gpt MASTER v3.0` file is NOT in repo → BLOCKED (documented); SMARTTOOLS_SPEC.md is the binding in-repo spec.
- §47 precedence: (1) explicit user requirements → (2) verified repo facts → (3) §47–50 corrections → (4) earlier guidance. Therefore current `tool-0XX-` slugs (repo fact) stay; §50 category names apply where absent.

## Global constraints
- Never break tools #001–#030 (engines, identities, routes).
- No production migrations, no secrets, no payment/auth changes.
- Arabic text never passes through PowerShell (use write tool / node scripts).
- TDD: failing test first for every behavior change; run every verification; ledger every task.
- Planned (#041–#050) must never leak to users (no cards/sitemap/routes) until implemented.

## Interfaces
- Component pattern: `components/tools/tool-0NN-*.tsx` ('use client', requireTool, zod safeParse, adapter build, buildAiContext, drafts, prev/next, pickToolI18n).
- Adapter pattern: `build<Name>Output(rawInput, options)` → `buildToolOutput({...})` with provenance + keyFindings + buildSeoLinks(tool). Identity from `requireTool`.
- Engine test pattern: `lib/tools/engines/tool-0NN-*.test.ts` (pure functions, golden values).
- Route: `app/smarttools/<slug>/page.tsx` → permanentRedirect(toHierarchicalHref(slug)).
- Catalog: `smartToolsCatalog6.ts` entries `status: 'planned' | 'implemented'`; hub filters planned; tests/unit/smartToolsCatalog.test.ts counts.

## Tasks
1. **A — Audit**: evidence doc (git, tests, tsc, catalog/registry counts, 88-file inventory, blockers: `2gpt MASTER v3.0` missing, second merge list missing, AI infra status). No code.
2. **B1** PAGE_TO_PATH completeness: RED unit test (every Page key present) → add 5 missing keys → GREEN.
3. **B2** Complete truncated `tool-036-injection-schedule.tsx` (RED: tsc TS1005; GREEN: tsc clean).
4. **B3** Remove junk `` `nexport `` line from schemas 036–040 (guard test: no schema file contains a backtick-newline artifact).
5. **B4** Components 037–040 + i18n wiring (follow 031 pattern; i18n JSONs exist).
6. **B5** Flip catalog6 #036–#040 → `implemented`; update smartToolsCatalog.test counts (RED: 35/15 → GREEN: 40/10).
7. **B6** `planned` never leaks: add `getPublishedCatalogTools()` + use in category page, sitemap, generateStaticParams (hub already filters); unit tests.
8. **B7** Batch adapter test for 036–040 + component sanity (tsc) + full vitest + validate-tools + eslint delta. GREEN gate for Phase B.
9. **C** Regression proof #001–#030: full suite green; document adopted registry changes (premium multi-ester, order shifts, titles) as user-approved; commit Phase B+C.
10. **D1–D10** Tools #041–#050 per §50 table: engine+test (TDD), schema, adapter+test, component, i18n EN/AR, route, category mapping, registry entry, PAGE_TO_PATH, catalog6 implemented, counts updated. Check category `reproductive-wellbeing` existence first.
11. **E1** AI explain service (server-only, env-driven provider, zod I/O validation, deterministic fallback, no health-data logging) + `/api/smarttools/ai/explain` route + mocked-provider tests (success, provider failure → fallback, invalid input 400).
12. **E2** Wire AIInsightPanel into one tool page (pattern proven) + fix AIToolNavigation recommendations to use TOOL_CATEGORY (real categories) with test.
13. **F** Full verification: tsc, vitest run, validate-tools, eslint delta, next build; acceptance matrix doc (PASS/FAIL/PARTIAL/BLOCKED/NOT RUN) incl. Supabase/RLS/RTL/SEO/routes; final report.

## Rulings recorded at setup
- Ruling: Work continues on `main` working tree (88 uncommitted files ARE the batch under construction; a fresh worktree would exclude them). Cost if wrong: main carries WIP — mitigated by granular commits.
- Ruling: `2gpt MASTER v3.0` not found in repo/history → SMARTTOOLS_SPEC.md + user directive are the governing pair (user rule 4: document blocker, continue independent work).
