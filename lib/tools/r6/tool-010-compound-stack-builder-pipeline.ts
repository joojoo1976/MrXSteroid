/**
 * lib/tools/r6/tool-010-compound-stack-builder-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-010 (G-R6.1-1).
 *
 * End-to-end path for compound stack builder:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * Note: tool-010's engine module only exports type definitions
 * (StackCompound, CompoundStack). There is no calculation function to wrap;
 * the pipeline validates the input contract and produces a structured output
 * envelope that the page can consume directly.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import {
  CompoundStackSchema,
  type CompoundStack,
} from '@/lib/tools/schemas/tool-010-compound-stack-builder';

// Input contract + runtime validation boundary (Zod).
export const compoundStackInputSchema = createToolSchema(CompoundStackSchema);

// Canonical unit recorded in provenance.
export const COMPOUND_STACK_RESULT_UNIT = 'stack';

export interface CompoundStackBuilderBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildCompoundStackBuilderOutput(
  input: CompoundStack,
  engineResult: CompoundStack,
  options: CompoundStackBuilderBuildOptions,
): ToolOutput<CompoundStack> {
  const tool = requireTool('tool-010-compound-stack-builder');

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
      unit: COMPOUND_STACK_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: input.total_weekly_dose,
        unit: 'mg/week',
        source: 'compound stack builder',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: 'VALIDATED',
        severity: 'info',
      },
      {
        code: 'COMPOUND_COUNT',
        labelAr: 'عدد المركبات',
        labelEn: 'Compound count',
        value: input.compounds.length.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: build structured output from validated input (no calculation
 * engine to wrap — the validated input is the result).
 */
export function calculateCompoundStackBuilderOutput(
  input: CompoundStack,
  options: CompoundStackBuilderBuildOptions,
): ToolOutput<CompoundStack> {
  return buildCompoundStackBuilderOutput(input, input, options);
}

// Full pipeline: validate -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runCompoundStackBuilder(
  rawInput: unknown,
  options: CompoundStackBuilderBuildOptions,
): | { ok: true; output: ToolOutput<CompoundStack> }
  | { ok: false; error: unknown } {
  const parsed = compoundStackInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildCompoundStackBuilderOutput(parsed.data, parsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { CompoundStack };
