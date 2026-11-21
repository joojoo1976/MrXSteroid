/**
 * lib/tools/r6/tool-030-cycle-cost-calculator-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-030 (G-R6.1-1).
 *
 * End-to-end path for cycle cost calculator:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateCycleCost) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateCycleCost } from '@/lib/tools/engines/tool-030-cycle-cost-calculator';
import {
  CycleCostInputSchema,
  CycleCostResultSchema,
  type CycleCostInput,
  type CycleCostResult,
} from '@/lib/tools/schemas/tool-030-cycle-cost-calculator';

// Input contract + runtime validation boundary (Zod).
export const cycleCostCalculatorInputSchema = createToolSchema(CycleCostInputSchema);

// Canonical unit recorded in provenance.
export const CYCLE_COST_RESULT_UNIT = 'usd';

export interface CycleCostCalculatorBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildCycleCostCalculatorOutput(
  input: CycleCostInput,
  engineResult: CycleCostResult,
  options: CycleCostCalculatorBuildOptions,
): ToolOutput<CycleCostResult> {
  const tool = requireTool('tool-030-cycle-cost-calculator');

  return createToolOutput({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    accessTier: tool.accessTier,
    snapshotType: options.snapshotType,
    result: engineResult,
    provenance: {
      source: options.source ?? 'manual',
      recordedAt: options.recordedAt,
      timezone: options.timezone ?? 'UTC',
      unit: CYCLE_COST_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.grand_total_usd,
        unit: 'usd',
        source: 'cycle cost arithmetic',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: 'CALCULATED',
        severity: 'info',
      },
      {
        code: 'GRAND_TOTAL',
        labelAr: 'الإجمالي الكلي',
        labelEn: 'Grand total',
        value: `$${engineResult.grand_total_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateCycleCostCalculatorOutput(
  input: CycleCostInput,
  options: CycleCostCalculatorBuildOptions,
): ToolOutput<CycleCostResult> {
  return buildCycleCostCalculatorOutput(input, calculateCycleCost(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runCycleCostCalculator(
  rawInput: unknown,
  options: CycleCostCalculatorBuildOptions,
): | { ok: true; output: ToolOutput<CycleCostResult> }
  | { ok: false; error: unknown } {
  const parsed = cycleCostCalculatorInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildCycleCostCalculatorOutput(parsed.data, calculateCycleCost(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { CycleCostInput, CycleCostResult };
