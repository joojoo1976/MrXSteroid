/**
 * Tool #060 — 5-Alpha Conversion Calculator
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
  estimateDhtConversion,
  type DhtConversionInput,
  type DhtConversionResult,
} from '../engines/tool-060-5-alpha-conversion-calculator';

export interface DhtConversionOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildDhtConversionProvenance(options: DhtConversionOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'ng/dL',
    measurementMethod: 'documented 5-alpha conversion factor model with 5-ARI inhibition dampening (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 30, high: 85, unit: 'ng/dL', source: 'published adult-male DHT educational range' },
  };
}

export function buildDhtConversionKeyFindings(result: DhtConversionResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'DHT_ESTIMATE',
      labelAr: 'تقدير DHT',
      labelEn: 'DHT estimate',
      value: `${result.dht_estimate_ng_dl} ng/dL`,
      severity: result.band === 'normal-range' ? 'info' : 'monitor',
    },
    {
      code: 'SUPPRESSION',
      labelAr: 'نسبة الكبح عن الأساس',
      labelEn: 'Suppression vs baseline',
      value: `${result.suppression_pct}%`,
      severity: result.suppression_pct >= 50 ? 'monitor' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildDhtConversionOutput(rawInput: DhtConversionInput, options: DhtConversionOutputOptions): ToolOutput<DhtConversionResult> {
  const tool = requireTool('tool-060-5-alpha-conversion-calculator');
  const result = estimateDhtConversion(rawInput);
  return buildToolOutput<DhtConversionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildDhtConversionProvenance(options),
    keyFindings: buildDhtConversionKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
