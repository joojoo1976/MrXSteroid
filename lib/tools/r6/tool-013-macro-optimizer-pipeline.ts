/**
 * lib/tools/r6/tool-013-macro-optimizer-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-013 (G-R6.1-1).
 *
 * End-to-end path for macro optimizer:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateMacros) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateMacros } from '@/lib/tools/engines/tool-013-macro-optimizer';
import {
  MacroInputSchema,
  MacroTargetsSchema,
  type MacroInput,
  type MacroTargets,
} from '@/lib/tools/schemas/tool-013-macro-optimizer';

// Input contract + runtime validation boundary (Zod).
export const macroOptimizerInputSchema = createToolSchema(MacroInputSchema);

// Canonical unit recorded in provenance.
export const MACRO_RESULT_UNIT = 'gram';

export interface MacroOptimizerBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildMacroOptimizerOutput(
  input: MacroInput,
  engineResult: MacroTargets,
  options: MacroOptimizerBuildOptions,
): ToolOutput<MacroTargets> {
  const tool = requireTool('tool-013-macro-optimizer');

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
      unit: MACRO_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.total_calories,
        unit: 'calories',
        source: 'macro scenario calculator',
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
        code: 'TOTAL_CALORIES',
        labelAr: '총 السعرات الحرارية',
        labelEn: 'Total calories',
        value: engineResult.total_calories.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateMacroOptimizerOutput(
  input: MacroInput,
  options: MacroOptimizerBuildOptions,
): ToolOutput<MacroTargets> {
  return buildMacroOptimizerOutput(input, calculateMacros(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runMacroOptimizer(
  rawInput: unknown,
  options: MacroOptimizerBuildOptions,
): | { ok: true; output: ToolOutput<MacroTargets> }
  | { ok: false; error: unknown } {
  const parsed = macroOptimizerInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildMacroOptimizerOutput(parsed.data, calculateMacros(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { MacroInput, MacroTargets };
