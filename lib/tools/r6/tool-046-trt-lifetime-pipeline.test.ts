// lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-046 (TRT lifetime).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked engine, schema or adapter file.
import { describe, it, expect } from 'vitest';
import { isToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runTrtLifetime,
  calculateTrtLifetimeOutput,
  buildTrtLifetimeOutput,
  trtLifetimeInputSchema,
  type TrtLifetimeInput,
  type TrtLifetimeResult,
} from './tool-046-trt-lifetime-pipeline';
import { projectTrtLifetime } from '@/lib/tools/engines/tool-046-trt-lifetime';

const options = {
  calculatedAt: '2026-11-16T10:00:00.000Z',
  recordedAt: '2026-11-16T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: TrtLifetimeInput = {
  age: 42,
  method: 'injection',
  weekly_testosterone_mg: 150,
  years_on_trt: 3.5,
  monthly_med_cost_usd: 40,
  monitoring_annual_cost_usd: 300,
};

describe('Slice C — tool-046 TRT lifetime end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runTrtLifetime(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-046-trt-lifetime').toolId);
    expect(output.toolSlug).toBe('tool-046-trt-lifetime');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.injection_interval_days).toBe(3.5);
    expect(output.result.annual_bloodwork_panels).toBe(1);
    expect(output.result.age_band).toBe('40-55');
    expect(output.result.cost_projection.horizon10.total_cost_usd).toBe(7800);

    expect(output.provenance.unit).toBe('USD');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((finding) => finding.code === 'COST_10Y')).toBe(true);
    expect(output.keyFindings.some((finding) => finding.code === 'ANNUAL_PANELS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = projectTrtLifetime(validInput);
    const output = calculateTrtLifetimeOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runTrtLifetime(null as unknown as TrtLifetimeInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = trtLifetimeInputSchema.tryParse({ ...validInput, age: 17 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const engineResult = projectTrtLifetime(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildTrtLifetimeOutput as any)(validInput, engineResult),
    ).toThrow();
  });

  it('keeps the engine result type stable for the pipeline export', () => {
    const engineResult: TrtLifetimeResult = projectTrtLifetime(validInput);
    expect(engineResult.cost_projection.horizon10.total_cost_usd).toBe(7800);
    expect(engineResult.cost_projection.horizon20.total_cost_usd).toBe(15600);
    expect(engineResult.cost_projection.horizon30.total_cost_usd).toBe(23400);
    expect(engineResult.lifetime_bloodwork_panels_10y).toBe(10);
  });
});
