/**
 * Tool #049 — Bone Density Optimizer
 * Bone-health score (0-100) from documented modifiable factors: resistance
 * training, calcium, vitamin D, AI exposure (estrogen suppression), smoking,
 * age/sex risk proxies. Educational screening, not a DXA diagnosis.
 * Pure engine, no I/O.
 */

export interface BoneDensityInput {
  age: number; // 18..90
  sex: 'male' | 'female';
  uses_ai_years: number; // 0..30 aromatase-inhibitor exposure years
  weekly_resistance_sessions: number; // 0..14
  calcium_mg_daily: number; // 0..3000
  vitamin_d_iu_daily: number; // 0..10000
  smoker: boolean;
}

export type BoneBand = 'optimal' | 'good' | 'at-risk' | 'high-risk';

export interface BoneDensityResult {
  bone_health_score: number; // 0..100
  band: BoneBand;
  risk_factors: string[];
  interventions: string[];
  warnings: string[];
}

const clamp100 = (v: number) => Math.min(100, Math.max(0, v));

export function assessBoneDensity(input: BoneDensityInput): BoneDensityResult {
  const { age, sex, uses_ai_years, weekly_resistance_sessions, calcium_mg_daily, vitamin_d_iu_daily, smoker } = input;

  const score = clamp100(
    60 +
      Math.min(20, weekly_resistance_sessions * 3) +
      Math.min(15, calcium_mg_daily / 100) +
      Math.min(15, vitamin_d_iu_daily / 400) -
      uses_ai_years * 2.5 -
      (smoker ? 8 : 0) -
      (age > 50 && sex === 'female' ? 8 : 0) - // postmenopausal proxy
      (age > 65 ? 5 : 0),
  );
  const bone_health_score = Math.round(score);
  const band: BoneBand = bone_health_score >= 80 ? 'optimal' : bone_health_score >= 60 ? 'good' : bone_health_score >= 40 ? 'at-risk' : 'high-risk';

  const risk_factors: string[] = [];
  const interventions: string[] = [];
  if (uses_ai_years > 0) { risk_factors.push('ai_exposure'); interventions.push('review_ai_use_with_physician'); }
  if (weekly_resistance_sessions < 2) risk_factors.push('low_resistance_training');
  if (weekly_resistance_sessions < 3) interventions.push('progressive_resistance_program');
  if (calcium_mg_daily < 800) risk_factors.push('low_calcium');
  if (calcium_mg_daily < 1000) interventions.push('calcium_intake_1000mg');
  if (vitamin_d_iu_daily < 800) risk_factors.push('low_vitamin_d');
  if (vitamin_d_iu_daily < 1000) interventions.push('vitamin_d_1000_2000iu');
  if (smoker) { risk_factors.push('smoking'); interventions.push('smoking_cessation'); }
  if (age > 50 && sex === 'female') risk_factors.push('postmenopausal_proxy');
  if (age > 65) risk_factors.push('advanced_age');
  if (bone_health_score < 80) interventions.push('dxa_scan_discussion');

  const warnings: string[] = ['educational_screening_not_diagnosis'];
  if (bone_health_score < 40) warnings.push('high_fracture_risk_consult_physician');

  return { bone_health_score, band, risk_factors, interventions, warnings };
}
