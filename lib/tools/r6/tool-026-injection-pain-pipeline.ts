/**
 * lib/tools/r6/tool-026-injection-pain-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-026 (G-R6.1-1).
 *
 * End-to-end path for injection pain:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: buildInjectionExperienceSessionV7) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { buildInjectionExperienceSessionV7 } from '@/lib/tools/engines/tool-026-injection-pain';
import {
  InjectionExperienceInputSchema,
  InjectionExperienceResultSchema,
  type InjectionExperienceInput,
  type InjectionExperienceResult,
} from '@/lib/tools/schemas/tool-026-injection-pain';

// Input contract + runtime validation boundary (Zod).
export const injectionPainInputSchema = createToolSchema(InjectionExperienceInputSchema);

// Canonical unit recorded in provenance.
export const INJECTION_PAIN_RESULT_UNIT = 'entry';

export interface InjectionPainBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildInjectionPainOutput(
  input: InjectionExperienceInput,
  engineResult: InjectionExperienceResult,
  options: InjectionPainBuildOptions,
): ToolOutput<InjectionExperienceResult> {
  const tool = requireTool('tool-026-injection-pain');

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
      unit: INJECTION_PAIN_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.entries.length,
        unit: 'entries',
        source: 'user-entered injection experience',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: engineResult.assessment,
        severity: engineResult.assessment === 'NOT_AVAILABLE' ? 'important' : 'info',
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
export function calculateInjectionPainOutput(
  input: InjectionExperienceInput,
  options: InjectionPainBuildOptions,
): ToolOutput<InjectionExperienceResult> {
  return buildInjectionPainOutput(input, buildInjectionExperienceSessionV7(input.entries), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runInjectionPain(
  rawInput: unknown,
  options: InjectionPainBuildOptions,
): | { ok: true; output: ToolOutput<InjectionExperienceResult> }
  | { ok: false; error: unknown } {
  const parsed = injectionPainInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = buildInjectionExperienceSessionV7(parsed.data.entries);
  const resultParsed = InjectionExperienceResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildInjectionPainOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { InjectionExperienceInput, InjectionExperienceResult };
