/**
 * Tool #091 — Female Health Optimizer
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
  optimizeFemaleHealth,
  type FemaleHealthOptimizerInput,
  type FemaleHealthOptimizerResult,
} from '../engines/tool-091-female-health-optimizer';

export interface FemaleHealthOptimizerOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildFemaleHealthOptimizerProvenance(options: FemaleHealthOptimizerOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'user-entered observations',
    measurementMethod: 'Manual energy, iron, symptom, and training observation log; no inferred health state',
    confidence: null,
    dataQuality: deriveDataQuality(null),
  };
}

export function buildFemaleHealthOptimizerKeyFindings(result: FemaleHealthOptimizerResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'OBSERVED_ENERGY',
      labelAr: 'ملاحظة توافر الطاقة',
      labelEn: 'Entered energy observation',
      value: result.energy_availability_adequacy,
      severity: 'info',
    },
    {
      code: 'OBSERVED_FERRITIN',
      labelAr: 'ملاحظة حالة الفيريتين المدخلة',
      labelEn: 'Entered ferritin observation',
      value: result.ferritin_status,
      severity: 'info',
    },
    {
      code: 'RESULT_TYPE',
      labelAr: 'نوع النتيجة',
      labelEn: 'Result type',
      value: 'USER_PROVIDED',
      severity: 'info',
    },
  ];
  return findings;
}

export function buildFemaleHealthOptimizerOutput(rawInput: FemaleHealthOptimizerInput, options: FemaleHealthOptimizerOutputOptions): ToolOutput<FemaleHealthOptimizerResult> {
  const tool = requireTool('tool-091-female-health-optimizer');
  const result = optimizeFemaleHealth(rawInput);
  return buildToolOutput<FemaleHealthOptimizerResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildFemaleHealthOptimizerProvenance(options),
    keyFindings: buildFemaleHealthOptimizerKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
