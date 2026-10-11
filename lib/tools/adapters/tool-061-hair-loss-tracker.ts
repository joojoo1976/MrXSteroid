/**
 * Tool #061 — Hair Loss Tracker
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
  trackHairLoss,
  type HairLossInput,
  type HairLossResult,
} from '../engines/tool-061-hair-loss-tracker';

export interface HairLossOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildHairLossProvenance(options: HairLossOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'hairs/week',
    measurementMethod: 'self-reported weekly shed counts over documented trend bands (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'hairs/week', source: 'documented stable/monitor/accelerated bands' },
  };
}

export function buildHairLossKeyFindings(result: HairLossResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'AVG_SHED',
      labelAr: 'متوسط التساقط الأسبوعي',
      labelEn: 'Avg weekly shed',
      value: `${result.avg_weekly_shed}/wk`,
      severity: result.trend_band === 'accelerated' ? 'important' : result.trend_band === 'monitor' ? 'monitor' : 'info',
    },
    {
      code: 'TREND',
      labelAr: 'اتجاه التساقط',
      labelEn: 'Trend band',
      value: result.trend_band,
      severity: result.trend_band === 'accelerated' ? 'important' : 'info',
    },
    {
      code: 'STAGE',
      labelAr: 'نطاق مرحلة Norwood',
      labelEn: 'Norwood stage band',
      value: result.stage_band,
      severity: result.stage_band === 'advanced' ? 'monitor' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildHairLossOutput(rawInput: HairLossInput, options: HairLossOutputOptions): ToolOutput<HairLossResult> {
  const tool = requireTool('tool-061-hair-loss-tracker');
  const result = trackHairLoss(rawInput);
  return buildToolOutput<HairLossResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildHairLossProvenance(options),
    keyFindings: buildHairLossKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
