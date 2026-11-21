/**
 * lib/tools/r6/tool-018-hpta-recovery-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-018 (G-R6.1-1).
 *
 * End-to-end path for HPTA recovery:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: assessHPTARecovery) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { z } from 'zod';
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { assessHPTARecovery } from '@/lib/tools/engines/tool-018-hpta-recovery';
import {
  HPTAMarkerSchema,
  HPTARecoveryStateSchema,
  type HPTAMarker,
  type HPTARecoveryState,
} from '@/lib/tools/schemas/tool-018-hpta-recovery';

// Input contract + runtime validation boundary (Zod).
export const hptaRecoveryInputSchema = createToolSchema(z.array(HPTAMarkerSchema));

// Canonical unit recorded in provenance.
export const HPTA_RESULT_UNIT = 'marker';

export interface HPTARecoveryBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildHPTARecoveryOutput(
  input: HPTAMarker[],
  engineResult: HPTARecoveryState,
  options: HPTARecoveryBuildOptions,
): ToolOutput<HPTARecoveryState> {
  const tool = requireTool('tool-018-hpta-recovery');

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
      unit: HPTA_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: input.length,
        unit: 'markers',
        source: 'user-entered HPTA markers',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: engineResult.stage,
        severity: engineResult.stage === 'unknown' ? 'important' : 'info',
      },
      {
        code: 'STAGE',
        labelAr: 'المرحلة',
        labelEn: 'Recovery stage',
        value: engineResult.stage,
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateHPTARecoveryOutput(
  input: HPTAMarker[],
  options: HPTARecoveryBuildOptions,
): ToolOutput<HPTARecoveryState> {
  return buildHPTARecoveryOutput(input, assessHPTARecovery(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runHPTARecovery(
  rawInput: unknown,
  options: HPTARecoveryBuildOptions,
): | { ok: true; output: ToolOutput<HPTARecoveryState> }
  | { ok: false; error: unknown } {
  const parsed = hptaRecoveryInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildHPTARecoveryOutput(parsed.data, assessHPTARecovery(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { HPTAMarker, HPTARecoveryState };
