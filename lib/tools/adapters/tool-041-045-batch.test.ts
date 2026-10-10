/**
 * Tools #041–#045 — adapter envelope verification (canonical pattern).
 */
import { describe, it, expect } from 'vitest';
import { buildHematocritOutput } from './tool-041-hematocrit-monitor';
import { buildEstrogenOutput } from './tool-042-estrogen-management';
import { buildProlactinOutput } from './tool-043-prolactin-management';
import { buildDhtOutput } from './tool-044-dht-side-effects';
import { buildCycleBreakOutput } from './tool-045-cycle-break-planner';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 041-045 adapters — canonical envelope', () => {
  it('041 wraps hematocrit trend with registry identity', () => {
    const out = buildHematocritOutput(
      {
        readings: [
          { hct_pct: 46, date: '2026-01-01' },
          { hct_pct: 49, date: '2026-02-01' },
          { hct_pct: 52, date: '2026-03-01' },
        ],
        sex: 'male', on_cycle: true, weeks_remaining: 8,
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.041-hematocrit-monitor');
    expect(out.toolSlug).toBe('tool-041-hematocrit-monitor');
    expect(out.result.latest_hct_pct).toBe(52);
    expect(out.keyFindings.some((f) => f.code === 'LATEST_HCT')).toBe(true);
    expect(out.seoLinks.prevTool.slug.length).toBeGreaterThan(0);
    expect(out.provenance.unit).toBe('%');
  });

  it('042 wraps estrogen management with registry identity', () => {
    const out = buildEstrogenOutput(
      { e2_pg_ml: 65, weekly_testosterone_mg: 500, taking_ai: true, weekly_ai_dose_mg: 1, symptoms: [], body_fat_pct: 18 },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.042-estrogen-management');
    expect(out.result.band).toBe('high');
    expect(out.result.ai_delta_mg).toBe(0.5);
    expect(out.keyFindings.some((f) => f.code === 'AI_DELTA_HINT')).toBe(true);
    expect(out.provenance.unit).toBe('pg/mL');
  });

  it('043 wraps prolactin management with registry identity', () => {
    const out = buildProlactinOutput(
      { prolactin_ng_ml: 30, uses_19_nor: true, weekly_cabergoline_mcg: 0, symptoms: ['libido_loss'] },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.043-prolactin-management');
    expect(out.result.band).toBe('high');
    expect(out.result.suggested_weekly_mcg).toBe(250);
    expect(out.keyFindings.some((f) => f.code === 'CABERGOLINE_HINT')).toBe(true);
    expect(out.provenance.unit).toBe('ng/mL');
  });

  it('044 wraps DHT predictor with registry identity', () => {
    const out = buildDhtOutput(
      { dht_ng_dl: 90, uses_dht_derivative: true, five_ari: 'none', family_history_hairloss: true, age: 30 },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.044-dht-side-effects');
    expect(out.result.hair_loss_risk_pct).toBe(80);
    expect(out.keyFindings.some((f) => f.code === 'DHT_BURDEN')).toBe(true);
    expect(out.provenance.unit).toBe('ng/dL');
  });

  it('045 wraps cycle break planner with registry identity', () => {
    const out = buildCycleBreakOutput(
      {
        cycle_weeks_used: 12,
        compounds: [{ name_en: 'Testosterone Enanthate', half_life_days: 4.5, suppression_factor: 2 }],
        wants_bloodwork: true,
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.045-cycle-break-planner');
    expect(out.result.days_to_full_clear).toBe(23);
    expect(out.result.pct_duration_weeks).toBe(6);
    expect(out.keyFindings.some((f) => f.code === 'PCT_WINDOW')).toBe(true);
    expect(out.provenance.unit).toBe('days');
  });
});
