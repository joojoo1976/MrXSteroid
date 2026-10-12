/**
 * Tool #103 - Renal Function & Hydration Index
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
  calculateRenalFunction,
  type RenalFunctionInput,
  type RenalFunctionResult,
} from '../engines/tool-103-renal-function-hydration-index';

export interface RenalFunctionOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildRenalFunctionProvenance(options: RenalFunctionOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mL/min/1.73 m2',
    measurementMethod: 'CKD-EPI 2021 creatinine equation (race-free) - educational estimate',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 90, high: 120, unit: 'mL/min/1.73 m2', source: 'KDIGO normal eGFR' },
  };
}

export function buildRenalFunctionKeyFindings(result: RenalFunctionResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'EGFR',
      labelAr: 'معدل الترشيح الكبيبي المقترر',
      labelEn: 'Estimated GFR (CKD-EPI 2021)',
      value: result.egfr_valid ? `${result.egfr_ml_min_1_73} mL/min/1.73 m2` : 'out of range',
      severity: result.egfr_valid && (result.egfr_ml_min_1_73 ?? 0) < 60 ? 'important' : 'info',
    },
    {
      code: 'EGFR_CATEGORY',
      labelAr: 'فئة KDIGO',
      labelEn: 'KDIGO category',
      value: result.egfr_category,
      severity: result.egfr_category === 'G3a' || result.egfr_category === 'G3b' ? 'monitor' : 'info',
    },
    {
      code: 'HYDRATION_INDEX',
      labelAr: 'مؤشر الترطيب',
      labelEn: 'Hydration index',
      value: `${result.hydration_index}/100 (${result.hydration_status})`,
      severity: result.hydration_status === 'dehydration-flagged' ? 'monitor' : 'info',
    },
  ];
  for (const flag of result.monitoring_flags) {
    findings.push({ code: 'MONITOR', labelAr: 'ملاحة مراقبة', labelEn: 'Monitoring flag', value: flag, severity: 'info' });
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

export function buildRenalFunctionOutput(
  rawInput: RenalFunctionInput,
  options: RenalFunctionOutputOptions,
): ToolOutput<RenalFunctionResult> {
  const tool = requireTool('tool-103-renal-function-hydration-index');
  const result = calculateRenalFunction(rawInput);
  return buildToolOutput<RenalFunctionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildRenalFunctionProvenance(options),
    keyFindings: buildRenalFunctionKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
