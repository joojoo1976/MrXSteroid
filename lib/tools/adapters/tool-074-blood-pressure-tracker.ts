/**
 * Tool #074 — Blood Pressure Tracker
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
  trackBloodPressure,
  type BloodPressureInput,
  type BloodPressureResult,
} from '../engines/tool-074-blood-pressure-tracker';

export interface BloodPressureOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildBloodPressureProvenance(options: BloodPressureOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.85 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mmHg',
    measurementMethod: 'resting brachial sphygmomanometer AHA/ACC guideline classification (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 70, high: 120, unit: 'mmHg', source: 'AHA/ACC 2017 Blood Pressure Guidelines' },
  };
}

export function buildBloodPressureKeyFindings(result: BloodPressureResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'BP_CATEGORY',
      labelAr: 'تصنيف ضغط الدم (AHA/ACC)',
      labelEn: 'Blood pressure category',
      value: result.category,
      severity: result.category === 'hypertensive-crisis' || result.category === 'stage-2-hypertension' ? 'important' : result.category === 'stage-1-hypertension' ? 'monitor' : 'info',
    },
    {
      code: 'MAP',
      labelAr: 'متوسط الضغط الشرياني (MAP)',
      labelEn: 'Mean arterial pressure (MAP)',
      value: `${result.mean_arterial_pressure} mmHg`,
      severity: result.mean_arterial_pressure >= 105 ? 'important' : 'info',
    },
    {
      code: 'PULSE_PRESSURE',
      labelAr: 'ضغط النبض (Pulse Pressure)',
      labelEn: 'Pulse pressure (PP)',
      value: `${result.pulse_pressure} mmHg`,
      severity: result.pulse_pressure > 60 ? 'important' : 'info',
    },
  ];
  if (result.escalation_needed) {
    findings.push({
      code: 'ESCALATION',
      labelAr: 'تنبيه طارئ لضغط الدم',
      labelEn: 'Emergency BP escalation',
      value: 'immediate_medical_evaluation_needed',
      severity: 'important',
    });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildBloodPressureOutput(rawInput: BloodPressureInput, options: BloodPressureOutputOptions): ToolOutput<BloodPressureResult> {
  const tool = requireTool('tool-074-blood-pressure-tracker');
  const result = trackBloodPressure(rawInput);
  return buildToolOutput<BloodPressureResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildBloodPressureProvenance(options),
    keyFindings: buildBloodPressureKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
