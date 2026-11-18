/**
 * lib/tools/r6/tool-006-estrogen-prolactin-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-006 (G-R6.1-1).
 *
 * End-to-end path for estrogen/prolactin record:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateAromatizationRisk) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only (createToolSchema,
 * createToolOutput, isToolOutput). Does not modify the existing engine,
 * schema, registry, or page component.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateAromatizationRisk } from '@/lib/tools/engines/tool-006-estrogen-prolactin';
import {
  EstrogenProlactinInputSchema,
  AromatizationScoreSchema,
  type EstrogenProlactinInput,
  type AromatizationScore,
} from '@/lib/tools/schemas/tool-006-estrogen-prolactin';

// Input contract + runtime validation boundary (Zod).
export const estrogenProlactinInputSchema = createToolSchema(EstrogenProlactinInputSchema);

// Canonical unit recorded in provenance.
export const ESTROGEN_PROLACTIN_RESULT_UNIT = 'pg/mL';

export interface EstrogenProlactinBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildEstrogenProlactinOutput(
  input: EstrogenProlactinInput,
  engineResult: AromatizationScore,
  options: EstrogenProlactinBuildOptions,
): ToolOutput<AromatizationScore> {
  const tool = requireTool('tool-006-estrogen-prolactin');

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
      unit: ESTROGEN_PROLACTIN_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 1_000_000,
        unit: input.e2Unit,
        source: 'user-entered lab value record',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: engineResult.status,
        severity: 'info',
      },
      {
        code: 'REASON_CODE',
        labelAr: 'السبب',
        labelEn: 'Reason code',
        value: engineResult.reasonCode,
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateEstrogenProlactinOutput(
  input: EstrogenProlactinInput,
  options: EstrogenProlactinBuildOptions,
): ToolOutput<AromatizationScore> {
  return buildEstrogenProlactinOutput(input, calculateAromatizationRisk(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runEstrogenProlactin(
  rawInput: unknown,
  options: EstrogenProlactinBuildOptions,
):
  | { ok: true; output: ToolOutput<AromatizationScore> }
  | { ok: false; error: unknown } {
  const parsed = estrogenProlactinInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = calculateAromatizationRisk(parsed.data);
  const resultParsed = AromatizationScoreSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildEstrogenProlactinOutput(parsed.data, resultParsed.data as AromatizationScore, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { EstrogenProlactinInput, AromatizationScore };
