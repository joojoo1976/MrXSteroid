// lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-047 (fertility preservation).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked engine, schema or adapter file.
import { describe, it, expect } from 'vitest';
import { isToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runFertilityPreservation,
  calculateFertilityOutput,
  buildFertilityOutput,
  fertilityPreservationInputSchema,
  type FertilityInput,
  type FertilityResult,
} from './tool-047-fertility-preservation-pipeline';
import { assessFertility } from '@/lib/tools/engines/tool-047-fertility-preservation';

const options = {
  calculatedAt: '2026-11-16T10:00:00.000Z',
  recordedAt: '2026-11-16T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: FertilityInput = {
  age: 42,
  suppression_level: 3,
  uses_hcg: true,
  planning_horizon_months: 12,
};

describe('Slice C — tool-047 fertility preservation end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runFertilityPreservation(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-047-fertility-preservation').toolId);
    expect(output.toolSlug).toBe('tool-047-fertility-preservation');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.fertility_impact_pct).toBe(70);
    expect(output.result.recovery_projection_months).toBe(13);
    expect(output.result.within_horizon).toBe(false);
    expect(output.result.protocol_hints).toContain('defer_cycle_until_family_planning_settled');

    expect(output.provenance.unit).toBe('months');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((finding) => finding.code === 'IMPACT_PCT')).toBe(true);
    expect(output.keyFindings.some((finding) => finding.code === 'RECOVERY_MONTHS')).toBe(true);
  });

  it('does not reuse the legacy adapter’s invented confidence or reference range', () => {
    const result = runFertilityPreservation(validInput, options);
    if (!result.ok) throw new Error('expected ok');
    expect(result.output.provenance.confidence).toBeNull();
    expect(result.output.provenance.referenceRange).toBeUndefined();
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = assessFertility(validInput);
    const output = calculateFertilityOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runFertilityPreservation(null as unknown as FertilityInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    expect(fertilityPreservationInputSchema.tryParse({ ...validInput, age: 17 }).ok).toBe(false);
    expect(
      fertilityPreservationInputSchema.tryParse({ ...validInput, suppression_level: 4 }).ok,
    ).toBe(false);
    expect(
      fertilityPreservationInputSchema.tryParse({ ...validInput, planning_horizon_months: 37 }).ok,
    ).toBe(false);
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const engineResult = assessFertility(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildFertilityOutput as any)(validInput, engineResult),
    ).toThrow();
  });

  it('keeps the engine result type stable for the pipeline export', () => {
    const engineResult: FertilityResult = assessFertility(validInput);
    expect(engineResult.fertility_impact_pct).toBe(70);
    expect(engineResult.recovery_projection_months).toBe(13);
    expect(engineResult.warnings).toEqual([
      'high_suppression_impact_medical_consult',
      'age_related_decline_not_modeled',
    ]);
  });
});
