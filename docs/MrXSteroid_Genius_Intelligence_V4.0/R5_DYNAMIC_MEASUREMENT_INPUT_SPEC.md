# R5_DYNAMIC_MEASUREMENT_INPUT_SPEC

**Date:** 2026-11-06  
**Scope:** BMI, Protein Needs, Water Intake. Home context: `shared/ui/UnitToggle.tsx` (Header) → `PreferencesContext` → `useToolDisplayPreferences()` → pilots.

## 1. Canonical engine boundaries (units are mine to choose; engines are read-only)

| Field | Tool(s) | Canonical unit | Canonical min | Canonical max | Canonical step | Display ↔ canonical |
|---|---|---|---|---|---|---|
| `weightKg` | BMI / Protein / Water | kg | 30 | 300 | 0.5 | Imperial: lb = kg / 0.45359237 |
| `heightCm` | BMI | cm | 100 | 250 | 0.5 | Imperial: in = cm / 2.54 |

| Tool | Input | Metric display | Imperial display | Display step metric / imperial | Display precision |
|---|---|---|---|---|---|
| BMI | weight | kg | lb | 0.5 kg / 0.1 lb | 1 |
| BMI | height | cm | in | 0.5 cm / 0.1 in | 1 |
| Protein | weight | kg | lb | 0.5 kg / 0.1 lb | 1 |
| Water | weight | kg | lb | 0.5 kg / 0.1 lb | 1 |

**Imperial stop alignment (mandatory).** The imperial stops must convert *inside*
the canonical range, otherwise the slider's own endpoint produces an `INVALID`
result. Therefore the stops are `66.2–661.3 lb` (`30.03–299.96 kg`) and
`39.4–98.4 in` (`100.08–249.94 cm`), not the truncated `66–661 lb / 39–98 in`
of the earlier draft. Step `0.1` keeps the endpoints reachable at display precision.

## 2. Behavioral contract (non-negotiables)

1. **Canonical first** — the engine only ever sees kg / cm. Unit conversion is display-boundary only.
2. **No double conversion** — switching Metric↔Imperial repeatedly must never change the canonical value nor drift it by more than half the display precision (≤ 0.05 kg display round-trip).
3. **Min/Max/Step are system-specific** — when the Header toggle flips, slider bounds, ticks, step, precision, labels and tick marks must change; the underlying canonical stays fixed.
4. **Live calculation** — any slider or manual-input change runs `recalculate()` synchronously inside the change handler. No effect/debounce tricks; no debounce is added (engine is deterministic and cheap).
5. **Slider and manual input share one state** — no divergence. List `min`/`max` on the `<input type="range">` and mirror on the `<input type="number">`.
6. **Accessibility** — `aria-valuemin/max/now/valuetext`, `role="slider"`, `tabIndex=0`, keyboard arrows/Home/End, focus-visible, screen-reader text, slider label tied by `htmlFor`/aria-labelledby; respect `prefers-reduced-motion`.
7. **Bounds enforcement** — values out of range are rejected into the `INVALID` envelope with a localized alert. Engines are never reached with impossible input.
8. **Progressive disclosure** — none of these tools gained graph/chart sections; the sliders ARE the interactive affordance. No visual decoration added unless it carries information.
9. **Imperial default weight values are canonical-adjusted** — the Imperial slider represents lb; moving the thumb updates canonical kg continuously.

## 3. Component to build

`components/tools/dynamic-slider-field.tsx` (additive, new file, shared by the three pilots):

```
<DynamicSliderField
  id="weight"
  label={tWeightLabel}         // localized string
  unitSystem={metric|imperial} // from useToolDisplayPreferences()
  dir={rtl|ltr}
  value={canonicalValue}       // number | undefined
  bounds={{
    metric: { min: 30, max: 300, step: 0.5, precision: 1, unit: 'kg' },
    imperial: { min: 66.2, max: 661.3, step: 0.1, precision: 1, unit: 'lb' },
  }}
  onChange={(canonical) => …} // receives canonical number
  datalistId / ticks?          // optional ms visual ticks
  hint={"..."}                 // optional inline help
/>
```

Implementation notes:
- Native `<input type="range">` (keyboard + SR work out of the box), custom CSS `--fill-pct` for the track fill (our own CSS in `tool-pilot-v4.module.css` — additive).
- Right: `<input type="number">` with identical bounds; they sync both ways.
- RTL: track renders correctly under `dir="rtl"` (Arabic mode).
- `aria-valuetext` = `"${value} ${unit}"` localized suffix; `aria-labelledby` ties slider to its visible label.
- No libraries/deps.
- `DynamicSliderField` contains no business logic; the pilots supply `onChange`.

## 4. Integration plan per tool

| Tool | Inputs rendered as sliders | Precise input | Slider range |
|---|---|---|---|
| BMI | weight slider + height slider | yes each | w 30–300 kg / 66.2–661.3 lb · h 100–250 cm / 39.4–98.4 in |
| Protein Needs | weight slider | yes | 30–300 kg / 66.2–661.3 lb |
| Water Intake | weight slider | yes | 30–300 kg / 66.2–661.3 lb |

Each pilot renders the **Calculate** button as well (no visual regression for retained tests) but also recomputes live on every slider/manual change.

## 5. Out-of-range & invalid behavior

- Manual input out of range → engine is NOT called; `adapt*InvalidToV4` envelope with a localized error guidance; **exactly one** `role="alert"`; no result rendered.
- Empty value → treated the same as "partial": empty guidance + missing-list, no result, no alert.
- NaN / non-numeric parse → invalid path.

## 6. Tests to add (TDD)

For each of the three tools, in `<tool>-pilot.v4.test.tsx`:
- slider exists, correct min/max/step/unit for the active system;
- dragging slider updates precise field **and** result (no button click);
- precise field updates slider thumb;
- out-of-range value → single alert, no result;
- toggling Metric⇄Imperial preserves physical meaning (70 kg ↔ 154.3 lb);
- RTL/LTR render with correct `dir` and slider aria;
- empty slider/field behaves as partial state.

Plus shared slider unit tests for conversion math. Target: new suite(s) green + retained suites stay green.

## 7. Accessibility & mobile

- `role="slider"` native, keyboard ↑↓/←→/Home/End work with `step`.
- `prefers-reduced-motion` → CSS transition disabled.
- Mobile: stacked layout (label row, slider full width, precise field below), 44px touch targets; 375px single column preserved by additive CSS.

## 8. Not done (documented here to stop drift)

- No US Customary (the Header toggle has only metric/imperial; out of scope of R5 owner approval).
- No logarithmic slider scales (weight range is human-comprehensible linearly).
- No `type="range"` polyfill; no new dependency.
- No slider for activity (discrete enum select is clearer and preferred).
