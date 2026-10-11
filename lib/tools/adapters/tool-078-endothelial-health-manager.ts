/**
 * Tool #078 — Endothelial Health Manager
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
  manageEndothelialHealth,
  type EndothelialHealthInput,
  type EndothelialHealthResult,
} from '../engines/tool-078-endothelial-health-manager';

export interface EndothelialHealthOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildEndothelialHealthProvenance(options: EndothelialHealthOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.78 : 0.70;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'multi-marker endothelial dysfunction risk screening (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 25, unit: 'score', source: 'endothelial dysfunction risk index (lower = better)' },
  };
}

export function buildEndothelialHealthKeyFindings(result: EndothelialHealthResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'ENDOTHELIAL_RISK_SCORE',
      labelAr: 'مؤشر خطر خلل وظائف البطانة',
      labelEn: 'Endothelial dysfunction risk score',
      value: `${result.endothelial_dysfunction_risk_score}/100`,
      severity: result.endothelial_dysfunction_risk_score >= 70 ? 'important' : result.endothelial_dysfunction_risk_score >= 45 ? 'monitor' : 'info',
    },
    {
      code: 'ENDOTHELIAL_BAND',
      labelAr: 'تصنيف صحة البطانة الوعائية',
      labelEn: 'Endothelial health status',
      value: result.endothelial_status_band,
      severity: result.endothelial_status_band === 'pronounced-endothelial-impairment' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildEndothelialHealthOutput(rawInput: EndothelialHealthInput, options: EndothelialHealthOutputOptions): ToolOutput<EndothelialHealthResult> {
  const tool = requireTool('tool-078-endothelial-health-manager');
  const result = manageEndothelialHealth(rawInput);
  return buildToolOutput<EndothelialHealthResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildEndothelialHealthProvenance(options),
    keyFindings: buildEndothelialHealthKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
