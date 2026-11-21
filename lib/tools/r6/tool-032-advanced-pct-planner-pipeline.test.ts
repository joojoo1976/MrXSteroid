// lib/tools/r6/tool-032-advanced-pct-planner-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-032 (advanced PCT planner).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runAdvancedPctPlanner,
  calculateAdvancedPctPlannerOutput,
  buildAdvancedPctPlannerOutput,
  advancedPctPlannerInputSchema,
  type PctPlannerInput,
  type PctPlannerResult,
} from './tool-032-advanced-pct-planner-pipeline';
import { planAdvancedPCT } from '@/lib/tools/engines/tool-032-advanced-pct-planner';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: PctPlannerInput = {
  compounds: [
    {
      name_en: 'Testosterone Enanthate',
      ester_half_life_days: 4.5,
      weekly_dose_mg: 500,
      last_dose_date: '2026-09-01',
      suppression_factor: 3,
    },
  ],
  hcg_used_on_cycle: false,
};

describe('Slice C — tool-032 advanced PCT planner end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runAdvancedPctPlanner(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-032-advanced-pct-planner').toolId);
    expect(output.toolSlug).toBe('tool-032-advanced-pct-planner');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.washout_days).toBeGreaterThanOrEqual(0);
    expect(output.result.pct_start_date).toBeDefined();
    expect(output.result.suppression_load).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(output.result.serm_protocol)).toBe(true);
    expect(Array.isArray(output.result.warnings)).toBe(true);

    expect(output.provenance.unit).toBe('day');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'WASHOUT_DAYS')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = planAdvancedPCT(validInput);
    const output = calculateAdvancedPctPlannerOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runAdvancedPctPlanner(null as unknown as PctPlannerInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = advancedPctPlannerInputSchema.tryParse({ ...validInput, compounds: [] });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-032-advanced-pct-planner');
    const engineResult = planAdvancedPCT(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildAdvancedPctPlannerOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
