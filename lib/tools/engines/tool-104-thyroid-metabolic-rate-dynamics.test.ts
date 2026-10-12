import { describe, it, expect } from 'vitest';
import {
  calculateThyroidDynamics,
  mifflinStJeorBmr,
  thyroidMetabolicMultiplier,
} from './tool-104-thyroid-metabolic-rate-dynamics';

describe('Tool #104 - Thyroid Function & Metabolic Rate Dynamics', () => {
  it('computes Mifflin-St Jeor BMR for both sexes', () => {
    // Male 80 kg, 178 cm, 30 y: 10*80 + 6.25*178 - 5*30 + 5 = 1767.5 -> 1768
    expect(mifflinStJeorBmr(80, 178, 30, 'male')).toBe(1768);
    // Female same metrics: 1767.5 - 166 = 1601.5 -> 1602
    expect(mifflinStJeorBmr(80, 178, 30, 'female')).toBe(1602);
  });

  it('derives the thyroid multiplier from the free-T4 midpoint ratio, bounded 0.7-1.3', () => {
    expect(thyroidMetabolicMultiplier(1.3)).toBe(1); // at midpoint
    expect(thyroidMetabolicMultiplier(0.8)).toBeCloseTo(0.885, 3); // below
    expect(thyroidMetabolicMultiplier(1.8)).toBeCloseTo(1.115, 3); // above
    expect(thyroidMetabolicMultiplier(0.1)).toBe(0.723); // near floor (bounded at 0.7)
    expect(thyroidMetabolicMultiplier(9.9)).toBe(1.3); // ceiling
  });

  it('classifies the five documented thyroid patterns plus indeterminate', () => {
    const base = { age_years: 35, sex: 'male' as const, weight_kg: 80, height_cm: 178, free_t3_pg_ml: 3 };
    expect(calculateThyroidDynamics({ ...base, tsh_miu_l: 12, free_t4_ng_dl: 0.6 }).thyroid_state).toBe('primary-hypothyroidism-pattern');
    expect(calculateThyroidDynamics({ ...base, tsh_miu_l: 5, free_t4_ng_dl: 1.2 }).thyroid_state).toBe('subclinical-hypothyroidism-pattern');
    expect(calculateThyroidDynamics({ ...base, tsh_miu_l: 2, free_t4_ng_dl: 1.3 }).thyroid_state).toBe('euthyroid');
    expect(calculateThyroidDynamics({ ...base, tsh_miu_l: 0.1, free_t4_ng_dl: 2.5 }).thyroid_state).toBe('hyperthyroidism-pattern');
    expect(calculateThyroidDynamics({ ...base, tsh_miu_l: 0.2, free_t4_ng_dl: 1.5 }).thyroid_state).toBe('subclinical-hyperthyroidism-pattern');
    expect(calculateThyroidDynamics({ ...base, tsh_miu_l: 5, free_t4_ng_dl: 0.5 }).thyroid_state).toBe('indeterminate');
  });

  it('applies the multiplier to BMR and flags clinical review where required', () => {
    const r = calculateThyroidDynamics({ tsh_miu_l: 12, free_t4_ng_dl: 0.6, free_t3_pg_ml: 2.5, age_years: 35, sex: 'male', weight_kg: 80, height_cm: 178 });
    // Mifflin-St Jeor at 35 y: 10*80 + 6.25*178 - 5*35 + 5 = 1742.5 -> 1743
    expect(r.bmr_kcal).toBe(1743);
    expect(r.adjusted_bmr_kcal).toBe(Math.round(1743 * r.metabolic_multiplier));
    expect(r.metabolic_multiplier).toBeLessThan(1);
    expect(r.interpretation_flags.join(' ')).toMatch(/endocrinology_review_required/);
    expect(r.interpretation_flags.join(' ')).toMatch(/low_ft4_ratio_lowers_estimated_metabolic_rate/);
  });

  it('ALWAYS stamps the educational scope notice - never a diagnosis', () => {
    const r = calculateThyroidDynamics({ tsh_miu_l: 2, free_t4_ng_dl: 1.3, free_t3_pg_ml: 3, age_years: 30, sex: 'female', weight_kg: 60, height_cm: 165 });
    expect(r.scope_notice).toBe('educational_thyroid_metabolic_estimate_only_not_a_diagnosis_of_thyroid_dysfunction');
  });
});
