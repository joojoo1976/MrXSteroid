import { describe, it, expect } from 'vitest';
import { calculateCellularAging } from './tool-081-cellular-aging-calculator';

describe('Tool #081 — Cellular Aging Calculator Engine', () => {
  it('calculates favorable resilience profile with positive habits', () => {
    const res = calculateCellularAging({
      chronological_age: 35,
      smoking_history: 'never',
      weekly_sun_protection_frequency: 'always',
      average_sleep_hours: 8,
      ultra_processed_food_frequency: 'rare',
      regular_strength_training: true,
    });

    expect(res.cellular_stress_tier).toBe('resilient');
    expect(res.biological_age_delta_estimate).toBeLessThan(0);
    expect(res.estimated_phenotypic_age).toBeLessThan(35);
  });

  it('detects accelerated cellular stress with multiple risk factors', () => {
    const res = calculateCellularAging({
      chronological_age: 40,
      smoking_history: 'current',
      weekly_sun_protection_frequency: 'never',
      average_sleep_hours: 5,
      ultra_processed_food_frequency: 'high',
      regular_strength_training: false,
    });

    expect(res.cellular_stress_tier).toBe('accelerated-stress');
    expect(res.biological_age_delta_estimate).toBeGreaterThanOrEqual(3);
    expect(res.warnings).toContain('active_smoking_accelerates_cellular_senescence_and_dna_damage');
  });
});
