/**
 * Tool #109 - Competition Readiness & Stage Posing OS
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
import { buildReadinessChecklist, type ReadinessInput, type ReadinessResult } from '../engines/tool-109-competition-readiness-posing-os';

export interface ReadinessOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildReadinessProvenance(options: ReadinessOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.76;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'item',
    measurementMethod: 'deterministic readiness checklist model (educational)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
  };
}

export function buildReadinessKeyFindings(result: ReadinessResult): KeyFinding[] {
  return [
    {
      code: 'READINESS_TIER',
      labelAr: 'مؤشر الجاهزية',
      labelEn: 'Readiness tier',
      value: result.readiness_tier,
      severity: result.readiness_tier === 'ready_reference' ? 'info' : 'monitor',
    },
    {
      code: 'CHECKLIST_COUNT',
      labelAr: 'أ_item القائمة',
      labelEn: 'Checklist item count',
      value: String(result.checklist.length),
      severity: 'info',
    },
    {
      code: 'BY_CATEGORY',
      labelAr: 'التوزيع حسب الفئة',
      labelEn: 'By category',
      value: Object.entries(result.count_by_category).map(([k, v]) => `${k}:${v}`).join(', '),
      severity: 'info',
    },
    {
      code: 'SCOPE_NOTICE',
      labelAr: 'حدود الأداة',
      labelEn: 'Tool scope',
      value: result.scope_notice,
      severity: 'important',
    },
  ];
}

export function buildReadinessOutput(
  rawInput: ReadinessInput,
  options: ReadinessOutputOptions,
): ToolOutput<ReadinessResult> {
  const tool = requireTool('tool-109-competition-readiness-posing-os');
  const result = buildReadinessChecklist(rawInput);
  return buildToolOutput<ReadinessResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildReadinessProvenance(options),
    keyFindings: buildReadinessKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
