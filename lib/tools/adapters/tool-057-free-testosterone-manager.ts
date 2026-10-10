/**
 * Tool #057 — Free Testosterone Manager
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
  estimateFreeTestosterone,
  type FreeTestosteroneInput,
  type FreeTestosteroneResult,
} from '../engines/tool-057-free-testosterone-manager';

export interface FreeTestosteroneOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildFreeTestosteroneProvenance(options: FreeTestosteroneOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.85 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'pg/mL',
    measurementMethod: 'Vermeulen simplified linear-binding free-T approximation (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 15, high: 50, unit: 'pg/mL', source: 'published free-testosterone educational range' },
  };
}

export function buildFreeTestosteroneKeyFindings(result: FreeTestosteroneResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'FREE_T',
      labelAr: 'التستوستيرون الحر',
      labelEn: 'Free testosterone',
      value: `${result.free_t_pg_ml} pg/mL`,
      severity: result.band === 'normal-free-fraction' ? 'info' : 'monitor',
    },
    {
      code: 'FREE_PCT',
      labelAr: 'نسبة الحر من الكلي',
      labelEn: 'Free/total share',
      value: `${result.free_t_pct}%`,
      severity: 'info',
    },
    {
      code: 'BAND',
      labelAr: 'التصنيف',
      labelEn: 'Band',
      value: result.band,
      severity: result.band === 'normal-free-fraction' ? 'info' : 'monitor',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildFreeTestosteroneOutput(rawInput: FreeTestosteroneInput, options: FreeTestosteroneOutputOptions): ToolOutput<FreeTestosteroneResult> {
  const tool = requireTool('tool-057-free-testosterone-manager');
  const result = estimateFreeTestosterone(rawInput);
  return buildToolOutput<FreeTestosteroneResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildFreeTestosteroneProvenance(options),
    keyFindings: buildFreeTestosteroneKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
