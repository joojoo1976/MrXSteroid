import { describe, it, expect } from 'vitest';
import { assessAndrogenicBalance, type AndrogenicBalanceInput } from './tool-058-androgenic-balance';

const base: AndrogenicBalanceInput = {
  anabolic_activity: 60,
  androgenic_activity: 60,
  androgenic_side_effects: 0,
  mpb_history: false,
  acne_severity: 0,
};

describe('tool-058 Androgenic Balance', () => {
  it('a 1:1 rating is balanced with a dissociation index of 50', () => {
    const r = assessAndrogenicBalance(base);
    expect(r.anabolic_androgenic_ratio).toBe(1);
    expect(r.dissociation_index).toBe(50);
    expect(r.band).toBe('balanced');
  });

  it('a high anabolic rating classifies as anabolic-dominant', () => {
    const r = assessAndrogenicBalance({ ...base, anabolic_activity: 90, androgenic_activity: 30 });
    expect(r.anabolic_androgenic_ratio).toBe(3);
    expect(r.band).toBe('anabolic-dominant');
    expect(r.dissociation_index).toBeGreaterThan(50);
  });

  it('a high androgenic rating classifies as androgenic-dominant', () => {
    const r = assessAndrogenicBalance({ ...base, anabolic_activity: 30, androgenic_activity: 90 });
    expect(r.band).toBe('androgenic-dominant');
    expect(r.dissociation_index).toBeLessThan(50);
  });

  it('tracks the reported side-effect burden', () => {
    const low = assessAndrogenicBalance(base);
    const high = assessAndrogenicBalance({ ...base, androgenic_side_effects: 3, acne_severity: 3 });
    expect(low.side_effect_burden).toBe('low');
    expect(high.side_effect_burden).toBe('high');
    expect(high.safety_flags).toContain('high_androgenic_burden');
  });

  it('is deterministic and never recommends a compound or dose', () => {
    const a = assessAndrogenicBalance(base);
    const b = assessAndrogenicBalance(base);
    expect(a).toEqual(b);
    expect(a.education.join(' ')).not.toMatch(/\b\d+\s?(mg|iu|mcg)\b/i);
  });
});
