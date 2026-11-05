/**
 * lib/engines/core/v4/runtime.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  V4.0 — Runtime Validation Foundation
 * ════════════════════════════════════════════════════════════════════════════════
 *  Runtime validators for V4.0 contracts. These are DETERMINISTIC, PURE functions
 *  with no React, DOM, Supabase, network, IO, or clock dependencies.
 *
 *  Implements:
 *  - Input validation: FieldDefinition, FieldState, InputSnapshot, InputCompleteness
 *  - Output validation: ToolResultEnvelopeV4, ResultType, EvidenceReference,
 *    ProvenanceRecord, UncertaintyRecord, ResultValidity, SafetyWarningV4
 *  - Backward-compatible adapter: wraps existing V6 validators
 *
 *  Version: 4.0.0
 *  Contract Version: 4.0
 */

import type {
  FieldDefinition,
  FieldState,
  InputSnapshot,
  InputCompleteness,
  ToolResultEnvelopeV4,
  ResultStatus,
  ResultType,
  UncertaintyRecord,
  UncertaintyLevel,
  ProvenanceRecord,
  AssumptionRecord,
  EvidenceReference,
  ResultValidity,
  SafetyWarningV4,
  CrossFieldRule,
  DataClassification,
} from './contracts.v4';

// ============================================================
// §1. Runtime Validation Result Types
// ============================================================

export interface ValidationResultV4 {
  valid: boolean;
  errors: ValidationErrorV4[];
  warnings: ValidationWarningV4[];
}

export interface ValidationErrorV4 {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarningV4 {
  field: string;
  code: string;
  message: string;
}

// ============================================================
// §2. Input Validation Runtime
// ============================================================

const VALID_FIELD_STATES: FieldState[] = ['MISSING', 'INVALID', 'VALID', 'ESTIMATED', 'NOT_REQUIRED'];
const VALID_PROVENANCES = ['USER_ENTERED', 'IMPORTED', 'CROSS_TOOL', 'ESTIMATED', 'SYSTEM_DERIVED'] as const;
const VALID_DATA_TYPES = ['number', 'integer', 'string', 'enum', 'boolean', 'date', 'object', 'file_ref'] as const;
const VALID_SENSITIVITY_CLASSES = ['public', 'internal', 'personal', 'sensitive', 'highly_sensitive'] as const;
const VALID_DATA_CLASSIFICATIONS = ['PUBLIC', 'INTERNAL', 'PERSONAL', 'SENSITIVE', 'HIGHLY_SENSITIVE'] as const;

/**
 * Validate a single FieldDefinition at runtime.
 * Checks that all required properties are present and valid.
 */
export function validateFieldDefinition(field: unknown): ValidationResultV4 {
  const errors: ValidationErrorV4[] = [];
  const warnings: ValidationWarningV4[] = [];

  if (!field || typeof field !== 'object') {
    errors.push({ field: 'root', code: 'INVALID_TYPE', message: 'Field must be an object', severity: 'critical' });
    return { valid: false, errors, warnings };
  }

  const f = field as Record<string, unknown>;

  // Required properties
  if (typeof f.fieldId !== 'string' || f.fieldId.trim().length === 0) {
    errors.push({ field: 'fieldId', code: 'REQUIRED', message: 'fieldId is required and must be a non-empty string', severity: 'error' });
  }
  if (typeof f.labelKey !== 'string' || f.labelKey.trim().length === 0) {
    errors.push({ field: 'labelKey', code: 'REQUIRED', message: 'labelKey is required and must be a non-empty string', severity: 'error' });
  }
  if (!VALID_DATA_TYPES.includes(f.dataType as typeof VALID_DATA_TYPES[number])) {
    errors.push({ field: 'dataType', code: 'INVALID_TYPE', message: `dataType must be one of: ${VALID_DATA_TYPES.join(', ')}`, severity: 'error' });
  }
  if (typeof f.required !== 'boolean') {
    errors.push({ field: 'required', code: 'INVALID_TYPE', message: 'required must be a boolean', severity: 'error' });
  }
  if (!VALID_FIELD_STATES.includes(f.fieldState as FieldState)) {
    errors.push({ field: 'fieldState', code: 'INVALID_TYPE', message: `fieldState must be one of: ${VALID_FIELD_STATES.join(', ')}`, severity: 'error' });
  }
  if (!VALID_SENSITIVITY_CLASSES.includes(f.sensitivityClass as typeof VALID_SENSITIVITY_CLASSES[number])) {
    errors.push({ field: 'sensitivityClass', code: 'INVALID_TYPE', message: `sensitivityClass must be one of: ${VALID_SENSITIVITY_CLASSES.join(', ')}`, severity: 'error' });
  }
  if (!VALID_PROVENANCES.includes(f.provenance as typeof VALID_PROVENANCES[number])) {
    errors.push({ field: 'provenance', code: 'INVALID_TYPE', message: `provenance must be one of: ${VALID_PROVENANCES.join(', ')}`, severity: 'error' });
  }

  // Optional constraints validation
  if (f.constraints !== undefined && f.constraints !== null) {
    const c = f.constraints as Record<string, unknown>;
    if (c.min !== undefined && typeof c.min !== 'number') {
      errors.push({ field: 'constraints.min', code: 'INVALID_TYPE', message: 'min must be a number', severity: 'error' });
    }
    if (c.max !== undefined && typeof c.max !== 'number') {
      errors.push({ field: 'constraints.max', code: 'INVALID_TYPE', message: 'max must be a number', severity: 'error' });
    }
    if (c.min !== undefined && c.max !== undefined && typeof c.min === 'number' && typeof c.max === 'number' && c.min > c.max) {
      errors.push({ field: 'constraints', code: 'LOGICAL_CONTRADICTION', message: 'min cannot be greater than max', severity: 'error' });
    }
    if (c.enumValues !== undefined && !Array.isArray(c.enumValues)) {
      errors.push({ field: 'constraints.enumValues', code: 'INVALID_TYPE', message: 'enumValues must be an array', severity: 'error' });
    }
    if (c.crossFieldRules !== undefined && !Array.isArray(c.crossFieldRules)) {
      errors.push({ field: 'constraints.crossFieldRules', code: 'INVALID_TYPE', message: 'crossFieldRules must be an array', severity: 'error' });
    }
  }

  // Unit validation
  if (f.unit !== undefined && typeof f.unit !== 'string') {
    errors.push({ field: 'unit', code: 'INVALID_TYPE', message: 'unit must be a string', severity: 'error' });
  }
  if (f.acceptedUnits !== undefined && !Array.isArray(f.acceptedUnits)) {
    errors.push({ field: 'acceptedUnits', code: 'INVALID_TYPE', message: 'acceptedUnits must be an array', severity: 'error' });
  }
  if (f.canonicalUnit !== undefined && typeof f.canonicalUnit !== 'string') {
    errors.push({ field: 'canonicalUnit', code: 'INVALID_TYPE', message: 'canonicalUnit must be a string', severity: 'error' });
  }

  // Cross-field rules validation
  const constraints = f.constraints as Record<string, unknown> | undefined;
  if (constraints?.crossFieldRules && Array.isArray(constraints.crossFieldRules)) {
    for (const rule of constraints.crossFieldRules as unknown[]) {
      const r = rule as Record<string, unknown>;
      if (typeof r.ruleId !== 'string') errors.push({ field: 'crossFieldRules', code: 'INVALID_TYPE', message: 'ruleId must be a string', severity: 'error' });
      if (!Array.isArray(r.dependsOn)) errors.push({ field: 'crossFieldRules', code: 'INVALID_TYPE', message: 'dependsOn must be an array', severity: 'error' });
      if (typeof r.condition !== 'string') errors.push({ field: 'crossFieldRules', code: 'INVALID_TYPE', message: 'condition must be a string', severity: 'error' });
      if (typeof r.message !== 'string') errors.push({ field: 'crossFieldRules', code: 'INVALID_TYPE', message: 'message must be a string', severity: 'error' });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate an InputSnapshot at runtime.
 */
export function validateInputSnapshot(snapshot: unknown): ValidationResultV4 {
  const errors: ValidationErrorV4[] = [];
  const warnings: ValidationWarningV4[] = [];

  if (!snapshot || typeof snapshot !== 'object') {
    errors.push({ field: 'root', code: 'INVALID_TYPE', message: 'InputSnapshot must be an object', severity: 'critical' });
    return { valid: false, errors, warnings };
  }

  const s = snapshot as Record<string, unknown>;

  if (typeof s.values !== 'object' || s.values === null) {
    errors.push({ field: 'values', code: 'REQUIRED', message: 'values is required and must be an object', severity: 'error' });
  }
  if (typeof s.fieldStates !== 'object' || s.fieldStates === null) {
    errors.push({ field: 'fieldStates', code: 'REQUIRED', message: 'fieldStates is required and must be an object', severity: 'error' });
  }
  if (typeof s.provenance !== 'object' || s.provenance === null) {
    errors.push({ field: 'provenance', code: 'REQUIRED', message: 'provenance is required and must be an object', severity: 'error' });
  }
  if (!['SUFFICIENT_FOR_BASIC_RESULT', 'SUFFICIENT_WITH_LIMITATIONS', 'INCOMPLETE', 'INSUFFICIENT_FOR_SAFE_RESULT'].includes(s.completeness as string)) {
    errors.push({ field: 'completeness', code: 'INVALID_TYPE', message: 'completeness must be a valid InputCompleteness value', severity: 'error' });
  }
  if (typeof s.recordedAt !== 'string') {
    errors.push({ field: 'recordedAt', code: 'REQUIRED', message: 'recordedAt is required and must be a string', severity: 'error' });
  }
  if (typeof s.version !== 'string') {
    errors.push({ field: 'version', code: 'REQUIRED', message: 'version is required and must be a string', severity: 'error' });
  }

  // Validate fieldStates values
  if (s.fieldStates && typeof s.fieldStates === 'object') {
    for (const [key, val] of Object.entries(s.fieldStates as Record<string, unknown>)) {
      if (!VALID_FIELD_STATES.includes(val as FieldState)) {
        errors.push({ field: `fieldStates.${key}`, code: 'INVALID_TYPE', message: `Invalid field state: ${val}`, severity: 'error' });
      }
    }
  }

  // Validate provenance values
  if (s.provenance && typeof s.provenance === 'object') {
    for (const [key, val] of Object.entries(s.provenance as Record<string, unknown>)) {
      if (!VALID_PROVENANCES.includes(val as typeof VALID_PROVENANCES[number])) {
        errors.push({ field: `provenance.${key}`, code: 'INVALID_TYPE', message: `Invalid provenance: ${val}`, severity: 'error' });
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Assess input completeness at runtime.
 */
export function assessInputCompleteness(
  fields: FieldDefinition[],
  values: Record<string, unknown>
): InputCompleteness {
  const requiredFields = fields.filter(f => f.required);
  const missingRequired = requiredFields.filter(f => {
    const val = values[f.fieldId];
    return val === undefined || val === null || val === '';
  });

  if (missingRequired.length === 0) {
    // All required present — check for optional/estimated
    const hasEstimated = fields.some(f => f.fieldState === 'ESTIMATED');
    const hasInvalid = fields.some(f => f.fieldState === 'INVALID');
    if (hasInvalid) return 'INCOMPLETE';
    if (hasEstimated) return 'SUFFICIENT_WITH_LIMITATIONS';
    return 'SUFFICIENT_FOR_BASIC_RESULT';
  }

  if (missingRequired.length < requiredFields.length) {
    return 'INCOMPLETE';
  }

  // All required missing
  const hasAnyInput = Object.keys(values).length > 0;
  if (hasAnyInput) return 'INCOMPLETE';
  return 'INSUFFICIENT_FOR_SAFE_RESULT';
}

/**
 * Validate a single field value against its FieldDefinition.
 */
export function validateFieldValue(
  field: FieldDefinition,
  value: unknown
): { state: FieldState; errors: string[] } {
  const errors: string[] = [];

  if (value === undefined || value === null || value === '') {
    if (field.required) {
      return { state: 'MISSING', errors: [`${field.fieldId} is required`] };
    }
    return { state: 'NOT_REQUIRED', errors: [] };
  }

  // Type validation
  switch (field.dataType) {
    case 'number':
    case 'integer':
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        errors.push(`${field.fieldId} must be a finite number`);
      } else {
        if (field.dataType === 'integer' && !Number.isInteger(value)) {
          errors.push(`${field.fieldId} must be an integer`);
        }
        if (field.constraints?.min !== undefined && value < field.constraints.min) {
          errors.push(`${field.fieldId} must be >= ${field.constraints.min}`);
        }
        if (field.constraints?.max !== undefined && value > field.constraints.max) {
          errors.push(`${field.fieldId} must be <= ${field.constraints.max}`);
        }
        if (field.constraints?.enumValues && !field.constraints.enumValues.includes(String(value))) {
          errors.push(`${field.fieldId} must be one of: ${field.constraints.enumValues.join(', ')}`);
        }
      }
      break;
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${field.fieldId} must be a string`);
      } else if (field.constraints?.format) {
        // Basic format check (regex)
        try {
          const regex = new RegExp(field.constraints.format);
          if (!regex.test(value)) {
            errors.push(`${field.fieldId} does not match format: ${field.constraints.format}`);
          }
        } catch {
          // Invalid regex in constraints — skip
        }
      }
      break;
    case 'enum':
      if (typeof value !== 'string' || !field.constraints?.enumValues?.includes(value)) {
        errors.push(`${field.fieldId} must be one of: ${field.constraints?.enumValues?.join(', ') ?? 'none'}`);
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${field.fieldId} must be a boolean`);
      }
      break;
    case 'date':
      if (typeof value !== 'string' || isNaN(Date.parse(value))) {
        errors.push(`${field.fieldId} must be a valid date string`);
      }
      break;
    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`${field.fieldId} must be an object`);
      }
      break;
    case 'file_ref':
      if (typeof value !== 'string') {
        errors.push(`${field.fieldId} must be a file reference string`);
      }
      break;
  }

  // Cross-field rules
  if (field.constraints?.crossFieldRules) {
    for (const rule of field.constraints.crossFieldRules) {
      // Cross-field rules are evaluated by the caller with full context
      // Here we just validate the rule structure
      if (!rule.ruleId || !rule.condition || !rule.message) {
        errors.push(`${field.fieldId}: invalid cross-field rule ${rule.ruleId}`);
      }
    }
  }

  if (errors.length > 0) {
    return { state: 'INVALID', errors };
  }

  // Check if value was estimated
  if (field.fieldState === 'ESTIMATED') {
    return { state: 'ESTIMATED', errors: [] };
  }

  return { state: 'VALID', errors: [] };
}

// ============================================================
// §3. Output Validation Runtime
// ============================================================

const VALID_RESULT_STATUSES: ResultStatus[] = ['VALID', 'PARTIAL', 'INVALID', 'NOT_AVAILABLE', 'DEGRADED'];
const VALID_RESULT_TYPES: ResultType[] = ['CALCULATED', 'RULE_BASED', 'STATISTICAL_ESTIMATE', 'MODEL_PREDICTION', 'CROSS_TOOL_DERIVED', 'NOT_AVAILABLE'];
const VALID_UNCERTAINTY_LEVELS: UncertaintyLevel[] = ['LOW', 'MODERATE', 'HIGH', 'INSUFFICIENT_EVIDENCE', 'NOT_ASSESSED'];
const VALID_RESULT_VALIDITY_STATUSES = ['CURRENT', 'STALE', 'INVALIDATED', 'NOT_ASSESSED'] as const;

/**
 * Validate a ToolResultEnvelopeV4 at runtime.
 */
export function validateToolResultEnvelope(envelope: unknown): ValidationResultV4 {
  const errors: ValidationErrorV4[] = [];
  const warnings: ValidationWarningV4[] = [];

  if (!envelope || typeof envelope !== 'object') {
    errors.push({ field: 'root', code: 'INVALID_TYPE', message: 'Envelope must be an object', severity: 'critical' });
    return { valid: false, errors, warnings };
  }

  const e = envelope as Record<string, unknown>;

  // Required top-level fields
  if (typeof e.contractVersion !== 'string' || e.contractVersion !== '4.0') {
    errors.push({ field: 'contractVersion', code: 'REQUIRED', message: 'contractVersion must be "4.0"', severity: 'error' });
  }
  if (typeof e.schemaVersion !== 'string' || !/^\d+\.\d+\.\d+$/.test(e.schemaVersion)) {
    errors.push({ field: 'schemaVersion', code: 'REQUIRED', message: 'schemaVersion must be semver (x.y.z)', severity: 'error' });
  }
  if (typeof e.toolId !== 'string' || e.toolId.trim().length === 0) {
    errors.push({ field: 'toolId', code: 'REQUIRED', message: 'toolId is required', severity: 'error' });
  }
  if (typeof e.canonicalSlug !== 'string' || e.canonicalSlug.trim().length === 0) {
    errors.push({ field: 'canonicalSlug', code: 'REQUIRED', message: 'canonicalSlug is required', severity: 'error' });
  }
  if (typeof e.engineVersion !== 'string') {
    errors.push({ field: 'engineVersion', code: 'REQUIRED', message: 'engineVersion is required', severity: 'error' });
  }
  if (typeof e.calculationId !== 'string' || e.calculationId.trim().length === 0) {
    errors.push({ field: 'calculationId', code: 'REQUIRED', message: 'calculationId is required', severity: 'error' });
  }
  if (!VALID_RESULT_STATUSES.includes(e.status as ResultStatus)) {
    errors.push({ field: 'status', code: 'INVALID_TYPE', message: `status must be one of: ${VALID_RESULT_STATUSES.join(', ')}`, severity: 'error' });
  }
  if (!VALID_RESULT_TYPES.includes(e.resultType as ResultType)) {
    errors.push({ field: 'resultType', code: 'INVALID_TYPE', message: `resultType must be one of: ${VALID_RESULT_TYPES.join(', ')}`, severity: 'error' });
  }

  // Input snapshot
  if (!e.inputSnapshot || typeof e.inputSnapshot !== 'object') {
    errors.push({ field: 'inputSnapshot', code: 'REQUIRED', message: 'inputSnapshot is required', severity: 'error' });
  } else {
    const snapResult = validateInputSnapshot(e.inputSnapshot);
    if (!snapResult.valid) {
      errors.push(...snapResult.errors.map(err => ({ ...err, field: `inputSnapshot.${err.field}` })));
    }
  }

  // Result can be null (for NOT_AVAILABLE status)
  if (e.result !== null && e.result === undefined) {
    errors.push({ field: 'result', code: 'REQUIRED', message: 'result must be a value or null', severity: 'error' });
  }

  // Provenance
  if (!Array.isArray(e.provenance)) {
    errors.push({ field: 'provenance', code: 'REQUIRED', message: 'provenance must be an array', severity: 'error' });
  } else {
    for (let i = 0; i < e.provenance.length; i++) {
      const provResult = validateProvenanceRecord(e.provenance[i]);
      if (!provResult.valid) {
        errors.push(...provResult.errors.map(err => ({ ...err, field: `provenance[${i}].${err.field}` })));
      }
    }
  }

  // Units
  if (!e.units || typeof e.units !== 'object') {
    errors.push({ field: 'units', code: 'REQUIRED', message: 'units must be an object', severity: 'error' });
  }

  // Assumptions
  if (!Array.isArray(e.assumptions)) {
    errors.push({ field: 'assumptions', code: 'REQUIRED', message: 'assumptions must be an array', severity: 'error' });
  } else {
    for (let i = 0; i < e.assumptions.length; i++) {
      const assumResult = validateAssumptionRecord(e.assumptions[i]);
      if (!assumResult.valid) {
        errors.push(...assumResult.errors.map(err => ({ ...err, field: `assumptions[${i}].${err.field}` })));
      }
    }
  }

  // Evidence
  if (!Array.isArray(e.evidence)) {
    errors.push({ field: 'evidence', code: 'REQUIRED', message: 'evidence must be an array', severity: 'error' });
  } else {
    for (let i = 0; i < e.evidence.length; i++) {
      const evResult = validateEvidenceReference(e.evidence[i]);
      if (!evResult.valid) {
        errors.push(...evResult.errors.map(err => ({ ...err, field: `evidence[${i}].${err.field}` })));
      }
    }
  }

  // Uncertainty
  if (!e.uncertainty || typeof e.uncertainty !== 'object') {
    errors.push({ field: 'uncertainty', code: 'REQUIRED', message: 'uncertainty is required', severity: 'error' });
  } else {
    const uncResult = validateUncertaintyRecord(e.uncertainty);
    if (!uncResult.valid) {
      errors.push(...uncResult.errors.map(err => ({ ...err, field: `uncertainty.${err.field}` })));
    }
  }

  // Warnings
  if (!Array.isArray(e.warnings)) {
    errors.push({ field: 'warnings', code: 'REQUIRED', message: 'warnings must be an array', severity: 'error' });
  } else {
    for (let i = 0; i < e.warnings.length; i++) {
      const warnResult = validateSafetyWarningV4(e.warnings[i]);
      if (!warnResult.valid) {
        errors.push(...warnResult.errors.map(err => ({ ...err, field: `warnings[${i}].${err.field}` })));
      }
    }
  }

  // Validity
  if (!e.validity || typeof e.validity !== 'object') {
    errors.push({ field: 'validity', code: 'REQUIRED', message: 'validity is required', severity: 'error' });
  } else {
    const valResult = validateResultValidity(e.validity);
    if (!valResult.valid) {
      errors.push(...valResult.errors.map(err => ({ ...err, field: `validity.${err.field}` })));
    }
  }

  // Privacy class
  if (!VALID_DATA_CLASSIFICATIONS.includes(e.privacyClass as DataClassification)) {
    errors.push({ field: 'privacyClass', code: 'INVALID_TYPE', message: `privacyClass must be one of: ${VALID_DATA_CLASSIFICATIONS.join(', ')}`, severity: 'error' });
  }

  // Context used
  if (!Array.isArray(e.contextUsed)) {
    errors.push({ field: 'contextUsed', code: 'REQUIRED', message: 'contextUsed must be an array', severity: 'error' });
  }

  // Next actions
  if (!Array.isArray(e.nextActions)) {
    errors.push({ field: 'nextActions', code: 'REQUIRED', message: 'nextActions must be an array', severity: 'error' });
  }

  // createdAt
  if (typeof e.createdAt !== 'string') {
    errors.push({ field: 'createdAt', code: 'REQUIRED', message: 'createdAt is required and must be a string', severity: 'error' });
  }

  // Cross-field consistency: NOT_AVAILABLE status should have null result
  if (e.status === 'NOT_AVAILABLE' && e.result !== null) {
    warnings.push({ field: 'result', code: 'CONTRADICTION', message: 'NOT_AVAILABLE status should have null result' });
  }

  // Cross-field consistency: MODEL_PREDICTION requires evidence
  if (e.resultType === 'MODEL_PREDICTION' && (!Array.isArray(e.evidence) || e.evidence.length === 0)) {
    warnings.push({ field: 'evidence', code: 'MISSING_EVIDENCE', message: 'MODEL_PREDICTION result type should have evidence references' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a ProvenanceRecord at runtime.
 */
export function validateProvenanceRecord(record: unknown): ValidationResultV4 {
  const errors: ValidationErrorV4[] = [];
  const warnings: ValidationWarningV4[] = [];

  if (!record || typeof record !== 'object') {
    errors.push({ field: 'root', code: 'INVALID_TYPE', message: 'ProvenanceRecord must be an object', severity: 'critical' });
    return { valid: false, errors, warnings };
  }

  const r = record as Record<string, unknown>;

  if (typeof r.source !== 'string' || r.source.trim().length === 0) {
    errors.push({ field: 'source', code: 'REQUIRED', message: 'source is required', severity: 'error' });
  }
  if (typeof r.recordedAt !== 'string') {
    errors.push({ field: 'recordedAt', code: 'REQUIRED', message: 'recordedAt is required', severity: 'error' });
  }
  if (typeof r.timezone !== 'string') {
    errors.push({ field: 'timezone', code: 'REQUIRED', message: 'timezone is required', severity: 'error' });
  }
  if (typeof r.unit !== 'string' || r.unit.trim().length === 0) {
    errors.push({ field: 'unit', code: 'REQUIRED', message: 'unit is required', severity: 'error' });
  }
  if (r.confidence !== null && (typeof r.confidence !== 'number' || !Number.isFinite(r.confidence) || r.confidence < 0 || r.confidence > 1)) {
    errors.push({ field: 'confidence', code: 'INVALID_TYPE', message: 'confidence must be null or a finite number 0-1', severity: 'error' });
  }
  if (!['high', 'medium', 'low', 'not_assessed'].includes(r.dataQuality as string)) {
    errors.push({ field: 'dataQuality', code: 'INVALID_TYPE', message: 'dataQuality must be high/medium/low/not_assessed', severity: 'error' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate an AssumptionRecord at runtime.
 */
export function validateAssumptionRecord(record: unknown): ValidationResultV4 {
  const errors: ValidationErrorV4[] = [];
  const warnings: ValidationWarningV4[] = [];

  if (!record || typeof record !== 'object') {
    errors.push({ field: 'root', code: 'INVALID_TYPE', message: 'AssumptionRecord must be an object', severity: 'critical' });
    return { valid: false, errors, warnings };
  }

  const r = record as Record<string, unknown>;

  if (typeof r.assumptionId !== 'string' || r.assumptionId.trim().length === 0) {
    errors.push({ field: 'assumptionId', code: 'REQUIRED', message: 'assumptionId is required', severity: 'error' });
  }
  if (typeof r.description !== 'string') {
    errors.push({ field: 'description', code: 'REQUIRED', message: 'description is required', severity: 'error' });
  }
  if (!['model', 'formula', 'population', 'domain', 'user_declared'].includes(r.type as string)) {
    errors.push({ field: 'type', code: 'INVALID_TYPE', message: 'type must be model/formula/population/domain/user_declared', severity: 'error' });
  }
  if (typeof r.impact !== 'string') {
    errors.push({ field: 'impact', code: 'REQUIRED', message: 'impact is required', severity: 'error' });
  }
  if (typeof r.version !== 'string') {
    errors.push({ field: 'version', code: 'REQUIRED', message: 'version is required', severity: 'error' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate an EvidenceReference at runtime.
 */
export function validateEvidenceReference(record: unknown): ValidationResultV4 {
  const errors: ValidationErrorV4[] = [];
  const warnings: ValidationWarningV4[] = [];

  if (!record || typeof record !== 'object') {
    errors.push({ field: 'root', code: 'INVALID_TYPE', message: 'EvidenceReference must be an object', severity: 'critical' });
    return { valid: false, errors, warnings };
  }

  const r = record as Record<string, unknown>;

  if (typeof r.evidenceId !== 'string' || r.evidenceId.trim().length === 0) {
    errors.push({ field: 'evidenceId', code: 'REQUIRED', message: 'evidenceId is required', severity: 'error' });
  }
  if (!['formula', 'rule', 'study', 'documentation', 'user_input', 'cross_tool'].includes(r.sourceType as string)) {
    errors.push({ field: 'sourceType', code: 'INVALID_TYPE', message: 'sourceType must be formula/rule/study/documentation/user_input/cross_tool', severity: 'error' });
  }
  if (typeof r.title !== 'string' || r.title.trim().length === 0) {
    errors.push({ field: 'title', code: 'REQUIRED', message: 'title is required', severity: 'error' });
  }
  if (typeof r.applicability !== 'string') {
    errors.push({ field: 'applicability', code: 'REQUIRED', message: 'applicability is required', severity: 'error' });
  }
  if (!Array.isArray(r.limitations)) {
    errors.push({ field: 'limitations', code: 'REQUIRED', message: 'limitations must be an array', severity: 'error' });
  }
  if (typeof r.version !== 'string') {
    errors.push({ field: 'version', code: 'REQUIRED', message: 'version is required', severity: 'error' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate an UncertaintyRecord at runtime.
 */
export function validateUncertaintyRecord(record: unknown): ValidationResultV4 {
  const errors: ValidationErrorV4[] = [];
  const warnings: ValidationWarningV4[] = [];

  if (!record || typeof record !== 'object') {
    errors.push({ field: 'root', code: 'INVALID_TYPE', message: 'UncertaintyRecord must be an object', severity: 'critical' });
    return { valid: false, errors, warnings };
  }

  const r = record as Record<string, unknown>;

  if (!VALID_UNCERTAINTY_LEVELS.includes(r.level as UncertaintyLevel)) {
    errors.push({ field: 'level', code: 'INVALID_TYPE', message: `level must be one of: ${VALID_UNCERTAINTY_LEVELS.join(', ')}`, severity: 'error' });
  }
  if (!Array.isArray(r.basis)) {
    errors.push({ field: 'basis', code: 'REQUIRED', message: 'basis must be an array', severity: 'error' });
  }
  if (!Array.isArray(r.affectedOutputs)) {
    errors.push({ field: 'affectedOutputs', code: 'REQUIRED', message: 'affectedOutputs must be an array', severity: 'error' });
  }
  if (!Array.isArray(r.whatWouldReduceIt)) {
    errors.push({ field: 'whatWouldReduceIt', code: 'REQUIRED', message: 'whatWouldReduceIt must be an array', severity: 'error' });
  }
  if (!Array.isArray(r.limitations)) {
    errors.push({ field: 'limitations', code: 'REQUIRED', message: 'limitations must be an array', severity: 'error' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a ResultValidity at runtime.
 */
export function validateResultValidity(record: unknown): ValidationResultV4 {
  const errors: ValidationErrorV4[] = [];
  const warnings: ValidationWarningV4[] = [];

  if (!record || typeof record !== 'object') {
    errors.push({ field: 'root', code: 'INVALID_TYPE', message: 'ResultValidity must be an object', severity: 'critical' });
    return { valid: false, errors, warnings };
  }

  const r = record as Record<string, unknown>;

  if (!VALID_RESULT_VALIDITY_STATUSES.includes(r.status as typeof VALID_RESULT_VALIDITY_STATUSES[number])) {
    errors.push({ field: 'status', code: 'INVALID_TYPE', message: `status must be one of: ${VALID_RESULT_VALIDITY_STATUSES.join(', ')}`, severity: 'error' });
  }
  if (r.validUntil !== undefined && r.validUntil !== null && typeof r.validUntil !== 'string') {
    errors.push({ field: 'validUntil', code: 'INVALID_TYPE', message: 'validUntil must be a string or null', severity: 'error' });
  }
  if (!Array.isArray(r.invalidationTriggers)) {
    errors.push({ field: 'invalidationTriggers', code: 'REQUIRED', message: 'invalidationTriggers must be an array', severity: 'error' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a SafetyWarningV4 at runtime.
 */
export function validateSafetyWarningV4(record: unknown): ValidationResultV4 {
  const errors: ValidationErrorV4[] = [];
  const warnings: ValidationWarningV4[] = [];

  if (!record || typeof record !== 'object') {
    errors.push({ field: 'root', code: 'INVALID_TYPE', message: 'SafetyWarningV4 must be an object', severity: 'critical' });
    return { valid: false, errors, warnings };
  }

  const r = record as Record<string, unknown>;

  if (typeof r.warningId !== 'string' || r.warningId.trim().length === 0) {
    errors.push({ field: 'warningId', code: 'REQUIRED', message: 'warningId is required', severity: 'error' });
  }
  if (!['info', 'caution', 'warning', 'critical'].includes(r.level as string)) {
    errors.push({ field: 'level', code: 'INVALID_TYPE', message: 'level must be info/caution/warning/critical', severity: 'error' });
  }
  if (typeof r.code !== 'string' || r.code.trim().length === 0) {
    errors.push({ field: 'code', code: 'REQUIRED', message: 'code is required', severity: 'error' });
  }
  if (typeof r.message !== 'string') {
    errors.push({ field: 'message', code: 'REQUIRED', message: 'message is required', severity: 'error' });
  }
  if (typeof r.trigger !== 'string') {
    errors.push({ field: 'trigger', code: 'REQUIRED', message: 'trigger is required', severity: 'error' });
  }
  if (!['low', 'medium', 'high', 'critical'].includes(r.severity as string)) {
    errors.push({ field: 'severity', code: 'INVALID_TYPE', message: 'severity must be low/medium/high/critical', severity: 'error' });
  }
  if (typeof r.reason !== 'string') {
    errors.push({ field: 'reason', code: 'REQUIRED', message: 'reason is required', severity: 'error' });
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ============================================================
// §4. Backward-Compatible Adapter
// ============================================================

/**
 * Adapter that bridges V4 contracts to existing V6 engines without modifying them.
 * This is a READ-ONLY adapter — it wraps existing V6 outputs into V4 envelopes
 * without changing the underlying calculation.
 */
export function adaptV6ToV4Envelope<TInput, TResult>(
  toolId: string,
  canonicalSlug: string,
  engineVersion: string,
  status: ResultStatus,
  inputSnapshot: InputSnapshot<TInput>,
  result: TResult | null,
  resultType: ResultType,
  provenance: ProvenanceRecord[],
  units: Record<string, string>,
  assumptions: AssumptionRecord[],
  evidence: EvidenceReference[],
  uncertainty: UncertaintyRecord,
  warnings: SafetyWarningV4[],
  validity: ResultValidity,
  privacyClass: DataClassification,
  createdAt: string
): ToolResultEnvelopeV4<TInput, TResult> {
  return {
    contractVersion: '4.0',
    schemaVersion: '4.0.0',
    toolId,
    canonicalSlug,
    engineVersion,
    calculationId: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status,
    inputSnapshot,
    result,
    resultType,
    provenance,
    units,
    assumptions,
    evidence,
    uncertainty,
    warnings,
    validity,
    privacyClass,
    contextUsed: [],
    nextActions: [],
    createdAt,
  };
}

// Note: calculationId uses Date.now() and Math.random() for uniqueness.
// This is acceptable for an ID generation, not a calculation.
// The actual calculation remains deterministic.

// All functions are already exported via `export function` above.
// No additional re-export needed.
