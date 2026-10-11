/**
 * Tool #063 — Testicular Suppression Calculator
 * Suppression depth and recovery projection: documented suppression tiers
 * (mild 40% / moderate 70% / severe 90% baseline depth, +5% per 8-week block,
 * capped at 95%) with a recovery-months estimate. Educational projection.
 * Pure engine, no I/O.
 */

export interface SuppressionInput {
  weeks_on_cycle: number; // 0..104
  suppression_tier: 'mild' | 'moderate' | 'severe';
  age: number; // 18..70
}

export interface SuppressionResult {
  suppression_depth_pct: number;
  estimated_recovery_months: number;
  band: 'shallow-suppression' | 'moderate-suppression' | 'deep-suppression';
  warnings: string[];
}

const TIER_BASE_DEPTH: Record<SuppressionInput['suppression_tier'], number> = {
  mild: 40,
  moderate: 70,
  severe: 90,
};

const TIER_RECOVERY_MONTHS: Record<SuppressionInput['suppression_tier'], number> = {
  mild: 0,
  moderate: 2,
  severe: 4,
};

export function projectSuppression(input: SuppressionInput): SuppressionResult {
  const { weeks_on_cycle, suppression_tier, age } = input;
  const warnings: string[] = ['educational_projection_not_guarantee'];

  const suppression_depth_pct = Math.min(95, TIER_BASE_DEPTH[suppression_tier] + Math.floor(weeks_on_cycle / 8) * 5);
  const estimated_recovery_months = Math.max(2, Math.ceil(weeks_on_cycle / 8) + TIER_RECOVERY_MONTHS[suppression_tier] + (age >= 35 ? 2 : 0));

  if (suppression_depth_pct >= 85) warnings.push('deep_suppression_extended_recovery');

  const band: SuppressionResult['band'] =
    suppression_depth_pct < 50 ? 'shallow-suppression' : suppression_depth_pct < 70 ? 'moderate-suppression' : 'deep-suppression';

  return {
    suppression_depth_pct,
    estimated_recovery_months,
    band,
    warnings: [...new Set(warnings)],
  };
}
