# Tool-036 V4 — acceptance-feedback fixes (implementation plan)

> **Executor:** inline (this session), TDD per task. Branch: `feat/tool-036-v4-core` only.
> No V3 file, no `main`, no F8, no live route change.

**Goal:** close the five acceptance gaps the user raised against commit `5fdfb144`,
prove each with a test that fails before the fix, and re-verify the standing gates.

**Architecture:** fixes stay inside the V4 units already built —
`components/tools/tool-036-v4/tool-036-v4-shell.tsx`,
`lib/tools/tool-036-v4/engine/drift.ts`, plus tests. No new module, no V3 edit.

**Spec:** `.superpowers/sdd/tool-036-complete/design-v4-ar.md` (§5 declared drift
rules, §7 preview, §8 gates, §10 R1–R7). Horizon authority:
`.superpowers/sdd/tool-036-complete/review-v4-design-ar.md` P3
("خطة الأفق الكامل (12 أسبوعًا)", acceptance "إظهار 12 أسبوعًا").

## Global Constraints

- Never modify V3: `components/tools/tool-036-injection-schedule.tsx`,
  `lib/tools/engines/tool-036-injection-schedule.ts`, their tests, `SUPREME_ON`.
- Never touch `main`, the live route, or F8. Bundles ≤ 150 kB First Load JS.
- Every claimed PASS is a command that was run; `PASS/FAIL/NOT RUN/BLOCKED`.
- R5: no composite score. R2: no healing/readiness inference. R3: rest = preference.

## Review Focus

- A wipe that silently leaves a key behind, or a re-render that resurrects it.
- An actual recorded between two slots being credited to the wrong slot.
- A judged window that never updates while the page stays open.
- A planning horizon shorter than the approved one.
- Claiming English/LTR support that does not exist.

---

### Task 1 — P0: delete must not recreate the storage key

**Files:** modify `components/tools/tool-036-v4/tool-036-v4-shell.tsx`
(persist effect, `handleDeleteAll`); test `.../tool-036-v4-shell.test.tsx`.

**Interfaces:** consumes `saveState`, `deleteAllData`, `initialState`, `KEY_PREFIX`.
Produces: none (behavioural).

**Root cause:** the persist effect `if (state) saveState(state)` writes the
post-wipe default state back, so the key returns immediately.

- [ ] Step 1 — failing tests:
  - after `handleDeleteAll`, `storageMap` has **no** key with prefix
    `mrx.tool-036-v4.` (and a foreign key `mrx.keep` survives);
  - after a re-render of the still-open shell, still no tool key;
  - a first visit with no acknowledgment writes **no** key; acknowledging writes one.
- [ ] Step 2 — run `npx vitest run components/tools/tool-036-v4/tool-036-v4-shell.test.tsx`
  → expect the wipe tests FAIL (key present) and the fresh-visit test FAIL.
- [ ] Step 3 — persist only consented state: `if (state?.prefs.acknowledgedAt) saveState(state)`.
- [ ] Step 4 — rerun → PASS.
- [ ] Step 5 — commit.

### Task 2 — P0: drift matching is order-independent (nearest actual wins)

**Files:** modify `lib/tools/tool-036-v4/engine/drift.ts`; test `.../drift.test.ts`.

**Interfaces:** `buildDriftReport(proposal, events, prefs, nowIso)` unchanged.
Produces: same `DriftReport` shape (contract unchanged).

**Root cause:** shots are walked chronologically and each takes the nearest
*unused* actual, so an earlier shot can claim an actual that is nearer a later shot.

- [ ] Step 1 — failing tests:
  - actual exactly between two slots → credited to the **nearer** slot (S1 missed, S2 matched);
  - two overlapping windows with two actuals → no double-claim, each to its nearest;
  - shuffled input order → identical report (order independence);
  - exact midpoint tie → deterministic (earlier shot first);
  - actual > 24 h from both → both missed + it is extra.
- [ ] Step 2 — run `npx vitest run lib/tools/tool-036-v4/engine/drift.test.ts` → expect FAIL.
- [ ] Step 3 — build all `(shot, actual)` pairs within ±24 h, sort by `|delta|`
  then earlier shot then earlier actual then id, greedily assign; judge/emit as before.
- [ ] Step 4 — rerun → PASS (existing drift tests still green).
- [ ] Step 5 — commit.

### Task 3 — P0: live re-judgement as time passes (injectable clock, cleaned timer)

**Files:** modify the shell (clock state + `setInterval` + cleanup, memo uses it);
test the shell.

**Interfaces:** produces `CLOCK_TICK_MS` (≤ 60 000) exported from the shell.

**Root cause:** `derived` memo depends on `[state]` only; `now` is read once, so a
window that closes while the page is open is never re-judged.

- [ ] Step 1 — failing test: fake timers + fixed system time; assert the open
  slot is unjudged, advance 60 000 ms, assert it becomes `missed` with no user
  interaction; after unmount `vi.getTimerCount()` is 0.
- [ ] Step 2 — run → expect FAIL (no timer exists).
- [ ] Step 3 — `const [clockIso,setClockIso]=useState(()=>new Date().toISOString())`
  + `useEffect` interval (`CLOCK_TICK_MS`) with `clearInterval` cleanup; memo uses `clockIso`.
- [ ] Step 4 — rerun → PASS.
- [ ] Step 5 — commit.

### Task 4 — P1: approved planning horizon is 12 weeks

**Files:** modify the shell (`PREVIEW_WEEKS = 12`, exported); tests: shell + `proposal.test.ts` + `drift.test.ts`.

**Ruling:** the approved spec (`review-v4-design-ar.md` P3) fixes a 12-week
horizon; `PREVIEW_WEEKS = 4` was an unapproved shortening. Commit to 12.

- [ ] Step 1 — failing tests: heading says 12 weeks and the default plan renders
  24 shot rows; `compileProposal(weeks:12)` spans ≥ 11 weeks; a 12-week drift
  report brackets the whole proposal and judges an actual near the final shot.
- [ ] Step 2 — run → expect FAIL.
- [ ] Step 3 — set `PREVIEW_WEEKS = 12` (exported).
- [ ] Step 4 — rerun → PASS.
- [ ] Step 5 — commit.

### Task 5 — P1: standing-gate re-verification (no production code)

- [ ] Full V4 suite + V3 guard suite green.
- [ ] `tsc --noEmit` exit 0.
- [ ] `npm run build`: `Compiled successfully`, 310/310, preview route First Load < 150 kB,
  recharts/dnd-kit absent from the preview chunk.
- [ ] `git diff --stat` on V3 files = empty against the V4 base.
- [ ] Record AR-only / RTL status honestly; runtime `noindex` note.
- [ ] Write the Arabic evidence report; commit + push the branch.
