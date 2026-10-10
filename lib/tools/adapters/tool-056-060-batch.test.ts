/**
 * Tools #056–#060 — adapter envelope verification (canonical pattern).
 */
import { describe, it, expect } from 'vitest';
import { buildMiniPctOutput } from './tool-056-mini-pct-calculator';
import { buildFreeTestosteroneOutput } from './tool-057-free-testosterone-manager';
import { buildAndrogenicBalanceOutput } from './tool-058-androgenic-balance-calculator';
import { buildReceptorResponsivenessOutput } from './tool-059-androgen-receptor-optimizer';
import { buildDhtConversionOutput } from './tool-060-5-alpha-conversion-calculator';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 056-060 adapters — canonical envelope', () => {
  it('056 wraps mini PCT with registry identity', () => {
    const out = buildMiniPctOutput({ compound_class: '19nor', cycle_weeks: 12, last_dose_days_ago: 0 }, OPTS);
    expect(out.toolId).toBe('mrx.tool.056-mini-pct-calculator');
    expect(out.toolSlug).toBe('tool-056-mini-pct-calculator');
    expect(out.result.washout_days).toBe(28);
    expect(out.keyFindings.some((f) => f.code === 'START_IN_DAYS')).toBe(true);
    expect(out.provenance.unit).toBe('days');
  });

  it('057 wraps free testosterone with registry identity', () => {
    const out = buildFreeTestosteroneOutput({ total_test_ng_dl: 500, shbg_nmol_l: 30, albumin_g_dl: 4.2 }, OPTS);
    expect(out.toolId).toBe('mrx.tool.057-free-testosterone-manager');
    expect(out.result.free_t_pg_ml).toBe(93.1);
    expect(out.keyFindings.some((f) => f.code === 'FREE_T')).toBe(true);
    expect(out.provenance.unit).toBe('pg/mL');
  });

  it('058 wraps androgenic balance with registry identity', () => {
    const out = buildAndrogenicBalanceOutput({ dht_ng_dl: 60, testosterone_ng_dl: 800, estradiol_pg_ml: 35 }, OPTS);
    expect(out.toolId).toBe('mrx.tool.058-androgenic-balance-calculator');
    expect(out.result.dht_t_ratio_pct).toBe(7.5);
    expect(out.keyFindings.some((f) => f.code === 'DHT_T_RATIO')).toBe(true);
    expect(out.provenance.unit).toBe('ratio');
  });

  it('059 wraps receptor responsiveness with registry identity', () => {
    const out = buildReceptorResponsivenessOutput(
      { training_days_per_week: 4, sleep_hours: 8, weeks_since_last_break: 10, current_cycle_week: 0 },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.059-androgen-receptor-optimizer');
    expect(out.result.score).toBe(90);
    expect(out.keyFindings.some((f) => f.code === 'RECEPTOR_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('060 wraps DHT conversion with registry identity', () => {
    const out = buildDhtConversionOutput({ testosterone_ng_dl: 800, inhibitor: 'none' }, OPTS);
    expect(out.toolId).toBe('mrx.tool.060-5-alpha-conversion-calculator');
    expect(out.result.dht_estimate_ng_dl).toBe(80);
    expect(out.keyFindings.some((f) => f.code === 'DHT_ESTIMATE')).toBe(true);
    expect(out.provenance.unit).toBe('ng/dL');
  });
});
