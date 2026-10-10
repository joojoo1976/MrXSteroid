# Phase A Audit — 2026-10-10 (SmartTools Master Phases A–F)

Evidence-only audit. Labels: CONFIRMED / INFERRED / MISSING / BLOCKED.

## 1. Git baseline
- Branch `main` @ `6a84b3d` ("feat: Implement Supabase integration, AI registry, RTL/LTR, Unit toggling, Voice commands") — CONFIRMED (`git log`).
- Working tree: **88 changed files** (20 modified + 68 untracked) = batch #031–#040 WIP — CONFIRMED (`git status --porcelain | wc = 88`).
- Worktrees: `C:/MrXSBaseline` (6a84b3d detached), `E:/tmp/MrXSHead` (a10ad82). Stash: 1 legacy (`cline/8b0da` seo-wip) — unrelated.

## 2. Governing documents
- `2gpt MASTER v3.0` — **MISSING** from repo, history, and parent dir (verified: `git ls-files` patterns, filesystem scan, prior audit `tmp/audit2.txt:1357` found only build-log txt artifacts). → BLOCKED as direct input.
- "Second merge list" (original 100-tool catalog #051–#100) — **MISSING** from repo. SMARTTOOLS_SPEC.md §7 lists #31–#150 names; catalog6 carries the baseline roadmap (#031–#050). → proceed with in-repo spec (user rule 4).
- `SMARTTOOLS_SPEC.md` — CONFIRMED in repo root (~3970 lines): §19/§39 AI governance, §46 acceptance, §47 precedence, §48 scope, §49 status model, §50 decisive #31–#150 category table.
- `docs/governance/MASTER_IMPLEMENTATION_GOVERNANCE_PROMPT.md` — commerce/payments domain (NOT the tools master).

## 3. Current broken state (measured 16:11–16:13, re-verified later in tasks)
| Check | State | Evidence |
|---|---|---|
| `tsc --noEmit` | **FAIL** | `components/tools/tool-036-injection-schedule.tsx(79,1): TS1005` — file truncated (ends line 78, 67 lines by PS count; missing JSX return + closing) |
| vitest `smartToolsCatalog.test` | **FAIL** | `planned tool must have no component yet: mrx.tool.036-injection-schedule — expected true to be false` (+ routes 036–040 exist while catalog6 marks 036–050 planned) |
| `PAGE_TO_PATH` (Record<Page,string>) | **LATENT TS2739** | missing 5 keys: INJECTION_SCHEDULE, SIDE_EFFECT_PROBABILITY, STACK_COMPATIBILITY, LIVER_ENZYME_TRACKER, LIPID_PROFILE_OPTIMIZER (suppressed while parse error exists) |
| Schemas 036–040 | **JUNK LINE** | last line = `` `nexport const schema = X;` `` (template-literal no-op from PowerShell artifact; intended `schema` export never materialized) |
| Engines #031–#040 + tests | PASS | 16 files / 140 tests ✓ |
| Adapters 031–035 + registry + seo tests | PASS | 3 files / 31 tests ✓ |
| i18n JSON #031–#040 | exist, EN+AR nested | CONFIRMED |
| Components | 031–036 only; 037–040 missing | CONFIRMED (`components/tools/tool-03x*`) |
| Routes 036–040 | exist (301-redirect stubs to hierarchical) while catalog `planned` | CONFIRMED |
| Category pages + sitemap + `[tool]` generateStaticParams | do NOT filter `planned` (only hub does) → dead links to #036–#050 | CONFIRMED (code read) |

## 4. Registry/catalog state
- TOOL_REGISTRY = 55 tools (CONFIRMED via validateRegistry passing + counts in tests).
- Adopted changes inside current batch (user-approved previous work, to be preserved): multi-ester-pharmacokinetics `free→premium`; orders resequenced (45/45.5/46/47/50…); 5 legacy tools registered (lab, genetic, cycle=premium, timeline, master-calculator); re-titling of 4 layered tools; canonicalToolId strips `tool-` prefix; fail-fast `validateRegistry()` on import.
- Catalog6: 50 entries #031–#050, statuses 031–035 implemented / 036–050 planned. On disk #036–#040 have full backend (engine/schema/adapter/route/i18n) but incomplete front-end (036 truncated; 037–040 components missing).
- `lib/tools/categories.ts` maps #031–#040 already; #041–#050 NOT in TOOL_CATEGORY; category `reproductive-wellbeing` (needed by §50 #47) does not exist yet — INFERRED, verify in Task D1.

## 5. AI infrastructure (Phase E baseline)
- `lib/tools/ai-registry.ts` — heuristic metadata + search/recommendations (no LLM) — CONFIRMED. `getAIRecommendations` uses slug-prefix hack, not TOOL_CATEGORY — finding.
- `components/smarttools/AIToolNavigation.tsx` consumes it — CONFIRMED.
- `config/env.ts` declares `OPENAI_API_KEY` optional. No `/api/ai` route. `buildAiContext` exists in `toolLogAdapter` (components build AI context but nothing consumes it server-side yet — CONFIRMED by grep).
- No AI provider secret available in this session (must not touch secrets). AI service will be env-driven with deterministic fallback (per user requirement).

## 6. 88-file inventory (baseline commit pending)
20 modified + 68 new (10 routes, 6 components, 10 i18n, 11 adapters(+batch test), 20 engines(+tests), 10 schemas, 1 catalog6).

## Blockers
- `2gpt MASTER v3.0` and the "second merge list" are not in the repo → cannot diff against them; SMARTTOOLS_SPEC.md + user directive used instead (user rule 4).
- AI live-provider verification (CONFIRMED-LIVE) impossible without a provider key → matrix will mark live-provider tests NOT RUN; fallback path tested with mocks.
