/**
 * Tool #084 — Cognitive Enhancer
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
  evaluateCognitiveEnhancement,
  type CognitiveEnhancerInput,
  type CognitiveEnhancerResult,
} from '../engines/tool-084-cognitive-enhancer';

export interface CognitiveEnhancerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildCognitiveEnhancerProvenance(options: CognitiveEnhancerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.72;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'lifestyle and neurotrophic factor readiness evaluation (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 60, high: 100, unit: 'score', source: 'cognitive readiness and neuroplastic support index' },
  };
}

export function buildCognitiveEnhancerKeyFindings(result: CognitiveEnhancerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'COGNITIVE_SCORE',
      labelAr: 'مؤشر الجاهزية الإدراكية',
      labelEn: 'Cognitive readiness score',
      value: `${result.cognitive_readiness_score}/100`,
      severity: result.cognitive_readiness_score <= 35 ? 'important' : result.cognitive_readiness_score <= 60 ? 'monitor' : 'info',
    },
    {
      code: 'COGNITIVE_BAND',
      labelAr: 'تصنيف الحالة العصبية والإدراكية',
      labelEn: 'Cognitive status band',
      value: result.cognitive_status_band,
      severity: result.cognitive_status_band === 'suboptimal-fatigued' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildCognitiveEnhancerOutput(rawInput: CognitiveEnhancerInput, options: CognitiveEnhancerOutputOptions): ToolOutput<CognitiveEnhancerResult> {
  const tool = requireTool('tool-084-cognitive-enhancer');
  const result = evaluateCognitiveEnhancement(rawInput);
  return buildToolOutput<CognitiveEnhancerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildCognitiveEnhancerProvenance(options),
    keyFindings: buildCognitiveEnhancerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
