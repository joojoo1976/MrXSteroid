/**
 * lib/tools/r6/tool-051-peptide-dosage-pipeline.ts
 */
import { createToolSchema } from '@/lib/shared/schema-contract';
import { createToolOutput, type ToolOutput, isToolOutput } from '@/lib/tools/contracts';
import { requireTool, buildSeoLinks } from '@/lib/tools/registry';
import {
  computePeptideDose,
  type PeptideDoseResult,
} from '@/lib/tools/engines/tool-051-peptide-dosage-calculator';
import {
  PeptideDoseInputSchema,
  PeptideDoseResultSchema,
  type PeptideDoseInput,
} from '@/lib/tools/schemas/tool-051-peptide-dosage-calculator';

export const peptideDoseInputSchema = createToolSchema(PeptideDoseInputSchema);
export const PEPTIDE_DOSE_RESULT_UNIT = 'mg_per_ml';

export interface PeptideDoseBuildOptions {
  calculatedAt: string;
  recordedAt: string;
  locale: 'ar' | 'en';
  unitSystem: 'metric' | 'imperial';
  snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection';
  timezone?: string;
  source?: 'manual';
}

export function buildPeptideDoseOutput(
  input: PeptideDoseInput,
  engineResult: PeptideDoseResult,
  options: PeptideDoseBuildOptions,
): ToolOutput<PeptideDoseResult> {
  const tool = requireTool('tool-051-peptide-dosage-calculator');

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
      unit: PEPTIDE_DOSE_RESULT_UNIT,
      confidence: null,
      dataQuality: 'not_assessed',
    },
    keyFindings: [
      {
        code: 'CONCENTRATION',
        labelAr: 'التركيز',
        labelEn: 'Concentration',
        value: `${engineResult.concentration_mg_per_ml} mg/ml`,
        severity: 'info',
      },
      {
        code: 'DRAW_UNITS',
        labelAr: 'وحدات السحب',
        labelEn: 'Draw units',
        value: engineResult.draw_units_u100,
        severity: engineResult.clamped ? 'monitor' : 'info',
      },
    ],
    seoLinks: buildSeoLinks(tool),
  });
}

export function calculatePeptideDoseOutput(
  input: PeptideDoseInput,
  options: PeptideDoseBuildOptions,
): ToolOutput<PeptideDoseResult> {
  return buildPeptideDoseOutput(input, computePeptideDose(input), options);
}

export function runPeptideDose(
  rawInput: unknown,
  options: PeptideDoseBuildOptions,
): { ok: true; output: ToolOutput<PeptideDoseResult> } | { ok: false; error: unknown } {
  const parsed = peptideDoseInputSchema.tryParse(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const engineResult = computePeptideDose(parsed.data);
  const resultParsed = PeptideDoseResultSchema.safeParse(engineResult);
  if (!resultParsed.success) {
    return { ok: false, error: resultParsed.error };
  }
  const output = buildPeptideDoseOutput(parsed.data, resultParsed.data as PeptideDoseResult, options);
  if (!isToolOutput(output)) {
    return { ok: false, error: new Error('produced envelope failed contract guard') };
  }
  return { ok: true, output };
}

export type { PeptideDoseInput, PeptideDoseResult };
