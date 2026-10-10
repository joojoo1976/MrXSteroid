import { describe, it, expect } from 'vitest';
import { scoreReceptorResponsiveness } from './tool-059-androgen-receptor-optimizer';

describe('tool-059 androgen receptor engine', () => {
  it('scores a well-rested, broken-in context as responsive', () => {
    const r = scoreReceptorResponsiveness({ training_days_per_week: 4, sleep_hours: 8, weeks_since_last_break: 10, current_cycle_week: 0 });
    expect(r.score).toBe(90); // 60 +10 sleep +8 training +12 break
    expect(r.band).toBe('responsive-context');
    expect(r.recommendations).toEqual([]);
    expect(r.warnings).toContain('educational_guidance_not_lab');
  });

  it('scores an overtrained, long-running context as downregulated', () => {
    const r = scoreReceptorResponsiveness({ training_days_per_week: 7, sleep_hours: 5, weeks_since_last_break: 0, current_cycle_week: 14 });
    expect(r.score).toBe(42); // 60 −8 overtraining −10 long-cycle
    expect(r.band).toBe('downregulated-context');
    expect(r.recommendations).toEqual(['sleep_7_5h', 'training_4_5_days', 'cycle_break_8_weeks', 'time_off_recommended']);
  });

  it('caps at 100 and treats short breaks as partial credit', () => {
    const r = scoreReceptorResponsiveness({ training_days_per_week: 5, sleep_hours: 8, weeks_since_last_break: 5, current_cycle_week: 2 });
    expect(r.score).toBe(84); // 60 +10 +8 +6
    expect(r.band).toBe('responsive-context');
    expect(r.recommendations).toEqual(['cycle_break_8_weeks']);
  });
});
