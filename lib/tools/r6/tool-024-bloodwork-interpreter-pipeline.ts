/**
 * lib/tools/r6/tool-024-bloodwork-interpreter-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-024 (G-R6.1-1).
 *
 * End-to-end path for bloodwork interpreter:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: compareBloodworkToEnteredIntervalsV7) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { compareBloodworkToEnteredIntervalsV7 } from '@/lib/tools/engines/tool-024-bloodwork-interpreter';
import {
  BloodworkComparisonInputSchema,
  BloodworkComparisonResultSchema,
  type BloodworkComparisonInput,
  type BloodworkComparisonResult,
} from '@/lib/tools/schemas/tool-024-bloodwork-interpreter';

// Input contract + runtime validation boundary (Zod).
export const bloodworkInterpreterInputSchema = createToolSchema(BloodworkComparisonInputSchema);

// Canonical unit recorded in provenance.
export const BLOODWORK_INTERPRETER_RESULT_UNIT = 'comparison';

export interface BloodworkInterpreterBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildBloodworkInterpreterOutput(
  input: BloodworkComparisonInput,
  engineResult: BloodworkComparisonResult,
  options: BloodworkInterpreterBuildOptions,
): ToolOutput<BloodworkComparisonResult> {
  const tool = requireTool('tool-024-bloodwork-interpreter');

  const belowCount = engineResult.comparisons.filter((c) => c.relation === 'BELOW_ENTERED_INTERVAL').length;
  const aboveCount = engineResult.comparisons.filter((c) => c.relation === 'ABOVE_ENTERED_INTERVAL').length;

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
      unit: BLOODWORK_INTERPRETER_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.comparisons.length,
        unit: 'comparisons',
        source: 'user-entered reference intervals',
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
        code: 'BELOW_COUNT',
        labelAr: 'أقل من المدى',
        labelEn: 'Below interval count',
        value: belowCount.toString(),
        severity: belowCount > 0 ? 'important' : 'info',
      },
      {
        code: 'ABOVE_COUNT',
        labelAr: 'أعلى من المدى',
        labelEn: 'Above interval count',
        value: aboveCount.toString(),
        severity: aboveCount > 0 ? 'important' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateBloodworkInterpreterOutput(
  input: BloodworkComparisonInput,
  options: BloodworkInterpreterBuildOptions,
): ToolOutput<BloodworkComparisonResult> {
  return buildBloodworkInterpreterOutput(input, compareBloodworkToEnteredIntervalsV7(input.records), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runBloodworkInterpreter(
  rawInput: unknown,
  options: BloodworkInterpreterBuildOptions,
): | { ok: true; output: ToolOutput<BloodworkComparisonResult> }
  | { ok: false; error: unknown } {
  const parsed = bloodworkInterpreterInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildBloodworkInterpreterOutput(
    parsed.data,
    compareBloodworkToEnteredIntervalsV7(parsed.data.records),
    options,
  );
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { BloodworkComparisonInput, BloodworkComparisonResult };
