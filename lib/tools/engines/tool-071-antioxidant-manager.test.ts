import { describe, it, expect } from 'vitest';
import { manageAntioxidants } from './tool-071-antioxidant-manager';

describe('Tool #071 — Antioxidant Manager Engine', () => {
  it('identifies robust defense with high fruit/veg and targeted cofactors', () => {
    const res = manageAntioxidants({
      daily_fruit_veg_servings: 8,
      takes_coq10: true,
      takes_vitamin_c_e: true,
      takes_zinc_selenium: true,
      high_oxidative_lifestyle: false,
    });
    // 15 + 40 + 15 + 15 + 15 = 100
    expect(res.antioxidant_defense_score).toBe(100);
    expect(res.defense_tier).toBe('robust-defense');
    expect(res.key_recommendations.length).toBe(0);
  });

  it('detects depleted defense in high oxidative lifestyle with low plant intake', () => {
    const res = manageAntioxidants({
      daily_fruit_veg_servings: 1,
      takes_coq10: false,
      takes_vitamin_c_e: false,
      takes_zinc_selenium: false,
      high_oxidative_lifestyle: true,
    });
    // 15 + 5 - 15 = 5
    expect(res.antioxidant_defense_score).toBe(5);
    expect(res.defense_tier).toBe('depleted-defense');
    expect(res.warnings).toContain('high_oxidative_strain_outstripping_low_antioxidant_intake');
    expect(res.key_recommendations).toContain('aim_for_minimum_5_servings_colorful_plants');
    expect(res.key_recommendations).toContain('consider_coq10_ubiquinol_for_mitochondrial_support');
  });

  it('categorizes adequate defense correctly', () => {
    const res = manageAntioxidants({
      daily_fruit_veg_servings: 5,
      takes_coq10: false,
      takes_vitamin_c_e: true,
      takes_zinc_selenium: false,
      high_oxidative_lifestyle: false,
    });
    // 15 + 25 + 15 = 55
    expect(res.antioxidant_defense_score).toBe(55);
    expect(res.defense_tier).toBe('adequate-defense');
  });
});
