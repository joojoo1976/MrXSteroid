/**
 * Tool #048 — Cardiovascular Risk Assessor
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
  assessCardiovascularRisk,
  type CardioRiskInput,
  type CardioRiskResult,
} from '../engines/tool-048-cardiovascular-risk';

export interface CardioRiskOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildCardioRiskProvenance(options: CardioRiskOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.9 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: '%',
    measurementMethod: 'educational additive risk model (documented heuristic — not clinical ASCVD PCE)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 60, unit: '%', source: 'educational ceiling; clinical ASCVD requires a physician' },
  };
}

export function buildCardioRiskKeyFindings(result: CardioRiskResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'RISK_10YR',
      labelAr: 'خطر 10 سنوات (تقديري)',
      labelEn: '10-year risk (educational)',
      value: `${result.risk_pct_10yr}%`,
      severity: result.band === 'high' ? 'important' : result.band === 'elevated' ? 'monitor' : 'info',
    },
    {
      code: 'BAND',
      labelAr: 'التصنيف',
      labelEn: 'Band',
      value: result.band,
      severity: result.band === 'high' ? 'important' : result.band === 'elevated' ? 'monitor' : 'info',
    },
  ];
  for (const d of result.drivers) {
    findings.push({ code: 'DRIVER', labelAr: 'عامل خطر', labelEn: 'Risk driver', value: d, severity: 'monitor' });
  }
  for (const m of result.mitigations) {
    findings.push({ code: 'MITIGATION', labelAr: 'تخفيف', labelEn: 'Mitigation', value: m, severity: 'info' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildCardioRiskOutput(rawInput: CardioRiskInput, options: CardioRiskOutputOptions): ToolOutput<CardioRiskResult> {
  const tool = requireTool('tool-048-cardiovascular-risk');
  const result = assessCardiovascularRisk(rawInput);
  return buildToolOutput<CardioRiskResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildCardioRiskProvenance(options),
    keyFindings: buildCardioRiskKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
