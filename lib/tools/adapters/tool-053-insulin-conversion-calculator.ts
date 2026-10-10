/**
 * Tool #053 — Insulin Conversion Calculator
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
  convertInsulin,
  type InsulinConversionInput,
  type InsulinConversionResult,
} from '../engines/tool-053-insulin-conversion-calculator';

export interface InsulinConversionOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildInsulinConversionProvenance(options: InsulinConversionOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.95 : 0.85;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'ml',
    measurementMethod: 'deterministic IU ↔ volume conversion across U-100/U-40 scales with mismatch exposure',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 1, unit: 'ml', source: 'syringe scales: U-100 = 100 units/ml, U-40 = 40 units/ml' },
  };
}

export function buildInsulinConversionKeyFindings(result: InsulinConversionResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'VOLUME_ML',
      labelAr: 'الحجم بالميليلتر',
      labelEn: 'Volume (ml)',
      value: `${result.volume_ml} ml`,
      severity: 'info',
    },
    {
      code: 'SCALE_MISMATCH',
      labelAr: 'قراءة المقياس الآخر',
      labelEn: 'Other-scale reading',
      value: `U-100: ${result.draw_units_u100} · U-40: ${result.draw_units_u40}`,
      severity: 'important', // the mismatch exposure IS the safety message
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildInsulinConversionOutput(rawInput: InsulinConversionInput, options: InsulinConversionOutputOptions): ToolOutput<InsulinConversionResult> {
  const tool = requireTool('tool-053-insulin-conversion-calculator');
  const result = convertInsulin(rawInput);
  return buildToolOutput<InsulinConversionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildInsulinConversionProvenance(options),
    keyFindings: buildInsulinConversionKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
