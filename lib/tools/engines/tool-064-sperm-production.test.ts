import { describe, it, expect } from 'vitest';
import { assessSpermProduction, type SpermProductionInput } from './tool-064-sperm-production';

const healthy: SpermProductionInput = {
  age: 30,
  bmi: 23,
  sleep_hours: 8,
  heat_exposure_hours: 1,
  exercise_days: 4,
  smoker: false,
  alcohol_units: 3,
  stress_level: 2,
  abstinence_days: 3,
  exogenous_androgen: false,
  fertility_intent: false,
};

const poor: SpermProductionInput = {
  age: 50,
  bmi: 38,
  sleep_hours: 5,
  heat_exposure_hours: 12,
  exercise_days: 0,
  smoker: true,
  alcohol_units: 30,
  stress_level: 9,
  abstinence_days: 12,
  exogenous_androgen: false,
  fertility_intent: false,
};

describe('tool-064 Sperm Production Optimizer', () => {
  it('a healthy lifestyle profile scores favourable', () => {
    const r = assessSpermProduction(healthy);
    expect(r.band).toBe('favourable');
    expect(r.spermatogenesis_index).toBeGreaterThanOrEqual(70);
  });

  it('a poor profile scores lower and is unfavourable', () => {
    const good = assessSpermProduction(healthy);
    const bad = assessSpermProduction(poor);
    expect(bad.spermatogenesis_index).toBeLessThan(good.spermatogenesis_index);
    expect(bad.band).toBe('unfavourable');
    expect(bad.safety_flags).toContain('high_heat_exposure');
  });

  it('flags exogenous androgen use and escalates fertility intent', () => {
    const r = assessSpermProduction({ ...healthy, exogenous_androgen: true, fertility_intent: true });
    expect(r.safety_flags).toContain('exogenous_androgen');
    expect(r.safety_flags).toContain('fertility_intent_with_androgen');
    expect(r.clinical_referral_advised).toBe(true);
  });

  it('keeps the index within 0–100 and is deterministic', () => {
    const r = assessSpermProduction(poor);
    expect(r.spermatogenesis_index).toBeGreaterThanOrEqual(0);
    expect(r.spermatogenesis_index).toBeLessThanOrEqual(100);
    expect(assessSpermProduction(healthy)).toEqual(assessSpermProduction(healthy));
  });

  it('never recommends hormones, hCG or doses', () => {
    const r = assessSpermProduction(healthy);
    expect(r.education.join(' ')).not.toMatch(/\b\d+\s?(mg|iu|mcg)\b/i);
    expect(r.education.join(' ')).toMatch(/never recommends hormones/i);
  });
});
