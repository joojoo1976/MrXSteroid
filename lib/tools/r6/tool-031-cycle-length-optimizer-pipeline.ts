/**
 * lib/tools/r6/tool-031-cycle-length-optimizer-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-031 (G-R6.1-1).
 *
 * End-to-end path for cycle length optimizer:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateCycleLength) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateCycleLength } from '@/lib/tools/engines/tool-031-cycle-length-optimizer';
import {
  CycleLengthInputSchema,
  CycleLengthResultSchema,
  type CycleLengthInput,
  type CycleLengthResult,
} from '@/lib/tools/schemas/tool-031-cycle-length-optimizer';

// Input contract + runtime validation boundary (Zod).
export const cycleLengthOptimizerInputSchema = createToolSchema(CycleLengthInputSchema);

// Canonical unit recorded in provenance.
export const CYCLE_LENGTH_RESULT_UNIT = 'week';

export interface CycleLengthOptimizerBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildCycleLengthOptimizerOutput(
  input: CycleLengthInput,
  engineResult: CycleLengthResult,
  options: CycleLengthOptimizerBuildOptions,
): ToolOutput<CycleLengthResult> {
  const tool = requireTool('tool-031-cycle-length-optimizer');

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
      unit: CYCLE_LENGTH_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: engineResult.min_weeks,
        high: engineResult.max_weeks,
        unit: 'weeks',
        source: 'cycle length optimization formula',
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
        code: 'OPTIMAL_WEEKS',
        labelAr: 'المدة المثلى',
        labelEn: 'Optimal weeks',
        value: engineResult.optimal_weeks.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateCycleLengthOptimizerOutput(
  input: CycleLengthInput,
  options: CycleLengthOptimizerBuildOptions,
): ToolOutput<CycleLengthResult> {
  return buildCycleLengthOptimizerOutput(input, calculateCycleLength(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runCycleLengthOptimizer(
  rawInput: unknown,
  options: CycleLengthOptimizerBuildOptions,
): | { ok: true; output: ToolOutput<CycleLengthResult> }
  | { ok: false; error: unknown } {
  const parsed = cycleLengthOptimizerInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildCycleLengthOptimizerOutput(parsed.data, calculateCycleLength(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { CycleLengthInput, CycleLengthResult };
