/**
 * Tool #086 — Cortisol Stress Calculator
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
  calculateCortisolStress,
  type CortisolStressInput,
  type CortisolStressResult,
} from '../engines/tool-086-cortisol-stress-calculator';

export interface CortisolStressOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildCortisolStressProvenance(options: CortisolStressOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.72;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'HPA axis stress load and diurnal rhythm disruption assessment (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 35, unit: 'score', source: 'adaptive balanced cortisol stress load index' },
  };
}

export function buildCortisolStressKeyFindings(result: CortisolStressResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'STRESS_LOAD',
      labelAr: 'مؤشر عبء التوتر والكورتيزول',
      labelEn: 'Cortisol stress load score',
      value: `${result.cortisol_stress_load_score}/100`,
      severity: result.cortisol_stress_load_score >= 70 ? 'important' : result.cortisol_stress_load_score >= 40 ? 'monitor' : 'info',
    },
    {
      code: 'HPA_STATUS',
      labelAr: 'حالة المحور الوطائي الكظري',
      labelEn: 'HPA axis status tier',
      value: result.hpa_axis_status_tier,
      severity: result.hpa_axis_status_tier === 'dysregulated-exhaustion' ? 'important' : 'info',
    },
    {
      code: 'CATABOLIC_RISK',
      labelAr: 'مستوى الخطر الهدمي',
      labelEn: 'Catabolic risk tier',
      value: result.catabolic_risk_tier,
      severity: result.catabolic_risk_tier === 'high' ? 'important' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'monitor' });
  }
  return findings;
}

export function buildCortisolStressOutput(rawInput: CortisolStressInput, options: CortisolStressOutputOptions): ToolOutput<CortisolStressResult> {
  const tool = requireTool('tool-086-cortisol-stress-calculator');
  const result = calculateCortisolStress(rawInput);
  return buildToolOutput<CortisolStressResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildCortisolStressProvenance(options),
    keyFindings: buildCortisolStressKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
