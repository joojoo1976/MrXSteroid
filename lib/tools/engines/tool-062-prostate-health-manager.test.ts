import { describe, it, expect } from 'vitest';
import { assessProstateHealth } from './tool-062-prostate-health-manager';

describe('tool-062 prostate health engine', () => {
  it('bands PSA inside the age-specific ceiling without flags', () => {
    const r = assessProstateHealth({ age: 45, psa_ng_ml: 1.8 });
    expect(r.psa_ceiling).toBe(2.5); // published 40–49 age-specific ceiling
    expect(r.band).toBe('age-normal');
    expect(r.warnings).toEqual(['educational_screening_not_diagnosis']);
  });

  it('bands above-ceiling PSA and flags a fast annual rise', () => {
    const r = assessProstateHealth({ age: 55, psa_ng_ml: 6, psa_prev_1y_ng_ml: 5 });
    expect(r.psa_ceiling).toBe(3.5);
    expect(r.band).toBe('above-age-ceiling');
    expect(r.psa_delta_1y).toBe(1);
    expect(r.warnings).toContain('rapid_psa_rise_see_urologist');
  });

  it('uses the oldest-band ceiling and treats <40 strictly', () => {
    const young = assessProstateHealth({ age: 35, psa_ng_ml: 2.5 });
    expect(young.psa_ceiling).toBe(2);
    expect(young.band).toBe('above-age-ceiling');

    const senior = assessProstateHealth({ age: 75, psa_ng_ml: 5 });
    expect(senior.psa_ceiling).toBe(6.5);
    expect(senior.band).toBe('age-normal');
  });
});
