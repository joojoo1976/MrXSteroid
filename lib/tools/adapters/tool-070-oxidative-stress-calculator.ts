/**
 * Tool #070 — Oxidative Stress Calculator
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
  calculateOxidativeStress,
  type OxidativeStressInput,
  type OxidativeStressResult,
} from '../engines/tool-070-oxidative-stress-calculator';

export interface OxidativeStressOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildOxidativeStressProvenance(options: OxidativeStressOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'lifestyle, redox, and pharmacological oxidative burden assessment (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'score', source: 'educational redox burden index' },
  };
}

export function buildOxidativeStressKeyFindings(result: OxidativeStressResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'BURDEN_SCORE',
      labelAr: 'درجة العبء التأكسدي',
      labelEn: 'Oxidative burden score',
      value: `${result.oxidative_burden_score}/100`,
      severity: result.burden_tier === 'high-oxidative-stress' ? 'important' : result.burden_tier === 'moderate-oxidative-stress' ? 'monitor' : 'info',
    },
    {
      code: 'BURDEN_TIER',
      labelAr: 'تصنيف الإجهاد التأكسدي',
      labelEn: 'Oxidative burden tier',
      value: result.burden_tier,
      severity: result.burden_tier === 'high-oxidative-stress' ? 'important' : 'info',
    },
  ];
  for (const p of result.mitigating_priorities) {
    findings.push({ code: 'PRIORITY', labelAr: 'أولوية التخفيف', labelEn: 'Mitigating priority', value: p, severity: 'info' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildOxidativeStressOutput(rawInput: OxidativeStressInput, options: OxidativeStressOutputOptions): ToolOutput<OxidativeStressResult> {
  const tool = requireTool('tool-070-oxidative-stress-calculator');
  const result = calculateOxidativeStress(rawInput);
  return buildToolOutput<OxidativeStressResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildOxidativeStressProvenance(options),
    keyFindings: buildOxidativeStressKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
