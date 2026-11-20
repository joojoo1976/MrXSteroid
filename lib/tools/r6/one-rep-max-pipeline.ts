/**
 * lib/tools/r6/one-rep-max-pipeline.ts
 * Slice C pilot — second V6 deterministic engine integration (G-R6.1-1).
 *
 * End-to-end path for one-rep-max:
 *   Input Contract (Zod, via schema-contract) ->
 *   Runtime Validation ->
 *   Existing V6 Engine (authoritative, unmodified: calculateOneRepMax) ->
 *   Output Validation (fail-fast ToolOutput envelope) ->
 *   Structured Result.
 *
 * PURE MODULE — timestamps injected by the caller. No database, no Supabase, no I/O.
 * Reuses canonical contracts only (createToolSchema, createToolOutput, isToolOutput).
 * Does not modify the existing engine, schema, registry, or contracts.
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import { calculateOneRepMax, type OneRepMaxInput, type OneRepMaxOutput } from '@/lib/tools/engines/one-rep-max.v6';
import { z } from 'zod';

// Input contract + runtime validation boundary (Zod).
const oneRepMaxInputSchema = z.object({
  weightKg: z.number().finite().positive().max(1000),
  reps: z.number().int().positive().max(100),
});
export const ormInputSchema = createToolSchema(oneRepMaxInputSchema);

// Canonical unit for the one-rep-max engine (kg).
export const ORM_RESULT_UNIT = 'kg';

export interface OrmBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildOrmOutput(
  input: OneRepMaxInput,
  engineResult: OneRepMaxOutput,
  options: OrmBuildOptions,
): ToolOutput<OneRepMaxOutput> {
  const tool = requireTool('one-rep-max');

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
      unit: ORM_RESULT_UNIT,
      confidence: 0.85,
      dataQuality: 'medium',
      referenceRange: {
        low: 0,
        high: 1000,
        unit: 'kg',
        source: 'one-rep-max Epley formula estimate',
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
        code: 'FORMULA',
        labelAr: 'الصيغة',
        labelEn: 'Formula',
        value: 'Epley: 1RM = weight × (1 + reps / 30)',
        severity: 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

/**
 * Convenience: compute via the V6 engine, then build the structured output.
 */
export function calculateOrmOutput(
  input: OneRepMaxInput,
  options: OrmBuildOptions,
): ToolOutput<OneRepMaxOutput> {
  return buildOrmOutput(input, calculateOneRepMax(input), options);
}

// Full pipeline: validate -> compute -> structured output.
export function runOrm(
  rawInput: unknown,
  options: OrmBuildOptions,
):
  | { ok: true; output: ToolOutput<OneRepMaxOutput> }
  | { ok: false; error: unknown } {
  const parsed = ormInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const output = buildOrmOutput(parsed.data, calculateOneRepMax(parsed.data), options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { OneRepMaxInput, OneRepMaxOutput };
