import { describe, it, expect } from 'vitest';
import {
  assessProstateHealth,
  EMERGENCY_MESSAGE,
  type ProstateInput,
} from './tool-062-prostate-health';

const mild: ProstateInput = {
  incomplete_emptying: 0,
  frequency: 1,
  intermittency: 0,
  urgency: 0,
  weak_stream: 0,
  straining: 0,
  nocturia: 1,
  quality_of_life: 1,
  acute_retention: false,
  hematuria: false,
  fever_pelvic_pain: false,
};

describe('tool-062 Prostate Health Manager', () => {
  it('sums the IPSS-style items and classifies mild symptoms', () => {
    const r = assessProstateHealth(mild);
    expect(r.ipss_total).toBe(2);
    expect(r.severity).toBe('mild');
    expect(r.emergency).toBe(false);
    expect(r.emergency_message).toBeNull();
  });

  it('classifies moderate and severe totals', () => {
    const moderate = assessProstateHealth({ ...mild, frequency: 5, urgency: 5, nocturia: 5 });
    expect(moderate.ipss_total).toBe(15);
    expect(moderate.severity).toBe('moderate');
    const severe = assessProstateHealth({
      ...mild,
      frequency: 5, urgency: 5, nocturia: 5, weak_stream: 5, straining: 5, intermittency: 5, incomplete_emptying: 5,
    });
    expect(severe.ipss_total).toBe(35);
    expect(severe.severity).toBe('severe');
    expect(severe.safety_flags).toContain('severe_symptoms');
  });

  it('escalates red flags to emergency care', () => {
    const r = assessProstateHealth({ ...mild, acute_retention: true });
    expect(r.emergency).toBe(true);
    expect(r.emergency_message).toBe(EMERGENCY_MESSAGE);
    expect(r.safety_flags).toContain('prostate_red_flag');
  });

  it('escalates haematuria and fever with pelvic pain', () => {
    expect(assessProstateHealth({ ...mild, hematuria: true }).emergency).toBe(true);
    expect(assessProstateHealth({ ...mild, fever_pelvic_pain: true }).emergency).toBe(true);
  });

  it('clamps out-of-range items and never recommends a drug dose', () => {
    const r = assessProstateHealth({ ...mild, frequency: 99 });
    expect(r.ipss_total).toBeLessThanOrEqual(35);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(mg|mcg)\b/i);
  });
});
