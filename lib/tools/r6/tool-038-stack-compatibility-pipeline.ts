/**
 * lib/tools/r6/tool-038-stack-compatibility-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-038 (G-R6.1-1).
 *
 * End-to-end path for stack compatibility:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: checkStackCompatibility) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { checkStackCompatibility } from '@/lib/tools/engines/tool-038-stack-compatibility';
import {
  StackCompatibilityInputSchema,
  StackCompatibilityResultSchema,
  type StackCompatibilityInput,
  type StackCompatibilityResult,
} from '@/lib/tools/schemas/tool-038-stack-compatibility';

// Input contract + runtime validation boundary (Zod).
export const stackCompatibilityInputSchema = createToolSchema(StackCompatibilityInputSchema);

// Canonical unit recorded in provenance.
export const STACK_COMPATIBILITY_RESULT_UNIT = 'score';

export interface StackCompatibilityBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildStackCompatibilityOutput(
  input: StackCompatibilityInput,
  engineResult: StackCompatibilityResult,
  options: StackCompatibilityBuildOptions,
): ToolOutput<StackCompatibilityResult> {
  const tool = requireTool('tool-038-stack-compatibility');

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
      unit: STACK_COMPATIBILITY_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 100,
        unit: 'compatibility score',
        source: 'pairwise interaction matrix',
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
        code: 'COMPATIBILITY_SCORE',
        labelAr: 'نقاط التوافق',
        labelEn: 'Compatibility score',
        value: engineResult.score_0_100.toString(),
        severity: engineResult.verdict === 'incompatible' ? 'important' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateStackCompatibilityOutput(
  input: StackCompatibilityInput,
  options: StackCompatibilityBuildOptions,
): ToolOutput<StackCompatibilityResult> {
  return buildStackCompatibilityOutput(input, checkStackCompatibility(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runStackCompatibility(
  rawInput: unknown,
  options: StackCompatibilityBuildOptions,
): | { ok: true; output: ToolOutput<StackCompatibilityResult> }
  | { ok: false; error: unknown } {
  const parsed = stackCompatibilityInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = checkStackCompatibility(parsed.data);
  const resultParsed = StackCompatibilityResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildStackCompatibilityOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { StackCompatibilityInput, StackCompatibilityResult };
