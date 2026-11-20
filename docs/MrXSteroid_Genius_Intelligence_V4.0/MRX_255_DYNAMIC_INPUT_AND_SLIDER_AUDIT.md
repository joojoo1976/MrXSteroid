# MRX_255_DYNAMIC_INPUT_AND_SLIDER_AUDIT.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. R5 acceptance pending; Batch 2 blocked.

## 1. Verdict

Dynamic, measurement-aware input is a pilot feature, not a platform capability. Only 8 of 264 implemented tools render a slider. The R5 pilots prove the shared model works; the other 5 slider-bearing tools and the remaining 256 tools are not runtime-verified in this pass.

## 2. Slider-bearing tools

| Tool | Sliders | Status |
|---|---:|---|
| BMI (`bmi`) | 3 | R5 PASS (pending acceptance) |
| Protein Needs (`protein-needs`) | 2 | R5 PASS (pending acceptance) |
| Water Intake (`water-intake`) | 2 | R5 PASS (pending acceptance) |
| Adaptive Macro Calculator (`macro`) | 1 | NOT RUN |
| HPTA Recovery Modeler (`hpta-recovery`) | 1 | NOT RUN |
| Unvalidated Aromatization Scenario (`aromatization-risk`) | 3 | NOT RUN |
| PCT Timing Engine (`pct-timing`) | 3 | NOT RUN |
| HCG & SERM Protocol (`hcg-serm-protocol`) | 2 | NOT RUN |

## 3. R5 verified behavior

- Canonical value is preserved when the display unit changes.
- Imperial bounds were corrected: previous upper bound 39 in = 99.06 cm, which was below the intended 100 cm; 6 of 9 boundary tests failed before correction.
- Slider target is 44px.
- Reduced Motion is respected.
- Metric → Imperial → Metric round-trip returns the canonical value within documented precision.
- BMI: 70 kg/175 cm → 22.9; 154.3 lb/68.9 in → 22.9.
- Protein: 70 kg/activity 1.2 → 113 g/day; scenarios 113/141/156.
- Water: 70 kg/1.2 → 2.5 L; scenarios 2.45/2.5/2.55; imperial 85 US fl oz.

## 4. Requirements for any slider or dynamic input

- Choose the control type by domain and field.
- Support precise manual numeric entry alongside the slider.
- Support touch, mouse, and keyboard.
- Show the current value clearly.
- Show appropriate ticks and labels.
- Use accurate min/max/step.
- Reject invalid values with a reason.
- Update the result on change.
- Keep slider and manual input bound to one canonical state.
- Prevent double conversion or raw display values.
- Respect Reduced Motion.
- Do not let animation affect calculation or precision.

## 5. Measurement-aware requirements

The Global Header unit switch must actually change:

- displayed unit;
- displayed value;
- min/max/step;
- ticks;
- display precision;
- manual value;
- displayed result and report values.

The canonical engine value must not change. Conversion occurs only between canonical value and display unit. Every measurement-affected tool must be tested with Metric → Imperial → Metric.

## 6. Current gap

- 138 implemented tools do not read the global measurement preference.
- 256 implemented tools use native number/text inputs or no numeric input.
- 142 catalog entries have no i18n JSON.
- Shared breadcrumb and SafetyNotice defects affect all tools.
- Sliders are not required on every tool; a slider is wrong where the domain needs a select, date, text, file, or structured control.

## 7. Required triage before rollout

For each tool, classify each input as:

- slider-appropriate;
- numeric-only;
- select/enum;
- date/time;
- text or structured;
- file/vision;
- not applicable.

Then implement the shared measurement-aware input primitive once, with consumer regression. No tool may rename units without rescaling.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
