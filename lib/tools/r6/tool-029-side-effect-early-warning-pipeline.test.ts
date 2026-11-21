// lib/tools/r6/tool-029-side-effect-early-warning-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-029 (side effect early warning).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runSideEffectEarlyWarning,
  calculateSideEffectEarlyWarningOutput,
  buildSideEffectEarlyWarningOutput,
  sideEffectEarlyWarningInputSchema,
  type MeasurementSummaryInput,
  type MeasurementSummaryResult,
} from './tool-029-side-effect-early-warning-pipeline';
import { summarizeMeasurementReadingsV7 } from '@/lib/tools/engines/tool-029-side-effect-early-warning';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: MeasurementSummaryInput = {
  readings: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2026-09-01',
      metric: 'blood_pressure',
      systolicMmHg: 120,
      diastolicMmHg: 80,
    },
    {
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      date: '2026-09-15',
      metric: 'blood_pressure',
      systolicMmHg: 130,
      diastolicMmHg: 85,
    },
    {
      id: '7ba7b810-9dad-11d1-80b4-00c04fd430c9',
      date: '2026-09-01',
      metric: 'pulse',
      beatsPerMinute: 72,
    },
  ],
};

describe('Slice C — tool-029 side effect early warning end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runSideEffectEarlyWarning(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-029-side-effect-early-warning').toolId);
    expect(output.toolSlug).toBe('tool-029-side-effect-early-warning');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.resultOrigin).toBe('CALCULATED');
    expect(output.result.method).toBe('DESCRIPTIVE_ARITHMETIC_ONLY');
    expect(output.result.clinicalAssessment).toBe('NOT_AVAILABLE');
    expect(output.result.readings).toHaveLength(3);
    expect(Array.isArray(output.result.summaries)).toBe(true);

    expect(output.provenance.unit).toBe('reading');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'READING_COUNT')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = summarizeMeasurementReadingsV7(validInput.readings);
    const output = calculateSideEffectEarlyWarningOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runSideEffectEarlyWarning(null as unknown as MeasurementSummaryInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = sideEffectEarlyWarningInputSchema.tryParse({ readings: [] });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-029-side-effect-early-warning');
    const engineResult = summarizeMeasurementReadingsV7(validInput.readings);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildSideEffectEarlyWarningOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
