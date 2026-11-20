// lib/tools/r6/tool-020-genetic-potential-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-020 (genetic potential).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runGeneticPotential,
  calculateGeneticPotentialOutput,
  buildGeneticPotentialOutput,
  geneticPotentialInputSchema,
  type GeneticPotentialInput,
  type GeneticPotentialResult,
} from './tool-020-genetic-potential-pipeline';
import { calculateGeneticPotential } from '@/lib/tools/engines/tool-020-genetic-potential';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: GeneticPotentialInput = {
  age: 28,
  trainingYears: 5,
  priorCycles: 2,
  familyHistory: 'none',
  bodyType: 'mesomorph',
  goal: 'bulk',
  currentWeight: 80,
  height: 180,
};

describe('Slice C — tool-020 genetic potential end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runGeneticPotential(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-020-genetic-potential').toolId);
    expect(output.toolSlug).toBe('tool-020-genetic-potential');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.potential_score).toBeGreaterThanOrEqual(0);
    expect(output.result.potential_score).toBeLessThanOrEqual(100);
    expect(output.result.body_type_assessment).toBeDefined();
    expect(Array.isArray(output.result.risk_factors)).toBe(true);

    expect(output.provenance.unit).toBe('score');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'POTENTIAL_SCORE')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateGeneticPotential(validInput);
    const output = calculateGeneticPotentialOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runGeneticPotential(null as unknown as GeneticPotentialInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = geneticPotentialInputSchema.tryParse({ age: 200 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-020-genetic-potential');
    const engineResult = calculateGeneticPotential(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildGeneticPotentialOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
