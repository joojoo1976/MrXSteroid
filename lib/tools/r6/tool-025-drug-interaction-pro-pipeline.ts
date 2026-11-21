/**
 * lib/tools/r6/tool-025-drug-interaction-pro-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-025 (G-R6.1-1).
 *
 * End-to-end path for drug interaction pro:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: buildMedicationSessionV7) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { buildMedicationSessionV7 } from '@/lib/tools/engines/tool-025-drug-interaction-pro';
import {
  MedicationSessionInputSchema,
  MedicationSessionResultSchema,
  type MedicationSessionInput,
  type MedicationSessionResult,
} from '@/lib/tools/schemas/tool-025-drug-interaction-pro';

// Input contract + runtime validation boundary (Zod).
export const drugInteractionProInputSchema = createToolSchema(MedicationSessionInputSchema);

// Canonical unit recorded in provenance.
export const DRUG_INTERACTION_PRO_RESULT_UNIT = 'entry';

export interface DrugInteractionProBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildDrugInteractionProOutput(
  input: MedicationSessionInput,
  engineResult: MedicationSessionResult,
  options: DrugInteractionProBuildOptions,
): ToolOutput<MedicationSessionResult> {
  const tool = requireTool('tool-025-drug-interaction-pro');

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
      unit: DRUG_INTERACTION_PRO_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.entries.length,
        unit: 'entries',
        source: 'user-entered medication session',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: engineResult.interactionAssessment,
        severity: engineResult.interactionAssessment === 'NOT_AVAILABLE' ? 'important' : 'info',
      },
      {
        code: 'ENTRY_COUNT',
        labelAr: 'عدد السجلات',
        labelEn: 'Entry count',
        value: engineResult.entries.length.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateDrugInteractionProOutput(
  input: MedicationSessionInput,
  options: DrugInteractionProBuildOptions,
): ToolOutput<MedicationSessionResult> {
  return buildDrugInteractionProOutput(input, buildMedicationSessionV7(input.entries), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runDrugInteractionPro(
  rawInput: unknown,
  options: DrugInteractionProBuildOptions,
): | { ok: true; output: ToolOutput<MedicationSessionResult> }
  | { ok: false; error: unknown } {
  const parsed = drugInteractionProInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = buildMedicationSessionV7(parsed.data.entries);
  const resultParsed = MedicationSessionResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildDrugInteractionProOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { MedicationSessionInput, MedicationSessionResult };
