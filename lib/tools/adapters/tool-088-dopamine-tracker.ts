/**
 * Tool #088 — Dopamine Tracker
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
  trackDopamine,
  type DopamineTrackerInput,
  type DopamineTrackerResult,
} from '../engines/tool-088-dopamine-tracker';

export interface DopamineTrackerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildDopamineTrackerProvenance(options: DopamineTrackerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.72;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'mesolimbic dopaminergic baseline and reward dynamics evaluation (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 70, high: 100, unit: 'score', source: 'resilient balanced dopaminergic baseline index' },
  };
}

export function buildDopamineTrackerKeyFindings(result: DopamineTrackerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'DOPAMINE_SCORE',
      labelAr: 'مؤشر صحة خط أساس الدوبامين',
      labelEn: 'Dopamine baseline health score',
      value: `${result.dopamine_baseline_health_score}/100`,
      severity: result.dopamine_baseline_health_score <= 38 ? 'important' : result.dopamine_baseline_health_score <= 65 ? 'monitor' : 'info',
    },
    {
      code: 'DOPAMINERGIC_TIER',
      labelAr: 'تصنيف النغمة الدوبامينية',
      labelEn: 'Dopaminergic tone tier',
      value: result.dopaminergic_tone_tier,
      severity: result.dopaminergic_tone_tier === 'depleted-desensitized' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildDopamineTrackerOutput(rawInput: DopamineTrackerInput, options: DopamineTrackerOutputOptions): ToolOutput<DopamineTrackerResult> {
  const tool = requireTool('tool-088-dopamine-tracker');
  const result = trackDopamine(rawInput);
  return buildToolOutput<DopamineTrackerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildDopamineTrackerProvenance(options),
    keyFindings: buildDopamineTrackerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
