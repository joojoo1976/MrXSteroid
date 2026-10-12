/**
 * Tool #098 — Sodium-Potassium Manager
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
  manageSodiumPotassium,
  type SodiumPotassiumManagerInput,
  type SodiumPotassiumManagerResult,
} from '../engines/tool-098-sodium-potassium-manager';

export interface SodiumPotassiumManagerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSodiumPotassiumManagerProvenance(options: SodiumPotassiumManagerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.80;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'ratio',
    measurementMethod: 'dietary electrolyte ratio and mineralocorticoid volume strain calculation (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0.8, high: 1.2, unit: 'ratio', source: 'ideal sodium-potassium dietary ratio' },
  };
}

export function buildSodiumPotassiumManagerKeyFindings(result: SodiumPotassiumManagerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'NA_K_RATIO',
      labelAr: 'نسبة الصوديوم إلى البوتاسيوم',
      labelEn: 'Sodium to potassium ratio',
      value: result.sodium_to_potassium_ratio,
      severity: result.sodium_to_potassium_ratio > 2.0 ? 'important' : result.sodium_to_potassium_ratio > 1.3 ? 'monitor' : 'info',
    },
    {
      code: 'ELECTROLYTE_TIER',
      labelAr: 'تصنيف توازن الإلكتروليتات',
      labelEn: 'Electrolyte balance tier',
      value: result.electrolyte_balance_tier,
      severity: result.electrolyte_balance_tier === 'potassium-deficient-high-risk' ? 'important' : result.electrolyte_balance_tier === 'sodium-dominant' ? 'monitor' : 'info',
    },
    {
      code: 'CV_STRAIN',
      labelAr: 'مؤشر الإجهاد الوعائي والحجمي',
      labelEn: 'Cardiovascular volume strain index',
      value: `${result.cardiovascular_strain_index}/100`,
      severity: result.cardiovascular_strain_index >= 60 ? 'important' : 'info',
    },
  ];
  for (const c of result.clinical_recommendations) {
    findings.push({ code: 'RECOMMENDATION', labelAr: 'توصية سريرية', labelEn: 'Clinical recommendation', value: c, severity: 'monitor' });
  }
  return findings;
}

export function buildSodiumPotassiumManagerOutput(rawInput: SodiumPotassiumManagerInput, options: SodiumPotassiumManagerOutputOptions): ToolOutput<SodiumPotassiumManagerResult> {
  const tool = requireTool('tool-098-sodium-potassium-manager');
  const result = manageSodiumPotassium(rawInput);
  return buildToolOutput<SodiumPotassiumManagerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSodiumPotassiumManagerProvenance(options),
    keyFindings: buildSodiumPotassiumManagerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
