// lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-035 (hormone conversion).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runHormoneConversion,
  calculateHormoneConversionOutput,
  buildHormoneConversionOutput,
  hormoneConversionInputSchema,
  type ConversionInput,
  type ConversionResult,
} from './tool-035-hormone-conversion-pipeline';
import { calculateHormoneConversion } from '@/lib/tools/engines/tool-035-hormone-conversion';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: ConversionInput = {
  analyte: 'testosterone',
  value: 500,
  unit: 'ng/dL',
  measurement_date: '2026-09-20',
  reading_source: 'Lab report',
};

describe('Slice C — tool-035 hormone conversion end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runHormoneConversion(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-035-hormone-conversion').toolId);
    expect(output.toolSlug).toBe('tool-035-hormone-conversion');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.status).toBe('CALCULATED');
    expect(output.result.analyte).toBe('testosterone');
    expect(output.result.input_value).toBe(500);
    expect(output.result.input_unit).toBe('ng/dL');
    expect(output.result.result_value).toBeGreaterThan(0);
    expect(output.result.result_unit).toBe('nmol/L');
    expect(output.result.conversion_factor).toBeGreaterThan(0);

    expect(output.provenance.unit).toBe('nmol/L');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'CONVERSION_FACTOR')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateHormoneConversion(validInput);
    const output = calculateHormoneConversionOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runHormoneConversion(null as unknown as ConversionInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = hormoneConversionInputSchema.tryParse({ ...validInput, value: -1 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-035-hormone-conversion');
    const engineResult = calculateHormoneConversion(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildHormoneConversionOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
