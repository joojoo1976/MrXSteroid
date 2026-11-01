/**
 * Tool #115 - Supplement Evidence & Bio-Stack Navigator
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
import { calcSupplementStack, type SupplementResult } from '../engines/tool-115-supplement-evidence-bio-stack-navigator';
import type { SupplementInput } from '../schemas/tool-115-supplement-evidence-bio-stack-navigator';

export interface SupplementOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSupplementProvenance(options: SupplementOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'grade',
    measurementMethod: 'User-provided studies graded by the stated evidence framework',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildSupplementKeyFindings(result: SupplementResult): KeyFinding[] {
  const findings: KeyFinding[] = [];

  // Per-supplement evidence grades
  for (const supp of result.supplements) {
    findings.push({
      code: `EVIDENCE_${supp.id.toUpperCase()}`,
      labelAr: `درجة الدليل: ${supp.name}`,
      labelEn: `Evidence Grade: ${supp.name}`,
      value: `${supp.evidence_grade} (${supp.total_studies} studies, ${supp.rct_count} RCTs)`,
      severity: supp.evidence_grade === 'A' ? 'info' : supp.evidence_grade === 'B' ? 'info' : supp.evidence_grade === 'C' ? 'monitor' : 'important',
    });
  }

  // Stack synergy
  const synergyLabels: Record<string, { ar: string; en: string }> = {
    synergistic: { ar: 'متآزر', en: 'Synergistic' },
    additive: { ar: 'إضافي', en: 'Additive' },
    neutral: { ar: 'متعادل', en: 'Neutral' },
    antagonistic: { ar: 'متضاد', en: 'Antagonistic' },
    unknown: { ar: 'غير معروف', en: 'Unknown' },
  };

  findings.push({
    code: 'STACK_SYNERGY',
    labelAr: 'تآزر الستاك الكلي',
    labelEn: 'Overall Stack Synergy',
    value: synergyLabels[result.stack_analysis.overall_synergy]?.en ?? result.stack_analysis.overall_synergy,
    severity: result.stack_analysis.overall_synergy === 'antagonistic' ? 'important' : 'info',
  });

  // Pairwise interactions (only non-neutral/unknown)
  for (const pair of result.stack_analysis.pairwise_interactions) {
    if (pair.effect !== 'unknown' && pair.effect !== 'neutral') {
      findings.push({
        code: `INTERACTION_${pair.supplement_a}_${pair.supplement_b}`.replace(/\s+/g, '_').toUpperCase(),
        labelAr: `تفاعل: ${pair.supplement_a} × ${pair.supplement_b}`,
        labelEn: `Interaction: ${pair.supplement_a} × ${pair.supplement_b}`,
        value: `${pair.effect} (${pair.risk} risk)`,
        severity: pair.risk === 'high' ? 'important' : pair.risk === 'moderate' ? 'monitor' : 'info',
      });
    }
  }

  // Goal alignment
  for (const [goal, score] of Object.entries(result.stack_analysis.goal_alignment)) {
    findings.push({
      code: `GOAL_${goal.toUpperCase()}`,
      labelAr: `توافق الهدف: ${goal}`,
      labelEn: `Goal Alignment: ${goal}`,
      value: `${score}/100`,
      severity: score >= 80 ? 'info' : score >= 60 ? 'monitor' : 'important',
    });
  }

  // Flags
  for (const flag of result.flags) {
    findings.push({
      code: `FLAG_${flag.toUpperCase()}`,
      labelAr: `تنبيه: ${flag}`,
      labelEn: `Flag: ${flag}`,
      value: flag,
      severity: flag.includes('high_risk') || flag.includes('grade_D') || flag.includes('antagonistic') ? 'important' : 'monitor',
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

export function buildSupplementOutput(
  rawInput: SupplementInput,
  options: SupplementOutputOptions,
): ToolOutput<SupplementResult> {
  const tool = requireTool('tool-115-supplement-evidence-bio-stack-navigator');
  const result = calcSupplementStack(rawInput);
  return buildToolOutput<SupplementResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSupplementProvenance(options),
    keyFindings: buildSupplementKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
