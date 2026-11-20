/**
 * lib/tools/r6/tool-007-bloodwork-analyzer-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-007 (G-R6.1-1).
 *
 * End-to-end path for bloodwork analyzer:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: buildBloodworkSessionV7) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { buildBloodworkSessionV7 } from '@/lib/tools/engines/tool-007-bloodwork-analyzer';
import {
  BloodworkSessionSchema,
  type BloodworkRecord,
} from '@/lib/tools/schemas/tool-007-bloodwork-analyzer';
import type { BloodworkSessionV7 } from '@/lib/tools/engines/tool-007-bloodwork-analyzer';

// Input contract + runtime validation boundary (Zod).
export const bloodworkAnalyzerInputSchema = createToolSchema(BloodworkSessionSchema);

// Canonical unit recorded in provenance.
export const BLOODWORK_RESULT_UNIT = 'record';

export interface BloodworkAnalyzerBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildBloodworkAnalyzerOutput(
  input: BloodworkRecord[],
  engineResult: BloodworkSessionV7,
  options: BloodworkAnalyzerBuildOptions,
): ToolOutput<BloodworkSessionV7> {
  const tool = requireTool('tool-007-bloodwork-analyzer');

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
      unit: BLOODWORK_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.records.length,
        unit: 'records',
        source: 'user-entered lab values',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: engineResult.resultOrigin,
        severity: 'info',
      },
      {
        code: 'RECORD_COUNT',
        labelAr: 'عدد السجلات',
        labelEn: 'Record count',
        value: engineResult.records.length.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateBloodworkAnalyzerOutput(
  input: BloodworkRecord[],
  options: BloodworkAnalyzerBuildOptions,
): ToolOutput<BloodworkSessionV7> {
  return buildBloodworkAnalyzerOutput(input, buildBloodworkSessionV7(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runBloodworkAnalyzer(
  rawInput: unknown,
  options: BloodworkAnalyzerBuildOptions,
):
  | { ok: true; output: ToolOutput<BloodworkSessionV7> }
  | { ok: false; error: unknown } {
  const parsed = bloodworkAnalyzerInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildBloodworkAnalyzerOutput(parsed.data, buildBloodworkSessionV7(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { BloodworkRecord, BloodworkSessionV7 };
