/**
 * Tool #047 — Fertility Preservation Guide
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
  assessFertility,
  type FertilityInput,
  type FertilityResult,
} from '../engines/tool-047-fertility-preservation';

export interface FertilityOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildFertilityProvenance(options: FertilityOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.85 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: '%',
    measurementMethod: 'documented suppression-tier impact + recovery projection (informational heuristic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 95, unit: '%', source: 'documented suppression-severity tiers' },
  };
}

export function buildFertilityKeyFindings(result: FertilityResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'FERTILITY_IMPACT',
      labelAr: 'أثر قمع الخصوبة الحالي',
      labelEn: 'Current suppression impact',
      value: `${result.fertility_impact_pct}%`,
      severity: result.fertility_impact_pct >= 65 ? 'important' : result.fertility_impact_pct >= 50 ? 'monitor' : 'info',
    },
    {
      code: 'RECOVERY_PROJECTION',
      labelAr: 'التعافي المتوقع',
      labelEn: 'Projected recovery',
      value: `${result.recovery_projection_months} months`,
      severity: result.within_horizon ? 'info' : 'monitor',
    },
  ];
  for (const h of result.protocol_hints) {
    findings.push({ code: 'PROTOCOL_HINT', labelAr: 'تلميح بروتوكولي', labelEn: 'Protocol hint', value: h, severity: 'info' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildFertilityOutput(rawInput: FertilityInput, options: FertilityOutputOptions): ToolOutput<FertilityResult> {
  const tool = requireTool('tool-047-fertility-preservation');
  const result = assessFertility(rawInput);
  return buildToolOutput<FertilityResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildFertilityProvenance(options),
    keyFindings: buildFertilityKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
