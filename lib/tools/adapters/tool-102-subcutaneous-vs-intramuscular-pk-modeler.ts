/**
 * Tool #102 — Subcutaneous vs. Intramuscular PK Modeler
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
  calculateSubqVsIm,
  type SubqVsImInput,
  type SubqVsImResult,
} from '../engines/tool-102-subcutaneous-vs-intramuscular-pk-modeler';

export interface SubqVsImOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSubqVsImProvenance(options: SubqVsImOutputOptions): DataProvenance {
  const confidence = 0.75;
  return {
    source: options.provenanceSource ?? 'manual',
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mg/ml',
    measurementMethod: 'bateman absorption-elimination absorption-curve model (educational)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
  };
}

export function buildSubqVsImKeyFindings(result: SubqVsImResult): KeyFinding[] {
  return [
    {
      code: 'VOLUME',
      labelAr: 'حجم الحقنة المحسوب',
      labelEn: 'Computed injection volume',
      value: `${result.volume_ml} mL @ ${result.concentration_mg_ml} mg/mL`,
      severity: 'info',
    },
    {
      code: 'FASTER_PEAK',
      labelAr: 'الطريق الأسرع للذروة',
      labelEn: 'Faster peak route',
      value: result.faster_peak_route,
      severity: 'info',
    },
    {
      code: 'SCOPE',
      labelAr: 'حدود النطاق',
      labelEn: 'Scope boundary',
      value: result.scope_notice,
      severity: 'important',
    },
  ];
}

export function buildSubqVsImOutput(
  rawInput: SubqVsImInput,
  options: SubqVsImOutputOptions,
): ToolOutput<SubqVsImResult> {
  const tool = requireTool('tool-102-subcutaneous-vs-intramuscular-pk-modeler');
  const result = calculateSubqVsIm(rawInput);
  return buildToolOutput<SubqVsImResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSubqVsImProvenance(options),
    keyFindings: buildSubqVsImKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}



