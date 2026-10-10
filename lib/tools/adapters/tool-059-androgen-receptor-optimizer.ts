/**
 * Tool #059 — Androgen Receptor Optimizer
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
  scoreReceptorResponsiveness,
  type ReceptorResponsivenessInput,
  type ReceptorResponsivenessResult,
} from '../engines/tool-059-androgen-receptor-optimizer';

export interface ReceptorResponsivenessOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildReceptorResponsivenessProvenance(options: ReceptorResponsivenessOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'deterministic responsiveness score over documented modifiable factors (sleep/training/time-off)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'score', source: 'documented guidance scoring model (educational)' },
  };
}

export function buildReceptorResponsivenessKeyFindings(result: ReceptorResponsivenessResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'RECEPTOR_SCORE',
      labelAr: 'دراسة استجابة المستقبلات',
      labelEn: 'Receptor responsiveness score',
      value: result.score,
      severity: result.band === 'responsive-context' ? 'info' : result.band === 'baseline' ? 'monitor' : 'important',
    },
    {
      code: 'BAND',
      labelAr: 'التصنيف',
      labelEn: 'Band',
      value: result.band,
      severity: result.band === 'responsive-context' ? 'info' : 'monitor',
    },
  ];
  for (const rec of result.recommendations) {
    findings.push({ code: 'RECOMMENDATION', labelAr: 'توصية', labelEn: 'Recommendation', value: rec, severity: 'info' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildReceptorResponsivenessOutput(rawInput: ReceptorResponsivenessInput, options: ReceptorResponsivenessOutputOptions): ToolOutput<ReceptorResponsivenessResult> {
  const tool = requireTool('tool-059-androgen-receptor-optimizer');
  const result = scoreReceptorResponsiveness(rawInput);
  return buildToolOutput<ReceptorResponsivenessResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildReceptorResponsivenessProvenance(options),
    keyFindings: buildReceptorResponsivenessKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
