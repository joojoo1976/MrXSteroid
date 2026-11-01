/**
 * Tool #121 - Muscle Group Recovery Time-Course Modeler
 * Layer 3: canonical ToolOutput envelope.
 */
import {
  type DataProvenance,
  type DataSource,
  type KeyFinding,
  type Locale,
  type SnapshotType,
  type ToolOutput,
  type UnitSystem,
} from '../contracts';
import { buildToolOutput, requireTool, buildSeoLinks } from '../registry';
import { calcMuscleGroupRecovery, type RecoveryInput, type RecoveryResult } from '../engines/tool-121-muscle-group-recovery-modeler';

export interface RecoveryOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildRecoveryProvenance(options: RecoveryOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'hours',
    measurementMethod: 'Training stimulus scored by deterministic recovery heuristics',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildRecoveryKeyFindings(result: RecoveryResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'ESTIMATED_RECOVERY_HOURS',
      labelAr: 'ساعات الاسترداد المقدرة',
      labelEn: 'Estimated Recovery Hours',
      value: `${result.estimated_recovery_hours} h`,
      severity: result.estimated_recovery_hours > 96 ? 'important' : 'info',
    },
    {
      code: 'ESTIMATED_RECOVERY_DAYS',
      labelAr: 'أيام الاسترداد المقدرة',
      labelEn: 'Estimated Recovery Days',
      value: `${result.estimated_recovery_days} d`,
      severity: 'info',
    },
    {
      code: 'NEXT_SESSION_READINESS',
      labelAr: 'جاهزية الجلسة التالية',
      labelEn: 'Next Session Readiness',
      value: `${result.next_session_readiness_pct}%`,
      severity: result.next_session_readiness_pct >= 80 ? 'info' : result.next_session_readiness_pct >= 60 ? 'monitor' : 'important',
    },
    {
      code: 'VOLUME_FACTOR',
      labelAr: 'عامل الحجم',
      labelEn: 'Volume Factor',
      value: `${result.volume_factor}x`,
      severity: 'info',
    },
    {
      code: 'INTENSITY_FACTOR',
      labelAr: 'عامل الشدة',
      labelEn: 'Intensity Factor',
      value: `${result.intensity_factor}x`,
      severity: 'info',
    },
    {
      code: 'INDIVIDUAL_FACTOR',
      labelAr: 'العامل الفردي',
      labelEn: 'Individual Factor',
      value: `${result.individual_factor}x`,
      severity: 'info',
    },
  ];

  for (const flag of result.flags) {
    findings.push({
      code: `FLAG_${flag.toUpperCase()}`,
      labelAr: `تنبيه: ${flag}`,
      labelEn: `Flag: ${flag}`,
      value: flag,
      severity: flag.includes('recovery_exceeds') || flag.includes('insufficient') ? 'important' : 'monitor',
    });
  }

  findings.push({
    code: 'SCOPE_NOTICE',
    labelAr: 'حدود الأداة',
    labelEn: 'Tool Scope',
    value: result.scope_notice,
    severity: 'important',
  });

  return findings;
}

export function buildRecoveryOutput(
  rawInput: RecoveryInput,
  options: RecoveryOutputOptions,
): ToolOutput<RecoveryResult> {
  const tool = requireTool('tool-121-muscle-group-recovery-modeler');
  const result = calcMuscleGroupRecovery(rawInput);
  return buildToolOutput<RecoveryResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildRecoveryProvenance(options),
    keyFindings: buildRecoveryKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
