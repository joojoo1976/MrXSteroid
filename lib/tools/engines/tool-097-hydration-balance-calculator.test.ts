import { describe, it, expect } from 'vitest';
import { calculateHydrationBalance } from './tool-097-hydration-balance-calculator';

describe('Tool #097 — Hydration Balance Calculator Engine', () => {
  it('calculates standard fluid intake for moderate sedentary context', () => {
    const result = calculateHydrationBalance({
      body_weight_kg: 70,
      training_duration_minutes_daily: 0,
      sweat_rate_intensity: 'light',
      climate_temperature: 'temperate',
      caffeine_or_diuretic_intake_mg: 100,
    });
    expect(result.recommended_daily_fluid_liters).toBeCloseTo(2.5, 0.5);
    expect(result.hydration_status_tier).toBe('baseline');
  });

  it('elevates fluid requirements under heavy training and hot climates', () => {
    const result = calculateHydrationBalance({
      body_weight_kg: 95,
      training_duration_minutes_daily: 90,
      sweat_rate_intensity: 'heavy_profuse',
      climate_temperature: 'hot_humid',
      caffeine_or_diuretic_intake_mg: 400,
    });
    expect(result.recommended_daily_fluid_liters).toBeGreaterThanOrEqual(5.0);
    expect(result.hydration_status_tier).toBe('critical-hyperhydration-required');
  });
});
