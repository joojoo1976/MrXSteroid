/**
 * Tool #056 — Mini PCT Calculator
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
  planMiniPct,
  type MiniPctInput,
  type MiniPctResult,
} from '../engines/tool-056-mini-pct-calculator';

export interface MiniPctOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildMiniPctProvenance(options: MiniPctOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.85 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'days',
    measurementMethod: 'documented washout windows by compound class with long-cycle extension (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 7, high: 28, unit: 'days', source: 'documented washout windows by compound class' },
  };
}

export function buildMiniPctKeyFindings(result: MiniPctResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'WASHOUT',
      labelAr: 'نافذة الغسيل',
      labelEn: 'Washout window',
      value: `${result.washout_days} d`,
      severity: 'info',
    },
    {
      code: 'START_IN_DAYS',
      labelAr: 'بدء PCT بعد (أيام)',
      labelEn: 'PCT starts in (days)',
      value: result.start_in_days,
      severity: result.band === 'window-open' ? 'info' : 'monitor',
    },
    {
      code: 'DURATION',
      labelAr: 'مدة PCT المقترحة',
      labelEn: 'Suggested PCT duration',
      value: `${result.pct_duration_days} d`,
      severity: 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildMiniPctOutput(rawInput: MiniPctInput, options: MiniPctOutputOptions): ToolOutput<MiniPctResult> {
  const tool = requireTool('tool-056-mini-pct-calculator');
  const result = planMiniPct(rawInput);
  return buildToolOutput<MiniPctResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildMiniPctProvenance(options),
    keyFindings: buildMiniPctKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
