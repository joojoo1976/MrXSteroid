/**
 * lib/tools/r6/tool-015-shbg-modulator-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-015 (G-R6.1-1).
 *
 * End-to-end path for SHBG modulator:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateSHBG) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateSHBG } from '@/lib/tools/engines/tool-015-shbg-modulator';
import {
  SHBGInputSchema,
  SHBGResultSchema,
  type SHBGInput,
  type SHBGResult,
} from '@/lib/tools/schemas/tool-015-shbg-modulator';

// Input contract + runtime validation boundary (Zod).
export const shbgModulatorInputSchema = createToolSchema(SHBGInputSchema);

// Canonical unit recorded in provenance.
export const SHBG_RESULT_UNIT = 'nmol/L';

export interface SHBGModulatorBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildSHBGModulatorOutput(
  input: SHBGInput,
  engineResult: SHBGResult,
  options: SHBGModulatorBuildOptions,
): ToolOutput<SHBGResult> {
  const tool = requireTool('tool-015-shbg-modulator');

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
      unit: SHBG_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 1000,
        unit: 'nmol/L',
        source: 'Vermeulen mass-action quadratic',
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
        code: 'FORMULA',
        labelAr: 'الصيغة',
        labelEn: 'Formula',
        value: engineResult.formula,
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateSHBGModulatorOutput(
  input: SHBGInput,
  options: SHBGModulatorBuildOptions,
): ToolOutput<SHBGResult> {
  return buildSHBGModulatorOutput(input, calculateSHBG(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runSHBGModulator(
  rawInput: unknown,
  options: SHBGModulatorBuildOptions,
): | { ok: true; output: ToolOutput<SHBGResult> }
  | { ok: false; error: unknown } {
  const parsed = shbgModulatorInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = calculateSHBG(parsed.data);
  const resultParsed = SHBGResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildSHBGModulatorOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { SHBGInput, SHBGResult };
