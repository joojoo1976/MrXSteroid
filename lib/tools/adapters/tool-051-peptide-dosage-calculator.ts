/**
 * Tool #051 — Peptide Dosage Calculator
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
  computePeptideDose,
  type PeptideDoseInput,
  type PeptideDoseResult,
} from '../engines/tool-051-peptide-dosage-calculator';

export interface PeptideDoseOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildPeptideDoseProvenance(options: PeptideDoseOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.9 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'IU',
    measurementMethod: 'reconstitution concentration + U-100 syringe-draw unit conversion (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'IU', source: 'U-100 insulin syringe scale (100 units = 1 ml)' },
  };
}

export function buildPeptideDoseKeyFindings(result: PeptideDoseResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'CONCENTRATION',
      labelAr: 'التركيز بعد التشكيل',
      labelEn: 'Reconstituted concentration',
      value: `${result.concentration_mg_per_ml} mg/ml`,
      severity: 'info',
    },
    {
      code: 'DRAW_UNITS',
      labelAr: 'وحدات السحب (U-100)',
      labelEn: 'Draw units (U-100)',
      value: `${result.draw_units_u100} IU`,
      severity: result.clamped ? 'monitor' : 'info',
    },
    {
      code: 'DOSES_PER_VIAL',
      labelAr: 'جرعات لكل فيال',
      labelEn: 'Doses per vial',
      value: result.doses_per_vial,
      severity: 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildPeptideDoseOutput(rawInput: PeptideDoseInput, options: PeptideDoseOutputOptions): ToolOutput<PeptideDoseResult> {
  const tool = requireTool('tool-051-peptide-dosage-calculator');
  const result = computePeptideDose(rawInput);
  return buildToolOutput<PeptideDoseResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildPeptideDoseProvenance(options),
    keyFindings: buildPeptideDoseKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
