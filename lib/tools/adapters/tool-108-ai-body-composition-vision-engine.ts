/**
 * Tool #108 - AI Body Composition Vision Engine
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
import { calcVision, type VisionInput, type VisionResult } from '../engines/tool-108-ai-body-composition-vision-engine';

export interface VisionOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildVisionProvenance(options: VisionOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.74;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'unitless',
    measurementMethod: 'deterministic reference estimator from user-supplied measurement proxy',
    confidence,
    dataQuality: deriveDataQuality(confidence),
  };
}

export function buildVisionKeyFindings(result: VisionResult): KeyFinding[] {
  return [
    {
      code: 'BMI',
      labelAr: 'مؤشر كتلة الجسم',
      labelEn: 'BMI',
      value: `${result.bmi}`,
      severity: 'info',
    },
    {
      code: 'BODY_FAT',
      labelAr: 'نسبة الدهون المقدرة',
      labelEn: 'Estimated body fat',
      value: `${result.body_fat_percent}%`,
      severity: 'info',
    },
    {
      code: 'FFMI',
      labelAr: 'مؤشر كتلة الدهون الحرة',
      labelEn: 'FFMI',
      value: `${result.ffmi}`,
      severity: 'info',
    },
    {
      code: 'VISUAL_CONFIDENCE',
      labelAr: 'ثقة التحليل البصري',
      labelEn: 'Visual analysis confidence',
      value: result.visual_confidence,
      severity: 'monitor',
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

export function buildVisionOutput(
  rawInput: VisionInput,
  options: VisionOutputOptions,
): ToolOutput<VisionResult> {
  const tool = requireTool('tool-108-ai-body-composition-vision-engine');
  const result = calcVision(rawInput);
  return buildToolOutput<VisionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildVisionProvenance(options),
    keyFindings: buildVisionKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
