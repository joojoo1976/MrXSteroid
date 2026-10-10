/**
 * Tool #055 — Insulin Sensitivity Optimizer
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
  assessInsulinSensitivity,
  type InsulinSensitivityInput,
  type InsulinSensitivityResult,
} from '../engines/tool-055-insulin-sensitivity-optimizer';

export interface InsulinSensitivityOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildInsulinSensitivityProvenance(options: InsulinSensitivityOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'device';
  const confidence = source === 'manual' ? 0.9 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'HOMA-IR',
    measurementMethod: 'documented HOMA-IR formula ((glucose × insulin) / 405) with published banding',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 2.9, unit: 'HOMA-IR', source: 'published bands; ≥2.9 significant resistance (screening)' },
  };
}

export function buildInsulinSensitivityKeyFindings(result: InsulinSensitivityResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'HOMA_IR',
      labelAr: 'مؤشر HOMA-IR',
      labelEn: 'HOMA-IR index',
      value: result.homa_ir,
      severity: result.band === 'significant-insulin-resistance' ? 'important' : result.band === 'early-insulin-resistance' ? 'monitor' : 'info',
    },
    {
      code: 'BAND',
      labelAr: 'التصنيف',
      labelEn: 'Band',
      value: result.band,
      severity: result.band === 'significant-insulin-resistance' ? 'important' : result.band === 'early-insulin-resistance' ? 'monitor' : 'info',
    },
  ];
  for (const i of result.interventions) {
    findings.push({ code: 'INTERVENTION', labelAr: 'إجراء', labelEn: 'Intervention', value: i, severity: 'info' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildInsulinSensitivityOutput(rawInput: InsulinSensitivityInput, options: InsulinSensitivityOutputOptions): ToolOutput<InsulinSensitivityResult> {
  const tool = requireTool('tool-055-insulin-sensitivity-optimizer');
  const result = assessInsulinSensitivity(rawInput);
  return buildToolOutput<InsulinSensitivityResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildInsulinSensitivityProvenance(options),
    keyFindings: buildInsulinSensitivityKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
