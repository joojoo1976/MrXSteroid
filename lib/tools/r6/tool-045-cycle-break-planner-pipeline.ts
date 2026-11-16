/**
 * lib/tools/r6/tool-045-cycle-break-planner-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-045 (G-R6.1-1).
 *
 * End-to-end path for the cycle break planner:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: planCycleBreak) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only. The engine, schema and
 * legacy adapter are not edited here.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { planCycleBreak, type CycleBreakResult } from '@/lib/tools/engines/tool-045-cycle-break-planner';
import {
  CycleBreakInputSchema,
  type CycleBreakInput,
} from '@/lib/tools/schemas/tool-045-cycle-break-planner';

// Input contract + runtime validation boundary (Zod).
export const cycleBreakPlannerInputSchema = createToolSchema(CycleBreakInputSchema);

// Canonical unit recorded in provenance.
export const CYCLE_BREAK_RESULT_UNIT = 'days';

export interface CycleBreakBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildCycleBreakOutput(
  input: CycleBreakInput,
  engineResult: CycleBreakResult,
  options: CycleBreakBuildOptions,
): ToolOutput<CycleBreakResult> {
  const tool = requireTool('tool-045-cycle-break-planner');

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
      unit: CYCLE_BREAK_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 1,
        high: 365,
        unit: 'days',
        source: 'cycle break planner engine',
      },
    },
    keyFindings: [
      {
        code: 'CLEAR_DAYS',
        labelAr: 'أيام التطهير الكامل',
        labelEn: 'Days to full clearance',
        value: String(engineResult.days_to_full_clear),
        severity: engineResult.warnings.length > 0 ? 'monitor' : 'info',
      },
      {
        code: 'PCT_WINDOW',
        labelAr: 'نافذة ما بعد الدورة',
        labelEn: 'PCT window',
        value: `day ${engineResult.pct_start_day} / ${engineResult.pct_duration_weeks} weeks`,
        severity: engineResult.warnings.length > 0 ? 'monitor' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateCycleBreakOutput(
  input: CycleBreakInput,
  options: CycleBreakBuildOptions,
): ToolOutput<CycleBreakResult> {
  return buildCycleBreakOutput(input, planCycleBreak(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runCycleBreakPlanner(
  rawInput: unknown,
  options: CycleBreakBuildOptions,
): | { ok: true; output: ToolOutput<CycleBreakResult> }
  | { ok: false; error: unknown } {
  const parsed = cycleBreakPlannerInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildCycleBreakOutput(parsed.data, planCycleBreak(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { CycleBreakInput, CycleBreakResult };
