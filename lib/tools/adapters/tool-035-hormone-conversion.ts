/**
 * Tool #035 — Hormone Conversion Calculator (Layer 3: persistence + AI adapter).
 * Pure wrapper: engine math + canonical `ToolOutput` envelope. No I/O here.
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
  calculateHormoneConversion,
  type ConversionInput,
  type ConversionResult,
} from '../engines/tool-035-hormone-conversion';

export interface ConversionOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildConversionProvenance(options: ConversionOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.65 : 0.55;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'pg/mL',
    measurementMethod: 'documented aromatization heuristic — serum labs required for confirmation',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 20, high: 40, unit: 'pg/mL', source: 'Male E2 reference band' },
  };
}

export function buildConversionKeyFindings(result: ConversionResult): KeyFinding[] {
  return [
    {
      code: 'ESTIMATED_E2',
      labelAr: 'الإستراديول التقديري',
      labelEn: 'Estimated Estradiol',
      value: `${result.estimated_e2_pg_ml} pg/mL (${result.e2_status})`,
      severity: result.e2_status === 'optimal' ? 'info' : result.e2_status === 'very-high' ? 'important' : 'monitor',
    },
    {
      code: 'TEST_E2_RATIO',
      labelAr: 'نسبة T:E2',
      labelEn: 'T:E2 Ratio',
      value: result.test_to_e2_ratio,
      severity: 'info',
    },
  ];
}

export function buildConversionOutput(
  rawInput: ConversionInput,
  options: ConversionOutputOptions,
): ToolOutput<ConversionResult> {
  const tool = requireTool('tool-035-hormone-conversion');
  const result = calculateHormoneConversion(rawInput);
  return buildToolOutput<ConversionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildConversionProvenance(options),
    keyFindings: buildConversionKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
