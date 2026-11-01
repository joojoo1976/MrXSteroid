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
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'mmHg',
    measurementMethod: 'single user-entered reading compared with AHA/ACC adult reference categories',
    confidence: null,
    dataQuality: deriveDataQuality(null),
  };
}

export function buildBloodPressureKeyFindings(result: BloodPressureResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'BP_CATEGORY',
      labelAr: 'نطاق قراءة ضغط الدم (AHA/ACC)',
      labelEn: 'Blood pressure category',
      value: result.category,
      severity: result.category === 'severe-range' || result.category === 'stage-2-hypertension' ? 'important' : result.category === 'stage-1-hypertension' ? 'monitor' : 'info',
    },
    {
      code: 'MAP',
      labelAr: 'متوسط الضغط الشرياني (MAP)',
      labelEn: 'Mean arterial pressure (MAP)',
      value: `${result.mean_arterial_pressure} mmHg`,
      severity: 'info',
    },
    {
      code: 'PULSE_PRESSURE',
      labelAr: 'ضغط النبض (Pulse Pressure)',
      labelEn: 'Pulse pressure (PP)',
      value: `${result.pulse_pressure} mmHg`,
      severity: 'info',
    },
  ];
  if (result.follow_up_needed) {
    findings.push({
      code: 'ESCALATION',
      labelAr: 'متابعة القراءة الشديدة',
      labelEn: 'Severe-range reading follow-up',
      value: 'repeat_reading_then_check_symptoms',
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
