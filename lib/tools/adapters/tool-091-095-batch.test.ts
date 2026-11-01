import { describe, it, expect } from 'vitest';
import { buildFemaleHealthOptimizerOutput } from './tool-091-female-health-optimizer';
import { buildFemaleDosageCalculatorOutput } from './tool-092-female-dosage-calculator';
import { buildMenstrualCycleManagerOutput } from './tool-093-menstrual-cycle-manager';
import { buildPregnancyRiskCalculatorOutput } from './tool-094-pregnancy-risk-calculator';
import { buildSkinHealthOptimizerOutput } from './tool-095-skin-health-optimizer';

describe('Batch #091–#095 Adapters', () => {
  const OPTS = {
    locale: 'ar' as const,
    unitSystem: 'metric' as const,
    snapshotType: 'draft' as const,
    calculatedAt: '2026-01-01T00:00:00.000Z',
    recordedAt: '2026-01-01T00:00:00.000Z',
    timezone: 'UTC',
  };

  it('tool-091 adapter emits valid ToolOutput structure', () => {
    const output = buildFemaleHealthOptimizerOutput({
      energy_availability_adequacy: 'adequate',
      ferritin_status: 'optimal',
      bone_stress_or_joint_pains: false,
      thyroid_cold_intolerance: false,
      resistance_training_sessions_per_week: 4,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-091-female-health-optimizer');
    expect(output.result).toMatchObject({ status: 'RECORDED', resultType: 'USER_PROVIDED' });
    expect(output.keyFindings.some((f) => f.code === 'OBSERVED_ENERGY')).toBe(true);
    expect(output.provenance.unit).toBe('user-entered observations');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
  });

  it('tool-092 adapter emits valid ToolOutput structure', () => {
    const output = buildFemaleDosageCalculatorOutput({
      compound: 'oxandrolone',
      proposed_weekly_dose_mg: 20,
      cycle_experience: 'intermediate_experience',
      monitoring_bloodwork_planned: true,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-092-female-dosage-calculator');
    expect(output.result.status).toBe('NOT_AVAILABLE');
    expect(output.keyFindings.some((f) => f.code === 'NO_VALIDATED_FEMALE_DOSING_MODEL')).toBe(true);
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
  });

  it('tool-093 adapter emits valid ToolOutput structure', () => {
    const output = buildMenstrualCycleManagerOutput({
      cycle_length_days: 28,
      current_cycle_day: 14,
      oral_contraceptive_active: false,
      high_intensity_training_focus: true,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-093-menstrual-cycle-manager');
    expect(output.result).toMatchObject({ status: 'RECORDED', resultType: 'USER_PROVIDED' });
    expect(output.keyFindings.some((f) => f.code === 'CYCLE_DAY')).toBe(true);
    expect(output.provenance.unit).toBe('calendar days and user-entered flags');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
  });

  it('tool-094 adapter emits valid ToolOutput structure', () => {
    const output = buildPregnancyRiskCalculatorOutput({
      compound_class: 'anabolic_androgenic_steroid',
      weeks_since_last_exposure: 20,
      currently_pregnant_or_attempting_conception: false,
      unprotected_intercourse_during_exposure: false,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-094-pregnancy-risk-calculator');
    expect(output.result.status).toBe('NOT_AVAILABLE');
    expect(output.keyFindings.some((f) => f.code === 'NO_PRODUCT_SPECIFIC_PREGNANCY_GUIDANCE')).toBe(true);
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
  });

  it('tool-095 adapter emits valid ToolOutput structure', () => {
    const output = buildSkinHealthOptimizerOutput({
      sebum_production_level: 'normal_balanced',
      acne_lesion_distribution: 'none_or_mild_comedones',
      barrier_dryness_or_flaking: false,
      sweat_hygiene_post_workout: 'immediate_shower',
      using_topical_dht_blockers_or_salicylic: true,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-095-skin-health-optimizer');
    expect(output.result).toMatchObject({ status: 'RECORDED', resultType: 'USER_PROVIDED' });
    expect(output.keyFindings.some((f) => f.code === 'OBSERVED_SEBUM')).toBe(true);
    expect(output.provenance.unit).toBe('user-entered observations');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
  });
});
