/**
 * Tool #087 — Mood Optimizer
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
  optimizeMood,
  type MoodOptimizerInput,
  type MoodOptimizerResult,
} from '../engines/tool-087-mood-optimizer';

export interface MoodOptimizerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildMoodOptimizerProvenance(options: MoodOptimizerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.70;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'affective resilience and neurochemical precursor support evaluation (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 75, high: 100, unit: 'score', source: 'robust flourishing affective resilience index' },
  };
}

export function buildMoodOptimizerKeyFindings(result: MoodOptimizerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'RESILIENCE_SCORE',
      labelAr: 'مؤشر المرونة المزاجية والعاطفية',
      labelEn: 'Affective resilience score',
      value: `${result.affective_resilience_score}/100`,
      severity: result.affective_resilience_score <= 40 ? 'important' : result.affective_resilience_score <= 65 ? 'monitor' : 'info',
    },
    {
      code: 'AFFECTIVE_TIER',
      labelAr: 'تصنيف الاستقرار العاطفي',
      labelEn: 'Affective balance tier',
      value: result.affective_balance_tier,
      severity: result.affective_balance_tier === 'depleted-vulnerable' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildMoodOptimizerOutput(rawInput: MoodOptimizerInput, options: MoodOptimizerOutputOptions): ToolOutput<MoodOptimizerResult> {
  const tool = requireTool('tool-087-mood-optimizer');
  const result = optimizeMood(rawInput);
  return buildToolOutput<MoodOptimizerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildMoodOptimizerProvenance(options),
    keyFindings: buildMoodOptimizerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
