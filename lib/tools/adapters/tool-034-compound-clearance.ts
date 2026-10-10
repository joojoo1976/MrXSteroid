/**
 * Tool #034 — Compound Clearance Calculator (Layer 3: persistence + AI adapter).
 * Pure wrapper: engine math + canonical `ToolOutput` envelope. No I/O here.
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
  const confidence = source === 'manual' ? 0.9 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'days',
    measurementMethod: 'exponential decay C(t) = C0 * 0.5^(t/half-life)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
  };
}

export function buildClearanceKeyFindings(result: ClearanceResult): KeyFinding[] {
  return [
    {
      code: 'CLEARANCE_DATE',
      labelAr: 'تاريخ التصفية',
      labelEn: 'Clearance Date',
      value: result.clearance_date,
      severity: result.already_clear ? 'info' : 'monitor',
    },
    {
      code: 'CURRENT_RESIDUAL',
      labelAr: 'المتبقي الحالي',
      labelEn: 'Current Residual',
      value: `${result.current_remaining_percent}%`,
      severity: result.already_clear ? 'info' : 'monitor',
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
