import { LabRangeProfile, LabTestData } from '../../data/labReference';

/**
 * PURE LAB MATHEMATICS ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure, side-effect-free functions for medical reference-range math:
 *  - SI ↔ US unit conversion with explicit per-test precision
 *  - Floating-point-safe rounding / range formatting
 *  - Dynamic status evaluation (low / normal / high)
 * Designed to be edge-computing & unit-test friendly (no globals, no DOM).
 */

export type LabUnitSystem = 'metric' | 'imperial';
export type LabStatus = 'low' | 'normal' | 'high';

/** Rounds to a target number of decimals, guarding against FP artifacts (e.g. 2.4999 → 2.5). */
export const roundTo = (value: number, decimals = 0): number => {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/** Formats a number to `decimals` places, stripping trailing zeros when safe. */
export const formatLabNumber = (value: number, decimals: number): string => {
  if (!isFinite(value)) return '—';
  const fixed = value.toFixed(decimals);
  // Keep meaningful precision but drop ".0" noise for whole-like values
  if (!fixed.includes('.')) return fixed;
  const trimmed = fixed.replace(/0+$/, '').replace(/\.$/, '');
  return trimmed;
};

/** Returns the active (per-unit-system) range profile slice for a test. */
export const getActiveRange = (test: LabTestData, system: LabUnitSystem) =>
  system === 'imperial' ? test.range.us : test.range.si;

/** Formats a single test reference range in the requested unit system. */
export const formatRange = (test: LabTestData, system: LabUnitSystem): string => {
  const { min, max, unit, decimals } = getActiveRange(test, system);
  return `${formatLabNumber(min, decimals)} – ${formatLabNumber(max, decimals)} ${unit}`;
};

/** Formats a status-aware range (min = low boundary, max = high boundary). */
export const formatBound = (value: number, decimals: number): string =>
  formatLabNumber(value, decimals);

/** Converts a lab value from one unit system to the other using the test's profile. */
export const convertLabValueSystem = (
  value: number,
  from: LabUnitSystem,
  to: LabUnitSystem,
  profile: LabRangeProfile
): number => {
  if (!isFinite(value)) return value;
  if (from === to) return value;
  return from === 'metric'
    ? value * profile.siToUs
    : value * profile.usToSi;
};

/** Converts a test's whole range into the requested system (returns {min,max,unit,decimals}). */
export const convertRange = (test: LabTestData, system: LabUnitSystem) => getActiveRange(test, system);

/**
 * Evaluates a lab value against a test's reference range in the active unit system.
 * Returns a status plus a clamped "position" (0..1) and the raw ratio for visualization.
 */
export const evaluateLabValue = (
  value: number,
  system: LabUnitSystem,
  profile: LabRangeProfile
): { status: LabStatus; ratio: number; position: number } => {
  const { min, max } = getActiveRange({ range: profile } as LabTestData, system);

  if (!isFinite(value)) return { status: 'normal', ratio: 0, position: 0 };

  // Guard against degenerate ranges
  const safeMax = max > min ? max : min + 1;
  const ratio = value / safeMax;
  const position = Math.max(0, Math.min(1, (value - min) / (safeMax - min)));

  if (value < min) return { status: 'low', ratio, position };
  if (value > max) return { status: 'high', ratio, position };
  return { status: 'normal', ratio, position };
};

/** Reference-range severity helpers. */
export const isLow = (status: LabStatus) => status === 'low';
export const isHigh = (status: LabStatus) => status === 'high';
export const isNormal = (status: LabStatus) => status === 'normal';

/** Safe clamp. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
