/**
 * Tool #036 — Injection Schedule Planner
 * Layer 3: persistence + canonical ToolOutput envelope.
 * The pure engine result is wrapped via `buildToolOutput`; provenance + keyFindings
 * are derived here (never hand-written), access tier and prev/next links come
 * from the registry — never injected manually.
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
  planInjectionSchedule,
  type InjectionScheduleInput,
  type InjectionScheduleResult,
} from '../engines/tool-036-injection-schedule';

export interface InjectionScheduleOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildInjectionScheduleProvenance(options: InjectionScheduleOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.88 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mL / week',
    measurementMethod: 'weekly-dose splitter + site-volume guard (pure engine)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 1000, unit: 'mL / week', source: 'engineering heuristic; manual review required' },
  };
}

export function buildInjectionScheduleKeyFindings(result: InjectionScheduleResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    { code: 'TOTAL_VOLUME', labelAr: 'إجمالي الحجم/أسبوع', labelEn: 'Total Weekly Volume', value: `${result.total_volume_ml_per_week} mL`, severity: 'info' },
    { code: 'BUSIEST_DAY', labelAr: 'أكثر يوم ازدحامًا', labelEn: 'Busiest Day', value: `day-${result.busiest_day}`, severity: result.busiest_day > 4 ? 'monitor' : 'info' },
  ];
  if (result.warnings.length > 0) {
    findings.push({
      code: 'SPLIT_WARNINGS',
      labelAr: 'تحذيرات التصنيف',
      labelEn: 'Split Warnings',
      value: result.warnings.join('; '),
      severity: 'important',
    });
  }
  return findings;
}

export function buildInjectionScheduleOutput(rawInput: InjectionScheduleInput, options: InjectionScheduleOutputOptions): ToolOutput<InjectionScheduleResult> {
  const tool = requireTool('tool-036-injection-schedule');
  const result = planInjectionSchedule(rawInput);
  return buildToolOutput<InjectionScheduleResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildInjectionScheduleProvenance(options),
    keyFindings: buildInjectionScheduleKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
