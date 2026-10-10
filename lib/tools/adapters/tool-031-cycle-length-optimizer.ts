/**
 * Tool #031 — Cycle Length Optimizer (Layer 3: persistence + AI adapter).
 * Wraps the pure engine result into the canonical `ToolOutput` envelope via
 * `buildToolOutput` (identity, access tier and prev/next links from the
 * registry — never hand-written). Provenance + timestamps are INJECTED.
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
  calculateCycleLength,
  type CycleLengthInput,
  type CycleLengthResult,
} from '../engines/tool-031-cycle-length-optimizer';

export interface CycleLengthOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildCycleLengthProvenance(options: CycleLengthOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.85 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'weeks',
    measurementMethod: 'heuristic duration model (goal + suppression load + ester bottleneck)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 6, high: 16, unit: 'weeks', source: 'GPT2 cycle-duration guidance window' },
  };
}

export function buildCycleLengthKeyFindings(result: CycleLengthResult): KeyFinding[] {
  return [
    {
      code: 'OPTIMAL_WEEKS',
      labelAr: 'المدة المثلى للدورة',
      labelEn: 'Optimal Cycle Length',
      value: `${result.optimal_weeks} weeks`,
      severity: 'info',
    },
    {
      code: 'SUPPRESSION_LOAD',
      labelAr: 'حمل التثبيط',
      labelEn: 'Suppression Load',
      value: result.suppression_load,
      severity: result.suppression_load > 4 ? 'important' : result.suppression_load > 2 ? 'monitor' : 'info',
    },
    {
      code: 'SAFE_WINDOW',
      labelAr: 'النافذة الآمنة',
      labelEn: 'Safe Window',
      value: `${result.min_weeks}-${result.max_weeks} weeks`,
      severity: 'info',
    },
  ];
}

export function buildCycleLengthOutput(
  rawInput: CycleLengthInput,
  options: CycleLengthOutputOptions,
): ToolOutput<CycleLengthResult> {
  const tool = requireTool('tool-031-cycle-length-optimizer');
  const result = calculateCycleLength(rawInput);
  return buildToolOutput<CycleLengthResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildCycleLengthProvenance(options),
    keyFindings: buildCycleLengthKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
