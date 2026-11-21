// lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-038 (stack compatibility).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runStackCompatibility,
  calculateStackCompatibilityOutput,
  buildStackCompatibilityOutput,
  stackCompatibilityInputSchema,
  type StackCompatibilityInput,
  type StackCompatibilityResult,
} from './tool-038-stack-compatibility-pipeline';
import { checkStackCompatibility } from '@/lib/tools/engines/tool-038-stack-compatibility';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: StackCompatibilityInput = {
  items: [
    {
      name_en: 'Testosterone Enanthate',
      family: 'testosterone',
      weekly_dose_mg: 500,
      hepatotoxic: false,
    },
    {
      name_en: 'Anavar',
      family: 'oral',
      weekly_dose_mg: 350,
      hepatotoxic: true,
    },
  ],
};

describe('Slice C — tool-038 stack compatibility end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runStackCompatibility(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-038-stack-compatibility').toolId);
    expect(output.toolSlug).toBe('tool-038-stack-compatibility');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.score_0_100).toBeGreaterThanOrEqual(0);
    expect(output.result.score_0_100).toBeLessThanOrEqual(100);
    expect(output.result.verdict).toBeDefined();
    expect(Array.isArray(output.result.flags)).toBe(true);

    expect(output.provenance.unit).toBe('score');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'COMPATIBILITY_SCORE')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = checkStackCompatibility(validInput);
    const output = calculateStackCompatibilityOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runStackCompatibility(null as unknown as StackCompatibilityInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = stackCompatibilityInputSchema.tryParse({ ...validInput, items: [] });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-038-stack-compatibility');
    const engineResult = checkStackCompatibility(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildStackCompatibilityOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
