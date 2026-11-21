// lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-037 (side effect probability).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runSideEffectProbability,
  calculateSideEffectProbabilityOutput,
  buildSideEffectProbabilityOutput,
  sideEffectProbabilityInputSchema,
  type SideEffectRiskInput,
  type SideEffectRiskResult,
} from './tool-037-side-effect-probability-pipeline';
import { calculateSideEffectProbability } from '@/lib/tools/engines/tool-037-side-effect-probability';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: SideEffectRiskInput = {
  compounds: [
    {
      name_en: 'Testosterone Enanthate',
      family: 'testosterone',
      weekly_dose_mg: 500,
      reference_dose_mg: 500,
    },
  ],
  age: 30,
  body_fat_pct: 15,
  cycle_weeks: 12,
  uses_ai: false,
  uses_liver_support: false,
};

describe('Slice C — tool-037 side effect probability end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runSideEffectProbability(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-037-side-effect-probability').toolId);
    expect(output.toolSlug).toBe('tool-037-side-effect-probability');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(Array.isArray(output.result.risks)).toBe(true);
    expect(output.result.risks.length).toBeGreaterThan(0);
    expect(output.result.overall_burden_pct).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(output.result.mitigations)).toBe(true);

    expect(output.provenance.unit).toBe('percent');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'OVERALL_BURDEN')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateSideEffectProbability(validInput);
    const output = calculateSideEffectProbabilityOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runSideEffectProbability(null as unknown as SideEffectRiskInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = sideEffectProbabilityInputSchema.tryParse({ ...validInput, compounds: [] });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-037-side-effect-probability');
    const engineResult = calculateSideEffectProbability(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildSideEffectProbabilityOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
