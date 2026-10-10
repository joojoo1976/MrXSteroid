/**
 * Tools #036–#040 — adapter envelope verification.
 * Proves each adapter wraps its engine in the canonical ToolOutput envelope
 * (identity from registry, provenance, severity-ranked findings, seo links).
 */
import { describe, it, expect } from 'vitest';
import { buildInjectionScheduleOutput } from './tool-036-injection-schedule';
import { buildSideEffectProbabilityOutput } from './tool-037-side-effect-probability';
import { buildStackCompatibilityOutput } from './tool-038-stack-compatibility';
import { buildLiverTrackerOutput } from './tool-039-liver-enzyme-tracker';
import { buildLipidOptimizerOutput } from './tool-040-lipid-profile-optimizer';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 036-040 adapters — canonical envelope', () => {
  it('036 wraps injection schedule output with registry identity', () => {
    const out = buildInjectionScheduleOutput(
      {
        compounds: [
          { name_en: 'Test E', weekly_dose_mg: 500, concentration_mg_ml: 250, injections_per_week: 2, max_ml_per_site: 3 },
        ],
        rotation_sites: ['L glute', 'R glute', 'L delt'],
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.036-injection-schedule');
    expect(out.toolSlug).toBe('tool-036-injection-schedule');
    expect(out.result.total_volume_ml_per_week).toBeCloseTo(2.0, 5);
    expect(out.result.shots.length).toBe(2);
    expect(out.keyFindings.some((f) => f.code === 'TOTAL_VOLUME')).toBe(true);
    expect(out.keyFindings.length).toBeGreaterThan(0);
    expect(out.seoLinks.prevTool.slug.length).toBeGreaterThan(0);
    expect(out.provenance.unit).toBe('mL / week');
  });

  it('037 wraps side-effect risk output with registry identity', () => {
    const out = buildSideEffectProbabilityOutput(
      {
        compounds: [
          { name_en: 'Tren Acetate', family: 'trenbolone', weekly_dose_mg: 300, reference_dose_mg: 300 },
        ],
        age: 30,
        body_fat_pct: 15,
        cycle_weeks: 10,
        uses_ai: true,
        uses_liver_support: false,
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.037-side-effect-probability');
    expect(out.result.risks.length).toBeGreaterThan(0);
    expect(out.result.overall_burden_pct).toBeGreaterThanOrEqual(0);
    expect(out.result.overall_burden_pct).toBeLessThanOrEqual(100);
    expect(out.keyFindings.some((f) => f.code === 'OVERALL_BURDEN')).toBe(true);
  });

  it('038 wraps stack compatibility output with registry identity', () => {
    const out = buildStackCompatibilityOutput(
      {
        items: [
          { name_en: 'Test E', family: 'testosterone', weekly_dose_mg: 500, hepatotoxic: false },
          { name_en: 'Anadrol', family: 'oral', weekly_dose_mg: 50, hepatotoxic: true },
        ],
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.038-stack-compatibility');
    expect(out.result.score_0_100).toBeGreaterThanOrEqual(0);
    expect(out.result.score_0_100).toBeLessThanOrEqual(100);
    expect(['compatible', 'caution', 'incompatible']).toContain(out.result.verdict);
    expect(out.keyFindings.some((f) => f.code === 'COMPATIBILITY_SCORE')).toBe(true);
  });

  it('039 wraps liver tracker output with registry identity', () => {
    const out = buildLiverTrackerOutput(
      {
        readings: [
          { marker: 'ALT', value: 60, unit: 'U/L', date: '2026-01-01' },
          { marker: 'ALT', value: 75, unit: 'U/L', date: '2026-03-01' },
        ],
        oral_steroids: true,
        alcohol_drinks_per_week: 2,
        uses_tudca: true,
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.039-liver-enzyme-tracker');
    expect(out.result.markers.length).toBeGreaterThan(0);
    expect(['normal', 'elevated', 'high', 'critical']).toContain(out.result.overall_status);
    expect(out.keyFindings.length).toBeGreaterThan(0);
  });

  it('040 wraps lipid optimizer output with registry identity', () => {
    const out = buildLipidOptimizerOutput(
      {
        panel: { ldl_mg_dl: 130, hdl_mg_dl: 38, triglycerides_mg_dl: 180 },
        age: 32,
        smoker: false,
        systolic_bp: 125,
        on_cycle: true,
        weeks_remaining: 8,
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.040-lipid-profile-optimizer');
    expect(out.result.non_hdl).toBeGreaterThan(0);
    expect(['optimal', 'borderline', 'high', 'very-high']).toContain(out.result.overall_band);
    expect(out.result.interventions.length).toBeGreaterThan(0);
    expect(out.provenance.unit).toBe('mg/dL');
  });
});
