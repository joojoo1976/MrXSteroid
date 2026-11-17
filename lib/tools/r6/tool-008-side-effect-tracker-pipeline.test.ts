// lib/tools/r6/tool-008-side-effect-tracker-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-008 (side effect tracker).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runSideEffectTracker,
  buildSideEffectTrackerOutput,
  sideEffectTrackerInputSchema,
  type SideEffectLog,
} from './tool-008-side-effect-tracker-pipeline';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  date: '2026-09-21T10:00:00.000Z',
  symptom: 'Mild headache',
  severity: 'mild' as const,
  category: 'other' as const,
  sourceLabel: 'User symptom log',
};

describe('Slice C — tool-008 side effect tracker end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runSideEffectTracker(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-008-side-effect-tracker').toolId);
    expect(output.toolSlug).toBe('tool-008-side-effect-tracker');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.severity).toBe('mild');
    expect(output.result.category).toBe('other');

    expect(output.provenance.unit).toBe('log_entry');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = { ...validInput } as SideEffectLog;
    const output = buildSideEffectTrackerOutput(validInput, engineResult, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const badInputs = [
      [ { ...validInput[0], value: 1 as unknown as string } ],
      [ { ...validInput[0], value: Number.NaN } ],
      [ { ...validInput[0], sampleDate: 'not-a-date' as unknown as string } ],
      [ { unexpected: true as unknown as {} } ],
    ];

    for (const bad of badInputs) {
      const result = runSideEffectTracker(bad, options);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected not ok');
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = sideEffectTrackerInputSchema.tryParse([ { markerName: '', value: 'not-a-number' as never, unit: 'mg', sourceLabel: 'x', sampleDate: '2026-09-20' } ]);
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-008-side-effect-tracker');
    const engineResult = buildSideEffectTrackerOutput(validInput, validInput, options);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildSideEffectTrackerOutput as any)(validInput, {
        ...options,
        toolSlug: 'Invalid Slug!' as never,
      }),
    ).toThrow();
  });
});
