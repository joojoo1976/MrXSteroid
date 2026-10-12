import { describe, it, expect } from 'vitest';
import {
  alphaForSex,
  calculateEgfrCkdEpi2021,
  calculateHydrationIndex,
  calculateRenalFunction,
  egfrCategory,
  kappaForSex,
} from './tool-103-renal-function-hydration-index';

describe('Tool #103 - Renal Function & Hydration Index', () => {
  it('uses the CKD-EPI 2021 sex constants', () => {
    expect(kappaForSex('female')).toBe(0.7);
    expect(kappaForSex('male')).toBe(0.9);
    expect(alphaForSex('female')).toBeCloseTo(-0.241, 6);
    expect(alphaForSex('male')).toBeCloseTo(-0.302, 6);
  });

  it('computes reference eGFR values against hand-calculated results', () => {
    // Male, 30 y, Scr 1.0 mg/dL: 142 * 1 * (1/0.9)^-1.2 * 0.9938^30 ~ 104
    const male = calculateEgfrCkdEpi2021(1.0, 30, 'male');
    expect(male).not.toBeNull();
    expect(male as number).toBeGreaterThanOrEqual(102);
    expect(male as number).toBeLessThanOrEqual(106);
    // Female, 30 y, Scr 0.7 mg/dL (ratio <= 1): 142 * 1.012 * 0.9938^30 ~ 119
    const female = calculateEgfrCkdEpi2021(0.7, 30, 'female');
    expect(female).toBeGreaterThanOrEqual(117);
    expect(female).toBeLessThanOrEqual(121);
  });

  it('rejects creatinine outside the validated CKD-EPI range', () => {
    expect(calculateEgfrCkdEpi2021(0.2, 30, 'male')).toBeNull();
    expect(calculateEgfrCkdEpi2021(4.5, 30, 'male')).toBeNull();
    expect(egfrCategory(null)).toBe('invalid');
  });

  it('maps eGFR onto KDIGO categories with exact boundaries', () => {
    expect(egfrCategory(95)).toBe('G1');
    expect(egfrCategory(90)).toBe('G1');
    expect(egfrCategory(89)).toBe('G2');
    expect(egfrCategory(60)).toBe('G2');
    expect(egfrCategory(59)).toBe('G3a');
    expect(egfrCategory(45)).toBe('G3a');
    expect(egfrCategory(44)).toBe('G3b');
    expect(egfrCategory(30)).toBe('G3b');
    expect(egfrCategory(29)).toBe('G4');
    expect(egfrCategory(15)).toBe('G4');
    expect(egfrCategory(14)).toBe('G5');
  });

  it('scores hydration against a 30 ml/kg/day target with climate and sweat adjustments', () => {
    // 80 kg temperate, no sweat: target = 2.4 L; intake 2.4 -> index 100
    const perfect = calculateHydrationIndex(2.4, 80, 'temperate', 0);
    expect(perfect.target_fluid_liters).toBe(2.4);
    expect(perfect.hydration_index).toBe(100);
    expect(perfect.hydration_status).toBe('well-hydrated');
    // Intake half the target -> index 50 -> flagged
    const low = calculateHydrationIndex(1.2, 80, 'temperate', 0);
    expect(low.hydration_index).toBe(50);
    expect(low.hydration_status).toBe('dehydration-flagged');
    // Hot/humid raises the target: 80 * 30 * 1.15 / 1000 + 0.5 = 3.26 -> 3.3
    const hot = calculateHydrationIndex(3.26, 80, 'hot_humid', 0.5);
    expect(hot.target_fluid_liters).toBe(3.3);
    // Mild band 60-84
    const mild = calculateHydrationIndex(1.6, 80, 'temperate', 0);
    expect(mild.hydration_status).toBe('mild-dehydration-risk');
  });

  it('stamps the educational scope notice and monitoring flags end to end', () => {
    const r = calculateRenalFunction({
      serum_creatinine_mg_dl: 1.3,
      age_years: 55,
      sex: 'male',
      body_weight_kg: 90,
      fluid_intake_liters: 1.5,
      climate: 'hot_humid',
      training_sweat_liters: 1.0,
    });
    expect(r.scope_notice).toBe(
      'educational_ckd_epi_2021_estimate_only_not_a_diagnosis_of_renal_function_or_hydration_status',
    );
    expect(r.egfr_valid).toBe(true);
    expect(r.monitoring_flags.length).toBeGreaterThan(0);
    expect(r.monitoring_flags.join(' ')).toMatch(/rehydration|clinician|monitor/);
  });
});
