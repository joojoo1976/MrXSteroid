// lib/tools/r6/tool-012-calorie-adjuster-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-012 (calorie adjuster).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runCalorieAdjuster,
  calculateCalorieAdjusterOutput,
  buildCalorieAdjusterOutput,
  calorieAdjusterInputSchema,
  type CalorieResult,
} from './tool-012-calorie-adjuster-pipeline';
import { calculateTDEE } from '@/lib/tools/engines/tool-012-calorie-adjuster';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput = {
  age: 30,
  gender: 'male' as const,
  height_cm: 180,
  current_weight_kg: 80,
  activity_level: 'moderate' as const,
  goal: 'maintain' as const,
  weeks_per_phase: 8,
};

describe('Slice C — tool-012 calorie adjuster end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runCalorieAdjuster(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-012-calorie-adjuster').toolId);
    expect(output.toolSlug).toBe('tool-012-calorie-adjuster');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.tdee).toBeGreaterThan(0);
    expect(output.result.maintenance_calories).toBe(output.result.tdee);
    expect(output.result.target_calories).toBe(output.result.tdee);
    expect(output.result.weekly_adjustment).toBe(0);

    expect(output.provenance.unit).toBe('kcal/day');
    expect(output.provenance.dataQuality).toBe('high');
    expect(output.provenance.confidence).toBe(1);
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'ESTIMATED_TDEE')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'TARGET_CALORIES')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateTDEE(validInput);
    const output = calculateCalorieAdjusterOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const badInputs = [
      { ...validInput, age: -1 },
      { ...validInput[0], value: Number.NaN },
      { ...validInput, weight_cm: 0 },
      { ...validInput[0], age: 0 },
      { ...validInput[0], age: 200 },
      { unexpected: true as unknown as any },
    ];

    for (const bad of badInputs) {
      const result = runCalorieAdjuster(bad, options);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected not ok');
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = calorieAdjusterInputSchema.tryParse({ age: 'not-a-number' as never });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-012-calorie-adjuster');
    const engineResult = calculateTDEE(validInput);
    expect(() =>
      createToolOutput<CalorieResult>({
        toolId: tool.toolId,
        toolSlug: 'Invalid Slug!' as never,
        calculatedAt: options.calculatedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        accessTier: tool.accessTier,
        snapshotType: options.snapshotType,
        result: engineResult,
        provenance: {
          source: 'manual',
          recordedAt: options.recordedAt,
          timezone: 'UTC',
          unit: 'kcal/day',
          confidence: 1,
          dataQuality: 'high',
        },
        keyFindings: [],
        seoLinks: {
          prevTool: { titleAr: 'سابق', titleEn: 'Previous', slug: 'macro' },
          nextTool: { titleAr: 'التالي', titleEn: 'Next', slug: 'bodyfat' },
        },
      }),
    ).toThrow();
  });
});
