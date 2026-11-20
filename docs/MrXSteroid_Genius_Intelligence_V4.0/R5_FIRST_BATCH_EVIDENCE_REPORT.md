# R5_FIRST_BATCH_EVIDENCE_REPORT

**Date:** 2026-11-07  
**Authority:** `MRX_GI_MASTER_EXECUTION_PROMPT.md` §7 (R5 first batch) and §17 (tests).  
**Scope:** BMI, Protein Needs, Water Intake — dynamic measurement input, engine-derived interpretation and recommendations, EN/AR, metric/imperial, 375px.  
**Repository state:** working tree on `main`, HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0`. No commit, push, merge, deployment, Supabase/DB/RLS/migration, route/ID/registry, engine, or Macro change was performed.

## 1. Verdict

The three R5 tools are implemented, wired to their real engines, and verified in the live app. The owner-approved shared accessibility remediation is also complete: breadcrumb contrast, the `<main>` landmark, the language-button accessible name, the Header heading hierarchy and the logo target size are fixed, and all three tools now score **1.00** on Lighthouse accessibility with **zero failing axe audits**. The first batch is ready for final owner acceptance. Batch 2 / the 255-tool expansion remains blocked until that acceptance.

This report is based on the **actual tree and runtime**, not on the earlier R5 reports. Where an earlier claim was contradicted, the contradiction is recorded below.

## 2. What was actually changed

### 2.1 Source files

| File | Reason |
|---|---|
| `components/tools/bmi-pilot.tsx` | Engine-derived category interpretation, adult-applicability notice, boundary gap, ±5 kg what-if table, category advice; imperial bounds corrected; guidance updated EN/AR; `locale` passed to the shared slider. |
| `components/tools/protein-needs-pilot.tsx` | Engine-derived maintain/bulk/cut comparison at the current weight and activity, dynamic interpretation, goal-specific advice, caution; display-unit weight instead of raw canonical; corrected bounds and guidance; `locale` pass-through. |
| `components/tools/water-intake-pilot.tsx` | Engine-derived activity scenarios, interpretation, advice, caution; US fl oz only in imperial; display-unit weight; corrected bounds and guidance; `locale` pass-through; shell is now `<main>`. |
| `shared/ui/GlobalHeader.tsx` | Desktop and mobile language/measurement controls carry the visible label inside their accessible names (label-in-name); brand button gets a 44px target (`min-h-11 min-w-11`); sub-nav dark text raised to `dark:text-zinc-400`. |
| `shared/ui/DynamicBrandLogo.tsx` | Interactive props (`role="button"`, tab stop, key handler) are applied only when `onClick` exists; the header logo is presentational, so it no longer obscures its parent button or creates a second tab stop. |
| `shared/ui/Footer.tsx` | Payment heading `h3→h2`; four column headings and the compliance heading `h4→h3`, fixing the heading-order audit. |
| `app/smarttools/[category]/[tool]/page.tsx` | Breadcrumb dark token raised to `dark:text-zinc-400` (was 3.87:1); current crumb marked `aria-current="page"`. |
| `components/tools/dynamic-slider-field.tsx` | Locale-aware accessible names (AR/EN); thumb and ARIA position clamped inside the declared range; canonical-first conversion unchanged. |
| `components/tools/tool-pilot-v4.module.css` | Slider hit area raised from 7px to 44px (`height: 2.75rem`) while the painted track stays 8px (`background-size: 100% 0.5rem`), including RTL. |
| `lib/tools/r5/bmi-insights.ts` | Calls the real BMI engine for category, boundary distance and ±5 kg scenarios; no duplicated coefficients. |
| `lib/tools/r5/protein-insights.ts` | Calls the real protein engine for maintain/bulk/cut scenarios and goal-advice mapping. |
| `lib/tools/r5/water-insights.ts` | Calls the real water engine for activity scenarios and the mL→US fl oz conversion. |
| `docs/MrXSteroid_Genius_Intelligence_V4.0/R5_DYNAMIC_MEASUREMENT_INPUT_SPEC.md` | Imperial stops and display steps corrected to the physically valid values actually shipped (see §3.1). |
| `docs/MrXSteroid_Genius_Intelligence_V4.0/R5_FIRST_BATCH_EVIDENCE_REPORT.md` | This report. |

### 2.2 Tests added or extended

New: `lib/tools/r5/bmi-insights.test.ts` (5), `protein-insights.test.ts` (4), `water-insights.test.ts` (5); `components/tools/bmi-pilot.insights.test.tsx` (3), `protein-needs-pilot.insights.test.tsx` (5), `water-intake-pilot.insights.test.tsx` (5), `r5-preferences-sync.test.tsx` (3), `r5-boundaries.test.tsx` (9), `r5-a11y-css.test.ts` (1), `lib/tools/loaders.r5.test.ts` (3 cases).  
Accessibility RED→GREEN (owner-approved shared remediation): `shared/ui/globalHeader.a11y.test.tsx` (6), `shared/ui/footer.a11y.test.tsx` (1), `app/smarttools/[category]/[tool]/page.a11y.test.tsx` (1), `components/tools/r5-main-landmark.test.tsx` (3). All 13 were written first and observed failing for the intended reasons before the fixes.  
Extended: `components/tools/dynamic-slider-field.v4.test.tsx` (Arabic accessible-name test).

Net new tests: **57** (44 feature/contract + 13 accessibility). The consolidated R5 feature batch is **17 files / 81 tests, all green**; the accessibility batch is **4 files / 13 tests, all green**.

### 2.3 Net-zero / removed

Three temporary explicit page files were created earlier in this session at `app/smarttools/body-composition/bmi`, `app/smarttools/nutrition/protein-needs`, and `app/smarttools/nutrition/water-intake`, then **removed**. They are not part of the delivery: the canonical `app/smarttools/[category]/[tool]/page.tsx` route already supplies breadcrumb, metadata, JSON-LD and `SafetyNotice`, and the three catalog slugs already resolve through the existing shims `components/tools/bmi.tsx`, `protein-needs.tsx`, `water-intake.tsx` to the `*-pilot` modules. `lib/tools/loaders.ts` needed no change.

### 2.4 Pre-existing uncommitted work not touched

`app/api/dashboard/metrics/route.ts`, `components/tools/macro-pilot.tsx`, `components/tools/macro-pilot.module.css`, `tests/integration/dashboardPersistence.test.ts`, and unrelated untracked docs/tests were already modified in the working tree. They were not edited by this batch and are not claimed here.

## 3. Defects found and fixed

### 3.1 Imperial slider stops were physically invalid (real defect)

The canonical pilot bounds are 30–300 kg and 100–250 cm. The imperial stops were 66–661 lb and 39–98 in:

- 66 lb = **29.94 kg** < 30 kg → the slider's own minimum produced `INVALID`.
- 39 in = **99.06 cm** < 100 cm → the same failure on height.
- 661 lb = 299.82 kg (inside, but not aligned to the display step).
- 98 in = 248.92 cm (inside, but not aligned).

This contradicted the retained R5 report claim that the stops were correct. RED test (`r5-boundaries.test.tsx`) failed **6 / 9**; the fix uses the smallest 0.1 display stop inside the canonical range:

- weight: **66.2–661.3 lb** (66.2 lb = 30.03 kg, 661.3 lb = 299.96 kg), step 0.1.
- height: **39.4–98.4 in** (39.4 in = 100.08 cm, 98.4 in = 249.94 cm), step 0.1.
- thumb/ARIA position is clamped into the declared range; error guidance now states 66.2–661.3 lb / 39.4–98.4 in in EN and AR.
- The R5 spec was updated to match, with the rationale recorded there.

GREEN: **9 / 9**.

### 3.2 Raw canonical weight leaked into explanations (real defect)

The Protein and Water interpretation strings rendered the canonical value directly, e.g. `69.989302691 كجم` after entering 154.3 lb. The interpretation now formats the user's weight in the active display unit and precision: `154.3 lb` / `154.3 رطل`, `70 kg` / `70 كجم`. RED-first tests assert both the presence of the display value and the absence of the raw canonical string.

### 3.3 English accessible names in the Arabic UI (real defect)

The shared slider announced `Set weight` and `Precise input` in Arabic mode. `DynamicSliderField` now accepts `locale` and announces `اضبط الوزن (رطل)` and `إدخال دقيق (lb)` (physical unit symbols intentionally stay as kg/cm/lb/in). All three pilots pass the active locale.

### 3.4 Touch target was 7px (real defect)

The native range input was only as tall as the painted track. CSS now gives the input a **44px** hit area (`offsetHeight`/`clientHeight` = 44) while the visible track remains 8px, with the same treatment in RTL. A CSS-contract test guards the rule. Lighthouse did not flag the slider under `target-size`.

### 3.5 Prior-report claims and route verification

- The earlier “live routes 200 / bounds 66–661 lb and 39–98 in” claims did not match the physical behavior; the stops are now corrected as above.
- A 500 observed during editing came from the `[category]/[tool]` not-found path while the dev server was in a broken HMR state. It was **not** a loader defect: the existing re-export shims resolve correctly (`loaders.r5.test.ts` 3/3, live 200 responses below). No `loaders.ts` change was made.
- After removing the temporary pages, all three canonical URLs return **200** through the dynamic route, with breadcrumb, metadata and `SafetyNotice` present.

### 3.6 Test expectation, not a product defect

At exactly 30 kg the protein engine returns 48 g/day; at 66.2 lb (30.03 kg) it returns 49 g/day. The original boundary test expected 49 at 30 kg; the expectation was corrected to the engine's real, correctly rounded output. This boundary rounding is documented as a risk below.

## 4. Verification commands and actual results

| Command | Result |
|---|---|
| `npx vitest run` (R5 batch, final) | **exit 0 — 17 files / 81 tests passed** |
| `npx tsc --noEmit` | **exit 0**, no diagnostics |
| `npm run lint` | **exit 0 — 0 errors, 489 warnings** (identical to baseline; no new warnings) |
| `npm run validate-tools` | **exit 0 — 5/5 tests passed** |
| `npx vitest run` (full suite, post-fix) | **17 failed / 5235 passed / 5 skipped (559 files)** — no R5 or shared-a11y file among the failures; the suite is **not** green |
| `npm run build` | **exit 0**, “Compiled successfully”; `[category]/[tool]` emitted as SSG |
| Accessibility tests (RED → GREEN) | **13 failed → 13 passed** (4 files: header, footer, route breadcrumb, R5 landmarks) |
| Targeted R5 + shared regression (post-fix) | **15 files / 45 tests passed**; separately `shared/ui` 3 files / 20 tests and `header-preferences` 17 files / 84 tests |
| Lighthouse accessibility (BMI / Protein / Water), before → after | **0.93 → 1.00**, **0.91 → 1.00**, **0.91 → 1.00**; **zero failing axe audits** after the fix |

### 4.1 Full-suite comparison against the recorded baseline

- Baseline: 545 files, 19 failed / 5176 passed / 5 skipped.
- Earlier R5 feature run: 555 files, 19 failed / 5220 passed / 5 skipped.
- Post-accessibility run (current): **559 files, 17 failed / 5235 passed / 5 skipped** (+4 a11y files, +15 passing tests, two fewer failures).
- Current failures are confined to **8 payment/checkout/security/merchant files**: `checkoutCountryRouting` (8), `createInvoiceKashierDelegation` (1), `securityHardeningPosture` (1 — its 5s static-scan test timed out under parallel load), `checkoutSessionService` (1), `instapayPreservationLock` (1), `merchantResolver` (1), `orderProducersStatusContract` (1) and `paymentReceiptsAdmin` (3). The `coachingAddonUsdPrice` load flake passed this run; the security scan timeout is the same load-sensitive class and is not an R5 regression.
- **No R5 regression**: none of the failing files import the three pilots, the shared slider, `lib/tools/r5`, the shared header/footer, the logo, or the tool route's breadcrumb.
- **This suite is not green and must not be reported as green.** The 17 failures are documented, pre-existing, and outside the R5/shared-accessibility change surface.

**Error split — new vs pre-existing:** new TypeScript errors **0**, new ESLint errors **0**, new ESLint warnings **0**, new build errors **0**. Pre-existing: **489** ESLint warnings and **17** payment/checkout/security test failures in this run, with load-sensitive flakes (`coachingAddonUsdPrice`, `securityHardeningPosture` scan, and the earlier Header-preferences timeout) that pass when run without the full parallel load.

## 5. Per-tool operational evidence (live browser, 375px iframe)

Environment: `next dev` on port 3001 (port 3000 was already occupied), in-app Chromium. There is no viewport-resize tool in the harness, so 375px is a same-origin 375px iframe; page-level `documentElement.scrollWidth` vs `clientWidth` was measured inside it.

### 5.1 BMI

- Default 70 kg / 175 cm → **BMI 22.9**, “normal weight”, EN and AR.
- Category interpretation, adult-only applicability, boundary gap (`4.4` above 18.5 and `2.1` below 25.0) and advice render from the engine in both languages.
- What-if rows: 65 / 70 / 75 kg → **21.2 / 22.9 / 24.5**; in imperial **143.3 / 154.3 / 165.3 lb** with the same BMI values and “Current” marker.
- Imperial: 154.3 lb / 68.9 in → **22.9**, unchanged from metric; three repeated metric→imperial→metric toggles returned to 70 kg / 175 cm and 22.9.
- Boundaries: 30 kg / 100 cm and 300 kg / 250 cm are accepted; 29.9 and 300.1 / 250.1 produce exactly one alert and no result.
- Imperial stops: 66.2 lb and 661.3 lb both produce valid results (9.8 and 97.9) with no alert; ARIA `aria-valuemin/max/now` stay consistent.

### 5.2 Protein Needs

- Starts with an empty weight (partial state, no fabricated result).
- 70 kg / activity 1.2 / maintain → **113 g/day**; scenarios **113 / 141 / 156 g/day**; the selected scenario carries `data-selected="true"`.
- Arabic: the same 113 / 141 / 156 values and the selected marker; advice and caution are localized.
- Imperial 154.3 lb → 113 g/day; interpretation reads “At 154.3 lb…” / “عند وزن 154.3 رطل…” with **no raw canonical value**.
- Boundaries: 30 kg → 48 g/day, 300 kg → 485 g/day, 29.9 / 300.1 rejected; imperial min 66.2 lb → 49 g/day, max 661.3 lb → 485 g/day, no alerts.

### 5.3 Water Intake

- Starts with an empty weight.
- 70 kg / activity 1.2 → **2.5 L/day (2500 mL)**; scenarios **2.45 / 2.5 / 2.55 L/day**; selected scenario marked.
- Imperial adds **85 US fl oz** only when the Header is imperial; Arabic renders **85 أونصة سائلة أمريكية**. The value is derived from the same engine result (`2.5 L → 84.5 → 85`).
- Interpretation reads “At 154.3 lb…” / “عند وزن 154.3 رطل…”, no raw canonical value.
- Boundaries: 30 kg → 1.07 L/day, 300 kg → 10.71 L/day, 29.9 / 300.1 rejected; imperial stops 66.2 lb → 1.07 L (36 US fl oz) and 661.3 lb → 10.71 L (362 US fl oz), no alerts.

## 6. Measurement sync and language

- Header toggle → `PreferencesContext` → `useToolDisplayPreferences()` → sliders, precise inputs, labels, bounds, steps, engine inputs and result panels all update together.
- The engine only receives canonical kg/cm; display conversion happens at the boundary. Repeated toggling did not change the physical value or cause double conversion.
- Slider and manual input share one canonical state; moving either updates the other and recalculates live.
- EN renders `dir="ltr"`; AR renders `dir="rtl"` with Arabic headings, labels, interpretation, advice, caution and accessible names.

## 7. 375px and accessibility evidence

- All three routes: `documentElement.scrollWidth` 358 vs `clientWidth` 358 at a 375px iframe (358px layout viewport after the scrollbar) → **no page-level horizontal scroll**; the 375px iframe reports `htmlDir=rtl`, `mainDir=rtl`, exactly one `<main>`, and **0 unclipped offenders**.
- Slider hit area: computed height 44px, `offsetHeight`/`clientHeight` 44; the in-app preview reports a scaled visual rect (~40px) because the embedded preview applies page zoom, not because the CSS target is smaller.
- Native `<input type="range">` keeps keyboard arrows/Home/End behavior; ARIA names are localized.
- `SafetyNotice` (`role="note"`) is present before each tool, with the Arabic and English paragraphs.
- Shared accessibility remediation (owner-approved, RED→GREEN):
  - **Breadcrumb contrast:** `#71717a` on `#0e0543` was 3.87:1; the dark token is now `dark:text-zinc-400` and computes **`rgb(161,161,170)`** on all three routes. The current crumb is `aria-current="page"`.
  - **Sub-navigation contrast:** `#71717a` on `#0c0727` was 4.04:1; now `dark:text-zinc-400`, clearing 4.5:1.
  - **`<main>` landmark:** each R5 pilot shell now renders `<main>`; the route layout was deliberately left unchanged because 250+ other tools already own a `<main>` and a layout landmark would nest them. Live: exactly one `<main>` per route.
  - **Language-button accessible name:** desktop `Switch language — عربي` / `تغيير اللغة — EN`; mobile names include the visible label (`العربية` / `English`). Measurement names likewise include `MET/IMP` (`Metric/Imperial` on mobile). WCAG 2.5.3 label-in-name is restored on both desktop and mobile.
  - **Header heading hierarchy:** footer payment heading is `h2`; the four column headings and the compliance heading are `h3`. Live order is `H1 → H2 → H3…`, with no skipped level.
  - **Logo target size:** `DynamicBrandLogo` now exposes interactive props only when `onClick` exists. The header brand button has **0 nested focusables**, no nested `role="button"`, and a 44px minimum target (computed CSS height 47.99px, `min-height/min-width: 44px`).
- Lighthouse (12.2.1, bundled axe-core) after the fix: **BMI 1.00, Protein 1.00, Water 1.00 — zero failing axe audits on all three** (baseline 0.93 / 0.91 / 0.91).
- The first BMI Lighthouse run (0.89) also flagged `frame-title`; that was the measurement iframe, removed before the 0.92 baseline run.

## 8. Console and environment observations

- Tool pages produced no tool-level console errors.
- Pre-existing/unrelated external errors observed: `grainy-gradients.vercel.app/noise.svg` **402**, `/api/translate` **503**, and the `favicon.ico` public/page conflict **500** (Next warning in the dev log). These are not caused by R5 and were not changed.
- Port 3000 was already occupied by another process; all R5 evidence used 3001.
- Running `npm run build` while `next dev` was still running replaced the shared `.next` output and made the live dev server return 500 (`Cannot find module './5611.js'`, missing React Client Manifest module). This is a build/dev artifact collision, not an application error: a fresh `npm run dev` after the build returned **200** on all three canonical routes plus the `/en` and `/ar` variants.

## 9. Fixed vs unfixed

**Fixed in this batch:** engine-derived BMI interpretation/advice/what-if; protein maintain/bulk/cut scenarios and goal advice; water activity scenarios and US fl oz; display-unit weight in explanations; localized ARIA names; 44px slider target; physically valid imperial stops with clamped ARIA position; corrected EN/AR guidance; temporary page files removed; **shared breadcrumb and sub-nav contrast; one `<main>` landmark per R5 tool; label-in-name for the desktop and mobile language/measurement controls; footer heading hierarchy; and the logo target size / nested-control defect.** Lighthouse accessibility is **1.00** on all three tools with zero failing axe audits.

**Not fixed / out of R5 scope:**

1. 18 pre-existing payment/checkout/security test failures (documented in §4.1).
2. Load-related flake in `coachingAddonUsdPrice.test.ts` (passes standalone).
3. No real viewport-resize tool; 375px is verified through a same-origin iframe.
4. No Safari/Firefox run, no visual-regression baseline, no real screen-reader session. The keyboard and accessible-name contracts are covered by automated tests and the live axe audit, but a human screen-reader pass is still a separate exercise.
5. `componentPath` catalog values remain `@/components/tools/bmi` etc.; this is valid because the shims re-export the pilot modules, but the names are not literally the pilot files.

## 10. Risks and explicit owner decisions needed

- **Imperial stop deviation from the earlier spec:** 66.2–661.3 lb / 39.4–98.4 in replaces 66–661 / 39–98. This is required for validity at the slider endpoints; the spec was updated. If the owner requires the exact old numbers, the alternative is clamping at the slider boundary, which would display a stop that is not the true minimum.
- **Boundary rounding:** 30 kg → 48 g/day while 66.2 lb (30.03 kg) → 49 g/day; the two displays are physically almost identical but the engine output differs by one gram. This is the engine's real rounding, not a UI error.
- **Accessibility (resolved in principle):** the shared chrome defects are fixed and all three R5 tools score **1.00** with zero failing axe audits. Because the shared header/footer/logo/route are used by every tool, the fix was regression-tested across consumers (`shared/ui` 3 files / 20 tests, `header-preferences` 17 files / 84 tests, targeted R5 + smarttools 15 files / 45 tests). A human screen-reader pass and Safari/Firefox runs remain out of scope.
- **Uncommitted tree:** the R5 work remains uncommitted by instruction. It must be committed by the owner before any deployment.
- **Pre-existing failures:** they should not be counted as R5 regressions, but the owner should treat them as a separate release gate.

## 11. Preservation and constraints

- Master SHA-256 remains `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`.
- HEAD remains `108d3063bdcbca9604ad9b7b48844b85763d51a0`.
- No commit, push, merge, deployment, Supabase, database, RLS or migration action.
- No tool deletion, renaming, renumbering or route change; no engine change; no Macro rewrite; no archives rebuilt or remerged.

## 12. Shared accessibility remediation (owner-approved)

Scope: the three R5 tools plus the shared components they consume (header, logo, footer, canonical tool route). Every shared change was regression-tested against the other consumers, not only the three R5 tools.

### 12.1 Before → after

| Audit | Baseline | After |
|---|---|---|
| Lighthouse accessibility · BMI | 0.93 | **1.00** |
| Lighthouse accessibility · Protein Needs | 0.91 | **1.00** |
| Lighthouse accessibility · Water Intake | 0.91 | **1.00** |
| `color-contrast` | breadcrumb `#71717a` on `#0e0543` = 3.87:1; sub-nav `#71717a` on `#0c0727` = 4.04:1 | **0 failing nodes** |
| `heading-order` | footer `h3` immediately after the tool `h1`; column headings `h4` | **0 failing nodes**; live order `H1→H2→H3…` |
| `target-size` | logo button obscured by its own nested `role="button"` span (81.9×1.8 px hit area) | **0 failing nodes**; 44 px minimum target |
| landmark | tool shell rendered no `<main>` | **exactly one `<main>`** per R5 route |

### 12.2 Implementation (TDD RED→GREEN)

| File | Change | Why |
|---|---|---|
| `shared/ui/GlobalHeader.tsx` | Desktop and mobile language names now include the visible label (`Switch language — عربي`, `تغيير اللغة — EN`, `… — العربية`); measurement names include `MET/IMP` (`Metric/Imperial` on mobile); brand button `min-h-11 min-w-11`; sub-nav dark text `dark:text-zinc-400`. | WCAG 2.5.3 label-in-name, target size, contrast. |
| `shared/ui/DynamicBrandLogo.tsx` | Interactive props (`role="button"`, `tabIndex`, key handler) applied **only** when `onClick` exists. | The header logo is presentational; the old nested control created a second actionless tab stop and obscured the real button. |
| `shared/ui/Footer.tsx` | Payment heading `h3→h2`; four column headings and compliance heading `h4→h3`. | Heading order. |
| `app/smarttools/[category]/[tool]/page.tsx` | Breadcrumb `dark:text-zinc-400`; current crumb `aria-current="page"`. | Contrast (3.87:1 → 4.5:1+) and current-page semantics. |
| `components/tools/bmi-pilot.tsx`, `protein-needs-pilot.tsx`, `water-intake-pilot.tsx` | Shell `div→main`. | Landmark, scoped to the three R5 tools. The shared route layout was deliberately **not** changed: 250+ other tools already own a `<main>`, so a layout landmark would nest landmarks. |

### 12.3 Tests and regression

- New accessibility tests were written first and observed failing **13/13** for the intended reasons: `shared/ui/globalHeader.a11y.test.tsx` (6), `shared/ui/footer.a11y.test.tsx` (1), `app/smarttools/[category]/[tool]/page.a11y.test.tsx` (1), `components/tools/r5-main-landmark.test.tsx` (3). Then **13/13 GREEN**.
- `shared/ui`: 3 files / **20 tests** pass.
- `header-preferences` consumers: 17 files / **84 tests** pass.
- Targeted R5 + smarttools: 15 files / **45 tests** pass.
- `npx tsc --noEmit`: exit 0. `npm run lint`: exit 0, **489 warnings / 0 errors**, identical to the pre-fix baseline.

### 12.4 Live DOM evidence (375 px iframe, AR RTL)

| Route | `htmlDir` | `mainDir` | `<main>` count | `scrollWidth` vs `clientWidth` | unclipped offenders |
|---|---|---|---|---|---|
| BMI | rtl | rtl | 1 | 358 = 358 | 0 |
| Protein Needs | rtl | rtl | 1 | 358 = 358 | 0 |
| Water Intake | rtl | rtl | 1 | 358 = 358 | 0 |

Additional live checks on the shared header:

- Brand button: **0** nested focusables, no nested `role="button"`; computed CSS height **47.99 px**, `min-height`/`min-width` **44 px**.
- Language control: `Switch language — عربي`; measurement control: `Switch measurement system — IMP/MET`.
- Breadcrumb computed colour: **`rgb(161,161,170)`** on the dark tool surface.
- Footer headings: payment `H2`, then `H3` columns — no skipped level.
- Exactly one `<main>` per route.

## 13. Smart-output quality review (the owner's six criteria)

The review used the live EN and AR outputs, not source intent alone. Each value below is rendered by the tool's real engine (`lib/tools/r5/*`), and the input that produced it is noted.

**1. Interpretation is tied to the result and the inputs.**
- **BMI:** “Your BMI is **4.4** points above the lower boundary (**18.5**) and **2.1** points below the upper boundary (**25.0**).” The result is 22.9 at 70 kg / 175 cm; the gap text is computed from the same BMI value. The category paragraph says “Your result is in the normal-weight screening range…”.
- **Protein:** “At **154.3 lb** with activity **1.2**, the same engine estimates **113 g/day** to maintain, **141 g/day** to build muscle and **156 g/day** for weight loss. Your selected goal is **113 g/day**.” The weight is the display-unit conversion of 70 kg; the scenarios and the selected goal are interpolated.
- **Water:** “At **70 kg**, the same engine estimates **2.45 L/day** at baseline, **2.5 L/day** at moderate and **2.55 L/day** at very active. This is a starting reference, not an individual requirement.” The result is 2.5 L/day at activity 1.2.

**2. Advice is specific to the tool, not generic copy.**
- **BMI:** “Maintaining current habits is reasonable for many people. Use BMI as one screening signal alongside how you feel and other health measures.” (category-mapped advice).
- **Protein:** “Spread your daily protein across meals. Total intake and overall diet quality matter more than counting exact timing.”
- **Water:** “Treat it as a starting point and adjust for climate, sweat, thirst and any professional guidance. Food and other drinks also contribute to daily fluid.”
 No advice text is shared across the three tools; each addresses its own measurement.

**3. Current status is clear.**
- All three expose `Calculation complete` / `اكتمل الحساب`, required-input progress (`2 of 2` for BMI/Water, `3 of 3` for Protein), `Result type: CALCULATED`, and a visible `Selected` / `المحدد` marker on the active scenario.

**4. Reports are specialized, not static.**
- **BMI:** category interpretation, distance to both category boundaries, and a same-height what-if table (65/70/75 kg → **21.2 / 22.9 / 24.5**; 143.3/154.3/165.3 lb in imperial with the current row marked).
- **Protein:** maintain/build-muscle/weight-loss comparison at the user's current weight and activity, with the selected goal marked.
- **Water:** activity comparison at the user's current weight, plus US fl oz only in imperial (2.5 L → **85 US fl oz**).
- The result, interpretation, scenarios and advice all recompute from the engine output; no result string is hardcoded.

**5. Future scenarios are methodologically sound where offered.**
- **BMI:** ±5 kg at the same height, each row calculated by the same BMI engine.
- **Protein:** the same engine at its documented 1.6 / 2.0 / 2.2 g/kg goal factors with the user's activity factor.
- **Water:** the same engine at activity levels 1 / 1.2 / 1.4 with the user's weight.
- The details panels disclose the assumptions: “coarse, user-selected, not measured” and “Application-designed SPEC v3 convention; it is not externally validated or clinically reviewed.”

**6. No fabricated recommendations, predictions or medical information.**
- Each tool carries an explicit non-diagnosis/non-prescription warning and a caution for pregnancy, breastfeeding, kidney/heart disease or diuretics where relevant.
- No tool predicts a health outcome, recommends a drug or dose, or invents a citation. The only external reference is the CDC BMI category guidance, correctly described as screening guidance rather than diagnosis.
- AI status is `NOT_CONFIGURED`; no AI-generated copy is presented as fact.

## 14. Final verification and acceptance gate

| Gate | Result |
|---|---|
| `npm run validate-tools` | **exit 0 — 5/5** |
| `npm run build` | **exit 0 — compiled successfully; 502 static pages generated** |
| Accessibility tests | **13/13** (RED first, then GREEN) |
| Shared consumers | `shared/ui` 20/20; `header-preferences` 84/84; targeted R5 + smarttools 45/45 |
| `npx tsc --noEmit` | **exit 0** |
| `npm run lint` | **exit 0 — 0 errors, 489 warnings** (identical baseline) |
| Lighthouse accessibility | **BMI 1.00, Protein 1.00, Water 1.00; zero failing axe audits** |
| Full suite | **17 failed / 5235 passed / 5 skipped (559 files)** — documented pre-existing payment/checkout/security failures; **not green** |

Preservation: master SHA-256 remains `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`; HEAD remains `108d3063bdcbca9604ad9b7b48844b85763d51a0`. No commit, push, merge, deployment, Supabase, database/RLS/migration, route/ID/registry, engine, or Macro change was performed. The pre-existing unrelated working-tree changes (`app/api/dashboard/metrics/route.ts`, `components/tools/macro-pilot.tsx`, `components/tools/macro-pilot.module.css`, `tests/integration/dashboardPersistence.test.ts`) were not touched.

**R5 first batch: remediation verified in principle; shared accessibility fixes approved; final owner acceptance pending.**  
**Batch 2 and the 255-tool expansion: not started; blocked until explicit final owner acceptance.**