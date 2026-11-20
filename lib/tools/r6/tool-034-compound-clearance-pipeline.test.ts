// lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-034 (compound clearance).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runCompoundClearance,
  calculateCompoundClearanceOutput,
  buildCompoundClearanceOutput,
  compoundClearanceInputSchema,
  type ClearanceInput,
  type ClearanceResult,
} from './tool-034-compound-clearance-pipeline';
import { calculateCompoundClearance } from '@/lib/tools/engines/tool-034-compound-clearance';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: ClearanceInput = {
  compound_name: 'Testosterone Enanthate',
  half_life_days: 4.5,
  half_life_source: 'FDA label estimate',
  last_dose_date: '2026-09-01',
  as_of_date: '2026-09-21',
  threshold_fraction: 0.01,
};

describe('Slice C — tool-034 compound clearance end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runCompoundClearance(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-034-compound-clearance').toolId);
    expect(output.toolSlug).toBe('tool-034-compound-clearance');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.days_to_threshold).toBeGreaterThan(0);
    expect(output.result.threshold_date).toBeDefined();
    expect(output.result.days_elapsed).toBe(20);
    expect(output.result.modeled_remaining_percent).toBeGreaterThan(0);
    expect(Array.isArray(output.result.curve)).toBe(true);

    expect(output.provenance.unit).toBe('day');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'DAYS_TO_THRESHOLD')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateCompoundClearance(validInput);
    const output = calculateCompoundClearanceOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runCompoundClearance(null as unknown as ClearanceInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = compoundClearanceInputSchema.tryParse({ ...validInput, half_life_days: 0 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-034-compound-clearance');
    const engineResult = calculateCompoundClearance(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildCompoundClearanceOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
