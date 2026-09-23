/**
 * lib/tools/adapters/cycle.ts
 * Tool #??? — Layer 3: Persistence & AI adapter for Cycle Architect.
 */
import {
  deriveDataQuality,
  type DataProvenance,
  type DataSource,
  type Locale,
  type KeyFinding,
  type SnapshotType,
  type ToolOutput,
  type UnitSystem,
} from '../contracts';
import { buildToolOutput, requireTool } from '../registry';
import { calculateCycleArchitect, type CycleInput, type CycleOutput } from '../engines/cycle';

export const CYCLE_REFERENCE = {
  weeklyMg: { low: 300, high: 800, unit: 'mg/week' } as const,
  cycleLength: { low: 8, high: 16, unit: 'weeks' } as const,
} as const;

export interface CycleOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildCycleProvenance(options: CycleOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.95 : 0.85;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mg/week',
    measurementMethod: options.provenanceSource && options.provenanceSource !== 'manual'
      ? 'ingested biometric'
      : 'cycle architect estimation',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: {
      low: CYCLE_REFERENCE.weeklyMg.low,
      high: CYCLE_REFERENCE.weeklyMg.high,
      unit: CYCLE_REFERENCE.weeklyMg.unit,
      source: 'Cycle Architect Reference',
    },
  };
}

export function buildCycleKeyFindings(result: CycleOutput): KeyFinding[] {
  const findings: KeyFinding[] = [];

  findings.push({
    code: 'TOTAL_WEEKLY_MG',
    labelAr: 'إجمالي الجرعة الأسبوعية',
    labelEn: 'Total Weekly Dosage',
    value: `${result.totalWeeklyMg} mg/week`,
    severity: result.totalWeeklyMg > 1000 ? 'important' : 'info',
  });

  findings.push({
    code: 'CYCLE_LENGTH',
    labelAr: 'مدة الدورة',
    labelEn: 'Cycle Length',
    value: `${result.compoundsSummary[0]?.activeWeeks ?? 0} weeks`,
    severity: 'info',
  });

  findings.push({
    code: 'PCT_START',
    labelAr: 'بدء العلاج بعد الدورة (PCT)',
    labelEn: 'PCT Start',
    value: `Day ${result.pctProtocol.startDay}`,
    severity: 'important',
  });

  if (result.aiRecommendation.compound !== 'none') {
    findings.push({
      code: 'AI_NEEDED',
      labelAr: 'مثبط أروماتاز مطلوب',
      labelEn: 'Aromatase Inhibitor Required',
      value: `${result.aiRecommendation.compound} ${result.aiRecommendation.doseMg}mg ${result.aiRecommendation.frequency}`,
      severity: 'important',
    });
  }

  return findings;
}

export function buildCycleOutput(
  rawInput: {
    compounds: Array<{compound: string; doseMg: number; frequencyPerWeek: number; weeks: number; startWeek: number}>;
    cycleLengthWeeks: number;
    userWeightKg?: number;
    userHeightCm?: number;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    goal: 'bulk' | 'cut' | 'recomp' | 'strength';
  },
  options: CycleOutputOptions,
): ToolOutput<{
  totalWeeklyMg: number;
  totalCycleMg: number;
  mgPerKgPerWeek?: number;
  longestHalfLifeDays: number;
  averageHalfLifeWeightedDays: number;
  pctStartDayAfterLastPin: number;
  peakTroughRatio: number;
  compoundsSummary: Array<{
    compound: string;
    nameAr: string;
    nameEn: string;
    weeklyMg: number;
    totalMg: number;
    halfLifeDays: number;
    activeWeeks: number;
  }>;
  warnings: string[];
  pctProtocol: {
    startDay: number;
    clomidMgDay1_14: number;
    clomidMgDay15_28: number;
    nolvaMgDay1_14: number;
    nolvaMgDay15_28: number;
    hcgIuPerWeek?: number;
    hcgWeeks?: number;
  };
  aiRecommendation: {
    compound: 'exemestane' | 'anastrozole' | 'letrozole' | 'none';
    doseMg: number;
    frequency: 'eod' | 'e3d' | 'weekly';
  };
}> {
  const tool = requireTool('cycle');
  const result = calculateCycleArchitect(rawInput as CycleInput);

  return buildToolOutput(tool.slug, {
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    result,
    provenance: buildCycleProvenance(options),
    keyFindings: buildCycleKeyFindings(result),
  });
}