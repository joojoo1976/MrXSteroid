/** Tool #124 - Deload Frequency & Fatigue Accumulation Modeler. */
import type { DataProvenance, DataSource, KeyFinding, Locale, SnapshotType, ToolOutput, UnitSystem } from '../contracts';
import { buildSeoLinks, buildToolOutput, requireTool } from '../registry';
import { calcDeloadFrequency, type DeloadInput, type DeloadResult } from '../engines/tool-124-deload-frequency-fatigue-modeler';

export interface DeloadOutputOptions { locale: Locale; unitSystem: UnitSystem; snapshotType: SnapshotType; calculatedAt: string; recordedAt: string; timezone?: string; provenanceSource?: DataSource }

export function buildDeloadProvenance(options: DeloadOutputOptions): DataProvenance {
  return { source: options.provenanceSource ?? 'manual', recordedAt: options.recordedAt, timezone: options.timezone ?? 'UTC', unit: 'weeks', measurementMethod: 'Self-reported training and recovery markers scored by deterministic fatigue heuristics', confidence: null, dataQuality: 'not_assessed' };
}

export function buildDeloadKeyFindings(result: DeloadResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    { code: 'DELOAD_INTERVAL', labelAr: 'الفاصل المقترح للتفريغ', labelEn: 'Suggested deload interval', value: `${result.recommended_deload_interval_weeks} weeks`, severity: 'info' },
    { code: 'WEEKS_UNTIL_DELOAD', labelAr: 'الأسابيع حتى التفريغ', labelEn: 'Weeks until deload', value: `${result.weeks_until_deload}`, severity: result.weeks_until_deload === 0 ? 'important' : 'info' },
    { code: 'FATIGUE_INDEX', labelAr: 'مؤشر الإجهاد الحالي', labelEn: 'Current fatigue index', value: `${result.current_fatigue_index}/100 · ${result.fatigue_trend}`, severity: result.current_fatigue_index >= 70 ? 'important' : result.current_fatigue_index >= 50 ? 'monitor' : 'info' },
    { code: 'DELOAD_TYPE', labelAr: 'نوع التفريغ ومدته', labelEn: 'Deload type and duration', value: `${result.deload_type} · ${result.deload_duration_days} days`, severity: 'info' },
    { code: 'OVERREACHING_RISK', labelAr: 'مؤشر خطر الإجهاد الزائد', labelEn: 'Overreaching risk indicator', value: result.risk_of_overreaching, severity: result.risk_of_overreaching === 'high' ? 'important' : result.risk_of_overreaching === 'moderate' ? 'monitor' : 'info' },
    { code: 'SCOPE_NOTICE', labelAr: 'حدود الأداة', labelEn: 'Tool scope', value: result.scope_notice, severity: 'important' },
  ];
  for (const flag of result.flags) findings.push({ code: `FLAG_${flag.toUpperCase()}`, labelAr: `تنبيه: ${flag}`, labelEn: `Flag: ${flag}`, value: flag, severity: 'monitor' });
  return findings;
}

export function buildDeloadOutput(input: DeloadInput, options: DeloadOutputOptions): ToolOutput<DeloadResult> {
  const tool = requireTool('tool-124-deload-frequency-fatigue-modeler');
  const result = calcDeloadFrequency(input);
  return buildToolOutput({ toolId: tool.toolId, toolSlug: tool.slug, calculatedAt: options.calculatedAt, locale: options.locale, unitSystem: options.unitSystem, snapshotType: options.snapshotType, accessTier: tool.accessTier, result, provenance: buildDeloadProvenance(options), keyFindings: buildDeloadKeyFindings(result), seoLinks: buildSeoLinks(tool) });
}
