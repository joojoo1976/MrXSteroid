/**
 * lib/engines/core/v4/adapter.bmi.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  R5 First Batch — Tool 1: mrx.tool.bmi — read-only V6 → V4 adapter
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Wraps the unchanged BMI engine output in a V4 envelope. It never
 *  recalculates, never touches the engine, and never modifies its inputs.
 *  The engine (`lib/tools/engines/bmi.v6.ts`) remains the sole numeric
 *  authority. This adapter is pure: no React, DOM, clock, storage or network.
 */

import type {
  AssumptionRecord,
  InputSnapshot,
  ToolResultEnvelopeV4,
  InputCompleteness,
  FieldState,
  Provenance,
  UncertaintyRecord,
  SafetyWarningV4,
  EvidenceReference,
} from './contracts.v4';
import { adaptV6ToV4Envelope } from './runtime.v4';
import { BMI_DOCUMENTATION_RECORD } from './profiles/bmi-evidence-record.v4';
import type { BmiInput, BmiOutput } from '@/lib/tools/engines/bmi.v6';

const ENGINE_VERSION = '6.0.0';
const UNITS: Record<string, string> = { weight: 'kg', height: 'cm' };
const REQUIRED_FIELDS = ['weightKg', 'heightCm'] as const;
type RequiredField = (typeof REQUIRED_FIELDS)[number];

export type BmiV4State = 'EMPTY' | 'PARTIAL' | 'FULL_VALID' | 'FULL_INVALID';

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
  input: Partial<BmiInput>,
  providedState: FieldState = 'VALID'
): Record<RequiredField, FieldState> {
  return Object.fromEntries(
    REQUIRED_FIELDS.map((field) => [
      field,
      input[field] === undefined ? 'MISSING' : providedState,
    ])
  ) as Record<RequiredField, FieldState>;
}

function buildProvenance(input: Partial<BmiInput>): Record<string, Provenance> {
  return Object.fromEntries(
    REQUIRED_FIELDS.filter((field) => input[field] !== undefined).map(
      (field) => [field, 'USER_ENTERED' as Provenance]
    )
  );
}

function snapshot<TInput extends Partial<BmiInput>>(
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

function bmiEvidenceRecord(): EvidenceReference {
  return {
    evidenceId: BMI_DOCUMENTATION_RECORD.evidenceId,
    sourceType: BMI_DOCUMENTATION_RECORD.sourceType,
    title: BMI_DOCUMENTATION_RECORD.title,
    url: BMI_DOCUMENTATION_RECORD.url,
    publishedAt: BMI_DOCUMENTATION_RECORD.publishedAt,
    applicability: BMI_DOCUMENTATION_RECORD.applicability,
    limitations: [...BMI_DOCUMENTATION_RECORD.limitations],
    version: BMI_DOCUMENTATION_RECORD.version,
  };
}

const ASSUMPTIONS: AssumptionRecord[] = [
  {
    assumptionId: 'bmi-assumption-formula',
    description: 'BMI = weightKg / (heightCm / 100)^2, rounded to one decimal.',
    type: 'formula',
    impact: 'The result depends on the recorded formula; it is not a measurement.',
    version: '6.0.0',
  },
  {
    assumptionId: 'bmi-assumption-categories',
    description: 'Category cut-offs are the adult screening boundaries: 18.5, 25, 30.',
    type: 'domain',
    impact: 'The category describes weight status only; it is not a diagnosis.',
    version: '6.0.0',
  },
];

const VALID_UNCERTAINTY: UncertaintyRecord = {
  level: 'NOT_ASSESSED',
  basis: ['No calibrated confidence model is defined for the deterministic BMI engine.'],
  affectedOutputs: ['bmi', 'category'],
  whatWouldReduceIt: [
    'Direct body-composition measurement would provide context BMI cannot.',
  ],
  limitations: [
    'BMI is a screening measure; it does not distinguish fat from muscle.',
    'BMI does not account for age, sex, body composition or clinical conditions.',
  ],
};

const UNAVAILABLE_UNCERTAINTY = (missing: readonly string[]): UncertaintyRecord => ({
  level: 'INSUFFICIENT_EVIDENCE',
  basis: [`Missing required fields: ${missing.join(', ')}`],
  affectedOutputs: ['bmi', 'category'],
  whatWouldReduceIt: ['Provide a positive weight in kilograms and a height in centimetres.'],
  limitations: ['Cannot calculate without required inputs.'],
});

const INVALID_UNCERTAINTY = (errorMessage: string): UncertaintyRecord => ({
  level: 'NOT_ASSESSED',
  basis: [errorMessage],
  affectedOutputs: ['bmi', 'category'],
  whatWouldReduceIt: ['Correct the invalid input and recalculate.'],
  limitations: ['The engine rejected the supplied input; no result was produced.'],
});

function deterministicWarning(): SafetyWarningV4 {
  return {
    warningId: 'bmi-deterministic-calculation',
    level: 'info',
    code: 'NOT_A_DIAGNOSIS',
    message: 'This is a deterministic screening estimate, not a diagnosis or a measurement.',
    trigger: 'always',
    severity: 'low',
    reason: 'The engine applies a documented formula and category cut-offs; it does not measure body composition.',
  };
}

function unavailableWarning(missingFields: readonly string[]): SafetyWarningV4 {
  return {
    warningId: 'bmi-missing-inputs',
    level: 'info',
    code: 'MISSING_INPUTS',
    message: `Missing required fields: ${missingFields.join(', ')}`,
    trigger: 'missing_inputs',
    severity: 'low',
    reason: 'Required inputs have not been provided; no result was calculated.',
  };
}

/**
 * Wrap a complete, valid BMI engine output as a V4 envelope.
 * The result object is passed through unchanged.
 */
export function adaptBmiV6ToV4(
  input: BmiInput,
  output: BmiOutput,
  createdAt: string,
): ToolResultEnvelopeV4<BmiInput, BmiOutput> {
  return adaptV6ToV4Envelope<BmiInput, BmiOutput>(
    'mrx.tool.bmi',
    'bmi',
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
    [bmiEvidenceRecord()],
    VALID_UNCERTAINTY,
    [deterministicWarning()],
    CURRENT_VALIDITY,
    'PERSONAL',
    createdAt
  );
}

/**
 * Wrap an EMPTY or PARTIAL BMI attempt as a V4 envelope.
 * EMPTY → NOT_AVAILABLE / INSUFFICIENT_FOR_SAFE_RESULT.
 * PARTIAL → NOT_AVAILABLE / INCOMPLETE.
 */
export function adaptBmiV6UnavailableToV4(
  input: Partial<BmiInput>,
  completeness: 'empty' | 'partial',
  missingFields: readonly string[],
  createdAt: string
): ToolResultEnvelopeV4<Partial<BmiInput>, null> {
  const completenessValue: InputCompleteness =
    completeness === 'empty' ? 'INSUFFICIENT_FOR_SAFE_RESULT' : 'INCOMPLETE';

  return adaptV6ToV4Envelope<Partial<BmiInput>, null>(
    'mrx.tool.bmi',
    'bmi',
    ENGINE_VERSION,
    'NOT_AVAILABLE',
    snapshot(input, completenessValue, createdAt),
    null,
    'NOT_AVAILABLE',
    [],
    { weight: 'kg', height: 'cm' },
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
 * Wrap a rejected BMI attempt as a V4 envelope.
 * INVALID → NOT_AVAILABLE / INCOMPLETE. No numeric result is produced.
 */
export function adaptBmiV6InvalidToV4(
  input: Partial<BmiInput>,
  errorMessage: string,
  createdAt: string
): ToolResultEnvelopeV4<Partial<BmiInput>, null> {
  return adaptV6ToV4Envelope<Partial<BmiInput>, null>(
    'mrx.tool.bmi',
    'bmi',
    ENGINE_VERSION,
    'INVALID',
    snapshot(input, 'INCOMPLETE', createdAt, 'INVALID'),
    null,
    'NOT_AVAILABLE',
    [],
    { weight: 'kg', height: 'cm' },
    [],
    [],
    INVALID_UNCERTAINTY(errorMessage),
    [
      {
        warningId: 'bmi-invalid-input',
        level: 'warning',
        code: 'INVALID_INPUT',
        message: errorMessage,
        trigger: 'validation_failure',
        severity: 'high',
        reason: 'The engine rejected the supplied input; no result was produced.',
      },
    ],
    INVALIDATED_VALIDITY,
    'PERSONAL',
    createdAt
  );
}
