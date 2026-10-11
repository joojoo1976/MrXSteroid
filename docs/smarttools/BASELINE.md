# SmartTools — Documented Baseline (Stopping Point v1)

> Status: **reference stopping point**. This document records the *actual, verified*
> state of the repository at the start of the `2gpt MASTER v3.0 → 150 tools`
> continuation work. It must be updated (not rewritten) after each batch.

## 1. Repository / history reality check

| Expected by task brief | Actual in repository | Verdict |
|---|---|---|
| "5 commits" preserved | **1 commit** on `main` (`6a84b3d`), clean tree, no other branches/reflog entries | **DISCREPANCY — documented** |

There is no evidence of 5 prior commits in this checkout (`git log --all`, `git reflog`
both show a single clone commit). Work therefore continues from the single real
commit; nothing was reset or discarded.

## 2. Verified baseline commands

| Command | Result | Evidence |
|---|---|---|
| `npx tsc --noEmit` | **PASS** (exit 0, 0 errors) | `/tmp/tsc-baseline.txt` |
| `vitest run tests/unit/smartToolsCatalog.test.ts tests/unit/validateTools.test.ts` | **PASS** (2 files, 9 tests) | `/tmp/vitest-baseline.txt` |
| `npm run validate-tools` report | 30 tools catalogued, 34 registry entries, 30/30 filesystem verified, **0 errors** | validateTools output |

## 3. Actual continuation point

- Tools **#1–#30**: implemented and wired (engine + schema + component + flat
  redirect route + hierarchical canonical route + i18n + registry + tests).
- Tools **#31–#150**: **not implemented** at baseline (no engines/schemas/components).
  A first full registry seed is added in this work stream (`lib/tools/toolRegistry150.ts`)
  with honest development statuses.
- AI: `lib/tools/ai-registry.ts` exists but is a thin, `any`-typed projection of
  `TOOL_REGISTRY`; there is **no** server AI service, no provider adapter, no
  assistant route, no rate-limit/auth gate for AI at baseline.
- Supabase/RLS: extensive payment/SEO schema exists; **no** SmartTools-specific
  AI/memory tables or RLS at baseline.

## 4. Non-negotiables carried forward

- Do **not** rewrite calculators #1–#30 (engines, formulas, behaviour preserved).
- Canonical URLs are hierarchical and English: `/smarttools/{category}/{slug}`.
- No fake calculator output for unimplemented tools (spec §7, §24, §49).
- Medical safety limits: educational only, no personalised drug/hormone dosing.

## 5. What this document is *not*

This is not a claim of project completion. Per spec §46, build success alone does
not prove completion. See `TRACEABILITY_MATRIX.md` for per-tool evidence and the
PASS / PARTIAL / FAIL / NOT RUN / BLOCKED ledger.

---

## 6. Pre-existing test failures (NOT introduced by this work stream)

Full `vitest run` was executed against the untouched baseline commit (`6a84b3d`, in a
`git worktree`) and against the current branch. Both produce **exactly the same**
16 failing files / 72 failing tests (and the same 5 skipped). No new failures were
introduced; all failures below pre-date this work stream.

| Failing file | Nature |
|---|---|
| `lib/tools/registry.test.ts` | expects a richer registry API that was never implemented (`validateRegistry`, `normalizeSlug`, `orderedTools`, `ToolRegistryError`) |
| `lib/tools/adapters/{aromatization-risk,hpta-recovery,multi-ester-pharmacokinetics,pct-timing,timeline,toolLogAdapter}.test.ts` | adapter/envelope expectations vs. current registry values (e.g. tier `premium` vs `free`, `requireTool('timeline')`) |
| `tests/unit/seoSmartToolsTitles.test.ts` | flat SmartTools pages are redirect-only and carry no `metadata.title` |
| `tests/{unit,integration}/*` (checkout, instapay, merchant, order-producers, payment-receipts, invoice-kashier, toolLogPersistence) | payment/checkout subsystems, out of SmartTools scope |

These are logged as **pre-existing** and are not claimed as passing. Fixing them is
scoped separately (see TRACEABILITY_MATRIX.md).

## 7. Batch log

| Batch | Tools | Result |
|---|---|---|
| Baseline | #1–#30 | PASS (verified) |
| Batch 1 | #046–#050 | PASS — engines, schemas, components, i18n, routes, 34 engine tests; full-suite delta = 0 new failures |
| Batch 2 | #051–#056 | PASS — engines, schemas, components, i18n, routes, 27 engine tests; `tsc --noEmit` exit 0 |
| AI layer | platform | PARTIAL — deterministic fallback/guard/grounding PASS; real provider NOT RUN |
