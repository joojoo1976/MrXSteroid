import { describe, it, expect } from 'vitest';
import { calculateOxidativeStress } from './tool-070-oxidative-stress-calculator';

describe('Tool #070 — Oxidative Stress Calculator Engine', () => {
  it('calculates low oxidative burden for healthy lifestyle with antioxidant support', () => {
    const res = calculateOxidativeStress({
      sleep_hours_per_night: 8,
      hard_training_hours_week: 5,
      smoker_or_vaper: false,
      high_sugar_ultraprocessed_diet: false,
      androgen_dose_weekly_mg: 0,
      antioxidant_support_adequate: true,
    });
    // 10 baseline - 15 antioxidant = 0 (clamped)
    expect(res.oxidative_burden_score).toBe(0);
    expect(res.burden_tier).toBe('low-oxidative-stress');
    expect(res.mitigating_priorities.length).toBe(0);
  });

  it('detects high oxidative burden when multiple lifestyle & pharmacological drivers co-exist', () => {
    const res = calculateOxidativeStress({
      sleep_hours_per_night: 5, // +20
      hard_training_hours_week: 14, // +20
      smoker_or_vaper: true, // +25
      high_sugar_ultraprocessed_diet: true, // +15
      androgen_dose_weekly_mg: 1000, // +20
      antioxidant_support_adequate: false, // 0
    });
    // 10 + 20 + 20 + 25 + 15 + 20 = 110 -> clamped 100
    expect(res.oxidative_burden_score).toBe(100);
    expect(res.burden_tier).toBe('high-oxidative-stress');
    expect(res.warnings).toContain('smoking_vaping_primary_oxidative_driver');
    expect(res.warnings).toContain('supraphysiological_androgen_redox_strain');
    expect(res.warnings).toContain('high_oxidative_strain_endothelial_risk');
  });

  it('provides actionable priorities in moderate burden category', () => {
    const res = calculateOxidativeStress({
      sleep_hours_per_night: 6.5, // +10
      hard_training_hours_week: 6, // 0
      smoker_or_vaper: false,
      high_sugar_ultraprocessed_diet: false,
      androgen_dose_weekly_mg: 400, // +10
      antioxidant_support_adequate: false, // priority added
    });
    // 10 + 10 + 0 + 0 + 0 + 10 = 30
    expect(res.oxidative_burden_score).toBe(30);
    expect(res.burden_tier).toBe('low-oxidative-stress');
    expect(res.mitigating_priorities).toContain('incorporate_polyphenol_rich_whole_foods');
  });
});
