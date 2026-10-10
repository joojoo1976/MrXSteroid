/**
 * Tools #031–#035 — adapter envelope verification.
 * Proves each adapter wraps its engine in the canonical ToolOutput envelope
 * (identity from registry, provenance, severity-ranked findings, seo links).
 */
import { describe, it, expect } from 'vitest';
import { buildCycleLengthOutput } from './tool-031-cycle-length-optimizer';
import { buildPctPlannerOutput } from './tool-032-advanced-pct-planner';
import { buildTrendAnalyzerOutput } from './tool-033-bloodwork-trend-analyzer';
import { buildClearanceOutput } from './tool-034-compound-clearance';
import { buildConversionOutput } from './tool-035-hormone-conversion';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 031-035 adapters — canonical envelope', () => {
  it('031 wraps cycle-length output with registry identity', () => {
    const out = buildCycleLengthOutput(
      {
        goal: 'bulk',
        experience: 'intermediate',
        previous_cycles: 2,
        compounds: [{ name_en: 'Test E', suppression_factor: 1, half_life_days: 4.5, weekly_dose_mg: 500 }],
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.031-cycle-length-optimizer');
    expect(out.toolSlug).toBe('tool-031-cycle-length-optimizer');
    expect(out.result.optimal_weeks).toBe(12);
    expect(out.keyFindings.length).toBeGreaterThan(0);
    expect(out.seoLinks.prevTool.slug.length).toBeGreaterThan(0);
    expect(out.provenance.unit).toBe('weeks');
  });

  it('032 wraps PCT plan output with registry identity', () => {
    const out = buildPctPlannerOutput(
      {
        compounds: [
          {
            name_en: 'Test E',
            ester_half_life_days: 4.5,
            weekly_dose_mg: 500,
            last_dose_date: '2026-01-01',
            suppression_factor: 1,
          },
        ],
        hcg_used_on_cycle: false,
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.032-advanced-pct-planner');
    expect(out.result.washout_days).toBe(20);
    expect(out.keyFindings.some((f) => f.code === 'PCT_START_DATE')).toBe(true);
  });

  it('033 wraps trend analysis output with registry identity', () => {
    const out = buildTrendAnalyzerOutput(
      {
        readings: [
          { marker: 'Total T', value: 400, unit: 'ng/dL', date: '2026-01-01' },
          { marker: 'Total T', value: 600, unit: 'ng/dL', date: '2026-03-01' },
        ],
        ranges: { 'Total T': { low: 300, high: 1000, unit: 'ng/dL' } },
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.033-bloodwork-trend-analyzer');
    expect(out.result.markers[0].direction).toBe('rising');
  });

  it('034 wraps clearance output with registry identity', () => {
    const out = buildClearanceOutput(
      {
        compound_name: 'Test E',
        half_life_days: 4.5,
        last_dose_mg: 250,
        last_dose_date: '2026-01-01',
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.034-compound-clearance');
    expect(out.result.days_to_clear).toBe(30);
    expect(out.keyFindings.some((f) => f.code === 'CLEARANCE_DATE')).toBe(true);
  });

  it('035 wraps conversion output with registry identity', () => {
    const out = buildConversionOutput(
      { weekly_test_mg: 500, body_fat_pct: 15, age: 30 },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.035-hormone-conversion');
    expect(out.result.e2_status).toBe('optimal');
  });
});
