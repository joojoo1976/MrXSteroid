import { describe, it, expect } from 'vitest';
import { assessCardiovascularRisk } from './tool-048-cardiovascular-risk';

describe('tool-048 cardiovascular risk engine', () => {
  it('accumulates documented risk factors into the high band', () => {
    const r = assessCardiovascularRisk({
      age: 50, sex: 'male', smoker: true,
      systolic_bp: 140, total_cholesterol: 220, hdl: 35,
      on_cycle: true,
    });
    expect(r.risk_pct_10yr).toBe(23); // 11.2+1.6+1.6+1.0+4+3+1 = 23.4 -> 23
    expect(r.band).toBe('high');
    expect(r.drivers).toEqual(['age', 'blood_pressure', 'total_cholesterol', 'low_hdl', 'smoking', 'on_cycle_burden']);
    expect(r.mitigations).toContain('smoking_cessation');
    expect(r.mitigations).toContain('cycle_responsibility_bp_lipid_monitoring');
    expect(r.warnings).toContain('educational_not_clinical_ascvd');
    expect(r.warnings).toContain('consult_physician');
  });

  it('young healthy profile stays low with no drivers', () => {
    const r = assessCardiovascularRisk({
      age: 28, sex: 'female', smoker: false,
      systolic_bp: 115, total_cholesterol: 170, hdl: 55,
      on_cycle: false,
    });
    expect(r.risk_pct_10yr).toBe(4); // (28-18)*0.35 = 3.5 -> 4
    expect(r.band).toBe('low');
    expect(r.drivers).toEqual([]);
    expect(r.mitigations).toEqual([]);
  });

  it('peaks at 53 for maximal documented inputs — under the 60 ceiling', () => {
    const r = assessCardiovascularRisk({
      age: 90, sex: 'male', smoker: true,
      systolic_bp: 220, total_cholesterol: 400, hdl: 20,
      on_cycle: true,
    });
    expect(r.risk_pct_10yr).toBe(53); // raw 52.5 -> 53; ceiling 60 never crossed
    expect(r.band).toBe('high');
  });
});
