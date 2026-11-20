// lib/tools/r6/tool-030-cycle-cost-calculator-pipeline.test.ts
// Slice C pilot — V6 engine integration for tool-030 (cycle cost calculator).
// Verifies the end-to-end path Input Contract -> Runtime Validation -> V6
// Engine -> Output Validation -> Structured ToolOutput. Additive module:
// touches no tracked files.
import { describe, it, expect } from 'vitest';
import { isToolOutput, type ToolOutput } from '@/lib/tools/contracts';
import { requireTool } from '@/lib/tools/registry';
import {
  runCycleCostCalculator,
  calculateCycleCostCalculatorOutput,
  buildCycleCostCalculatorOutput,
  cycleCostCalculatorInputSchema,
  type CycleCostInput,
  type CycleCostResult,
} from './tool-030-cycle-cost-calculator-pipeline';
import { calculateCycleCost } from '@/lib/tools/engines/tool-030-cycle-cost-calculator';

const options = {
  calculatedAt: '2026-09-21T10:00:00.000Z',
  recordedAt: '2026-09-21T09:00:00.000Z',
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
};

const validInput: CycleCostInput = {
  cycle_weeks: 12,
  compounds: [
    {
      id: 1,
      name_en: 'Testosterone Enanthate',
      name_ar: 'التستوستيرون إينانتات',
      total_cost_usd: 150,
    },
  ],
  pct_duration_weeks: 4,
  ancillary_compounds: [],
};

describe('Slice C — tool-030 cycle cost calculator end-to-end integration', () => {
  it('valid input produces a contract-valid ToolOutput from the V6 engine', () => {
    const result = runCycleCostCalculator(validInput, options);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    const { output } = result;

    expect(isToolOutput(output)).toBe(true);
    expect(output.toolId).toBe(requireTool('tool-030-cycle-cost-calculator').toolId);
    expect(output.toolSlug).toBe('tool-030-cycle-cost-calculator');
    expect(output.calculatedAt).toBe(options.calculatedAt);
    expect(output.locale).toBe('en');
    expect(output.unitSystem).toBe('metric');
    expect(output.snapshotType).toBe('draft');

    expect(output.result.total_compound_cost_usd).toBe(150);
    expect(output.result.grand_total_usd).toBeGreaterThan(0);
    expect(output.result.cost_per_week_usd).toBeGreaterThan(0);
    expect(output.result.most_expensive_compound).toBe('Testosterone Enanthate');
    expect(Array.isArray(output.result.budget_savings_tips)).toBe(true);

    expect(output.provenance.unit).toBe('usd');
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.source).toBe('manual');

    expect(output.keyFindings.some((f) => f.code === 'RESULT_STATUS')).toBe(true);
    expect(output.keyFindings.some((f) => f.code === 'GRAND_TOTAL')).toBe(true);
  });

  it('matches the standalone V6 engine output exactly (engine is authoritative)', () => {
    const engineResult = calculateCycleCost(validInput);
    const output = calculateCycleCostCalculatorOutput(validInput, options);
    expect(output.result).toEqual(engineResult);
  });

  it('invalid input fails safely with a structured error (no throw, no partial output)', () => {
    const result = runCycleCostCalculator(null as unknown as CycleCostInput, options);
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid input at the schema boundary before the engine runs', () => {
    const parsed = cycleCostCalculatorInputSchema.tryParse({ ...validInput, cycle_weeks: 0 });
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  it('createToolOutput rejects a malformed envelope (runtime validation guard)', () => {
    const tool = requireTool('tool-030-cycle-cost-calculator');
    const engineResult = calculateCycleCost(validInput);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (buildCycleCostCalculatorOutput as any)(validInput, engineResult),
    ).toThrow();
  });
});
