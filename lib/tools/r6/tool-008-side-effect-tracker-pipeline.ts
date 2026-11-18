/**
 * lib/tools/r6/tool-007-side-effect-tracker-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-008 (G-R6.1-1).
 *
 * End-to-end path for side effect tracker:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { SideEffectLogSchema, type SideEffectLog } from '@/lib/tools/schemas/tool-008-side-effect-tracker';

// Input contract + runtime validation boundary (Zod).
export const sideEffectTrackerInputSchema = createToolSchema(SideEffectLogSchema);

// Canonical unit recorded in provenance.
export const SIDE_EFFECT_RESULT_UNIT = 'log_entry';

export interface SideEffectTrackerBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildSideEffectTrackerOutput(
  input: SideEffectLog,
  engineResult: SideEffectLog,
  options: SideEffectTrackerBuildOptions,
): ToolOutput<SideEffectLog> {
  const tool = requireTool('tool-008-side-effect-tracker');

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
      unit: SIDE_EFFECT_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 500,
        unit: 'log_entries',
        source: 'user-entered side effect log',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: 'LOGGED',
        severity: 'info',
      },
      {
        code: 'LOG_COUNT',
        labelAr: 'عدد السجلات',
        labelEn: 'Log entry count',
        value: '1',
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateSideEffectTrackerOutput(
  input: SideEffectLog,
  options: SideEffectTrackerBuildOptions,
): ToolOutput<SideEffectLog> {
  return buildSideEffectTrackerOutput(input, input, options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runSideEffectTracker(
  rawInput: unknown,
  options: SideEffectTrackerBuildOptions,
):
  | { ok: true; output: ToolOutput<SideEffectLog> }
  | { ok: false; error: unknown } {
  const parsed = sideEffectTrackerInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = parsed.data;
  const resultParsed = SideEffectLogSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildSideEffectTrackerOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { SideEffectLog };
