/**
 * Tool #063 — Testicular Suppression Calculator
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
  projectSuppression,
  type SuppressionInput,
  type SuppressionResult,
} from '../engines/tool-063-testicular-suppression-calculator';

export interface SuppressionOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSuppressionProvenance(options: SuppressionOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: '%',
    measurementMethod: 'documented cycle-length and compound suppression tier baseline projection (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: '%', source: 'educational suppression depth model' },
  };
}

export function buildSuppressionKeyFindings(result: SuppressionResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'SUPPRESSION_DEPTH',
      labelAr: 'عمق القمع التقديري',
      labelEn: 'Suppression depth',
      value: `${result.suppression_depth_pct}%`,
      severity: result.band === 'deep-suppression' ? 'important' : result.band === 'moderate-suppression' ? 'monitor' : 'info',
    },
    {
      code: 'RECOVERY_MONTHS',
      labelAr: 'مدة التعافي المتوقعة',
      labelEn: 'Estimated recovery',
      value: `~${result.estimated_recovery_months} months`,
      severity: result.estimated_recovery_months >= 6 ? 'important' : 'info',
    },
    {
      code: 'BAND',
      labelAr: 'مستوى القمع',
      labelEn: 'Suppression tier band',
      value: result.band,
      severity: result.band === 'deep-suppression' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildSuppressionOutput(rawInput: SuppressionInput, options: SuppressionOutputOptions): ToolOutput<SuppressionResult> {
  const tool = requireTool('tool-063-testicular-suppression-calculator');
  const result = projectSuppression(rawInput);
  return buildToolOutput<SuppressionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSuppressionProvenance(options),
    keyFindings: buildSuppressionKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
