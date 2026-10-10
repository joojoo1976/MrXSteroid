/**
 * Tool #052 — Growth Hormone Protocol Planner
 * Weekly-dose scheduling over documented protocol patterns (5-on/2-off or
 * daily) with cost projection and documented monitoring flags. Educational —
 * never a prescription. Pure engine, no I/O.
 */

export interface GrowthHormoneInput {
  bodyweight_kg: number; // 30..200
  weekly_iu_total: number; // 2..60
  protocol_pattern: '5on2off' | 'daily';
  months: number; // 1..24
  cost_per_iu_usd: number; // 0..100
}

export interface GrowthHormoneResult {
  daily_iu_on_days: number;
  rest_days_per_week: number;
  monthly_iu: number; // round(weekly * 52 / 12)
  cost_projection_3m_usd: number;
  cost_projection_6m_usd: number;
  warnings: string[];
}

const DOSING_DAYS: Record<GrowthHormoneInput['protocol_pattern'], number> = {
  '5on2off': 5,
  daily: 7,
};

export function planGrowthHormone(input: GrowthHormoneInput): GrowthHormoneResult {
  const { weekly_iu_total, protocol_pattern, months, cost_per_iu_usd } = input;
  const warnings: string[] = ['educational_not_a_prescription'];

  const daily_iu_on_days = Math.round((weekly_iu_total / DOSING_DAYS[protocol_pattern]) * 100) / 100;
  const rest_days_per_week = protocol_pattern === '5on2off' ? 2 : 0;

  const monthly_iu = Math.round((weekly_iu_total * 52) / 12);
  const cost_projection_3m_usd = Math.round(monthly_iu * cost_per_iu_usd * 3);
  const cost_projection_6m_usd = Math.round(monthly_iu * cost_per_iu_usd * 6);

  if (daily_iu_on_days >= 6) warnings.push('high_daily_dose_monitor_glucose');
  if (months >= 6) warnings.push('long_use_igf1_glucose_monitoring');

  return {
    daily_iu_on_days,
    rest_days_per_week,
    monthly_iu,
    cost_projection_3m_usd,
    cost_projection_6m_usd,
    warnings: [...new Set(warnings)],
  };
}
