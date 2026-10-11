/**
 * Tool #066 — Estrogen Sensitivity Manager
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
  manageEstrogenSensitivity,
  type EstrogenSensitivityInput,
  type EstrogenSensitivityResult,
} from '../engines/tool-066-estrogen-sensitivity-manager';

export interface EstrogenSensitivityOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildEstrogenSensitivityProvenance(options: EstrogenSensitivityOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'symptom burden vs circulating E2 sensitivity pattern screening (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 20, unit: 'score', source: 'educational estrogen sensitivity pattern scale' },
  };
}

export function buildEstrogenSensitivityKeyFindings(result: EstrogenSensitivityResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'SENSITIVITY_PATTERN',
      labelAr: 'نمط حساسية الإستروجين',
      labelEn: 'Sensitivity pattern',
      value: result.sensitivity_pattern,
      severity: result.sensitivity_pattern === 'high-sensitivity' ? 'important' : 'info',
    },
    {
      code: 'CONTEXTUAL_BAND',
      labelAr: 'عبء الأعراض الإستروجينية',
      labelEn: 'Symptom burden band',
      value: result.contextual_band,
      severity: result.contextual_band === 'significant-estrogenic-burden' ? 'important' : result.contextual_band === 'mild-estrogenic-burden' ? 'monitor' : 'info',
    },
    {
      code: 'SYMPTOM_SCORE',
      labelAr: 'مجموع درجات الأعراض',
      labelEn: 'Total symptom score',
      value: `${result.total_symptom_score}`,
      severity: result.total_symptom_score >= 4 ? 'monitor' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildEstrogenSensitivityOutput(rawInput: EstrogenSensitivityInput, options: EstrogenSensitivityOutputOptions): ToolOutput<EstrogenSensitivityResult> {
  const tool = requireTool('tool-066-estrogen-sensitivity-manager');
  const result = manageEstrogenSensitivity(rawInput);
  return buildToolOutput<EstrogenSensitivityResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildEstrogenSensitivityProvenance(options),
    keyFindings: buildEstrogenSensitivityKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
