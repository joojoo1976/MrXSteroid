import { describe, it, expect } from 'vitest';
import { trackDopamine } from './tool-088-dopamine-tracker';

describe('Tool #088 — Dopamine Tracker Engine', () => {
  it('identifies resilient balanced dopaminergic tone with disciplined habits', () => {
    const res = trackDopamine({
      daily_short_form_screen_time_hours: 0.5,
      tyrosine_rich_protein_intake: 'optimal',
      habitual_cold_exposure_or_hard_effort: true,
      frequent_compulsive_dopamine_seeking: false,
      sleep_consistency_score: 9,
      stimulant_usage_frequency: 'moderate_caffeine',
    });

    expect(res.dopaminergic_tone_tier).toBe('resilient-balanced');
    expect(res.dopamine_baseline_health_score).toBeGreaterThanOrEqual(70);
  });

  it('detects depleted desensitized state with compulsive screen use and heavy stimulants', () => {
    const res = trackDopamine({
      daily_short_form_screen_time_hours: 5,
      tyrosine_rich_protein_intake: 'suboptimal',
      habitual_cold_exposure_or_hard_effort: false,
      frequent_compulsive_dopamine_seeking: true,
      sleep_consistency_score: 3,
      stimulant_usage_frequency: 'high_caffeine_or_preworkout',
    });

    expect(res.dopaminergic_tone_tier).toBe('depleted-desensitized');
    expect(res.dopamine_baseline_health_score).toBeLessThanOrEqual(38);
    expect(res.warnings).toContain('compulsive_reward_seeking_indicates_d2_receptor_downregulation_and_tolerance');
  });
});
