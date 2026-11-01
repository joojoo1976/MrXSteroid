/**
 * Tool #112 - Food Quality & Micronutrient Diversity Score
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
import { calcFoodQualityScore, type FoodQualityInput, type FoodQualityResult } from '../engines/tool-112-food-quality-micronutrient-diversity-score';

export interface FoodQualityOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildFoodQualityProvenance(options: FoodQualityOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'User-entered food log scored by deterministic rules',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildFoodQualityKeyFindings(result: FoodQualityResult): KeyFinding[] {
  return [
    {
      code: 'FOOD_QUALITY_SCORE',
      labelAr: 'مؤشر جودة الغذاء',
      labelEn: 'Food Quality Score',
      value: `${result.food_quality_score}/100`,
      severity: 'info',
    },
    {
      code: 'MICRONUTRIENT_DIVERSITY',
      labelAr: 'تنوع المغذيات الدقيقة',
      labelEn: 'Micronutrient Diversity',
      value: `${result.micronutrient_diversity_score}/100`,
      severity: 'info',
    },
    {
      code: 'WHOLE_FOOD_RATIO',
      labelAr: 'نسبة الأطعمة الكاملة',
      labelEn: 'Whole Food Ratio',
      value: `${Math.round(result.whole_food_ratio * 100)}%`,
      severity: 'info',
    },
    {
      code: 'FOOD_GROUP_COVERAGE',
      labelAr: 'تغطية المجموعات الغذائية',
      labelEn: 'Food Group Coverage',
      value: `${Math.round(result.food_group_coverage * 100)}%`,
      severity: 'info',
    },
    {
      code: 'ULTRA_PROCESSED_RATIO',
      labelAr: 'نسبة الأطعمة فائقة المعالجة',
      labelEn: 'Ultra-Processed Ratio',
      value: `${Math.round(result.processing_distribution.ultra_processed * 100)}%`,
      severity: result.processing_distribution.ultra_processed > 0.3 ? 'important' : 'info',
    },
    {
      code: 'UNIQUE_MICRONUTRIENTS',
      labelAr: 'المغذيات الدقيقة الفريدة',
      labelEn: 'Unique Micronutrients',
      value: `${result.unique_micronutrients}`,
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
}

export function buildFoodQualityOutput(
  rawInput: FoodQualityInput,
  options: FoodQualityOutputOptions,
): ToolOutput<FoodQualityResult> {
  const tool = requireTool('tool-112-food-quality-micronutrient-diversity-score');
  const result = calcFoodQualityScore(rawInput);
  return buildToolOutput<FoodQualityResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildFoodQualityProvenance(options),
    keyFindings: buildFoodQualityKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
