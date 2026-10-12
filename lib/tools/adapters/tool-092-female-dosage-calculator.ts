/**
 * Tool #092 — Female Dosage Calculator
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
  calculateFemaleDosage,
  type FemaleDosageCalculatorInput,
  type FemaleDosageCalculatorResult,
} from '../engines/tool-092-female-dosage-calculator';

export interface FemaleDosageCalculatorOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildFemaleDosageCalculatorProvenance(options: FemaleDosageCalculatorOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.80;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'ratio',
    measurementMethod: 'pharmacovigilance conservative harm-reduction ceiling indexing (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: '%', source: 'female harm reduction threshold limit' },
  };
}

export function buildFemaleDosageCalculatorKeyFindings(result: FemaleDosageCalculatorResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'VIRILIZATION_RISK',
      labelAr: 'مستوى خطر الآثار الأندروجينية/الذكورية',
      labelEn: 'Virilization risk tier',
      value: result.virilization_risk_tier,
      severity: result.virilization_risk_tier === 'high-irreversible-virilization-risk' ? 'important' : result.virilization_risk_tier === 'moderate-risk' ? 'monitor' : 'info',
    },
    {
      code: 'CEILING_RATIO',
      labelAr: 'نسبة الجرعة للحد المحافظ الآمن',
      labelEn: 'Dose relative to conservative ceiling',
      value: `${result.dose_relative_to_conservative_ceiling_percent}%`,
      severity: result.dose_relative_to_conservative_ceiling_percent > 100 ? 'important' : 'info',
    },
    {
      code: 'EXPOSURE_DURATION',
      labelAr: 'الحد الأقصى لأسابيع الاستخدام المقترحة',
      labelEn: 'Recommended safe exposure duration',
      value: `${result.recommended_safe_exposure_duration_weeks} weeks`,
      severity: 'info',
    },
  ];
  for (const w of result.safety_warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه سلامة', labelEn: 'Safety warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildFemaleDosageCalculatorOutput(rawInput: FemaleDosageCalculatorInput, options: FemaleDosageCalculatorOutputOptions): ToolOutput<FemaleDosageCalculatorResult> {
  const tool = requireTool('tool-092-female-dosage-calculator');
  const result = calculateFemaleDosage(rawInput);
  return buildToolOutput<FemaleDosageCalculatorResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildFemaleDosageCalculatorProvenance(options),
    keyFindings: buildFemaleDosageCalculatorKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
