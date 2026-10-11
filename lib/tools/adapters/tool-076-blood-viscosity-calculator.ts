/**
 * Tool #076 — Blood Viscosity Calculator
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
  calculateBloodViscosity,
  type BloodViscosityInput,
  type BloodViscosityResult,
} from '../engines/tool-076-blood-viscosity-calculator';

export interface BloodViscosityOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildBloodViscosityProvenance(options: BloodViscosityOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'cP',
    measurementMethod: 'hematocrit-based viscosity estimation (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 3.5, high: 4.5, unit: 'cP', source: 'whole blood viscosity reference range' },
  };
}

export function buildBloodViscosityKeyFindings(result: BloodViscosityResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'VISCOSITY_SCORE',
      labelAr: 'مؤشر لزوجة الدم النسبي',
      labelEn: 'Relative blood viscosity score',
      value: `${result.relative_viscosity_score}/100`,
      severity: result.viscosity_band === 'critical-hyperviscosity-risk' ? 'important' : result.viscosity_band === 'significantly-elevated' ? 'monitor' : 'info',
    },
    {
      code: 'VISCOSITY_CP',
      labelAr: 'اللزوجة التقديرية (سنتيبواز)',
      labelEn: 'Estimated viscosity (cP)',
      value: `${result.estimated_viscosity_cp} cP`,
      severity: result.estimated_viscosity_cp >= 5.5 ? 'important' : 'info',
    },
    {
      code: 'VISCOSITY_BAND',
      labelAr: 'تصنيف اللزوجة',
      labelEn: 'Viscosity classification',
      value: result.viscosity_band,
      severity: result.viscosity_band === 'critical-hyperviscosity-risk' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildBloodViscosityOutput(rawInput: BloodViscosityInput, options: BloodViscosityOutputOptions): ToolOutput<BloodViscosityResult> {
  const tool = requireTool('tool-076-blood-viscosity-calculator');
  const result = calculateBloodViscosity(rawInput);
  return buildToolOutput<BloodViscosityResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildBloodViscosityProvenance(options),
    keyFindings: buildBloodViscosityKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
