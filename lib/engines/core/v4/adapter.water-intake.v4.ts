/**
 * lib/engines/core/v4/adapter.water-intake.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  R5 First Batch — Tool 3: mrx.tool.water-intake — read-only V6 → V4 adapter
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Wraps the unchanged engine output in a V4 envelope. It never recalculates,
 *  never touches the engine, and never alters its inputs. The engine remains
 *  the sole numeric authority. Pure module: no React, DOM, clock, storage
 *  or network.
 */

import type {
  InputSnapshot,
  ToolResultEnvelopeV4,
  InputCompleteness,
  FieldState,
  Provenance,
  UncertaintyRecord,
  SafetyWarningV4,
  EvidenceReference,
  AssumptionRecord,
} from './contracts.v4';
import { adaptV6ToV4Envelope } from './runtime.v4';
import { WATER_INTAKE_SPEC_RECORD } from './profiles/water-intake-evidence-record.v4';
import type { WaterIntakeInput, WaterIntakeOutput } from '@/lib/tools/engines/water-intake.v6';

const ENGINE_VERSION = '6.0.0';
const UNITS: Record<string, string> = { water: 'L', weight: 'kg' };
const REQUIRED_FIELDS = ['weightKg', 'activityLevel'] as const;
type RequiredField = (typeof REQUIRED_FIELDS)[number];

const NOT_ASSESSED_VALIDITY = { status: 'NOT_ASSESSED' as const, invalidationTriggers: [] };
const CURRENT_VALIDITY = {
  status: 'CURRENT' as const,
  invalidationTriggers: ['input_changed', 'engine_version_changed'],
};
const INVALIDATED_VALIDITY = {
  status: 'INVALIDATED' as const,
  invalidationTriggers: ['input_invalid'],
};

function buildFieldStates(
  input: Partial<WaterIntakeInput>,
  providedState: FieldState = 'VALID'
): Record<RequiredField, FieldState> {
  return Object.fromEntries(
    REQUIRED_FIELDS.map((field) => [
      field,
      input[field] === undefined ? 'MISSING' : providedState,
    ])
  ) as Record<RequiredField, FieldState>;
}

function buildProvenance(input: Partial<WaterIntakeInput>): Record<string, Provenance> {
  return Object.fromEntries(
    REQUIRED_FIELDS.filter((field) => input[field] !== undefined).map(
      (field) => [field, 'USER_ENTERED' as Provenance]
    )
  );
}

function snapshot<TInput extends Partial<WaterIntakeInput>>(
  input: TInput,
  completeness: InputCompleteness,
  createdAt: string,
  providedState: FieldState = 'VALID'
): InputSnapshot<TInput> {
  return {
    values: input,
    fieldStates: buildFieldStates(input, providedState) as Record<string, FieldState>,
    provenance: buildProvenance(input),
    completeness,
    recordedAt: createdAt,
    version: '4.0.0',
  };
}

function evidenceRecord(): EvidenceReference {
  return {
    evidenceId: WATER_INTAKE_SPEC_RECORD.evidenceId,
    sourceType: WATER_INTAKE_SPEC_RECORD.sourceType,
    title: WATER_INTAKE_SPEC_RECORD.title,
    applicability: WATER_INTAKE_SPEC_RECORD.applicability,
    limitations: [...WATER_INTAKE_SPEC_RECORD.limitations],
    version: WATER_INTAKE_SPEC_RECORD.version,
  };
}

const ASSUMPTIONS: AssumptionRecord[] = [
  {
    assumptionId: 'water-intake-assumption-heuristic',
    description:
      'Baseline 35 mL per kg, adjusted by a coarse user-selected activity factor (1 + (activity − 1) × 0.1).',
    type: 'domain',
    impact: 'Application-designed convention; it is not a clinical target.',
    version: '6.0.0',
  },
];

const VALID_UNCERTAINTY: UncertaintyRecord = {
  level: 'NOT_ASSESSED',
  basis: ['No calibrated confidence model is defined for the deterministic water-intake engine.'],
  affectedOutputs: ['dailyWaterLiters'],
  whatWouldReduceIt: ['Direct professional assessment of hydration needs would provide context this heuristic cannot.'],
  limitations: [
    'Heuristic estimate; it does not account for climate, diet, conditions, pregnancy or activity intensity.',
    'Water from food and other beverages is not counted.',
  ],
};

const UNAVAILABLE_UNCERTAINTY = (missing: readonly string[]): UncertaintyRecord => ({
  level: 'INSUFFICIENT_EVIDENCE',
  basis: [`Missing required fields: ${missing.join(', ')}`],
  affectedOutputs: ['dailyWaterLiters'],
  whatWouldReduceIt: ['Provide your weight and your activity level.'],
  limitations: ['Cannot calculate without required inputs.'],
});

const INVALID_UNCERTAINTY = (errorMessage: string): UncertaintyRecord => ({
  level: 'NOT_ASSESSED',
  basis: [errorMessage],
  affectedOutputs: ['dailyWaterLiters'],
  whatWouldReduceIt: ['Correct the invalid input and recalculate.'],
  limitations: ['The engine rejected the supplied input; no estimate was produced.'],
});

function deterministicWarning(): SafetyWarningV4 {
  return {
    warningId: 'water-intake-general-estimate',
    level: 'info',
    code: 'NOT_MEDICAL_ADVICE',
    message: 'This is a deterministic starting estimate, not medical advice or a prescription.',
    trigger: 'always',
    severity: 'low',
    reason: 'The engine applies an application-designed heuristic; it is not medical or clinical guidance.',
  };
}

function unavailableWarning(missingFields: readonly string[]): SafetyWarningV4 {
  return {
    warningId: 'water-intake-missing-inputs',
    level: 'info',
    code: 'MISSING_INPUTS',
    message: `Missing required fields: ${missingFields.join(', ')}`,
    trigger: 'missing_inputs',
    severity: 'low',
    reason: 'Required inputs have not been provided; no estimate was calculated.',
  };
}

/**
 * Wrap a complete, valid water-intake output as a V4 envelope.
 * The result object is passed through unchanged.
 */
export function adaptWaterIntakeV6ToV4(
  input: WaterIntakeInput,
  output: WaterIntakeOutput,
  createdAt: string,
): ToolResultEnvelopeV4<WaterIntakeInput, WaterIntakeOutput> {
  return adaptV6ToV4Envelope<WaterIntakeInput, WaterIntakeOutput>(
    'mrx.tool.water-intake',
    'water-intake',
    ENGINE_VERSION,
    'VALID',
    snapshot(input, 'SUFFICIENT_FOR_BASIC_RESULT', createdAt),
    output,
    'CALCULATED',
    [
      {
        source: 'user_input',
        recordedAt: createdAt,
        timezone: 'UTC',
        unit: 'mixed',
        confidence: null,
        dataQuality: 'not_assessed',
      },
    ],
    UNITS,
    ASSUMPTIONS,
    [evidenceRecord()],
    VALID_UNCERTAINTY,
    [deterministicWarning()],
    CURRENT_VALIDITY,
    'PERSONAL',
    createdAt
  );
}

/**
 * Wrap an EMPTY or PARTIAL attempt as a V4 envelope.
 * EMPTY → NOT_AVAILABLE / INSUFFICIENT_FOR_SAFE_RESULT.
 * PARTIAL → NOT_AVAILABLE / INCOMPLETE.
 */
export function adaptWaterIntakeV6UnavailableToV4(
  input: Partial<WaterIntakeInput>,
  completeness: 'empty' | 'partial',
  missingFields: readonly string[],
  createdAt: string
): ToolResultEnvelopeV4<Partial<WaterIntakeInput>, null> {
  const completenessValue: InputCompleteness =
    completeness === 'empty' ? 'INSUFFICIENT_FOR_SAFE_RESULT' : 'INCOMPLETE';

  return adaptV6ToV4Envelope<Partial<WaterIntakeInput>, null>(
    'mrx.tool.water-intake',
    'water-intake',
    ENGINE_VERSION,
    'NOT_AVAILABLE',
    snapshot(input, completenessValue, createdAt),
    null,
    'NOT_AVAILABLE',
    [],
    { weight: 'kg', water: 'L' },
    [],
    [],
    UNAVAILABLE_UNCERTAINTY(missingFields),
    [unavailableWarning(missingFields)],
    NOT_ASSESSED_VALIDITY,
    'PERSONAL',
    createdAt
  );
}

/**
 * Wrap a rejected attempt as a V4 envelope.
 * INVALID → NOT_AVAILABLE / INCOMPLETE. No numeric estimate is produced.
 */
export function adaptWaterIntakeV6InvalidToV4(
  input: Partial<WaterIntakeInput>,
  errorMessage: string,
  createdAt: string
): ToolResultEnvelopeV4<Partial<WaterIntakeInput>, null> {
  return adaptV6ToV4Envelope<Partial<WaterIntakeInput>, null>(
    'mrx.tool.water-intake',
    'water-intake',
    ENGINE_VERSION,
    'INVALID',
    snapshot(input, 'INCOMPLETE', createdAt, 'INVALID'),
    null,
    'NOT_AVAILABLE',
    [],
    { weight: 'kg', water: 'L' },
    [],
    [],
    INVALID_UNCERTAINTY(errorMessage),
    [
      {
        warningId: 'water-intake-invalid-input',
        level: 'warning',
        code: 'INVALID_INPUT',
        message: errorMessage,
        trigger: 'validation_failure',
        severity: 'high',
        reason: 'The engine rejected the supplied input; no estimate was produced.',
      },
    ],
    INVALIDATED_VALIDITY,
    'PERSONAL',
    createdAt
  );
}
