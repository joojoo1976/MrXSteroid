/**
 * lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-041 (G-R6.1-1).
 *
 * End-to-end path for hematocrit monitor:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: monitorHematocrit) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import {
  monitorHematocrit,
  type HematocritResult,
} from '@/lib/tools/engines/tool-041-hematocrit-monitor';
import {
  HematocritInputSchema,
  HematocritResultSchema,
  type HematocritInput,
} from '@/lib/tools/schemas/tool-041-hematocrit-monitor';

// Input contract + runtime validation boundary (Zod).
export const hematocritMonitorInputSchema = createToolSchema(HematocritInputSchema);

// Canonical unit recorded in provenance.
export const HEMATOCRIT_RESULT_UNIT = 'percent';

export interface HematocritMonitorBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildHematocritMonitorOutput(
  input: HematocritInput,
  engineResult: HematocritResult,
  options: HematocritMonitorBuildOptions,
): ToolOutput<HematocritResult> {
  const tool = requireTool('tool-041-hematocrit-monitor');

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
      unit: HEMATOCRIT_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 70,
        unit: 'percent',
        source: 'hematocrit monitor',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: 'CALCULATED',
        severity: engineResult.band === 'very-high' ? 'important' : 'info',
      },
      {
        code: 'LATEST_HCT',
        labelAr: 'أحدث قيمة',
        labelEn: 'Latest HCT',
        value: engineResult.latest_hct_pct.toString(),
        severity: engineResult.band === 'very-high' ? 'important' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateHematocritMonitorOutput(
  input: HematocritInput,
  options: HematocritMonitorBuildOptions,
): ToolOutput<HematocritResult> {
  return buildHematocritMonitorOutput(input, monitorHematocrit(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runHematocritMonitor(
  rawInput: unknown,
  options: HematocritMonitorBuildOptions,
): | { ok: true; output: ToolOutput<HematocritResult> }
  | { ok: false; error: unknown } {
  const parsed = hematocritMonitorInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = monitorHematocrit(parsed.data);
  const resultParsed = HematocritResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildHematocritMonitorOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { HematocritInput, HematocritResult };
