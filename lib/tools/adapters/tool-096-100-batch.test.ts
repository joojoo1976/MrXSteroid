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
    expect(output.keyFindings.some((f) => f.code === 'HAIR_VITALITY')).toBe(true);
    expect(output.provenance.unit).toBe('score');
  });

  it('tool-097 adapter emits valid ToolOutput structure', () => {
    const output = buildHydrationBalanceCalculatorOutput({
      body_weight_kg: 80,
      training_duration_minutes_daily: 60,
      sweat_rate_intensity: 'moderate',
      climate_temperature: 'temperate',
      caffeine_or_diuretic_intake_mg: 200,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-097-hydration-balance-calculator');
    expect(output.keyFindings.some((f) => f.code === 'DAILY_FLUID')).toBe(true);
    expect(output.provenance.unit).toBe('L');
  });

  it('tool-098 adapter emits valid ToolOutput structure', () => {
    const output = buildSodiumPotassiumManagerOutput({
      daily_sodium_mg: 3200,
      daily_potassium_mg: 3500,
      aldosterone_stress_or_aas: false,
      resting_blood_pressure_systolic: 120,
    }, OPTS);
    expect(output.toolSlug).toBe('tool-098-sodium-potassium-manager');
    expect(output.keyFindings.some((f) => f.code === 'NA_K_RATIO')).toBe(true);
    expect(output.provenance.unit).toBe('ratio');
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
    expect(output.keyFindings.some((f) => f.code === 'DIGESTIVE_SCORE')).toBe(true);
    expect(output.provenance.unit).toBe('score');
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
    expect(output.keyFindings.some((f) => f.code === 'UNIFIED_INDEX')).toBe(true);
    expect(output.provenance.unit).toBe('score');
  });
});
