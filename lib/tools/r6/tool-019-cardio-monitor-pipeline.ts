/**
 * lib/tools/r6/tool-019-cardio-monitor-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-019 (G-R6.1-1).
 *
 * End-to-end path for cardio monitor:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateCardioRisk) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateCardioRisk } from '@/lib/tools/engines/tool-019-cardio-monitor';
import {
  CardioInputSchema,
  CardioRiskSchema,
  type CardioInput,
  type CardioRisk,
} from '@/lib/tools/schemas/tool-019-cardio-monitor';

// Input contract + runtime validation boundary (Zod).
export const cardioMonitorInputSchema = createToolSchema(CardioInputSchema);

// Canonical unit recorded in provenance.
export const CARDIO_RESULT_UNIT = 'score';

export interface CardioMonitorBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildCardioMonitorOutput(
  input: CardioInput,
  engineResult: CardioRisk,
  options: CardioMonitorBuildOptions,
): ToolOutput<CardioRisk> {
  const tool = requireTool('tool-019-cardio-monitor');

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
      unit: CARDIO_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 100,
        unit: 'risk score',
        source: 'cardiovascular risk calculator',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: 'CALCULATED',
        severity: engineResult.overall_risk === 'high' ? 'important' : 'info',
      },
      {
        code: 'RISK_SCORE',
        labelAr: 'نقاط المخاطرة',
        labelEn: 'Risk score',
        value: engineResult.risk_score.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateCardioMonitorOutput(
  input: CardioInput,
  options: CardioMonitorBuildOptions,
): ToolOutput<CardioRisk> {
  return buildCardioMonitorOutput(input, calculateCardioRisk(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runCardioMonitor(
  rawInput: unknown,
  options: CardioMonitorBuildOptions,
): | { ok: true; output: ToolOutput<CardioRisk> }
  | { ok: false; error: unknown } {
  const parsed = cardioMonitorInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildCardioMonitorOutput(parsed.data, calculateCardioRisk(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { CardioInput, CardioRisk };
