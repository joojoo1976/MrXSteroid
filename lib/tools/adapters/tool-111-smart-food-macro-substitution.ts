/**
 * lib/tools/adapters/tool-111-smart-food-macro-substitution.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #111 — Layer 3: Persistence & AI adapter for the Smart Food & Macro
 *  Substitution Engine.
 * ═══════════════════════════════════════════════════════════════════════════
 * Wraps the pure engine's result into the canonical `ToolOutput` envelope via
 * `buildToolOutput` (identity, access tier and prev/next links come from the
 * REGISTRY — never hand-written), then hands it to the shared commit path
 * (`commitDashboardSnapshot` → `POST /api/tools/logs`).
 *
 * PURE MODULE — timestamps and timezone are INJECTED by the caller, so the
 * envelope stays deterministic and unit-testable (no `Date`, no `Intl` here).
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
  computeSubstitution,
  type EngineInput,
  type SubstitutionResult,
  type DataSource as EngineDataSource,
  EQUIVALENCE_THRESHOLDS,
  ADHERENCE_THRESHOLDS,
} from '../engines/staging/tool-111-smart-food-macro-substitution-engine';

/** Convert engine DataSource to contracts DataSource */
function convertDataSource(source: EngineDataSource): DataSource {
  switch (source) {
    case 'USDA':
    case 'brand':
    case 'manufacturer':
      return 'import';
    case 'estimated':
      return 'manual';
  }
}

/** Reference macro profile for provenance (per 100g) */
export const MACRO_REFERENCE_UNIT = 'g' as const;
export const MACRO_REFERENCE_AMOUNT = 100;

/** Build provenance for the substitution result */
export function buildTool111Provenance(options: {
  locale: Locale;
  unitSystem: UnitSystem;
  snapshotType: SnapshotType;
  calculatedAt: string;
  recordedAt: string;
  timezone?: string;
  provenanceSource?: DataSource;
  originalFoodSource: DataSource;
  substituteFoodSource: DataSource;
}): DataProvenance {
  const source: DataSource = options.provenanceSource ?? 'manual';
  const confidence = source === 'manual' ? 0.9 : 0.8;
  return {
    source,
    recordedAt: options.recordedAt,
    timezone: options.timezone ?? 'UTC',
    unit: MACRO_REFERENCE_UNIT,
    measurementMethod:
      options.provenanceSource && options.provenanceSource !== 'manual'
        ? 'ingested biometric'
        : 'simulated model estimate',
    confidence,
    dataQuality: deriveDataQuality(confidence),
    referenceRange: {
      low: 0,
      high: 100,
      unit: '%',
      source: 'TOOL_111_ENGINE_DESIGN.md — Equivalence Score (0-100)',
    },
    originalUnit: MACRO_REFERENCE_UNIT,
  };
}
/** Severity-ranked findings derived from the engine result */
export function buildTool111KeyFindings(
  result: SubstitutionResult,
  input: EngineInput,
): KeyFinding[] {
  const findings: KeyFinding[] = [];

  // 1. Equivalence Score finding
  findings.push({
    code: 'EQUIVALENCE_SCORE',
    labelAr: `درجة التكافؤ المكروي: ${result.equivalenceScore.toFixed(1)} (${result.equivalenceLevel})`,
    labelEn: `Macro equivalence score: ${result.equivalenceScore.toFixed(1)} (${result.equivalenceLevel})`,
    value: `${result.equivalenceScore.toFixed(1)}`,
    severity:
      result.equivalenceScore >= EQUIVALENCE_THRESHOLDS.excellent
        ? 'info'
        : result.equivalenceScore >= EQUIVALENCE_THRESHOLDS.good
        ? 'info'
        : result.equivalenceScore >= EQUIVALENCE_THRESHOLDS.fair
        ? 'monitor'
        : 'important',
  });

  // 2. Substitute quantity finding
  findings.push({
    code: 'SUBSTITUTE_QUANTITY',
    labelAr: `الكمية البديلة: ${result.substituteQuantity.toFixed(1)} ${result.substituteUnit}`,
    labelEn: `Substitute quantity: ${result.substituteQuantity.toFixed(1)} ${result.substituteUnit}`,
    value: `${result.substituteQuantity.toFixed(1)} ${result.substituteUnit}`,
    severity: 'info',
  });

  // 3. Macro deltas finding
  const macroDeltas = result.macroDeltas;
  findings.push({
    code: 'MACRO_DELTAS',
    labelAr: `فروقات الماكروز — بروتين: ${macroDeltas.protein >= 0 ? '+' : ''}${macroDeltas.protein.toFixed(1)}g، كربوهيدرات: ${macroDeltas.carbs >= 0 ? '+' : ''}${macroDeltas.carbs.toFixed(1)}g، دهون: ${macroDeltas.fat >= 0 ? '+' : ''}${macroDeltas.fat.toFixed(1)}g، سعرات: ${macroDeltas.calories >= 0 ? '+' : ''}${macroDeltas.calories.toFixed(1)}`,
    labelEn: `Macro deltas — Protein: ${macroDeltas.protein >= 0 ? '+' : ''}${macroDeltas.protein.toFixed(1)}g, Carbs: ${macroDeltas.carbs >= 0 ? '+' : ''}${macroDeltas.carbs.toFixed(1)}g, Fat: ${macroDeltas.fat >= 0 ? '+' : ''}${macroDeltas.fat.toFixed(1)}g, Calories: ${macroDeltas.calories >= 0 ? '+' : ''}${macroDeltas.calories.toFixed(1)}`,
    value: `${macroDeltas.protein.toFixed(1)}|${macroDeltas.carbs.toFixed(1)}|${macroDeltas.fat.toFixed(1)}|${macroDeltas.calories.toFixed(1)}`,
    severity: 'info',
  });

  // 4. Target adherence finding (if provided)
  if (result.targetAdherence) {
    const overall = result.targetAdherence.overall;
    findings.push({
      code: 'TARGET_ADHERENCE',
      labelAr: `تحقيق المستهدفات: ${overall}`,
      labelEn: `Target adherence: ${overall}`,
      value: overall,
      severity:
        overall === 'on_target'
          ? 'info'
          : overall === 'slightly_off'
          ? 'monitor'
          : overall === 'moderately_off'
          ? 'important'
          : 'important',
    });
  }

  // 5. Warnings as findings (high severity warnings)
  for (const warning of result.warnings) {
    if (warning.code === 'HIGH_CALORIE_DIFF' || warning.code === 'MISSING_MACRO_DATA') {
      findings.push({
        code: `WARNING_${warning.code}`,
        labelAr: `تحذير: ${warning.message}`,
        labelEn: `Warning: ${warning.message}`,
        value: warning.code,
        severity: 'important',
      });
    }
  }

  // 6. Limitations as findings
  for (const limitation of result.limitations) {
    findings.push({
      code: `LIMITATION_${limitation.code}`,
      labelAr: `قيود: ${limitation.message}`,
      labelEn: `Limitation: ${limitation.message}`,
      value: limitation.code,
      severity: 'info',
    });
  }

  // 7. Data quality finding (if low)
  if (input.originalFood.dataQuality === 'low' || input.substituteFood.dataQuality === 'low') {
    findings.push({
      code: 'DATA_QUALITY_LOW',
      labelAr: 'جودة بيانات منخفضة — قد تؤثر دقة التكافؤ',
      labelEn: 'Low data quality — equivalence accuracy may be affected',
      value: 'low',
      severity: 'monitor',
    });
  }

  return findings;
}
/**
 * Runs the engine and wraps the result in the canonical envelope.
 * Throws `ToolRegistryError`/`ToolContractError` on structural violations so an
 * invalid snapshot can never reach the API.
 */
export function buildTool111Output(
  rawInput: EngineInput,
  options: {
    locale: Locale;
    unitSystem: UnitSystem;
    snapshotType: SnapshotType;
    calculatedAt: string;
    recordedAt: string;
    timezone?: string;
    provenanceSource?: DataSource;
  },
): ToolOutput<SubstitutionResult> {
  const tool = requireTool('smart-food-macro-substitution');
  const result = computeSubstitution(rawInput);

  return buildToolOutput<SubstitutionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: options.calculatedAt,
    locale: options.locale,
    unitSystem: options.unitSystem,
    snapshotType: options.snapshotType,
    accessTier: tool.accessTier,
    result,
    provenance: buildTool111Provenance({
      locale: options.locale,
      unitSystem: options.unitSystem,
      snapshotType: options.snapshotType,
      calculatedAt: options.calculatedAt,
      recordedAt: options.recordedAt,
      timezone: options.timezone,
      provenanceSource: options.provenanceSource,
      originalFoodSource: convertDataSource(rawInput.originalFood.dataSource),
      substituteFoodSource: convertDataSource(rawInput.substituteFood.dataSource),
    }),
    keyFindings: buildTool111KeyFindings(result, rawInput),
    seoLinks: buildSeoLinks(tool),
  });
}

/** Adapter pipeline using the shared adapter-contract pattern */
import { createToolAdapter } from '@/lib/shared/adapter-contract';
import { ToolSchema } from '@/lib/shared/schema-contract';
import { Tool111InputSchema, tryParseTool111Input, parseTool111Input } from '../schemas/tool-111-smart-food-macro-substitution';

// Create the schema object compatible with adapter-contract
const tool111Schema: ToolSchema<EngineInput> = {
  schema: Tool111InputSchema,
  parse: parseTool111Input,
  tryParse: tryParseTool111Input,
};

// Transform user input to engine input (mostly identity with defaults)
function transformInput(input: EngineInput): EngineInput {
  return {
    ...input,
    unitSystem: input.unitSystem ?? 'metric',
    locale: input.locale ?? 'en',
  };
}

// Build standardized ToolOutput from engine result
function buildOutput(engineResult: SubstitutionResult, input: EngineInput): ToolOutput<SubstitutionResult> {
  const tool = requireTool('smart-food-macro-substitution');
  return buildToolOutput<SubstitutionResult>({
    toolId: tool.toolId,
    toolSlug: tool.slug,
    calculatedAt: new Date().toISOString(),
    locale: input.locale ?? 'en',
    unitSystem: input.unitSystem ?? 'metric',
    snapshotType: 'draft',
    accessTier: tool.accessTier,
    result: engineResult,
    provenance: buildTool111Provenance({
      locale: input.locale ?? 'en',
      unitSystem: input.unitSystem ?? 'metric',
      snapshotType: 'draft',
      calculatedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      originalFoodSource: convertDataSource(input.originalFood.dataSource),
      substituteFoodSource: convertDataSource(input.substituteFood.dataSource),
    }),
    keyFindings: buildTool111KeyFindings(engineResult, input),
    seoLinks: buildSeoLinks(tool),
  });
}

// Export the adapter instance using the shared contract
export const tool111Adapter = createToolAdapter<EngineInput, SubstitutionResult, EngineInput, SubstitutionResult>({
  toolSlug: 'smart-food-macro-substitution',
  engineFn: computeSubstitution,
  schema: tool111Schema,
  transformInput,
  buildOutput,
});