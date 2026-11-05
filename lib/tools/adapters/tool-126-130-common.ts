import {
  type DataProvenance, type DataSource, type KeyFinding, type Locale, type SnapshotType,
  type ToolOutput, type UnitSystem,
} from '../contracts';
import { buildSeoLinks, buildToolOutput, requireTool } from '../registry';

export interface HeuristicOutputOptions {
  locale: Locale; unitSystem: UnitSystem; snapshotType: SnapshotType;
  calculatedAt: string; recordedAt: string; timezone?: string; provenanceSource?: DataSource;
}

export function heuristicProvenance(options: HeuristicOutputOptions, unit: string, measurementMethod: string): DataProvenance {
  return {
    source: options.provenanceSource ?? 'manual', recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC', unit, measurementMethod,
    confidence: null, dataQuality: 'not_assessed',
  };
}

export function registeredHeuristicOutput<T>(slug: string, result: T, findings: KeyFinding[], provenance: DataProvenance, options: HeuristicOutputOptions): ToolOutput<T> {
  const tool = requireTool(slug);
  return buildToolOutput<T>({
    toolId: tool.toolId, toolSlug: tool.slug, calculatedAt: options.calculatedAt,
    locale: options.locale, unitSystem: options.unitSystem, snapshotType: options.snapshotType,
    accessTier: tool.accessTier, result, provenance, keyFindings: findings, seoLinks: buildSeoLinks(tool),
  });
}

export function scopeFinding(notice: string): KeyFinding {
  return { code: 'SCOPE_NOTICE', labelAr: 'حدود الأداة', labelEn: 'Tool scope', value: notice, severity: 'important' };
}
