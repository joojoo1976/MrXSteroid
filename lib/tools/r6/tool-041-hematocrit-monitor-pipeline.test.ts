// lib/tools/r6/tool-041-hematocrit-monitor-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-041 (hematocrit monitor).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runHematocritMonitor,
  calculateHematocritMonitorOutput,
  buildHematocritMonitorOutput,
  hematocritMonitorInputSchema,
  type HematocritInput,
  type HematocritResult,
} from './tool-041-hematocrit-monitor-pipeline';
import { monitorHematocrit } from '@/lib/tools/engines/tool-041-hematocrit-monitor';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: HematocritInput = {
  readings: [
    { hct_pct: 42, date: '2026-08-01' },
    { hct_pct: 45, date: '2026-08-15' },
    { hct_pct: 48, date: '2026-09-01' },
  ],
  sex: 'male',
  on_cycle: true,
  weeks_remaining: 6,
};

describe('Slice C — tool-041 hematocrit monitor end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runHematocritMonitor(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-041-hematocrit-monitor').toolId);
    expect(output.toolSlug).toBe('tool-041-hematocrit-monitor');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.latest_hct_pct).toBe(48);
    expect(output.result.baseline_hct_pct).toBe(42);
    expect(output.result.band).toBeDefined();
    expect(Array.isArray(output.result.warnings)).toBe(true);

    expect(output.provenance.unit).toBe('percent');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'LATEST_HCT')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = monitorHematocrit(validInput);
    const output = calculateHematocritMonitorOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runHematocritMonitor(null as unknown as HematocritInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = hematocritMonitorInputSchema.tryParse({ readings: [], sex: 'male', on_cycle: false, weeks_remaining: 0 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-041-hematocrit-monitor');
    const engineResult = monitorHematocrit(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildHematocritMonitorOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
