/**
 * Tool #117 - Intra-Workout Nutrient Volumizer & Transport Engine
 * Layer 3: canonical ToolOutput envelope.
 */
import {
  type DataProvenance,
  type DataSource,
  type KeyFinding,
  type Locale,
  type SnapshotType,
  type ToolOutput,
  type UnitSystem,
} from '../contracts';
import { buildToolOutput, requireTool, buildSeoLinks } from '../registry';
import { calcIntraWorkout, type IntraWorkoutInput, type IntraWorkoutResult } from '../engines/tool-117-intra-workout-nutrient-volumizer';

export interface IntraWorkoutOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildIntraWorkoutProvenance(options: IntraWorkoutOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'g/h',
    measurementMethod: 'User-entered training parameters with reference ranges',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildIntraWorkoutKeyFindings(result: IntraWorkoutResult): KeyFinding[] {
  const { recommendations, session_totals, flags } = result;
  const findings: KeyFinding[] = [
    {
      code: 'CARBS_PER_HOUR',
      labelAr: 'الكربوهيدرات المستهدفة/ساعة',
      labelEn: 'Target Carbs/h',
      value: `${recommendations.carbohydrates.target_g_per_h} g/h`,
      severity: 'info',
    },
    {
      code: 'TOTAL_CARBS',
      labelAr: 'إجمالي الكربوهيدرات',
      labelEn: 'Total Carbs',
      value: `${session_totals.total_carbs_g} g`,
      severity: 'info',
    },
    {
      code: 'SODIUM_PER_HOUR',
      labelAr: 'الصوديوم المستهدف/ساعة',
      labelEn: 'Target Sodium/h',
      value: `${recommendations.electrolytes.sodium_mg_per_h} mg/h`,
      severity: 'info',
    },
    {
      code: 'FLUID_PER_HOUR',
      labelAr: 'السوائل المستهدفة/ساعة',
      labelEn: 'Target Fluid/h',
      value: `${recommendations.fluid.target_ml_per_h} ml/h`,
      severity: 'info',
    },
    {
      code: 'FLUID_SODIUM_CONC',
      labelAr: 'تركيز الصوديوم في السائل',
      labelEn: 'Fluid Sodium Concentration',
      value: `${recommendations.fluid.sodium_concentration_mmol_l} mmol/L`,
      severity: 'info',
    },
    {
      code: 'EAA_PER_HOUR',
      labelAr: 'الأحماض الأمينية الأساسية/ساعة',
      labelEn: 'Target EAA/h',
      value: `${recommendations.amino_acids.eaa_g_per_h} g/h`,
      severity: 'info',
    },
    {
      code: 'SCOPE_NOTICE',
      labelAr: 'حدود الأداة',
      labelEn: 'Tool Scope',
      value: result.scope_notice,
      severity: 'important',
    },
  ];

  for (const flag of flags) {
    findings.push({
      code: `FLAG_${flag.toUpperCase()}`,
      labelAr: `تنبيه: ${flag}`,
      labelEn: `Flag: ${flag}`,
      value: flag,
      severity: flag.includes('gi_risk') || flag.includes('below_target') ? 'important' : 'monitor',
    });
  }

  return findings;
}

export function buildIntraWorkoutOutput(
  rawInput: IntraWorkoutInput,
  options: IntraWorkoutOutputOptions,
): ToolOutput<IntraWorkoutResult> {
  const tool = requireTool('tool-117-intra-workout-nutrient-volumizer');
  const result = calcIntraWorkout(rawInput);
  return buildToolOutput<IntraWorkoutResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildIntraWorkoutProvenance(options),
    keyFindings: buildIntraWorkoutKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
