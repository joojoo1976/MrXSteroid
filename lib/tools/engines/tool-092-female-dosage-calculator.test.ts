import { describe, it, expect } from 'vitest';
import { calculateFemaleDosage, type FemaleDosageCalculatorInput } from './tool-092-female-dosage-calculator';

describe('Tool #092 — Female Dosage Calculator Engine', () => {
  it('identifies conservative minimal risk for low dose oxandrolone', () => {
    const input: FemaleDosageCalculatorInput = {
      compound: 'oxandrolone',
      proposed_weekly_dose_mg: 20, // ~2.8mg/day, well under 35mg ceiling
      cycle_experience: 'intermediate_experience',
      monitoring_bloodwork_planned: true,
    };

    const res = calculateFemaleDosage(input);
    expect(res.virilization_risk_tier).toBe('conservative-minimal-risk');
    expect(res.dose_relative_to_conservative_ceiling_percent).toBeLessThanOrEqual(100);
    expect(res.recommended_safe_exposure_duration_weeks).toBe(6);
    expect(res.safety_warnings).toContain('educational_harm_reduction_female_androgen_screen');
  });

  it('triggers severe irreversible virilization warnings for excessive doses', () => {
    const input: FemaleDosageCalculatorInput = {
      compound: 'nandrolone_decanoate',
      proposed_weekly_dose_mg: 60, // far exceeds 25mg ceiling
      cycle_experience: 'first_time',
      monitoring_bloodwork_planned: false,
    };

    const res = calculateFemaleDosage(input);
    expect(res.virilization_risk_tier).toBe('high-irreversible-virilization-risk');
    expect(res.dose_relative_to_conservative_ceiling_percent).toBeGreaterThan(200);
    expect(res.safety_warnings.some(w => w.includes('irreversible_virilization'))).toBe(true);
    expect(res.safety_warnings.some(w => w.includes('absence_of_baseline'))).toBe(true);
  });
});
