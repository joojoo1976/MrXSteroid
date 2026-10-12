/**
 * Tool #101 - SARM-to-AAS Transition & Bridge Predictor
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
  calculateSarmToAasTransition,
  type SarmToAasTransitionInput,
  type SarmToAasTransitionResult,
} from '../engines/tool-101-sarm-to-aas-transition-bridge-predictor';

export interface SarmToAasTransitionOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSarmToAasTransitionProvenance(options: SarmToAasTransitionOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'days',
    measurementMethod: 'first-order elimination model using published SARM/AAS half-lives (educational, deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
  };
}

export function buildSarmToAasTransitionKeyFindings(result: SarmToAasTransitionResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'SARM_WASHOUT',
      labelAr: 'نافذة التطهير المقتررة (5 أنصاف عمر)',
      labelEn: 'Estimated SARM washout horizon (5 half-lives)',
      value: `${result.sarm_washout_days} d`,
      severity: result.sarm_washout_days > 10 ? 'important' : 'info',
    },
    {
      code: 'HPTA_RECOVERY',
      labelAr: 'أفق استعادة المحور المتوقع',
      labelEn: 'Expected HPTA re-baseline horizon',
      value: `${result.expected_hpta_recovery_weeks} weeks`,
      severity: result.expected_hpta_recovery_weeks >= 14 ? 'monitor' : 'info',
    },
    {
      code: 'RISK_TIER',
      labelAr: 'مستوى هامش التطهير',
      labelEn: 'Washout margin tier',
      value: result.transition_risk_tier,
      severity: result.transition_risk_tier === 'compressed-washout-margin' ? 'important' : 'info',
    },
  ];
  for (const flag of result.education_flags) {
    findings.push({ code: 'EDU_FLAG', labelAr: 'ملاحة تعليمية', labelEn: 'Education flag', value: flag, severity: 'info' });
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

export function buildSarmToAasTransitionOutput(
  rawInput: SarmToAasTransitionInput,
  options: SarmToAasTransitionOutputOptions,
): ToolOutput<SarmToAasTransitionResult> {
  const tool = requireTool('tool-101-sarm-to-aas-transition-bridge-predictor');
  const result = calculateSarmToAasTransition(rawInput);
  return buildToolOutput<SarmToAasTransitionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSarmToAasTransitionProvenance(options),
    keyFindings: buildSarmToAasTransitionKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
