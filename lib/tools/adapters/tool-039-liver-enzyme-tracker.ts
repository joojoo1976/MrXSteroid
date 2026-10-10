/**
 * Tool #039 — Liver Enzyme Tracker
 * Layer 3: persistence + canonical ToolOutput envelope.
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
  trackLiverEnzymes,
  type LiverTrackerInput,
  type LiverTrackerResult,
} from '../engines/tool-039-liver-enzyme-tracker';

export interface LiverTrackerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildLiverTrackerProvenance(options: LiverTrackerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.9 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'times ULN',
    measurementMethod: 'ALT/AST/GGT/ALP/bilirubin vs ULN + 30d trend + oral-load score (pure engine)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 10, unit: 'ULN multiple', source: 'standard adult reference; clinical correlation required' },
  };
}

export function buildLiverTrackerKeyFindings(result: LiverTrackerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    { code: 'OVERALL_STATUS', labelAr: 'الحالة العامة', labelEn: 'Overall Status', value: result.overall_status, severity: result.overall_status === 'critical' ? 'important' : result.overall_status === 'high' ? 'monitor' : 'info' },
    { code: 'STOP_ORALS', labelAr: 'أوقف الفمويات', labelEn: 'Stop OraIs', value: result.stop_orals ? 'yes' : 'no', severity: result.stop_orals ? 'important' : 'info' },
  ];
  for (const m of result.markers) {
    findings.push({
      code: m.marker,
      labelAr: `${m.marker} (${m.uln_multiple}x)`,
      labelEn: `${m.marker} (${m.uln_multiple}x)`,
      value: `${m.latest_value}${m.unit} · ${m.trend_per_30d}/30d`,
      severity: m.status === 'critical' ? 'important' : m.status === 'high' ? 'monitor' : 'info',
    });
  }
  for (const r of result.recommendations) {
    findings.push({ code: 'RECOMMEND', labelAr: 'توصية', labelEn: 'Recommendation', value: r, severity: 'monitor' });
  }
  return findings;
}

export function buildLiverTrackerOutput(rawInput: LiverTrackerInput, options: LiverTrackerOutputOptions): ToolOutput<LiverTrackerResult> {
  const tool = requireTool('tool-039-liver-enzyme-tracker');
  const result = trackLiverEnzymes(rawInput);
  return buildToolOutput<LiverTrackerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildLiverTrackerProvenance(options),
    keyFindings: buildLiverTrackerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
