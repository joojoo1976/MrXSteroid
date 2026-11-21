/**
 * lib/tools/r6/tool-047-fertility-preservation-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-047 (fertility preservation).
 *
 * End-to-end path for the fertility preservation guide:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: assessFertility) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only. The engine, schema and
 * legacy adapter are not edited here.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import {
  assessFertility,
  type FertilityResult,
} from '@/lib/tools/engines/tool-047-fertility-preservation';
import {
  FertilityInputSchema,
  FertilityResultSchema,
  type FertilityInput,
} from '@/lib/tools/schemas/tool-047-fertility-preservation';

// Input contract + runtime validation boundary (Zod).
export const fertilityPreservationInputSchema = createToolSchema(FertilityInputSchema);

// Canonical unit recorded in provenance.
export const FERTILITY_RESULT_UNIT = 'months';

export interface FertilityBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildFertilityOutput(
  input: FertilityInput,
  engineResult: FertilityResult,
  options: FertilityBuildOptions,
): ToolOutput<FertilityResult> {
  const tool = requireTool('tool-047-fertility-preservation');

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
      unit: FERTILITY_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
    },
    keyFindings: [
      {
        code: 'IMPACT_PCT',
        labelAr: 'أثر القمع التقديري',
        labelEn: 'Estimated suppression impact',
        value: `${engineResult.fertility_impact_pct}%`,
        severity: engineResult.fertility_impact_pct >= 65 ? 'monitor' : 'info',
      },
      {
        code: 'RECOVERY_MONTHS',
        labelAr: 'التعافي المتوقع',
        labelEn: 'Projected recovery',
        value: String(engineResult.recovery_projection_months),
        severity: engineResult.recovery_projection_months > 12 ? 'monitor' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateFertilityOutput(
  input: FertilityInput,
  options: FertilityBuildOptions,
): ToolOutput<FertilityResult> {
  return buildFertilityOutput(input, assessFertility(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runFertilityPreservation(
  rawInput: unknown,
  options: FertilityBuildOptions,
): | { ok: true; output: ToolOutput<FertilityResult> }
  | { ok: false; error: unknown } {
  const parsed = fertilityPreservationInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = assessFertility(parsed.data);
  const resultParsed = FertilityResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildFertilityOutput(parsed.data, resultParsed.data as FertilityResult, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { FertilityInput, FertilityResult };
