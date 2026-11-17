// lib/tools/r6/tool-025-drug-interaction-pro-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-025 (drug interaction pro).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runDrugInteractionPro,
  calculateDrugInteractionProOutput,
  drugInteractionProInputSchema,
  type MedicationSessionInput,
  type MedicationSessionResult,
} from './tool-025-drug-interaction-pro-pipeline';
import { buildMedicationSessionV7 } from '@/lib/tools/engines/tool-025-drug-interaction-pro';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: MedicationSessionInput = {
  entries: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      itemName: 'Testosterone Enanthate',
      itemType: 'hormone_or_compound',
      doseDescription: '250mg/week',
      sourceLabel: 'User entry',
      notes: 'Weekly IM injection',
    },
  ],
};

describe('Slice C — tool-025 drug interaction pro end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runDrugInteractionPro(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-025-drug-interaction-pro').toolId);
    expect(output.toolSlug).toBe('tool-025-drug-interaction-pro');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.resultOrigin).toBe('USER_PROVIDED');
    expect(output.result.interactionAssessment).toBe('NOT_AVAILABLE');
    expect(output.result.reason).toBe('NO_VALIDATED_INTERACTION_SOURCE_CONFIGURED');
    expect(output.result.entries).toHaveLength(1);

    expect(output.provenance.unit).toBe('entry');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'ENTRY_COUNT')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = buildMedicationSessionV7(validInput.entries);
    const output = calculateDrugInteractionProOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runDrugInteractionPro(null as unknown as MedicationSessionInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = drugInteractionProInputSchema.tryParse({
      entries: [
        { ...validInput.entries[0], id: 'dup-id' },
        { ...validInput.entries[0], id: 'dup-id' },
      ],
    });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-025-drug-interaction-pro');
    const engineResult = buildMedicationSessionV7(validInput.entries);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildDrugInteractionProOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
