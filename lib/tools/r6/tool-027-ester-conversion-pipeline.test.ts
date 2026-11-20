// lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-027 (ester conversion).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { createToolOutput, isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runEsterConversion,
  calculateEsterConversionOutput,
  buildEsterConversionOutput,
  esterConversionInputSchema,
  type MolarMassConversionResult,
} from './tool-027-ester-conversion-pipeline';
import { calculateMolarMassRelationshipV7 } from '@/lib/tools/engines/tool-027-ester-conversion';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput = {
  sourceSubstanceLabel: 'Material A',
  sourceMass: 100,
  sourceMassUnit: 'mg' as const,
  sourceMolarMass: 100,
  sourceMolarMassSource: 'User supplied source A',
  targetSubstanceLabel: 'Material B',
  targetMolarMass: 200,
  targetMolarMassSource: 'User supplied source B',
  targetMassUnit: 'mg' as const,
};

describe('Slice C — tool-027 ester conversion end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runEsterConversion(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-027-ester-conversion').toolId);
    expect(output.toolSlug).toBe('tool-027-ester-conversion');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.resultOrigin).toBe('CALCULATED');
    expect(output.result.method).toBe('SAME_AMOUNT_OF_SUBSTANCE');
    expect(output.result.amountInMoles).toBeCloseTo(0.001);
    expect(output.result.targetAmountInGrams).toBeCloseTo(0.2);
    expect(output.result.targetAmount).toBeCloseTo(200);
    expect(output.result.targetMassUnit).toBe('mg');

    expect(output.provenance.unit).toBe('mg');
    expect(output.provenance.dataQuality).toBe('high');
    expect(output.provenance.confidence).toBe(1);
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateMolarMassRelationshipV7(validInput);
    const output = calculateEsterConversionOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const badInputs = [
      { ...validInput, sourceMass: 0 },
      { ...validInput, sourceMass: Number.NaN },
      { ...validInput, sourceMass: -50 },
      { ...validInput, sourceMolarMassSource: '' },
      { ...validInput, sourceMassUnit: 'oz' as never },
      { unexpected: true },
    ];

    for (const bad of badInputs) {
      const result = runEsterConversion(bad, options);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected not ok');
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = esterConversionInputSchema.tryParse({ sourceMass: 'not-a-number' as never });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-027-ester-conversion');
    const engineResult = calculateMolarMassRelationshipV7(validInput);
    // Valid output should not throw
    expect(() =>
      buildEsterConversionOutput(validInput, engineResult, {
        ...options,
        source: 'manual',
      }),
    ).not.toThrow();

    // Invalid envelope (bad toolSlug) should throw via createToolOutput
    expect(() =>
      createToolOutput<MolarMassConversionResult>({
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
          unit: 'mg',
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
