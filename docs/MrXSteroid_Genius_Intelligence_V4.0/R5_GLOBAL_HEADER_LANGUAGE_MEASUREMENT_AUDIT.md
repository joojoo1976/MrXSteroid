# R5 GLOBAL HEADER LANGUAGE AND MEASUREMENT AUDIT

**Does the Header control actually reach the tool, the result and the report?**

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

> Read-only audit. No code, schema, route, registry, database, RLS, Macro or frozen document was changed. No commit, push, merge or deployment was performed.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

## 1. Verdict

The Header controls are functionally wired for the three R5 pilots, but they are not a platform-wide contract. **142 implemented tools have no tool-specific i18n JSON** and **138 do not read the global measurement preference**. The shared route still renders an English-only breadcrumb and metadata, and `SafetyNotice` always renders Arabic and English together with fixed `dir` attributes. A user can switch to Arabic or imperial and still see English chrome or canonical units in most of the catalog.

The R5 evidence proves the intended model works: canonical values are preserved, display units change, Arabic/RTL renders, and the accessibility score reaches 1.00. The problem is coverage, not an impossibility.

## 2. Verified state flow

| Layer | Evidence | Current behavior | Status |
|---|---|---|---|
| Header controls | `shared/ui/GlobalHeader.tsx`; 17 `header-preferences` test files / 84 tests | language and measurement preferences are read/written through the shared preference mechanism | PASS for R5 consumers |
| Preference persistence | existing preference tests | selected value survives navigation in the tested flows | PASS for R5 |
| Route shell | `app/smarttools/[category]/[tool]/page.tsx` | renders the tool; breadcrumb uses English fields | PARTIAL |
| Breadcrumb | L72 `{cat.nameEn}`; L74 `{entry.titleEn}` | English labels in both locales; `aria-current="page"` present | FAIL (language) |
| Metadata | L29 `title: entry.titleEn`; L32 `entry.titleEn` | server metadata is English-only | FAIL (language) |
| Safety notice | `components/tools/SafetyNotice.tsx` L24/L27 | always renders Arabic + English, fixed `dir="rtl"`/`dir="ltr"` | FAIL (language) |
| Main landmark | layout L38 renders `{children}` without `<main>` | tools must supply their own; 60 do, 204 do not | FAIL (accessibility) |
| Measurement | 126/264 read `unitSystem` | canonical/display separation only in tested tools | PARTIAL |
| Slider | 8 tools render one | 44px target, localized ARIA and imperial stops verified only for R5 | PASS for R5; NOT RUN elsewhere |

## 3. Language findings

### L-01 — Missing tool i18n JSON is the default, not the exception

142 implemented tools have no `i18n/<slug>.json`. Some contain inline bilingual strings, but inline strings are not a contract: they are easy to miss, hard to test, and often leave English fragments in Arabic mode. The dossier records the exact state per tool.

### L-02 — The shared safety notice ignores the selected language

`SafetyNotice.tsx` L24 renders the Arabic paragraph with `dir="rtl"` and L27 renders the English paragraph with `dir="ltr"` unconditionally. In English mode the user sees Arabic; in Arabic mode the user sees English. This is not a bilingual feature; it is a locale leak on every route that mounts the notice.

### L-03 — Breadcrumb and metadata are English constants

The route breadcrumb uses `cat.nameEn` (L72) and `entry.titleEn` (L74) even when the page is Arabic. The metadata title/description also use English fields (L29/L32). A translated tool can therefore show an English breadcrumb and an English browser title.

### L-04 — Title/scope drift is a language-independent promise defect

39 catalog titles narrow the slug’s advertised capability to a “Record” or “Note”, while the slug still promises an analyzer/modeler/optimizer. This is not a translation problem, but it makes every language version misleading. Examples: `tool-200-antioxidant-manager` → “Item Record”; `tool-235-grocery-basket-optimizer` → “Basket Record”.

### L-05 — AI language support is not proven per tool

The explain route accepts a locale and the R5 pilots localize their narratives, but only 34 tools publish typed result findings. There is no per-tool test that the AI explanation is in the selected language and contains no English fragment. **Status: NOT RUN.**

## 4. Measurement findings

### M-01 — Reading the preference is not the same as a field-level contract

126/264 tools contain a `unitSystem` read, but that only proves the component can see the preference. The audit did not find field-level metadata (canonical unit, display unit, canonical/display min/max, step, precision, conversion functions) in most tools. A label swap without rescaling is still possible.

### M-02 — Only 8 tools render a slider

macro (1), hpta-recovery (1), aromatization-risk (3), pct-timing (3), hcg-serm-protocol (2), bmi (3), protein-needs (2), water-intake (2). The other 256 tools use native number/text inputs or no numeric input. Sliders are not required everywhere; the defect is that dynamic, measurement-aware input is a pilot feature rather than a shared capability.

### M-03 — R5 proves the correct measurement behavior

- BMI: 70 kg / 175 cm → 22.9; imperial 154.3 lb / 68.9 in → 22.9; repeated metric→imperial→metric returns to 70 kg / 175 cm.
- Protein: 70 kg / activity 1.2 → 113 g/day; imperial 154.3 lb → 113 g/day; the interpretation says “At 154.3 lb”, not the raw kg.
- Water: 70 kg / 1.2 → 2.5 L/day (2500 mL); imperial adds 85 US fl oz from the same 2.5 L (84.5 → 85).
- Slider hit area: 44px computed/offset/client height; painted track remains 8px; RTL treated the same.
- Imperial slider stops are physically valid (min 66.2 lb / max 661.3 lb for the weight field; no stop below the canonical 30 kg / above 300 kg).

### M-04 — Measurement coverage is uneven by category

| Category | Impl. | Reads measurement | Missing |
|---|---:|---:|---:|
| AI Behavior | 6 | 1 | 5 |
| AI Nutrition Vision | 9 | 1 | 8 |
| Body Composition | 10 | 8 | 2 |
| Contest Prep | 3 | 0 | 3 |
| Cycle Management | 13 | 10 | 3 |
| Homebrew Chemistry | 8 | 2 | 6 |
| Hormonal Health | 24 | 19 | 5 |
| Injection & Formulation | 8 | 4 | 4 |
| Measurement Conversion | 2 | 1 | 1 |
| Medical Monitoring | 73 | 34 | 39 |
| Nutrition | 19 | 18 | 1 |
| Pharmacokinetics | 41 | 9 | 32 |
| Platform AI | 7 | 2 | 5 |
| Reproductive Wellbeing | 19 | 2 | 17 |
| Training & Recovery | 22 | 15 | 7 |
| **Total** | **264** | **126** | **138** |

Nutrition is the strongest (18/19); medical monitoring (34/73), pharmacokinetics (9/41), reproductive wellbeing (2/19) and AI behavior (1/6) are the weakest.

## 5. R5 language/measurement proof (recorded)

| Check | BMI | Protein | Water |
|---|---|---|---|
| English default | 22.9 / normal | 113 g/day | 2.5 L/day |
| Arabic | same values, localized labels | 113/141/156, selected marker, AR/EN advice | 2.5 L, localized guidance |
| Imperial | 154.3 lb / 68.9 in → 22.9 | 154.3 lb → 113 g/day | 2.5 L + 85 US fl oz |
| 375px iframe | no horizontal scroll (358 = 358) | same | same |
| RTL `<main>` count | exactly 1 | exactly 1 | exactly 1 |
| Lighthouse a11y | 1.00 | 1.00 | 1.00 |
| axe failing audits | 0 | 0 | 0 |

> The 375px check used a same-origin 375px iframe, not a real viewport resize. Safari/Firefox and a human screen-reader pass remain NOT RUN.

## 6. Required shared fixes (before scaling per-tool work)

1. **Locale-aware shared chrome:** breadcrumb, metadata, error/empty states, `SafetyNotice` and `aria-label` text must follow the selected locale. Do not render both languages at once unless the user explicitly requests a bilingual view.
2. **Field-level measurement metadata:** canonical unit, accepted/display units, canonical/display min/max, step, precision, conversion functions and validation constraints. Slider and precise input share one canonical state.
3. **No label-only conversion:** rescale the displayed bounds and value; never reconvert an already converted value.
4. **Shared result contract:** a typed primary result + provenance + limitations + optional scenario block. The AI layer consumes the contract, not scraped text.
5. **Shared accessibility primitives:** one `<main>` per route, labelled controls, 44px targets, reduced-motion support, live-region result announcement.
6. **Automated locale/measurement matrix:** every batch must run EN/AR × metric/imperial × before/after input × navigation, with no reload.

## 7. Test matrix

| Test | Acceptance | Current status |
|---|---|---|
| Header language switch updates labels, errors, results, AI copy | no English fragment in AR; no reload | PASS R5; NOT RUN others |
| RTL direction | document + tool + result in RTL; numbers/units stable | PASS R5; NOT RUN others |
| Measurement switch before input | displayed bounds/value change; canonical unchanged | PASS R5; NOT RUN others |
| Measurement switch after result | result remains physically equal; display unit changes | PASS R5; NOT RUN others |
| Repeated switches | no drift; returns to original canonical value | PASS R5; NOT RUN others |
| Slider + precise input sync | both directions; keyboard/touch/screen reader | PASS R5; NOT RUN others |
| Shared chrome | breadcrumb/safety notice localized; contrast; one main | FAIL (breadcrumb/notice) |
| axe/Lighthouse | zero critical/serious findings | PASS R5; NOT RUN others |

## 8. Status and next action

**Current status: PARTIAL.** R5 is proven; the platform contract is not. Fix the shared chrome and field metadata once, then apply it per batch with the locale/measurement matrix. Do not add a second per-tool preference system. Do not rename kg to lb without rescaling.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
