/**
 * lib/tools/r6/tool-011-progress-tracker-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-011 (G-R6.1-1).
 *
 * End-to-end path for progress tracker:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateProgress) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { z } from 'zod';
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateProgress } from '@/lib/tools/engines/tool-011-progress-tracker';
import {
  ProgressEntrySchema,
  ProgressTrendSchema,
  type ProgressEntry,
  type ProgressTrend,
} from '@/lib/tools/schemas/tool-011-progress-tracker';

// Input contract + runtime validation boundary (Zod).
export const progressTrackerInputSchema = createToolSchema(z.array(ProgressEntrySchema));

// Canonical unit recorded in provenance.
export const PROGRESS_RESULT_UNIT = 'trend';

export interface ProgressTrackerBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildProgressTrackerOutput(
  input: ProgressEntry[],
  engineResult: ProgressTrend[],
  options: ProgressTrackerBuildOptions,
): ToolOutput<ProgressTrend[]> {
  const tool = requireTool('tool-011-progress-tracker');

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
      unit: PROGRESS_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.length,
        unit: 'trends',
        source: 'user-entered progress entries',
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
        code: 'TREND_COUNT',
        labelAr: 'عدد الاتجاهات',
        labelEn: 'Trend count',
        value: engineResult.length.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateProgressTrackerOutput(
  input: ProgressEntry[],
  options: ProgressTrackerBuildOptions,
): ToolOutput<ProgressTrend[]> {
  return buildProgressTrackerOutput(input, calculateProgress(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runProgressTracker(
  rawInput: unknown,
  options: ProgressTrackerBuildOptions,
): | { ok: true; output: ToolOutput<ProgressTrend[]> }
  | { ok: false; error: unknown } {
  const parsed = progressTrackerInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildProgressTrackerOutput(parsed.data, calculateProgress(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { ProgressEntry, ProgressTrend };
