/**
 * Tools #086–#090 — adapter envelope verification.
 */
import { describe, it, expect } from 'vitest';
import { buildCortisolStressOutput } from './tool-086-cortisol-stress-calculator';
import { buildMoodOptimizerOutput } from './tool-087-mood-optimizer';
import { buildDopamineTrackerOutput } from './tool-088-dopamine-tracker';
import { buildSerotoninManagerOutput } from './tool-089-serotonin-manager';
import { buildFemaleHormoneBalanceOutput } from './tool-090-female-hormone-balance-calculator';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 086-090 adapters — canonical envelope', () => {
  it('086 wraps cortisol stress calculator with registry identity', () => {
    const out = buildCortisolStressOutput({
      morning_exhaustion_rating: 3,
      evening_tired_but_wired: false,
      daily_caffeine_cups: 1,
      resting_heart_rate_variability_trend: 'normal_high',
      intense_training_sessions_weekly: 3,
      life_stressors_level: 'low',
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.086-cortisol-stress-calculator');
    expect(out.result.hpa_axis_status_tier).toBe('adaptive-balanced');
    expect(out.keyFindings.some((f) => f.code === 'STRESS_LOAD')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('087 wraps mood optimizer with registry identity', () => {
    const out = buildMoodOptimizerOutput({
      sunlight_outdoor_minutes_daily: 60,
      social_connection_satisfaction: 'strong',
      physical_activity_days_weekly: 5,
      omega3_and_micronutrient_sufficiency: true,
      chronic_work_overload_burnout: false,
      subjective_anhedonia_present: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.087-mood-optimizer');
    expect(out.result.affective_balance_tier).toBe('robust-flourishing');
    expect(out.keyFindings.some((f) => f.code === 'RESILIENCE_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('088 wraps dopamine tracker with registry identity', () => {
    const out = buildDopamineTrackerOutput({
      daily_short_form_screen_time_hours: 0.5,
      tyrosine_rich_protein_intake: 'optimal',
      habitual_cold_exposure_or_hard_effort: true,
      frequent_compulsive_dopamine_seeking: false,
      sleep_consistency_score: 9,
      stimulant_usage_frequency: 'moderate_caffeine',
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.088-dopamine-tracker');
    expect(out.result.dopaminergic_tone_tier).toBe('resilient-balanced');
    expect(out.keyFindings.some((f) => f.code === 'DOPAMINE_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('089 wraps serotonin manager with registry identity', () => {
    const out = buildSerotoninManagerOutput({
      tryptophan_rich_food_intake: 'optimal',
      gut_health_status: 'healthy_regular',
      daily_sunlight_lux_exposure_mins: 45,
      nighttime_melatonin_transition_calm: true,
      chronic_irritability_or_carb_craving: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.089-serotonin-manager');
    expect(out.result.serotonin_balance_tier).toBe('optimal-harmonized');
    expect(out.keyFindings.some((f) => f.code === 'SEROTONIN_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('090 wraps female hormone balance calculator with registry identity', () => {
    const out = buildFemaleHormoneBalanceOutput({
      cycle_length_days: 28,
      pms_symptom_severity: 'none_mild',
      androgenic_signs_present: false,
      cycle_regularity: 'strictly_regular',
      high_stress_or_rapid_weight_loss: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.090-female-hormone-balance-calculator');
    expect(out.result.estrogen_progesterone_balance_tier).toBe('harmonious-baseline');
    expect(out.keyFindings.some((f) => f.code === 'HARMONY_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });
});
