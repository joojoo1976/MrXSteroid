/**
 * lib/tools/r6/tool-032-advanced-pct-planner-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-032 (G-R6.1-1).
 *
 * End-to-end path for advanced PCT planner:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: planAdvancedPCT) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { planAdvancedPCT } from '@/lib/tools/engines/tool-032-advanced-pct-planner';
import {
  PctPlannerInputSchema,
  PctPlannerResultSchema,
  type PctPlannerInput,
  type PctPlannerResult,
} from '@/lib/tools/schemas/tool-032-advanced-pct-planner';

// Input contract + runtime validation boundary (Zod).
export const advancedPctPlannerInputSchema = createToolSchema(PctPlannerInputSchema);

// Canonical unit recorded in provenance.
export const ADVANCED_PCT_PLANNER_RESULT_UNIT = 'day';

export interface AdvancedPctPlannerBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildAdvancedPctPlannerOutput(
  input: PctPlannerInput,
  engineResult: PctPlannerResult,
  options: AdvancedPctPlannerBuildOptions,
): ToolOutput<PctPlannerResult> {
  const tool = requireTool('tool-032-advanced-pct-planner');

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
      unit: ADVANCED_PCT_PLANNER_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.washout_days,
        unit: 'days',
        source: 'PCT washout calculation',
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
        value: engineResult.washout_days.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateAdvancedPctPlannerOutput(
  input: PctPlannerInput,
  options: AdvancedPctPlannerBuildOptions,
): ToolOutput<PctPlannerResult> {
  return buildAdvancedPctPlannerOutput(input, planAdvancedPCT(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runAdvancedPctPlanner(
  rawInput: unknown,
  options: AdvancedPctPlannerBuildOptions,
): | { ok: true; output: ToolOutput<PctPlannerResult> }
  | { ok: false; error: unknown } {
  const parsed = advancedPctPlannerInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildAdvancedPctPlannerOutput(parsed.data, planAdvancedPCT(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { PctPlannerInput, PctPlannerResult };
