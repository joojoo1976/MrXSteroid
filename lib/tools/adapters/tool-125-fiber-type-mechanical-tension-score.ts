/** Tool #125 - Fiber Type Adaptation & Mechanical Tension Score. */
import type { DataProvenance, DataSource, KeyFinding, Locale, SnapshotType, ToolOutput, UnitSystem } from '../contracts';
import { buildSeoLinks, buildToolOutput, requireTool } from '../registry';
import { calcFiberTypeTension, type FiberInput, type FiberResult } from '../engines/tool-125-fiber-type-mechanical-tension-score';

export interface FiberOutputOptions { locale: Locale; unitSystem: UnitSystem; snapshotType: SnapshotType; calculatedAt: string; recordedAt: string; timezone?: string; provenanceSource?: DataSource }

export function buildFiberProvenance(options: FiberOutputOptions): DataProvenance {
  return { source: options.provenanceSource ?? 'manual', recordedAt: options.recordedAt, timezone: options.timezone ?? 'UTC', unit: 'kg', measurementMethod: 'Indirect self-reported training indicators scored by a simplified deterministic model', confidence: null, dataQuality: 'not_assessed' };
}

export function buildFiberKeyFindings(result: FiberResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    { code: 'FIBER_TYPE_ESTIMATE', labelAr: 'تقدير الألياف غير المباشر', labelEn: 'Indirect fiber type estimate', value: result.fiber_type_dominance, severity: 'monitor' },
    { code: 'MECHANICAL_TENSION', labelAr: 'درجة التوتر الميكانيكي', labelEn: 'Mechanical tension score', value: `${result.mechanical_tension_score}/100 · ${result.tension_effectiveness}`, severity: result.tension_effectiveness === 'poor' ? 'important' : result.tension_effectiveness === 'suboptimal' ? 'monitor' : 'info' },
    { code: 'RECOMMENDED_TRAINING', labelAr: 'توجيه تدريبي مقترح من النموذج', labelEn: 'Model-suggested training direction', value: `${result.recommended_rep_range} reps · ${result.recommended_tempo}`, severity: 'info' },
    { code: 'SCOPE_NOTICE', labelAr: 'حدود الأداة', labelEn: 'Tool scope', value: result.scope_notice, severity: 'important' },
  ];
  for (const flag of result.flags) findings.push({ code: `FLAG_${flag.toUpperCase()}`, labelAr: `تنبيه: ${flag}`, labelEn: `Flag: ${flag}`, value: flag, severity: 'monitor' });
  return findings;
}

export function buildFiberOutput(input: FiberInput, options: FiberOutputOptions): ToolOutput<FiberResult> {
  const tool = requireTool('tool-125-fiber-type-mechanical-tension-score');
  const result = calcFiberTypeTension(input);
  return buildToolOutput({ toolId: tool.toolId, toolSlug: tool.slug, calculatedAt: options.calculatedAt, locale: options.locale, unitSystem: options.unitSystem, snapshotType: options.snapshotType, accessTier: tool.accessTier, result, provenance: buildFiberProvenance(options), keyFindings: buildFiberKeyFindings(result), seoLinks: buildSeoLinks(tool) });
}
