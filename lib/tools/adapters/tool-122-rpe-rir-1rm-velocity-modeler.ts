/**
 * Tool #122 - RPE / RIR to 1RM Dynamic Velocity Modeler
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
import { calcRPE_RIR_Velocity, type VelocityInput, type VelocityResult } from '../engines/tool-122-rpe-rir-1rm-velocity-modeler';

export interface VelocityOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildVelocityProvenance(options: VelocityOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'kg',
    measurementMethod: 'load_velocity_profile_rpe_rir_based_1rm_estimation',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildVelocityKeyFindings(result: VelocityResult, unitSystem: UnitSystem = 'metric'): KeyFinding[] {
  const displayWeight = (kg: number) => `${unitSystem === 'metric' ? kg : Math.round(kg * 2.20462 * 10) / 10} ${unitSystem === 'metric' ? 'kg' : 'lb'}`;
  const findings: KeyFinding[] = [
    {
      code: 'ESTIMATED_1RM',
      labelAr: '1RM المقدر',
      labelEn: 'Estimated 1RM',
      value: displayWeight(result.estimated_1rm_kg),
      severity: 'info',
    },
    {
      code: 'ESTIMATION_METHOD',
      labelAr: 'طريقة التقدير',
      labelEn: 'Estimation Method',
      value: result.estimation_method,
      severity: 'info',
    },
    {
      code: 'MODEL_FIT_CATEGORY',
      labelAr: 'تصنيف ملاءمة النموذج (ليس ثقة معايرة)',
      labelEn: 'Model fit category (not calibrated confidence)',
      value: result.confidence,
      severity: result.confidence === 'high' ? 'info' : result.confidence === 'medium' ? 'monitor' : 'important',
    },
  ];

  if (result.velocity_based_1rm !== undefined) {
    findings.push({
      code: 'VELOCITY_1RM',
      labelAr: '1RM القائم على السرعة',
      labelEn: 'Velocity-based 1RM',
      value: displayWeight(result.velocity_based_1rm),
      severity: 'info',
    });
  }
  if (result.rpe_based_1rm !== undefined) {
    findings.push({
      code: 'RPE_1RM',
      labelAr: '1RM القائم على RPE',
      labelEn: 'RPE-based 1RM',
      value: displayWeight(result.rpe_based_1rm),
      severity: 'info',
    });
  }
  if (result.rir_based_1rm !== undefined) {
    findings.push({
      code: 'RIR_1RM',
      labelAr: '1RM القائم على RIR',
      labelEn: 'RIR-based 1RM',
      value: displayWeight(result.rir_based_1rm),
      severity: 'info',
    });
  }

  findings.push({
    code: 'LVP_R2',
    labelAr: 'ملاءمة منحنى الحمل-السرعة (R²)',
    labelEn: 'Load-Velocity Profile Fit (R²)',
    value: `${result.lvp_equation.r_squared}`,
    severity: result.lvp_equation.r_squared > 0.9 ? 'info' : 'monitor',
  });

  findings.push({
    code: 'MV_THRESHOLD',
    labelAr: 'حد السرعة الأدنى (MVT)',
    labelEn: 'Minimal Velocity Threshold',
    value: `${result.mv_threshold_m_s} m/s`,
    severity: 'info',
  });

  for (const flag of result.flags) {
    findings.push({
      code: `FLAG_${flag.toUpperCase()}`,
      labelAr: `تنبيه: ${flag}`,
      labelEn: `Flag: ${flag}`,
      value: flag,
      severity: flag.includes('poor_fit') || flag.includes('insufficient') ? 'important' : 'monitor',
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

export function buildVelocityOutput(
  rawInput: VelocityInput,
  options: VelocityOutputOptions,
): ToolOutput<VelocityResult> {
  const tool = requireTool('tool-122-rpe-rir-1rm-velocity-modeler');
  const result = calcRPE_RIR_Velocity(rawInput);
  return buildToolOutput<VelocityResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildVelocityProvenance(options),
    keyFindings: buildVelocityKeyFindings(result, options.unitSystem),
    seoLinks: buildSeoLinks(tool),
  });
}
