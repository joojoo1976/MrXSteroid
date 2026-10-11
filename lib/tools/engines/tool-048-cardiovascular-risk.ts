/**
 * Tool #048 — Cardiovascular Risk Assessor (Educational)
 * Layer 48: 10-year cardiovascular risk *proxy* with AAS-related modifiers.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational proxy based on a published points-style model; NOT a diagnosis.
 *  - Emergency symptoms escalate to urgent-care guidance.
 *  - No medication dosing recommendations.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type Sex = 'male' | 'female';

export interface CardioInput {
  age: number;
  sex: Sex;
  systolic_bp: number;
  total_cholesterol_mg_dl: number;
  hdl_mg_dl: number;
  smoker: boolean;
  diabetic: boolean;
  on_antihypertensive: boolean;
  hematocrit_pct: number;
  /** Self-reported androgen/AAS exposure (any). */
  androgen_exposure: boolean;
  /** Red-flag symptoms for emergency escalation. */
  red_flags: {
    chest_pain: boolean;
    breathlessness_at_rest: boolean;
    syncope: boolean;
    unilateral_leg_swelling: boolean;
  };
}

export interface CardioResult {
  risk_points: number;
  ten_year_risk_pct: number;
  risk_category: 'low' | 'moderate' | 'high' | 'very-high';
  modifiers: string[];
  modifiable_factors: string[];
  emergency: boolean;
  emergency_message: string | null;
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

/**
 * Educational points model (Framingham-style, simplified & documented).
 * Each band contributes points; points are mapped to an approximate 10-year
 * risk via a logistic transform. This is an orientation tool, not a calculator
 * validated for individual clinical decisions.
 */
export function assessCardiovascularRisk(input: CardioInput): CardioResult {
  let points = 0;
  const modifiers: string[] = [];
  const modifiable: string[] = [];

  // Age
  if (input.age >= 60) points += 8;
  else if (input.age >= 50) points += 6;
  else if (input.age >= 40) points += 4;
  else if (input.age >= 30) points += 2;

  // Blood pressure
  if (input.systolic_bp >= 160) points += 6;
  else if (input.systolic_bp >= 140) points += 4;
  else if (input.systolic_bp >= 130) points += 2;
  else if (input.systolic_bp >= 120) points += 1;
  if (input.on_antihypertensive) points += 2;

  // Lipids
  const ratio = input.hdl_mg_dl > 0 ? input.total_cholesterol_mg_dl / input.hdl_mg_dl : 0;
  if (ratio >= 7) points += 6;
  else if (ratio >= 5) points += 4;
  else if (ratio >= 4) points += 2;
  if (input.hdl_mg_dl < 40) {
    points += 2;
    modifiable.push('Low HDL (<40 mg/dL) — discuss with a clinician.');
  }

  if (input.smoker) {
    points += 5;
    modifiable.push('Smoking — the single highest-impact modifiable factor.');
  }
  if (input.diabetic) {
    points += 5;
    modifiable.push('Diabetes — optimise glycaemic control with your clinician.');
  }

  // Androgen-related modifiers
  if (input.androgen_exposure) {
    points += 2;
    modifiers.push('Androgen/AAS exposure is associated with adverse lipid and blood-pressure changes.');
  }
  if (input.hematocrit_pct >= 54) {
    points += 4;
    modifiers.push('Hematocrit ≥54% — erythrocytosis increases thrombotic risk; clinician review required.');
  } else if (input.hematocrit_pct >= 52) {
    points += 2;
    modifiers.push('Hematocrit 52–53.9% — monitor and review.');
  }

  if (input.systolic_bp >= 130) modifiable.push('Elevated systolic blood pressure — lifestyle and clinical review.');
  if (ratio >= 4) modifiable.push('Unfavourable total:HDL ratio — diet/lipid review.');
  if (input.hematocrit_pct >= 52) modifiable.push('Elevated hematocrit — discuss monitoring/phlebotomy with a clinician.');

  const rf = input.red_flags;
  const emergency =
    rf.chest_pain || rf.breathlessness_at_rest || rf.syncope || rf.unilateral_leg_swelling;

  const tenYear = round(clamp(100 / (1 + Math.exp(-(points - 14) / 3.2)), 0.5, 60), 1);
  const riskCategory: CardioResult['risk_category'] =
    tenYear >= 20 ? 'very-high' : tenYear >= 10 ? 'high' : tenYear >= 5 ? 'moderate' : 'low';

  return {
    risk_points: points,
    ten_year_risk_pct: tenYear,
    risk_category: riskCategory,
    modifiers,
    modifiable_factors: modifiable,
    emergency,
    emergency_message: emergency
      ? 'URGENT: Your reported symptoms can indicate a cardiovascular emergency. Call emergency services (or your local emergency number) immediately. Do not rely on this tool.'
      : null,
    educational_notice:
      'Educational proxy only, not a clinical risk score. A clinician must interpret your actual cardiovascular risk.',
  };
}
