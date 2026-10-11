/**
 * Tool #062 — Prostate Health Manager
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
  assessProstateHealth,
  type ProstateHealthInput,
  type ProstateHealthResult,
} from '../engines/tool-062-prostate-health-manager';

export interface ProstateHealthOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildProstateHealthProvenance(options: ProstateHealthOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.85 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'ng/mL',
    measurementMethod: 'age-specific PSA ceiling banding with 1-year rise check (deterministic)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 2.5, unit: 'ng/mL', source: 'published age-specific PSA ceilings (educational)' },
  };
}

export function buildProstateHealthKeyFindings(result: ProstateHealthResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    {
      code: 'PSA_CEILING',
      labelAr: 'حدد العمرية المرجعية',
      labelEn: 'Age-specific ceiling',
      value: `${result.psa_ceiling} ng/mL`,
      severity: 'info',
    },
    {
      code: 'PSA_BAND',
      labelAr: 'تصنيف PSA',
      labelEn: 'PSA band',
      value: result.band,
      severity: result.band === 'age-normal' ? 'info' : 'important',
    },
  ];
  if (result.psa_delta_1y !== null) {
    findings.push({
      code: 'PSA_DELTA',
      labelAr: 'التغير السنوي',
      labelEn: '1-year rise',
      value: `+${result.psa_delta_1y} ng/mL`,
      severity: result.psa_delta_1y > 0.75 ? 'important' : 'info',
    });
  }
  for (const w of result.warnings) {
    findings.push({ code: 'WARNING', labelAr: 'تنبيه', labelEn: 'Warning', value: w, severity: 'important' });
  }
  return findings;
}

export function buildProstateHealthOutput(rawInput: ProstateHealthInput, options: ProstateHealthOutputOptions): ToolOutput<ProstateHealthResult> {
  const tool = requireTool('tool-062-prostate-health-manager');
  const result = assessProstateHealth(rawInput);
  return buildToolOutput<ProstateHealthResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildProstateHealthProvenance(options),
    keyFindings: buildProstateHealthKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
