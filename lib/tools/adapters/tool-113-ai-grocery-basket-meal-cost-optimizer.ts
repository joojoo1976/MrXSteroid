/**
 * Tool #113 - AI Grocery Basket & Meal Cost Optimizer
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
import { calcGroceryOptimization, type GroceryInput, type GroceryResult } from '../engines/tool-113-ai-grocery-basket-meal-cost-optimizer';

export interface GroceryOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildGroceryProvenance(options: GroceryOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'USD',
    measurementMethod: 'User-entered prices optimized by deterministic rules',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildGroceryKeyFindings(result: GroceryResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'TOTAL_COST',
      labelAr: 'إجمالي التكلفة',
      labelEn: 'Total Cost',
      value: `$${result.total_cost_usd.toFixed(2)}`,
      severity: 'info',
    },
    {
      code: 'BUDGET_UTILIZATION',
      labelAr: 'استخدام الميزانية',
      labelEn: 'Budget Utilization',
      value: `${result.budget_utilization_pct}%`,
      severity: 'info',
    },
    {
      code: 'CALORIE_ACHIEVEMENT',
      labelAr: 'تحقيق السعرات',
      labelEn: 'Calorie Target Achievement',
      value: `${result.target_achievement.calories_pct}%`,
      severity: result.target_achievement.calories_pct >= 90 ? 'info' : 'monitor',
    },
    {
      code: 'PROTEIN_ACHIEVEMENT',
      labelAr: 'تحقيق البروتين',
      labelEn: 'Protein Target Achievement',
      value: `${result.target_achievement.protein_pct}%`,
      severity: result.target_achievement.protein_pct >= 90 ? 'info' : 'monitor',
    },
    {
      code: 'CARBS_ACHIEVEMENT',
      labelAr: 'تحقيق الكربوهيدرات',
      labelEn: 'Carbs Target Achievement',
      value: `${result.target_achievement.carbs_pct}%`,
      severity: result.target_achievement.carbs_pct >= 90 ? 'info' : 'monitor',
    },
    {
      code: 'FAT_ACHIEVEMENT',
      labelAr: 'تحقيق الدهون',
      labelEn: 'Fat Target Achievement',
      value: `${result.target_achievement.fat_pct}%`,
      severity: result.target_achievement.fat_pct >= 90 ? 'info' : 'monitor',
    },
    {
      code: 'ITEMS_SELECTED',
      labelAr: 'العناصر المختارة',
      labelEn: 'Items Selected',
      value: `${result.selected_items.length}`,
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

  // Add flags as findings
  for (const flag of result.flags) {
    findings.push({
      code: `FLAG_${flag.toUpperCase()}`,
      labelAr: `تنبيه: ${flag}`,
      labelEn: `Flag: ${flag}`,
      value: flag,
      severity: flag.includes('not_met') || flag.includes('near_limit') ? 'important' : 'monitor',
    });
  }

  return findings;
}

export function buildGroceryOutput(
  rawInput: GroceryInput,
  options: GroceryOutputOptions,
): ToolOutput<GroceryResult> {
  const tool = requireTool('tool-113-ai-grocery-basket-meal-cost-optimizer');
  const result = calcGroceryOptimization(rawInput);
  return buildToolOutput<GroceryResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildGroceryProvenance(options),
    keyFindings: buildGroceryKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
