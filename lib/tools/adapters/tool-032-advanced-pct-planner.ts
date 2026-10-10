/**
 * Tool #032 — Advanced PCT Planner (Layer 3: persistence + AI adapter).
 * Pure wrapper: engine math + canonical `ToolOutput` envelope. No I/O here.
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
  planAdvancedPCT,
  type PctPlannerInput,
  type PctPlannerResult,
} from '../engines/tool-032-advanced-pct-planner';

export interface PctPlannerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildPctPlannerProvenance(options: PctPlannerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.85 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'days',
    measurementMethod: 'exponential washout model + suppression-tiered SERM protocol',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 14, high: 45, unit: 'washout days', source: 'GPT2 washout planning window' },
  };
}

export function buildPctPlannerKeyFindings(result: PctPlannerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'PCT_START_DATE',
      labelAr: 'تاريخ بدء PCT',
      labelEn: 'PCT Start Date',
      value: result.pct_start_date,
      severity: 'important',
    },
    {
      code: 'WASHOUT_DAYS',
      labelAr: 'أيام التطهير',
      labelEn: 'Washout Days',
      value: result.washout_days,
      severity: 'info',
    },
    {
      code: 'SERM_PROTOCOL',
      labelAr: 'بروتوكول SERM',
      labelEn: 'SERM Protocol',
      value: result.serm_protocol.map((p) => `${p.drug} ${p.daily_dose_mg} x${p.weeks}w`).join(' -> ') || 'none',
      severity: 'info',
    },
  ];
  if (result.hcg_bridge) {
    findings.push({
      code: 'HCG_BRIDGE',
      labelAr: 'جسر hCG',
      labelEn: 'hCG Bridge',
      value: `${result.hcg_bridge.dose_iu} IU ${result.hcg_bridge.per_week}x/wk x${result.hcg_bridge.weeks}w`,
      severity: 'monitor',
    });
  }
  return findings;
}

export function buildPctPlannerOutput(
  rawInput: PctPlannerInput,
  options: PctPlannerOutputOptions,
): ToolOutput<PctPlannerResult> {
  const tool = requireTool('tool-032-advanced-pct-planner');
  const result = planAdvancedPCT(rawInput);
  return buildToolOutput<PctPlannerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildPctPlannerProvenance(options),
    keyFindings: buildPctPlannerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
