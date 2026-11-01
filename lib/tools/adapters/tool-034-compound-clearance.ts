/**
 * Tool #034 — Compound Clearance Calculator (Layer 3: persistence + AI adapter).
 * Pure wrapper: engine math + canonical `ToolOutput` envelope. No I/O here.
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
import {
  calculateCompoundClearance,
  type ClearanceInput,
  type ClearanceResult,
} from '../engines/tool-034-compound-clearance';

export interface ClearanceOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildClearanceProvenance(options: ClearanceOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'days',
    measurementMethod: 'hypothetical single-exponential fraction arithmetic from a user-entered half-life; source and model fit are not verified',
    confidence: null,
    dataQuality: 'not_assessed',
  };
}

export function buildClearanceKeyFindings(result: ClearanceResult): KeyFinding[] {
  return [
    {
      code: 'MODEL_THRESHOLD_DATE',
      labelAr: 'تاريخ بلوغ حد النموذج',
      labelEn: 'Model Threshold Date',
      value: result.threshold_date,
      severity: 'info',
    },
    {
      code: 'MODELED_RESIDUAL_PERCENT',
      labelAr: 'النسبة المتبقية وفق النموذج',
      labelEn: 'Modeled Residual Fraction',
      value: `${result.modeled_remaining_percent}%`,
      severity: 'info',
    },
  ];
}

export function buildClearanceOutput(
  rawInput: ClearanceInput,
  options: ClearanceOutputOptions,
): ToolOutput<ClearanceResult> {
  const tool = requireTool('tool-034-compound-clearance');
  const result = calculateCompoundClearance(rawInput);
  return buildToolOutput<ClearanceResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildClearanceProvenance(options),
    keyFindings: buildClearanceKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
