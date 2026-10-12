# SDD ledger — plan: docs/superpowers/plans/2026-10-10-master-phases-AF.md

Governing: SMARTTOOLS_SPEC.md (in-repo) + user directive 2026-10-10 (phases A–F, AI §11, acceptance matrix).
BLOCKED (documented): file `2gpt MASTER v3.0` does not exist in repo or git history. SMARTTOOLS_SPEC.md + user directive are the governing pair.

## Session complete — final state (all committed)
- [x] A audit → docs/superpowers/audits/2026-10-10-master-phaseA-audit.md.
- [x] B (B1–B7) → commit 374a923: batch #031-#040 complete end-to-end, published-gate (getPublished*), validation gate planned-status contract, legacy routes fix, schemas hygiene + guards.
- [x] C regression: full suite 3028 pass; 16 failures = payments only, PROVEN pre-existing on baseline worktree C:/MrXSBaseline @ 6a84b3d. Payments out of scope (user rule #4).
- [x] E (E1+E2) → commit e1d9762: server/ai stack + /api/smarttools/ai/explain + 12 tests; ai-registry real-category fix (latent AIToolNavigation bugs surfaced by typing + fixed); AIInsightPanel wired to all published tool pages.
- [x] D-1 → commit cf3180f: tools #041-#045 shipped end-to-end (44 files; TDD golden engine tests; adapters batch test; i18n AR/EN; components; routes; registry/Page/PAGE_TO_PATH/TOOL_CATEGORY wiring; catalog6 flip 45 implemented / 5 planned).
- [x] F → next build SUCCESS (179 static pages, AI route present); acceptance matrix: docs/superpowers/audits/2026-10-10-master-acceptance-matrix.md.

## Session 2 (2026-10-11) — batch #046-#050 shipped
- [x] D-2 → commit `0aa2b40`: tools **#046–#050** full stack (45 files): engines TDD golden (trt-lifetime cost horizons / fertility recovery tiers / cardio factor model / bone score / mental-health red-flag escalation) + schemas + adapters (batch 5/5) + i18n AR/EN + components + 301 routes + Page enum +5 + PAGE_TO_PATH +5 + registry orders 620–660 + TOOL_CATEGORY +5 + catalog6 flip **50 implemented / 0 planned**.
- [x] AI explain planned-fixture migrated (`tool-046-trt-lifetime` shipped) → `tool-999-not-in-catalog`; published-only gate unchanged; 12/12 AI tests.
- [x] Full suite: **3048 pass** / 16 payments pre-existing (re-confirmed identical) / 5 skipped; tsc EXIT=0; eslint clean; `next build` ✓ **189 static pages**.
- [x] Matrix updated: docs/superpowers/audits/2026-10-10-master-acceptance-matrix.md.

## Remaining roadmap (honest)
- #051-#150: not started; §50 table + §ONBOARDING pattern is the onboarding path.
  **UPDATE (session 3):** superseded — roadmap #051–#150 registered (commit `01a3d82`) and #051–#055 shipped (commit `062528d`). Remaining: #056–#150.

## Lessons (recurring)
- Long-file one-shot writes polluted tails with stale fragments → hard rule: compose full final content before write; grep for duplicate declarations right after each write. (Applied this session: one stray `的生活` fragment caught + fixed in 048 test.)
- PowerShell mangles quotes/Arabic → always via script files (node fs), verify Arabic via node not console.
- Parallel tsc runs raced with edits → re-run after edit completes.
- NEW: hand-computed goldens drift from engine rules (046 long-term <5y, 047 age>28 +1, 048 max-sum 53 not 60, 049 age>65 −5 not −8) → recompute goldens carefully; when the test expresses *desired* behavior (050 declining-19nor flag), fix the engine, not the test.
- NEW: truncated writes recur under fatigue — after any long `write`, immediately verify the file's tail (grep for expected final lines: closing brace / helper) before moving on. (Session 3: 054 + 055 components caught truncated and rewritten complete.)

## Session 3 (2026-10-11) — roadmap #051–#150 + batch #051–#055
- [x] Roadmap registration → commit `01a3d82`: catalogs 7/8/9/10 planned identities verbatim from SPEC §4 (orders num×10+160 → 670…1660), TOOL_CATEGORY +100, counters 50+100=150, gates 18/18. `bookContext` omitted from planned (no invented chapter refs).
- [x] Batch #051–#055 → commit `062528d` (41 files): engines TDD RED→GREEN 15/15 (`tmp/green2-051-055.log`); golden-deviation rule applied both directions (tests fixed: 051 test-3 vol 0.15/units 15/doses 6, 053 U-40 goldens, 054 reading-20; engine fixed: 052 `>= 6`); schemas ×5; adapters ×5 + batch 8/8; i18n AR/EN ×5; components ×5 (AI-context panel; 053 red mismatch banner; 054/055 rewritten complete after catching truncated writes); 301 routes ×5; Page enum +5 (enum-member rename INSULIN_CONVERSION→INSULIN_CONVERSION_CALCULATOR caught by PAGE_TO_PATH completeness test); PAGE_TO_PATH +5; registry orders 670–710; catalog7 flip **55 implemented / 95 planned / 150 total**, published=55 (bookContext omitted — optional type, no gate/page dependency).
- [x] Verification: gates 23/23 + 9/9; full suite **3068 pass** / 16 payments pre-existing (8+1+3+1+1+1+1, byte-identical) / 5 skipped; tsc EXIT=0; lint EXIT=0; `next build` → **199 static pages** (+10).
- [x] Matrix updated: batch #051–#055 detail section + commits 7–9.

## Session 3 addendum — batch #056–#060 (2026-10-11, commit `1ba881c`)
- [x] Batch #056–#060 (41 files): engines TDD RED→GREEN 15/15 (`tmp/green2-056-060.log`); schemas ×5; adapters ×5 + batch 8/8; i18n AR/EN ×5; components ×5 (all composed complete — zero truncated writes; stray `.keep` caught+deleted); 301 routes ×5; Page enum +5, PAGE_TO_PATH +5, registry orders 720–760; catalog7 flip **60 implemented / 90 planned / 150 total**, published=60.
- [x] Golden-deviation applied both directions again: engine fixed for intended behavior (056 ≥12w duration, 059 partial-credit + recommendation), test goldens recomputed (057 Vermeulen exact, 058 formula ×100 bug, 060 quoted dotted enum key `'dutasteride_0.5mg'`).
- [x] Matrix updated: batch #056–#060 detail + commits 10–11.

## Session 3 addendum — batch #061–#065 (2026-10-11, commit `204c1eb`)
- [x] Batch #061–#065 (41 files): engines TDD 15/15 pass; schemas ×5; adapters ×5 + batch 5/5; i18n AR/EN ×5; components ×5 (complete dynamic UI + AI-context details); 301 routes ×5; Page enum +5, PAGE_TO_PATH +5, registry orders 770–810; catalog7 flip **65 implemented / 85 planned / 150 total**, published=65.
- [x] Matrix updated: batch #061–#065 detail + commits 12–13.

## Session 3 addendum — batch #066–#070 (2026-10-11, commit `53bf333`)
- [x] Batch #066–#070 (41 files): engines TDD 15/15 pass; schemas ×5; adapters ×5 + batch 5/5; i18n AR/EN ×5; components ×5 (complete dynamic UI + AI-context details); 301 routes ×5; Page enum +5, PAGE_TO_PATH +5, registry orders 820–860; catalog7 flip **70 implemented / 80 planned / 150 total**, published=70.
- [x] AI (§11) integration: health guidance and physiological support framed with strict safe boundaries; #069 avoids unproven detox cure myths; #068 flags clinical escalation; AI explain tests pass.
- [x] Verification: full suite passed (smarttools domain) / 16 payments pre-existing baseline / 5 skipped; tsc EXIT=0; eslint clean on batch files; `next build` PASS.
- [x] Matrix updated: batch #066–#070 detail + commits 14–15.

## Session 3 addendum — batch #071–#075 (2026-10-11, commit `635b6a5`)
- [x] Batch #071–#075 (41 files): engines TDD 15/15 pass; schemas ×5; adapters ×5 + batch 5/5; i18n AR/EN ×5; components ×5 (complete dynamic UI + AI-context details); 301 routes ×5; Page enum +5, PAGE_TO_PATH +5, registry orders 870–910; catalog7 flip **75 implemented / 75 planned / 150 total**, published=75.
- [x] Live Preview Verification: Local production server http://localhost:3005 verified: all 45 tools (#031–#075) return 200 OK on canonical paths, 301/308 redirects functional.
- [x] Verification: gates 29/29; tsc EXIT=0; eslint clean on batch files; `next build` PASS.
- [x] Matrix updated: batch #071–#075 detail + commits 16–17.
- [x] Batch #076–#080 (commit `fc7cef5`): engines TDD 10/10 pass; schemas ×5; adapters ×5 + batch 5/5 pass; i18n AR/EN ×5; components ×5 (complete dynamic UI + AI-context details); 301 routes ×5; Page enum +5, PAGE_TO_PATH +5, registry orders 920–960; catalog8 flip **80 implemented / 70 planned / 150 total**, published=80.
- [x] Live Preview & HTTP Verification: Local production preview server http://localhost:3005 verified: 5 new canonical URLs return 200 OK, 5 legacy URLs return 308 permanent redirect, roadmap #081 returns 404 (planned gate intact).
- [x] Batch #081–#085 (commit `ac07f50`): engines TDD 10/10 pass; schemas ×5; adapters ×5 + batch 5/5 pass; i18n AR/EN ×5; components ×5 (complete dynamic UI + AI-context details); 301 routes ×5; Page enum +5, PAGE_TO_PATH +5, registry orders 970–1010; catalog8 flip **85 implemented / 65 planned / 150 total**, published=85.
- [x] Live Preview & HTTP Verification: Local production preview server http://localhost:3005 verified: 5 new canonical URLs return 200 OK, 5 legacy URLs return 308 permanent redirect, roadmap #086 returns 404 (planned gate intact).
- [x] Batch #086–#090: engines TDD 10/10 pass; schemas ×5; adapters ×5 + batch 5/5 pass; i18n AR/EN ×5; components ×5 (complete dynamic UI + AI-context details); 301 routes ×5; Page enum +5, PAGE_TO_PATH +5, registry orders 1020–1060; catalog8 flip **90 implemented / 60 planned / 150 total**, published=90.
- [x] Live Preview & HTTP Verification: Local production preview server http://localhost:3005 verified: 5 new canonical URLs return 200 OK, legacy URLs return 308 permanent redirect, roadmap #091 returns 404 (planned gate intact).

- [x] Verification: vitest unit/integration passes (baseline 16 untouched); tsc EXIT=0; eslint clean on batch files; `next build` PASS.
- [x] Batch #091–#095 (commit `4120e5a`): engines TDD 10/10 pass; schemas ×5; adapters ×5 + batch 5/5 pass; i18n AR/EN ×5; components ×5 (complete dynamic UI + AI-context details + critical reproductive/pregnancy safety warnings); 301 routes ×5; Page enum +5, PAGE_TO_PATH +5, registry orders 1070–1110; catalog8 flip **95 implemented / 55 planned / 150 total**, published=95.
- [x] Live Preview & HTTP Verification: Local production preview server http://localhost:3005 verified: 5 new canonical URLs return 200 OK, legacy URLs return 307/308 redirect, roadmap #096 returns 404 (planned gate intact).

