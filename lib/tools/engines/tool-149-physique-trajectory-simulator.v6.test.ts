import { describe, expect, it } from 'vitest';
import { calculateTransformationScenario } from './tool-131-transformation-forecast-trajectory-engine.v6';
import {
  calculatePhysiqueTrajectoryScenarios,
  inspectPhysiqueTrajectoryDraft,
  PhysiqueTrajectoryInputSchema,
} from './tool-149-physique-trajectory-simulator.v6';

const base = { current_weight_kg: 100, current_body_fat_pct: 25, target_body_fat_pct: 20 };

describe('Tool 149 physique trajectory arithmetic scenarios', () => {
  it('reports PARTIAL and names missing required values without calculating', () => {
    expect(inspectPhysiqueTrajectoryDraft({ current_weight_kg: 100, current_body_fat_pct: 25, weekly_rates_kg_per_week: [0.5] })).toEqual({
      status: 'PARTIAL', missingFields: ['target_body_fat_pct'],
    });
    expect(inspectPhysiqueTrajectoryDraft({ ...base, weekly_rates_kg_per_week: [''] })).toEqual({
      status: 'PARTIAL', missingFields: ['weekly_rates_kg_per_week'],
    });
  });

  it('calculates one user-selected rate and matches Tool 131 shared-kernel results', () => {
    const input = { ...base, weekly_rates_kg_per_week: [0.5] };
    const result = calculatePhysiqueTrajectoryScenarios(input);
    const tool131 = calculateTransformationScenario({ ...base, weekly_weight_change_kg: 0.5 });
    expect(result.status).toBe('CALCULATED');
    if (result.status !== 'CALCULATED') throw new Error('Expected a calculated result');
    expect(result.calculationType).toBe('CALCULATED');
    expect(result.scenarios).toHaveLength(1);
    expect(result.scenarios[0].scenario_target_weight_kg).toBe(tool131.scenario_target_weight_kg);
    expect(result.scenarios[0].scenario_duration_weeks).toBe(tool131.estimated_scenario_weeks);
    expect(result.scenarios[0].scenario_target_weight_kg).toBe(93.8);
    expect(result.scenarios[0].scenario_duration_weeks).toBe(12.5);
    expect(result.disclaimer).toContain('not a real-world prediction');
  });

  it('compares three user rates in entered order without ranking them', () => {
    const result = calculatePhysiqueTrajectoryScenarios({ ...base, weekly_rates_kg_per_week: [1, 0.25, 0.5] });
    expect(result.status).toBe('CALCULATED');
    if (result.status !== 'CALCULATED') throw new Error('Expected a calculated result');
    expect(result.scenarios.map((scenario) => scenario.weekly_weight_change_kg)).toEqual([1, 0.25, 0.5]);
    expect(result.scenarios.map((scenario) => scenario.scenario_duration_weeks)).toEqual([6.3, 25, 12.5]);
    expect(result.scenarios.every((scenario) => scenario.assumptions.includes('constant lean mass'))).toBe(true);
  });

  it('preserves repeated rates exactly as entered without deduplicating or ranking', () => {
    const result = calculatePhysiqueTrajectoryScenarios({ ...base, weekly_rates_kg_per_week: [0.5, 0.5] });
    expect(result.status).toBe('CALCULATED');
    if (result.status !== 'CALCULATED') throw new Error('Expected a calculated result');
    expect(result.scenarios.map((scenario) => scenario.weekly_weight_change_kg)).toEqual([0.5, 0.5]);
    expect(result.scenarios[0].scenario_duration_weeks).toBe(result.scenarios[1].scenario_duration_weeks);
  });

  it.each([
    { ...base, current_weight_kg: 0, weekly_rates_kg_per_week: [0.5] },
    { ...base, current_weight_kg: -1, weekly_rates_kg_per_week: [0.5] },
    { ...base, current_body_fat_pct: 0, weekly_rates_kg_per_week: [0.5] },
    { ...base, target_body_fat_pct: 100, weekly_rates_kg_per_week: [0.5] },
    { ...base, weekly_rates_kg_per_week: [0] },
    { ...base, weekly_rates_kg_per_week: [-0.5] },
    { ...base, weekly_rates_kg_per_week: [0.1, 0.2, 0.3, 0.4] },
  ])('rejects invalid or unsupported input $current_weight_kg/$current_body_fat_pct/$target_body_fat_pct', (input) => {
    expect(PhysiqueTrajectoryInputSchema.safeParse(input).success).toBe(false);
    expect(inspectPhysiqueTrajectoryDraft(input).status).toBe('INVALID_INPUT');
  });

  it('returns NOT_AVAILABLE and no scenario when a valid-input target exceeds the supported result bound', () => {
    const result = calculatePhysiqueTrajectoryScenarios({
      current_weight_kg: 500, current_body_fat_pct: 3, target_body_fat_pct: 70, weekly_rates_kg_per_week: [0.5],
    });
    expect(result).toMatchObject({ status: 'NOT_AVAILABLE', calculationType: 'NOT_AVAILABLE', scenarios: [] });
    if (result.status === 'NOT_AVAILABLE') expect(result.reason).toContain('500 kg');
  });
});
