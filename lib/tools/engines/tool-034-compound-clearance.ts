/**
 * Tool #034 — Compound Clearance Calculator
 * Exponential-decay clearance date + residual curve for one compound.
 * Pure calculation engine (no I/O, no DB).
 */

export interface ClearanceInput {
  compound_name: string;
  half_life_days: number;
  last_dose_mg: number;
  /** ISO-8601 date of the last dose. */
  last_dose_date: string;
  /** Residual fraction that defines "cleared" (default 0.01 = 1%). */
  threshold_fraction?: number;
}

export interface ClearancePoint {
  days_after_last_dose: number;
  date: string;
  remaining_mg: number;
  remaining_percent: number;
}

export interface ClearanceResult {
  days_to_clear: number;
  clearance_date: string;
  days_elapsed: number;
  current_remaining_mg: number;
  current_remaining_percent: number;
  already_clear: boolean;
  curve: ClearancePoint[];
  note: string;
}

const DAY_MS = 86400000;

export function calculateCompoundClearance(input: ClearanceInput): ClearanceResult {
  const {
    compound_name,
    half_life_days,
    last_dose_mg,
    last_dose_date,
    threshold_fraction = 0.01,
  } = input;

  // 34.1 Days to reach threshold: t = hl * log2(1/f)
  const daysToClear = Math.max(1, Math.ceil(half_life_days * (Math.log(1 / threshold_fraction) / Math.log(2))));

  const anchor = Date.parse(last_dose_date);
  const base = Number.isNaN(anchor) ? Date.now() : anchor;
  const clearanceDate = new Date(base + daysToClear * DAY_MS).toISOString().slice(0, 10);

  const daysElapsed = Math.max(0, Math.floor((Date.now() - base) / DAY_MS));
  const decay = (days: number) => Math.pow(0.5, days / half_life_days);
  const currentRemainingMg = Math.round(last_dose_mg * decay(daysElapsed) * 100) / 100;
  const currentRemainingPercent = Math.round(decay(daysElapsed) * 10000) / 100;
  const alreadyClear = daysElapsed >= daysToClear;

  // 34.2 Residual curve at each half-life multiple 0..5 plus the clearance point
  const curve: ClearancePoint[] = [];
  const marks = [0, 1, 2, 3, 4, 5].map((k) => Math.round(k * half_life_days));
  const allMarks = [...new Set([...marks, daysToClear])].sort((a, b) => a - b);
  for (const d of allMarks) {
    curve.push({
      days_after_last_dose: d,
      date: new Date(base + d * DAY_MS).toISOString().slice(0, 10),
      remaining_mg: Math.round(last_dose_mg * decay(d) * 100) / 100,
      remaining_percent: Math.round(decay(d) * 10000) / 100,
    });
  }

  return {
    days_to_clear: daysToClear,
    clearance_date: clearanceDate,
    days_elapsed: daysElapsed,
    current_remaining_mg: currentRemainingMg,
    current_remaining_percent: currentRemainingPercent,
    already_clear: alreadyClear,
    curve,
    note: `${compound_name}: < ${threshold_fraction * 100}% residual after ${daysToClear} days (~${(daysToClear / half_life_days).toFixed(1)} half-lives)`,
  };
}
