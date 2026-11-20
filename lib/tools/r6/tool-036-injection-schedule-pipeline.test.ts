// lib/tools/r6/tool-036-injection-schedule-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-036 (injection schedule).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runInjectionSchedule,
  calculateInjectionScheduleOutput,
  buildInjectionScheduleOutput,
  injectionScheduleInputSchema,
  type InjectionScheduleInput,
  type InjectionScheduleResult,
} from './tool-036-injection-schedule-pipeline';
import { planInjectionSchedule } from '@/lib/tools/engines/tool-036-injection-schedule';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: InjectionScheduleInput = {
  compounds: [
    {
      name_en: 'Testosterone Enanthate',
      weekly_dose_mg: 500,
      concentration_mg_ml: 250,
      injections_per_week: 2,
      max_ml_per_site: 3,
    },
  ],
  rotation_sites: ['deltoid', 'glute', 'quad'],
};

describe('Slice C — tool-036 injection schedule end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runInjectionSchedule(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-036-injection-schedule').toolId);
    expect(output.toolSlug).toBe('tool-036-injection-schedule');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(Array.isArray(output.result.shots)).toBe(true);
    expect(output.result.shots.length).toBe(2);
    expect(output.result.total_volume_ml_per_week).toBeGreaterThan(0);
    expect(output.result.busiest_day).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(output.result.warnings)).toBe(true);

    expect(output.provenance.unit).toBe('shot');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'SHOT_COUNT')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = planInjectionSchedule(validInput);
    const output = calculateInjectionScheduleOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runInjectionSchedule(null as unknown as InjectionScheduleInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = injectionScheduleInputSchema.tryParse({ ...validInput, compounds: [] });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-036-injection-schedule');
    const engineResult = planInjectionSchedule(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildInjectionScheduleOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
