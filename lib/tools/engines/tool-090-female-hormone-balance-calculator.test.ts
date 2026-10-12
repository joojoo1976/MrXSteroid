import { describe, it, expect } from 'vitest';
import { calculateFemaleHormoneBalance } from './tool-090-female-hormone-balance-calculator';

describe('Tool #090 — Female Hormone Balance Calculator Engine', () => {
  it('identifies harmonious baseline state with regular cycles and no PMS', () => {
    const res = calculateFemaleHormoneBalance({
      cycle_length_days: 28,
      pms_symptom_severity: 'none_mild',
      androgenic_signs_present: false,
      cycle_regularity: 'strictly_regular',
      high_stress_or_rapid_weight_loss: false,
    });

    expect(res.estrogen_progesterone_balance_tier).toBe('harmonious-baseline');
    expect(res.androgenic_virilization_risk).toBe('low');
    expect(res.hormone_harmony_score).toBeGreaterThanOrEqual(75);
  });

  it('detects ovulatory disruption and elevated virilization risk', () => {
    const res = calculateFemaleHormoneBalance({
      cycle_length_days: 42,
      pms_symptom_severity: 'severe',
      androgenic_signs_present: true,
      cycle_regularity: 'highly_irregular_or_absent',
      high_stress_or_rapid_weight_loss: true,
    });

    expect(res.estrogen_progesterone_balance_tier).toBe('ovulatory-disruption-risk');
    expect(res.androgenic_virilization_risk).toBe('elevated');
    expect(res.warnings).toContain('androgenic_virilization_signs_require_immediate_clinical_androgen_evaluation');
  });
});
