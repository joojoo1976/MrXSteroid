# BATCH 2 — CLOSURE REPORT (2026-11-16)

**Scope:** continue Batch 2 with the next own-boxes tool in ascending order, Tool 045 — Cycle
Break Planner, to the Tool 039 / 041 / 042 standard.

**Branch:** `feat/r6.1-tools-041-042` (pushed to `origin`)

**Commits (separate):**

| Commit | Content |
|---|---|
| `579c9f56` | Tool 045 — five-state UI, CORE-5, GENIUS-12, contract + i18n evidence |
| `c15b84c7` | Build fix — 041/042 result types no longer depend on uncommitted schema edits |

**Preview:** `dpl_9fp8FrqQeDVbTsUdmUZhgrDYJctg` — READY, target `preview`, protection
`vercel_authentication` unchanged.

- App / direct Preview URL: https://mrxsteroid-preview-r6-batch2.vercel.app
- Tool 045: https://mrxsteroid-preview-r6-batch2.vercel.app/smarttools/cycle-management/tool-045-cycle-break-planner
- Tool 042: https://mrxsteroid-preview-r6-batch2.vercel.app/smarttools/hormonal-health/tool-042-estrogen-management
- Tool 041: https://mrxsteroid-preview-r6-batch2.vercel.app/smarttools/medical-monitoring/tool-041-hematocrit-monitor
- Deployment-specific URL: https://mrxsteroid-racehvwrr-georges-projects-78ef250b.vercel.app

The Preview was built from a **clean export of the commit**, not from the 373-path dirty working
tree, so it represents exactly what is committed. No Production deployment, no promotion, no merge,
no database/Supabase/RLS/migration/Storage/Cloud Sync.

---

## 1. Finding: the pushed Batch 1 commits did not build in isolation

The first Batch 2 deployment attempt failed with:

```
./components/tools/tool-041-hematocrit-monitor.genius.tsx:21:32
Type error: Module '@/lib/tools/schemas/tool-041-hematocrit-monitor' has no exported member 'HematocritResult'.
```

Cause: the 041/042 modules imported `HematocritResult` / `EstrogenResult` from the schema module,
but that type export exists **only in the uncommitted working tree** (two 1-line additions). Local
`tsc` passed because it read the working tree; a clean checkout — and therefore the published
branch — did not type-check.

Fix (`c15b84c7`), without touching the schema, engine or adapter bytes and without changing any
behaviour:

- pipeline: result type imported **type-only** from the engine it already calls;
- GENIUS UI: result type taken from the pipeline re-export, so the "UI never imports the engine"
  source-scan invariant still holds;
- contract: result shape derived from the canonical result schema
  (`ReturnType<typeof HematocritResultSchema.parse>`), so it cannot drift.

Verified by running `tsc --noEmit` **inside a clean `git archive` export of `c15b84c7`** with a
`node_modules` junction: exit 0. The working tree's two schema lines were left untouched.

---

## 2. Tool 045 — Cycle Break Planner

### What the tool now does

- Every calculation goes through `runCycleBreakPlanner` (validate → engine `planCycleBreak` →
  envelope). The UI never imports the engine or the legacy adapter.
- Starts genuinely EMPTY: no cycle length, compound name, half-life, suppression estimate or
  bloodwork answer is pre-filled (the old draft/Bio-Dashboard persistence is gone).
- Five states EMPTY / PARTIAL / INVALID / FULL / DEGRADED in the documented order.
- Own 12-box GENIUS layer, fixed order, nothing hidden; box 11 History = `NOT_AVAILABLE` (W18).
- C1: clearance days, PCT opening day, PCT length, baseline weeks, the engine's four milestones,
  confidence "not assessed", and an explicit "deterministic 5× half-life calculation, not a clinical
  reference range".
- C2: the mirrored formula (5× half-life, 7-day buffer, 4/6/8-week PCT bands, 4-week recheck),
  inputs used, assumptions and uncertainty.
- C3: the engine's own warnings mapped to localisation keys (never a raw code), red flags derived
  from those warnings, referral held as `NOT_AVAILABLE` / pending medical review.
- C4: `NOT_AVAILABLE — no approved source recorded` (`TOOL_045_SOURCES` is empty by design, with a
  test that fails if a citation is invented).
- C5: next step / what not to do / when to seek care, clinical wording `NOT_AVAILABLE`, plus the
  session-only 1–5 rating labelled "not saved".
- What-if and sensitivity re-run the **same pipeline** with one value changed (cycle ±2 weeks,
  bloodwork toggle, longest half-life +2 days); no local estimation.
- CSV generated in the browser only, carrying no session identifier.
- No persistence, no network, no storage of any kind.

### Engine facts preserved (unchanged)

`days_to_full_clear = ceil(longest half-life × 5)`; `pct_start_day = clear + 7`; PCT 4 weeks
(≤ 8), 6 (≤ 12), 8 (> 12); `total_weeks_to_baseline` from the engine milestones; warnings
`heavily_suppressive_stack_longer_recovery` (suppression 3) and
`baseline_bloodwork_before_pct_recommended` (no bloodwork).

### Files

| File | Role |
|---|---|
| `lib/tools/r6/tool-045-cycle-break-planner-pipeline.ts` | R6 pipeline (Zod → engine → envelope) |
| `lib/tools/r6/tool-045-cycle-break-planner-contract.ts` | mirrored limits, draft evaluation, warning map, sources (empty), cross-tool links, CSV |
| `components/tools/tool-045-cycle-break-planner.tsx` | five-state UI |
| `components/tools/tool-045-cycle-break-planner.genius.tsx` | GENIUS-12 / CORE-5 |
| `i18n/tool-045-cycle-break-planner.json` | 140 keys × AR/EN |
| `docs/…/tool-045-i18n-check.mjs` | re-runnable parity / contamination check |
| `docs/…/TOOL-045-DEVELOPMENT-PROPOSALS.md` | P-01…P-10 register |
| `lib/tools/r6/…-contract.test.ts`, `…-pipeline.test.ts`, `components/tools/…test.tsx`, `tests/unit/tool-045-i18n-evidence.test.ts` | evidence |

Engine, schema and adapter: **byte-unchanged**.

---

## 3. Verification actually run

| Check | Result |
|---|---|
| Tool 045 focused battery (contract, pipeline, component, i18n evidence) | **4 files / 54 tests PASS** |
| Tool 045 full battery (+ engine, 041–045 adapter batch, header preferences) | **7 files / 81 tests PASS** |
| Tools 041 + 042 after the build fix | **14 files / 141 tests PASS** |
| R6 regression slice, tools 039–060 | **59 files / 516 tests PASS** |
| `npx tsc --noEmit` (working tree) | **exit 0** |
| `npx tsc --noEmit` inside a clean `git archive` of `c15b84c7` | **exit 0** |
| Targeted `npx eslint` on all new/changed files | **exit 0 — 0 errors** |
| `npx next build` (working tree) | **exit 0 — compiled, 506/506 static pages**, `/smarttools/tool-045-cycle-break-planner` emitted |
| SSR, local `next start` | 045 route **200**, `data-r6-state="EMPTY"`, own `data-r6-genius`, boxes 1–12, `NOT_AVAILABLE`, `W18`; AR shell RTL (Arabic body hydrates client-side, same as 042) |
| SSR, published Preview (alias) | 045, 042 and 041 all **200**, `EMPTY`, own GENIUS, **12 boxes**, `NOT_AVAILABLE`, `W18` |
| i18n parity script | 045 **PASS** — 140/140 keys, no empty value, no CJK, no stray Latin, every `t.*` and contract key resolved |
| No raw engine codes | asserted by test |
| No persistence / no network | asserted by source scan |

---

## 4. Open items — not counted as complete

| Item | State | Why |
|---|---|---|
| `R6_EXEMPT_SLUGS` for 041 / 042 / 045 | **BLOCKED — owner approval of that exact edit required** | Until then each route renders the shared `R6ToolShell` **in addition to** the tool's own boxes (two GENIUS sections). `manifest.ts` was not edited |
| Specialist-approved source (045 C4, and 041/042 C4) | **NOT_AVAILABLE** | No verified source exists in the repository; inventing one is prohibited |
| Clinical referral / next-step wording (045 C3/C5 and 041/042) | **NOT_AVAILABLE / PENDING MEDICAL REVIEW** | Needs specialist approval |
| Result-schema enforcement before the envelope (P-03, all three tools) | **NOT IMPLEMENTED** | The pipeline layer is frozen for this phase |
| Real Arabic RTL 390 px browser pass | **NOT RUN in this phase** | Only structural checks (labels, `aria-*`, no fixed width) were executed; AR SSR on the alias did not honour the locale cookie through `vercel curl`, so no AR claim is made for the Preview |
| History box (all three tools) | **NOT_AVAILABLE** | W18 storage decision open |
| Repo-wide `vitest run` | **does not complete in this environment** | Unrelated suites stall/fail (`tool-021`, `tool-034`, `tool-017`, `tools-012-014`, checkout/payment/catalog/security); tool-scoped batteries are the evidence used |
| Tool 046–051 | **NOT STARTED** | Batch 2 is not complete |

### Acceptance state (unchanged, no self-acceptance)

- Tool 041: `OWNER_REVIEW — NOT ACCEPTED — NOT CLOSED`; authoritative ledger `v2-138`,
  138 rows / 132 applicable / 6 excluded / 76 evidenced = **76 / 132 = 57.58%**.
- Tool 042: `IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED`.
- Tools 045–051: `IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED`; no ledger exists
  and no percentage is claimed.
- No `OWNER_ACCEPTED`; no `PARTIAL` / `BLOCKED` / `NOT_AVAILABLE` is counted as complete; no E1/E2
  item enters the numerator.

---

## 7. Batch 2 continuation — Tools 046–051 (committed)

| Commit | Tool | Content |
|---|---|---|
| `d8acd740` | 046 TRT Lifetime Calculator | five-state UI, CORE-5, GENIUS-12, contract + i18n evidence |
| `b19f360b` | 047 Fertility Preservation Guide | five-state UI, CORE-5, GENIUS-12, contract + i18n evidence |
| `1af1d45c` | 048 Cardiovascular Risk Assessor | five-state UI, CORE-5, GENIUS-12, contract + i18n evidence |
| `42e11b41` | 049 Bone Density Optimizer | five-state UI, CORE-5, GENIUS-12, contract + i18n evidence |
| `12fbc24c` | 050 Mental Health Monitor | five-state UI, CORE-5, GENIUS-12, contract + i18n evidence |
| `371d2bcc` | 051 Peptide Dosage Calculator | five-state UI, CORE-5, GENIUS-12, contract + i18n evidence |

All six tools follow the same contract as 045: tool-owned non-clinical module, GENIUS-12 in fixed
order, five states, AR/EN parity script, focused Vitest, `tsc`, targeted ESLint, full build,
clean-commit export check, separate commit, Preview link, and a proposals register. Engine, schema
and adapter bytes are unchanged for every tool; the legacy adapter's invented confidence and
reference ranges were deliberately not reused.

### Verification (cumulative, Batch 2)

| Check | Result |
|---|---|
| R6 regression slice, tools 039–060 | **75 files / 733 tests PASS** |
| `npx tsc --noEmit` (working tree) | **exit 0** |
| Targeted `npx eslint` on all new/changed files | **exit 0 — 0 errors** |
| `npx next build` (working tree) | **exit 0 — compiled, 506/506 static pages** |
| Local SSR, all batch routes | **200**, `data-r6-state="EMPTY"`, own `data-r6-genius`, 12 boxes, `NOT_AVAILABLE`, `W18`; AR shell RTL |
| i18n parity scripts (045–051) | all **PASS** |

### Timeline

| Batch | Tools | State |
|---|---|---|
| 1 | 006, 015, 023, 035, 040, 043, 044 + finish 041, 042 | **DONE** |
| **2** | 045–051 | **DONE** — committed and pushed; Preview to be redeployed at batch end |
| 3–8 | remaining R6.1 tools | PENDING |

---

## 6. Working tree

The 370+ pre-existing modified/untracked paths outside these tools were **preserved**; only the
Tool 045 and build-fix files were staged. The protection copy
`E:\MrXSteroid-backups\working-tree-20261116-114807` remains untouched. The 373 dirty paths
include the two uncommitted schema type-exports; they were left as-is and are no longer required
by the committed tree.
