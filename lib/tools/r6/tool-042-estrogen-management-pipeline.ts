/**
 * lib/tools/r6/tool-042-estrogen-management-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-042 (G-R6.1-1).
 *
 * End-to-end path for estrogen management:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: manageEstrogen) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { manageEstrogen } from '@/lib/tools/engines/tool-042-estrogen-management';
import {
  EstrogenInputSchema,
  EstrogenResultSchema,
  type EstrogenInput,
  type EstrogenResult,
} from '@/lib/tools/schemas/tool-042-estrogen-management';

// Input contract + runtime validation boundary (Zod).
export const estrogenManagementInputSchema = createToolSchema(EstrogenInputSchema);

// Canonical unit recorded in provenance.
export const ESTROGEN_RESULT_UNIT = 'pg/mL';

export interface EstrogenManagementBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildEstrogenManagementOutput(
  input: EstrogenInput,
  engineResult: EstrogenResult,
  options: EstrogenManagementBuildOptions,
): ToolOutput<EstrogenResult> {
  const tool = requireTool('tool-042-estrogen-management');

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
      unit: ESTROGEN_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 10,
        high: 40,
        unit: 'pg/mL',
        source: 'estrogen management engine',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: 'CALCULATED',
        severity: engineResult.band === 'high' ? 'important' : 'info',
      },
      {
        code: 'ESTROGEN_BAND',
        labelAr: 'نطاق الاستروجين',
        labelEn: 'Estrogen band',
        value: engineResult.band,
        severity: engineResult.band === 'high' ? 'important' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateEstrogenManagementOutput(
  input: EstrogenInput,
  options: EstrogenManagementBuildOptions,
): ToolOutput<EstrogenResult> {
  return buildEstrogenManagementOutput(input, manageEstrogen(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runEstrogenManagement(
  rawInput: unknown,
  options: EstrogenManagementBuildOptions,
): | { ok: true; output: ToolOutput<EstrogenResult> }
  | { ok: false; error: unknown } {
  const parsed = estrogenManagementInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildEstrogenManagementOutput(parsed.data, manageEstrogen(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { EstrogenInput, EstrogenResult };
