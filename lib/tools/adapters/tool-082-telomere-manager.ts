/**
 * Tool #082 — Telomere Manager
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
  manageTelomeres,
  type TelomereInput,
  type TelomereResult,
} from '../engines/tool-082-telomere-manager';

export interface TelomereOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildTelomereProvenance(options: TelomereOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.72;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'telomere maintenance and stress factor screening (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 60, high: 100, unit: 'score', source: 'optimal telomere support and maintenance index' },
  };
}

export function buildTelomereKeyFindings(result: TelomereResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'TELOMERE_SCORE',
      labelAr: 'مؤشر حماية التيلوميرات',
      labelEn: 'Telomere protection score',
      value: `${result.telomere_protection_score}/100`,
      severity: result.telomere_protection_score <= 35 ? 'important' : result.telomere_protection_score <= 60 ? 'monitor' : 'info',
    },
    {
      code: 'TELOMERE_BAND',
      labelAr: 'تصنيف حالة التيلوميرات',
      labelEn: 'Telomere maintenance status',
      value: result.telomere_status_band,
      severity: result.telomere_status_band === 'depleted-attrition-risk' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildTelomereOutput(rawInput: TelomereInput, options: TelomereOutputOptions): ToolOutput<TelomereResult> {
  const tool = requireTool('tool-082-telomere-manager');
  const result = manageTelomeres(rawInput);
  return buildToolOutput<TelomereResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildTelomereProvenance(options),
    keyFindings: buildTelomereKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
