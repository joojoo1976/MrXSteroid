import { describe, it, expect } from 'vitest';
import { manageSleepQuality } from './tool-085-sleep-quality-manager';

describe('Tool #085 — Sleep Quality Manager Engine', () => {
  it('correctly calculates optimal restorative sleep metrics', () => {
    const res = manageSleepQuality({
      sleep_duration_hours: 8,
      sleep_latency_minutes: 15,
      night_awakenings_count: 0,
      caffeine_within_6h_of_bedtime: false,
      dark_cool_room_optimized: true,
      morning_rested_feeling_score: 9,
    });

    expect(res.sleep_tier).toBe('optimal-restorative');
    expect(res.sleep_quality_index).toBeGreaterThanOrEqual(80);
    expect(res.estimated_sleep_efficiency_pct).toBeGreaterThan(90);
  });

  it('detects fragmented poor sleep with awakenings and late caffeine', () => {
    const res = manageSleepQuality({
      sleep_duration_hours: 5,
      sleep_latency_minutes: 50,
      night_awakenings_count: 4,
      caffeine_within_6h_of_bedtime: true,
      dark_cool_room_optimized: false,
      morning_rested_feeling_score: 3,
    });

    expect(res.sleep_tier).toBe('poor-fragmented');
    expect(res.sleep_quality_index).toBeLessThanOrEqual(40);
    expect(res.warnings).toContain('frequent_nocturnal_awakenings_fragment_sleep_architecture');
    expect(res.warnings).toContain('late_caffeine_reduces_slow_wave_sleep_depth_even_if_falling_asleep_easily');
  });
});
