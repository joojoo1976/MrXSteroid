/**
 * Tool #094 — Pregnancy Risk Calculator
 * Layer 3: canonical ToolOutput envelope.
 */
import type { DataProvenance, DataSource, KeyFinding, Locale, SnapshotType, ToolOutput, UnitSystem } from '../contracts';
import { buildToolOutput, requireTool, buildSeoLinks } from '../registry';
import {
  calculatePregnancyRisk,
  type PregnancyRiskCalculatorInput,
  type PregnancyRiskCalculatorResult,
} from '../engines/tool-094-pregnancy-risk-calculator';

export interface PregnancyRiskCalculatorOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildPregnancyRiskCalculatorProvenance(options: PregnancyRiskCalculatorOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'not_applicable',
    measurementMethod: 'No pregnancy-risk or conception-timing model is configured',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildPregnancyRiskCalculatorKeyFindings(result: PregnancyRiskCalculatorResult): KeyFinding[] {
  return [{
    code: result.reason,
    labelAr: 'تقييم خاص بالحالة غير متاح',
    labelEn: 'Individualized assessment unavailable',
    value: result.message,
    severity: 'important',
  }];
}

export function buildPregnancyRiskCalculatorOutput(rawInput: PregnancyRiskCalculatorInput, options: PregnancyRiskCalculatorOutputOptions): ToolOutput<PregnancyRiskCalculatorResult> {
  const tool = requireTool('tool-094-pregnancy-risk-calculator');
  const result = calculatePregnancyRisk(rawInput);
  return buildToolOutput<PregnancyRiskCalculatorResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildPregnancyRiskCalculatorProvenance(options),
    keyFindings: buildPregnancyRiskCalculatorKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
