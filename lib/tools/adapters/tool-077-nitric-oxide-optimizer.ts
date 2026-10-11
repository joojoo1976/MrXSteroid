/**
 * Tool #077 — Nitric Oxide Optimizer
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
  optimizeNitricOxide,
  type NitricOxideInput,
  type NitricOxideResult,
} from '../engines/tool-077-nitric-oxide-optimizer';

export interface NitricOxideOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildNitricOxideProvenance(options: NitricOxideOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'lifestyle and dietary nitrate pathway scoring (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 60, high: 100, unit: 'score', source: 'optimal NO pathway activity index' },
  };
}

export function buildNitricOxideKeyFindings(result: NitricOxideResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'NO_SCORE',
      labelAr: 'مؤشر دعم أكسيد النيتريك',
      labelEn: 'NO optimization score',
      value: `${result.no_optimization_score}/100`,
      severity: result.no_optimization_score <= 35 ? 'important' : result.no_optimization_score <= 60 ? 'monitor' : 'info',
    },
    {
      code: 'NO_BAND',
      labelAr: 'تصنيف مسار أكسيد النيتريك',
      labelEn: 'NO signaling pathway status',
      value: result.no_status_band,
      severity: result.no_status_band === 'depleted-no-pathway' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildNitricOxideOutput(rawInput: NitricOxideInput, options: NitricOxideOutputOptions): ToolOutput<NitricOxideResult> {
  const tool = requireTool('tool-077-nitric-oxide-optimizer');
  const result = optimizeNitricOxide(rawInput);
  return buildToolOutput<NitricOxideResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildNitricOxideProvenance(options),
    keyFindings: buildNitricOxideKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
