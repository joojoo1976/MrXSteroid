/**
 * Tools #071–#075 — adapter envelope verification.
 */
import { describe, it, expect } from 'vitest';
import { buildAntioxidantOutput } from './tool-071-antioxidant-manager';
import { buildSystemicInflammationOutput } from './tool-072-systemic-inflammation-calculator';
import { buildImmuneSystemOutput } from './tool-073-immune-system-optimizer';
import { buildBloodPressureOutput } from './tool-074-blood-pressure-tracker';
import { buildArterialHealthOutput } from './tool-075-arterial-health-manager';

const OPTS = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-01-01T00:00:00.000Z',
  recordedAt: '2026-01-01T00:00:00.000Z',
  timezone: 'UTC',
};

describe('tools 071-075 adapters — canonical envelope', () => {
  it('071 wraps antioxidant manager with registry identity', () => {
    const out = buildAntioxidantOutput({
      daily_fruit_veg_servings: 8,
      takes_coq10: true,
      takes_vitamin_c_e: true,
      takes_zinc_selenium: true,
      high_oxidative_lifestyle: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.071-antioxidant-manager');
    expect(out.result.antioxidant_defense_score).toBe(100);
    expect(out.keyFindings.some((f) => f.code === 'DEFENSE_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('072 wraps systemic inflammation calculator with registry identity', () => {
    const out = buildSystemicInflammationOutput({
      hs_crp_mg_l: 0.8,
      waist_circumference_cm: 85,
      sleep_hours_per_night: 8,
      smoker_or_heavy_alcohol: false,
      chronic_joint_pain: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.072-systemic-inflammation-calculator');
    expect(out.result.inflammation_risk_score).toBe(10);
    expect(out.keyFindings.some((f) => f.code === 'INFLAMMATION_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('073 wraps immune system optimizer with registry identity', () => {
    const out = buildImmuneSystemOutput({
      vitamin_d_ng_ml: 50,
      sleep_hours_average: 8,
      training_strain_level: 'hard',
      recurrent_upper_respiratory_infections: false,
      takes_zinc_vitamin_c: true,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.073-immune-system-optimizer');
    expect(out.result.immune_resilience_score).toBe(100);
    expect(out.keyFindings.some((f) => f.code === 'RESILIENCE_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });

  it('074 wraps blood pressure tracker with registry identity', () => {
    const out = buildBloodPressureOutput({
      systolic_mmhg: 120,
      diastolic_mmhg: 80,
      on_antihypertensive_medication: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.074-blood-pressure-tracker');
    expect(out.result.mean_arterial_pressure).toBe(93.3);
    expect(out.keyFindings.some((f) => f.code === 'BP_CATEGORY')).toBe(true);
    expect(out.provenance.unit).toBe('mmHg');
  });

  it('075 wraps arterial health manager with registry identity', () => {
    const out = buildArterialHealthOutput({
      age: 30,
      systolic_mmhg: 115,
      diastolic_mmhg: 75,
      total_cholesterol_mg_dl: 180,
      hdl_mg_dl: 50,
      triglycerides_mg_dl: 90,
      smoker: false,
    }, OPTS);
    expect(out.toolId).toBe('mrx.tool.075-arterial-health-manager');
    expect(out.result.arterial_risk_score).toBe(10);
    expect(out.keyFindings.some((f) => f.code === 'ARTERIAL_RISK_SCORE')).toBe(true);
    expect(out.provenance.unit).toBe('score');
  });
});
