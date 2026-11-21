/**
 * lib/tools/r6/tool-022-half-life-stacker-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-022 (G-R6.1-1).
 *
 * End-to-end path for half-life stacker:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateStackTiming) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateStackTiming } from '@/lib/tools/engines/tool-022-half-life-stacker';
import {
  StackTimingInputSchema,
  StackTimingResultSchema,
  type StackTimingInput,
  type StackTimingResult,
} from '@/lib/tools/schemas/tool-022-half-life-stacker';

// Input contract + runtime validation boundary (Zod).
export const halfLifeStackerInputSchema = createToolSchema(StackTimingInputSchema);

// Canonical unit recorded in provenance.
export const HALF_LIFE_STACKER_RESULT_UNIT = 'day';

export interface HalfLifeStackerBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildHalfLifeStackerOutput(
  input: StackTimingInput,
  engineResult: StackTimingResult,
  options: HalfLifeStackerBuildOptions,
): ToolOutput<StackTimingResult> {
  const tool = requireTool('tool-022-half-life-stacker');

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
      unit: HALF_LIFE_STACKER_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.washout_complete_days,
        unit: 'days',
        source: 'half-life timing arithmetic',
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
        code: 'WASHOUT_DAYS',
        labelAr: 'أيام الغسل',
        labelEn: 'Washout days',
        value: engineResult.washout_complete_days.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateHalfLifeStackerOutput(
  input: StackTimingInput,
  options: HalfLifeStackerBuildOptions,
): ToolOutput<StackTimingResult> {
  return buildHalfLifeStackerOutput(input, calculateStackTiming(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runHalfLifeStacker(
  rawInput: unknown,
  options: HalfLifeStackerBuildOptions,
): | { ok: true; output: ToolOutput<StackTimingResult> }
  | { ok: false; error: unknown } {
  const parsed = halfLifeStackerInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = calculateStackTiming(parsed.data);
  const resultParsed = StackTimingResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildHalfLifeStackerOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { StackTimingInput, StackTimingResult };
