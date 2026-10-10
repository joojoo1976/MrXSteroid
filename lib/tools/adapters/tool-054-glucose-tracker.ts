/**
 * Tool #054 — Glucose Tracker
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
  analyzeGlucose,
  type GlucoseInput,
  type GlucoseResult,
} from '../engines/tool-054-glucose-tracker';

export interface GlucoseOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildGlucoseProvenance(options: GlucoseOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'device';
  const confidence = source === 'device' ? 0.85 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mg/dL',
    measurementMethod: 'log analytics vs documented fasting categories (ADA educational bands)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 70, high: 99, unit: 'mg/dL', source: 'documented fasting normal range; screening only' },
  };
}

export function buildGlucoseKeyFindings(result: GlucoseResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'FASTING_AVG',
      labelAr: 'متوسط الصائم',
      labelEn: 'Fasting average',
      value: `${result.fasting_avg} mg/dL`,
      severity: result.band === 'elevated' ? 'important' : result.band === 'prediabetic-range' ? 'monitor' : 'info',
    },
    {
      code: 'BAND',
      labelAr: 'التصنيف',
      labelEn: 'Band',
      value: result.band,
      severity: result.band === 'elevated' ? 'important' : result.band === 'prediabetic-range' ? 'monitor' : 'info',
    },
    {
      code: 'IN_RANGE',
      labelAr: 'داخل النطاق',
      labelEn: 'In-range share',
      value: `${result.in_range_pct}%`,
      severity: 'info',
    },
  ];
  if (result.hypo_count > 0) {
    findings.push({ code: 'HYPO', labelAr: 'هبوط سكر', labelEn: 'Hypoglycemia episodes', value: result.hypo_count, severity: 'important' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildGlucoseOutput(rawInput: GlucoseInput, options: GlucoseOutputOptions): ToolOutput<GlucoseResult> {
  const tool = requireTool('tool-054-glucose-tracker');
  const result = analyzeGlucose(rawInput);
  return buildToolOutput<GlucoseResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildGlucoseProvenance(options),
    keyFindings: buildGlucoseKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
