/**
 * Tool #044 — DHT Side Effect Predictor
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
  predictDhtEffects,
  type DhtInput,
  type DhtResult,
} from '../engines/tool-044-dht-side-effects';

export interface DhtOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildDhtProvenance(options: DhtOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.82 : 0.72;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'ng/dL',
    measurementMethod: 'anchored DHT-load weights (documented heuristic, clamped 0-1)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 30, high: 85, unit: 'ng/dL', source: 'adult male DHT reference; risk anchor 50 ng/dL' },
  };
}

export function buildDhtKeyFindings(result: DhtResult): KeyFinding[] {
  return [
    {
      code: 'DHT_BURDEN',
      labelAr: 'العبء الكلي لقناه DHT',
      labelEn: 'Overall DHT burden',
      value: `${result.overall_burden_pct}%`,
      severity: result.band === 'high' ? 'important' : result.band === 'moderate' ? 'monitor' : 'info',
    },
    { code: 'HAIR_RISK', labelAr: 'خطر تساقط الشعر', labelEn: 'Hair-loss risk', value: `${result.hair_loss_risk_pct}%`, severity: result.hair_loss_risk_pct > 50 ? 'monitor' : 'info' },
    { code: 'PROSTATE_RISK', labelAr: 'خطر أعراض البروستاتا', labelEn: 'Prostate symptom risk', value: `${result.prostate_symptom_risk_pct}%`, severity: result.prostate_symptom_risk_pct > 50 ? 'monitor' : 'info' },
    ...result.mitigations.map((m): KeyFinding => ({ code: 'MITIGATION', labelAr: 'إجراء وقائي', labelEn: 'Mitigation', value: m, severity: 'monitor' })),
  ];
}

export function buildDhtOutput(rawInput: DhtInput, options: DhtOutputOptions): ToolOutput<DhtResult> {
  const tool = requireTool('tool-044-dht-side-effects');
  const result = predictDhtEffects(rawInput);
  return buildToolOutput<DhtResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildDhtProvenance(options),
    keyFindings: buildDhtKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
