import { describe, it, expect } from 'vitest';
import { optimizeFemaleHealth, type FemaleHealthOptimizerInput } from './tool-091-female-health-optimizer';

describe('Tool #091 — Female Health Optimizer Engine', () => {
  it('calculates optimal athletic resilience for well-nourished female athlete', () => {
    const input: FemaleHealthOptimizerInput = {
      energy_availability_adequacy: 'adequate',
      ferritin_status: 'optimal',
      bone_stress_or_joint_pains: false,
      thyroid_cold_intolerance: false,
      resistance_training_sessions_per_week: 4,
    };

    const res = optimizeFemaleHealth(input);
    expect(res.female_vitality_score).toBeGreaterThanOrEqual(80);
    expect(res.athletic_resilience_tier).toBe('robust-resilience');
    expect(res.iron_energy_support_priority).toBe('maintenance');
    expect(res.warnings).toContain('educational_female_athletic_vitality_screen');
  });

  it('identifies high RED-S risk and severe energy deficit with clinical priority', () => {
    const input: FemaleHealthOptimizerInput = {
      energy_availability_adequacy: 'severely_deficient',
      ferritin_status: 'clinical_deficiency_suspected',
      bone_stress_or_joint_pains: true,
      thyroid_cold_intolerance: true,
      resistance_training_sessions_per_week: 6,
    };

    const res = optimizeFemaleHealth(input);
    expect(res.female_vitality_score).toBeLessThanOrEqual(30);
    expect(res.athletic_resilience_tier).toBe('high-reds-risk');
    expect(res.iron_energy_support_priority).toBe('urgent-clinical-review');
    expect(res.warnings.some(w => w.includes('amenorrhea'))).toBe(true);
  });
});
