// lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-043 (prolactin management).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runProlactinManagement,
  calculateProlactinManagementOutput,
  buildProlactinManagementOutput,
  prolactinManagementInputSchema,
  type ProlactinInput,
  type ProlactinResult,
} from './tool-043-prolactin-management-pipeline';
import { manageProlactin } from '@/lib/tools/engines/tool-043-prolactin-management';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: ProlactinInput = {
  prolactin_ng_ml: 28,
  uses_19_nor: true,
  weekly_cabergoline_mcg: 0,
  symptoms: ['libido_loss'],
};

describe('Slice C — tool-043 prolactin management end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runProlactinManagement(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-043-prolactin-management').toolId);
    expect(output.toolSlug).toBe('tool-043-prolactin-management');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.band).toBeDefined();
    expect(output.result.suggested_weekly_mcg).toBeDefined();
    expect(output.result.action).toBeDefined();
    expect(Array.isArray(output.result.warnings)).toBe(true);

    expect(output.provenance.unit).toBe('ng/mL');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'SUGGESTED_WEEKLY_MCG')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = manageProlactin(validInput);
    const output = calculateProlactinManagementOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runProlactinManagement(null as unknown as ProlactinInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = prolactinManagementInputSchema.tryParse({ ...validInput, prolactin_ng_ml: 0 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-043-prolactin-management');
    const engineResult = manageProlactin(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildProlactinManagementOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
