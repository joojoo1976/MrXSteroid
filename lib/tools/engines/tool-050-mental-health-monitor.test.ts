import { describe, it, expect } from 'vitest';
import {
  assessMentalHealth,
  CRISIS_MESSAGE,
  type MentalHealthInput,
} from './tool-050-mental-health-monitor';

const zero: MentalHealthInput = {
  little_interest: 0,
  feeling_down: 0,
  sleep_problems: 0,
  low_energy: 0,
  appetite_change: 0,
  low_self_worth: 0,
  poor_concentration: 0,
  psychomotor_change: 0,
  suicidal_ideation: 0,
  functional_impairment: false,
};

const KEYS = [
  'little_interest', 'feeling_down', 'sleep_problems', 'low_energy',
  'appetite_change', 'low_self_worth', 'poor_concentration',
  'psychomotor_change', 'suicidal_ideation',
] as const;

function withTotal(target: number): MentalHealthInput {
  const out = { ...zero } as unknown as Record<string, number | boolean>;
  let remaining = target;
  for (const k of KEYS) {
    const v = Math.min(3, Math.max(0, remaining));
    out[k] = v;
    remaining -= v;
  }
  return out as unknown as MentalHealthInput;
}

describe('tool-050 Mental Health Monitor', () => {
  it('zero responses => no severity, no crisis', () => {
    const r = assessMentalHealth(zero);
    expect(r.total_score).toBe(0);
    expect(r.severity).toBe('none');
    expect(r.crisis).toBe(false);
    expect(r.crisis_message).toBeNull();
  });

  it('severity bands map correctly at boundaries', () => {
    expect(assessMentalHealth(withTotal(4)).total_score).toBe(4);
    expect(assessMentalHealth(withTotal(4)).severity).toBe('none');
    expect(assessMentalHealth(withTotal(5)).severity).toBe('mild');
    expect(assessMentalHealth(withTotal(10)).severity).toBe('moderate');
    expect(assessMentalHealth(withTotal(15)).severity).toBe('moderately-severe');
    expect(assessMentalHealth(withTotal(20)).severity).toBe('severe');
  });

  it('any suicidal ideation (>0) triggers an unmissable crisis message', () => {
    const r = assessMentalHealth({ ...zero, suicidal_ideation: 1 });
    expect(r.crisis).toBe(true);
    expect(r.crisis_message).toBe(CRISIS_MESSAGE);
    expect(r.recommendations.join(' ')).toMatch(/crisis|emergency/i);
  });

  it('clamps out-of-range item values to 0-3', () => {
    const r = assessMentalHealth({ ...zero, feeling_down: 9, low_energy: -4 });
    expect(r.total_score).toBe(3);
  });

  it('functional impairment adds a clinical-review recommendation', () => {
    const r = assessMentalHealth({ ...zero, feeling_down: 3, functional_impairment: true });
    expect(r.recommendations.join(' ')).toMatch(/review/i);
  });
});
