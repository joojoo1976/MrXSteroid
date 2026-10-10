/**
 * Tool #049 — Bone Density Optimizer
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
  assessBoneDensity,
  type BoneDensityInput,
  type BoneDensityResult,
} from '../engines/tool-049-bone-density';

export interface BoneDensityOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildBoneDensityProvenance(options: BoneDensityOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.9 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'weighted modifiable-factor score (resistance/calcium/vitD vs AI exposure, smoking, age/sex proxies)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'score', source: 'educational screening band (not a DXA diagnosis)' },
  };
}

export function buildBoneDensityKeyFindings(result: BoneDensityResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'BONE_SCORE',
      labelAr: 'درجة صحة العظام',
      labelEn: 'Bone health score',
      value: result.bone_health_score,
      severity: result.band === 'high-risk' ? 'important' : result.band === 'at-risk' ? 'monitor' : 'info',
    },
    {
      code: 'BAND',
      labelAr: 'التصنيف',
      labelEn: 'Band',
      value: result.band,
      severity: result.band === 'high-risk' ? 'important' : result.band === 'at-risk' ? 'monitor' : 'info',
    },
  ];
  if (result.risk_factors.length > 0) {
    findings.push({ code: 'RISK_FACTORS', labelAr: 'عوامل الخطر', labelEn: 'Risk factors', value: result.risk_factors.length, severity: 'monitor' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildBoneDensityOutput(rawInput: BoneDensityInput, options: BoneDensityOutputOptions): ToolOutput<BoneDensityResult> {
  const tool = requireTool('tool-049-bone-density');
  const result = assessBoneDensity(rawInput);
  return buildToolOutput<BoneDensityResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildBoneDensityProvenance(options),
    keyFindings: buildBoneDensityKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
