/**
 * Tool #050 — Mental Health Monitor
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
  assessMentalHealth,
  type MentalHealthInput,
  type MentalHealthResult,
} from '../engines/tool-050-mental-health';

export interface MentalHealthOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildMentalHealthProvenance(options: MentalHealthOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.9 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mood/10',
    measurementMethod: 'self-reported mood mean + half-split trend + red-flag escalation screen',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 1, high: 10, unit: 'mood/10', source: 'self-report scale; screening only — never a diagnosis' },
  };
}

export function buildMentalHealthKeyFindings(result: MentalHealthResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'AVG_MOOD',
      labelAr: 'متوسط المزاج',
      labelEn: 'Average mood',
      value: `${result.avg_mood}/10`,
      severity: result.band === 'concern' || result.band === 'critical' ? 'important' : result.band === 'watch' ? 'monitor' : 'info',
    },
    {
      code: 'TREND',
      labelAr: 'الاتجاه',
      labelEn: 'Trend',
      value: result.trend,
      severity: result.trend === 'declining' ? 'monitor' : 'info',
    },
  ];
  if (result.escalation) {
    findings.push({ code: 'ESCALATION', labelAr: 'تصعيد فوري مطلوب', labelEn: 'Immediate escalation required', value: 'red_flag', severity: 'important' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildMentalHealthOutput(rawInput: MentalHealthInput, options: MentalHealthOutputOptions): ToolOutput<MentalHealthResult> {
  const tool = requireTool('tool-050-mental-health');
  const result = assessMentalHealth(rawInput);
  return buildToolOutput<MentalHealthResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildMentalHealthProvenance(options),
    keyFindings: buildMentalHealthKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
