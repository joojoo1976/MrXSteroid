/**
 * Tool #075 — Arterial Health Manager
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
  manageArterialHealth,
  type ArterialHealthInput,
  type ArterialHealthResult,
} from '../engines/tool-075-arterial-health-manager';

export interface ArterialHealthOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildArterialHealthProvenance(options: ArterialHealthOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'hemodynamic pulse pressure and lipid atherogenic ratios screening (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'score', source: 'cardiovascular arterial health & stiffness risk index' },
  };
}

export function buildArterialHealthKeyFindings(result: ArterialHealthResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'ARTERIAL_RISK_SCORE',
      labelAr: 'درجة خطر تصلب الشرايين',
      labelEn: 'Arterial stiffness risk score',
      value: `${result.arterial_risk_score}/100`,
      severity: result.stiffness_risk_band === 'elevated-stiffness-risk' ? 'important' : result.stiffness_risk_band === 'moderate-stiffness-risk' ? 'monitor' : 'info',
    },
    {
      code: 'STIFFNESS_BAND',
      labelAr: 'تصنيف مرونة الشرايين',
      labelEn: 'Vascular stiffness tier',
      value: result.stiffness_risk_band,
      severity: result.stiffness_risk_band === 'elevated-stiffness-risk' ? 'important' : 'info',
    },
  ];
  if (result.tc_to_hdl_ratio !== null) {
    findings.push({
      code: 'TC_HDL_RATIO',
      labelAr: 'نسبة الكوليسترول الكلي إلى HDL',
      labelEn: 'Total Cholesterol to HDL ratio',
      value: `${result.tc_to_hdl_ratio}:1`,
      severity: result.tc_to_hdl_ratio >= 5.0 ? 'important' : result.tc_to_hdl_ratio >= 3.8 ? 'monitor' : 'info',
    });
  }
  if (result.tg_to_hdl_ratio !== null) {
    findings.push({
      code: 'TG_HDL_RATIO',
      labelAr: 'نسبة الدهون الثلاثية إلى HDL',
      labelEn: 'Triglycerides to HDL ratio',
      value: `${result.tg_to_hdl_ratio}:1`,
      severity: result.tg_to_hdl_ratio >= 3.5 ? 'important' : result.tg_to_hdl_ratio >= 2.0 ? 'monitor' : 'info',
    });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildArterialHealthOutput(rawInput: ArterialHealthInput, options: ArterialHealthOutputOptions): ToolOutput<ArterialHealthResult> {
  const tool = requireTool('tool-075-arterial-health-manager');
  const result = manageArterialHealth(rawInput);
  return buildToolOutput<ArterialHealthResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildArterialHealthProvenance(options),
    keyFindings: buildArterialHealthKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
