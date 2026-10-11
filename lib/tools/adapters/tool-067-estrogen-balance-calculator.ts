/**
 * Tool #067 — Estrogen Balance Calculator
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
  calculateEstrogenBalance,
  type EstrogenBalanceInput,
  type EstrogenBalanceResult,
} from '../engines/tool-067-estrogen-balance-calculator';

export interface EstrogenBalanceOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildEstrogenBalanceProvenance(options: EstrogenBalanceOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.85 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'ratio',
    measurementMethod: 'Total Testosterone (ng/dL) to Estradiol (pg/mL) physiological ratio screening (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 14, high: 30, unit: 'ratio', source: 'physiological adult-male T:E2 balance reference' },
  };
}

export function buildEstrogenBalanceKeyFindings(result: EstrogenBalanceResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'TE2_RATIO',
      labelAr: 'نسبة T:E2',
      labelEn: 'T:E2 ratio',
      value: `${result.t_to_e2_ratio}:1`,
      severity: result.balance_band === 'balanced-optimal' ? 'info' : 'important',
    },
    {
      code: 'BALANCE_BAND',
      labelAr: 'تصنيف التوازن الهرموني',
      labelEn: 'Balance classification',
      value: result.balance_band,
      severity: result.balance_band === 'balanced-optimal' ? 'info' : 'important',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildEstrogenBalanceOutput(rawInput: EstrogenBalanceInput, options: EstrogenBalanceOutputOptions): ToolOutput<EstrogenBalanceResult> {
  const tool = requireTool('tool-067-estrogen-balance-calculator');
  const result = calculateEstrogenBalance(rawInput);
  return buildToolOutput<EstrogenBalanceResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildEstrogenBalanceProvenance(options),
    keyFindings: buildEstrogenBalanceKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
