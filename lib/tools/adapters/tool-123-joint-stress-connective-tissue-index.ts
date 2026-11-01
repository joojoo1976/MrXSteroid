/** Tool #123 - Joint Stress & Connective Tissue Load Risk Index. */
import type { DataProvenance, DataSource, KeyFinding, Locale, SnapshotType, ToolOutput, UnitSystem } from '../contracts';
import { buildSeoLinks, buildToolOutput, requireTool } from '../registry';
import { calcJointStressConnectiveTissue, type JointStressInput, type JointStressResult } from '../engines/tool-123-joint-stress-connective-tissue-index';

export interface JointStressOutputOptions { locale: Locale; unitSystem: UnitSystem; snapshotType: SnapshotType; calculatedAt: string; recordedAt: string; timezone?: string; provenanceSource?: DataSource }

export function buildJointStressProvenance(options: JointStressOutputOptions): DataProvenance {
  return { source: options.provenanceSource ?? 'manual', recordedAt: options.recordedAt, timezone: options.timezone ?? 'UTC', unit: 'kg', measurementMethod: 'User-entered training load and self-reported recovery markers scored by deterministic heuristics', confidence: null, dataQuality: 'not_assessed' };
}

export function buildJointStressKeyFindings(result: JointStressResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    { code: 'JOINT_STRESS_INDEX', labelAr: 'مؤشر إجهاد المفاصل', labelEn: 'Joint stress index', value: `${result.overall_stress_index}/100 · ${result.risk_level}`, severity: result.risk_level === 'critical' || result.risk_level === 'high' ? 'important' : result.risk_level === 'moderate' ? 'monitor' : 'info' },
    { code: 'CONNECTIVE_TISSUE_RISK', labelAr: 'مؤشر حمل الأنسجة الرابطة', labelEn: 'Connective tissue load index', value: `${result.connective_tissue_risk}/100`, severity: result.connective_tissue_risk >= 70 ? 'important' : result.connective_tissue_risk >= 40 ? 'monitor' : 'info' },
    { code: 'SCOPE_NOTICE', labelAr: 'حدود الأداة', labelEn: 'Tool scope', value: result.scope_notice, severity: 'important' },
  ];
  for (const flag of result.flags) findings.push({ code: `FLAG_${flag.toUpperCase()}`, labelAr: `تنبيه: ${flag}`, labelEn: `Flag: ${flag}`, value: flag, severity: flag.includes('critical') || flag.includes('pain') ? 'important' : 'monitor' });
  for (const recommendation of result.recommendations) findings.push({ code: `RECOMMENDATION_${findings.length}`, labelAr: `توصية: ${recommendation}`, labelEn: `Recommendation: ${recommendation}`, value: recommendation, severity: 'monitor' });
  return findings;
}

export function buildJointStressOutput(input: JointStressInput, options: JointStressOutputOptions): ToolOutput<JointStressResult> {
  const tool = requireTool('tool-123-joint-stress-connective-tissue-index');
  const result = calcJointStressConnectiveTissue(input);
  return buildToolOutput({ toolId: tool.toolId, toolSlug: tool.slug, calculatedAt: options.calculatedAt, locale: options.locale, unitSystem: options.unitSystem, snapshotType: options.snapshotType, accessTier: tool.accessTier, result, provenance: buildJointStressProvenance(options), keyFindings: buildJointStressKeyFindings(result), seoLinks: buildSeoLinks(tool) });
}
