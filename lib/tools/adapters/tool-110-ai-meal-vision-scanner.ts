/**
 * Tool #110 - AI Meal Vision Scanner & Portion Estimator
 * Layer 3: canonical ToolOutput envelope.
 */
import {
  deriveDataQuality,
  type DataProvenance,
  type DataSource,
  type KeyFinding,
  type Locale,
  type SnapshotType,
  type ToolOutput,
  type UnitSystem,
} from '../contracts';
import { buildToolOutput, requireTool, buildSeoLinks } from '../registry';
import { calcMealEstimate, type MealMealInput, type MealResult } from '../engines/tool-110-ai-meal-vision-scanner';

export interface MealOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildMealProvenance(options: MealOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'kcal',
    measurementMethod: 'deterministic reference portion estimator (educational)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
  };
}

export function buildMealKeyFindings(result: MealResult): KeyFinding[] {
  return [
    {
      code: 'PORTION_RANGE',
      labelAr: 'مقدار الحصة المقدرة',
      labelEn: 'Estimated portion range',
      value: result.portion_estimates.map((p) => `${p.food}:${p.estimate_g}g`).join('; '),
      severity: 'info',
    },
    {
      code: 'ENERGY',
      labelAr: 'الطاقة المقدرة',
      labelEn: 'Estimated energy',
      value: `${result.total_energy_kcal} kcal (${result.energy_range_kcal[0]}–${result.energy_range_kcal[1]})`,
      severity: 'info',
    },
    {
      code: 'PRIVACY',
      labelAr: 'خصوصية الصور',
      labelEn: 'Photo privacy',
      value: result.privacy_note,
      severity: 'important',
    },
    {
      code: 'SCOPE_NOTICE',
      labelAr: 'حدود الأداة',
      labelEn: 'Tool scope',
      value: result.scope_notice,
      severity: 'important',
    },
  ];
}

export function buildMealOutput(
  rawInput: MealMealInput,
  options: MealOutputOptions,
): ToolOutput<MealResult> {
  const tool = requireTool('tool-110-ai-meal-vision-scanner');
  const result = calcMealEstimate(rawInput);
  return buildToolOutput<MealResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildMealProvenance(options),
    keyFindings: buildMealKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
