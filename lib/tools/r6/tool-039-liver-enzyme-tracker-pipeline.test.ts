// lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-039 (liver enzyme tracker).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runLiverEnzymeTracker,
  calculateLiverEnzymeTrackerOutput,
  buildLiverEnzymeTrackerOutput,
  liverEnzymeTrackerInputSchema,
  type LiverTrackerInput,
  type LiverTrackerResult,
} from './tool-039-liver-enzyme-tracker-pipeline';
import { trackLiverEnzymes } from '@/lib/tools/engines/tool-039-liver-enzyme-tracker';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: LiverTrackerInput = {
  readings: [
    { marker: 'ALT', value: 45, unit: 'U/L', date: '2026-08-01' },
    { marker: 'ALT', value: 80, unit: 'U/L', date: '2026-09-01' },
    { marker: 'AST', value: 35, unit: 'U/L', date: '2026-08-01' },
    { marker: 'AST', value: 60, unit: 'U/L', date: '2026-09-01' },
  ],
  oral_steroids: true,
  alcohol_drinks_per_week: 3,
  uses_tudca: false,
};

describe('Slice C — tool-039 liver enzyme tracker end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runLiverEnzymeTracker(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-039-liver-enzyme-tracker').toolId);
    expect(output.toolSlug).toBe('tool-039-liver-enzyme-tracker');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(Array.isArray(output.result.markers)).toBe(true);
    expect(output.result.markers.length).toBeGreaterThan(0);
    expect(output.result.overall_status).toBeDefined();
    expect(Array.isArray(output.result.recommendations)).toBe(true);

    expect(output.provenance.unit).toBe('marker');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'OVERALL_STATUS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = trackLiverEnzymes(validInput);
    const output = calculateLiverEnzymeTrackerOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runLiverEnzymeTracker(null as unknown as LiverTrackerInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = liverEnzymeTrackerInputSchema.tryParse({ readings: [], oral_steroids: false, alcohol_drinks_per_week: 0, uses_tudca: false });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-039-liver-enzyme-tracker');
    const engineResult = trackLiverEnzymes(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildLiverEnzymeTrackerOutput as any)(validInput, engineResult),
    ).toThrow();
  });

  it('is deterministic: the same input always produces the same output', () => {
    const first = runLiverEnzymeTracker(validInput, options);
    const second = runLiverEnzymeTracker(validInput, options);
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) throw new Error('expected ok');
    expect(first.output.result).toEqual(second.output.result);
    expect(first.output.keyFindings).toEqual(second.output.keyFindings);
  });

  it('applies no unit conversion: the entered unit is passed through unchanged', () => {
    // Negative double-conversion check: the engine divides the value by a
    // limit expressed in the same unit. If a conversion layer existed, a
    // value would change here.
    const inputWithUnit: LiverTrackerInput = {
      ...validInput,
      readings: [{ marker: 'ALT', value: 45, unit: 'U/L', date: '2026-08-01' }],
    };
    const result = runLiverEnzymeTracker(inputWithUnit, options);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const alt = result.output.result.markers.find((marker) => marker.marker === 'ALT');
    expect(alt?.latest_value).toBe(45);
    expect(alt?.unit).toBe('U/L');
    expect(alt?.uln_multiple).toBe(0.8);
  });

  it('keeps the medical answers out of the status and inside the recommendations', () => {
    const withOrals = runLiverEnzymeTracker({ ...validInput, oral_steroids: true, alcohol_drinks_per_week: 9 }, options);
    const withoutOrals = runLiverEnzymeTracker({ ...validInput, oral_steroids: false, alcohol_drinks_per_week: 0 }, options);
    expect(withOrals.ok && withoutOrals.ok).toBe(true);
    if (!withOrals.ok || !withoutOrals.ok) throw new Error('expected ok');

    // The status is derived from the readings only.
    expect(withOrals.output.result.overall_status).toBe(withoutOrals.output.result.overall_status);
    expect(withOrals.output.result.markers).toEqual(withoutOrals.output.result.markers);
    // The answers change the recommendations.
    expect(withOrals.output.result.recommendations).not.toEqual(withoutOrals.output.result.recommendations);
  });
});
