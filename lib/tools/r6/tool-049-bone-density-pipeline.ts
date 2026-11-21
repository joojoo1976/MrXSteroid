/**
 * lib/tools/r6/tool-049-bone-density-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-049 (bone density).
 *
 * End-to-end path for the bone density optimizer:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: assessBoneDensity) ->
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
  assessBoneDensity,
  type BoneDensityResult,
} from '@/lib/tools/engines/tool-049-bone-density';
import {
  BoneDensityInputSchema,
  BoneDensityResultSchema,
  type BoneDensityInput,
} from '@/lib/tools/schemas/tool-049-bone-density';

// Input contract + runtime validation boundary (Zod).
export const boneDensityInputSchema = createToolSchema(BoneDensityInputSchema);

// Canonical unit recorded in provenance.
export const BONE_DENSITY_RESULT_UNIT = 'score';

export interface BoneDensityBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildBoneDensityOutput(
  input: BoneDensityInput,
  engineResult: BoneDensityResult,
  options: BoneDensityBuildOptions,
): ToolOutput<BoneDensityResult> {
  const tool = requireTool('tool-049-bone-density');

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
      unit: BONE_DENSITY_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
    },
    keyFindings: [
      {
        code: 'BONE_SCORE',
        labelAr: 'درجة صحة العظام',
        labelEn: 'Bone health score',
        value: engineResult.bone_health_score,
        severity:
          engineResult.band === 'high-risk'
            ? 'important'
            : engineResult.band === 'at-risk'
              ? 'monitor'
              : 'info',
      },
      {
        code: 'BAND',
        labelAr: 'التصنيف',
        labelEn: 'Band',
        value: engineResult.band,
        severity:
          engineResult.band === 'high-risk'
            ? 'important'
            : engineResult.band === 'at-risk'
              ? 'monitor'
              : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateBoneDensityOutput(
  input: BoneDensityInput,
  options: BoneDensityBuildOptions,
): ToolOutput<BoneDensityResult> {
  return buildBoneDensityOutput(input, assessBoneDensity(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runBoneDensity(
  rawInput: unknown,
  options: BoneDensityBuildOptions,
): { ok: true; output: ToolOutput<BoneDensityResult> } | { ok: false; error: unknown } {
  const parsed = boneDensityInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = assessBoneDensity(parsed.data);
  const resultParsed = BoneDensityResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildBoneDensityOutput(parsed.data, resultParsed.data as BoneDensityResult, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { BoneDensityInput, BoneDensityResult };
