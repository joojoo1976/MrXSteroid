/**
 * lib/tools/r6/tool-029-side-effect-early-warning-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-029 (G-R6.1-1).
 *
 * End-to-end path for side effect early warning:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: summarizeMeasurementReadingsV7) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { summarizeMeasurementReadingsV7 } from '@/lib/tools/engines/tool-029-side-effect-early-warning';
import {
  MeasurementSummaryInputSchema,
  MeasurementSummaryResultSchema,
  type MeasurementSummaryInput,
  type MeasurementSummaryResult,
} from '@/lib/tools/schemas/tool-029-side-effect-early-warning';

// Input contract + runtime validation boundary (Zod).
export const sideEffectEarlyWarningInputSchema = createToolSchema(MeasurementSummaryInputSchema);

// Canonical unit recorded in provenance.
export const SIDE_EFFECT_EARLY_WARNING_RESULT_UNIT = 'reading';

export interface SideEffectEarlyWarningBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildSideEffectEarlyWarningOutput(
  input: MeasurementSummaryInput,
  engineResult: MeasurementSummaryResult,
  options: SideEffectEarlyWarningBuildOptions,
): ToolOutput<MeasurementSummaryResult> {
  const tool = requireTool('tool-029-side-effect-early-warning');

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
      unit: SIDE_EFFECT_EARLY_WARNING_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.summaries.length,
        unit: 'summaries',
        source: 'descriptive measurement statistics',
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
        code: 'READING_COUNT',
        labelAr: 'عدد القراءات',
        labelEn: 'Reading count',
        value: engineResult.readings.length.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateSideEffectEarlyWarningOutput(
  input: MeasurementSummaryInput,
  options: SideEffectEarlyWarningBuildOptions,
): ToolOutput<MeasurementSummaryResult> {
  return buildSideEffectEarlyWarningOutput(input, summarizeMeasurementReadingsV7(input.readings), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runSideEffectEarlyWarning(
  rawInput: unknown,
  options: SideEffectEarlyWarningBuildOptions,
): | { ok: true; output: ToolOutput<MeasurementSummaryResult> }
  | { ok: false; error: unknown } {
  const parsed = sideEffectEarlyWarningInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildSideEffectEarlyWarningOutput(
    parsed.data,
    summarizeMeasurementReadingsV7(parsed.data.readings),
    options,
  );
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { MeasurementSummaryInput, MeasurementSummaryResult };
