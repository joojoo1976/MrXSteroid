/**
 * Tools #066–#070 — adapter envelope verification (canonical pattern).
 */
import { describe, it, expect } from 'vitest';
import { buildEstrogenSensitivityOutput } from './tool-066-estrogen-sensitivity-manager';
import { buildEstrogenBalanceOutput } from './tool-067-estrogen-balance-calculator';
import { buildGynecomastiaOutput } from './tool-068-gynecomastia-tracker';
import { buildDetoxificationOutput } from './tool-069-detoxification-optimizer';
import { buildOxidativeStressOutput } from './tool-070-oxidative-stress-calculator';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 066-070 adapters — canonical envelope', () => {
  it('066 wraps estrogen sensitivity with registry identity', () => {
    const out = buildEstrogenSensitivityOutput({
      e2_level_pg_ml: 28,
      water_retention_score: 0,
      nipple_sensitivity: false,
      mood_lability_score: 0,
      libido_impact: 'none',
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.066-estrogen-sensitivity-manager');
    expect(out.toolSlug).toBe('tool-066-estrogen-sensitivity-manager');
    expect(out.result.total_symptom_score).toBe(0);
    expect(out.keyFindings.some((f) => f.code === 'SENSITIVITY_PATTERN')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('067 wraps estrogen balance with registry identity', () => {
    const out = buildEstrogenBalanceOutput({
      total_testosterone_ng_dl: 600,
      estradiol_pg_ml: 30,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.067-estrogen-balance-calculator');
    expect(out.result.t_to_e2_ratio).toBe(20);
    expect(out.keyFindings.some((f) => f.code === 'TE2_RATIO')).toBe(true);
    expect(out.provenance.unit).toBe('ratio');
  });

  it('068 wraps gynecomastia tracking with registry identity', () => {
    const out = buildGynecomastiaOutput({
      has_tenderness_or_itching: true,
      has_palpable_lump: true,
      lump_size_cm: 1.0,
      duration_weeks: 4,
      prolactin_involved: true,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.068-gynecomastia-tracker');
    expect(out.result.progression_stage).toBe('early-budding');
    expect(out.keyFindings.some((f) => f.code === 'PROGRESSION_STAGE')).toBe(true);
    expect(out.provenance.unit).toBe('stage');
  });

  it('069 wraps detoxification support with registry identity', () => {
    const out = buildDetoxificationOutput({
      daily_water_liters: 3.5,
      daily_fiber_grams: 35,
      cruciferous_servings_week: 6,
      alcohol_drinks_week: 0,
      takes_nac_or_glutathione_support: true,
      oral_compounds_present: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.069-detoxification-optimizer');
    expect(out.result.hepatic_support_score).toBe(90);
    expect(out.keyFindings.some((f) => f.code === 'HEPATIC_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('070 wraps oxidative stress with registry identity', () => {
    const out = buildOxidativeStressOutput({
      sleep_hours_per_night: 8,
      hard_training_hours_week: 5,
      smoker_or_vaper: false,
      high_sugar_ultraprocessed_diet: false,
      androgen_dose_weekly_mg: 0,
      antioxidant_support_adequate: true,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.070-oxidative-stress-calculator');
    expect(out.result.oxidative_burden_score).toBe(0);
    expect(out.keyFindings.some((f) => f.code === 'BURDEN_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });
});
