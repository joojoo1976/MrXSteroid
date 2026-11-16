/**
 * lib/tools/r6/tool-048-cardiovascular-risk-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-048 (cardiovascular risk).
 *
 * End-to-end path for the educational cardiovascular risk assessor:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: assessCardiovascularRisk) ->
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
  assessCardiovascularRisk,
  type CardioRiskResult,
} from '@/lib/tools/engines/tool-048-cardiovascular-risk';
import {
  CardioRiskInputSchema,
  type CardioRiskInput,
} from '@/lib/tools/schemas/tool-048-cardiovascular-risk';

// Input contract + runtime validation boundary (Zod).
export const cardioRiskInputSchema = createToolSchema(CardioRiskInputSchema);

// Canonical unit recorded in provenance.
export const CARDIO_RISK_RESULT_UNIT = 'percent_10_year';

export interface CardioRiskBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildCardioRiskOutput(
  input: CardioRiskInput,
  engineResult: CardioRiskResult,
  options: CardioRiskBuildOptions,
): ToolOutput<CardioRiskResult> {
  const tool = requireTool('tool-048-cardiovascular-risk');

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
      unit: CARDIO_RISK_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
    },
    keyFindings: [
      {
        code: 'RISK_10YR',
        labelAr: 'خطر 10 سنوات (تقديري)',
        labelEn: '10-year risk (educational)',
        value: `${engineResult.risk_pct_10yr}%`,
        severity:
          engineResult.band === 'high'
            ? 'important'
            : engineResult.band === 'elevated'
              ? 'monitor'
              : 'info',
      },
      {
        code: 'BAND',
        labelAr: 'التصنيف',
        labelEn: 'Band',
        value: engineResult.band,
        severity:
          engineResult.band === 'high'
            ? 'important'
            : engineResult.band === 'elevated'
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
export function calculateCardioRiskOutput(
  input: CardioRiskInput,
  options: CardioRiskBuildOptions,
): ToolOutput<CardioRiskResult> {
  return buildCardioRiskOutput(input, assessCardiovascularRisk(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runCardioRisk(
  rawInput: unknown,
  options: CardioRiskBuildOptions,
): | { ok: true; output: ToolOutput<CardioRiskResult> }
  | { ok: false; error: unknown } {
  const parsed = cardioRiskInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildCardioRiskOutput(
    parsed.data,
    assessCardiovascularRisk(parsed.data),
    options,
  );
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { CardioRiskInput, CardioRiskResult };
