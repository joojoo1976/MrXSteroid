/**
 * lib/tools/r6/tool-028-stacking-synergy-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-028 (G-R6.1-1).
 *
 * End-to-end path for stacking synergy:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: buildStackComparisonWorksheetV7) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { buildStackComparisonWorksheetV7 } from '@/lib/tools/engines/tool-028-stacking-synergy';
import {
  StackComparisonInputSchema,
  StackComparisonResultSchema,
  type StackComparisonInput,
  type StackComparisonResult,
} from '@/lib/tools/schemas/tool-028-stacking-synergy';

// Input contract + runtime validation boundary (Zod).
export const stackingSynergyInputSchema = createToolSchema(StackComparisonInputSchema);

// Canonical unit recorded in provenance.
export const STACKING_SYNERGY_RESULT_UNIT = 'scenario';

export interface StackingSynergyBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildStackingSynergyOutput(
  input: StackComparisonInput,
  engineResult: StackComparisonResult,
  options: StackingSynergyBuildOptions,
): ToolOutput<StackComparisonResult> {
  const tool = requireTool('tool-028-stacking-synergy');

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
      unit: STACKING_SYNERGY_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: 2,
        unit: 'scenarios',
        source: 'stack comparison worksheet',
      },
    },
    keyFindings: [
      {
        code: 'RESULT_STATUS',
        labelAr: 'حالة النتيجة',
        labelEn: 'Result status',
        value: engineResult.assessment,
        severity: engineResult.assessment === 'NOT_AVAILABLE' ? 'important' : 'info',
      },
      {
        code: 'SCENARIO_COUNT',
        labelAr: 'عدد السيناريوهات',
        labelEn: 'Scenario count',
        value: '2',
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateStackingSynergyOutput(
  input: StackComparisonInput,
  options: StackingSynergyBuildOptions,
): ToolOutput<StackComparisonResult> {
  return buildStackingSynergyOutput(input, buildStackComparisonWorksheetV7(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runStackingSynergy(
  rawInput: unknown,
  options: StackingSynergyBuildOptions,
): | { ok: true; output: ToolOutput<StackComparisonResult> }
  | { ok: false; error: unknown } {
  const parsed = stackingSynergyInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildStackingSynergyOutput(parsed.data, buildStackComparisonWorksheetV7(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { StackComparisonInput, StackComparisonResult };
