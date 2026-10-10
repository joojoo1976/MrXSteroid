/**
 * Tool #045 — Cycle Break Planner
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
  planCycleBreak,
  type CycleBreakInput,
  type CycleBreakResult,
} from '../engines/tool-045-cycle-break-planner';

export interface CycleBreakOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildCycleBreakProvenance(options: CycleBreakOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.86;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'days',
    measurementMethod: '5× half-life clearance rule + cycle-length PCT window sizing',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 1, high: 365, unit: 'days', source: 'documented clearance math (deterministic)' },
  };
}

export function buildCycleBreakKeyFindings(result: CycleBreakResult): KeyFinding[] {
  return [
    { code: 'CLEAR_DAYS', labelAr: 'أيام التطهير الكامل', labelEn: 'Days to full clearance', value: `${result.days_to_full_clear}d`, severity: 'info' },
    { code: 'PCT_WINDOW', labelAr: 'نافذة ما بعد الدورة', labelEn: 'PCT window', value: `day ${result.pct_start_day} · ${result.pct_duration_weeks}wk`, severity: 'monitor' },
    { code: 'BASELINE_WEEK', labelAr: 'العودة لخط الأساس', labelEn: 'Baseline recovery', value: `week ${result.total_weeks_to_baseline}`, severity: 'info' },
    ...result.warnings.map((w): KeyFinding => ({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' })),
  ];
}

export function buildCycleBreakOutput(rawInput: CycleBreakInput, options: CycleBreakOutputOptions): ToolOutput<CycleBreakResult> {
  const tool = requireTool('tool-045-cycle-break-planner');
  const result = planCycleBreak(rawInput);
  return buildToolOutput<CycleBreakResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildCycleBreakProvenance(options),
    keyFindings: buildCycleBreakKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
