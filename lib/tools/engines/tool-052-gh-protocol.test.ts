import { describe, it, expect } from 'vitest';
import { planGhProtocol } from './tool-052-gh-protocol';

const base = {
  weekly_iu: 7, injections_per_week: 7, age: 30,
  baseline_igf1_ng_ml: 180, fasting_glucose_mg_dl: 90, hypothyroid: false,
};

describe('tool-052 GH Protocol Planner', () => {
  it('splits the weekly amount across injections (arithmetic)', () => {
    expect(planGhProtocol(base).per_injection_iu).toBeCloseTo(1, 2);
  });

  it('response index increases with weekly amount', () => {
    const low = planGhProtocol({ ...base, weekly_iu: 3 });
    const high = planGhProtocol({ ...base, weekly_iu: 14 });
    expect(high.igf1_response_index).toBeGreaterThan(low.igf1_response_index);
  });

  it('age attenuates the response index', () => {
    const young = planGhProtocol({ ...base, age: 25 });
    const older = planGhProtocol({ ...base, age: 65 });
    expect(older.igf1_response_index).toBeLessThan(young.igf1_response_index);
  });

  it('flags impaired fasting glucose', () => {
    const r = planGhProtocol({ ...base, fasting_glucose_mg_dl: 110 });
    expect(r.glucose_risk).toBe('moderate');
    expect(r.safety_flags.join(' ')).toMatch(/glucose/i);
  });

  it('never recommends a dose', () => {
    const r = planGhProtocol(base);
    expect(r.educational_notice).toMatch(/educational/i);
    expect(r.safety_flags.join(' ')).not.toMatch(/you should (take|inject)/i);
  });
});
