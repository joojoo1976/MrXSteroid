/**
 * Tool #085 — Sleep Quality Manager
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
  manageSleepQuality,
  type SleepQualityInput,
  type SleepQualityResult,
} from '../engines/tool-085-sleep-quality-manager';

export interface SleepQualityOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSleepQualityProvenance(options: SleepQualityOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'sleep latency duration and efficiency architecture screening (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 60, high: 100, unit: 'score', source: 'consolidated restorative sleep quality index' },
  };
}

export function buildSleepQualityKeyFindings(result: SleepQualityResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'SLEEP_INDEX',
      labelAr: 'مؤشر جودة النوم الكلي',
      labelEn: 'Sleep quality index',
      value: `${result.sleep_quality_index}/100`,
      severity: result.sleep_quality_index <= 40 ? 'important' : result.sleep_quality_index <= 60 ? 'monitor' : 'info',
    },
    {
      code: 'SLEEP_EFFICIENCY',
      labelAr: 'كفاءة النوم التقديرية',
      labelEn: 'Estimated sleep efficiency',
      value: `${result.estimated_sleep_efficiency_pct}%`,
      severity: result.estimated_sleep_efficiency_pct < 80 ? 'monitor' : 'info',
    },
    {
      code: 'SLEEP_TIER',
      labelAr: 'تصنيف جودة النوم والراحة',
      labelEn: 'Sleep restoration tier',
      value: result.sleep_tier,
      severity: result.sleep_tier === 'poor-fragmented' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildSleepQualityOutput(rawInput: SleepQualityInput, options: SleepQualityOutputOptions): ToolOutput<SleepQualityResult> {
  const tool = requireTool('tool-085-sleep-quality-manager');
  const result = manageSleepQuality(rawInput);
  return buildToolOutput<SleepQualityResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSleepQualityProvenance(options),
    keyFindings: buildSleepQualityKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
