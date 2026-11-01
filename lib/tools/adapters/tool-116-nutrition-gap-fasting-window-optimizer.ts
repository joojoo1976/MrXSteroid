/**
 * Tool #116 - Nutrition Gap & Fasting Window Optimizer
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
import { calcNutritionGap, type NutritionGapInput, type NutritionGapResult } from '../engines/tool-116-nutrition-gap-fasting-window-optimizer';

export interface NutritionGapOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildNutritionGapProvenance(options: NutritionGapOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mg',
    measurementMethod: 'Self-reported food log compared with reference intake values',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildNutritionGapKeyFindings(result: NutritionGapResult): KeyFinding[] {
  const findings: KeyFinding[] = [];

  // Per-nutrient status
  for (const nutrient of result.nutrient_analysis) {
    if (nutrient.status !== 'adequate') {
      findings.push({
        code: `NUTRIENT_${nutrient.nutrient.toUpperCase()}`,
        labelAr: `${nutrient.nutrient}: ${nutrient.status}`,
        labelEn: `${nutrient.nutrient}: ${nutrient.status}`,
        value: `${nutrient.pct_rda}% RDA (${nutrient.avg_intake.toFixed(1)}/${nutrient.rda} ${RDA_UNITS[nutrient.nutrient as keyof typeof RDA_UNITS]})`,
        severity: nutrient.status === 'very_low' ? 'important' : nutrient.status === 'low' ? 'monitor' : 'info',
      });
    }
  }

  // Identified gaps summary
  if (result.identified_gaps.length > 0) {
    findings.push({
      code: 'IDENTIFIED_GAPS',
      labelAr: 'الفجوات المحددة',
      labelEn: 'Identified Gaps',
      value: result.identified_gaps.length,
      severity: result.identified_gaps.length > 3 ? 'important' : 'monitor',
    });
  }

  // Fasting recommendation
  const fr = result.fasting_recommendation;
  findings.push({
    code: 'FASTING_WINDOW',
    labelAr: 'نافذة الصيام المقترحة',
    labelEn: 'Suggested Fasting Window',
    value: `${fr.suggested_window_hours}:${24 - fr.suggested_window_hours} (${fr.eating_window_start}–${fr.eating_window_end})`,
    severity: 'info',
  });

  findings.push({
    code: 'FASTING_RATIONALE',
    labelAr: 'الأساس المنطقي',
    labelEn: 'Rationale',
    value: fr.rationale,
    severity: 'info',
  });

  // Flags
  for (const flag of result.flags) {
    findings.push({
      code: `FLAG_${flag.toUpperCase()}`,
      labelAr: `تنبيه: ${flag}`,
      labelEn: `Flag: ${flag}`,
      value: flag,
      severity: flag.includes('critical') || flag.includes('multiple') ? 'important' : 'monitor',
    });
  }

  findings.push({
    code: 'SCOPE_NOTICE',
    labelAr: 'حدود الأداة',
    labelEn: 'Tool Scope',
    value: result.scope_notice,
    severity: 'important',
  });

  return findings;
}

// Unit mapping for display
const RDA_UNITS: Record<string, string> = {
  vitamin_a: 'mcg', vitamin_c: 'mg', vitamin_d: 'mcg', vitamin_e: 'mg', vitamin_k: 'mcg',
  thiamin: 'mg', riboflavin: 'mg', niacin: 'mg', vitamin_b6: 'mg', folate: 'mcg', vitamin_b12: 'mcg',
  calcium: 'mg', iron: 'mg', magnesium: 'mg', phosphorus: 'mg', potassium: 'mg', zinc: 'mg',
  copper: 'mcg', manganese: 'mg', selenium: 'mcg', iodine: 'mcg', chromium: 'mcg', molybdenum: 'mcg',
};

export function buildNutritionGapOutput(
  rawInput: NutritionGapInput,
  options: NutritionGapOutputOptions,
): ToolOutput<NutritionGapResult> {
  const tool = requireTool('tool-116-nutrition-gap-fasting-window-optimizer');
  const result = calcNutritionGap(rawInput);
  return buildToolOutput<NutritionGapResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildNutritionGapProvenance(options),
    keyFindings: buildNutritionGapKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
