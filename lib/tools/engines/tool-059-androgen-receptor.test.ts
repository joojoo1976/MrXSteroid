import { describe, it, expect } from 'vitest';
import { assessAndrogenReceptor, type AndrogenReceptorInput } from './tool-059-androgen-receptor';

const optimal: AndrogenReceptorInput = {
  age: 30,
  sleep_hours: 8,
  resistance_training_days: 4,
  body_fat_pct: 15,
  protein_g_per_kg: 2,
  stress_level: 2,
  vitamin_d_ng_ml: 40,
  ar_cag_repeats: 18,
};

const poor: AndrogenReceptorInput = {
  age: 60,
  sleep_hours: 4,
  resistance_training_days: 0,
  body_fat_pct: 40,
  protein_g_per_kg: 0.6,
  stress_level: 9,
  vitamin_d_ng_ml: 12,
  ar_cag_repeats: 34,
};

describe('tool-059 Androgen Receptor Optimizer', () => {
  it('an optimal lifestyle profile scores in the favourable band', () => {
    const r = assessAndrogenReceptor(optimal);
    expect(r.band).toBe('favourable');
    expect(r.ar_sensitivity_index).toBeGreaterThanOrEqual(70);
  });

  it('a poor profile scores materially lower and flags the context', () => {
    const good = assessAndrogenReceptor(optimal);
    const bad = assessAndrogenReceptor(poor);
    expect(bad.ar_sensitivity_index).toBeLessThan(good.ar_sensitivity_index);
    expect(bad.band).toBe('suboptimal');
    expect(bad.safety_flags).toContain('suboptimal_signalling_context');
  });

  it('flags severe sleep restriction', () => {
    const r = assessAndrogenReceptor({ ...optimal, sleep_hours: 4 });
    expect(r.safety_flags).toContain('severe_sleep_restriction');
  });

  it('keeps the index within 0–100 and is deterministic', () => {
    const r = assessAndrogenReceptor(poor);
    expect(r.ar_sensitivity_index).toBeGreaterThanOrEqual(0);
    expect(r.ar_sensitivity_index).toBeLessThanOrEqual(100);
    expect(assessAndrogenReceptor(optimal)).toEqual(assessAndrogenReceptor(optimal));
  });

  it('never recommends drugs or doses', () => {
    const r = assessAndrogenReceptor(poor);
    expect(r.education.join(' ')).not.toMatch(/\b\d+\s?(mg|iu|mcg)\b/i);
    expect(r.education.join(' ')).toMatch(/never recommends medication/i);
  });
});
