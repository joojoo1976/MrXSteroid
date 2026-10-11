/**
 * Tool #083 — Anti-Aging Inflammation Calculator
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
  calculateAntiAgingInflammation,
  type AntiAgingInflammationInput,
  type AntiAgingInflammationResult,
} from '../engines/tool-083-anti-aging-inflammation-calculator';

export interface AntiAgingInflammationOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildAntiAgingInflammationProvenance(options: AntiAgingInflammationOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.78 : 0.70;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'inflammaging multi-marker risk screening (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 30, unit: 'score', source: 'minimal baseline inflammaging index' },
  };
}

export function buildAntiAgingInflammationKeyFindings(result: AntiAgingInflammationResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'INFLAMMAGING_SCORE',
      labelAr: 'مؤشر الالتهاب المرتبط بالشيخوخة',
      labelEn: 'Inflammaging index score',
      value: `${result.inflammaging_index_score}/100`,
      severity: result.inflammaging_index_score >= 65 ? 'important' : result.inflammaging_index_score >= 40 ? 'monitor' : 'info',
    },
    {
      code: 'INFLAMMAGING_TIER',
      labelAr: 'تصنيف الالتهاب الجهازي',
      labelEn: 'Inflammaging tier',
      value: result.inflammaging_tier,
      severity: result.inflammaging_tier === 'pronounced-systemic-wear' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildAntiAgingInflammationOutput(rawInput: AntiAgingInflammationInput, options: AntiAgingInflammationOutputOptions): ToolOutput<AntiAgingInflammationResult> {
  const tool = requireTool('tool-083-anti-aging-inflammation-calculator');
  const result = calculateAntiAgingInflammation(rawInput);
  return buildToolOutput<AntiAgingInflammationResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildAntiAgingInflammationProvenance(options),
    keyFindings: buildAntiAgingInflammationKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
