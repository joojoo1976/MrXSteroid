/**
 * Tool #065 — Aromatase Conversion Calculator
 * Aromatization rate estimator: E2 ≈ testosterone × (0.15 + bodyfat/200),
 * damped by documented AI factors (anastrozole 0.5/1mg, letrozole 2.5mg).
 * Population-level educational estimate only. Pure engine, no I/O.
 */

export interface AromatizationInput {
  testosterone_mg_week: number; // 25..1000
  body_fat_pct: number; // 5..50
  aromatase_inhibitor: 'none' | 'anastrozole_0.5mg' | 'anastrozole_1mg' | 'letrozole_2.5mg';
}

export interface AromatizationResult {
  e2_estimate_pg_ml: number;
  band: 'low-e2' | 'normal-range' | 'elevated-e2';
  warnings: string[];
}

const AI_FACTORS: Record<AromatizationInput['aromatase_inhibitor'], number> = {
  none: 1,
  'anastrozole_0.5mg': 0.75,
  'anastrozole_1mg': 0.5,
  'letrozole_2.5mg': 0.35,
};

export function estimateAromatization(input: AromatizationInput): AromatizationResult {
  const { testosterone_mg_week, body_fat_pct, aromatase_inhibitor } = input;
  const warnings: string[] = ['educational_population_estimate'];

  const e2_estimate_pg_ml = Math.round(testosterone_mg_week * (0.15 + body_fat_pct / 200) * AI_FACTORS[aromatase_inhibitor] * 10) / 10;

  if (aromatase_inhibitor !== 'none') warnings.push('ai_overtitration_risk');
  if (e2_estimate_pg_ml > 75) warnings.push('elevated_e2_context');

  const band: AromatizationResult['band'] =
    e2_estimate_pg_ml < 20 ? 'low-e2' : e2_estimate_pg_ml <= 75 ? 'normal-range' : 'elevated-e2';

  return {
    e2_estimate_pg_ml,
    band,
    warnings: [...new Set(warnings)],
  };
}
