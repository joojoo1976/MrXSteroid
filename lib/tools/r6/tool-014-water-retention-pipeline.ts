/**
 * lib/tools/r6/tool-014-water-retention-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-014 (G-R6.1-1).
 *
 * End-to-end path for water retention:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateWaterRetention) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateWaterRetention } from '@/lib/tools/engines/tool-014-water-retention';
import {
  WaterRetentionResultSchema,
  type WaterRetentionResult,
} from '@/lib/tools/schemas/tool-014-water-retention';

// Input contract + runtime validation boundary (Zod).
export const waterRetentionInputSchema = createToolSchema(WaterRetentionResultSchema);

// Canonical unit recorded in provenance.
export const WATER_RETENTION_RESULT_UNIT = 'status';

export interface WaterRetentionBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildWaterRetentionOutput(
  input: unknown,
  engineResult: WaterRetentionResult,
  options: WaterRetentionBuildOptions,
): ToolOutput<WaterRetentionResult> {
  const tool = requireTool('tool-014-water-retention');

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
      unit: WATER_RETENTION_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 1,
        unit: 'status',
        source: 'water retention availability check',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: engineResult.status,
        severity: engineResult.status === 'NOT_AVAILABLE' ? 'important' : 'info',
      },
      {
        code: 'REASON',
        labelAr: 'السبب',
        labelEn: 'Reason',
        value: engineResult.reason,
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateWaterRetentionOutput(
  input: unknown,
  options: WaterRetentionBuildOptions,
): ToolOutput<WaterRetentionResult> {
  return buildWaterRetentionOutput(input, calculateWaterRetention(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runWaterRetention(
  rawInput: unknown,
  options: WaterRetentionBuildOptions,
): | { ok: true; output: ToolOutput<WaterRetentionResult> }
  | { ok: false; error: unknown } {
  const parsed = waterRetentionInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildWaterRetentionOutput(parsed.data, calculateWaterRetention(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { WaterRetentionResult };
