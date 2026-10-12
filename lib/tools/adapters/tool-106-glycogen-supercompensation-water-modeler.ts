/**
 * Tool #106 - Glycogen Supercompensation & Water Retention Modeler
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
import { calcGlycogenModel, type GlycogenInput, type GlycogenResult } from '../engines/tool-106-glycogen-supercompensation-water-modeler';

export interface GlycogenOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildGlycogenProvenance(options: GlycogenOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.78;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'g',
    measurementMethod: 'referenced reference calculator (deterministic, educational)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
  };
}

export function buildGlycogenKeyFindings(result: GlycogenResult): KeyFinding[] {
  return [
    {
      code: 'GLYCOGEN_TARGET',
      labelAr: 'الهدف المقدر للجليكوجين',
      labelEn: 'Predicted glycogen target',
      value: `${result.total_glycogen_g} g`,
      severity: 'info',
    },
    {
      code: 'WATER_REFERENCE',
      labelAr: 'الترطيب المقدر',
      labelEn: 'Reference water retention',
      value: `${result.water_retention_liters} L`,
      severity: 'info',
    },
    {
      code: 'CARB_BUDGET',
      labelAr: 'ميزانية الكربوهيدرات',
      labelEn: 'Carb budget per day',
      value: `${result.carb_budget_per_day_g} g/kg`,
      severity: 'info',
    },
    {
      code: 'GI_RISK',
      labelAr: 'مؤشر تحمل الغلوكوز',
      labelEn: 'GI tolerance risk',
      value: result.gi_risk,
      severity: 'monitor',
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

export function buildGlycogenOutput(
  rawInput: GlycogenInput,
  options: GlycogenOutputOptions,
): ToolOutput<GlycogenResult> {
  const tool = requireTool('tool-106-glycogen-supercompensation-water-modeler');
  const result = calcGlycogenModel(rawInput);
  return buildToolOutput<GlycogenResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildGlycogenProvenance(options),
    keyFindings: buildGlycogenKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
