# SDD ledger — plan: .superpowers/sdd/tool-036-complete/acceptance-fixes-plan.md

Branch: feat/tool-036-v4-core (BASE 5fdfb144, HEAD 9df136d3). No V3 / main / F8.

Pre-flight: no blocking conflicts.

- Task 1: complete (9486f5a; shell test 18/18).
  RED: `expected ['mrx.tool-036-v4.state'] to deeply equal []` on 2 tests.
  Ruling: persist only when `prefs.acknowledgedAt` is set — root-cause, not a skip-flag.

- Task 2: complete (1f3093f; drift 20/20).
  RED: `'an actual between two slots is credited to the NEARER slot'` → `expected 'missed' to be 'matched'`.
  Fix: collect all (shot, actual) pairs within ±24h, claim cheapest-first (tie: earlier shot → earlier actual → id).

- Task 3: complete (f545182; shell 19/19, incl. `vi.getTimerCount()===0` after unmount).
  RED: `expected '... فائت: 1 ...' to contain 'فائت: 2'` after advancing 60s; then `Unable to find ... drift-computed-at`.
  Fix: `clockIso` state + `setInterval(CLOCK_TICK_MS=30s)` with `clearInterval` cleanup; memo consumes `clockIso`; UI shows «آخر تحديث».

- Task 4: complete (9df136d; components+lib → 127/127; V4 incl. visibility → 131/131).
  RED: `Unable to find an element with the text: /الجدول المقترح \(12 أسابيع\)/`.
  Fix: `PREVIEW_WEEKS = 12` (exported) + honest rolling-window note; engine horizon tests added (they pass pre/post — stated honestly).

- Task 5: verification — V3 guard 81/81; `tsc --noEmit` exit 0; build 311/311, route 168 B/149 kB; V3 diff vs db23fb7d and origin/main empty.
  Pushed `5fdfb144..9df136d3`. Runtime noindex on the preview BLOCKED (Vercel SSO 302). AR/RTL PASS; EN/LTR NOT implemented (declared gap).
  Unrelated payments working-tree changes observed and left untouched.

Report: `.superpowers/sdd/tool-036-complete/evidence-v4-acceptance-fixes-ar.md`.

## Round 2 — approved scope: P0 global optimal matching + F7.5 (English/LTR)

Branch: feat/tool-036-v4-core (HEAD 9df136d3). No V3 / main / F8 / live route.

- Task 6 (P0-2b) global optimal matching — complete.
  RED: `does not strand a match` → `expected +0 to be 2` (greedy claimed the between-two-slots actual for s1, stranded a1 as extra and s2 as missed).
  RED: extra item `expected '2026-10-18T05:00:00.000Z' to be null` (scheduledAt borrowed windowStart).
  Fix: `optimalPairs` = max-cardinality, min-total-cost bipartite matching via successive shortest augmenting paths (Bellman–Ford on residual, integer ms costs). Deterministic tie-break (earlier shot → earlier actual → id) via fixed node/edge order + strict `<`. `driftItemSchema.scheduledAt` now `nullable()`; extras carry `null`; UI shows «بلا موعد مقابل».
  GREEN: drift 24/24; V4+V3 consolidated 215/215; `tsc --noEmit` exit 0.

### Round 2 (cont.) — tolerance boundary, F7.5 copy, bundle gate → pushed

- Boundary fix (acceptance: presentational rounding must not reclassify): classification is judged on the RAW delta;
  `deltaHours = Math.round(raw * 100) / 100` with the sign kept. GREEN: `drift.test.ts` 27/27 (incl. +6h matched,
  +6h02m late δ=6.03, −6h02m matched); shell+drift+i18n 3 files / 59 passed.
- F7.5 interface copy: split into `i18n.ts` (locale helpers: `UI_LOCALES`, `dirFor`, `fmt`, types) and
  `i18n-copy.ts` (`ar` source + complete `en: Record<CopyKey,string>`, `DICT`, `t`). Locale = `state.prefs.locale`;
  `dir`/`lang` on the tool roots only, never `documentElement`.
- Bundle gate (plan: preview route First Load JS < 150 kB): the route measured 153 kB (working tree) and 150 kB
  (HEAD `d7945e9`) before the fix. Attribution by same-environment A/B (`git stash push -- <5 V4 files>` + rebuild):
  every other chunk was byte-identical, so the whole +3,428 gz delta sat in the V4-only chunk `3570`; in-situ weighing
  gave i18n copy 2,986 gz + `rules/registry.ts` 2,033 gz + small logic. Fix: the server route now passes `DICT` and
  `RULE_BY_ID` to the shell as props — data leaves the client entry chunk (honest wording: JS→RSC payload, not deletion).
  GREEN: `ƒ /labs/tool-036-v4 168 B 146 kB`; route chunks hold no copy data and no recharts/dnd-kit.
- Gates (this session): V4 13 files / 149 passed · V3 guard 5 files / 81 passed · `tsc --noEmit` exit 0 ·
  build 311/311 · `git diff --stat origin/main -- <11 V3 paths>` empty · `git diff --cached --check` exit 0.
- Local production verification (`npx next start -p 3111` + real browser): status 200,
  `robotsMeta="noindex, nofollow"`, tool root `DIV:rtl/ar` → `DIV:ltr/en` on toggle, `documentElement` untouched,
  `ruleCitations=6`.
- Commit `811b1f5b` (the 9 Tool-036 V4 paths only; no `git add -A`) → pushed `9df136d3..811b1f5b`
  to `feat/tool-036-v4-core`.
- Vercel preview verification: **BLOCKED** — `*.vercel.app` unreachable from this environment and SSO-protected;
  the local production run above is the substitute evidence.
