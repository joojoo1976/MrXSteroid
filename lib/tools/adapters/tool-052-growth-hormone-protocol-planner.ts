/**
 * Tool #052 — Growth Hormone Protocol Planner
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
  planGrowthHormone,
  type GrowthHormoneInput,
  type GrowthHormoneResult,
} from '../engines/tool-052-growth-hormone-protocol-planner';

export interface GrowthHormoneOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildGrowthHormoneProvenance(options: GrowthHormoneOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.9 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'IU/day',
    measurementMethod: 'weekly-dose scheduling over documented protocol patterns + fixed cost projection',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 6, unit: 'IU/day', source: 'documented conservative ceiling (educational)' },
  };
}

export function buildGrowthHormoneKeyFindings(result: GrowthHormoneResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'DAILY_IU',
      labelAr: 'الجرعة اليومية',
      labelEn: 'Daily dose (on-days)',
      value: `${result.daily_iu_on_days} IU`,
      severity: result.daily_iu_on_days >= 6 ? 'monitor' : 'info',
    },
    {
      code: 'COST_6M',
      labelAr: 'تكلفة 6 أشهر',
      labelEn: '6-month cost',
      value: `$${result.cost_projection_6m_usd.toLocaleString('en-US')}`,
      severity: 'info',
    },
    {
      code: 'PATTERN',
      labelAr: 'نمط البروتوكول',
      labelEn: 'Protocol pattern',
      value: result.rest_days_per_week > 0 ? '5on/2off' : 'daily',
      severity: 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildGrowthHormoneOutput(rawInput: GrowthHormoneInput, options: GrowthHormoneOutputOptions): ToolOutput<GrowthHormoneResult> {
  const tool = requireTool('tool-052-growth-hormone-protocol-planner');
  const result = planGrowthHormone(rawInput);
  return buildToolOutput<GrowthHormoneResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildGrowthHormoneProvenance(options),
    keyFindings: buildGrowthHormoneKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
