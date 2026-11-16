/**
 * lib/tools/r6/tool-050-mental-health-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-050 (mental health).
 *
 * End-to-end path for the mental health monitor:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: assessMentalHealth) ->
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
  assessMentalHealth,
  type MentalHealthResult,
} from '@/lib/tools/engines/tool-050-mental-health';
import {
  MentalHealthInputSchema,
  type MentalHealthInput,
} from '@/lib/tools/schemas/tool-050-mental-health';

// Input contract + runtime validation boundary (Zod).
export const mentalHealthInputSchema = createToolSchema(MentalHealthInputSchema);

// Canonical unit recorded in provenance.
export const MENTAL_HEALTH_RESULT_UNIT = 'mood/10';

export interface MentalHealthBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildMentalHealthOutput(
  input: MentalHealthInput,
  engineResult: MentalHealthResult,
  options: MentalHealthBuildOptions,
): ToolOutput<MentalHealthResult> {
  const tool = requireTool('tool-050-mental-health');

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
      unit: MENTAL_HEALTH_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
    },
    keyFindings: [
      {
        code: 'AVG_MOOD',
        labelAr: 'متوسط المزاج',
        labelEn: 'Average mood',
        value: `${engineResult.avg_mood}/10`,
        severity:
          engineResult.band === 'concern' || engineResult.band === 'critical'
            ? 'important'
            : engineResult.band === 'watch'
              ? 'monitor'
              : 'info',
      },
      {
        code: 'TREND',
        labelAr: 'الاتجاه',
        labelEn: 'Trend',
        value: engineResult.trend,
        severity: engineResult.trend === 'declining' ? 'monitor' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

export function calculateMentalHealthOutput(
  input: MentalHealthInput,
  options: MentalHealthBuildOptions,
): ToolOutput<MentalHealthResult> {
  return buildMentalHealthOutput(input, assessMentalHealth(input), options);
}

export function runMentalHealth(
  rawInput: unknown,
  options: MentalHealthBuildOptions,
): { ok: true; output: ToolOutput<MentalHealthResult> } | { ok: false; error: unknown } {
  const parsed = mentalHealthInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildMentalHealthOutput(
    parsed.data,
    assessMentalHealth(parsed.data),
    options,
  );
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { MentalHealthInput, MentalHealthResult };
