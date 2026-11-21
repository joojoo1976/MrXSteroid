/**
 * lib/tools/r6/tool-044-dht-side-effects-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-044 (G-R6.1-1).
 *
 * End-to-end path for DHT side effects:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: predictDhtEffects) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { predictDhtEffects } from '@/lib/tools/engines/tool-044-dht-side-effects';
import {
  DhtInputSchema,
  DhtResultSchema,
  type DhtInput,
} from '@/lib/tools/schemas/tool-044-dht-side-effects';
import type { z } from 'zod';

type DhtResult = z.infer<typeof DhtResultSchema>;

// Input contract + runtime validation boundary (Zod).
export const dhtSideEffectsInputSchema = createToolSchema(DhtInputSchema);

// Canonical unit recorded in provenance.
export const DHT_RESULT_UNIT = 'percent';

export interface DhtSideEffectsBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildDhtSideEffectsOutput(
  input: DhtInput,
  engineResult: DhtResult,
  options: DhtSideEffectsBuildOptions,
): ToolOutput<DhtResult> {
  const tool = requireTool('tool-044-dht-side-effects');

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
      unit: DHT_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 100,
        unit: 'percent',
        source: 'DHT side effect predictor',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: 'CALCULATED',
        severity: engineResult.band === 'high' ? 'important' : 'info',
      },
      {
        code: 'DHT_BAND',
        labelAr: 'نطاق DHT',
        labelEn: 'DHT band',
        value: engineResult.band,
        severity: engineResult.band === 'high' ? 'important' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateDhtSideEffectsOutput(
  input: DhtInput,
  options: DhtSideEffectsBuildOptions,
): ToolOutput<DhtResult> {
  return buildDhtSideEffectsOutput(input, predictDhtEffects(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runDhtSideEffects(
  rawInput: unknown,
  options: DhtSideEffectsBuildOptions,
): | { ok: true; output: ToolOutput<DhtResult> }
  | { ok: false; error: unknown } {
  const parsed = dhtSideEffectsInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = predictDhtEffects(parsed.data);
  const resultParsed = DhtResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildDhtSideEffectsOutput(parsed.data, resultParsed.data, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { DhtInput, DhtResult };
