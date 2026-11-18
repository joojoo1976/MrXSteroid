/**
 * lib/tools/r6/tool-043-prolactin-management-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-043 (G-R6.1-1).
 *
 * End-to-end path for prolactin management:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: manageProlactin) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { manageProlactin } from '@/lib/tools/engines/tool-043-prolactin-management';
import {
  ProlactinInputSchema,
  ProlactinResultSchema,
  type ProlactinInput,
} from '@/lib/tools/schemas/tool-043-prolactin-management';
import type { z } from 'zod';

type ProlactinResult = z.infer<typeof ProlactinResultSchema>;

// Input contract + runtime validation boundary (Zod).
export const prolactinManagementInputSchema = createToolSchema(ProlactinInputSchema);

// Canonical unit recorded in provenance.
export const PROLACTIN_RESULT_UNIT = 'ng/mL';

export interface ProlactinManagementBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildProlactinManagementOutput(
  input: ProlactinInput,
  engineResult: ProlactinResult,
  options: ProlactinManagementBuildOptions,
): ToolOutput<ProlactinResult> {
  const tool = requireTool('tool-043-prolactin-management');

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
      unit: PROLACTIN_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 15,
        unit: 'ng/mL',
        source: 'prolactin management engine',
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
        code: 'SUGGESTED_WEEKLY_MCG',
        labelAr: 'الجرعة الأسبوعية المقترحة',
        labelEn: 'Suggested weekly mcg',
        value: engineResult.suggested_weekly_mcg.toString(),
        severity: engineResult.suggested_weekly_mcg > 0 ? 'info' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateProlactinManagementOutput(
  input: ProlactinInput,
  options: ProlactinManagementBuildOptions,
): ToolOutput<ProlactinResult> {
  return buildProlactinManagementOutput(input, manageProlactin(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runProlactinManagement(
  rawInput: unknown,
  options: ProlactinManagementBuildOptions,
): | { ok: true; output: ToolOutput<ProlactinResult> }
  | { ok: false; error: unknown } {
  const parsed = prolactinManagementInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = manageProlactin(parsed.data);
  const resultParsed = ProlactinResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildProlactinManagementOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { ProlactinInput, ProlactinResult };
