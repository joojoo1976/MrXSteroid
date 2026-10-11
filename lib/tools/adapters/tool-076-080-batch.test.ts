/**
 * Tools #076–#080 — adapter envelope verification.
 */
import { describe, it, expect } from 'vitest';
import { buildBloodViscosityOutput } from './tool-076-blood-viscosity-calculator';
import { buildNitricOxideOutput } from './tool-077-nitric-oxide-optimizer';
import { buildEndothelialHealthOutput } from './tool-078-endothelial-health-manager';
import { buildFatMetabolismOutput } from './tool-079-fat-metabolism-calculator';
import { buildMitochondrialOutput } from './tool-080-mitochondrial-optimizer';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 076-080 adapters — canonical envelope', () => {
  it('076 wraps blood viscosity calculator with registry identity', () => {
    const out = buildBloodViscosityOutput({
      hematocrit_pct: 44,
      total_protein_g_dl: 7.0,
      hydration_status: 'adequate',
      androgen_use: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.076-blood-viscosity-calculator');
    expect(out.result.viscosity_band).toBe('normal');
    expect(out.keyFindings.some((f) => f.code === 'VISCOSITY_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('cP');
  });

  it('077 wraps nitric oxide optimizer with registry identity', () => {
    const out = buildNitricOxideOutput({
      dietary_nitrate_frequency: 'daily',
      aerobic_exercise_days_per_week: 4,
      uses_antiseptic_mouthwash: false,
      citrulline_supplementation: true,
      high_sunlight_or_uva_exposure: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.077-nitric-oxide-optimizer');
    expect(out.result.no_optimization_score).toBeGreaterThan(60);
    expect(out.keyFindings.some((f) => f.code === 'NO_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('078 wraps endothelial health manager with registry identity', () => {
    const out = buildEndothelialHealthOutput({
      systolic_bp: 118,
      fasting_glucose_mg_dl: 90,
      high_sensitivity_crp_mg_l: 0.6,
      smoker_or_vaper: false,
      androgen_therapy_active: false,
      daily_aerobic_movement_mins: 45,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.078-endothelial-health-manager');
    expect(out.result.endothelial_status_band).toBe('resilient-intact');
    expect(out.keyFindings.some((f) => f.code === 'ENDOTHELIAL_RISK_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('079 wraps fat metabolism calculator with registry identity', () => {
    const out = buildFatMetabolismOutput({
      body_weight_kg: 80,
      body_fat_pct: 15,
      heart_rate_bpm: 130,
      resting_heart_rate_bpm: 58,
      fasted_state: true,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.079-fat-metabolism-calculator');
    expect(out.result.estimated_fat_oxidation_g_hr).toBeGreaterThan(0);
    expect(out.keyFindings.some((f) => f.code === 'FAT_OXIDATION')).toBe(true);
    expect(out.provenance.unit).toBe('g/hr');
  });

  it('080 wraps mitochondrial optimizer with registry identity', () => {
    const out = buildMitochondrialOutput({
      zone2_weekly_hours: 3,
      hiit_sessions_per_week: 2,
      coq10_or_nad_support: true,
      cold_heat_exposure: false,
      sleep_quality_score: 7,
      statin_use: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.080-mitochondrial-optimizer');
    expect(out.result.mitochondrial_efficiency_score).toBeGreaterThan(50);
    expect(out.keyFindings.some((f) => f.code === 'MITO_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });
});
