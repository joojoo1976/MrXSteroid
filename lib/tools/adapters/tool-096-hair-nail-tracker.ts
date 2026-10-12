/**
 * Tool #096 — Hair & Nail Tracker
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
  trackHairNailStatus,
  type HairNailTrackerInput,
  type HairNailTrackerResult,
} from '../engines/tool-096-hair-nail-tracker';

export interface HairNailTrackerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildHairNailTrackerProvenance(options: HairNailTrackerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'trichological shedding kinetics and follicular miniaturization scoring (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 75, high: 100, unit: 'score', source: 'healthy hair follicle retention baseline' },
  };
}

export function buildHairNailTrackerKeyFindings(result: HairNailTrackerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'HAIR_VITALITY',
      labelAr: 'مؤشر حيوية بصيلات الشعر',
      labelEn: 'Hair follicle vitality score',
      value: `${result.hair_follicle_vitality_score}/100`,
      severity: result.hair_follicle_vitality_score <= 45 ? 'important' : result.hair_follicle_vitality_score <= 70 ? 'monitor' : 'info',
    },
    {
      code: 'ALOPECIA_TIER',
      labelAr: 'تصنيف خطر التساقط الأندروجيني',
      labelEn: 'Androgenic alopecia risk tier',
      value: result.androgenic_alopecia_risk_tier,
      severity: result.androgenic_alopecia_risk_tier === 'accelerated-miniaturization' ? 'important' : 'info',
    },
    {
      code: 'KERATIN_TIER',
      labelAr: 'حالة مصفوفة الكيراتين والأظافر',
      labelEn: 'Keratin matrix health',
      value: result.keratin_matrix_health_tier,
      severity: result.keratin_matrix_health_tier === 'compromised-brittle' ? 'monitor' : 'info',
    },
  ];
  for (const r of result.support_recommendations) {
    findings.push({ code: 'RECOMMENDATION', labelAr: 'توجيه العناية', labelEn: 'Care recommendation', value: r, severity: 'info' });
  }
  return findings;
}

export function buildHairNailTrackerOutput(rawInput: HairNailTrackerInput, options: HairNailTrackerOutputOptions): ToolOutput<HairNailTrackerResult> {
  const tool = requireTool('tool-096-hair-nail-tracker');
  const result = trackHairNailStatus(rawInput);
  return buildToolOutput<HairNailTrackerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildHairNailTrackerProvenance(options),
    keyFindings: buildHairNailTrackerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
