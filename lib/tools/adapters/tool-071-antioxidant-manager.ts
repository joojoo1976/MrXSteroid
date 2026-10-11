/**
 * Tool #071 — Antioxidant Manager
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
  manageAntioxidants,
  type AntioxidantInput,
  type AntioxidantResult,
} from '../engines/tool-071-antioxidant-manager';

export interface AntioxidantOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildAntioxidantProvenance(options: AntioxidantOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'evidence-based nutrient and dietary antioxidant defense assessment (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'score', source: 'dietary antioxidant defense index' },
  };
}

export function buildAntioxidantKeyFindings(result: AntioxidantResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'DEFENSE_SCORE',
      labelAr: 'درجة الدفاع بمضادات الأكسدة',
      labelEn: 'Antioxidant defense score',
      value: `${result.antioxidant_defense_score}/100`,
      severity: result.defense_tier === 'depleted-defense' ? 'important' : result.defense_tier === 'adequate-defense' ? 'info' : 'info',
    },
    {
      code: 'DEFENSE_TIER',
      labelAr: 'مستوى الحماية الخلوية',
      labelEn: 'Cellular defense tier',
      value: result.defense_tier,
      severity: result.defense_tier === 'depleted-defense' ? 'important' : 'info',
    },
  ];
  for (const r of result.key_recommendations) {
    findings.push({ code: 'RECOMMENDATION', labelAr: 'توصية غذائية', labelEn: 'Nutritional recommendation', value: r, severity: 'info' });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildAntioxidantOutput(rawInput: AntioxidantInput, options: AntioxidantOutputOptions): ToolOutput<AntioxidantResult> {
  const tool = requireTool('tool-071-antioxidant-manager');
  const result = manageAntioxidants(rawInput);
  return buildToolOutput<AntioxidantResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildAntioxidantProvenance(options),
    keyFindings: buildAntioxidantKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
