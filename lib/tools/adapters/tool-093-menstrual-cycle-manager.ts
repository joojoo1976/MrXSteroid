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
  const confidence = 0.85;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'phase',
    measurementMethod: 'menstrual calendar periodization and physiological substrate modeling (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 21, high: 35, unit: 'days', source: 'normal ovulatory cycle length baseline' },
  };
}

export function buildMenstrualCycleManagerKeyFindings(result: MenstrualCycleManagerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'PHASE',
      labelAr: 'طور الدورة الحالي',
      labelEn: 'Current cycle phase',
      value: result.phase_name_en,
      severity: 'info',
    },
    {
      code: 'POWER_SCORE',
      labelAr: 'مؤشر كفاءة القوة والأداء',
      labelEn: 'Strength & power potential',
      value: `${result.strength_power_potential_score}/100`,
      severity: result.strength_power_potential_score < 60 ? 'monitor' : 'info',
    },
    {
      code: 'SUBSTRATE',
      labelAr: 'المسار الأيضي المفضل',
      labelEn: 'Metabolic substrate preference',
      value: result.metabolic_substrate_preference,
      severity: 'info',
    },
  ];
  for (const r of result.recommendations) {
    findings.push({ code: 'RECOMMENDATION', labelAr: 'توجيه فسيولوجي', labelEn: 'Physiological recommendation', value: r, severity: 'info' });
  }
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
