// lib/tools/r6/tool-007-bloodwork-analyzer-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-007 (bloodwork analyzer).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runBloodworkAnalyzer,
  calculateBloodworkAnalyzerOutput,
  bloodworkAnalyzerInputSchema,
  type BloodworkSessionV7,
} from './tool-007-bloodwork-analyzer-pipeline';
import { buildBloodworkSessionV7 } from '@/lib/tools/engines/tool-007-bloodwork-analyzer';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    markerName: 'Estradiol',
    value: 100,
    unit: 'pg/mL',
    sourceLabel: 'Lab report',
    sampleDate: '2026-09-20',
  },
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    markerName: 'Prolactin',
    value: 15,
    unit: 'ng/mL',
    sourceLabel: 'Lab report',
    sampleDate: '2026-09-20',
  },
];

describe('Slice C — tool-007 bloodwork analyzer end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runBloodworkAnalyzer(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-007-bloodwork-analyzer').toolId);
    expect(output.toolSlug).toBe('tool-007-bloodwork-analyzer');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.resultOrigin).toBe('USER_PROVIDED');
    expect(output.result.assessment).toBe('NOT_AVAILABLE');
    expect(output.result.reason).toBe('NO_VALIDATED_INTERPRETATION_RULES');
    expect(output.result.records).toHaveLength(2);

    expect(output.provenance.unit).toBe('record');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = buildBloodworkSessionV7(validInput);
    const output = calculateBloodworkAnalyzerOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runBloodworkAnalyzer(null as unknown as BloodworkRecord[], options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = bloodworkAnalyzerInputSchema.tryParse([ { markerName: '', value: 'not-a-number' as never, unit: 'mg', sourceLabel: 'x', sampleDate: '2026-09-20' } ]);
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-007-bloodwork-analyzer');
    const engineResult = buildBloodworkSessionV7(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildBloodworkAnalyzerOutput as any)(validInput, {
        ...options,
        toolSlug: 'Invalid Slug!' as never,
      }),
    ).toThrow();
  });
});
