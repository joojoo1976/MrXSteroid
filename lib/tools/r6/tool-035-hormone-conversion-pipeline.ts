/**
 * lib/tools/r6/tool-035-hormone-conversion-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-035 (G-R6.1-1).
 *
 * End-to-end path for hormone conversion:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateHormoneConversion) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateHormoneConversion } from '@/lib/tools/engines/tool-035-hormone-conversion';
import {
  ConversionInputSchema,
  ConversionResultSchema,
  type ConversionInput,
  type ConversionResult,
} from '@/lib/tools/schemas/tool-035-hormone-conversion';

// Input contract + runtime validation boundary (Zod).
export const hormoneConversionInputSchema = createToolSchema(ConversionInputSchema);

// Canonical unit recorded in provenance.
export const HORMONE_CONVERSION_RESULT_UNIT = 'ng/dL';

export interface HormoneConversionBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildHormoneConversionOutput(
  input: ConversionInput,
  engineResult: ConversionResult,
  options: HormoneConversionBuildOptions,
): ToolOutput<ConversionResult> {
  const tool = requireTool('tool-035-hormone-conversion');

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
      unit: engineResult.result_unit,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 10000,
        unit: engineResult.result_unit,
        source: 'molar-mass-derived unit conversion',
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
        code: 'CONVERSION_FACTOR',
        labelAr: 'عامل التحويل',
        labelEn: 'Conversion factor',
        value: engineResult.conversion_factor.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateHormoneConversionOutput(
  input: ConversionInput,
  options: HormoneConversionBuildOptions,
): ToolOutput<ConversionResult> {
  return buildHormoneConversionOutput(input, calculateHormoneConversion(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runHormoneConversion(
  rawInput: unknown,
  options: HormoneConversionBuildOptions,
): | { ok: true; output: ToolOutput<ConversionResult> }
  | { ok: false; error: unknown } {
  const parsed = hormoneConversionInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = calculateHormoneConversion(parsed.data);
  const resultParsed = ConversionResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildHormoneConversionOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { ConversionInput, ConversionResult };
