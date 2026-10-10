/**
 * Tool #042 — Estrogen Management Pro
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
  manageEstrogen,
  type EstrogenInput,
  type EstrogenResult,
} from '../engines/tool-042-estrogen-management';

export interface EstrogenOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildEstrogenProvenance(options: EstrogenOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'device';
  const confidence = source === 'manual' ? 0.85 : 0.78;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'pg/mL',
    measurementMethod: 'sensitive-assay E2 banding (10-40 optimal) + symptom escalation heuristic',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 10, high: 40, unit: 'pg/mL', source: 'adult male sensitive-assay band (documented heuristic)' },
  };
}

export function buildEstrogenKeyFindings(result: EstrogenResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'E2_BAND',
      labelAr: 'نطاق الإستراديول',
      labelEn: 'E2 band',
      value: `${result.band} (${result.optimal_range.low}-${result.optimal_range.high} optimal)`,
      severity: result.band === 'high' ? 'important' : result.band === 'low' || result.band === 'elevated' ? 'monitor' : 'info',
    },
  ];
  if (result.ai_delta_mg !== 0) {
    findings.push({
      code: 'AI_DELTA_HINT',
      labelAr: 'اقتراح تعديل مثبط الأروماتاز (للمراجعة الطبية فقط)',
      labelEn: 'AI dose delta hint (prescriber review only)',
      value: `${result.ai_delta_mg > 0 ? '+' : ''}${result.ai_delta_mg} mg/wk`,
      severity: 'monitor',
    });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildEstrogenOutput(rawInput: EstrogenInput, options: EstrogenOutputOptions): ToolOutput<EstrogenResult> {
  const tool = requireTool('tool-042-estrogen-management');
  const result = manageEstrogen(rawInput);
  return buildToolOutput<EstrogenResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildEstrogenProvenance(options),
    keyFindings: buildEstrogenKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
