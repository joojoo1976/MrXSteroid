import { describe, it, expect } from 'vitest';
import { estimateAromatization } from './tool-065-aromatase-conversion-calculator';

describe('tool-065 aromatase conversion engine', () => {
  it('estimates E2 at the documented bodyfat-scaled baseline', () => {
    const r = estimateAromatization({ testosterone_mg_week: 200, body_fat_pct: 15, aromatase_inhibitor: 'none' });
    expect(r.e2_estimate_pg_ml).toBe(45); // 200 × (0.15 + 15/200)
    expect(r.band).toBe('normal-range');
    expect(r.warnings).toEqual(['educational_population_estimate']);
  });

  it('models anastrozole damping and flags overtitration risk', () => {
    const r = estimateAromatization({ testosterone_mg_week: 200, body_fat_pct: 15, aromatase_inhibitor: 'anastrozole_1mg' });
    expect(r.e2_estimate_pg_ml).toBe(22.5); // 45 × 0.5
    expect(r.band).toBe('normal-range');
    expect(r.warnings).toContain('ai_overtitration_risk');
  });

  it('flags elevated E2 for high dose at higher bodyfat', () => {
    const r = estimateAromatization({ testosterone_mg_week: 400, body_fat_pct: 30, aromatase_inhibitor: 'none' });
    expect(r.e2_estimate_pg_ml).toBe(120); // 400 × (0.15 + 30/200)
    expect(r.band).toBe('elevated-e2');
    expect(r.warnings).toEqual(['educational_population_estimate', 'elevated_e2_context']);
  });
});
