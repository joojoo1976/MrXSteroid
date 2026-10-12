/**
 * Tool #094 — Pregnancy Risk Calculator
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
  calculatePregnancyRisk,
  type PregnancyRiskCalculatorInput,
  type PregnancyRiskCalculatorResult,
} from '../engines/tool-094-pregnancy-risk-calculator';

export interface PregnancyRiskCalculatorOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildPregnancyRiskCalculatorProvenance(options: PregnancyRiskCalculatorOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.90;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'risk',
    measurementMethod: 'multi-compartment terminal elimination half-life washout model (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 0, unit: 'risk', source: 'zero compound exposure absolute safety baseline' },
  };
}

export function buildPregnancyRiskCalculatorKeyFindings(result: PregnancyRiskCalculatorResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'TERATOGENIC_RISK',
      labelAr: 'مستوى الخطر المسخي وتشوهات الجنين',
      labelEn: 'Fetal teratogenicity risk',
      value: result.fetal_teratogenicity_risk,
      severity: result.fetal_teratogenicity_risk === 'low-post-washout-risk' ? 'info' : 'important',
    },
    {
      code: 'WASHOUT_STATUS',
      labelAr: 'حالة فترة التطهير الحيوي (Washout)',
      labelEn: 'Washout completion status',
      value: result.washout_completion_status,
      severity: result.washout_completion_status === 'within-active-clearance-window' ? 'important' : 'info',
    },
    {
      code: 'SAFE_WAIT_WEEKS',
      labelAr: 'الأسابيع المتبقية حتى بدء أمان التخطيط للحمل',
      labelEn: 'Recommended safe conception wait weeks',
      value: `${result.recommended_safe_conception_wait_weeks} weeks`,
      severity: result.recommended_safe_conception_wait_weeks > 0 ? 'important' : 'info',
    },
  ];
  for (const a of result.critical_safety_alerts) {
    findings.push({ code: 'CRITICAL_ALERT', labelAr: 'تنبيه سلامة حرج', labelEn: 'Critical safety alert', value: a, severity: 'important' });
  }
  return findings;
}

export function buildPregnancyRiskCalculatorOutput(rawInput: PregnancyRiskCalculatorInput, options: PregnancyRiskCalculatorOutputOptions): ToolOutput<PregnancyRiskCalculatorResult> {
  const tool = requireTool('tool-094-pregnancy-risk-calculator');
  const result = calculatePregnancyRisk(rawInput);
  return buildToolOutput<PregnancyRiskCalculatorResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildPregnancyRiskCalculatorProvenance(options),
    keyFindings: buildPregnancyRiskCalculatorKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
