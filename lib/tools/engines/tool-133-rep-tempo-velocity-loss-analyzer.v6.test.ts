import { describe, it, expect } from 'vitest';
import { calculateVelocityV6 } from '@/lib/tools/engines/tool-133-rep-tempo-velocity-loss-analyzer.v6';

describe('velocity', () => {
  it('multiple sets', () => {
    const r = calculateVelocityV6({ sets: [
      { set_number:1, reps:5, weight_kg:100, avg_velocity_m_s:0.8 },
      { set_number:2, reps:5, weight_kg:100, avg_velocity_m_s:0.64 },
    ]});
    expect(r.velocityLossPercent).toBeCloseTo(20);
    expect(r.fatigueIndicator).toBe('moderate');
  });
  it('NaN velocity throws', () => {
    expect(() => calculateVelocityV6({ sets: [{ set_number:1, reps:5, weight_kg:100, avg_velocity_m_s: NaN }] })).toThrow();
  });
  it('division by zero throws', () => {
    expect(() => calculateVelocityV6({ sets: [
      { set_number:1, reps:5, weight_kg:100, avg_velocity_m_s:0 },
      { set_number:2, reps:5, weight_kg:100, avg_velocity_m_s:0.6 },
    ]})).toThrow();
  });
  it('sensitivity', () => {
    const a = calculateVelocityV6({ sets: [
      { set_number:1, reps:5, weight_kg:100, avg_velocity_m_s:0.8 },
      { set_number:2, reps:5, weight_kg:100, avg_velocity_m_s:0.75 },
    ]});
    const b = calculateVelocityV6({ sets: [
      { set_number:1, reps:5, weight_kg:100, avg_velocity_m_s:0.8 },
      { set_number:2, reps:5, weight_kg:100, avg_velocity_m_s:0.5 },
    ]});
    expect(b.velocityLossPercent).toBeGreaterThan(a.velocityLossPercent);
  });
});
