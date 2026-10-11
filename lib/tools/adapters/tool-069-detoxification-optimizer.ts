/**
 * Tool #069 — Detoxification Optimizer
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
  optimizeDetoxification,
  type DetoxificationInput,
  type DetoxificationResult,
} from '../engines/tool-069-detoxification-optimizer';

export interface DetoxificationOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildDetoxificationProvenance(options: DetoxificationOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'evidence-based hepatic lifestyle & physiological cofactor scoring (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'score', source: 'evidence-based hepatic lifestyle index' },
  };
}

export function buildDetoxificationKeyFindings(result: DetoxificationResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'HEPATIC_SCORE',
      labelAr: 'درجة الدعم الكبدي الفسيولوجي',
      labelEn: 'Hepatic support score',
      value: `${result.hepatic_support_score}/100`,
      severity: result.support_tier === 'suboptimal-support' ? 'important' : result.support_tier === 'moderate-support' ? 'monitor' : 'info',
    },
    {
      code: 'SUPPORT_TIER',
      labelAr: 'مستوى الدعم الوظيفي',
      labelEn: 'Support tier',
      value: result.support_tier,
      severity: result.support_tier === 'suboptimal-support' ? 'important' : 'info',
    },
  ];
  for (const r of result.key_recommendations) {
    findings.push({ code: 'RECOMMENDATION', labelAr: 'توصية فسيولوجية', labelEn: 'Physiological recommendation', value: r, severity: 'info' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildDetoxificationOutput(rawInput: DetoxificationInput, options: DetoxificationOutputOptions): ToolOutput<DetoxificationResult> {
  const tool = requireTool('tool-069-detoxification-optimizer');
  const result = optimizeDetoxification(rawInput);
  return buildToolOutput<DetoxificationResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildDetoxificationProvenance(options),
    keyFindings: buildDetoxificationKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
