import { describe, it, expect } from 'vitest';
import { optimizeSpermProduction } from './tool-064-sperm-production-optimizer';

describe('tool-064 sperm production engine', () => {
  it('scores a long-off, HCG-supported context as recovered', () => {
    const r = optimizeSpermProduction({ months_since_last_cycle: 9, age: 32, hcg_used: true, weekly_training_hours: 4, sleep_hours: 8 });
    expect(r.recovery_score).toBe(85); // 75 +5 hcg +5 sleep
    expect(r.band).toBe('recovered-context');
    expect(r.recommendations).toEqual([]);
    expect(r.warnings).toContain('educational_not_fertility_treatment');
  });

  it('recommends the wait and HCG discussion early after a cycle', () => {
    const r = optimizeSpermProduction({ months_since_last_cycle: 2, age: 32, hcg_used: false, weekly_training_hours: 10, sleep_hours: 8 });
    expect(r.recovery_score).toBe(35); // 30 +5 sleep(8)
    expect(r.band).toBe('early-recovery');
    expect(r.recommendations).toEqual(['wait_spermatogenesis_74d', 'hcg_discuss_with_physician', 'training_6h_cap']);
  });

  it('applies the age-40 penalty while keeping recommendations honest', () => {
    const r = optimizeSpermProduction({ months_since_last_cycle: 12, age: 45, hcg_used: true, weekly_training_hours: 4, sleep_hours: 6 });
    expect(r.recovery_score).toBe(70); // 75 +5 hcg −10 age +0 sleep(6<7)
    expect(r.band).toBe('recovering');
    expect(r.recommendations).toEqual(['sleep_7h']);
  });
});
