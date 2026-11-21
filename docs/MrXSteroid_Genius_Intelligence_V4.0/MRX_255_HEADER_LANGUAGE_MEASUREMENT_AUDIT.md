# MRX_255_HEADER_LANGUAGE_MEASUREMENT_AUDIT.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. R5 acceptance pending; Batch 2 blocked.

## 1. Verdict

Language and measurement switching is not yet a platform capability. R5 proves the model for 3 tools. 142 catalog entries have no i18n JSON, 138 implemented tools do not read the global measurement preference, and shared chrome defects affect every tool.

## 2. Language requirements

Switching Arabic/English must change:

- all visible text;
- labels;
- input errors;
- recommendations;
- reports;
- unit names;
- tooltips;
- loading and failure states;
- RTL/LTR direction.

Changing `lang` or `dir` alone is not sufficient.

## 3. Measurement requirements

Switching measurement systems must change:

- displayed units;
- displayed values;
- min/max/step;
- ticks;
- display precision;
- manual values;
- displayed results and report values.

The canonical engine value must not change. There must be no double conversion.

## 4. Current evidence

| Metric | Count |
|---|---:|
| Catalog entries | 268 |
| Implemented tools | 264 |
| Tools with i18n JSON | 122 |
| Catalog entries without i18n JSON | 146 (142 implemented) |
| Tools reading global measurement preference | 126 |
| Implemented tools without measurement integration | 138 |
| Tools with ARIA affordance | 98 |
| Implemented tools without ARIA | 166 |
| Tools with `<main>` landmark | 60 |
| Implemented tools without `<main>` | 204 |
| Tools with visual primitive | 5 |
| Implemented tools without visual primitive | 259 |

R5 pilot evidence: BMI, Protein Needs, and Water Intake pass Lighthouse accessibility at 1.00, with zero failing axe audits, after correcting imperial bounds and adding ARIA/measurement-aware inputs.

## 5. Shared defects requiring one fix with full consumer regression

1. `components/tools/SafetyNotice.tsx` lines 24 and 27: always renders Arabic and English with fixed `dir`, regardless of locale.
2. Route breadcrumb in `app/smarttools/[category]/[tool]/page.tsx` lines 72 and 74: uses `nameEn`/`titleEn` in both locales.
3. Metadata generation in the same file uses `titleEn`/`descriptionEn` for all locales, so search/social metadata is not localized.
4. Measurement is read by only 126 of 264 implemented tools.
5. Only 8 tools render a slider.
6. 204 implemented tools lack a `<main>` landmark; R5 added it to the three pilot shells rather than the shared layout because other tools render their own `<main>`.

## 6. Test requirements

Every measurement-affected tool must be tested with:

- Metric → Imperial → Metric round-trip.
- canonical value unchanged;
- displayed value rescaled;
- min/max/step rescaled;
- ticks rescaled;
- manual entry after switch;
- slider/manual sync;
- no horizontal overflow at 375px;
- Arabic RTL and English LTR.

## 7. Owner decision required

Shared chrome fixes affect every tool and must be implemented once with consumer regression, not once per tool. This requires explicit owner approval before code changes.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
