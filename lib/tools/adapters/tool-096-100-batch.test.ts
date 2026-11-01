import { describe, it, expect } from 'vitest';
import { buildHairNailTrackerOutput } from './tool-096-hair-nail-tracker';
import { buildHydrationBalanceCalculatorOutput } from './tool-097-hydration-balance-calculator';
import { buildSodiumPotassiumManagerOutput } from './tool-098-sodium-potassium-manager';
import { buildDigestiveHealthOptimizerOutput } from './tool-099-digestive-health-optimizer';
import { buildComprehensiveReportGeneratorOutput } from './tool-100-comprehensive-report-generator';

describe('Batch #096–#100 Adapters', () => {
  const OPTS = {
    locale: 'ar' as const,
    unitSystem: 'metric' as const,
    snapshotType: 'draft' as const,
    calculatedAt: '2026-01-01T00:00:00.000Z',
    recordedAt: '2026-01-01T00:00:00.000Z',
    timezone: 'UTC',
  };

  it('tool-096 adapter emits valid ToolOutput structure', () => {
    const output = buildHairNailTrackerOutput({
      daily_shedding_rate: 'normal_under_50',
      temporal_vertex_thinning: false,
      scalp_sebum_inflammation: 'none',
      nail_brittleness_or_ridging: false,
      using_5ar_inhibitor_or_minoxidil: false,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-096-hair-nail-tracker');
    expect(output.result).toMatchObject({ status: 'RECORDED', resultType: 'USER_PROVIDED' });
    expect(output.keyFindings.some((f) => f.code === 'OBSERVED_SHEDDING')).toBe(true);
    expect(output.provenance.unit).toBe('user-entered observations');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
  });

  it('tool-097 adapter emits valid ToolOutput structure', () => {
    const output = buildHydrationBalanceCalculatorOutput({
      pre_exercise_body_weight_kg: 80,
      post_exercise_body_weight_kg: 79.2,
      fluid_consumed_liters: 0.5,
      urine_output_liters: 0.1,
      exercise_duration_minutes: 60,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-097-hydration-balance-calculator');
    expect(output.result).toMatchObject({ status: 'CALCULATED', resultType: 'CALCULATED', sweat_loss_liters: 1.2, sweat_rate_liters_per_hour: 1.2 });
    expect(output.keyFindings.some((f) => f.code === 'SWEAT_RATE_CALCULATED')).toBe(true);
    expect(output.provenance.unit).toBe('L and L/h');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.referenceRange).toBeUndefined();
  });

  it('tool-098 adapter emits valid ToolOutput structure', () => {
    const output = buildSodiumPotassiumManagerOutput({
      daily_sodium_mg: 3200,
      daily_potassium_mg: 3500,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-098-sodium-potassium-manager');
    expect(output.result).toMatchObject({ status: 'CALCULATED', resultType: 'CALCULATED', sodium_to_potassium_ratio: 0.91 });
    expect(output.keyFindings.some((f) => f.code === 'NA_K_RATIO')).toBe(true);
    expect(output.provenance.unit).toBe('mg/mg ratio');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.referenceRange).toBeUndefined();
  });

  it('tool-099 adapter emits valid ToolOutput structure', () => {
    const output = buildDigestiveHealthOptimizerOutput({
      daily_protein_intake_grams: 180,
      bloating_or_reflux_frequency: 'rare',
      bowel_regularity_bristol_score: 4,
      using_oral_17aa_or_nsaids: false,
      fermented_food_or_probiotic_intake: true,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-099-digestive-health-optimizer');
    expect(output.result).toMatchObject({ status: 'RECORDED', resultType: 'USER_PROVIDED' });
    expect(output.keyFindings.some((f) => f.code === 'OBSERVED_REFLUX_FREQUENCY')).toBe(true);
    expect(output.provenance.unit).toBe('user-entered observations');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.referenceRange).toBeUndefined();
  });

  it('tool-100 adapter emits valid ToolOutput structure', () => {
    const output = buildComprehensiveReportGeneratorOutput({
      cardiovascular_risk_score: 25,
      hepatic_stress_score: 20,
      endocrine_suppression_score: 15,
      metabolic_vitality_score: 80,
      active_red_flag_symptoms_count: 0,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-100-comprehensive-report-generator');
    expect(output.keyFindings.some((f) => f.code === 'RESULT_TYPE')).toBe(true);
    expect(output.provenance.unit).toBe('user-entered observations');
  });
});

