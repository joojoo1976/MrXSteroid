import { describe, expect, it } from 'vitest';
import { calculateFemaleDosage, type FemaleDosageCalculatorInput } from './tool-092-female-dosage-calculator';

const normalInput: FemaleDosageCalculatorInput = {
  compound: 'oxandrolone',
  proposed_weekly_dose_mg: 20,
  cycle_experience: 'intermediate_experience',
  monitoring_bloodwork_planned: true,
};

describe('Tool #092 — female dose assessment availability', () => {
  it('fails closed instead of labeling a dose or duration safe', () => {
    const result = calculateFemaleDosage(normalInput);
    expect(result).toEqual({
      status: 'NOT_AVAILABLE',
      reason: 'NO_VALIDATED_FEMALE_DOSING_MODEL',
      resultOrigin: 'NOT_AVAILABLE',
      message: expect.stringContaining('No dose safety classification or exposure duration is calculated'),
    });
    expect(result).not.toHaveProperty('virilization_risk_tier');
    expect(result).not.toHaveProperty('recommended_safe_exposure_duration_weeks');
  });

  it('does not make a high entered dose look more or less safe than a lower one', () => {
    const lower = calculateFemaleDosage(normalInput);
    const higher = calculateFemaleDosage({ ...normalInput, compound: 'nandrolone_decanoate', proposed_weekly_dose_mg: 60 });
    expect(higher).toEqual(lower);
    expect(higher.status).toBe('NOT_AVAILABLE');
  });
});
