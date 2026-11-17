/**
 * lib/tools/r6/tool-034-compound-clearance-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-034 (G-R6.1-1).
 *
 * End-to-end path for compound clearance:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateCompoundClearance) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateCompoundClearance } from '@/lib/tools/engines/tool-034-compound-clearance';
import {
  ClearanceInputSchema,
  ClearanceResultSchema,
  type ClearanceInput,
  type ClearanceResult,
} from '@/lib/tools/schemas/tool-034-compound-clearance';

// Input contract + runtime validation boundary (Zod).
export const compoundClearanceInputSchema = createToolSchema(ClearanceInputSchema);

// Canonical unit recorded in provenance.
export const COMPOUND_CLEARANCE_RESULT_UNIT = 'day';

export interface CompoundClearanceBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildCompoundClearanceOutput(
  input: ClearanceInput,
  engineResult: ClearanceResult,
  options: CompoundClearanceBuildOptions,
): ToolOutput<ClearanceResult> {
  const tool = requireTool('tool-034-compound-clearance');

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
      unit: COMPOUND_CLEARANCE_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.days_to_threshold,
        unit: 'days',
        source: 'exponential-decay clearance model',
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
        code: 'DAYS_TO_THRESHOLD',
        labelAr: 'أيام حتى العتبة',
        labelEn: 'Days to threshold',
        value: engineResult.days_to_threshold.toString(),
        severity: engineResult.threshold_reached ? 'info' : 'important',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateCompoundClearanceOutput(
  input: ClearanceInput,
  options: CompoundClearanceBuildOptions,
): ToolOutput<ClearanceResult> {
  return buildCompoundClearanceOutput(input, calculateCompoundClearance(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runCompoundClearance(
  rawInput: unknown,
  options: CompoundClearanceBuildOptions,
): | { ok: true; output: ToolOutput<ClearanceResult> }
  | { ok: false; error: unknown } {
  const parsed = compoundClearanceInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildCompoundClearanceOutput(parsed.data, calculateCompoundClearance(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { ClearanceInput, ClearanceResult };
