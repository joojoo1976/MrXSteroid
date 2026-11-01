/**
 * Tool #093 — Menstrual Cycle Manager
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
  manageMenstrualCycle,
  type MenstrualCycleManagerInput,
  type MenstrualCycleManagerResult,
} from '../engines/tool-093-menstrual-cycle-manager';

export interface MenstrualCycleManagerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildMenstrualCycleManagerProvenance(options: MenstrualCycleManagerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'calendar days and user-entered flags',
    measurementMethod: 'Manual cycle calendar log; no inferred ovulation or physiology',
    confidence: null,
    dataQuality: deriveDataQuality(null),
  };
}

export function buildMenstrualCycleManagerKeyFindings(result: MenstrualCycleManagerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'CYCLE_DAY',
      labelAr: 'يوم الدورة المدخل',
      labelEn: 'Entered cycle day',
      value: result.current_cycle_day,
      severity: 'info',
    },
    {
      code: 'CYCLE_LENGTH',
      labelAr: 'طول الدورة المدخل',
      labelEn: 'Entered cycle length',
      value: result.cycle_length_days,
      severity: 'info',
    },
    {
      code: 'RESULT_TYPE',
      labelAr: 'نوع النتيجة',
      labelEn: 'Result type',
      value: 'USER_PROVIDED',
      severity: 'info',
    },
  ];
  return findings;
}

export function buildMenstrualCycleManagerOutput(rawInput: MenstrualCycleManagerInput, options: MenstrualCycleManagerOutputOptions): ToolOutput<MenstrualCycleManagerResult> {
  const tool = requireTool('tool-093-menstrual-cycle-manager');
  const result = manageMenstrualCycle(rawInput);
  return buildToolOutput<MenstrualCycleManagerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildMenstrualCycleManagerProvenance(options),
    keyFindings: buildMenstrualCycleManagerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
