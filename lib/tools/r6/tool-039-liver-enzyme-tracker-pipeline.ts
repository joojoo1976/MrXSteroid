/**
 * lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-039 (G-R6.1-1).
 *
 * End-to-end path for liver enzyme tracker:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: trackLiverEnzymes) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { trackLiverEnzymes } from '@/lib/tools/engines/tool-039-liver-enzyme-tracker';
import {
  LiverTrackerInputSchema,
  LiverTrackerResultSchema,
  type LiverTrackerInput,
  type LiverTrackerResult,
} from '@/lib/tools/schemas/tool-039-liver-enzyme-tracker';

// Input contract + runtime validation boundary (Zod).
export const liverEnzymeTrackerInputSchema = createToolSchema(LiverTrackerInputSchema);

// Canonical unit recorded in provenance.
export const LIVER_ENZYME_RESULT_UNIT = 'marker';

export interface LiverEnzymeTrackerBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildLiverEnzymeTrackerOutput(
  input: LiverTrackerInput,
  engineResult: LiverTrackerResult,
  options: LiverEnzymeTrackerBuildOptions,
): ToolOutput<LiverTrackerResult> {
  const tool = requireTool('tool-039-liver-enzyme-tracker');

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
      unit: LIVER_ENZYME_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.markers.length,
        unit: 'markers',
        source: 'liver enzyme tracker',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: 'CALCULATED',
        severity: engineResult.overall_status === 'critical' ? 'important' : 'info',
      },
      {
        code: 'OVERALL_STATUS',
        labelAr: 'الحالة الإجمالية',
        labelEn: 'Overall status',
        value: engineResult.overall_status,
        severity: engineResult.overall_status === 'critical' ? 'important' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateLiverEnzymeTrackerOutput(
  input: LiverTrackerInput,
  options: LiverEnzymeTrackerBuildOptions,
): ToolOutput<LiverTrackerResult> {
  return buildLiverEnzymeTrackerOutput(input, trackLiverEnzymes(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runLiverEnzymeTracker(
  rawInput: unknown,
  options: LiverEnzymeTrackerBuildOptions,
): | { ok: true; output: ToolOutput<LiverTrackerResult> }
  | { ok: false; error: unknown } {
  const parsed = liverEnzymeTrackerInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildLiverEnzymeTrackerOutput(parsed.data, trackLiverEnzymes(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { LiverTrackerInput, LiverTrackerResult };
