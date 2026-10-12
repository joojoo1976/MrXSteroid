/**
 * Tool #095 — Skin Health Optimizer
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
  optimizeSkinHealth,
  type SkinHealthOptimizerInput,
  type SkinHealthOptimizerResult,
} from '../engines/tool-095-skin-health-optimizer';

export interface SkinHealthOptimizerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSkinHealthOptimizerProvenance(options: SkinHealthOptimizerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'sebaceous hyperactivity and follicular inflammation scoring (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 75, high: 100, unit: 'score', source: 'calm clear skin baseline index' },
  };
}

export function buildSkinHealthOptimizerKeyFindings(result: SkinHealthOptimizerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'CLARITY_SCORE',
      labelAr: 'مؤشر صفاء وصحة الجلد',
      labelEn: 'Skin clarity score',
      value: `${result.skin_clarity_score}/100`,
      severity: result.skin_clarity_score <= 45 ? 'important' : result.skin_clarity_score <= 70 ? 'monitor' : 'info',
    },
    {
      code: 'RISK_TIER',
      labelAr: 'تصنيف المخاطر الجلدية',
      labelEn: 'Dermatological risk tier',
      value: result.dermatological_risk_tier,
      severity: result.dermatological_risk_tier === 'severe-cystic-inflammatory-flare' ? 'important' : result.dermatological_risk_tier === 'moderate-breakout-risk' ? 'monitor' : 'info',
    },
    {
      code: 'PROTOCOL_PRIORITY',
      labelAr: 'أولوية العناية بالبشرة',
      labelEn: 'Skincare protocol priority',
      value: result.skincare_protocol_priority,
      severity: result.skincare_protocol_priority === 'clinical-dermatology-escalation' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildSkinHealthOptimizerOutput(rawInput: SkinHealthOptimizerInput, options: SkinHealthOptimizerOutputOptions): ToolOutput<SkinHealthOptimizerResult> {
  const tool = requireTool('tool-095-skin-health-optimizer');
  const result = optimizeSkinHealth(rawInput);
  return buildToolOutput<SkinHealthOptimizerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSkinHealthOptimizerProvenance(options),
    keyFindings: buildSkinHealthOptimizerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
