import { describe, expect, it } from 'vitest';
import { buildMacroOptimizerOutput } from './tool-013-macro-optimizer';
import { calculateMacros } from '../engines/tool-013-macro-optimizer';

describe('buildMacroOptimizerOutput', () => {
  it('publishes calculated values, model assumptions, and unassessed confidence', () => {
    const input = { weight_kg: 85, goal: 'bulk' as const, protein_per_kg: 2, fats_per_kg: 0.8, meals_per_day: 4 };
    const result = calculateMacros(input);
    const output = buildMacroOptimizerOutput(input, result, {
      locale: 'en',
      unitSystem: 'metric',
      snapshotType: 'draft',
      calculatedAt: '2026-10-25T00:00:00.000Z',
      recordedAt: '2026-10-25T00:00:00.000Z',
    });

    expect(output.toolId).toBe('mrx.tool.013-macro-optimizer');
    expect(output.toolSlug).toBe('tool-013-macro-optimizer');
    expect(output.result).toEqual(result);
    expect(output.provenance.confidence).toBeNull();
    expect(output.keyFindings.map((finding) => finding.code)).toContain('MACRO_MODEL_ASSUMPTION');
    expect(output.keyFindings.find((finding) => finding.code === 'MEAL_ROUNDING')?.value).toContain('rounded up');
  });
});
