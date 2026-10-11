/**
 * Tool #061 — Hair Loss Tracker
 * DHT-linked hair-loss trend tracking: average weekly shed count over a
 * documented banding (stable <50, monitor ≤100, accelerated >100) plus a
 * Norwood stage band. Educational tracking, not a diagnosis.
 * Pure engine, no I/O.
 */

export interface HairLossInput {
  norwood_stage: number; // 1..7
  weekly_shed_counts: number[]; // 3..12 weekly counts, 0..500 each
  on_5ari: boolean;
  weeks_since_start: number; // 0..260
}

export interface HairLossResult {
  avg_weekly_shed: number;
  trend_band: 'stable' | 'monitor' | 'accelerated';
  stage_band: 'minimal' | 'moderate' | 'advanced';
  warnings: string[];
}

export function trackHairLoss(input: HairLossInput): HairLossResult {
  const { norwood_stage, weekly_shed_counts, on_5ari } = input;
  const warnings: string[] = ['educational_tracking_not_diagnosis'];

  const avg_weekly_shed = Math.round((weekly_shed_counts.reduce((a, b) => a + b, 0) / weekly_shed_counts.length) * 10) / 10;

  if (avg_weekly_shed > 100) warnings.push('accelerated_shedding_see_dermatologist');
  if (norwood_stage >= 5) warnings.push('advanced_stage_dermatology_referral');
  if (on_5ari) warnings.push('5ari_shedding_can_be_transient');

  const trend_band: HairLossResult['trend_band'] = avg_weekly_shed < 50 ? 'stable' : avg_weekly_shed <= 100 ? 'monitor' : 'accelerated';
  const stage_band: HairLossResult['stage_band'] = norwood_stage <= 2 ? 'minimal' : norwood_stage <= 4 ? 'moderate' : 'advanced';

  return {
    avg_weekly_shed,
    trend_band,
    stage_band,
    warnings: [...new Set(warnings)],
  };
}
