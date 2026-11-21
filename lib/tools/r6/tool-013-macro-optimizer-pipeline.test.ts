// lib/tools/r6/tool-013-macro-optimizer-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-013 (macro optimizer).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runMacroOptimizer,
  calculateMacroOptimizerOutput,
  macroOptimizerInputSchema,
  type MacroInput,
  type MacroTargets,
} from './tool-013-macro-optimizer-pipeline';
import { calculateMacros } from '@/lib/tools/engines/tool-013-macro-optimizer';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: MacroInput = {
  weight_kg: 80,
  goal: 'bulk',
  protein_per_kg: 2.2,
  fats_per_kg: 1.0,
  meals_per_day: 4,
};

describe('Slice C — tool-013 macro optimizer end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runMacroOptimizer(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-013-macro-optimizer').toolId);
    expect(output.toolSlug).toBe('tool-013-macro-optimizer');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.protein_g).toBe(176);
    expect(output.result.fats_g).toBe(80);
    expect(output.result.carbs_g).toBeGreaterThan(0);
    expect(output.result.total_calories).toBe(2112);
    expect(output.result.meal_breakdown).toHaveLength(4);

    expect(output.provenance.unit).toBe('gram');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateMacros(validInput);
    const output = calculateMacroOptimizerOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const badInputs = [
      { ...validInput, weight_kg: -1 },
      { ...validInput, protein_per_kg: 10 },
      { unexpected: true as never },
    ];

    for (const bad of badInputs) {
      const result = runMacroOptimizer(bad, options);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected not ok');
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = macroOptimizerInputSchema.tryParse({ ...validInput, weight_kg: -1 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-013-macro-optimizer');
    const engineResult = calculateMacros(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildMacroOptimizerOutput as any)(validInput, {
        ...options,
        toolSlug: 'Invalid Slug!' as never,
      }),
    ).toThrow();
  });
});
