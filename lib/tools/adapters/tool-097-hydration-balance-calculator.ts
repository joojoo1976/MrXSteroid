/**
 * Tool #097 — Hydration Balance Calculator
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
  calculateHydrationBalance,
  type HydrationBalanceCalculatorInput,
  type HydrationBalanceCalculatorResult,
} from '../engines/tool-097-hydration-balance-calculator';

export interface HydrationBalanceCalculatorOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildHydrationBalanceCalculatorProvenance(options: HydrationBalanceCalculatorOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.85;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'L',
    measurementMethod: 'metabolic body water turnover and thermoregulatory sweat rate modeling (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 2.0, high: 4.5, unit: 'L', source: 'sports clinical daily fluid recommendation' },
  };
}

export function buildHydrationBalanceCalculatorKeyFindings(result: HydrationBalanceCalculatorResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'DAILY_FLUID',
      labelAr: 'الاحتياج اليومي الكلي المقترح من السوائل',
      labelEn: 'Recommended daily fluid intake',
      value: `${result.recommended_daily_fluid_liters} L`,
      severity: result.recommended_daily_fluid_liters >= 5.0 ? 'important' : 'info',
    },
    {
      code: 'SWEAT_LOSS',
      labelAr: 'تقدير فقدان السوائل أثناء التمرين',
      labelEn: 'Exercise sweat loss estimate',
      value: `${result.sweat_loss_estimate_liters} L`,
      severity: result.sweat_loss_estimate_liters >= 2.0 ? 'monitor' : 'info',
    },
    {
      code: 'HYDRATION_TIER',
      labelAr: 'مستوى متطلبات الترطيب',
      labelEn: 'Hydration demand tier',
      value: result.hydration_status_tier,
      severity: result.hydration_status_tier === 'critical-hyperhydration-required' ? 'important' : 'info',
    },
  ];
  for (const g of result.hydration_guidelines) {
    findings.push({ code: 'GUIDELINE', labelAr: 'إرشاد ترطيب', labelEn: 'Hydration guideline', value: g, severity: 'info' });
  }
  return findings;
}

export function buildHydrationBalanceCalculatorOutput(rawInput: HydrationBalanceCalculatorInput, options: HydrationBalanceCalculatorOutputOptions): ToolOutput<HydrationBalanceCalculatorResult> {
  const tool = requireTool('tool-097-hydration-balance-calculator');
  const result = calculateHydrationBalance(rawInput);
  return buildToolOutput<HydrationBalanceCalculatorResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildHydrationBalanceCalculatorProvenance(options),
    keyFindings: buildHydrationBalanceCalculatorKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
