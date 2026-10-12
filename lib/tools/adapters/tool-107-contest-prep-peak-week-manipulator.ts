/**
 * Tool #107 - Contest Prep Peak-Week Manipulator
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
import { buildPhaseTimeline, type ContestPrepInput, type ContestPrepResult } from '../engines/tool-107-contest-prep-peak-week-manipulator';

export interface ContestPrepOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildContestPrepProvenance(options: ContestPrepOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.72;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'day',
    measurementMethod: 'referenced educational phase-timeline model (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
  };
}

export function buildContestPrepKeyFindings(result: ContestPrepResult): KeyFinding[] {
  return [
    {
      code: 'PHASE_TIMELINE',
      labelAr: 'مخطط المراحل التعليمي',
      labelEn: 'Educational phase timeline',
      value: `stages: ${result.phase_steps.length} | sodium_ref: ${result.sodium_ref_mg_day[0]}-${result.sodium_ref_mg_day[result.sodium_ref_mg_day.length - 1]}mg`,
      severity: 'info',
    },
    {
      code: 'DEHYDRATION_TIER',
      labelAr: 'مؤشر خطر جفاف',
      labelEn: 'Dehydration risk tier',
      value: result.dehydration_risk_tier,
      severity: result.dehydration_risk_tier === 'high' ? 'important' : 'monitor',
    },
    {
      code: 'CHECKLIST_REF',
      labelAr: 'مرجع القائمة',
      labelEn: 'Checklist reference',
      value: result.checklist_ref.join(' | '),
      severity: 'info',
    },
    {
      code: 'SCOPE_NOTICE',
      labelAr: 'حدود الأداة',
      labelEn: 'Tool scope',
      value: result.scope_notice,
      severity: 'important',
    },
  ];
}

export function buildContestPrepOutput(
  rawInput: ContestPrepInput,
  options: ContestPrepOutputOptions,
): ToolOutput<ContestPrepResult> {
  const tool = requireTool('tool-107-contest-prep-peak-week-manipulator');
  const result = buildPhaseTimeline(rawInput);
  return buildToolOutput<ContestPrepResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildContestPrepProvenance(options),
    keyFindings: buildContestPrepKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
