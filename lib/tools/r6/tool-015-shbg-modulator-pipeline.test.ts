// lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-015 (SHBG modulator).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runSHBGModulator,
  calculateSHBGModulatorOutput,
  shbgModulatorInputSchema,
  type SHBGInput,
  type SHBGResult,
} from './tool-015-shbg-modulator-pipeline';
import { calculateSHBG } from '@/lib/tools/engines/tool-015-shbg-modulator';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: SHBGInput = {
  total_testosterone_ng_dL: 500,
  shbg_nmol_L: 40,
  albumin_g_dL: 4.5,
};

describe('Slice C — tool-015 SHBG modulator end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runSHBGModulator(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-015-shbg-modulator').toolId);
    expect(output.toolSlug).toBe('tool-015-shbg-modulator');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.status).toBe('CALCULATED');
    expect(output.result.formula).toBe('VERMEULEN_MASS_ACTION');
    expect(output.result.free_testosterone_nmol_L).toBeGreaterThan(0);
    expect(output.result.free_testosterone_percentage).toBeGreaterThan(0);

    expect(output.provenance.unit).toBe('nmol/L');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'FORMULA')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateSHBG(validInput);
    const output = calculateSHBGModulatorOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const badInputs = [
      { ...validInput, total_testosterone_ng_dL: 0 },
      { ...validInput, shbg_nmol_L: -1 },
      { unexpected: true as never },
    ];

    for (const bad of badInputs) {
      const result = runSHBGModulator(bad, options);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected not ok');
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = shbgModulatorInputSchema.tryParse({ total_testosterone_ng_dL: 0 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-015-shbg-modulator');
    const engineResult = calculateSHBG(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildSHBGModulatorOutput as any)(validInput, {
        ...options,
        toolSlug: 'Invalid Slug!' as never,
      }),
    ).toThrow();
  });
});
