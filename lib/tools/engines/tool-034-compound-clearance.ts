/**
 * Tool #034 — Compound Clearance Calculator
 * Exponential-decay clearance date + residual curve for one compound.
 * Pure calculation engine (no I/O, no DB).
 */

export interface ClearanceInput {
  compound_name: string;
  half_life_days: number;
  half_life_source: string;
  /** ISO-8601 date of the last dose. */
  last_dose_date: string;
  /** Explicit calculation date (UTC calendar date) keeps the engine deterministic. */
  as_of_date: string;
  /** Residual fraction that defines "cleared" (default 0.01 = 1%). */
  threshold_fraction?: number;
}

export interface ClearancePoint {
  days_after_last_dose: number;
  date: string;
  remaining_percent: number;
}

export interface ClearanceResult {
  days_to_threshold: number;
  threshold_date: string;
  days_elapsed: number;
  modeled_remaining_percent: number;
  threshold_reached: boolean;
  threshold_fraction: number;
  curve: ClearancePoint[];
  model_note: string;
}

const DAY_MS = 86400000;

function parseUtcCalendarDate(value: string, field: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError(`${field} must be an ISO calendar date (YYYY-MM-DD)`);
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (year < 1) throw new RangeError(`${field} must use a year from 0001 through 9999`);
  const parsed = new Date(0);
  parsed.setUTCHours(0, 0, 0, 0);
  parsed.setUTCFullYear(year, month - 1, day);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw new RangeError(`${field} is not a valid calendar date`);
  }
  return parsed.getTime();
}

function formatUtcCalendarDate(epoch: number, field: string): string {
  const date = new Date(epoch);
  const year = date.getUTCFullYear();
  if (!Number.isFinite(epoch) || year < 0 || year > 9999) throw new RangeError(`${field} is outside the supported date range`);
  return `${String(year).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function calculateCompoundClearance(input: ClearanceInput): ClearanceResult {
  const {
    compound_name,
    half_life_days,
    half_life_source,
    last_dose_date,
    as_of_date,
    threshold_fraction = 0.01,
  } = input;

  if (!compound_name.trim()) throw new RangeError('compound_name is required');
  if (!half_life_source.trim()) throw new RangeError('half_life_source is required');
  if (!Number.isFinite(half_life_days) || half_life_days <= 0) throw new RangeError('half_life_days must be finite and positive');
  if (!Number.isFinite(threshold_fraction) || threshold_fraction <= 0 || threshold_fraction >= 1) {
    throw new RangeError('threshold_fraction must be between 0 and 1');
  }

  // First-order single-exponential fraction reaches f at t = t½ * log2(1/f).
  const daysToThreshold = Math.max(1, Math.ceil(half_life_days * (Math.log(1 / threshold_fraction) / Math.log(2))));

  const base = parseUtcCalendarDate(last_dose_date, 'last_dose_date');
  const asOf = parseUtcCalendarDate(as_of_date, 'as_of_date');
  if (asOf < base) throw new RangeError('as_of_date cannot be before last_dose_date');
  const thresholdDate = formatUtcCalendarDate(base + daysToThreshold * DAY_MS, 'threshold_date');

  const daysElapsed = Math.floor((asOf - base) / DAY_MS);
  const decay = (days: number) => Math.pow(0.5, days / half_life_days);
  const modeledRemainingPercent = Math.round(decay(daysElapsed) * 10000) / 100;
  const thresholdReached = decay(daysElapsed) <= threshold_fraction;

  // Curve at half-life multiples 0..5 plus the user-selected model threshold.
  const curve: ClearancePoint[] = [];
  const marks = [0, 1, 2, 3, 4, 5].map((k) => Math.round(k * half_life_days));
  const allMarks = [...new Set([...marks, daysToThreshold])].sort((a, b) => a - b);
  for (const d of allMarks) {
    curve.push({
      days_after_last_dose: d,
      date: formatUtcCalendarDate(base + d * DAY_MS, 'curve_date'),
      remaining_percent: Math.round(decay(d) * 10000) / 100,
    });
  }

  return {
    days_to_threshold: daysToThreshold,
    threshold_date: thresholdDate,
    days_elapsed: daysElapsed,
    modeled_remaining_percent: modeledRemainingPercent,
    threshold_reached: thresholdReached,
    threshold_fraction,
    curve,
    model_note: `${compound_name}: hypothetical single-exponential fraction model using a user-entered, unverified half-life. The ${(threshold_fraction * 100).toPrecision(4)}% threshold is a mathematical setting, not a medical clearance or safety standard. Repeated dosing, absorption, distribution, active metabolites, formulation, and individual pharmacokinetics are not modeled.`,
  };
}
