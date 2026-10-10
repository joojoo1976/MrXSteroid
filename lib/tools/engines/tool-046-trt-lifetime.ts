/**
 * Tool #046 — TRT Lifetime Calculator
 * Long-horizon TRT cost and monitoring projection. Documented heuristics:
 * bloodwork cadence (3 panels year one, 2/year up to year three, 1/year
 * thereafter), common E3.5D injection interval for cypionate/enanthate,
 * daily transdermal dosing. Pure engine, no I/O.
 */

export type TrtMethod = 'injection' | 'gel' | 'cream';

export interface TrtLifetimeInput {
  age: number; // 18..90
  method: TrtMethod;
  weekly_testosterone_mg: number; // 25..300
  years_on_trt: number; // 0..60
  monthly_med_cost_usd: number; // 0..1000
  monitoring_annual_cost_usd: number; // 0..5000
}

export type TrtAgeBand = 'under-40' | '40-55' | '55-plus';

export interface TrtHorizonCost {
  horizon_years: number;
  total_cost_usd: number;
}

export interface TrtLifetimeResult {
  injection_interval_days: number; // 3.5 injectable / 1 transdermal
  annual_bloodwork_panels: number; // 1..3
  age_band: TrtAgeBand;
  cost_projection: {
    horizon10: TrtHorizonCost;
    horizon20: TrtHorizonCost;
    horizon30: TrtHorizonCost;
  };
  lifetime_bloodwork_panels_10y: number;
  warnings: string[];
}

const DOSING_INTERVAL_DAYS: Record<TrtMethod, number> = { injection: 3.5, gel: 1, cream: 1 };

export function projectTrtLifetime(input: TrtLifetimeInput): TrtLifetimeResult {
  const { age, method, weekly_testosterone_mg, years_on_trt, monthly_med_cost_usd, monitoring_annual_cost_usd } = input;
  const warnings: string[] = [];

  // Monitoring cadence: documented intensification in year one, tapering as
  // labs stabilize (educational cadence, not a clinical protocol).
  const annual_bloodwork_panels = years_on_trt < 1 ? 3 : years_on_trt < 3 ? 2 : 1;

  const age_band: TrtAgeBand = age < 40 ? 'under-40' : age < 55 ? '40-55' : '55-plus';

  const horizon = (years: number): TrtHorizonCost => ({
    horizon_years: years,
    total_cost_usd: Math.round(monthly_med_cost_usd * 12 * years + monitoring_annual_cost_usd * years),
  });

  if (age >= 40) warnings.push('age_40_plus_cardio_monitoring');
  if (years_on_trt >= 5) warnings.push('long_term_annual_full_panel');
  if (weekly_testosterone_mg > 200) warnings.push('high_dose_not_trt_range');

  return {
    injection_interval_days: DOSING_INTERVAL_DAYS[method],
    annual_bloodwork_panels,
    age_band,
    cost_projection: { horizon10: horizon(10), horizon20: horizon(20), horizon30: horizon(30) },
    lifetime_bloodwork_panels_10y: annual_bloodwork_panels * 10,
    warnings: [...new Set(warnings)],
  };
}
