/**
 * Tool #099 — Digestive Health Optimizer
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
  optimizeDigestiveHealth,
  type DigestiveHealthOptimizerInput,
  type DigestiveHealthOptimizerResult,
} from '../engines/tool-099-digestive-health-optimizer';

export interface DigestiveHealthOptimizerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildDigestiveHealthOptimizerProvenance(options: DigestiveHealthOptimizerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'gastrointestinal motility transit and mucosal stress scoring (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 75, high: 100, unit: 'score', source: 'healthy digestive efficiency index' },
  };
}

export function buildDigestiveHealthOptimizerKeyFindings(result: DigestiveHealthOptimizerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'DIGESTIVE_SCORE',
      labelAr: 'مؤشر كفاءة وصحة الجهاز الهضمي',
      labelEn: 'Digestive efficiency score',
      value: `${result.digestive_efficiency_score}/100`,
      severity: result.digestive_efficiency_score <= 45 ? 'important' : result.digestive_efficiency_score <= 70 ? 'monitor' : 'info',
    },
    {
      code: 'BARRIER_TIER',
      labelAr: 'تصنيف إجهاد الحاجز المعوي المخاطي',
      labelEn: 'GI barrier strain tier',
      value: result.gi_barrier_strain_tier,
      severity: result.gi_barrier_strain_tier === 'compromised-mucosal-strain' ? 'important' : result.gi_barrier_strain_tier === 'mild-dysbiosis' ? 'monitor' : 'info',
    },
  ];
  for (const p of result.support_priorities) {
    findings.push({ code: 'SUPPORT_PRIORITY', labelAr: 'أولوية دعم الهضم', labelEn: 'Digestive support priority', value: p, severity: 'info' });
  }
  return findings;
}

export function buildDigestiveHealthOptimizerOutput(rawInput: DigestiveHealthOptimizerInput, options: DigestiveHealthOptimizerOutputOptions): ToolOutput<DigestiveHealthOptimizerResult> {
  const tool = requireTool('tool-099-digestive-health-optimizer');
  const result = optimizeDigestiveHealth(rawInput);
  return buildToolOutput<DigestiveHealthOptimizerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildDigestiveHealthOptimizerProvenance(options),
    keyFindings: buildDigestiveHealthOptimizerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
