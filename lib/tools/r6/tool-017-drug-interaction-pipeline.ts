/**
 * lib/tools/r6/tool-017-drug-interaction-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-017 (G-R6.1-1).
 *
 * End-to-end path for drug interaction:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: checkDrugInteractions) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { checkDrugInteractions } from '@/lib/tools/engines/tool-017-drug-interaction';
import {
  DrugInteractionResultSchema,
  type DrugInteractionResult,
} from '@/lib/tools/schemas/tool-017-drug-interaction';

// Input contract + runtime validation boundary (Zod).
export const drugInteractionInputSchema = createToolSchema(DrugInteractionResultSchema);

// Canonical unit recorded in provenance.
export const DRUG_INTERACTION_RESULT_UNIT = 'status';

export interface DrugInteractionBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildDrugInteractionOutput(
  input: unknown,
  engineResult: DrugInteractionResult,
  options: DrugInteractionBuildOptions,
): ToolOutput<DrugInteractionResult> {
  const tool = requireTool('tool-017-drug-interaction');

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
      unit: DRUG_INTERACTION_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 1,
        unit: 'status',
        source: 'drug interaction availability check',
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
export function calculateDrugInteractionOutput(
  input: unknown,
  options: DrugInteractionBuildOptions,
): ToolOutput<DrugInteractionResult> {
  return buildDrugInteractionOutput(input, checkDrugInteractions(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runDrugInteraction(
  rawInput: unknown,
  options: DrugInteractionBuildOptions,
): | { ok: true; output: ToolOutput<DrugInteractionResult> }
  | { ok: false; error: unknown } {
  const parsed = drugInteractionInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildDrugInteractionOutput(parsed.data, checkDrugInteractions(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { DrugInteractionResult };
