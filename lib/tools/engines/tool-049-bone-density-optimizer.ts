/**
 * Tool #049 — Bone Density Optimizer (Educational)
 * Layer 49: bone-health index & osteoporosis-risk orientation.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index; NOT a DXA scan or diagnosis.
 *  - Recommends clinical assessment (DXA) for elevated risk.
 *  - No supplement/hormone dosing instructions.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type Sex = 'male' | 'female';

export interface BoneInput {
  age: number;
  sex: Sex;
  weight_kg: number;
  calcium_intake_mg: number;
  vitamin_d_ng_ml: number;
  resistance_training_days: number;
  smoker: boolean;
  androgen_exposure: boolean;
  prior_fracture: boolean;
  family_history_osteoporosis: boolean;
}

export interface BoneResult {
  bone_health_index: number; // 0–100 (higher = better)
  risk_band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  recommendations: string[];
  clinical_assessment_advised: boolean;
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

/** Recommended daily calcium intake (mg) by sex/age band (orientation values). */
export function recommendedCalcium(age: number, sex: Sex): number {
  if (age >= 71) return 1200;
  if (age >= 51 && sex === 'female') return 1200;
  if (age >= 51) return 1000;
  return 1000;
}

export function assessBoneHealth(input: BoneInput): BoneResult {
  let score = 70;
  const factors: string[] = [];
  const recommendations: string[] = [];

  const targetCalcium = recommendedCalcium(input.age, input.sex);
  if (input.calcium_intake_mg >= targetCalcium) {
    score += 8;
    factors.push('Calcium intake meets the age/sex reference.');
  } else {
    score -= clamp((targetCalcium - input.calcium_intake_mg) / 100, 0, 10);
    factors.push(`Calcium intake below the ${targetCalcium} mg/day reference.`);
    recommendations.push('Discuss dietary calcium (or supplementation) with a clinician or dietitian.');
  }

  if (input.vitamin_d_ng_ml >= 30) {
    score += 8;
    factors.push('Vitamin D is in the sufficiency range.');
  } else if (input.vitamin_d_ng_ml >= 20) {
    score -= 3;
    factors.push('Vitamin D is insufficient (20–29 ng/mL).');
    recommendations.push('Review vitamin D status with a clinician.');
  } else {
    score -= 10;
    factors.push('Vitamin D deficiency (<20 ng/mL).');
    recommendations.push('Seek clinical review and correction of vitamin D deficiency.');
  }

  const rtd = clamp(input.resistance_training_days, 0, 7);
  score += (rtd / 3) * 6;
  if (rtd >= 2) factors.push('Regular resistance training supports bone mineral density.');
  else recommendations.push('Add 2–3 resistance-training sessions per week if medically appropriate.');

  if (input.age >= 65) {
    score -= 10;
    factors.push('Age ≥65 increases baseline fracture risk.');
  } else if (input.age >= 50) {
    score -= 5;
  }

  if (input.sex === 'female') {
    score -= 4;
    factors.push('Female sex confers higher osteoporosis risk.');
  }

  if (input.weight_kg < 55) {
    score -= 6;
    factors.push('Low body weight is associated with lower bone density.');
  }

  if (input.smoker) {
    score -= 10;
    factors.push('Smoking accelerates bone loss.');
    recommendations.push('Smoking cessation strongly benefits bone health.');
  }

  if (input.androgen_exposure) {
    score -= 5;
    factors.push('Androgen/AAS exposure may alter bone turnover (both directions); clinical monitoring advised.');
  }

  if (input.prior_fracture) {
    score -= 12;
    factors.push('Prior fragility fracture is a strong risk indicator.');
  }
  if (input.family_history_osteoporosis) {
    score -= 8;
    factors.push('Family history of osteoporosis.');
  }

  const index = round(clamp(score, 0, 100), 0);
  const band: BoneResult['risk_band'] = index >= 70 ? 'low' : index >= 45 ? 'moderate' : 'high';
  const advised = band !== 'low' || input.prior_fracture;

  if (advised) {
    recommendations.push('Consider a DXA bone-density scan and clinical fracture-risk assessment.');
  }
  recommendations.push('This tool is educational and does not diagnose osteoporosis.');

  return {
    bone_health_index: index,
    risk_band: band,
    contributing_factors: factors,
    recommendations,
    clinical_assessment_advised: advised,
    educational_notice:
      'Educational index only. Bone density requires DXA imaging and clinical interpretation.',
  };
}
