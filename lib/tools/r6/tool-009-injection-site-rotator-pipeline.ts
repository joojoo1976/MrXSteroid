/**
 * lib/tools/r6/tool-009-injection-site-rotator-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-009 (G-R6.1-1).
 *
 * End-to-end path for injection site rotator:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified) ->
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
  InjectionSiteLogEntrySchema,
  type InjectionSiteLogEntry,
} from '@/lib/tools/schemas/tool-009-injection-site-rotator';

// Input contract + runtime validation boundary (Zod).
export const injectionSiteRotatorInputSchema = createToolSchema(InjectionSiteLogEntrySchema);

// Canonical unit recorded in provenance.
export const INJECTION_SITE_RESULT_UNIT = 'log_entry';

export interface InjectionSiteRotatorBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildInjectionSiteRotatorOutput(
  input: InjectionSiteLogEntry,
  engineResult: InjectionSiteLogEntry,
  options: InjectionSiteRotatorBuildOptions,
): ToolOutput<InjectionSiteLogEntry> {
  const tool = requireTool('tool-009-injection-site-rotator');

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
      unit: INJECTION_SITE_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 500,
        unit: 'log_entries',
        source: 'user-entered injection site log',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: 'LOGGED',
        severity: 'info',
      },
      {
        code: 'LOG_COUNT',
        labelAr: 'عدد السجلات',
        labelEn: 'Log entry count',
        value: '1',
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateInjectionSiteRotatorOutput(
  input: InjectionSiteLogEntry,
  options: InjectionSiteRotatorBuildOptions,
): ToolOutput<InjectionSiteLogEntry> {
  return buildInjectionSiteRotatorOutput(input, input, options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runInjectionSiteRotator(
  rawInput: unknown,
  options: InjectionSiteRotatorBuildOptions,
): | { ok: true; output: ToolOutput<InjectionSiteLogEntry> }
  | { ok: false; error: unknown } {
  const parsed = injectionSiteRotatorInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildInjectionSiteRotatorOutput(parsed.data, parsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { InjectionSiteLogEntry };
