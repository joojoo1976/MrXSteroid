/**
 * Tool #104 - Thyroid Function & Metabolic Rate Dynamics
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
  calculateThyroidDynamics,
  type ThyroidInput,
  type ThyroidResult,
} from '../engines/tool-104-thyroid-metabolic-rate-dynamics';

export interface ThyroidOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildThyroidProvenance(options: ThyroidOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'kcal/day',
    measurementMethod: 'Mifflin-St Jeor BMR scaled by a free-T4-ratio metabolic multiplier (educational)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0.4, high: 4.0, unit: 'mIU/L', source: 'Standard TSH lab reference range' },
  };
}

export function buildThyroidKeyFindings(result: ThyroidResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'BASELINE_BMR',
      labelAr: 'معدل الأيض الأساسي (Mifflin-St Jeor)',
      labelEn: 'Baseline BMR (Mifflin-St Jeor)',
      value: `${result.bmr_kcal} kcal/day`,
      severity: 'info',
    },
    {
      code: 'ADJUSTED_BMR',
      labelAr: 'معدل الأيض المعدّل وفق نمط الغدة',
      labelEn: 'Metabolic rate adjusted for thyroid pattern',
      value: `${result.adjusted_bmr_kcal} kcal/day (x${result.metabolic_multiplier})`,
      severity: 'info',
    },
    {
      code: 'THYROID_STATE',
      labelAr: 'نمط وظيفة الغدة الدرقية',
      labelEn: 'Thyroid state pattern',
      value: result.thyroid_state,
      severity:
        result.thyroid_state === 'primary-hypothyroidism-pattern' ||
        result.thyroid_state === 'hyperthyroidism-pattern'
          ? 'important'
          : 'info',
    },
  ];
  for (const flag of result.interpretation_flags) {
    findings.push({ code: 'INTERP', labelAr: 'تفسير', labelEn: 'Interpretation', value: flag, severity: 'info' });
  }
  findings.push({
    code: 'SCOPE_NOTICE',
    labelAr: 'حدود الأداة',
    labelEn: 'Tool scope',
    value: result.scope_notice,
    severity: 'important',
  });
  return findings;
}

export function buildThyroidOutput(
  rawInput: ThyroidInput,
  options: ThyroidOutputOptions,
): ToolOutput<ThyroidResult> {
  const tool = requireTool('tool-104-thyroid-metabolic-rate-dynamics');
  const result = calculateThyroidDynamics(rawInput);
  return buildToolOutput<ThyroidResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildThyroidProvenance(options),
    keyFindings: buildThyroidKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
