/**
 * Tools #081–#085 — adapter envelope verification.
 */
import { describe, it, expect } from 'vitest';
import { buildCellularAgingOutput } from './tool-081-cellular-aging-calculator';
import { buildTelomereOutput } from './tool-082-telomere-manager';
import { buildAntiAgingInflammationOutput } from './tool-083-anti-aging-inflammation-calculator';
import { buildCognitiveEnhancerOutput } from './tool-084-cognitive-enhancer';
import { buildSleepQualityOutput } from './tool-085-sleep-quality-manager';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 081-085 adapters — canonical envelope', () => {
  it('081 wraps cellular aging calculator with registry identity', () => {
    const out = buildCellularAgingOutput({
      chronological_age: 35,
      smoking_history: 'never',
      weekly_sun_protection_frequency: 'always',
      average_sleep_hours: 8,
      ultra_processed_food_frequency: 'rare',
      regular_strength_training: true,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.081-cellular-aging-calculator');
    expect(out.result.cellular_stress_tier).toBe('resilient');
    expect(out.keyFindings.some((f) => f.code === 'AGE_DELTA')).toBe(true);
    expect(out.provenance.unit).toBe('years');
  });

  it('082 wraps telomere manager with registry identity', () => {
    const out = buildTelomereOutput({
      perceived_chronic_stress_level: 'low',
      aerobic_exercise_hours_weekly: 4,
      mediterranean_diet_adherence: 'high',
      omega3_supplementation_or_fatty_fish: true,
      bmi: 23,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.082-telomere-manager');
    expect(out.result.telomere_status_band).toBe('optimal-telomere-support');
    expect(out.keyFindings.some((f) => f.code === 'TELOMERE_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('083 wraps anti-aging inflammation calculator with registry identity', () => {
    const out = buildAntiAgingInflammationOutput({
      hs_crp_mg_l: 0.5,
      visceral_adiposity_rating: 'low',
      periodontal_disease_present: false,
      daily_joint_stiffness_morning_mins: 0,
      anti_inflammatory_polyphenols_daily: true,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.083-anti-aging-inflammation-calculator');
    expect(out.result.inflammaging_tier).toBe('minimal-baseline');
    expect(out.keyFindings.some((f) => f.code === 'INFLAMMAGING_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('084 wraps cognitive enhancer with registry identity', () => {
    const out = buildCognitiveEnhancerOutput({
      daily_focused_deep_work_hours: 4,
      regular_aerobic_exercise: true,
      caffeine_daily_mg: 150,
      choline_rich_foods_or_alpha_gpc: true,
      frequent_brain_fog_complaints: false,
      sleep_hours: 8,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.084-cognitive-enhancer');
    expect(out.result.cognitive_status_band).toBe('peak-neurotrophic-state');
    expect(out.keyFindings.some((f) => f.code === 'COGNITIVE_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('085 wraps sleep quality manager with registry identity', () => {
    const out = buildSleepQualityOutput({
      sleep_duration_hours: 8,
      sleep_latency_minutes: 15,
      night_awakenings_count: 0,
      caffeine_within_6h_of_bedtime: false,
      dark_cool_room_optimized: true,
      morning_rested_feeling_score: 9,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.085-sleep-quality-manager');
    expect(out.result.sleep_tier).toBe('optimal-restorative');
    expect(out.keyFindings.some((f) => f.code === 'SLEEP_INDEX')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });
});
