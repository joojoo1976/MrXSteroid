/** Tool #035 — conversion-only adapter; no health interpretation. */
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

export function buildConversionProvenance(options: ConversionOutputOptions, result: ConversionResult): DataProvenance {
  return {
    source: options.provenanceSource ?? 'manual',
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: result.result_unit,
    originalUnit: result.input_unit,
    measurementMethod: 'molar-mass-derived unit conversion; user-entered result source is not verified',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildConversionKeyFindings(result: ConversionResult): KeyFinding[] {
  return [{
    code: 'HORMONE_UNIT_CONVERSION',
    labelAr: 'تحويل وحدة تركيز مخبري',
    labelEn: 'Lab Concentration Unit Conversion',
    value: `${result.result_value} ${result.result_unit}`,
    severity: 'info',
  }];
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
    provenance: buildConversionProvenance(options, result),
    keyFindings: buildConversionKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
