/**
 * lib/tools/r6/tool-012-calorie-adjuster-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-012 (G-R6.1-1).
 *
 * End-to-end path for calorie adjuster:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateTDEE) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only (createToolSchema,
 * createToolOutput, isToolOutput). Does not modify the existing engine,
 * schema, registry, or page component.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateTDEE } from '@/lib/tools/engines/tool-012-calorie-adjuster';
import {
  CalorieInputSchema,
  type CalorieInput,
  type CalorieResult,
} from '@/lib/tools/schemas/tool-012-calorie-adjuster';

// Input contract + runtime validation boundary (Zod).
export const calorieAdjusterInputSchema = createToolSchema(CalorieInputSchema);

// Canonical unit recorded in provenance.
export const CALORIE_ADJUSTER_RESULT_UNIT = 'kcal/day';

export interface CalorieAdjusterBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildCalorieAdjusterOutput(
  input: CalorieInput,
  engineResult: CalorieResult,
  options: CalorieAdjusterBuildOptions,
): ToolOutput<CalorieResult> {
  const tool = requireTool('tool-012-calorie-adjuster');

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
      unit: CALORIE_ADJUSTER_RESULT_UNIT,
      confidence: 1,
      dataQuality: 'high',
      referenceRange: {
        low: engineResult.tdee_range[0],
        high: engineResult.tdee_range[1],
        unit: 'kcal/day',
        source: 'Mifflin-St Jeor BMR × activity multiplier; fixed ±100 model range',
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
        code: 'ESTIMATED_TDEE',
        labelAr: 'إنفاق الطاقة اليومي التقديري',
        labelEn: 'Estimated daily energy expenditure',
        value: `${engineResult.tdee} kcal/day`,
        severity: 'info',
      },
      {
        code: 'TARGET_CALORIES',
        labelAr: 'الهدف الحسابي',
        labelEn: 'Calculated target',
        value: `${engineResult.target_calories} kcal/day`,
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateCalorieAdjusterOutput(
  input: CalorieInput,
  options: CalorieAdjusterBuildOptions,
): ToolOutput<CalorieResult> {
  return buildCalorieAdjusterOutput(input, calculateTDEE(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runCalorieAdjuster(
  rawInput: unknown,
  options: CalorieAdjusterBuildOptions,
):
  | { ok: true; output: ToolOutput<CalorieResult> }
  | { ok: false; error: unknown } {
  const parsed = calorieAdjusterInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildCalorieAdjusterOutput(parsed.data, calculateTDEE(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { CalorieInput, CalorieResult };
