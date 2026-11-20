// lib/tools/r6/tool-021-peptide-protocol-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-021 (peptide protocol).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runPeptideProtocol,
  calculatePeptideProtocolOutput,
  buildPeptideProtocolOutput,
  peptideProtocolInputSchema,
  type PeptideProtocolInput,
  type PeptideProtocolResult,
} from './tool-021-peptide-protocol-pipeline';
import { calculatePeptideProtocol } from '@/lib/tools/engines/tool-021-peptide-protocol';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: PeptideProtocolInput = {
  user_weight_kg: 80,
  target_compounds: [
    {
      id: 1,
      name_en: 'BPC-157',
      name_ar: 'بي سي بي - 157',
      category: 'bpc-157',
      concentration_mg_ml: 5,
      default_dose_mcg_kg: 5,
      half_life_hours: 6,
      administration: 'subcutaneous',
      description_text: 'Body protection compound',
    },
  ],
  goal: 'recovery',
  protocol_duration_weeks: 4,
  injection_frequency: 'daily',
};

describe('Slice C — tool-021 peptide protocol end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runPeptideProtocol(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-021-peptide-protocol').toolId);
    expect(output.toolSlug).toBe('tool-021-peptide-protocol');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.daily_dose_mcg).toBeGreaterThan(0);
    expect(output.result.total_cycle_dose_mg).toBeGreaterThan(0);
    expect(output.result.total_injections).toBe(28);
    expect(output.result.protocol_weeks).toBe(4);
    expect(Array.isArray(output.result.timing_recommendations)).toBe(true);
    expect(Array.isArray(output.result.storage_requirements)).toBe(true);
    expect(Array.isArray(output.result.side_effect_warnings)).toBe(true);
    expect(typeof output.result.post_protocol_therapy).toBe('boolean');

    expect(output.provenance.unit).toBe('mcg');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'DAILY_DOSE')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculatePeptideProtocol(validInput);
    const output = calculatePeptideProtocolOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runPeptideProtocol(null as unknown as PeptideProtocolInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = peptideProtocolInputSchema.tryParse({ ...validInput, user_weight_kg: 10 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-021-peptide-protocol');
    const engineResult = calculatePeptideProtocol(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildPeptideProtocolOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
