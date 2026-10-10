import { describe, it, expect } from 'vitest';
import { planCycleBreak } from './tool-045-cycle-break-planner';

describe('tool-045 cycle break planner engine', () => {
  it('12-week Test E cycle: 23-day clear, PCT opens week 5 for 6 weeks', () => {
    const r = planCycleBreak({
      cycle_weeks_used: 12,
      compounds: [{ name_en: 'Testosterone Enanthate', half_life_days: 4.5, suppression_factor: 2 }],
      wants_bloodwork: true,
    });
    expect(r.days_to_full_clear).toBe(23); // ceil(4.5 × 5)
    expect(r.pct_start_day).toBe(30);
    expect(r.pct_duration_weeks).toBe(6);
    expect(r.recovery_milestones[1].week).toBe(5); // PCT opens ceil(30/7) = week 5
    expect(r.recovery_milestones.length).toBe(4);
    expect(r.total_weeks_to_baseline).toBe(15); // 5 + 6 + 4
  });

  it('heavily suppressive stacks add the longer-recovery warning', () => {
    const r = planCycleBreak({
      cycle_weeks_used: 16,
      compounds: [
        { name_en: 'NPP', half_life_days: 3, suppression_factor: 3 },
        { name_en: 'Test P', half_life_days: 1, suppression_factor: 2 },
      ],
      wants_bloodwork: false,
    });
    expect(r.days_to_full_clear).toBe(15);
    expect(r.pct_duration_weeks).toBe(8);
    expect(r.warnings).toContain('heavily_suppressive_stack_longer_recovery');
    expect(r.warnings).toContain('baseline_bloodwork_before_pct_recommended');
  });
});
