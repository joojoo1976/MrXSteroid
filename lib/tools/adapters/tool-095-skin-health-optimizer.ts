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
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'user-entered observations',
    measurementMethod: 'Manual skin observation log; no inferred dermatological state',
    confidence: null,
    dataQuality: deriveDataQuality(null),
  };
}

export function buildSkinHealthOptimizerKeyFindings(result: SkinHealthOptimizerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'OBSERVED_SEBUM',
      labelAr: 'ملاحظة إفراز الدهون',
      labelEn: 'Entered sebum observation',
      value: result.sebum_production_level,
      severity: 'info',
    },
    {
      code: 'OBSERVED_ACNE',
      labelAr: 'ملاحظة نمط الآفات',
      labelEn: 'Entered lesion observation',
      value: result.acne_lesion_distribution,
      severity: 'info',
    },
    {
      code: 'RESULT_TYPE',
      labelAr: 'نوع النتيجة',
      labelEn: 'Result type',
      value: 'USER_PROVIDED',
      severity: 'info',
    },
  ];
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
