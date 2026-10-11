/**
 * Tool #073 — Immune System Optimizer
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
  optimizeImmuneSystem,
  type ImmuneSystemInput,
  type ImmuneSystemResult,
} from '../engines/tool-073-immune-system-optimizer';

export interface ImmuneSystemOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildImmuneSystemProvenance(options: ImmuneSystemOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'physiological neuroendocrine and lifestyle immune resilience index (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'score', source: 'physiological immune resilience index' },
  };
}

export function buildImmuneSystemKeyFindings(result: ImmuneSystemResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'RESILIENCE_SCORE',
      labelAr: 'درجة المرونة المناعية',
      labelEn: 'Immune resilience score',
      value: `${result.immune_resilience_score}/100`,
      severity: result.resilience_band === 'compromised-immunity' ? 'important' : result.resilience_band === 'moderate-resilience' ? 'monitor' : 'info',
    },
    {
      code: 'RESILIENCE_BAND',
      labelAr: 'مستوى المناعة الفسيولوجي',
      labelEn: 'Immune resilience tier',
      value: result.resilience_band,
      severity: result.resilience_band === 'compromised-immunity' ? 'important' : 'info',
    },
  ];
  for (const p of result.targeted_priorities) {
    findings.push({ code: 'PRIORITY', labelAr: 'أولوية تعزيز المناعة', labelEn: 'Immune priority', value: p, severity: 'info' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildImmuneSystemOutput(rawInput: ImmuneSystemInput, options: ImmuneSystemOutputOptions): ToolOutput<ImmuneSystemResult> {
  const tool = requireTool('tool-073-immune-system-optimizer');
  const result = optimizeImmuneSystem(rawInput);
  return buildToolOutput<ImmuneSystemResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildImmuneSystemProvenance(options),
    keyFindings: buildImmuneSystemKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
