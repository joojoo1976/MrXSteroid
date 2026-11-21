// lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-022 (half-life stacker).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runHalfLifeStacker,
  calculateHalfLifeStackerOutput,
  buildHalfLifeStackerOutput,
  halfLifeStackerInputSchema,
  type StackTimingInput,
  type StackTimingResult,
} from './tool-022-half-life-stacker-pipeline';
import { calculateStackTiming } from '@/lib/tools/engines/tool-022-half-life-stacker';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: StackTimingInput = {
  compounds: [
    {
      id: 1,
      name_en: 'Testosterone Enanthate',
      name_ar: 'التستوستيرون إينانتات',
      family: 'testosterone',
      ester_type: 'enanthate',
      half_life_days: 4.5,
      release_rate: 'slow',
      anabolic_score: 100,
      androgenic_score: 100,
      description_text: 'Long-acting testosterone ester',
    },
  ],
  cycle_length_weeks: 12,
  injection_frequency: '2x-week',
};

describe('Slice C — tool-022 half-life stacker end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runHalfLifeStacker(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-022-half-life-stacker').toolId);
    expect(output.toolSlug).toBe('tool-022-half-life-stacker');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.peak_platform_days).toBeGreaterThan(0);
    expect(output.result.total_cycle_half_lives).toBeGreaterThan(0);
    expect(output.result.recommended_pct_start_days).toBeGreaterThan(0);
    expect(output.result.washout_complete_days).toBeGreaterThan(0);
    expect(output.result.ester_bottleneck.name_en).toBe('Testosterone Enanthate');
    expect(Array.isArray(output.result.optimal_injection_schedule)).toBe(true);
    expect(typeof output.result.compound_peak_times).toBe('object');

    expect(output.provenance.unit).toBe('day');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'WASHOUT_DAYS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateStackTiming(validInput);
    const output = calculateHalfLifeStackerOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runHalfLifeStacker(null as unknown as StackTimingInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = halfLifeStackerInputSchema.tryParse({ ...validInput, cycle_length_weeks: 0 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-022-half-life-stacker');
    const engineResult = calculateStackTiming(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildHalfLifeStackerOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
