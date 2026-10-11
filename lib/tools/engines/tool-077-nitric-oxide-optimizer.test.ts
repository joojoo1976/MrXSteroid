import { describe, it, expect } from 'vitest';
import { optimizeNitricOxide } from './tool-077-nitric-oxide-optimizer';

describe('Tool #077 — Nitric Oxide Optimizer Engine', () => {
  it('identifies optimized NO support pathway', () => {
    const res = optimizeNitricOxide({
      dietary_nitrate_frequency: 'high_daily',
      aerobic_exercise_days_per_week: 5,
      uses_antiseptic_mouthwash: false,
      citrulline_supplementation: true,
      high_sunlight_or_uva_exposure: true,
    });

    expect(res.no_status_band).toBe('optimized-no-signaling');
    expect(res.no_optimization_score).toBe(100);
  });

  it('detects oral microbiome eradication from antiseptic mouthwash and low intake', () => {
    const res = optimizeNitricOxide({
      dietary_nitrate_frequency: 'rarely',
      aerobic_exercise_days_per_week: 0,
      uses_antiseptic_mouthwash: true,
      citrulline_supplementation: false,
      high_sunlight_or_uva_exposure: false,
    });

    expect(res.no_status_band).toBe('depleted-no-pathway');
    expect(res.no_optimization_score).toBe(0);
    expect(res.warnings).toContain('antiseptic_mouthwash_eradicates_oral_microbiome_blunting_nitrate_to_nitrite_conversion');
  });
});
