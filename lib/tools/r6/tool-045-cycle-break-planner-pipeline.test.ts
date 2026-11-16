// lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-045 (cycle break planner).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked engine, schema or adapter file.
import { describe, it, expect } from 'vitest';
import { isToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runCycleBreakPlanner,
  calculateCycleBreakOutput,
  buildCycleBreakOutput,
  cycleBreakPlannerInputSchema,
  type CycleBreakInput,
  type CycleBreakResult,
} from './tool-045-cycle-break-planner-pipeline';
import { planCycleBreak } from '@/lib/tools/engines/tool-045-cycle-break-planner';

const options = {
  calculatedAt: '2026-11-16T10:00:00.000Z',
  recordedAt: '2026-11-16T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: CycleBreakInput = {
  cycle_weeks_used: 12,
  compounds: [
    { name_en: 'Testosterone Enanthate', half_life_days: 4.5, suppression_factor: 2 },
  ],
  wants_bloodwork: true,
};

describe('Slice C — tool-045 cycle break planner end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runCycleBreakPlanner(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-045-cycle-break-planner').toolId);
    expect(output.toolSlug).toBe('tool-045-cycle-break-planner');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(typeof output.result.days_to_full_clear).toBe('number');
    expect(typeof output.result.pct_start_day).toBe('number');
    expect(typeof output.result.pct_duration_weeks).toBe('number');
    expect(Array.isArray(output.result.recovery_milestones)).toBe(true);
    expect(typeof output.result.total_weeks_to_baseline).toBe('number');
    expect(Array.isArray(output.result.warnings)).toBe(true);

    expect(output.provenance.unit).toBe('days');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((finding) => finding.code === 'CLEAR_DAYS')).toBe(true);
    expect(output.keyFindings.some((finding) => finding.code === 'PCT_WINDOW')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = planCycleBreak(validInput);
    const output = calculateCycleBreakOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runCycleBreakPlanner(null as unknown as CycleBreakInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = cycleBreakPlannerInputSchema.tryParse({ ...validInput, cycle_weeks_used: 3 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const engineResult = planCycleBreak(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildCycleBreakOutput as any)(validInput, engineResult),
    ).toThrow();
  });

  it('keeps the engine result type stable for the pipeline export', () => {
    const engineResult: CycleBreakResult = planCycleBreak(validInput);
    expect(engineResult.days_to_full_clear).toBe(23);
    expect(engineResult.pct_start_day).toBe(30);
    expect(engineResult.pct_duration_weeks).toBe(6);
    expect(engineResult.total_weeks_to_baseline).toBe(15);
  });
});
