/**
 * Tool #043 — Prolactin Management Pro
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
  manageProlactin,
  type ProlactinInput,
  type ProlactinResult,
} from '../engines/tool-043-prolactin-management';

export interface ProlactinOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildProlactinProvenance(options: ProlactinOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'device';
  const confidence = source === 'manual' ? 0.85 : 0.78;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'ng/mL',
    measurementMethod: 'prolactin banding (<15/20/25/50) + 19-nor & cabergoline heuristics',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 2, high: 15, unit: 'ng/mL', source: 'adult male reference; athlete tolerance documented' },
  };
}

export function buildProlactinKeyFindings(result: ProlactinResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'PROLACTIN_BAND',
      labelAr: 'نطاق البرولاكتين',
      labelEn: 'Prolactin band',
      value: result.band,
      severity: result.band === 'very-high' ? 'important' : result.band === 'high' || result.band === 'borderline' ? 'monitor' : 'info',
    },
  ];
  if (result.suggested_weekly_mcg > 0) {
    findings.push({
      code: 'CABERGOLINE_HINT',
      labelAr: 'اقتراح كابرجولين (للمراجعة الطبية فقط)',
      labelEn: 'Cabergoline hint (prescriber review only)',
      value: `${result.suggested_weekly_mcg} mcg/wk`,
      severity: 'monitor',
    });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildProlactinOutput(rawInput: ProlactinInput, options: ProlactinOutputOptions): ToolOutput<ProlactinResult> {
  const tool = requireTool('tool-043-prolactin-management');
  const result = manageProlactin(rawInput);
  return buildToolOutput<ProlactinResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildProlactinProvenance(options),
    keyFindings: buildProlactinKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
