import { describe, it, expect } from 'vitest';
import { calculateFatMetabolism } from './tool-079-fat-metabolism-calculator';

describe('Tool #079 — Fat Metabolism Calculator Engine', () => {
  it('identifies fat oxidation at zone 2 steady state', () => {
    const res = calculateFatMetabolism({
      body_weight_kg: 80,
      body_fat_pct: 12,
      vo2max_ml_kg_min: 50,
      heart_rate_bpm: 125,
      resting_heart_rate_bpm: 60,
      fasted_state: true,
    });

    expect(res.estimated_fat_oxidation_g_hr).toBeGreaterThan(30);
    expect(res.estimated_rer).toBeLessThan(0.90);
  });

  it('detects shift to glycolytic reliance at high heart rate', () => {
    const res = calculateFatMetabolism({
      body_weight_kg: 80,
      heart_rate_bpm: 175,
      resting_heart_rate_bpm: 60,
      fasted_state: false,
    });

    expect(res.zone_state).toBe('predominantly-glycolytic');
    expect(res.estimated_rer).toBeGreaterThanOrEqual(0.92);
    expect(res.warnings).toContain('postprandial_insulin_elevations_suppress_free_fatty_acid_oxidation');
  });
});
