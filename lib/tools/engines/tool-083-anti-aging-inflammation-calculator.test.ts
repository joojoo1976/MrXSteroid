import { describe, it, expect } from 'vitest';
import { calculateAntiAgingInflammation } from './tool-083-anti-aging-inflammation-calculator';

describe('Tool #083 — Anti-Aging Inflammation Calculator Engine', () => {
  it('correctly scores minimal inflammaging baseline', () => {
    const res = calculateAntiAgingInflammation({
      hs_crp_mg_l: 0.4,
      visceral_adiposity_rating: 'low',
      periodontal_disease_present: false,
      daily_joint_stiffness_morning_mins: 0,
      anti_inflammatory_polyphenols_daily: true,
    });

    expect(res.inflammaging_tier).toBe('minimal-baseline');
    expect(res.inflammaging_index_score).toBeLessThanOrEqual(30);
  });

  it('detects pronounced inflammaging wear with high CRP and visceral fat', () => {
    const res = calculateAntiAgingInflammation({
      hs_crp_mg_l: 3.8,
      visceral_adiposity_rating: 'high',
      periodontal_disease_present: true,
      daily_joint_stiffness_morning_mins: 45,
      anti_inflammatory_polyphenols_daily: false,
    });

    expect(res.inflammaging_tier).toBe('pronounced-systemic-wear');
    expect(res.inflammaging_index_score).toBeGreaterThanOrEqual(65);
    expect(res.warnings).toContain('elevated_crp_indicates_pronounced_systemic_inflammatory_burden');
    expect(res.warnings).toContain('periodontal_pathogens_induce_continuous_endotoxin_release_driving_inflammaging');
  });
});
