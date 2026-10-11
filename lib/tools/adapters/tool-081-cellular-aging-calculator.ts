/**
 * Tool #081 — Cellular Aging Calculator
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
  calculateCellularAging,
  type CellularAgingInput,
  type CellularAgingResult,
} from '../engines/tool-081-cellular-aging-calculator';

export interface CellularAgingOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildCellularAgingProvenance(options: CellularAgingOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.70;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'years',
    measurementMethod: 'phenotypic lifestyle and metabolic aging burden estimation (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: -6, high: 12, unit: 'years', source: 'biological age delta estimation range' },
  };
}

export function buildCellularAgingKeyFindings(result: CellularAgingResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'AGE_DELTA',
      labelAr: 'فارق العمر البيولوجي التقديري',
      labelEn: 'Estimated biological age delta',
      value: `${result.biological_age_delta_estimate > 0 ? '+' : ''}${result.biological_age_delta_estimate} years`,
      severity: result.cellular_stress_tier === 'accelerated-stress' ? 'important' : result.cellular_stress_tier === 'moderate-wear' ? 'monitor' : 'info',
    },
    {
      code: 'PHENOTYPIC_AGE',
      labelAr: 'العمر الظاهري التقديري',
      labelEn: 'Estimated phenotypic age',
      value: `${result.estimated_phenotypic_age} years`,
      severity: 'info',
    },
    {
      code: 'CELLULAR_TIER',
      labelAr: 'مستوى الإجهاد الخلوي',
      labelEn: 'Cellular stress tier',
      value: result.cellular_stress_tier,
      severity: result.cellular_stress_tier === 'accelerated-stress' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildCellularAgingOutput(rawInput: CellularAgingInput, options: CellularAgingOutputOptions): ToolOutput<CellularAgingResult> {
  const tool = requireTool('tool-081-cellular-aging-calculator');
  const result = calculateCellularAging(rawInput);
  return buildToolOutput<CellularAgingResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildCellularAgingProvenance(options),
    keyFindings: buildCellularAgingKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
