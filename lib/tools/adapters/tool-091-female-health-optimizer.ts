/**
 * Tool #091 — Female Health Optimizer
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
  optimizeFemaleHealth,
  type FemaleHealthOptimizerInput,
  type FemaleHealthOptimizerResult,
} from '../engines/tool-091-female-health-optimizer';

export interface FemaleHealthOptimizerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildFemaleHealthOptimizerProvenance(options: FemaleHealthOptimizerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'energy availability, iron stores and endocrine vitality scoring (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 75, high: 100, unit: 'score', source: 'optimal athletic resilience index' },
  };
}

export function buildFemaleHealthOptimizerKeyFindings(result: FemaleHealthOptimizerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'VITALITY_SCORE',
      labelAr: 'مؤشر الحيوية والمرونة الأنثوية',
      labelEn: 'Female vitality score',
      value: `${result.female_vitality_score}/100`,
      severity: result.female_vitality_score <= 45 ? 'important' : result.female_vitality_score <= 70 ? 'monitor' : 'info',
    },
    {
      code: 'RESILIENCE_TIER',
      labelAr: 'تصنيف المرونة الرياضية',
      labelEn: 'Athletic resilience tier',
      value: result.athletic_resilience_tier,
      severity: result.athletic_resilience_tier === 'high-reds-risk' ? 'important' : 'info',
    },
    {
      code: 'SUPPORT_PRIORITY',
      labelAr: 'أولوية الدعم الغذائي والمعدني',
      labelEn: 'Nutrition and iron support priority',
      value: result.iron_energy_support_priority,
      severity: result.iron_energy_support_priority === 'urgent-clinical-review' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildFemaleHealthOptimizerOutput(rawInput: FemaleHealthOptimizerInput, options: FemaleHealthOptimizerOutputOptions): ToolOutput<FemaleHealthOptimizerResult> {
  const tool = requireTool('tool-091-female-health-optimizer');
  const result = optimizeFemaleHealth(rawInput);
  return buildToolOutput<FemaleHealthOptimizerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildFemaleHealthOptimizerProvenance(options),
    keyFindings: buildFemaleHealthOptimizerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
