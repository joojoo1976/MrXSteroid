/**
 * Tool #064 — Sperm Production Optimizer
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
  optimizeSpermProduction,
  type SpermProductionInput,
  type SpermProductionResult,
} from '../engines/tool-064-sperm-production-optimizer';

export interface SpermProductionOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSpermProductionProvenance(options: SpermProductionOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: '74-day spermatogenesis baseline model with lifestyle and HCG support factors (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'score', source: 'educational spermatogenesis recovery scoring' },
  };
}

export function buildSpermProductionKeyFindings(result: SpermProductionResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'RECOVERY_SCORE',
      labelAr: 'درجة تعافي الحيوانات المنوية',
      labelEn: 'Sperm recovery score',
      value: `${result.recovery_score}/100`,
      severity: result.band === 'early-recovery' ? 'important' : result.band === 'recovering' ? 'monitor' : 'info',
    },
    {
      code: 'BAND',
      labelAr: 'مرحلة التعافي',
      labelEn: 'Recovery phase band',
      value: result.band,
      severity: result.band === 'early-recovery' ? 'important' : 'info',
    },
  ];
  for (const r of result.recommendations) {
    findings.push({ code: 'RECOMMENDATION', labelAr: 'توصية', labelEn: 'Recommendation', value: r, severity: 'info' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildSpermProductionOutput(rawInput: SpermProductionInput, options: SpermProductionOutputOptions): ToolOutput<SpermProductionResult> {
  const tool = requireTool('tool-064-sperm-production-optimizer');
  const result = optimizeSpermProduction(rawInput);
  return buildToolOutput<SpermProductionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSpermProductionProvenance(options),
    keyFindings: buildSpermProductionKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
