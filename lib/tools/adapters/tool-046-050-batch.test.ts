/**
 * Tools #046–#050 — adapter envelope verification (canonical pattern).
 */
import { describe, it, expect } from 'vitest';
import { buildTrtLifetimeOutput } from './tool-046-trt-lifetime';
import { buildFertilityOutput } from './tool-047-fertility-preservation';
import { buildCardioRiskOutput } from './tool-048-cardiovascular-risk';
import { buildBoneDensityOutput } from './tool-049-bone-density';
import { buildMentalHealthOutput } from './tool-050-mental-health';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 046-050 adapters — canonical envelope', () => {
  it('046 wraps TRT lifetime projection with registry identity', () => {
    const out = buildTrtLifetimeOutput(
      { age: 42, method: 'injection', weekly_testosterone_mg: 150, years_on_trt: 3.5, monthly_med_cost_usd: 40, monitoring_annual_cost_usd: 300 },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.046-trt-lifetime');
    expect(out.toolSlug).toBe('tool-046-trt-lifetime');
    expect(out.result.cost_projection.horizon10.total_cost_usd).toBe(7800);
    expect(out.keyFindings.some((f) => f.code === 'COST_10Y')).toBe(true);
    expect(out.seoLinks.prevTool.slug.length).toBeGreaterThan(0);
    expect(out.provenance.unit).toBe('USD');
  });

  it('047 wraps fertility preservation with registry identity', () => {
    const out = buildFertilityOutput(
      { age: 30, suppression_level: 2, uses_hcg: true, planning_horizon_months: 6 },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.047-fertility-preservation');
    expect(out.result.fertility_impact_pct).toBe(50);
    expect(out.result.recovery_projection_months).toBe(5);
    expect(out.keyFindings.some((f) => f.code === 'FERTILITY_IMPACT')).toBe(true);
    expect(out.provenance.unit).toBe('%');
  });

  it('048 wraps cardiovascular risk with registry identity', () => {
    const out = buildCardioRiskOutput(
      { age: 50, sex: 'male', smoker: true, systolic_bp: 140, total_cholesterol: 220, hdl: 35, on_cycle: true },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.048-cardiovascular-risk');
    expect(out.result.risk_pct_10yr).toBe(23);
    expect(out.result.band).toBe('high');
    expect(out.keyFindings.some((f) => f.code === 'RISK_10YR')).toBe(true);
    expect(out.provenance.unit).toBe('%');
  });

  it('049 wraps bone density with registry identity', () => {
    const out = buildBoneDensityOutput(
      { age: 30, sex: 'male', uses_ai_years: 2, weekly_resistance_sessions: 4, calcium_mg_daily: 1200, vitamin_d_iu_daily: 2000, smoker: false },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.049-bone-density');
    expect(out.result.bone_health_score).toBe(84);
    expect(out.result.band).toBe('optimal');
    expect(out.keyFindings.some((f) => f.code === 'BONE_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('050 wraps mental health monitor with registry identity', () => {
    const out = buildMentalHealthOutput(
      {
        mood_scores: [
          { score: 4, date: '2026-01-01' },
          { score: 4, date: '2026-01-02' },
          { score: 4, date: '2026-01-03' },
          { score: 4, date: '2026-01-04' },
          { score: 6, date: '2026-01-05' },
          { score: 6, date: '2026-01-06' },
          { score: 6, date: '2026-01-07' },
          { score: 6, date: '2026-01-08' },
        ],
        sleep_hours_avg: 5, irritability_episodes: 1, aggression_episodes: 0,
        uses_19_nor: false, red_flags: [],
      },
      OPTS,
    );
    expect(out.toolId).toBe('mrx.tool.050-mental-health');
    expect(out.result.trend).toBe('improving');
    expect(out.result.band).toBe('watch');
    expect(out.keyFindings.some((f) => f.code === 'AVG_MOOD')).toBe(true);
    expect(out.provenance.unit).toBe('mood/10');
  });
});
