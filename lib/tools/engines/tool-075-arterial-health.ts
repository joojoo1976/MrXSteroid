/**
 * Tool #75 — Arterial Health Manager (Educational)
 * Layer 75: arterial-health index from BP, lipids, smoking and activity.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index; NOT a diagnosis of atherosclerosis or cardiovascular disease.
 *  - Severe hypertension (≥180/120) escalates to urgent care.
 *  - Never recommends statins, antihypertensives or any dose.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface ArterialInput {
  age: number;
  systolic: number;
  diastolic: number;
  /** LDL cholesterol (mg/dL). */
  ldl_mg_dl: number;
  /** HDL cholesterol (mg/dL). */
  hdl_mg_dl: number;
  /** Triglycerides (mg/dL). */
  triglycerides_mg_dl: number;
  /** Moderate activity days per week. */
  exercise_days: number;
  smoker: boolean;
  diabetes: boolean;
  family_history_cvd: boolean;
}

export interface ArterialResult {
  /** 0–100, higher = better estimated arterial health. */
  arterial_health_index: number;
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

export function assessArterialHealth(input: ArterialInput): ArterialResult {
  let score = 75;
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const severeBp = input.systolic >= 180 || input.diastolic >= 120;
  if (severeBp) flags.push('hypertensive_crisis');

  if (input.systolic >= 140 || input.diastolic >= 90) {
    score -= 18;
    factors.push('Blood pressure is in a high range.');
    recommendations.push('Persistent high blood pressure should be reviewed by a clinician.');
    flags.push('high_bp');
  } else if (input.systolic >= 130 || input.diastolic >= 80) {
    score -= 8;
    factors.push('Blood pressure is above the normal range.');
  }

  const ldl = clamp(input.ldl_mg_dl, 30, 400);
  if (ldl >= 160) {
    score -= 14;
    factors.push('LDL cholesterol is high.');
    flags.push('high_ldl');
  } else if (ldl >= 130) {
    score -= 8;
    factors.push('LDL cholesterol is above optimal.');
  }

  const hdl = clamp(input.hdl_mg_dl, 10, 120);
  if (hdl >= 60) {
    score += 8;
    factors.push('HDL cholesterol is protective.');
  } else if (hdl < 40) {
    score -= 8;
    factors.push('Low HDL cholesterol.');
    flags.push('low_hdl');
  }

  const tg = clamp(input.triglycerides_mg_dl, 20, 1000);
  if (tg >= 200) {
    score -= 8;
    factors.push('Triglycerides are elevated.');
    flags.push('high_triglycerides');
  } else if (tg >= 150) {
    score -= 4;
  }

  const exercise = clamp(input.exercise_days, 0, 7);
  score += (exercise / 5) * 10;
  if (exercise < 2) {
    factors.push('Low physical activity.');
    recommendations.push('Regular aerobic activity supports arterial health.');
  }

  if (input.smoker) {
    score -= 18;
    factors.push('Smoking damages the arterial wall.');
    recommendations.push('Smoking cessation is the highest-impact step for arterial health.');
    flags.push('smoker');
  }

  if (input.diabetes) {
    score -= 12;
    factors.push('Diabetes accelerates arterial disease.');
    flags.push('diabetes');
  }

  if (input.family_history_cvd) {
    score -= 6;
    factors.push('Family history of cardiovascular disease.');
  }

  if (input.age >= 60) score -= 6;
  else if (input.age >= 45) score -= 3;

  const index = round(clamp(score, 0, 100), 0);
  const band: ArterialResult['band'] = index >= 70 ? 'high' : index >= 45 ? 'moderate' : 'low';
  const urgent = severeBp;

  if (urgent) {
    recommendations.unshift(SEVERE_BP_MESSAGE);
  }
  recommendations.push('This tool never recommends statins, antihypertensives or any dose.');
  recommendations.push('Educational index only — it does not diagnose cardiovascular disease.');

  return {
    arterial_health_index: index,
    band,
    contributing_factors: factors,
    recommendations,
    urgent_review_advised: urgent,
    safety_flags: flags,
    educational_notice:
      'Educational index only. It does not diagnose atherosclerosis or cardiovascular disease and never recommends medication or dosing.',
  };
}
