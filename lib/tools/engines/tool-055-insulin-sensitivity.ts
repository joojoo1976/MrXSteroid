/**
 * Tool #055 — Insulin Sensitivity Optimizer (Educational)
 * Layer 55: HOMA-IR / QUICKI indices and lifestyle orientation.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15.2, §19, §40):
 *  - Indices are screening aids, not diagnoses. No drug recommendations.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface InsulinSensitivityInput {
  fasting_glucose_mg_dl: number;
  fasting_insulin_uu_ml: number;
  waist_cm?: number;
  activity_days_per_week: number;
  sleep_hours: number;
}

export interface InsulinSensitivityResult {
  homa_ir: number;
  quicki: number;
  band: 'insulin-sensitive' | 'borderline' | 'insulin-resistant';
  factors: string[];
  recommendations: string[];
  educational_notice: string;
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/** HOMA-IR = (glucose mg/dL × insulin µU/mL) / 405. */
export function homaIR(glucoseMgDl: number, insulinUuMl: number): number {
  return round((glucoseMgDl * insulinUuMl) / 405, 2);
}

/** QUICKI = 1 / (log10(insulin) + log10(glucose)). */
export function quicki(glucoseMgDl: number, insulinUuMl: number): number {
  if (glucoseMgDl <= 0 || insulinUuMl <= 0) return 0;
  return round(1 / (Math.log10(insulinUuMl) + Math.log10(glucoseMgDl)), 3);
}

export function assessInsulinSensitivity(input: InsulinSensitivityInput): InsulinSensitivityResult {
  const h = homaIR(input.fasting_glucose_mg_dl, input.fasting_insulin_uu_ml);
  const q = quicki(input.fasting_glucose_mg_dl, input.fasting_insulin_uu_ml);

  const band: InsulinSensitivityResult['band'] =
    h < 2 ? 'insulin-sensitive' : h < 2.9 ? 'borderline' : 'insulin-resistant';

  const factors: string[] = [];
  const recommendations: string[] = [];

  factors.push(`HOMA-IR ${h} (reference ~<2.0 for insulin sensitivity).`);
  factors.push(`QUICKI ${q} (higher is better; ~0.45+ typical for healthy adults).`);

  if (input.waist_cm !== undefined && input.waist_cm >= 102) {
    factors.push('Waist circumference ≥102 cm is associated with insulin resistance.');
    recommendations.push('Discuss waist reduction and metabolic goals with a clinician.');
  }
  if (input.activity_days_per_week < 3) {
    factors.push('Low physical-activity frequency.');
    recommendations.push('Aim for regular aerobic and resistance activity (clinician-cleared).');
  }
  if (input.sleep_hours < 6) {
    factors.push('Short sleep duration is associated with reduced insulin sensitivity.');
    recommendations.push('Prioritise 7–9 hours of sleep.');
  }
  if (band === 'insulin-resistant') {
    recommendations.push('Arrange a clinical metabolic assessment (fasting glucose, HbA1c, lipids).');
  }
  recommendations.push('This tool is educational and does not diagnose diabetes or insulin resistance.');

  return {
    homa_ir: h,
    quicki: q,
    band,
    factors,
    recommendations,
    educational_notice: 'Screening aid only; requires clinical interpretation.',
  };
}
