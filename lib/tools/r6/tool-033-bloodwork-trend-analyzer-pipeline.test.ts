// lib/tools/r6/tool-033-bloodwork-trend-analyzer-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-033 (bloodwork trend analyzer).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runBloodworkTrendAnalyzer,
  calculateBloodworkTrendAnalyzerOutput,
  buildBloodworkTrendAnalyzerOutput,
  bloodworkTrendAnalyzerInputSchema,
  type TrendAnalyzerInput,
  type TrendAnalyzerResult,
} from './tool-033-bloodwork-trend-analyzer-pipeline';
import { analyzeBloodworkTrends } from '@/lib/tools/engines/tool-033-bloodwork-trend-analyzer';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: TrendAnalyzerInput = {
  readings: [
    {
      marker: 'Estradiol',
      value: 100,
      unit: 'pg/mL',
      date: '2026-09-01',
    },
    {
      marker: 'Estradiol',
      value: 150,
      unit: 'pg/mL',
      date: '2026-09-15',
    },
    {
      marker: 'Prolactin',
      value: 15,
      unit: 'ng/mL',
      date: '2026-09-01',
    },
  ],
};

describe('Slice C — tool-033 bloodwork trend analyzer end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runBloodworkTrendAnalyzer(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-033-bloodwork-trend-analyzer').toolId);
    expect(output.toolSlug).toBe('tool-033-bloodwork-trend-analyzer');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(Array.isArray(output.result.markers)).toBe(true);
    expect(output.result.markers.length).toBeGreaterThan(0);
    expect(output.result.markers[0].marker).toBeDefined();
    expect(output.result.markers[0].direction).toBeDefined();

    expect(output.provenance.unit).toBe('marker');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'MARKER_COUNT')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = analyzeBloodworkTrends(validInput);
    const output = calculateBloodworkTrendAnalyzerOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runBloodworkTrendAnalyzer(null as unknown as TrendAnalyzerInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = bloodworkTrendAnalyzerInputSchema.tryParse({ readings: [{ marker: '', value: -1, unit: '', date: 'not-a-date' }] });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-033-bloodwork-trend-analyzer');
    const engineResult = analyzeBloodworkTrends(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildBloodworkTrendAnalyzerOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
