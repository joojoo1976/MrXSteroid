/**
 * Tool #118 - CNS Recovery Score
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
import { calcCNSRecovery, type CNSRecoveryInput, type CNSRecoveryResult } from '../engines/tool-118-cns-recovery-score';

export interface CNSRecoveryOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildCNSRecoveryProvenance(options: CNSRecoveryOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'Self-reported and user-entered biometric markers scored by deterministic rules',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildCNSRecoveryKeyFindings(result: CNSRecoveryResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'CNS_RECOVERY_SCORE',
      labelAr: 'درجة استعادة الجهاز العصبي المركزي',
      labelEn: 'CNS Recovery Score',
      value: `${result.cns_recovery_score}/100`,
      severity: result.cns_recovery_score >= 75 ? 'info' : result.cns_recovery_score >= 55 ? 'monitor' : 'important',
    },
    {
      code: 'READINESS_LEVEL',
      labelAr: 'مستوى الجاهزية',
      labelEn: 'Readiness Level',
      value: result.readiness_level,
      severity: result.readiness_level === 'poor' ? 'important' : result.readiness_level === 'moderate' ? 'monitor' : 'info',
    },
    {
      code: 'HRV_FACTOR',
      labelAr: 'عامل HRV',
      labelEn: 'HRV Factor',
      value: `${result.factor_scores.hrv_score}/100`,
      severity: result.factor_scores.hrv_score >= 70 ? 'info' : 'monitor',
    },
    {
      code: 'SLEEP_FACTOR',
      labelAr: 'عامل النوم',
      labelEn: 'Sleep Factor',
      value: `${result.factor_scores.sleep_score}/100`,
      severity: result.factor_scores.sleep_score >= 70 ? 'info' : 'monitor',
    },
    {
      code: 'SUBJECTIVE_FACTOR',
      labelAr: 'العامل الذاتي',
      labelEn: 'Subjective Factor',
      value: `${result.factor_scores.subjective_score}/100`,
      severity: result.factor_scores.subjective_score >= 70 ? 'info' : 'monitor',
    },
    {
      code: 'PERFORMANCE_FACTOR',
      labelAr: 'عامل الأداء',
      labelEn: 'Performance Factor',
      value: `${result.factor_scores.performance_score}/100`,
      severity: result.factor_scores.performance_score >= 70 ? 'info' : 'monitor',
    },
    {
      code: 'BIOMETRIC_FACTOR',
      labelAr: 'العامل الحيوي',
      labelEn: 'Biometric Factor',
      value: `${result.factor_scores.biometric_score}/100`,
      severity: result.factor_scores.biometric_score >= 70 ? 'info' : 'monitor',
    },
  ];

  for (const flag of result.risk_flags) {
    findings.push({
      code: `FLAG_${flag.toUpperCase()}`,
      labelAr: `تنبيه: ${flag}`,
      labelEn: `Flag: ${flag}`,
      value: flag,
      severity: flag.includes('high_cns_fatigue') || flag.includes('significantly_below') ? 'important' : 'monitor',
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

export function buildCNSRecoveryOutput(
  rawInput: CNSRecoveryInput,
  options: CNSRecoveryOutputOptions,
): ToolOutput<CNSRecoveryResult> {
  const tool = requireTool('tool-118-cns-recovery-score');
  const result = calcCNSRecovery(rawInput);
  return buildToolOutput<CNSRecoveryResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildCNSRecoveryProvenance(options),
    keyFindings: buildCNSRecoveryKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
