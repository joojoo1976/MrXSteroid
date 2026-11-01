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
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'user-entered observations',
    measurementMethod: 'Manual hair, scalp, and nail observation log; no inferred diagnosis',
    confidence: null,
    dataQuality: deriveDataQuality(null),
  };
}

export function buildHairNailTrackerKeyFindings(result: HairNailTrackerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'OBSERVED_SHEDDING',
      labelAr: 'ملاحظة تساقط الشعر',
      labelEn: 'Entered shedding observation',
      value: result.daily_shedding_rate,
      severity: 'info',
    },
    {
      code: 'OBSERVED_SCALP',
      labelAr: 'ملاحظة فروة الرأس',
      labelEn: 'Entered scalp observation',
      value: result.scalp_sebum_inflammation,
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
