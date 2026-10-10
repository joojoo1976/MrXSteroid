/**
 * Tool #047 — Fertility Preservation Guide
 * Informational sperm-suppression impact and recovery projection during
 * suppressive use. Documented severity tiers with HCG preservation offset;
 * never a prescription — semen analysis and fertility medicine own decisions.
 * Pure engine, no I/O.
 */

export interface FertilityInput {
  age: number; // 18..60
  suppression_level: 1 | 2 | 3; // 1 mild single ester · 2 moderate · 3 heavy/19-nor stack
  uses_hcg: boolean;
  planning_horizon_months: number; // 0..36
}

export interface FertilityResult {
  fertility_impact_pct: number; // 10..95 estimated current suppression impact
  recovery_projection_months: number; // 1..24 projected
  within_horizon: boolean; // projected recovery fits the stated planning horizon
  protocol_hints: string[];
  warnings: string[];
}

const BASE_IMPACT: Record<1 | 2 | 3, number> = { 1: 40, 2: 65, 3: 85 };
const BASE_RECOVERY_MONTHS: Record<1 | 2 | 3, number> = { 1: 3, 2: 6, 3: 12 };

export function assessFertility(input: FertilityInput): FertilityResult {
  const { age, suppression_level, uses_hcg, planning_horizon_months } = input;
  const warnings: string[] = [];

  const fertility_impact_pct = Math.max(10, BASE_IMPACT[suppression_level] - (uses_hcg ? 15 : 0));

  let recovery = BASE_RECOVERY_MONTHS[suppression_level] - (uses_hcg ? 2 : 0);
  if (age > 35) recovery += 3;
  else if (age > 28) recovery += 1;
  const recovery_projection_months = Math.max(1, recovery);

  const protocol_hints: string[] = ['off_cycle_semen_analysis_recommended'];
  if (uses_hcg) protocol_hints.push('hcg_preservation_discussed');
  if (suppression_level >= 2) protocol_hints.push('limit_19nor_exposure');
  if (suppression_level >= 3) protocol_hints.push('defer_cycle_until_family_planning_settled');

  if (fertility_impact_pct >= 65) warnings.push('high_suppression_impact_medical_consult');
  if (age > 40) warnings.push('age_related_decline_not_modeled');

  return {
    fertility_impact_pct,
    recovery_projection_months,
    within_horizon: planning_horizon_months > 0 && recovery_projection_months <= planning_horizon_months,
    protocol_hints,
    warnings: [...new Set(warnings)],
  };
}
