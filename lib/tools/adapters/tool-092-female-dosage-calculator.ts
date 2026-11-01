/**
 * Tool #092 — Female Dosage Calculator
 * Layer 3: canonical ToolOutput envelope.
 */
import type { DataProvenance, DataSource, KeyFinding, Locale, SnapshotType, ToolOutput, UnitSystem } from '../contracts';
import { buildToolOutput, requireTool, buildSeoLinks } from '../registry';
import {
  calculateFemaleDosage,
  type FemaleDosageCalculatorInput,
  type FemaleDosageCalculatorResult,
} from '../engines/tool-092-female-dosage-calculator';

export interface FemaleDosageCalculatorOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildFemaleDosageCalculatorProvenance(options: FemaleDosageCalculatorOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'not_applicable',
    measurementMethod: 'No dose model is configured; result is explicitly unavailable',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildFemaleDosageCalculatorKeyFindings(result: FemaleDosageCalculatorResult): KeyFinding[] {
  return [{
    code: result.reason,
    labelAr: 'لا توجد نتيجة جرعة متاحة',
    labelEn: 'Dose assessment unavailable',
    value: result.message,
    severity: 'important',
  }];
}

export function buildFemaleDosageCalculatorOutput(rawInput: FemaleDosageCalculatorInput, options: FemaleDosageCalculatorOutputOptions): ToolOutput<FemaleDosageCalculatorResult> {
  const tool = requireTool('tool-092-female-dosage-calculator');
  const result = calculateFemaleDosage(rawInput);
  return buildToolOutput<FemaleDosageCalculatorResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildFemaleDosageCalculatorProvenance(options),
    keyFindings: buildFemaleDosageCalculatorKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
