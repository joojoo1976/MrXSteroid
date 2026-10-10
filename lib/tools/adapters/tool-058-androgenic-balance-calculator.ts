/**
 * Tool #058 — Androgenic Balance Calculator
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
  assessAndrogenicBalance,
  type AndrogenicBalanceInput,
  type AndrogenicBalanceResult,
} from '../engines/tool-058-androgenic-balance-calculator';

export interface AndrogenicBalanceOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildAndrogenicBalanceProvenance(options: AndrogenicBalanceOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.85 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'ratio',
    measurementMethod: 'documented DHT/T and E2/T ratio banding (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 10, high: 25, unit: '%', source: 'documented DHT/T balanced band (educational)' },
  };
}

export function buildAndrogenicBalanceKeyFindings(result: AndrogenicBalanceResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'DHT_T_RATIO',
      labelAr: 'نسبة DHT/T',
      labelEn: 'DHT/T ratio',
      value: `${result.dht_t_ratio_pct}%`,
      severity: result.dht_band === 'balanced' ? 'info' : 'monitor',
    },
    {
      code: 'E2_T_RATIO',
      labelAr: 'نسبة E2/T',
      labelEn: 'E2/T ratio',
      value: `${result.e2_t_ratio_pct}%`,
      severity: result.e2_band === 'balanced' ? 'info' : 'important',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildAndrogenicBalanceOutput(rawInput: AndrogenicBalanceInput, options: AndrogenicBalanceOutputOptions): ToolOutput<AndrogenicBalanceResult> {
  const tool = requireTool('tool-058-androgenic-balance-calculator');
  const result = assessAndrogenicBalance(rawInput);
  return buildToolOutput<AndrogenicBalanceResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildAndrogenicBalanceProvenance(options),
    keyFindings: buildAndrogenicBalanceKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
