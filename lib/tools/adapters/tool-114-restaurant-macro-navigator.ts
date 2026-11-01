/**
 * Tool #114 - Restaurant Macro Navigator & Fast-Food Estimator
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
import { calcRestaurantMacros, type RestaurantInput, type RestaurantResult } from '../engines/tool-114-restaurant-macro-navigator';

export interface RestaurantOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildRestaurantProvenance(options: RestaurantOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'g',
    measurementMethod: 'User-entered or reference-estimated restaurant nutrition',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildRestaurantKeyFindings(result: RestaurantResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'TOTAL_CALORIES',
      labelAr: 'إجمالي السعرات المقدرة',
      labelEn: 'Total Estimated Calories',
      value: `${result.daily_totals.calories} kcal`,
      severity: 'info',
    },
    {
      code: 'TOTAL_PROTEIN',
      labelAr: 'إجمالي البروتين المقدر',
      labelEn: 'Total Estimated Protein',
      value: `${result.daily_totals.protein_g} g`,
      severity: 'info',
    },
    {
      code: 'TOTAL_CARBS',
      labelAr: 'إجمالي الكربوهيدرات المقدر',
      labelEn: 'Total Estimated Carbs',
      value: `${result.daily_totals.carbs_g} g`,
      severity: 'info',
    },
    {
      code: 'TOTAL_FAT',
      labelAr: 'إجمالي الدهون المقدر',
      labelEn: 'Total Estimated Fat',
      value: `${result.daily_totals.fat_g} g`,
      severity: 'info',
    },
    {
      code: 'UNCERTAINTY_CALORIES',
      labelAr: 'نطاق عدم اليقين (السعرات)',
      labelEn: 'Uncertainty Range (Calories)',
      value: `${result.daily_uncertainty.calories[0]} - ${result.daily_uncertainty.calories[1]} kcal`,
      severity: 'monitor',
    },
    {
      code: 'SCOPE_NOTICE',
      labelAr: 'حدود الأداة',
      labelEn: 'Tool Scope',
      value: result.scope_notice,
      severity: 'important',
    },
  ];

  // Confidence distribution
  const confidenceCounts = result.items.reduce((acc, item) => {
    acc[item.confidence] = (acc[item.confidence] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (confidenceCounts.low) {
    findings.push({
      code: 'LOW_CONFIDENCE_ITEMS',
      labelAr: 'عناصر ذات ثقة منخفضة',
      labelEn: 'Low Confidence Items',
      value: `${confidenceCounts.low} items`,
      severity: 'monitor',
    });
  }

  // Flags
  for (const flag of result.flags) {
    findings.push({
      code: `FLAG_${flag.toUpperCase()}`,
      labelAr: `تنبيه: ${flag}`,
      labelEn: `Flag: ${flag}`,
      value: flag,
      severity: flag.includes('high_calorie') || flag.includes('low_protein') ? 'important' : 'monitor',
    });
  }

  return findings;
}

export function buildRestaurantOutput(
  rawInput: RestaurantInput,
  options: RestaurantOutputOptions,
): ToolOutput<RestaurantResult> {
  const tool = requireTool('tool-114-restaurant-macro-navigator');
  const result = calcRestaurantMacros(rawInput);
  return buildToolOutput<RestaurantResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildRestaurantProvenance(options),
    keyFindings: buildRestaurantKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
