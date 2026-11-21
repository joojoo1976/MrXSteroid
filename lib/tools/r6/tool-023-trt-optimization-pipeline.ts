/**
 * lib/tools/r6/tool-023-trt-optimization-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-023 (G-R6.1-1).
 *
 * End-to-end path for TRT optimization:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateTrtOptimization) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateTrtOptimization } from '@/lib/tools/engines/tool-023-trt-optimization';
import {
  TrtInputSchema,
  TrtResultSchema,
  type TrtInput,
  type TrtResult,
} from '@/lib/tools/schemas/tool-023-trt-optimization';

// Input contract + runtime validation boundary (Zod).
export const trtOptimizationInputSchema = createToolSchema(TrtInputSchema);

// Canonical unit recorded in provenance.
export const TRT_RESULT_UNIT = 'mg/week';

export interface TrtOptimizationBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildTrtOptimizationOutput(
  input: TrtInput,
  engineResult: TrtResult,
  options: TrtOptimizationBuildOptions,
): ToolOutput<TrtResult> {
  const tool = requireTool('tool-023-trt-optimization');

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
      unit: TRT_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 200,
        unit: 'mg/week',
        source: 'TRT optimization engine',
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
        code: 'RECOMMENDED_DOSE',
        labelAr: 'الجرعة الموصى بها',
        labelEn: 'Recommended dose',
        value: `${engineResult.recommended_dose_mg_weekly} mg/week`,
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateTrtOptimizationOutput(
  input: TrtInput,
  options: TrtOptimizationBuildOptions,
): ToolOutput<TrtResult> {
  return buildTrtOptimizationOutput(input, calculateTrtOptimization(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runTrtOptimization(
  rawInput: unknown,
  options: TrtOptimizationBuildOptions,
): | { ok: true; output: ToolOutput<TrtResult> }
  | { ok: false; error: unknown } {
  const parsed = trtOptimizationInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = calculateTrtOptimization(parsed.data);
  const resultParsed = TrtResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildTrtOptimizationOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { TrtInput, TrtResult };
