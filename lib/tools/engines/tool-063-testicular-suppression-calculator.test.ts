import { describe, it, expect } from 'vitest';
import { projectSuppression } from './tool-063-testicular-suppression-calculator';

describe('tool-063 testicular suppression engine', () => {
  it('projects moderate suppression for a 12-week cycle', () => {
    const r = projectSuppression({ weeks_on_cycle: 12, suppression_tier: 'moderate', age: 28 });
    expect(r.suppression_depth_pct).toBe(75); // 70 base + floor(12/8)×5
    expect(r.estimated_recovery_months).toBe(4); // ceil(12/8)=2 +2 tier +0 age
    expect(r.band).toBe('deep-suppression');
    expect(r.warnings).toContain('educational_projection_not_guarantee');
  });

  it('flags severe suppression with extended recovery at older age', () => {
    const r = projectSuppression({ weeks_on_cycle: 16, suppression_tier: 'severe', age: 40 });
    expect(r.suppression_depth_pct).toBe(95); // clamped (90 + 10 > 95)
    expect(r.estimated_recovery_months).toBe(8); // ceil(16/8)=2 +4 tier +2 age
    expect(r.warnings).toContain('deep_suppression_extended_recovery');
  });

  it('keeps mild short cycles at the 2-month recovery floor', () => {
    const r = projectSuppression({ weeks_on_cycle: 8, suppression_tier: 'mild', age: 28 });
    expect(r.suppression_depth_pct).toBe(45); // 40 base + floor(8/8)×5
    expect(r.estimated_recovery_months).toBe(2); // ceil(8/8)=1 → floor 2
    expect(r.warnings).not.toContain('deep_suppression_extended_recovery');
  });
});
