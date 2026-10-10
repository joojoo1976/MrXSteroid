/**
 * Tool #054 — Glucose Tracker
 * Blood-glucose log analytics against documented fasting categories
 * (normal < 100, prediabetic-range 100-125, elevated >= 126 mg/dL fasting).
 * Screening only — never a diagnosis. Pure engine, no I/O.
 */

export interface GlucoseReading {
  mg_dl: number; // 20..600
  date: string; // ISO-8601
  fasting: boolean;
}

export interface GlucoseInput {
  readings: GlucoseReading[]; // 3..60 entries
}

export type GlucoseBand = 'normal' | 'prediabetic-range' | 'elevated';

export interface GlucoseResult {
  avg: number;
  fasting_avg: number;
  in_range_pct: number; // 0..100 (within documented bands)
  hypo_count: number; // < 70
  hyper_fast_count: number; // fasting >= 126
  band: GlucoseBand;
  warnings: string[];
}

const HYPO = 70;
const FASTING_NORMAL_MAX = 99;
const FASTING_PREDIABETIC_MAX = 125;

export function analyzeGlucose(input: GlucoseInput): GlucoseResult {
  const { readings } = input;
  const warnings: string[] = [];

  const round1 = (v: number) => Math.round(v * 10) / 10;
  const avg = readings.reduce((s, r) => s + r.mg_dl, 0) / readings.length;
  const fast = readings.filter((r) => r.fasting);
  const fasting_avg = fast.length > 0 ? fast.reduce((s, r) => s + r.mg_dl, 0) / fast.length : avg;

  const hypo_count = readings.filter((r) => r.mg_dl < HYPO).length;
  const hyper_fast_count = fast.filter((r) => r.mg_dl >= FASTING_PREDIABETIC_MAX + 1).length;
  const in_range = readings.filter((r) => (r.fasting ? r.mg_dl >= HYPO && r.mg_dl <= FASTING_NORMAL_MAX : r.mg_dl >= HYPO && r.mg_dl <= 140)).length;
  const in_range_pct = Math.round((in_range / readings.length) * 100);

  const band: GlucoseBand = fasting_avg <= FASTING_NORMAL_MAX ? 'normal' : fasting_avg <= FASTING_PREDIABETIC_MAX ? 'prediabetic-range' : 'elevated';

  if (band === 'prediabetic-range') warnings.push('fasting_prediabetic_range_see_physician');
  if (band === 'elevated') warnings.push('fasting_elevated_see_physician');
  if (hypo_count > 0) warnings.push('hypoglycemia_episode_logged');
  if (hyper_fast_count > 0) warnings.push('hyperglycemia_episode_logged');

  return {
    avg: Math.round(avg * 10) / 10,
    fasting_avg: Math.round(fasting_avg * 10) / 10,
    in_range_pct,
    hypo_count,
    hyper_fast_count,
    band,
    warnings: [...new Set(warnings)],
  };
}
