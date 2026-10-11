/**
 * Tools #061–#065 — adapter envelope verification (canonical pattern).
 */
import { describe, it, expect } from 'vitest';
import { buildHairLossOutput } from './tool-061-hair-loss-tracker';
import { buildProstateHealthOutput } from './tool-062-prostate-health-manager';
import { buildSuppressionOutput } from './tool-063-testicular-suppression-calculator';
import { buildSpermProductionOutput } from './tool-064-sperm-production-optimizer';
import { buildAromatizationOutput } from './tool-065-aromatase-conversion-calculator';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 061-065 adapters — canonical envelope', () => {
  it('061 wraps hair-loss tracking with registry identity', () => {
    const out = buildHairLossOutput({ norwood_stage: 2, weekly_shed_counts: [30, 40, 50], on_5ari: false, weeks_since_start: 8 }, OPTS);
    expect(out.toolId).toBe('mrx.tool.061-hair-loss-tracker');
    expect(out.toolSlug).toBe('tool-061-hair-loss-tracker');
    expect(out.result.avg_weekly_shed).toBe(40);
    expect(out.keyFindings.some((f) => f.code === 'AVG_SHED')).toBe(true);
    expect(out.provenance.unit).toBe('hairs/week');
  });

  it('062 wraps prostate health with registry identity', () => {
    const out = buildProstateHealthOutput({ age: 55, psa_ng_ml: 6, psa_prev_1y_ng_ml: 5 }, OPTS);
    expect(out.toolId).toBe('mrx.tool.062-prostate-health-manager');
    expect(out.result.psa_ceiling).toBe(3.5);
    expect(out.keyFindings.some((f) => f.code === 'PSA_BAND')).toBe(true);
    expect(out.provenance.unit).toBe('ng/mL');
  });

  it('063 wraps suppression projection with registry identity', () => {
    const out = buildSuppressionOutput({ weeks_on_cycle: 12, suppression_tier: 'moderate', age: 28 }, OPTS);
    expect(out.toolId).toBe('mrx.tool.063-testicular-suppression-calculator');
    expect(out.result.suppression_depth_pct).toBe(75);
    expect(out.keyFindings.some((f) => f.code === 'SUPPRESSION_DEPTH')).toBe(true);
    expect(out.provenance.unit).toBe('%');
  });

  it('064 wraps sperm production with registry identity', () => {
    const out = buildSpermProductionOutput(
      { months_since_last_cycle: 9, age: 32, hcg_used: true, weekly_training_hours: 4, sleep_hours: 8 },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.064-sperm-production-optimizer');
    expect(out.result.recovery_score).toBe(85);
    expect(out.keyFindings.some((f) => f.code === 'RECOVERY_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('065 wraps aromatization with registry identity', () => {
    const out = buildAromatizationOutput({ testosterone_mg_week: 200, body_fat_pct: 15, aromatase_inhibitor: 'none' }, OPTS);
    expect(out.toolId).toBe('mrx.tool.065-aromatase-conversion-calculator');
    expect(out.result.e2_estimate_pg_ml).toBe(45);
    expect(out.keyFindings.some((f) => f.code === 'E2_ESTIMATE')).toBe(true);
    expect(out.provenance.unit).toBe('pg/mL');
  });
});
