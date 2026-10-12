/**
 * Tool #090 — Female Hormone Balance Calculator
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
  calculateFemaleHormoneBalance,
  type FemaleHormoneBalanceInput,
  type FemaleHormoneBalanceResult,
} from '../engines/tool-090-female-hormone-balance-calculator';

export interface FemaleHormoneBalanceOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildFemaleHormoneBalanceProvenance(options: FemaleHormoneBalanceOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'ovulatory cycle and androgenic symptom cluster screening (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 75, high: 100, unit: 'score', source: 'harmonious ovulatory and endocrine baseline index' },
  };
}

export function buildFemaleHormoneBalanceKeyFindings(result: FemaleHormoneBalanceResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'HARMONY_SCORE',
      labelAr: 'مؤشر التناغم الهرموني',
      labelEn: 'Hormone harmony score',
      value: `${result.hormone_harmony_score}/100`,
      severity: result.hormone_harmony_score <= 45 ? 'important' : result.hormone_harmony_score <= 70 ? 'monitor' : 'info',
    },
    {
      code: 'BALANCE_TIER',
      labelAr: 'تصنيف التوازن الإستروجيني والبروجستيروني',
      labelEn: 'Estrogen-progesterone balance tier',
      value: result.estrogen_progesterone_balance_tier,
      severity: result.estrogen_progesterone_balance_tier === 'ovulatory-disruption-risk' ? 'important' : 'info',
    },
    {
      code: 'VIRILIZATION_RISK',
      labelAr: 'مستوى خطر الآثار الأندروجينية/الذكورية',
      labelEn: 'Androgenic virilization risk',
      value: result.androgenic_virilization_risk,
      severity: result.androgenic_virilization_risk === 'elevated' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildFemaleHormoneBalanceOutput(rawInput: FemaleHormoneBalanceInput, options: FemaleHormoneBalanceOutputOptions): ToolOutput<FemaleHormoneBalanceResult> {
  const tool = requireTool('tool-090-female-hormone-balance-calculator');
  const result = calculateFemaleHormoneBalance(rawInput);
  return buildToolOutput<FemaleHormoneBalanceResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildFemaleHormoneBalanceProvenance(options),
    keyFindings: buildFemaleHormoneBalanceKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
