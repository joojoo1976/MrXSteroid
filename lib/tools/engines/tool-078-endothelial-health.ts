/**
 * Tool #78 — Endothelial Health Manager (Educational)
 * Layer 78: endothelial-function index from BP, lipids, glucose and activity.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index; NOT a measurement of endothelial function (no FMD).
 *  - Severe hypertension (≥180/120) escalates to urgent care.
 *  - Never recommends medication or dosing.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface EndothelialInput {
  age: number;
  systolic: number;
  diastolic: number;
  /** LDL cholesterol (mg/dL). */
  ldl_mg_dl: number;
  /** HDL cholesterol (mg/dL). */
  hdl_mg_dl: number;
  /** Fasting glucose (mg/dL). */
  fasting_glucose_mg_dl: number;
  /** HbA1c (%); null when unknown. */
  hba1c_pct: number | null;
  /** Moderate activity days per week. */
  exercise_days: number;
  /** Average nightly sleep (hours). */
  sleep_hours: number;
  smoker: boolean;
}

export interface EndothelialResult {
  /** 0–100, higher = better estimated endothelial function. */
  endothelial_function_index: number;
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  recommendations: string[];
  urgent_review_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export const SEVERE_BP_MESSAGE =
  'A blood-pressure reading of ≥180/120 mmHg was entered. This is a hypertensive-crisis range. Seek emergency/urgent medical care now — call your local emergency number. Do not wait. This tool cannot provide emergency care.';

export function assessEndothelialHealth(input: EndothelialInput): EndothelialResult {
  let score = 75;
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const severeBp = input.systolic >= 180 || input.diastolic >= 120;
  if (severeBp) flags.push('hypertensive_crisis');

  if (input.systolic >= 140 || input.diastolic >= 90) {
    score -= 18;
    factors.push('High blood pressure impairs endothelial function.');
    flags.push('high_bp');
  } else if (input.systolic >= 130 || input.diastolic >= 80) {
    score -= 8;
    factors.push('Blood pressure is above the normal range.');
  }

  const ldl = clamp(input.ldl_mg_dl, 30, 400);
  if (ldl >= 160) {
    score -= 12;
    factors.push('High LDL cholesterol is associated with endothelial dysfunction.');
    flags.push('high_ldl');
  } else if (ldl >= 130) {
    score -= 6;
  }

  const hdl = clamp(input.hdl_mg_dl, 10, 120);
  if (hdl >= 60) score += 6;
  else if (hdl < 40) {
    score -= 6;
    factors.push('Low HDL cholesterol.');
  }

  const glucose = clamp(input.fasting_glucose_mg_dl, 40, 500);
  if (glucose >= 126) {
    score -= 12;
    factors.push('Fasting glucose is in the diabetes range.');
    flags.push('high_glucose');
  } else if (glucose >= 100) {
    score -= 6;
    factors.push('Fasting glucose is above optimal.');
  }

  if (input.hba1c_pct !== null) {
    if (input.hba1c_pct >= 6.5) {
      score -= 8;
      factors.push('HbA1c is in the diabetes range.');
      flags.push('high_hba1c');
    } else if (input.hba1c_pct >= 5.7) {
      score -= 4;
      factors.push('HbA1c is in the pre-diabetes range.');
    }
  }

  const exercise = clamp(input.exercise_days, 0, 7);
  score += (exercise / 5) * 12;
  if (exercise < 2) {
    factors.push('Low physical activity.');
    recommendations.push('Regular aerobic activity improves endothelial function.');
  }

  const sleep = clamp(input.sleep_hours, 0, 12);
  if (sleep < 6) {
    score -= 6;
    factors.push('Short sleep is associated with endothelial dysfunction.');
  } else if (sleep >= 7) {
    score += 3;
  }

  if (input.smoker) {
    score -= 16;
    factors.push('Smoking directly impairs the endothelium.');
    recommendations.push('Smoking cessation improves endothelial function.');
    flags.push('smoker');
  }

  if (input.age >= 60) score -= 5;
  else if (input.age >= 45) score -= 2;

  const index = round(clamp(score, 0, 100), 0);
  const band: EndothelialResult['band'] = index >= 70 ? 'high' : index >= 45 ? 'moderate' : 'low';
  const urgent = severeBp;

  if (urgent) recommendations.unshift(SEVERE_BP_MESSAGE);
  recommendations.push('This tool never recommends medication or dosing.');
  recommendations.push('Educational index only — it does not measure endothelial function directly.');

  return {
    endothelial_function_index: index,
    band,
    contributing_factors: factors,
    recommendations,
    urgent_review_advised: urgent,
    safety_flags: flags,
    educational_notice:
      'Educational index only. It does not measure endothelial function directly and never recommends medication or dosing.',
  };
}
