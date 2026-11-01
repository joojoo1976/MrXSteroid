import { describe, it, expect } from 'vitest';
import { calculateDailyReadinessV6 } from '@/lib/tools/engines/tool-127-ai-daily-readiness-explainer.v6';

describe('daily readiness', () => {
  it('high score for good inputs', () => {
    const r = calculateDailyReadinessV6({ sleep_hours: 8, stress_level: 2, soreness_level: 2, previous_load: 10, hydration: 80 });
    expect(r.readinessScore).toBeGreaterThan(70);
    expect(r.band).toBe('high');
  });
  it('low score for poor inputs', () => {
    const r = calculateDailyReadinessV6({ sleep_hours: 4, stress_level: 9, soreness_level: 9, previous_load: 90, hydration: 20 });
    expect(r.readinessScore).toBeLessThan(40);
    expect(r.band).toBe('low');
  });
  it('throws on NaN', () => {
    expect(() => calculateDailyReadinessV6({ sleep_hours: NaN, stress_level: 5, soreness_level: 5 })).toThrow();
  });
});
