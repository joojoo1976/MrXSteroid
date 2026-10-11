/**
 * Tool #072 — Systemic Inflammation Calculator
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
  calculateSystemicInflammation,
  type SystemicInflammationInput,
  type SystemicInflammationResult,
} from '../engines/tool-072-systemic-inflammation-calculator';

export interface SystemicInflammationOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSystemicInflammationProvenance(options: SystemicInflammationOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.8 : 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'biomarker and anthropometric systemic inflammation scoring (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'score', source: 'systemic inflammatory risk index' },
  };
}

export function buildSystemicInflammationKeyFindings(result: SystemicInflammationResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'INFLAMMATION_SCORE',
      labelAr: 'درجة خطر الالتهاب الجهازي',
      labelEn: 'Inflammatory risk score',
      value: `${result.inflammation_risk_score}/100`,
      severity: result.risk_band === 'high-inflammatory-burden' ? 'important' : result.risk_band === 'moderate-inflammatory-burden' ? 'monitor' : 'info',
    },
    {
      code: 'RISK_BAND',
      labelAr: 'مستوى العبء الالتهابي',
      labelEn: 'Inflammatory burden band',
      value: result.risk_band,
      severity: result.risk_band === 'high-inflammatory-burden' ? 'important' : 'info',
    },
    {
      code: 'CRP_STATUS',
      labelAr: 'سياق تحليل hs-CRP',
      labelEn: 'hs-CRP context',
      value: result.crp_context,
      severity: result.crp_context === 'high-systemic-risk' ? 'important' : result.crp_context === 'moderate-cardio-risk' ? 'monitor' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildSystemicInflammationOutput(rawInput: SystemicInflammationInput, options: SystemicInflammationOutputOptions): ToolOutput<SystemicInflammationResult> {
  const tool = requireTool('tool-072-systemic-inflammation-calculator');
  const result = calculateSystemicInflammation(rawInput);
  return buildToolOutput<SystemicInflammationResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSystemicInflammationProvenance(options),
    keyFindings: buildSystemicInflammationKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
