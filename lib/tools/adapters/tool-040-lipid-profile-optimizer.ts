/**
 * Tool #040 — Lipid Profile Optimizer
 * Layer 3: persistence + canonical ToolOutput envelope.
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
  optimizeLipidProfile,
  type LipidOptimizerInput,
  type LipidOptimizerResult,
} from '../engines/tool-040-lipid-profile-optimizer';

export interface LipidOptimizerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildLipidOptimizerProvenance(options: LipidOptimizerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.9 : 0.78;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mg/dL',
    measurementMethod: 'NCEP-ATP III style bands + ASCVD proxy risk escalation (pure engine)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 600, unit: 'mg/dL', source: 'NCEP-ATP III; clinical validation required' },
  };
}

export function buildLipidOptimizerKeyFindings(result: LipidOptimizerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    { code: 'LDL_BAND', labelAr: 'نطاق LDL', labelEn: 'LDL Band', value: result.ldl_status, severity: 'info' },
    { code: 'HDL_BAND', labelAr: 'نطاق HDL', labelEn: 'HDL Band', value: result.hdl_status, severity: 'info' },
    { code: 'TG_BAND', labelAr: 'نطاق الدهون الثلاثية', labelEn: 'TG Band', value: result.tg_status, severity: 'info' },
    { code: 'NON_HDL', labelAr: 'غير HDL', labelEn: 'Non-HDL', value: `${result.non_hdl} mg/dL`, severity: result.overall_band === 'very-high' ? 'important' : 'monitor' },
    { code: 'OVERALL_BAND', labelAr: 'النطاق العام', labelEn: 'Overall Band', value: result.overall_band, severity: result.overall_band === 'very-high' ? 'important' : result.overall_band === 'high' ? 'monitor' : 'info' },
  ];
  for (const i of result.interventions) {
    findings.push({ code: 'INTERVENTION', labelAr: 'تدخل', labelEn: 'Intervention', value: i, severity: 'monitor' });
  }
  return findings;
}

export function buildLipidOptimizerOutput(rawInput: LipidOptimizerInput, options: LipidOptimizerOutputOptions): ToolOutput<LipidOptimizerResult> {
  const tool = requireTool('tool-040-lipid-profile-optimizer');
  const result = optimizeLipidProfile(rawInput);
  return buildToolOutput<LipidOptimizerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildLipidOptimizerProvenance(options),
    keyFindings: buildLipidOptimizerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
