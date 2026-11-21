// lib/tools/r6/tool-028-stacking-synergy-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-028 (stacking synergy).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runStackingSynergy,
  calculateStackingSynergyOutput,
  stackingSynergyInputSchema,
  type StackComparisonInput,
  type StackComparisonResult,
} from './tool-028-stacking-synergy-pipeline';
import { buildStackComparisonWorksheetV7 } from '@/lib/tools/engines/tool-028-stacking-synergy';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: StackComparisonInput = {
  scenarioA: {
    name: 'Stack A',
    items: ['Testosterone', 'Anavar'],
    notes: 'Baseline stack',
  },
  scenarioB: {
    name: 'Stack B',
    items: ['Testosterone', 'Winstrol'],
    notes: 'Cutting stack',
  },
};

describe('Slice C — tool-028 stacking synergy end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runStackingSynergy(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-028-stacking-synergy').toolId);
    expect(output.toolSlug).toBe('tool-028-stacking-synergy');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.resultOrigin).toBe('USER_PROVIDED');
    expect(output.result.assessment).toBe('NOT_AVAILABLE');
    expect(output.result.reason).toBe('NO_VALIDATED_COMPATIBILITY_SOURCE_CONFIGURED');
    expect(output.result.scenarioA.name).toBe('Stack A');
    expect(output.result.scenarioB.name).toBe('Stack B');

    expect(output.provenance.unit).toBe('scenario');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'SCENARIO_COUNT')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = buildStackComparisonWorksheetV7(validInput);
    const output = calculateStackingSynergyOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runStackingSynergy(null as unknown as StackComparisonInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = stackingSynergyInputSchema.tryParse({
      scenarioA: { name: '', items: [], notes: '' },
      scenarioB: validInput.scenarioB,
    });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-028-stacking-synergy');
    const engineResult = buildStackComparisonWorksheetV7(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildStackingSynergyOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
