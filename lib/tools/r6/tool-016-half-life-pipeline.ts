/**
 * lib/tools/r6/tool-016-half-life-pipeline.ts
 * Slice C pilot (G-R6.1-1): end-to-end integration path for an existing V6
 * deterministic engine.
 *
 * Input Contract (Zod, via schema-contract) ->
 * Runtime Validation ->
 * Unit Normalization (metadata only; the V6 engine works in days and performs
 * no cross-unit conversion) ->
 * Existing V6 Engine (authoritative, unmodified) ->
 * Output Validation (fail-fast ToolOutput envelope) ->
 * Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses the canonical contracts only (no new contract
 * system). Does not modify the existing tracked adapter or engine.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateHalfLife } from '@/lib/tools/engines/tool-016-half-life-calculator';
import {
  HalfLifeInputSchema,
  type HalfLifeInput,
  type HalfLifeResult,
} from '@/lib/tools/schemas/tool-016-half-life-calculator';

// Input contract + runtime validation boundary (Zod).
export const r6HalfLifeInputSchema = createToolSchema(HalfLifeInputSchema);

// Canonical unit recorded in provenance (engine works in days; no conversion
// applied by the engine, so no unit-system conversion is needed here).
export const R6_HALF_LIFE_RESULT_UNIT = 'day';

export interface R6HalfLifeBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function r6BuildHalfLifeOutput(
  input: HalfLifeInput,
  engineResult: HalfLifeResult,
  options: R6HalfLifeBuildOptions,
): ToolOutput<HalfLifeResult> {
  const tool = requireTool('tool-016-half-life-calculator');

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
      unit: R6_HALF_LIFE_RESULT_UNIT,
      confidence: 1,
      dataQuality: 'high',
      referenceRange: {
        low: 0,
        high: 100,
        unit: '%',
        source: 'remaining_percent input domain',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: engineResult.status,
        severity: 'info',
      },
      {
        code: 'MODEL',
        labelAr: 'النموذج',
        labelEn: 'Model',
        value: engineResult.model,
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function r6CalculateHalfLifeOutput(
  input: HalfLifeInput,
  options: R6HalfLifeBuildOptions,
): ToolOutput<HalfLifeResult> {
  return r6BuildHalfLifeOutput(input, calculateHalfLife(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function r6RunHalfLife(
  rawInput: unknown,
  options: R6HalfLifeBuildOptions,
):
  | { ok: true; output: ToolOutput<HalfLifeResult> }
  | { ok: false; error: unknown } {
  const parsed = r6HalfLifeInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = r6BuildHalfLifeOutput(parsed.data, calculateHalfLife(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { HalfLifeInput, HalfLifeResult };
