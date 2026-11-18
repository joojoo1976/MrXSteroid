/**
 * lib/tools/r6/tool-027-ester-conversion-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-027 (G-R6.1-1).
 *
 * End-to-end path for ester/mass conversion:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateMolarMassRelationshipV7) ->
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
import { calculateMolarMassRelationshipV7 } from '@/lib/tools/engines/tool-027-ester-conversion';
import {
  MolarMassConversionInputSchema,
  MolarMassConversionResultSchema,
  type MolarMassConversionInput,
  type MolarMassConversionResult,
} from '@/lib/tools/schemas/tool-027-ester-conversion';

// Input contract + runtime validation boundary (Zod).
export const esterConversionInputSchema = createToolSchema(MolarMassConversionInputSchema);

// Canonical unit recorded in provenance.
export const ESTER_CONVERSION_RESULT_UNIT = 'g';

export interface EsterConversionBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildEsterConversionOutput(
  input: MolarMassConversionInput,
  engineResult: MolarMassConversionResult,
  options: EsterConversionBuildOptions,
): ToolOutput<MolarMassConversionResult> {
  const tool = requireTool('tool-027-ester-conversion');

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
      unit: engineResult.targetMassUnit,
      confidence: 1,
      dataQuality: 'high',
      referenceRange: {
        low: 0,
        high: 1_000_000_000,
        unit: engineResult.targetMassUnit,
        source: 'molar-mass-derived unit conversion',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: engineResult.resultOrigin,
        severity: 'info',
      },
      {
        code: 'METHOD',
        labelAr: 'الطريقة',
        labelEn: 'Method',
        value: engineResult.method,
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateEsterConversionOutput(
  input: MolarMassConversionInput,
  options: EsterConversionBuildOptions,
): ToolOutput<MolarMassConversionResult> {
  return buildEsterConversionOutput(input, calculateMolarMassRelationshipV7(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runEsterConversion(
  rawInput: unknown,
  options: EsterConversionBuildOptions,
):
  | { ok: true; output: ToolOutput<MolarMassConversionResult> }
  | { ok: false; error: unknown } {
  const parsed = esterConversionInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = calculateMolarMassRelationshipV7(parsed.data);
  const resultParsed = MolarMassConversionResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildEsterConversionOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { MolarMassConversionInput, MolarMassConversionResult };
