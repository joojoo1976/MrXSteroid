/**
 * Tool #046 — TRT Lifetime Calculator
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
  projectTrtLifetime,
  type TrtLifetimeInput,
  type TrtLifetimeResult,
} from '../engines/tool-046-trt-lifetime';

export interface TrtLifetimeOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildTrtLifetimeProvenance(options: TrtLifetimeOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.9 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'USD',
    measurementMethod: 'documented monitoring-cadence + fixed-cost projection horizons (educational heuristic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 12000, unit: 'USD/yr', source: 'typical TRT cost bands (documented heuristic)' },
  };
}

export function buildTrtLifetimeKeyFindings(result: TrtLifetimeResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'COST_10Y',
      labelAr: 'تكلفة 10 سنوات',
      labelEn: '10-year cost',
      value: `$${result.cost_projection.horizon10.total_cost_usd.toLocaleString('en-US')}`,
      severity: 'info',
    },
    {
      code: 'ANNUAL_PANELS',
      labelAr: 'لوحات التحاليل السنوية',
      labelEn: 'Annual bloodwork panels',
      value: result.annual_bloodwork_panels,
      severity: result.annual_bloodwork_panels >= 3 ? 'monitor' : 'info',
    },
  ];
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildTrtLifetimeOutput(rawInput: TrtLifetimeInput, options: TrtLifetimeOutputOptions): ToolOutput<TrtLifetimeResult> {
  const tool = requireTool('tool-046-trt-lifetime');
  const result = projectTrtLifetime(rawInput);
  return buildToolOutput<TrtLifetimeResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildTrtLifetimeProvenance(options),
    keyFindings: buildTrtLifetimeKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
