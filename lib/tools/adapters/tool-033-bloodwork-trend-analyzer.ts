/**
 * Tool #033 — Bloodwork Trend Analyzer (Layer 3: persistence + AI adapter).
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
  analyzeBloodworkTrends,
  type TrendAnalyzerInput,
  type TrendAnalyzerResult,
} from '../engines/tool-033-bloodwork-trend-analyzer';

export interface TrendAnalyzerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildTrendAnalyzerProvenance(options: TrendAnalyzerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'lab values',
    measurementMethod: 'least-squares trend slopes over dated lab draws',
    confidence,
    dataQuality: deriveDataQuality(confidence),
  };
}

export function buildTrendAnalyzerKeyFindings(result: TrendAnalyzerResult): KeyFinding[] {
  const findings: KeyFinding[] = [];
  for (const m of result.markers.slice(0, 8)) {
    findings.push({
      code: `TREND_${m.marker.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`,
      labelAr: `اتجاه ${m.marker}`,
      labelEn: `${m.marker} trend`,
      value: `${m.direction} ${m.slope_per_30d}/30d`,
      severity: !m.in_range ? 'important' : m.velocity_alert ? 'monitor' : 'info',
    });
  }
  return findings;
}

export function buildTrendAnalyzerOutput(
  rawInput: TrendAnalyzerInput,
  options: TrendAnalyzerOutputOptions,
): ToolOutput<TrendAnalyzerResult> {
  const tool = requireTool('tool-033-bloodwork-trend-analyzer');
  const result = analyzeBloodworkTrends(rawInput);
  return buildToolOutput<TrendAnalyzerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildTrendAnalyzerProvenance(options),
    keyFindings: buildTrendAnalyzerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
