// lib/tools/r6/tool-017-drug-interaction-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-017 (drug interaction).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runDrugInteraction,
  calculateDrugInteractionOutput,
  buildDrugInteractionOutput,
  drugInteractionInputSchema,
  type DrugInteractionResult,
} from './tool-017-drug-interaction-pipeline';
import { checkDrugInteractions } from '@/lib/tools/engines/tool-017-drug-interaction';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

describe('Slice C — tool-017 drug interaction end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const validInput = { status: 'NOT_AVAILABLE', reason: 'NO_VERIFIED_INTERACTION_SOURCE' };
    const result = runDrugInteraction(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-017-drug-interaction').toolId);
    expect(output.toolSlug).toBe('tool-017-drug-interaction');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.status).toBe('NOT_AVAILABLE');
    expect(output.result.reason).toBe('NO_VERIFIED_INTERACTION_SOURCE');

    expect(output.provenance.unit).toBe('status');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'REASON')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = checkDrugInteractions({});
    const output = calculateDrugInteractionOutput({}, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runDrugInteraction(null as unknown, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = drugInteractionInputSchema.tryParse({ status: 'INVALID' as never });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-017-drug-interaction');
    const engineResult = checkDrugInteractions({});
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildDrugInteractionOutput as any)({}, engineResult),
    ).toThrow();
  });
});
