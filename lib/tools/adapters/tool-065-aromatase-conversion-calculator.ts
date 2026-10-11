/**
 * Tool #065 — Aromatase Conversion Calculator
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
  estimateAromatization,
  type AromatizationInput,
  type AromatizationResult,
} from '../engines/tool-065-aromatase-conversion-calculator';

export interface AromatizationOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildAromatizationProvenance(options: AromatizationOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'pg/mL',
    measurementMethod: 'body fat & testosterone linear aromatization model with AI damping factors (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 20, high: 75, unit: 'pg/mL', source: 'published adult-male estradiol educational range' },
  };
}

export function buildAromatizationKeyFindings(result: AromatizationResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'E2_ESTIMATE',
      labelAr: 'تقدير الإستراديول E2',
      labelEn: 'Estimated E2',
      value: `${result.e2_estimate_pg_ml} pg/mL`,
      severity: result.band === 'elevated-e2' ? 'important' : result.band === 'low-e2' ? 'monitor' : 'info',
    },
    {
      code: 'BAND',
      labelAr: 'نطاق الإستراديول',
      labelEn: 'E2 band',
      value: result.band,
      severity: result.band === 'elevated-e2' ? 'important' : result.band === 'low-e2' ? 'monitor' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildAromatizationOutput(rawInput: AromatizationInput, options: AromatizationOutputOptions): ToolOutput<AromatizationResult> {
  const tool = requireTool('tool-065-aromatase-conversion-calculator');
  const result = estimateAromatization(rawInput);
  return buildToolOutput<AromatizationResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildAromatizationProvenance(options),
    keyFindings: buildAromatizationKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
