/**
 * Tool #037 — Side Effect Probability Calculator
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
  calculateSideEffectProbability,
  type SideEffectRiskInput,
  type SideEffectRiskResult,
} from '../engines/tool-037-side-effect-probability';

export interface SideEffectRiskOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildSideEffectProbabilityProvenance(options: SideEffectRiskOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.88 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: '%',
    measurementMethod: 'additive dose-load × harshness × modifier model (population heuristic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: '%', source: 'documented heuristic; not a personal medical prediction' },
  };
}

export function buildSideEffectProbabilityKeyFindings(result: SideEffectRiskResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    { code: 'OVERALL_BURDEN', labelAr: 'العبء العام', labelEn: 'Overall Burden', value: `${result.overall_burden_pct}%`, severity: 'info' },
  ];
  for (const r of result.risks) {
    findings.push({
      code: r.effect,
      labelAr: r.effect,
      labelEn: r.effect,
      value: `${r.probability_pct}%`,
      severity: r.level === 'high' ? 'important' : r.level === 'moderate' ? 'monitor' : 'info',
    });
  }
  findings.push(...result.mitigations.map((m): KeyFinding => ({ code: 'MITIGATION', labelAr: 'إجراء', labelEn: 'Action', value: m, severity: 'monitor' })));
  return findings;
}

export function buildSideEffectProbabilityOutput(rawInput: SideEffectRiskInput, options: SideEffectRiskOutputOptions): ToolOutput<SideEffectRiskResult> {
  const tool = requireTool('tool-037-side-effect-probability');
  const result = calculateSideEffectProbability(rawInput);
  return buildToolOutput<SideEffectRiskResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildSideEffectProbabilityProvenance(options),
    keyFindings: buildSideEffectProbabilityKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
