// lib/tools/r6/tool-031-cycle-length-optimizer-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-031 (cycle length optimizer).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runCycleLengthOptimizer,
  calculateCycleLengthOptimizerOutput,
  buildCycleLengthOptimizerOutput,
  cycleLengthOptimizerInputSchema,
  type CycleLengthInput,
  type CycleLengthResult,
} from './tool-031-cycle-length-optimizer-pipeline';
import { calculateCycleLength } from '@/lib/tools/engines/tool-031-cycle-length-optimizer';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: CycleLengthInput = {
  goal: 'bulk',
  experience: 'intermediate',
  previous_cycles: 2,
  compounds: [
    {
      name_en: 'Testosterone Enanthate',
      suppression_factor: 3,
      half_life_days: 4.5,
      weekly_dose_mg: 500,
    },
  ],
};

describe('Slice C — tool-031 cycle length optimizer end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runCycleLengthOptimizer(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-031-cycle-length-optimizer').toolId);
    expect(output.toolSlug).toBe('tool-031-cycle-length-optimizer');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.min_weeks).toBeGreaterThanOrEqual(1);
    expect(output.result.optimal_weeks).toBeGreaterThanOrEqual(1);
    expect(output.result.max_weeks).toBeGreaterThanOrEqual(1);
    expect(output.result.suppression_load).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(output.result.rationale)).toBe(true);

    expect(output.provenance.unit).toBe('week');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'OPTIMAL_WEEKS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateCycleLength(validInput);
    const output = calculateCycleLengthOptimizerOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runCycleLengthOptimizer(null as unknown as CycleLengthInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = cycleLengthOptimizerInputSchema.tryParse({ ...validInput, compounds: [] });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-031-cycle-length-optimizer');
    const engineResult = calculateCycleLength(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildCycleLengthOptimizerOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
