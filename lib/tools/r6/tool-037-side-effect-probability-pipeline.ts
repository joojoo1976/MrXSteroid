/**
 * lib/tools/r6/tool-037-side-effect-probability-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-037 (G-R6.1-1).
 *
 * End-to-end path for side effect probability:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateSideEffectProbability) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateSideEffectProbability } from '@/lib/tools/engines/tool-037-side-effect-probability';
import {
  SideEffectRiskInputSchema,
  SideEffectRiskResultSchema,
  type SideEffectRiskInput,
  type SideEffectRiskResult,
} from '@/lib/tools/schemas/tool-037-side-effect-probability';

// Input contract + runtime validation boundary (Zod).
export const sideEffectProbabilityInputSchema = createToolSchema(SideEffectRiskInputSchema);

// Canonical unit recorded in provenance.
export const SIDE_EFFECT_PROBABILITY_RESULT_UNIT = 'percent';

export interface SideEffectProbabilityBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildSideEffectProbabilityOutput(
  input: SideEffectRiskInput,
  engineResult: SideEffectRiskResult,
  options: SideEffectProbabilityBuildOptions,
): ToolOutput<SideEffectRiskResult> {
  const tool = requireTool('tool-037-side-effect-probability');

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
      unit: SIDE_EFFECT_PROBABILITY_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 100,
        unit: 'percent',
        source: 'additive risk model (population averages)',
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
        code: 'OVERALL_BURDEN',
        labelAr: 'العبء الإجمالي',
        labelEn: 'Overall burden',
        value: engineResult.overall_burden_pct.toString(),
        severity: engineResult.overall_burden_pct > 30 ? 'important' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateSideEffectProbabilityOutput(
  input: SideEffectRiskInput,
  options: SideEffectProbabilityBuildOptions,
): ToolOutput<SideEffectRiskResult> {
  return buildSideEffectProbabilityOutput(input, calculateSideEffectProbability(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runSideEffectProbability(
  rawInput: unknown,
  options: SideEffectProbabilityBuildOptions,
): | { ok: true; output: ToolOutput<SideEffectRiskResult> }
  | { ok: false; error: unknown } {
  const parsed = sideEffectProbabilityInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = calculateSideEffectProbability(parsed.data);
  const resultParsed = SideEffectRiskResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildSideEffectProbabilityOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { SideEffectRiskInput, SideEffectRiskResult };
