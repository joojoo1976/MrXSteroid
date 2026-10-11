/**
 * Tool #080 — Mitochondrial Optimizer
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
  optimizeMitochondria,
  type MitochondrialInput,
  type MitochondrialResult,
} from '../engines/tool-080-mitochondrial-optimizer';

export interface MitochondrialOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildMitochondrialProvenance(options: MitochondrialOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'biogenesis stimuli and cofactor support scoring (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 60, high: 100, unit: 'score', source: 'mitochondrial efficiency index' },
  };
}

export function buildMitochondrialKeyFindings(result: MitochondrialResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'MITO_SCORE',
      labelAr: 'مؤشر كفاءة الميتوكوندريا',
      labelEn: 'Mitochondrial efficiency score',
      value: `${result.mitochondrial_efficiency_score}/100`,
      severity: result.mitochondrial_efficiency_score <= 35 ? 'important' : result.mitochondrial_efficiency_score <= 60 ? 'monitor' : 'info',
    },
    {
      code: 'MITO_BAND',
      labelAr: 'تصنيف صحة الميتوكوندريا',
      labelEn: 'Mitochondrial health status',
      value: result.mitochondrial_status_band,
      severity: result.mitochondrial_status_band === 'impaired-biogenesis' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildMitochondrialOutput(rawInput: MitochondrialInput, options: MitochondrialOutputOptions): ToolOutput<MitochondrialResult> {
  const tool = requireTool('tool-080-mitochondrial-optimizer');
  const result = optimizeMitochondria(rawInput);
  return buildToolOutput<MitochondrialResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildMitochondrialProvenance(options),
    keyFindings: buildMitochondrialKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
