// lib/tools/r6/tool-023-trt-optimization-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-023 (TRT optimization).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runTrtOptimization,
  calculateTrtOptimizationOutput,
  buildTrtOptimizationOutput,
  trtOptimizationInputSchema,
  type TrtInput,
  type TrtResult,
} from './tool-023-trt-optimization-pipeline';
import { calculateTrtOptimization } from '@/lib/tools/engines/tool-023-trt-optimization';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: TrtInput = {
  age: 35,
  current_total_test_ng_dL: 250,
  current_free_test_pg_mL: 80,
  symptoms: 'moderate',
  hematocrit_current: 45,
  e2_current_pg_mL: 35,
  trt_duration_months: 3,
  administration: 'intramuscular',
};

describe('Slice C — tool-023 TRT optimization end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runTrtOptimization(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-023-trt-optimization').toolId);
    expect(output.toolSlug).toBe('tool-023-trt-optimization');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.recommended_total_test_ng_dL).toBe(750);
    expect(output.result.recommended_dose_mg_weekly).toBeGreaterThan(0);
    expect(output.result.e2_management).toBeDefined();
    expect(output.result.monitoring_schedule).toBeDefined();
    expect(Array.isArray(output.result.risk_factors)).toBe(true);
    expect(Array.isArray(output.result.protocol_tips)).toBe(true);

    expect(output.provenance.unit).toBe('mg/week');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'RECOMMENDED_DOSE')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateTrtOptimization(validInput);
    const output = calculateTrtOptimizationOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runTrtOptimization(null as unknown as TrtInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = trtOptimizationInputSchema.tryParse({ ...validInput, age: 200 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-023-trt-optimization');
    const engineResult = calculateTrtOptimization(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildTrtOptimizationOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
