/**
 * Tool #097 — Hydration Balance Calculator
 * Layer 1: Pure TypeScript calculation engine.
 * Computes baseline metabolic fluid requirements adjusted for body weight,
 * high ambient heat, intense training sweat rate, and thermogenic/diuretic factors.
 */

export interface HydrationBalanceCalculatorInput {
  body_weight_kg: number;
  training_duration_minutes_daily: number;
  sweat_rate_intensity: 'light' | 'moderate' | 'heavy_profuse';
  climate_temperature: 'temperate' | 'hot_humid';
  caffeine_or_diuretic_intake_mg: number;
}

export interface HydrationBalanceCalculatorResult {
  recommended_daily_fluid_liters: number;
  sweat_loss_estimate_liters: number;
  hydration_status_tier: 'baseline' | 'elevated-fluid-demand' | 'critical-hyperhydration-required';
  hydration_guidelines: string[];
}

export function calculateHydrationBalance(input: HydrationBalanceCalculatorInput): HydrationBalanceCalculatorResult {
  const {
    body_weight_kg,
    training_duration_minutes_daily,
    sweat_rate_intensity,
    climate_temperature,
    caffeine_or_diuretic_intake_mg,
  } = input;

  const hydration_guidelines: string[] = ['educational_sports_hydration_fluid_model'];

  // Baseline turnover: ~35ml per kg
  const baseFluidLiters = (body_weight_kg * 35) / 1000;

  // Hourly sweat rate estimate
  let sweatRateLitersPerHour = 0.6;
  if (sweat_rate_intensity === 'moderate') {
    sweatRateLitersPerHour = 1.0;
  } else if (sweat_rate_intensity === 'heavy_profuse') {
    sweatRateLitersPerHour = 1.6;
    hydration_guidelines.push('profuse_sweating_requires_isotonic_sodium_replacement_to_prevent_hyponatremia');
  }

  if (climate_temperature === 'hot_humid') {
    sweatRateLitersPerHour *= 1.25;
    hydration_guidelines.push('ambient_heat_and_humidity_impair_evaporative_cooling_elevating_total_fluid_loss');
  }

  const exerciseHours = training_duration_minutes_daily / 60;
  const sweat_loss_estimate_liters = Math.round(sweatRateLitersPerHour * exerciseHours * 10) / 10;

  // 150% replacement for exercise sweat loss + caffeine offset
  const exerciseFluidOffset = sweat_loss_estimate_liters * 1.2;
  const diureticOffset = caffeine_or_diuretic_intake_mg > 300 ? 0.4 : 0.0;

  const totalLiters = baseFluidLiters + exerciseFluidOffset + diureticOffset;
  const recommended_daily_fluid_liters = Math.round(Math.min(8.0, Math.max(1.8, totalLiters)) * 10) / 10;

  let hydration_status_tier: 'baseline' | 'elevated-fluid-demand' | 'critical-hyperhydration-required';
  if (recommended_daily_fluid_liters >= 5.0) {
    hydration_status_tier = 'critical-hyperhydration-required';
  } else if (recommended_daily_fluid_liters >= 3.5) {
    hydration_status_tier = 'elevated-fluid-demand';
  } else {
    hydration_status_tier = 'baseline';
  }

  return {
    recommended_daily_fluid_liters,
    sweat_loss_estimate_liters,
    hydration_status_tier,
    hydration_guidelines,
  };
}
