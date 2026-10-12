/**
 * Tool #105 - AI Health Data Fusion Hub & Timeline
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
  fuseHealthData,
  type HealthFusionInput,
  type HealthFusionResult,
} from '../engines/tool-105-ai-health-data-fusion-hub';

export interface HealthFusionOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildHealthFusionProvenance(options: HealthFusionOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = 0.7;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'event',
    measurementMethod: 'deterministic local timeline fusion + trend detection (user-supplied events only)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
  };
}

export function buildHealthFusionKeyFindings(result: HealthFusionResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'EVENT_COUNT',
      labelAr: 'عدد الأحداث المدمجة',
      labelEn: 'Fused event count',
      value: String(result.event_count),
      severity: 'info',
    },
    {
      code: 'PERSISTENCE',
      labelAr: 'وضع الحفظ',
      labelEn: 'Persistence mode',
      value: result.persistence_mode,
      severity: 'info',
    },
  ];
  for (const t of result.trends) {
    if (t.direction !== 'insufficient-data') {
      findings.push({
        code: 'TREND',
        labelAr: `اتجاه: ${t.code}`,
        labelEn: `Trend: ${t.code}`,
        value: `${t.direction} (${t.change_percent ?? 'n/a'}%, ${t.data_point_count} pts)`,
        severity: 'info',
      });
    }
  }
  findings.push({
    code: 'PRIVACY_NOTICE',
    labelAr: 'حدود الخصوصية',
    labelEn: 'Privacy boundary',
    value: result.privacy_notice,
    severity: 'important',
  });
  return findings;
}

export function buildHealthFusionOutput(
  rawInput: HealthFusionInput,
  options: HealthFusionOutputOptions,
): ToolOutput<HealthFusionResult> {
  const tool = requireTool('tool-105-ai-health-data-fusion-hub');
  const result = fuseHealthData(rawInput);
  return buildToolOutput<HealthFusionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildHealthFusionProvenance(options),
    keyFindings: buildHealthFusionKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
