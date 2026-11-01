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
import { buildToolOutput, buildSeoLinks, requireTool } from '../registry';
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
  return {
    source: options.provenanceSource ?? 'manual',
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'L and L/h',
    originalUnit: options.unitSystem === 'imperial' ? 'lb and US fl oz' : 'kg and L',
    measurementMethod: 'User-entered pre/post exercise body mass and fluid volumes; NATA field sweat-loss equation',
    confidence: null,
    dataQuality: deriveDataQuality(null),
  };
}

export function buildHydrationBalanceCalculatorKeyFindings(result: HydrationBalanceCalculatorResult, locale: Locale): KeyFinding[] {
  if (result.status === 'NOT_AVAILABLE') {
    return [{
      code: result.reason,
      labelAr: 'تعذر حساب معدل التعرق',
      labelEn: 'Sweat-rate calculation unavailable',
      value: result.reason,
      severity: 'info',
    }];
  }

  const ar = locale === 'ar';
  return [
    {
      code: 'SWEAT_LOSS_MEASURED',
      labelAr: 'فقد العرق المحسوب من القياسات',
      labelEn: 'Measured sweat loss calculation',
      value: `${result.sweat_loss_liters} L`,
      severity: 'info',
    },
    {
      code: 'SWEAT_RATE_CALCULATED',
      labelAr: 'معدل التعرق المحسوب',
      labelEn: 'Calculated sweat rate',
      value: `${result.sweat_rate_liters_per_hour} L/h`,
      severity: 'info',
    },
    {
      code: 'RESULT_TYPE',
      labelAr: 'نوع النتيجة',
      labelEn: 'Result type',
      value: ar ? 'حساب رياضي' : 'CALCULATED',
      severity: 'info',
    },
  ];
}

export function buildHydrationBalanceCalculatorOutput(
  rawInput: HydrationBalanceCalculatorInput,
  options: HydrationBalanceCalculatorOutputOptions,
): ToolOutput<HydrationBalanceCalculatorResult> {
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
    keyFindings: buildHydrationBalanceCalculatorKeyFindings(result, options.locale),
    seoLinks: buildSeoLinks(tool),
  });
}
