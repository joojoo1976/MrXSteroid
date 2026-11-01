/**
 * Tool #120 - Progressive Overload & Adaptive Reserve Capacity Predictor
 * Layer 3: canonical ToolOutput envelope.
 */
import {
  type DataProvenance,
  type DataSource,
  type KeyFinding,
  type Locale,
  type SnapshotType,
  type ToolOutput,
  type UnitSystem,
} from '../contracts';
import { buildToolOutput, requireTool, buildSeoLinks } from '../registry';
import { calcOverloadPredictor, type OverloadInput, type OverloadResult } from '../engines/tool-120-progressive-overload-predictor';

export interface OverloadOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildOverloadProvenance(options: OverloadOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'kg',
    measurementMethod: 'User-entered performance projected by deterministic heuristics',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildOverloadKeyFindings(result: OverloadResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'ADAPTIVE_RESERVE',
      labelAr: 'الاحتياطي التكيفي',
      labelEn: 'Adaptive Reserve',
      value: `${result.adaptive_reserve_pct}%`,
      severity: result.adaptive_reserve_pct >= 50 ? 'info' : result.adaptive_reserve_pct >= 25 ? 'monitor' : 'important',
    },
    {
      code: 'GENETIC_POTENTIAL',
      labelAr: 'الإمكانات الوراثية (1RM)',
      labelEn: 'Genetic Potential (1RM)',
      value: `${result.genetic_potential_1rm_kg} kg`,
      severity: 'info',
    },
    {
      code: 'WEEKS_TO_PLATEAU',
      labelAr: 'أسابيع حتى الاستقرار',
      labelEn: 'Weeks to Plateau',
      value: result.weeks_to_plateau >= 12 ? '12+' : `${result.weeks_to_plateau}`,
      severity: result.weeks_to_plateau <= 4 ? 'important' : result.weeks_to_plateau <= 8 ? 'monitor' : 'info',
    },
    {
      code: 'PROJECTED_4W',
      labelAr: '1RM متوقع (٤ أسابيع)',
      labelEn: 'Projected 1RM (4 weeks)',
      value: `${result.projected_1rm_4weeks} kg`,
      severity: 'info',
    },
    {
      code: 'PROJECTED_12W',
      labelAr: '1RM متوقع (١٢ أسبوع)',
      labelEn: 'Projected 1RM (12 weeks)',
      value: `${result.projected_1rm_12weeks} kg`,
      severity: 'info',
    },
    {
      code: 'RECOMMENDED_INCREASE',
      labelAr: 'الزيادة الأسبوعية الموصى بها',
      labelEn: 'Recommended Weekly Increase',
      value: `${result.recommended_weekly_increase_pct}%`,
      severity: 'info',
    },
  ];

  for (const risk of result.risk_factors) {
    findings.push({
      code: `RISK_${risk.toUpperCase()}`,
      labelAr: `خطر: ${risk}`,
      labelEn: `Risk: ${risk}`,
      value: risk,
      severity: risk.includes('very_low') || risk.includes('aggressive') ? 'important' : 'monitor',
    });
  }

  for (const flag of result.flags) {
    findings.push({
      code: `FLAG_${flag.toUpperCase()}`,
      labelAr: `تنبيه: ${flag}`,
      labelEn: `Flag: ${flag}`,
      value: flag,
      severity: 'important',
    });
  }

  findings.push({
    code: 'SCOPE_NOTICE',
    labelAr: 'حدود الأداة',
    labelEn: 'Tool Scope',
    value: result.scope_notice,
    severity: 'important',
  });

  return findings;
}

export function buildOverloadOutput(
  rawInput: OverloadInput,
  options: OverloadOutputOptions,
): ToolOutput<OverloadResult> {
  const tool = requireTool('tool-120-progressive-overload-predictor');
  const result = calcOverloadPredictor(rawInput);
  return buildToolOutput<OverloadResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildOverloadProvenance(options),
    keyFindings: buildOverloadKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
