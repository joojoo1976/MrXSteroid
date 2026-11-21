// lib/tools/r6/tool-024-bloodwork-interpreter-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-024 (bloodwork interpreter).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runBloodworkInterpreter,
  calculateBloodworkInterpreterOutput,
  buildBloodworkInterpreterOutput,
  bloodworkInterpreterInputSchema,
  type BloodworkComparisonInput,
  type BloodworkComparisonResult,
} from './tool-024-bloodwork-interpreter-pipeline';
import { compareBloodworkToEnteredIntervalsV7 } from '@/lib/tools/engines/tool-024-bloodwork-interpreter';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: BloodworkComparisonInput = {
  records: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      markerName: 'Estradiol',
      value: 100,
      unit: 'pg/mL',
      referenceLow: 10,
      referenceHigh: 40,
      sourceLabel: 'Lab report',
      sampleDate: '2026-09-20',
    },
    {
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      markerName: 'Prolactin',
      value: 15,
      unit: 'ng/mL',
      referenceLow: 2,
      referenceHigh: 18,
      sourceLabel: 'Lab report',
      sampleDate: '2026-09-20',
    },
  ],
};

describe('Slice C — tool-024 bloodwork interpreter end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runBloodworkInterpreter(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-024-bloodwork-interpreter').toolId);
    expect(output.toolSlug).toBe('tool-024-bloodwork-interpreter');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.resultOrigin).toBe('CALCULATED');
    expect(output.result.comparisons).toHaveLength(2);
    expect(output.result.comparisons[0].relation).toBe('ABOVE_ENTERED_INTERVAL');
    expect(output.result.comparisons[1].relation).toBe('WITHIN_ENTERED_INTERVAL');

    expect(output.provenance.unit).toBe('comparison');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'BELOW_COUNT')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'ABOVE_COUNT')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = compareBloodworkToEnteredIntervalsV7(validInput.records);
    const output = calculateBloodworkInterpreterOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runBloodworkInterpreter(null as unknown as BloodworkComparisonInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = bloodworkInterpreterInputSchema.tryParse({ records: [] });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-024-bloodwork-interpreter');
    const engineResult = compareBloodworkToEnteredIntervalsV7(validInput.records);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildBloodworkInterpreterOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
