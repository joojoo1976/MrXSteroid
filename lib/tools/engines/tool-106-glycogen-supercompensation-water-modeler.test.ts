import { describe, it, expect } from 'vitest';
import { calcMaxMuscleGlycogen, calcGlycogenModel, type GlycogenInput } from './tool-106-glycogen-supercompensation-water-modeler';

const base: GlycogenInput = {
  body_weight_kg: 92,
  lean_mass_kg: 74,
  training_load: 'medium',
  target_carbs_g_per_kg: 10,
  days: 3,
  baseline_glycogen_g: 420,
};

describe('Tool #106 - Glycogen Supercompensation & Water Retention Modeler', () => {
  it('derives the muscle glycogen ceiling from lean mass', () => {
    // leanKg * 15 g/kg + 150 g baseline
    expect(calcMaxMuscleGlycogen(70)).toBe(1200);
    expect(calcMaxMuscleGlycogen(0)).toBe(150);
  });

  it('caps the predicted glycogen at the model ceiling of 600 g', () => {
    const r = calcGlycogenModel(base);
    // min(1260 * 0.92 = 1159.2, min(30000, 600)) = 600
    expect(r.predicted_max_glycogen_g).toBe(600);
    expect(r.total_glycogen_g).toBe(600);
    expect(r.liver_glycogen_g).toBe(100);
    expect(r.muscle_glycogen_g).toBe(500);
  });

  it('models water retention at the published ~2.7 g per g glycogen ratio', () => {
    const r = calcGlycogenModel(base);
    expect(r.water_retention_liters).toBeCloseTo(1.6, 5); // 600 * 2.7 / 1000
    expect(r.total_water_retention_liters).toBe(r.water_retention_liters);
    expect(r.water_retention_liters).toBeLessThan(74 * 0.25 + 1);
  });

  it('reports the carb budget per day and in total', () => {
    const r = calcGlycogenModel(base);
    expect(r.carb_budget_per_day_g).toBe(10);
    expect(r.total_carb_g).toBe(30000); // 10 * 1000 * 3
  });

  it('classifies GI risk across the low / medium / high bands', () => {
    expect(calcGlycogenModel({ ...base, target_carbs_g_per_kg: 5 }).gi_risk).toBe('low');
    expect(calcGlycogenModel({ ...base, target_carbs_g_per_kg: 10 }).gi_risk).toBe('medium');
    expect(calcGlycogenModel({ ...base, target_carbs_g_per_kg: 12 }).gi_risk).toBe('high');
    expect(calcGlycogenModel({ ...base, target_carbs_g_per_kg: 13 }).gi_risk).toBe('high');
  });

  it('never returns a value below the supplied baseline glycogen', () => {
    const r = calcGlycogenModel({ ...base, baseline_glycogen_g: 5000 });
    expect(r.predicted_max_glycogen_g).toBe(5000);
  });

  it('always emits education flags and a non-prescription scope notice', () => {
    const r = calcGlycogenModel(base);
    expect(r.scope_notice).toBe('educational_glycogen_and_water_reference_model_not_a_competition_protocol');
    expect(r.education_flags).toContain('values_are_reference_calculations_not_coaching_prescriptions');
    expect(r.gi_notes.length).toBeGreaterThan(0);
  });
});
