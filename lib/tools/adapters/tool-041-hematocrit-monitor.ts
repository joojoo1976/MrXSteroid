/**
 * Tool #041 — Hematocrit Monitor
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
  monitorHematocrit,
  type HematocritInput,
  type HematocritResult,
} from '../engines/tool-041-hematocrit-monitor';

export interface HematocritOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildHematocritProvenance(options: HematocritOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'device';
  const confidence = source === 'manual' ? 0.9 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: '%',
    measurementMethod: 'least-squares HCT trend (points per 30 days) vs documented reference bands',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 34.9, high: 54, unit: '%', source: 'adult reference bands; sex-specific (documented heuristic)' },
  };
}

export function buildHematocritKeyFindings(result: HematocritResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'LATEST_HCT',
      labelAr: 'أحدث قرصة هيماتوكريت',
      labelEn: 'Latest hematocrit',
      value: `${result.latest_hct_pct}%`,
      severity: result.band === 'very-high' || result.band === 'high' ? 'important' : result.band === 'borderline' ? 'monitor' : 'info',
    },
    { code: 'TREND_30D', labelAr: 'اتجاه 30 يومًا', labelEn: '30-day trend', value: `${result.slope_per_30d >= 0 ? '+' : ''}${result.slope_per_30d} pts/30d`, severity: result.slope_per_30d > 1.5 ? 'monitor' : 'info' },
  ];
  if (result.projected_threshold_date) {
    findings.push({ code: 'PROJECTED_CROSSING', labelAr: 'تقاطع خط التدخل المتوقع', labelEn: 'Projected intervention-line crossing', value: result.projected_threshold_date, severity: 'monitor' });
  }
  if (result.donate_eligible) {
    findings.push({ code: 'DONATION_ELIGIBLE', labelAr: 'مؤهل للتبرع العلاجي', labelEn: 'Therapeutic-donation eligible', value: 'yes', severity: 'monitor' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildHematocritOutput(rawInput: HematocritInput, options: HematocritOutputOptions): ToolOutput<HematocritResult> {
  const tool = requireTool('tool-041-hematocrit-monitor');
  const result = monitorHematocrit(rawInput);
  return buildToolOutput<HematocritResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildHematocritProvenance(options),
    keyFindings: buildHematocritKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
