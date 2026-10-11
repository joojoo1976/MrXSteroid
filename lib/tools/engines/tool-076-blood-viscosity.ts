/**
 * Tool #76 — Blood Viscosity (Educational)
 * Layer 76: educational viscosity index from hematocrit, hydration and lipids.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index; NOT a rheology measurement (no viscometer).
 *  - Hematocrit above the reference range may indicate polycythaemia and needs
 *    clinical review; it is flagged but never "treated" here.
 *  - Never recommends aspirin, anticoagulants, blood donation targets or doses.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface ViscosityInput {
  age: number;
  sex: 'male' | 'female';
  /** Hematocrit (%). */
  hematocrit_pct: number;
  /** Total daily water intake (litres). */
  water_liters: number;
  /** LDL cholesterol (mg/dL). */
  ldl_mg_dl: number;
  /** Triglycerides (mg/dL). */
  triglycerides_mg_dl: number;
  /** Fibrinogen (mg/dL); null when unknown. */
  fibrinogen_mg_dl: number | null;
  smoker: boolean;
}

export interface ViscosityResult {
  /** 0–100, higher = greater estimated viscosity (worse). */
  viscosity_index: number;
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  recommendations: string[];
  clinical_review_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

/** Upper reference limit for hematocrit (%) by sex (orientation values). */
export function hematocritUpperLimit(sex: 'male' | 'female'): number {
  return sex === 'male' ? 52 : 47;
}

export function assessViscosity(input: ViscosityInput): ViscosityResult {
  let score = 30;
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const hct = clamp(input.hematocrit_pct, 20, 70);
  const limit = hematocritUpperLimit(input.sex);
  if (hct > limit) {
    score += clamp((hct - limit) * 3, 0, 30);
    factors.push(`Hematocrit ${hct}% is above the ${limit}% reference limit — needs clinical review.`);
    flags.push('high_hematocrit');
    recommendations.push('A high hematocrit should be reviewed by a clinician.');
  } else if (hct >= limit - 6) {
    score += 8;
    factors.push(`Hematocrit ${hct}% is in the upper part of the reference range.`);
  } else {
    factors.push(`Hematocrit ${hct}% is within the reference range.`);
  }

  const water = clamp(input.water_liters, 0, 6);
  if (water < 1.5) {
    score += clamp((1.5 - water) * 8, 0, 14);
    factors.push('Low hydration can increase blood viscosity.');
    recommendations.push('Maintain regular hydration across the day.');
    flags.push('low_hydration');
  } else {
    score -= 4;
    factors.push('Hydration is in a supportive range.');
  }

  const ldl = clamp(input.ldl_mg_dl, 30, 400);
  if (ldl >= 160) {
    score += 12;
    factors.push('High LDL cholesterol is associated with increased viscosity.');
    flags.push('high_ldl');
  } else if (ldl >= 130) {
    score += 6;
  }

  const tg = clamp(input.triglycerides_mg_dl, 20, 1000);
  if (tg >= 200) {
    score += 10;
    factors.push('Elevated triglycerides are associated with increased viscosity.');
    flags.push('high_triglycerides');
  } else if (tg >= 150) {
    score += 5;
  }

  if (input.fibrinogen_mg_dl !== null) {
    if (input.fibrinogen_mg_dl >= 400) {
      score += 10;
      factors.push(`Elevated fibrinogen (${input.fibrinogen_mg_dl} mg/dL).`);
      flags.push('high_fibrinogen');
    } else {
      factors.push(`Fibrinogen ${input.fibrinogen_mg_dl} mg/dL.`);
    }
  }

  if (input.smoker) {
    score += 12;
    factors.push('Smoking increases blood viscosity and red-cell rigidity.');
    flags.push('smoker');
  }

  if (input.age >= 60) score += 3;

  const index = round(clamp(score, 0, 100), 0);
  const band: ViscosityResult['band'] = index <= 33 ? 'low' : index <= 60 ? 'moderate' : 'high';
  const review = band === 'high' || hct > limit;

  recommendations.push('This tool never recommends aspirin, anticoagulants or blood-donation targets.');
  recommendations.push('Educational index only — it does not measure blood viscosity directly.');

  return {
    viscosity_index: index,
    band,
    contributing_factors: factors,
    recommendations,
    clinical_review_advised: review,
    safety_flags: flags,
    educational_notice:
      'Educational index only. It does not measure blood viscosity directly and never recommends anticoagulant or any other medication or dosing.',
  };
}
