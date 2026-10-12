import { describe, it, expect } from 'vitest';
import { manageSodiumPotassium } from './tool-098-sodium-potassium-manager';

describe('Tool #098 — Sodium-Potassium Manager Engine', () => {
  it('identifies balanced electrolyte intake with normal blood pressure', () => {
    const result = manageSodiumPotassium({
      daily_sodium_mg: 3000,
      daily_potassium_mg: 3800,
      aldosterone_stress_or_aas: false,
      resting_blood_pressure_systolic: 118,
    });
    expect(result.sodium_to_potassium_ratio).toBeLessThan(1.0);
    expect(result.electrolyte_balance_tier).toBe('optimal');
    expect(result.cardiovascular_strain_index).toBeLessThan(30);
  });

  it('flags high risk when sodium heavily outweighs potassium alongside hypertension', () => {
    const result = manageSodiumPotassium({
      daily_sodium_mg: 6000,
      daily_potassium_mg: 2000,
      aldosterone_stress_or_aas: true,
      resting_blood_pressure_systolic: 145,
    });
    expect(result.sodium_to_potassium_ratio).toBeGreaterThan(2.5);
    expect(result.electrolyte_balance_tier).toBe('potassium-deficient-high-risk');
    expect(result.cardiovascular_strain_index).toBeGreaterThanOrEqual(70);
  });
});
