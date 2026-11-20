/**
 * lib/tools/r6/tool-036-injection-schedule-pipeline.ts
 * Slice C pilot — V6 deterministic engine integration for tool-036 (G-R6.1-1).
 *
 * End-to-end path for injection schedule:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: planInjectionSchedule) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps/timezone injected by the caller. No database, no
 * Supabase, no I/O. Reuses canonical contracts only.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { planInjectionSchedule } from '@/lib/tools/engines/tool-036-injection-schedule';
import {
  InjectionScheduleInputSchema,
  InjectionScheduleResultSchema,
  type InjectionScheduleInput,
  type InjectionScheduleResult,
} from '@/lib/tools/schemas/tool-036-injection-schedule';

// Input contract + runtime validation boundary (Zod).
export const injectionScheduleInputSchema = createToolSchema(InjectionScheduleInputSchema);

// Canonical unit recorded in provenance.
export const INJECTION_SCHEDULE_RESULT_UNIT = 'shot';

export interface InjectionScheduleBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildInjectionScheduleOutput(
  input: InjectionScheduleInput,
  engineResult: InjectionScheduleResult,
  options: InjectionScheduleBuildOptions,
): ToolOutput<InjectionScheduleResult> {
  const tool = requireTool('tool-036-injection-schedule');

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
      unit: INJECTION_SCHEDULE_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
      referenceRange: {
        low: 0,
        high: engineResult.shots.length,
        unit: 'shots',
        source: 'injection schedule planner',
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
        code: 'SHOT_COUNT',
        labelAr: 'عدد الحقن',
        labelEn: 'Shot count',
        value: engineResult.shots.length.toString(),
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateInjectionScheduleOutput(
  input: InjectionScheduleInput,
  options: InjectionScheduleBuildOptions,
): ToolOutput<InjectionScheduleResult> {
  return buildInjectionScheduleOutput(input, planInjectionSchedule(input), options);
}

// Full pipeline: validate -> compute -> structured output.
// Returns { ok: true, output } or { ok: false, error } (fails safely).
export function runInjectionSchedule(
  rawInput: unknown,
  options: InjectionScheduleBuildOptions,
): | { ok: true; output: ToolOutput<InjectionScheduleResult> }
  | { ok: false; error: unknown } {
  const parsed = injectionScheduleInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildInjectionScheduleOutput(parsed.data, planInjectionSchedule(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { InjectionScheduleInput, InjectionScheduleResult };
