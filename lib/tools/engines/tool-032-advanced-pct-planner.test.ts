/**
 * Tool #032 — Advanced PCT Planner: engine + schema verification.
 * Proves washout math, SERM selection tiers and the hCG-bridge guard.
 */
import { describe, it, expect } from 'vitest';
import { planAdvancedPCT } from './tool-032-advanced-pct-planner';
import { PctPlannerInputSchema, PctPlannerResultSchema } from '../schemas/tool-032-advanced-pct-planner';

describe('tool-032 advanced-pct engine', () => {
  it('plans a mild single-ester PCT with hCG bridge', () => {
    const input = {
      compounds: [
        {
          name_en: 'Testosterone Enanthate',
          ester_half_life_days: 4.5,
          weekly_dose_mg: 500,
          last_dose_date: '2026-01-01',
          suppression_factor: 1,
        },
      ],
      hcg_used_on_cycle: false,
    };
    expect(PctPlannerInputSchema.safeParse(input).success).toBe(true);
    const r = planAdvancedPCT(input);
    expect(PctPlannerResultSchema.safeParse(r).success).toBe(true);
    // 4.5d * log2(1/0.05)=4.5*4.3219=19.45 -> 20 days; 2026-01-01 + 20d = 2026-01-21
    expect(r.washout_days).toBe(20);
    expect(r.pct_start_date).toBe('2026-01-21');
    expect(r.suppression_load).toBe(1);
    expect(r.serm_protocol[0].drug).toBe('nolvadex');
    expect(r.hcg_bridge).not.toBeNull();
  });

  it('uses the slowest ester for the washout anchor', () => {
    const r = planAdvancedPCT({
      compounds: [
        { name_en: 'Test Prop', ester_half_life_days: 1.5, weekly_dose_mg: 300, last_dose_date: '2026-01-01', suppression_factor: 1 },
        { name_en: 'Nandrolone Decanoate', ester_half_life_days: 7.5, weekly_dose_mg: 400, last_dose_date: '2026-01-01', suppression_factor: 3 },
      ],
      hcg_used_on_cycle: true,
    });
    // slowest: 7.5*4.3219=32.4 -> 33 days
    expect(r.washout_days).toBe(33);
    expect(r.hcg_bridge).toBeNull();
    // load = 1*0.6 + 3*0.8 = 3.0 -> moderate tier: single-agent nolvadex
    expect(r.suppression_load).toBeCloseTo(3.0, 5);
    expect(r.serm_protocol[0].drug).toBe('nolvadex');
  });

  it('selects dual-SERM for heavy suppression with a warning', () => {
    const r = planAdvancedPCT({
      compounds: [
        { name_en: 'Trenbolone', ester_half_life_days: 3, weekly_dose_mg: 500, last_dose_date: '2026-02-01', suppression_factor: 3.5 },
        { name_en: 'Nandrolone', ester_half_life_days: 7.5, weekly_dose_mg: 500, last_dose_date: '2026-02-01', suppression_factor: 3 },
      ],
      hcg_used_on_cycle: false,
    });
    expect(r.suppression_load).toBeGreaterThan(4);
    expect(r.serm_protocol).toHaveLength(2);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it('handles empty input without crashing', () => {
    const r = planAdvancedPCT({ compounds: [], hcg_used_on_cycle: false });
    expect(r.washout_days).toBe(0);
    expect(r.serm_protocol).toEqual([]);
    expect(PctPlannerResultSchema.safeParse(r).success).toBe(true);
  });

  it('rejects invalid input through the schema', () => {
    expect(PctPlannerInputSchema.safeParse({ compounds: [], hcg_used_on_cycle: false }).success).toBe(false);
  });
});
