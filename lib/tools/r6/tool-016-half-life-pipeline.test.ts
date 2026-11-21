// lib/tools/r6/tool-016-half-life-pipeline.test.ts
// Slice C pilot (G-R6.1-1) + Slice A compatibility:
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput for tool-016, using the
// existing deterministic V6 engine (unmodified). Additive module: touches no
// tracked files.
import { describe, it, expect } from 'vitest';
import { createToolOutput, isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  r6RunHalfLife,
  r6CalculateHalfLifeOutput,
  r6BuildHalfLifeOutput,
  r6HalfLifeInputSchema,
  type HalfLifeResult,
} from './tool-016-half-life-pipeline';
import { calculateHalfLife } from '@/lib/tools/engines/tool-016-half-life-calculator';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput = {
  compounds: [
    { name: 'Example', half_life_days: 5, source: 'User cited product monograph, section 5' },
  ],
  remaining_percent: 5,
};

describe('Slice C — tool-016 half-life end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = r6RunHalfLife(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-016-half-life-calculator').toolId);
    expect(output.toolSlug).toBe('tool-016-half-life-calculator');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.status).toBe('CALCULATED');
    expect(output.result.model).toBe('SINGLE_EXPONENTIAL_ELIMINATION_SCENARIO');
    expect(output.result.compounds).toHaveLength(1);
    expect(output.result.compounds[0].name).toBe('Example');
    expect(output.result.compounds[0].half_life_days).toBe(5);
    expect(output.result.compounds[0].elapsed_days).toBeCloseTo(
      5 * Math.log(0.05) / Math.log(0.5),
      10,
    );
    expect(output.result.assumptions).toEqual([
      'constant_half_life',
      'independent_items',
      'not_clinical',
    ]);

    expect(output.provenance.unit).toBe('day');
    expect(output.provenance.dataQuality).toBe('high');
    expect(output.provenance.confidence).toBe(1);
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateHalfLife(validInput);
    const output = r6CalculateHalfLifeOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const badInputs = [
      { ...validInput, remaining_percent: 0 },
      { ...validInput, remaining_percent: 100 },
      { ...validInput, remaining_percent: Number.NaN },
      { ...validInput, compounds: [] },
      { ...validInput, compounds: [{ ...validInput.compounds[0], half_life_days: 0 }] },
      { ...validInput, compounds: [{ ...validInput.compounds[0], source: '' }] },
      { unexpected: true },
    ];

    for (const bad of badInputs) {
      const result = r6RunHalfLife(bad, options);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected not ok');
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = r6HalfLifeInputSchema.tryParse({ remaining_percent: 'not-a-number' as never });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-016-half-life-calculator');
    const engineResult = calculateHalfLife(validInput);
    expect(() =>
      createToolOutput<HalfLifeResult>({
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
          unit: 'day',
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
