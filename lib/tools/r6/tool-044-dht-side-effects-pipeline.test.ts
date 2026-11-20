// lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-044 (DHT side effects).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runDhtSideEffects,
  calculateDhtSideEffectsOutput,
  buildDhtSideEffectsOutput,
  dhtSideEffectsInputSchema,
  type DhtInput,
  type DhtResult,
} from './tool-044-dht-side-effects-pipeline';
import { predictDhtEffects } from '@/lib/tools/engines/tool-044-dht-side-effects';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: DhtInput = {
  dht_ng_dl: 65,
  uses_dht_derivative: true,
  five_ari: 'none',
  family_history_hairloss: true,
  age: 30,
};

describe('Slice C — tool-044 DHT side effects end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runDhtSideEffects(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-044-dht-side-effects').toolId);
    expect(output.toolSlug).toBe('tool-044-dht-side-effects');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.hair_loss_risk_pct).toBeGreaterThanOrEqual(0);
    expect(output.result.prostate_symptom_risk_pct).toBeGreaterThanOrEqual(0);
    expect(output.result.overall_burden_pct).toBeGreaterThanOrEqual(0);
    expect(output.result.band).toBeDefined();
    expect(Array.isArray(output.result.mitigations)).toBe(true);

    expect(output.provenance.unit).toBe('percent');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'DHT_BAND')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = predictDhtEffects(validInput);
    const output = calculateDhtSideEffectsOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runDhtSideEffects(null as unknown as DhtInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = dhtSideEffectsInputSchema.tryParse({ ...validInput, dht_ng_dl: 4 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-044-dht-side-effects');
    const engineResult = predictDhtEffects(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildDhtSideEffectsOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
