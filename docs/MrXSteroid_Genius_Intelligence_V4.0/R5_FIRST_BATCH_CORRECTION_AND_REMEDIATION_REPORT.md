# R5 FIRST BATCH CORRECTION AND REMEDIATION REPORT

**BMI, Protein Needs and Water Intake: what was actually fixed**

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

> Read-only audit. No code, schema, route, registry, database, RLS, Macro or frozen document was changed. No commit, push, merge or deployment was performed.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

## 1. Verdict

The R5 first batch is implemented and verified in the live app. The three tools now use their real engines for interpretation, advice and scenarios; the shared accessibility defects found during the batch are fixed; and all three score **1.00** on Lighthouse accessibility with **zero failing axe audits**. The batch is **closed pending explicit owner acceptance**. Batch 2 has not started.

## 2. Scope

| Tool | Engine | Route |
|---|---|---|
| BMI | `lib/tools/engines/bmi.v6.ts` (via the pilot) | `/smarttools/body-composition/bmi` |
| Protein Needs | protein engine (via the pilot) | `/smarttools/nutrition/protein-needs` |
| Water Intake | water engine (via the pilot) | `/smarttools/nutrition/water-intake` |

Shared files touched: `shared/ui/GlobalHeader.tsx`, `shared/ui/Footer.tsx`, `components/layouts/DynamicBrandLogo.tsx`, `app/smarttools/[category]/[tool]/page.tsx`, `components/tools/tool-pilot-v4.module.css`, `components/tools/SafetyNotice.tsx` (audit only; the bilingual defect remains open), plus R5 tests and the spec.

## 3. Source changes

| File | Change |
|---|---|
| `components/tools/bmi-pilot.tsx` | engine-derived category interpretation, adult-applicability notice, boundary gap, ±5 kg what-if table, category advice; corrected imperial bounds; EN/AR guidance; `locale` passed to the shared slider |
| `components/tools/protein-needs-pilot.tsx` | engine-derived maintain/bulk/cut comparison at the current weight and activity; dynamic interpretation; goal-specific advice; display-unit weight; corrected bounds |
| `components/tools/water-intake-pilot.tsx` | engine-derived activity scenarios, interpretation, advice and caution; US fl oz only in imperial; display-unit weight; `<main>` shell |
| `shared/ui/GlobalHeader.tsx` | accessible names for language/measurement controls; 44px brand target; sub-nav dark contrast |
| `components/layouts/DynamicBrandLogo.tsx` | interactive props only when `onClick` exists; no nested focusable |
| `shared/ui/Footer.tsx` | heading hierarchy |
| `app/smarttools/[category]/[tool]/page.tsx` | breadcrumb contrast; `aria-current="page"` |
| `components/tools/tool-pilot-v4.module.css` | 44px slider hit area; 8px painted track; RTL |

No route, ID, registry entry, database, RLS, Macro file or frozen document was changed.

## 4. Defects found and fixed

1. **Imperial slider stops were physically invalid.** 39 in = 99.06 cm, below the 100 cm canonical minimum; height had the same failure. RED test failed 6/9. The fix uses the smallest 0.1 display stop inside the canonical range.
2. **Raw canonical weight leaked into explanations.** The user saw kg while the Header was imperial. Fixed by passing display-unit weight to the narrative.
3. **English accessible names in Arabic mode.** “Set weight” / “Precise input” were announced in Arabic. `DynamicSliderField` now accepts `locale` and announces localized labels; physical unit symbols stay kg/cm/lb/in.
4. **Touch target was 7px.** The native range input was only as tall as the painted track. CSS now gives it a 44px hit area while the visible track remains 8px, including RTL.
5. **Shared chrome defects:** breadcrumb contrast, missing `<main>`, language-button accessible name, header heading hierarchy, footer heading hierarchy, logo target size/nested control.

## 5. Verification evidence

| Check | Actual result |
|---|---|
| R5 batch tests (final) | **exit 0 — 17 files / 81 tests passed** |
| Accessibility RED→GREEN | **13 failed → 13 passed** (4 files: header, footer, route breadcrumb, R5 landmarks) |
| Targeted R5 + shared regression | **15 files / 45 tests passed**; `shared/ui` 20; `header-preferences` 84 |
| TypeScript / ESLint / build | `tsc` pass; lint pass; build 502 static pages |
| `validate-tools` | **5/5 passed** |
| Lighthouse accessibility | BMI **0.93 → 1.00**, Protein **0.91 → 1.00**, Water **0.91 → 1.00**; zero failing axe audits |
| Full suite | **559 files, 17 failed / 5235 passed / 5 skipped** — not green; all failures are pre-existing payment/checkout/security/merchant files |
| 375px iframe | no page-level horizontal scroll (358 = 358); RTL; exactly one `<main>`; 0 unclipped offenders |
| Slider hit area | 44px computed/offset/client height; painted track 8px |

### 5.1 Live values

- BMI: 70 kg / 175 cm → **22.9**; what-if 65/70/75 kg → **21.2 / 22.9 / 24.5**; imperial 154.3 lb / 68.9 in → **22.9**.
- Protein: 70 kg / activity 1.2 / maintain → **113 g/day**; scenarios **113 / 141 / 156 g/day**; imperial 154.3 lb → **113 g/day**; boundaries 30 kg → 48 g/day, 300 kg → 485 g/day; 29.9/300.1 rejected.
- Water: 70 kg / activity 1.2 → **2.5 L/day (2500 mL)**; scenarios **2.45 / 2.5 / 2.55 L/day**; imperial adds **85 US fl oz** (2.5 L → 84.5 → 85).

## 6. Known limitations

- The full suite is **not green**; 17 pre-existing failures remain outside R5.
- The 375px check is an iframe, not a real device resize.
- No Safari/Firefox run, no visual-regression baseline and no human screen-reader session.
- The shared `SafetyNotice` still renders both languages with fixed `dir`; this is an open shared defect recorded in the global audit.
- The route breadcrumb and metadata remain English-only; the R5 tools themselves are localized.
- Formula verification for the rest of the catalog is **NOT RUN**.

## 7. Status

**PASS (R5 scope) — pending owner acceptance.** This report is not an acceptance record. The owner decision is in `R5_FIRST_BATCH_FINAL_PREVIEW_AND_ACCEPTANCE_REPORT.md`.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
