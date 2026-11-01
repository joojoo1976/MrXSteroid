import { describe, it, expect } from 'vitest';
import { calculatePhysiqueV6 } from '@/lib/tools/engines/tool-136-physique-golden-ratio-score.v6';

describe('physique', () => {
  it('full measurements', () => {
    const r = calculatePhysiqueV6({ shoulder_cm: 120, waist_cm: 80, chest_cm: 110, arm_cm: 40 });
    expect(r.proportionScore).toBeGreaterThan(0);
    expect(Object.keys(r.ratios).length).toBeGreaterThan(0);
  });
  it('missing measurements', () => {
    const r = calculatePhysiqueV6({ shoulder_cm: 120 });
    expect(r.proportionScore).toBeNull();
  });
  it('NaN throws', () => {
    expect(() => calculatePhysiqueV6({ shoulder_cm: NaN })).toThrow();
  });
  it('sensitivity', () => {
    const a = calculatePhysiqueV6({ shoulder_cm: 100, waist_cm: 80 });
    const b = calculatePhysiqueV6({ shoulder_cm: 130, waist_cm: 80 });
    expect(b.proportionScore).not.toBe(a.proportionScore);
  });
  it('zero waist throws', () => {
    expect(() => calculatePhysiqueV6({ shoulder_cm: 120, waist_cm: 0 })).toThrow();
  });
  it('insufficient data status', () => {
    const r = calculatePhysiqueV6({ shoulder_cm: 120 });
    expect(r.status).toBe('insufficient_data');
  });
});
