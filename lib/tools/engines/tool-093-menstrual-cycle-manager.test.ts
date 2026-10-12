import { describe, it, expect } from 'vitest';
import { manageMenstrualCycle, type MenstrualCycleManagerInput } from './tool-093-menstrual-cycle-manager';

describe('Tool #093 — Menstrual Cycle Manager Engine', () => {
  it('correctly maps late follicular phase around day 12-14 with peak strength power', () => {
    const input: MenstrualCycleManagerInput = {
      cycle_length_days: 28,
      current_cycle_day: 12,
      oral_contraceptive_active: false,
      high_intensity_training_focus: true,
    };

    const res = manageMenstrualCycle(input);
    expect(res.current_phase).toBe('late_follicular_ovulatory');
    expect(res.strength_power_potential_score).toBe(90);
    expect(res.metabolic_substrate_preference).toBe('carbohydrate_glycogen_dominant');
    expect(res.thermoregulatory_strain_tier).toBe('baseline_cool');
  });

  it('correctly flags elevated basal temp and deload recommendation in late luteal dip', () => {
    const input: MenstrualCycleManagerInput = {
      cycle_length_days: 28,
      current_cycle_day: 26,
      oral_contraceptive_active: false,
      high_intensity_training_focus: true,
    };

    const res = manageMenstrualCycle(input);
    expect(res.current_phase).toBe('late_luteal_premenstrual');
    expect(res.thermoregulatory_strain_tier).toBe('elevated_core_temp_higher_sweat_sodium');
    expect(res.recommendations.some(r => r.includes('deload'))).toBe(true);
  });
});
