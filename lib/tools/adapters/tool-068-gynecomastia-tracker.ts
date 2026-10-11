/**
 * Tool #068 — Gynecomastia Tracker
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
  trackGynecomastia,
  type GynecomastiaInput,
  type GynecomastiaResult,
} from '../engines/tool-068-gynecomastia-tracker';

export interface GynecomastiaOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildGynecomastiaProvenance(options: GynecomastiaOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'stage',
    measurementMethod: 'subareolar clinical symptom and timeline staging assessment (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 3, unit: 'stage', source: 'subareolar tissue progression categories' },
  };
}

export function buildGynecomastiaKeyFindings(result: GynecomastiaResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'PROGRESSION_STAGE',
      labelAr: 'مرحلة تطور النسيج',
      labelEn: 'Tissue progression stage',
      value: result.progression_stage,
      severity: result.progression_stage === 'progressive-glandular' ? 'important' : result.progression_stage === 'early-budding' ? 'monitor' : 'info',
    },
    {
      code: 'FIBROSIS_RISK',
      labelAr: 'احتمالية التليف الثابت',
      labelEn: 'Fibrosis status risk',
      value: result.fibrosis_risk,
      severity: result.fibrosis_risk === 'established-fibrotic' ? 'important' : 'info',
    },
  ];
  if (result.escalation_needed) {
    findings.push({
      code: 'ESCALATION',
      labelAr: 'توصية الفحص الطبي',
      labelEn: 'Clinical examination recommended',
      value: 'clinical_evaluation_advised',
      severity: 'important',
    });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildGynecomastiaOutput(rawInput: GynecomastiaInput, options: GynecomastiaOutputOptions): ToolOutput<GynecomastiaResult> {
  const tool = requireTool('tool-068-gynecomastia-tracker');
  const result = trackGynecomastia(rawInput);
  return buildToolOutput<GynecomastiaResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildGynecomastiaProvenance(options),
    keyFindings: buildGynecomastiaKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
