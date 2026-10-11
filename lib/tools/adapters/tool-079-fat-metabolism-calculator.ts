/**
 * Tool #079 — Fat Metabolism Calculator
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
import {
  calculateFatMetabolism,
  type FatMetabolismInput,
  type FatMetabolismResult,
} from '../engines/tool-079-fat-metabolism-calculator';

export interface FatMetabolismOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildFatMetabolismProvenance(options: FatMetabolismOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.72;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'g/hr',
    measurementMethod: 'heart rate reserve substrate oxidation estimation (Achten FatMax model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 20, high: 55, unit: 'g/hr', source: 'typical fat oxidation range at FatMax zone' },
  };
}

export function buildFatMetabolismKeyFindings(result: FatMetabolismResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'FAT_OXIDATION',
      labelAr: 'معدل أكسدة الدهون التقديري',
      labelEn: 'Estimated fat oxidation rate',
      value: `${result.estimated_fat_oxidation_g_hr} g/hr`,
      severity: 'info',
    },
    {
      code: 'CARB_OXIDATION',
      labelAr: 'معدل أكسدة الكربوهيدرات التقديري',
      labelEn: 'Estimated carbohydrate oxidation rate',
      value: `${result.estimated_carb_oxidation_g_hr} g/hr`,
      severity: 'info',
    },
    {
      code: 'ESTIMATED_RER',
      labelAr: 'معامل تبادل التنفس التقديري',
      labelEn: 'Estimated RER',
      value: `${result.estimated_rer}`,
      severity: result.estimated_rer >= 0.95 ? 'monitor' : 'info',
    },
    {
      code: 'ZONE_STATE',
      labelAr: 'نمط الوقود السائد',
      labelEn: 'Predominant fuel state',
      value: result.zone_state,
      severity: 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildFatMetabolismOutput(rawInput: FatMetabolismInput, options: FatMetabolismOutputOptions): ToolOutput<FatMetabolismResult> {
  const tool = requireTool('tool-079-fat-metabolism-calculator');
  const result = calculateFatMetabolism(rawInput);
  return buildToolOutput<FatMetabolismResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildFatMetabolismProvenance(options),
    keyFindings: buildFatMetabolismKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
