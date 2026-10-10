import { describe, it, expect } from 'vitest';
import { predictDhtEffects } from './tool-044-dht-side-effects';

describe('tool-044 DHT side-effect engine', () => {
  it('baseline DHT with no risk factors yields the documented 30% baseline', () => {
    const r = predictDhtEffects({ dht_ng_dl: 50, uses_dht_derivative: false, five_ari: 'none', family_history_hairloss: false, age: 30 });
    expect(r.hair_loss_risk_pct).toBeCloseTo(30, 1);
    expect(r.prostate_symptom_risk_pct).toBeCloseTo(25, 1);
    expect(r.band).toBe('low'); // (0.30+0.25)/2 = 27.5% < 33% -> low
  });

  it('dutasteride fully suppresses the modeled DHT-mediated hair risk', () => {
    const r = predictDhtEffects({ dht_ng_dl: 50, uses_dht_derivative: false, five_ari: 'dutasteride', family_history_hairloss: false, age: 30 });
    expect(r.hair_loss_risk_pct).toBe(0);
    expect(r.band).toBe('low');
  });

  it('family history + derivative stacks toward high burden', () => {
    const r = predictDhtEffects({ dht_ng_dl: 90, uses_dht_derivative: true, five_ari: 'none', family_history_hairloss: true, age: 30 });
    expect(r.hair_loss_risk_pct).toBe(80);
    expect(r.overall_burden_pct).toBeCloseTo(60, 1); // (80 + 40)/2 — prostate picks up the derivative term
    expect(r.band).toBe('moderate');
    expect(r.mitigations.length).toBeGreaterThan(0);
  });
});
