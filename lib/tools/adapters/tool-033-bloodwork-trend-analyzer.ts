/**
 * Tool #033 — Bloodwork Trend Analyzer (Layer 3: persistence + AI adapter).
 * Pure wrapper: engine math + canonical `ToolOutput` envelope. No I/O here.
 */
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
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'lab values',
    measurementMethod: 'descriptive least-squares slope over user-entered dated readings; no clinical interpretation',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildTrendAnalyzerKeyFindings(result: TrendAnalyzerResult): KeyFinding[] {
  const findings: KeyFinding[] = [];
  for (const m of result.markers.slice(0, 8)) {
    findings.push({
      code: `TREND_${m.marker.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`,
      labelAr: `اتجاه ${m.marker}`,
      labelEn: `${m.marker} trend`,
      value: m.slope_per_30d === null
        ? `${m.direction} (${m.points} reading${m.points === 1 ? '' : 's'}; ${m.distinct_dates} distinct date${m.distinct_dates === 1 ? '' : 's'})`
        : `${m.direction} ${m.slope_per_30d} ${m.unit}/30d (${m.points} readings)`,
      severity: 'info',
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
