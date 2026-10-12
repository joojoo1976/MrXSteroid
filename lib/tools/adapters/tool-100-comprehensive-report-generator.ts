/**
 * Tool #100 — Comprehensive Report Generator
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
  generateComprehensiveReport,
  type ComprehensiveReportGeneratorInput,
  type ComprehensiveReportGeneratorResult,
} from '../engines/tool-100-comprehensive-report-generator';

export interface ComprehensiveReportGeneratorOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildComprehensiveReportGeneratorProvenance(options: ComprehensiveReportGeneratorOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.90;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score',
    measurementMethod: 'multi-pillar unified biomarker synthesis and clinical alert fusion (deterministic model)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 80, high: 100, unit: 'score', source: 'optimal holistic health governance index' },
  };
}

export function buildComprehensiveReportGeneratorKeyFindings(result: ComprehensiveReportGeneratorResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'UNIFIED_INDEX',
      labelAr: 'المؤشر الصحي الموحد الشامل',
      labelEn: 'Unified health index',
      value: `${result.unified_health_index}/100`,
      severity: result.unified_health_index <= 50 ? 'important' : result.unified_health_index <= 75 ? 'monitor' : 'info',
    },
    {
      code: 'GOVERNANCE_TIER',
      labelAr: 'تصنيف الرقابة والمتابعة الطبية',
      labelEn: 'Health governance tier',
      value: result.overall_governance_tier,
      severity: result.overall_governance_tier === 'clinical-escalation-required' ? 'important' : result.overall_governance_tier === 'moderate-vigilance' ? 'monitor' : 'info',
    },
  ];
  for (const d of result.flagged_domains) {
    findings.push({ code: 'FLAGGED_DOMAIN', labelAr: 'محور يتطلب تدخلاً', labelEn: 'Flagged strain domain', value: d, severity: 'important' });
  }
  for (const a of result.action_plan_summary) {
    findings.push({ code: 'ACTION_ITEM', labelAr: 'خطة عمل مقترحة', labelEn: 'Action plan summary item', value: a, severity: 'info' });
  }
  return findings;
}

export function buildComprehensiveReportGeneratorOutput(rawInput: ComprehensiveReportGeneratorInput, options: ComprehensiveReportGeneratorOutputOptions): ToolOutput<ComprehensiveReportGeneratorResult> {
  const tool = requireTool('tool-100-comprehensive-report-generator');
  const result = generateComprehensiveReport(rawInput);
  return buildToolOutput<ComprehensiveReportGeneratorResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildComprehensiveReportGeneratorProvenance(options),
    keyFindings: buildComprehensiveReportGeneratorKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
