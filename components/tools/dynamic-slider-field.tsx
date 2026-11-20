/**
 * components/tools/dynamic-slider-field.tsx
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Dynamic input system — additive, shared by the R5 tools (BMI / Protein / Water).
 * ═══════════════════════════════════════════════════════════════════════════════
 *  A native <input type="range"> (free keyboard + screen-reader behavior) paired
 *  with a precise <input type="number">. Both share the SAME bounds and emit
 *  the CANONICAL value to the caller. Bounds, step, precision, unit and marks
 *  change with the Header Measurement System via unitSystem.
 *
 *  This component holds no business logic; callers clamp their own domain rules.
 *  `metricImperialConfigFor` is exported for unit tests and reuse.
 */
import React from 'react';

export interface SliderBoundConfig {
  min: number;
  max: number;
  step: number;
  precision: number;
  unit: string;
}

export interface SliderBoundsSet {
  metric: SliderBoundConfig;
  imperial: SliderBoundConfig;
}

/** Pick the bounds matching the active measurement system. */
export function metricImperialConfigFor(
  set: SliderBoundsSet,
  unitSystem: 'metric' | 'imperial'
): SliderBoundConfig {
  return unitSystem === 'metric' ? set.metric : set.imperial;
}

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN;
}

export function inToCm(inch: number): number {
  return inch * CM_PER_IN;
}

/** Convert a CANONICAL value to its display number in the active system. */
export function canonicalToDisplay(
  canonical: number,
  canonicalUnit: 'kg' | 'cm',
  unitSystem: 'metric' | 'imperial',
  precision: number
): number {
  if (unitSystem === 'metric') return Math.round(canonical * 10 ** precision) / 10 ** precision;
  const factor = canonicalUnit === 'kg' ? KG_PER_LB : CM_PER_IN;
  return Math.round((canonical / factor) * 10 ** precision) / 10 ** precision;
}

/** Convert a DISPLAY value back to canonical. */
export function displayToCanonical(
  displayed: number,
  canonicalUnit: 'kg' | 'cm',
  unitSystem: 'metric' | 'imperial'
): number {
  if (unitSystem === 'metric') return displayed;
  const factor = canonicalUnit === 'kg' ? KG_PER_LB : CM_PER_IN;
  return displayed * factor;
}

const DEFAULTS = {
  min: 0,
  max: 100,
  step: 1,
  precision: 1,
  unit: '',
} as const;

export interface DynamicSliderFieldProps {
  id: string;
  label: string;
  unitSystem: 'metric' | 'imperial';
  dir: 'rtl' | 'ltr';
  /** Locale for accessible names; physical unit symbols stay as kg/cm/lb/in. */
  locale?: 'ar' | 'en';
  value?: number;
  bounds?: SliderBoundsSet;
  canonicalUnit?: 'kg' | 'cm';
  onChange: (canonicalValue: number | undefined) => void;
  /** Optional data-testid for the precise input (used by retained tests). */
  dataTestId?: string;
}

function numberPrecision(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function DynamicSliderField({
  id,
  label,
  unitSystem,
  dir,
  locale = 'en',
  value,
  bounds = { metric: { ...DEFAULTS, unit: 'kg' }, imperial: { ...DEFAULTS, unit: 'lb' } },
  canonicalUnit = 'kg',
  onChange,
  dataTestId,
}: DynamicSliderFieldProps) {
  const cfg = metricImperialConfigFor(bounds, unitSystem);
  const sliderAction = locale === 'ar' ? 'اضبط' : 'Set';
  const sliderLabelText = locale === 'ar' ? label : label.toLowerCase();
  const preciseInputLabel = locale === 'ar' ? 'إدخال دقيق' : 'Precise input';
  const displayed =
    value === undefined || !Number.isFinite(value)
      ? ''
      : String(numberPrecision(canonicalToDisplay(value, canonicalUnit, unitSystem, cfg.precision), cfg.precision));

  const emitCanonical = (displayValue: number, clamp: boolean) => {
    if (!Number.isFinite(displayValue)) return;
    if (clamp) {
      const clamped = Math.min(cfg.max, Math.max(cfg.min, displayValue));
      onChange(displayToCanonical(clamped, canonicalUnit, unitSystem));
      return;
    }
    onChange(displayToCanonical(displayValue, canonicalUnit, unitSystem));
  };

  const rawSliderPosition =
    value === undefined || !Number.isFinite(value)
      ? cfg.min
      : numberPrecision(canonicalToDisplay(value, canonicalUnit, unitSystem, cfg.precision), cfg.precision);
  // Keep the thumb/ARIA position inside the declared range even when the
  // canonical endpoint rounds a fraction beyond the system-specific stop.
  const sliderPosition = Math.min(cfg.max, Math.max(cfg.min, rawSliderPosition));

  const fillPct =
    ((sliderPosition - cfg.min) / (cfg.max - cfg.min)) * 100;

  return (
    <div className="grid gap-2" dir={dir}>
      <label htmlFor={`${id}-precise`} className="block font-semibold">
        {label}
      </label>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <input
            id={id}
            type="range"
            role="slider"
            aria-label={`${sliderAction} ${sliderLabelText}`}
            aria-valuemin={cfg.min}
            aria-valuemax={cfg.max}
            aria-valuenow={numberPrecision(sliderPosition, cfg.precision)}
            aria-valuetext={`${displayed === '' ? cfg.min : displayed} ${cfg.unit}`}
            min={cfg.min}
            max={cfg.max}
            step={cfg.step}
            value={sliderPosition}
            onChange={(event) => emitCanonical(Number(event.target.value), true)}
            style={{ ['--fill-pct' as string]: `${Math.min(100, Math.max(0, fillPct))}%` }}
            className="dynamic-slider-field__range"
          />
          <div className="mt-1 flex justify-between text-[0.7rem] opacity-80">
            <span className="tabular-nums">{cfg.min} {cfg.unit}</span>
            <span className="tabular-nums">{cfg.max} {cfg.unit}</span>
          </div>
        </div>

        <div className="w-24">
          <label htmlFor={`${id}-precise`} className="sr-only">
            {preciseInputLabel} ({cfg.unit})
          </label>
          <input
            id={`${id}-precise`}
            type="number"
            inputMode="decimal"
            min={cfg.min}
            max={cfg.max}
            step={cfg.step}
            value={displayed}
            data-testid={dataTestId}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === '') {
                // Empty must mark the input as MISSING — never silently keep a
                // previous value. onChange(undefined) lets the caller emit the
                // empty-inputs envelope + validation alert.
                onChange(undefined);
                return;
              }
              const parsed = Number(raw);
              if (Number.isFinite(parsed)) emitCanonical(parsed, false);
            }}
            className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm tabular-nums dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
      </div>
    </div>
  );
}

export default DynamicSliderField;
