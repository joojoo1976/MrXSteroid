/**
 * lib/tools/r6/tool-033-bloodwork-trend-analyzer-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-033 (G-R6.1-1).
 *
 * End-to-end path for bloodwork trend analyzer:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: analyzeBloodworkTrends) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { analyzeBloodworkTrends } from '@/lib/tools/engines/tool-033-bloodwork-trend-analyzer';
import {
  TrendAnalyzerInputSchema,
  TrendAnalyzerResultSchema,
  type TrendAnalyzerInput,
  type TrendAnalyzerResult,
} from '@/lib/tools/schemas/tool-033-bloodwork-trend-analyzer';

// Input contract + runtime validation boundary (Zod).
export const bloodworkTrendAnalyzerInputSchema = createToolSchema(TrendAnalyzerInputSchema);

// Canonical unit recorded in provenance.
export const BLOODWORK_TREND_RESULT_UNIT = 'marker';

export interface BloodworkTrendAnalyzerBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildBloodworkTrendAnalyzerOutput(
  input: TrendAnalyzerInput,
  engineResult: TrendAnalyzerResult,
  options: BloodworkTrendAnalyzerBuildOptions,
): ToolOutput<TrendAnalyzerResult> {
  const tool = requireTool('tool-033-bloodwork-trend-analyzer');

  const risingCount = engineResult.markers.filter((m) => m.direction === 'rising').length;
  const fallingCount = engineResult.markers.filter((m) => m.direction === 'falling').length;
  const stableCount = engineResult.markers.filter((m) => m.direction === 'stable').length;

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
      unit: BLOODWORK_TREND_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.markers.length,
        unit: 'markers',
        source: 'least-squares trend analysis',
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
        code: 'MARKER_COUNT',
        labelAr: 'عدد المؤشرات',
        labelEn: 'Marker count',
        value: engineResult.markers.length.toString(),
        severity: 'info',
      },
      {
        code: 'RISING_COUNT',
        labelAr: 'الصاعد',
        labelEn: 'Rising count',
        value: risingCount.toString(),
        severity: risingCount > 0 ? 'important' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateBloodworkTrendAnalyzerOutput(
  input: TrendAnalyzerInput,
  options: BloodworkTrendAnalyzerBuildOptions,
): ToolOutput<TrendAnalyzerResult> {
  return buildBloodworkTrendAnalyzerOutput(input, analyzeBloodworkTrends(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runBloodworkTrendAnalyzer(
  rawInput: unknown,
  options: BloodworkTrendAnalyzerBuildOptions,
): | { ok: true; output: ToolOutput<TrendAnalyzerResult> }
  | { ok: false; error: unknown } {
  const parsed = bloodworkTrendAnalyzerInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildBloodworkTrendAnalyzerOutput(parsed.data, analyzeBloodworkTrends(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { TrendAnalyzerInput, TrendAnalyzerResult };
