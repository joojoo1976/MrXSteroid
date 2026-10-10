import { describe, it, expect } from 'vitest';
import { assessFertility } from './tool-047-fertility-preservation';

describe('tool-047 fertility preservation engine', () => {
  it('mid suppression with HCG shortens recovery inside the planning horizon', () => {
    const r = assessFertility({
      age: 30,
      suppression_level: 2,
      uses_hcg: true,
      planning_horizon_months: 6,
    });
    expect(r.fertility_impact_pct).toBe(50); // 65 - 15 hcg offset
    expect(r.recovery_projection_months).toBe(5); // 6 - 2 hcg, +1 age>28
    expect(r.within_horizon).toBe(true);
    expect(r.protocol_hints).toContain('hcg_preservation_discussed');
    expect(r.protocol_hints).toContain('off_cycle_semen_analysis_recommended');
    expect(r.warnings).toEqual([]);
  });

  it('heavy 19-nor-style suppression at advanced age exceeds short horizons', () => {
    const r = assessFertility({
      age: 38,
      suppression_level: 3,
      uses_hcg: false,
      planning_horizon_months: 6,
    });
    expect(r.fertility_impact_pct).toBe(85);
    expect(r.recovery_projection_months).toBe(15); // 12 + 3 (age>35)
    expect(r.within_horizon).toBe(false);
    expect(r.protocol_hints).toContain('defer_cycle_until_family_planning_settled');
    expect(r.warnings).toContain('high_suppression_impact_medical_consult');
  });

  it('mild suppression plans realistically without HCG', () => {
    const r = assessFertility({
      age: 26,
      suppression_level: 1,
      uses_hcg: false,
      planning_horizon_months: 4,
    });
    expect(r.fertility_impact_pct).toBe(40);
    expect(r.recovery_projection_months).toBe(3);
    expect(r.within_horizon).toBe(true);
    expect(r.protocol_hints).not.toContain('hcg_preservation_discussed');
  });
});
