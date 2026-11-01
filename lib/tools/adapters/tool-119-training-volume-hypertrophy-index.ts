/**
 * Tool #119 - Training Volume Load & Hypertrophy Index
 * Layer 3: canonical ToolOutput envelope.
 */
import {
  type DataProvenance,
  type DataSource,
  type KeyFinding,
  type Locale,
  type SnapshotType,
  type ToolOutput,
  type UnitSystem,
} from '../contracts';
import { buildToolOutput, requireTool, buildSeoLinks } from '../registry';
import { calcVolumeHypertrophy, type VolumeInput, type VolumeResult } from '../engines/tool-119-training-volume-hypertrophy-index';

export interface VolumeOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildVolumeProvenance(options: VolumeOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'kg',
    measurementMethod: 'User-entered sets, repetitions and load aggregated deterministically',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildVolumeKeyFindings(result: VolumeResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'TOTAL_VOLUME_LOAD',
      labelAr: 'الحجم الإجمالي للتدريب',
      labelEn: 'Total Volume Load',
      value: `${result.total_volume_load_kg.toLocaleString()} kg`,
      severity: 'info',
    },
    {
      code: 'HYPERTROPHY_INDEX',
      labelAr: 'مؤشر التضخم',
      labelEn: 'Hypertrophy Index',
      value: `${result.hypertrophy_index}/100`,
      severity: result.hypertrophy_index >= 70 ? 'info' : result.hypertrophy_index >= 40 ? 'monitor' : 'important',
    },
    {
      code: 'MUSCLE_GROUPS',
      labelAr: 'المجموعات العضلية المدربة',
      labelEn: 'Muscle Groups Trained',
      value: `${Object.keys(result.volume_by_muscle).length}`,
      severity: 'info',
    },
  ];

  for (const [muscle, data] of Object.entries(result.muscle_group_scores)) {
    findings.push({
      code: `MUSCLE_${muscle.toUpperCase().replace(/\s+/g, '_')}`,
      labelAr: `الحجم: ${muscle}`,
      labelEn: `Volume: ${muscle}`,
      value: `${data.volume_load.toLocaleString()} kg (H-Score: ${data.hypertrophy_score})`,
      severity: 'info',
    });
  }

  for (const [muscle, freq] of Object.entries(result.frequency_analysis)) {
    if (freq.adequacy === 'low') {
      findings.push({
        code: `FREQ_LOW_${muscle.toUpperCase().replace(/\s+/g, '_')}`,
        labelAr: `تكرار منخفض: ${muscle}`,
        labelEn: `Low Frequency: ${muscle}`,
        value: `${freq.frequency}/week`,
        severity: 'monitor',
      });
    }
  }

  for (const flag of result.flags) {
    findings.push({
      code: `FLAG_${flag.toUpperCase()}`,
      labelAr: `تنبيه: ${flag}`,
      labelEn: `Flag: ${flag}`,
      value: flag,
      severity: flag.includes('very_high') || flag.includes('low_volume') ? 'important' : 'monitor',
    });
  }

  findings.push({
    code: 'SCOPE_NOTICE',
    labelAr: 'حدود الأداة',
    labelEn: 'Tool Scope',
    value: result.scope_notice,
    severity: 'important',
  });

  return findings;
}

export function buildVolumeOutput(
  rawInput: VolumeInput,
  options: VolumeOutputOptions,
): ToolOutput<VolumeResult> {
  const tool = requireTool('tool-119-training-volume-hypertrophy-index');
  const result = calcVolumeHypertrophy(rawInput);
  return buildToolOutput<VolumeResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildVolumeProvenance(options),
    keyFindings: buildVolumeKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
