/**
 * lib/tools/r6/tool-046-trt-lifetime-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-046 (TRT lifetime).
 *
 * End-to-end path for the TRT lifetime calculator:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: projectTrtLifetime) ->
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
  projectTrtLifetime,
  type TrtLifetimeResult,
} from '@/lib/tools/engines/tool-046-trt-lifetime';
import {
  TrtLifetimeInputSchema,
  TrtLifetimeResultSchema,
  type TrtLifetimeInput,
} from '@/lib/tools/schemas/tool-046-trt-lifetime';

// Input contract + runtime validation boundary (Zod).
export const trtLifetimeInputSchema = createToolSchema(TrtLifetimeInputSchema);

// Canonical unit recorded in provenance.
export const TRT_LIFETIME_RESULT_UNIT = 'USD';

export interface TrtLifetimeBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildTrtLifetimeOutput(
  input: TrtLifetimeInput,
  engineResult: TrtLifetimeResult,
  options: TrtLifetimeBuildOptions,
): ToolOutput<TrtLifetimeResult> {
  const tool = requireTool('tool-046-trt-lifetime');

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
      unit: TRT_LIFETIME_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
    },
    keyFindings: [
      {
        code: 'COST_10Y',
        labelAr: 'التكلفة على 10 سنوات',
        labelEn: '10-year cost',
        value: `$${engineResult.cost_projection.horizon10.total_cost_usd.toLocaleString('en-US')}`,
        severity: 'info',
      },
      {
        code: 'ANNUAL_PANELS',
        labelAr: 'تحاليل الدم السنوية',
        labelEn: 'Annual bloodwork panels',
        value: String(engineResult.annual_bloodwork_panels),
        severity: engineResult.annual_bloodwork_panels >= 3 ? 'monitor' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateTrtLifetimeOutput(
  input: TrtLifetimeInput,
  options: TrtLifetimeBuildOptions,
): ToolOutput<TrtLifetimeResult> {
  return buildTrtLifetimeOutput(input, projectTrtLifetime(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runTrtLifetime(
  rawInput: unknown,
  options: TrtLifetimeBuildOptions,
): | { ok: true; output: ToolOutput<TrtLifetimeResult> }
  | { ok: false; error: unknown } {
  const parsed = trtLifetimeInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = projectTrtLifetime(parsed.data);
  const resultParsed = TrtLifetimeResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildTrtLifetimeOutput(parsed.data, resultParsed.data as TrtLifetimeResult, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { TrtLifetimeInput, TrtLifetimeResult };
