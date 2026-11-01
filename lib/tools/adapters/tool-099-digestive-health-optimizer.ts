import { deriveDataQuality, type DataProvenance, type DataSource, type KeyFinding, type Locale, type SnapshotType, type ToolOutput, type UnitSystem } from '../contracts';
import { buildSeoLinks, buildToolOutput, requireTool } from '../registry';
import { optimizeDigestiveHealth, type DigestiveHealthOptimizerInput, type DigestiveHealthOptimizerResult } from '../engines/tool-099-digestive-health-optimizer';

export interface DigestiveHealthOptimizerOutputOptions { locale: Locale; unitSystem: UnitSystem; snapshotType: SnapshotType; calculatedAt: string; recordedAt: string; timezone?: string; provenanceSource?: DataSource }

export function buildDigestiveHealthOptimizerProvenance(options: DigestiveHealthOptimizerOutputOptions): DataProvenance {
  return { source: options.provenanceSource ?? 'manual', recordedAt: options.recordedAt, timezone: options.timezone ?? 'UTC', unit: 'user-entered observations', measurementMethod: 'Manual symptom and dietary observation log; no inferred health score', confidence: null, dataQuality: deriveDataQuality(null) };
}

export function buildDigestiveHealthOptimizerKeyFindings(result: DigestiveHealthOptimizerResult): KeyFinding[] {
  return [
    { code: 'OBSERVED_REFLUX_FREQUENCY', labelAr: 'تكرار الأعراض المدخل', labelEn: 'Entered symptom frequency', value: result.bloating_or_reflux_frequency, severity: 'info' },
    { code: 'OBSERVED_BRISTOL_TYPE', labelAr: 'نوع مقياس بريستول المدخل', labelEn: 'Entered Bristol type', value: result.bowel_regularity_bristol_score, severity: 'info' },
    { code: 'RESULT_TYPE', labelAr: 'نوع النتيجة', labelEn: 'Result type', value: 'USER_PROVIDED', severity: 'info' },
  ];
}

export function buildDigestiveHealthOptimizerOutput(rawInput: DigestiveHealthOptimizerInput, options: DigestiveHealthOptimizerOutputOptions): ToolOutput<DigestiveHealthOptimizerResult> {
  const tool = requireTool('tool-099-digestive-health-optimizer');
  const result = optimizeDigestiveHealth(rawInput);
  return buildToolOutput({ toolId: tool.toolId, toolSlug: tool.slug, calculatedAt: options.calculatedAt, locale: options.locale, unitSystem: options.unitSystem, snapshotType: options.snapshotType, accessTier: tool.accessTier, result, provenance: buildDigestiveHealthOptimizerProvenance(options), keyFindings: buildDigestiveHealthOptimizerKeyFindings(result), seoLinks: buildSeoLinks(tool) });
}
