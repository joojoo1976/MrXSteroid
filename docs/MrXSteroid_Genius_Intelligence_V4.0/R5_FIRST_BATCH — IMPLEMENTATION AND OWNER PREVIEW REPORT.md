# R5_FIRST_BATCH — IMPLEMENTATION AND OWNER PREVIEW REPORT

**Project:** MrXSteroid Genius Intelligence V4.0  
**Status:** `FIRST BATCH — IMPLEMENTED — AWAITING OWNER PREVIEW`  
**Date:** 2026-11-05  
**Branch / HEAD:** `main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0` (ahead 1 / behind 1)  
**Authorization:** Owner approved the three tools and the exact file allowlists in `R5_FIRST_BATCH — TOOL SELECTION AND IMPLEMENTATION SCOPE.md`. No production deployment or external hosting is authorized. No Git/Supabase/migration/AI/recurring-cost action was taken.

---

## 1. Outcome

The three authorized tools were implemented as additive V4 work around their unchanged deterministic engines. **Macro remains frozen** as the bounded pilot and was not re-opened. All addition/modification stayed strictly inside the approved allowlists — nothing else in the repository was edited.

| # | Tool | Route | Result |
|---|---|---|---|
| 1 | `mrx.tool.bmi` — Body Mass Index | `/smarttools/body-composition/bmi` | Implemented — verified live |
| 2 | `mrx.tool.protein-needs` — Protein Needs Estimate | `/smarttools/nutrition/protein-needs` | Implemented — verified live |
| 3 | `mrx.tool.water-intake` — Daily Water Intake Estimate | `/smarttools/nutrition/water-intake` | Implemented — verified live |

## 2. What was delivered (additions, nothing removed from users)

Same pattern as Macro: read-only V4 adapters, additive input/evidence profiles, a shared presentation-state helper, a shared scoped CSS module, Template V4 pilots preserving the published re-export wiring.

**Shared additive (created once):**
- `lib/engines/core/v4/profiles/tool-pilot-state.v4.ts` (+ `.test.ts`) — deterministic envelope→presentation state mapping
- `components/tools/tool-pilot-v4.module.css` — scoped V4-card styles for the three pilots only

**BMI** — `adapter.bmi.v4.ts` (+test), `profiles/bmi-input-profile.v4.ts`, `profiles/bmi-evidence-record.v4.ts` (CDC documentation record, `NOT_REVIEWED`), rewritten `components/tools/bmi-pilot.tsx` (`riskTier="LOW"`), `components/tools/bmi-pilot.v4.test.tsx`

**Protein Needs** — `adapter.protein-needs.v4.ts` (+test), `profiles/protein-needs-input-profile.v4.ts`, `profiles/protein-needs-evidence-record.v4.ts` (SPEC v3 heuristic record, `NOT_REVIEWED`), rewritten `components/tools/protein-needs-pilot.tsx` (`riskTier="MEDIUM"`), `components/tools/protein-needs-pilot.v4.test.tsx`

**Water Intake** — `adapter.water-intake.v4.ts` (+test), `profiles/water-intake-input-profile.v4.ts`, `profiles/water-intake-evidence-record.v4.ts` (SPEC v3 heuristic record, `NOT_REVIEWED`), rewritten `components/tools/water-intake-pilot.tsx` (`riskTier="LOW"`), `components/tools/water-intake-pilot.v4.test.tsx`

## 3. Protected files — verified unchanged (SHA-256)

Engines, schemas, `registry.ts`, `smartToolsCatalog.ts` / `smartToolsCatalog10.ts`, `categories.ts`, `loaders.ts`, `GeniusToolTemplate` V3/V4, the dynamic route, R1/R2 contracts/runtime, Macro engine/schema/adapter/pilot/CSS, M4-IN-01, Macro V4 closure files, dashboard/background work, `package.json` — all re-hashed and **unchanged** (see §10). No registry ID was created, deleted, renamed or renumbered; no catalog counter adjusted (264 identities intact).

## 4. Test evidence (actual commands and results)

| Command | Result |
|---|---|
| `npx vitest run` over **32 relevant suites** (all 328 Macro-closure tests + the 66 new tool/adapter/profile/shared tests) | **394 passed / 394** |
| ├ Macro closure (unchanged) | 328 passed, incl. engines 81/81 Macro V6, 46/46 Body Fat, all V4 suites |
| ├ BMI suite: engine 12/12 · adapter 5/5 · profiles 3+3+3 · pilot 3/3 · V4 pilot 7/7 | all pass |
| ├ Protein Needs: engine 9/9 · adapter 5/5 · profiles 3+3+3 · pilot 2/2 · V4 pilot 7/7 | all pass |
| ├ Water Intake: engine 7/7 · adapter 5/5 · profiles 3+3+3 · pilot 2/2 · V4 pilot 7/7 | all pass |
| ├ Shared state helper | 6/6 |
| `npm run validate-tools` | **5/5 pass** |
| `npx tsc --noEmit` | **exit 0** |
| `npx eslint` on new/changed production files | **0 errors, 0 warnings** (test files are project-ignored, same as Macro) |

Production build: **NOT RUN** (not authorized).

## 5. Live preview (verified 2026-11-05, dev server)

A local `next dev` server was started and all three routes were exercised in Chromium. The site opens in **Imperial** units by default (site-wide header preference). Verified live:

- **BMI** — renders V4 shell (`data-tool-id="mrx.tool.bmi"`, `data-ai-status="NOT_CONFIGURED"`, `LOW`), "2 of 2 required inputs provided." on load (defaults 70 kg / 175 cm), Calculate → "BMI: 22.9 (normal weight)", envelope **VALID**/`SUFFICIENT_FOR_BASIC_RESULT`, meaning sections visible, three disclosures present, `For"required-input"` complete.
- **Protein Needs** — renders V4 shell, progress starts "2 of 3" (goal/activity pre-selected), 70 lb entered → "Estimated daily protein: **51 g/day**", envelope **VALID**, meaning + disclosures present.
- **Water Intake** — renders V4 shell, progress "1 of 2", 70 lb → "1.13 L/day (1130 mL)", envelope **VALID**, meaning + disclosures present.

**Preview URLs (while the dev server is running):**

- `http://localhost:3000/smarttools/body-composition/bmi`
- `http://localhost:3000/smarttools/nutrition/protein-needs`
- `http://localhost:3000/smarttools/nutrition/water-intake`

Startup (if the server is not running): `npx next dev -p 3000` from `E:\MrXSteroid-main`, then open the three URLs. No database access, sign-in, external service, or cost is involved.

## 6. Fixes applied during implementation (before requesting acceptance)

1. Removed all manual `useMemo` calls — the React Compiler rejected stale memoization in the protein/water pilots; progress is now computed directly.
2. Removed an empty/unused import block and unused imports/vars flagged by ESLint; production files lint clean (0/0).
3. Narrowed the evidence-record types with `Omit<EvidenceReference, 'reviewedAt'>` — intersection types had collapsed to `never`.
4. BMI pilot was switched to synchronous click-to-calculate to match the retained test contract (result visible immediately on click) and starts with the previously published default inputs (70 kg / 175 cm), keeping the live behavior and its retained tests stable.
5. Imperial/metric conversions verified both directions against the unchanged engines; engine never receives non-canonical units.

## 7. Known limitations (honest list — not to be read as PASS)

- **Actual 375px viewport execution:** NOT RUN (no viewport-emulation tool in this environment). CSS rules verified only by content assertions (`@media (max-width: 40rem)` single column, `overflow-x: clip`, tablet/64rem rules). **PARTIAL.**
- **Full screen-reader pass:** NOT RUN.
- **Full axe (deque) audit:** NOT RUN. Lighthouse was not re-run for these routes (Macro's 0.94 failures were all site-wide header/footer defects, unchanged).
- **Arabic live-browser toggle:** NOT executed — the language switch is a site-wide user preference and was not flipped in this session. Arabic AR/RTL parity for these tools is `jsdom`-verified only.
- **BMI pilot default inputs** remain the pre-existing published default (70 kg / 175 cm) to preserve the live contract; not a "no defaults" redesign.
- **Site default unit system is Imperial**; observed outputs differ from Metric by display conversion only.
- BMI/Water/Protein engines are **application-designed heuristics/equations; none is clinically validated**; evidence records are `documentation`/`NOT_REVIEWED` with honest limitations. Chain of honesty: no fabricated citation, confidence score or validation exists anywhere in this batch.
- Pre-existing unrelated modifications (dashboard metrics route, dashboard persistence test, security test) were not read or tested here.
- Production build was not run; no deployment of any kind occurred; no external preview host was used.

## 8. Rollback (per tool or entire batch)

- Per tool: `git checkout -- components/tools/<tool>-pilot.tsx` restores the pre-batch published behavior (the route re-exporter `components/tools/<tool>.tsx` is untouched). Delete the created `lib/engines/core/v4/*<slug>*.v4*.*` files and `components/tools/<slug>-pilot.v4.test.tsx`, and the shared `tool-pilot-*.v4*` files.
- Then rerun `npx vitest run` (32-suite set) and `npm run validate-tools`, and re-check the three routes return HTTP 200 with their pre-batch UI.
- Whole batch is equivalent to the sum of the three rollbacks.

## 9. Owner preview checklist

For each of the three URLs:

1. Renders the V4 shell; the localized live region announces the state (EN / AR via the header language switch); the progress line counts required inputs.
2. Empty start (water/protein) and default start (BMI) behave correctly; Calculate produces the engine's exact number; an empty/invalid input produces exactly **one** `role="alert"` and no NaN/Infinity.
3. Disclosure `<summary>` elements open/close and are keyboard-focusable; Tab order is logical; visible focus outline is present.
4. Imperial ↔ Metric recalculation produces the engine's exact value; the UI never shows converted engine math as "different".
5. No "save/saved/synced/history" copy appears anywhere; no persistence exists; envelope is `PERSONAL` with `contextUsed=[]`, `nextActions=[]`, no `auditRef`.
6. Arabic (`dir="rtl"`) + English (`dir="ltr"`) both render complete and consistent, warnings localized, nothing dropped or reversed.
7. Desktop and 375px single-column layout render without horizontal overflow (375px actual must be verified by the owner; it was NOT RUN here).

## 10. New-file hashes (evidence, 2026-11-05)

**Tool 1 BMI**
`tool-pilot-state.v4.ts` `7A06D57C…` · `tool-pilot-state.v4.test.ts` `45331071…` · `bmi-input-profile.v4.ts` `9F5DD765…` / `.test.ts` `4B7F5B80…` · `bmi-evidence-record.v4.ts` `CF812E65…` / `.test.ts` `CECDFCE7…` · `adapter.bmi.v4.ts` `1BDBB125…` / `.test.ts` `A92C81C9…` · `components/tools/bmi-pilot.tsx` `D758967E…` (modified) · `bmi-pilot.v4.test.tsx` `7297C00B…`

**Tool 2 Protein Needs**
`protein-needs-input-profile.v4.ts` `0EF5A4CF…` / `.test.ts` `6576F60A…` · `protein-needs-evidence-record.v4.ts` `A2D8EA03…` / `.test.ts` `19C4F93D…` · `adapter.protein-needs.v4.ts` `0784A2C3…` / `.test.ts` `89627779…` · `components/tools/protein-needs-pilot.tsx` `FC5262AE…` (modified) · `protein-needs-pilot.v4.test.tsx` `155B573D…`

**Tool 3 Water Intake**
`water-intake-input-profile.v4.ts` `6FFFF931…` / `.test.ts` `D72246FA…` · `water-intake-evidence-record.v4.ts` `54853468…` / `.test.ts` `8F4C38B8…` · `adapter.water-intake.v4.ts` `002999EB…` / `.test.ts` `445B7D2C…` · `components/tools/water-intake-pilot.tsx` `A17A5624…` (modified) · `water-intake-pilot.v4.test.tsx` `465543F6…`

**Shared** `tool-pilot-v4.module.css` `27239294…`

## 11. Final gate status

`FIRST BATCH — IMPLEMENTED — AWAITING OWNER PREVIEW`

The three tools are ready for the owner's personal browser test. **No second batch will be started and no production deployment will occur until the owner explicitly accepts all three tools (`FIRST BATCH — OWNER ACCEPTED`) as a separate decision.** The second-batch candidates remain BMI's sibling **Body Fat** (after a separate owner decision on its legacy live route) and **One Rep Max**, both deferred.
