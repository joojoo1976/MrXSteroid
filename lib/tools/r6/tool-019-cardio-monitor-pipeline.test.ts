// lib/tools/r6/tool-019-cardio-monitor-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-019 (cardio monitor).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runCardioMonitor,
  calculateCardioMonitorOutput,
  buildCardioMonitorOutput,
  cardioMonitorInputSchema,
  type CardioInput,
  type CardioRisk,
} from './tool-019-cardio-monitor-pipeline';
import { calculateCardioRisk } from '@/lib/tools/engines/tool-019-cardio-monitor';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: CardioInput = {
  systolic_bp: 120,
  diastolic_bp: 80,
  heart_rate: 70,
  cholesterol_total: 200,
  hdl_cholesterol: 50,
  compounds: [
    { name_en: 'Testosterone', is_lipophilic: true, aromatization_factor: 0.8 },
  ],
  cycle_length_weeks: 12,
};

describe('Slice C — tool-019 cardio monitor end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runCardioMonitor(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-019-cardio-monitor').toolId);
    expect(output.toolSlug).toBe('tool-019-cardio-monitor');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.overall_risk).toBeDefined();
    expect(output.result.risk_score).toBeGreaterThanOrEqual(0);
    expect(output.result.cholesterol_ratio).toBeGreaterThan(0);
    expect(Array.isArray(output.result.risk_factors)).toBe(true);
    expect(Array.isArray(output.result.compound_warnings)).toBe(true);
    expect(Array.isArray(output.result.recommendations)).toBe(true);

    expect(output.provenance.unit).toBe('score');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'RISK_SCORE')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateCardioRisk(validInput);
    const output = calculateCardioMonitorOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runCardioMonitor(null as unknown as CardioInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = cardioMonitorInputSchema.tryParse({ systolic_bp: -1 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-019-cardio-monitor');
    const engineResult = calculateCardioRisk(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildCardioMonitorOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
