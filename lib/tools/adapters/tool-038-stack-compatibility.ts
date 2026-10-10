/**
 * Tool #038 — Stack Compatibility Checker
 * Layer 3: persistence + canonical ToolOutput envelope.
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
  checkStackCompatibility,
  type StackCompatibilityInput,
  type StackCompatibilityResult,
} from '../engines/tool-038-stack-compatibility';

export interface StackCompatibilityOutputOptions {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
}

export function buildStackCompatibilityProvenance(options: StackCompatibilityOutputOptions): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.9 : 0.75;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: 'score / 100',
    measurementMethod: 'pairwise interaction model + total androgen burden (pure engine)',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: { low: 0, high: 100, unit: 'score', source: 'engineering heuristic; verify with clinical history' },
  };
}

export function buildStackCompatibilityKeyFindings(result: StackCompatibilityResult): KeyFinding[] {
  const findings: KeyFinding[] = [
    { code: 'COMPATIBILITY_SCORE', labelAr: 'درجة التوافق', labelEn: 'Compatibility Score', value: `${result.score_0_100}/100`, severity: 'info' },
    { code: 'VERDICT', labelAr: 'الحكم', labelEn: 'Verdict', value: result.verdict, severity: result.verdict === 'incompatible' ? 'important' : result.verdict === 'caution' ? 'monitor' : 'info' },
  ];
  for (const f of result.flags) {
    findings.push({
      code: f.code,
      labelAr: f.message,
      labelEn: f.message,
      value: `${f.severity}`,
      severity: f.severity === 'important' ? 'important' : f.severity === 'monitor' ? 'monitor' : 'info',
    });
  }
  return findings;
}

export function buildStackCompatibilityOutput(rawInput: StackCompatibilityInput, options: StackCompatibilityOutputOptions): ToolOutput<StackCompatibilityResult> {
  const tool = requireTool('tool-038-stack-compatibility');
  const result = checkStackCompatibility(rawInput);
  return buildToolOutput<StackCompatibilityResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildStackCompatibilityProvenance(options),
    keyFindings: buildStackCompatibilityKeyFindings(result),
    seoLinks: buildSeoLinks(tool),
  });
}
