/**
 * Tool #089 — Serotonin Manager
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
  manageSerotonin,
  type SerotoninManagerInput,
  type SerotoninManagerResult,
} from '../engines/tool-089-serotonin-manager';

export interface SerotoninManagerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSerotoninManagerProvenance(options: SerotoninManagerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.70;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'enteric-brain serotonin pathway and substrate availability assessment (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 75, high: 100, unit: 'score', source: 'optimal harmonized serotonin somatic tone index' },
  };
}

export function buildSerotoninManagerKeyFindings(result: SerotoninManagerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'SEROTONIN_SCORE',
      labelAr: 'مؤشر المسار السيروتونيني الجسدي',
      labelEn: 'Serotonin somatic score',
      value: `${result.serotonin_somatic_score}/100`,
      severity: result.serotonin_somatic_score <= 40 ? 'important' : result.serotonin_somatic_score <= 65 ? 'monitor' : 'info',
    },
    {
      code: 'SEROTONIN_TIER',
      labelAr: 'تصنيف توازن السيروتونين',
      labelEn: 'Serotonin balance tier',
      value: result.serotonin_balance_tier,
      severity: result.serotonin_balance_tier === 'suboptimal-depleted' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildSerotoninManagerOutput(rawInput: SerotoninManagerInput, options: SerotoninManagerOutputOptions): ToolOutput<SerotoninManagerResult> {
  const tool = requireTool('tool-089-serotonin-manager');
  const result = manageSerotonin(rawInput);
  return buildToolOutput<SerotoninManagerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSerotoninManagerProvenance(options),
    keyFindings: buildSerotoninManagerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
