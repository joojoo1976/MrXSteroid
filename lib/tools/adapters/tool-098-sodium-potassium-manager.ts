import { deriveDataQuality, type DataProvenance, type DataSource, type KeyFinding, type Locale, type SnapshotType, type ToolOutput, type UnitSystem } from '../contracts';
import { buildSeoLinks, buildToolOutput, requireTool } from '../registry';
import { manageSodiumPotassium, type SodiumPotassiumManagerInput, type SodiumPotassiumManagerResult } from '../engines/tool-098-sodium-potassium-manager';

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
  return {
    source: options.provenanceSource ?? 'manual',
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mg/mg ratio',
    originalUnit: 'mg/mg',
    measurementMethod: 'User-entered dietary sodium and potassium amounts; direct arithmetic ratio',
    confidence: null,
    dataQuality: deriveDataQuality(null),
  };
}

export function buildSodiumPotassiumManagerKeyFindings(result: SodiumPotassiumManagerResult): KeyFinding[] {
  return [{
    code: 'NA_K_RATIO',
    labelAr: 'نسبة الصوديوم إلى البوتاسيوم المدخلة',
    labelEn: 'Entered sodium-to-potassium ratio',
    value: result.sodium_to_potassium_ratio,
    severity: 'info',
  }, {
    code: 'RESULT_TYPE',
    labelAr: 'نوع النتيجة',
    labelEn: 'Result type',
    value: 'CALCULATED',
    severity: 'info',
  }];
}

export function buildSodiumPotassiumManagerOutput(rawInput: SodiumPotassiumManagerInput, options: SodiumPotassiumManagerOutputOptions): ToolOutput<SodiumPotassiumManagerResult> {
  const tool = requireTool('tool-098-sodium-potassium-manager');
  const result = manageSodiumPotassium(rawInput);
  return buildToolOutput({
    toolId: tool.toolId, toolSlug: tool.slug, calculatedAt: options.calculatedAt, locale: options.locale,
    unitSystem: options.unitSystem, snapshotType: options.snapshotType, accessTier: tool.accessTier,
    result, provenance: buildSodiumPotassiumManagerProvenance(options), keyFindings: buildSodiumPotassiumManagerKeyFindings(result), seoLinks: buildSeoLinks(tool),
  });
}
