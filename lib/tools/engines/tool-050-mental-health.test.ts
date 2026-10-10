import { describe, it, expect } from 'vitest';
import { assessMentalHealth } from './tool-050-mental-health';

describe('tool-050 mental health engine', () => {
  it('detects an improving trend in watch band with sleep debt', () => {
    const r = assessMentalHealth({
      mood_scores: [
        { score: 4, date: '2026-01-01' },
        { score: 4, date: '2026-01-02' },
        { score: 4, date: '2026-01-03' },
        { score: 4, date: '2026-01-04' },
        { score: 6, date: '2026-01-05' },
        { score: 6, date: '2026-01-06' },
        { score: 6, date: '2026-01-07' },
        { score: 6, date: '2026-01-08' },
      ],
      sleep_hours_avg: 5,
      irritability_episodes: 1,
      aggression_episodes: 0,
      uses_19_nor: false,
      red_flags: [],
    });
    expect(r.avg_mood).toBe(5);
    expect(r.trend).toBe('improving');
    expect(r.band).toBe('watch');
    expect(r.escalation).toBe(false);
    expect(r.sleep_flag).toBe(true);
    expect(r.irritability_flag).toBe(false);
    expect(r.warnings).toContain('sleep_debt_pattern');
  });

  it('any red flag triggers immediate escalation language', () => {
    const r = assessMentalHealth({
      mood_scores: [
        { score: 3, date: '2026-01-01' },
        { score: 3, date: '2026-01-02' },
        { score: 3, date: '2026-01-03' },
      ],
      sleep_hours_avg: 7,
      irritability_episodes: 0,
      aggression_episodes: 0,
      uses_19_nor: false,
      red_flags: ['self_harm_thoughts'],
    });
    expect(r.escalation).toBe(true);
    expect(r.band).toBe('concern');
    expect(r.warnings).toContain('red_flag_seek_immediate_help');
    expect(r.warnings).toContain('crisis_line_988_us_or_local_emergency');
  });

  it('declining mood on 19-nor flags the compound pattern', () => {
    const r = assessMentalHealth({
      mood_scores: [
        { score: 8, date: '2026-01-01' },
        { score: 8, date: '2026-01-02' },
        { score: 8, date: '2026-01-03' },
        { score: 5, date: '2026-01-04' },
        { score: 5, date: '2026-01-05' },
        { score: 5, date: '2026-01-06' },
      ],
      sleep_hours_avg: 8,
      irritability_episodes: 4,
      aggression_episodes: 2,
      uses_19_nor: true,
      red_flags: [],
    });
    expect(r.trend).toBe('declining');
    expect(r.band).toBe('watch'); // avg (8*3+5*3)/6 = 6.5
    expect(r.avg_mood).toBe(6.5);
    expect(r.irritability_flag).toBe(true);
    expect(r.warnings).toContain('19nor_mood_flag');
    expect(r.warnings).toContain('aggression_episodes_reported');
  });
});
