/**
 * lib/tools/r6/tool-021-peptide-protocol-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-021 (G-R6.1-1).
 *
 * End-to-end path for peptide protocol:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculatePeptideProtocol) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculatePeptideProtocol } from '@/lib/tools/engines/tool-021-peptide-protocol';
import {
  PeptideProtocolInputSchema,
  PeptideProtocolResultSchema,
  type PeptideProtocolInput,
  type PeptideProtocolResult,
} from '@/lib/tools/schemas/tool-021-peptide-protocol';

// Input contract + runtime validation boundary (Zod).
export const peptideProtocolInputSchema = createToolSchema(PeptideProtocolInputSchema);

// Canonical unit recorded in provenance.
export const PEPTIDE_RESULT_UNIT = 'mcg';

export interface PeptideProtocolBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildPeptideProtocolOutput(
  input: PeptideProtocolInput,
  engineResult: PeptideProtocolResult,
  options: PeptideProtocolBuildOptions,
): ToolOutput<PeptideProtocolResult> {
  const tool = requireTool('tool-021-peptide-protocol');

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
      unit: PEPTIDE_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.daily_dose_mcg,
        unit: 'mcg/day',
        source: 'peptide protocol calculator',
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
        code: 'DAILY_DOSE',
        labelAr: 'الجرعة اليومية',
        labelEn: 'Daily dose',
        value: `${engineResult.daily_dose_mcg} mcg`,
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculatePeptideProtocolOutput(
  input: PeptideProtocolInput,
  options: PeptideProtocolBuildOptions,
): ToolOutput<PeptideProtocolResult> {
  return buildPeptideProtocolOutput(input, calculatePeptideProtocol(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runPeptideProtocol(
  rawInput: unknown,
  options: PeptideProtocolBuildOptions,
): | { ok: true; output: ToolOutput<PeptideProtocolResult> }
  | { ok: false; error: unknown } {
  const parsed = peptideProtocolInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildPeptideProtocolOutput(parsed.data, calculatePeptideProtocol(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { PeptideProtocolInput, PeptideProtocolResult };
