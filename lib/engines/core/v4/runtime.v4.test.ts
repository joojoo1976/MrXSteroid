/**
 * lib/engines/core/v4/runtime.v4.test.ts
 * V4.0 Runtime Validation — Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateFieldDefinition,
  validateInputSnapshot,
  assessInputCompleteness,
  validateFieldValue,
  validateToolResultEnvelope,
  validateProvenanceRecord,
  validateAssumptionRecord,
  validateEvidenceReference,
  validateUncertaintyRecord,
  validateResultValidity,
  validateSafetyWarningV4,
  adaptV6ToV4Envelope,
} from './runtime.v4';
import type { FieldDefinition, InputSnapshot, ToolResultEnvelopeV4 } from './contracts.v4';

describe('V4 Runtime Validation', () => {
  // ============================================================
  // Input Validation
  // ============================================================

  describe('validateFieldDefinition', () => {
    it('should accept a valid field definition', () => {
      const field: FieldDefinition = {
        fieldId: 'weight',
        labelKey: 'weight.label',
        dataType: 'number',
        required: true,
        unit: 'kg',
        canonicalUnit: 'kg',
        fieldState: 'VALID',
        provenance: 'USER_ENTERED',
        sensitivityClass: 'personal',
      };
      const result = validateFieldDefinition(field);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject field with missing fieldId', () => {
      const field = { labelKey: 'x', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'public' };
      const result = validateFieldDefinition(field);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'fieldId')).toBe(true);
    });

    it('should reject field with invalid dataType', () => {
      const field = { fieldId: 'x', labelKey: 'x', dataType: 'invalid', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'public' };
      const result = validateFieldDefinition(field);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'dataType')).toBe(true);
    });

    it('should reject field with invalid fieldState', () => {
      const field = { fieldId: 'x', labelKey: 'x', dataType: 'number', required: true, fieldState: 'INVALID_STATE', provenance: 'USER_ENTERED', sensitivityClass: 'public' };
      const result = validateFieldDefinition(field);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'fieldState')).toBe(true);
    });

    it('should reject field with min > max', () => {
      const field = { fieldId: 'x', labelKey: 'x', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'public', constraints: { min: 10, max: 5 } };
      const result = validateFieldDefinition(field);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'LOGICAL_CONTRADICTION')).toBe(true);
    });

    it('should reject non-object input', () => {
      const result = validateFieldDefinition(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0].severity).toBe('critical');
    });

    it('should reject non-object input (string)', () => {
      const result = validateFieldDefinition('not an object');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateInputSnapshot', () => {
    it('should accept a valid input snapshot', () => {
      const snapshot: InputSnapshot<{ weight: number }> = {
        values: { weight: 80 },
        fieldStates: { weight: 'VALID' },
        provenance: { weight: 'USER_ENTERED' },
        completeness: 'SUFFICIENT_FOR_BASIC_RESULT',
        recordedAt: '2026-11-05T00:00:00Z',
        version: '4.0.0',
      };
      const result = validateInputSnapshot(snapshot);
      expect(result.valid).toBe(true);
    });

    it('should reject snapshot with missing values', () => {
      const snapshot = { fieldStates: {}, provenance: {}, completeness: 'INCOMPLETE', recordedAt: '2026-11-05T00:00:00Z', version: '4.0.0' };
      const result = validateInputSnapshot(snapshot);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'values')).toBe(true);
    });

    it('should reject snapshot with invalid completeness', () => {
      const snapshot = { values: {}, fieldStates: {}, provenance: {}, completeness: 'INVALID', recordedAt: '2026-11-05T00:00:00Z', version: '4.0.0' };
      const result = validateInputSnapshot(snapshot);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'completeness')).toBe(true);
    });

    it('should reject snapshot with invalid field state', () => {
      const snapshot = { values: {}, fieldStates: { x: 'INVALID_STATE' }, provenance: {}, completeness: 'INCOMPLETE', recordedAt: '2026-11-05T00:00:00Z', version: '4.0.0' };
      const result = validateInputSnapshot(snapshot);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'fieldStates.x')).toBe(true);
    });

    it('should reject non-object input', () => {
      const result = validateInputSnapshot(null);
      expect(result.valid).toBe(false);
    });
  });

  describe('assessInputCompleteness', () => {
    it('should return SUFFICIENT_FOR_BASIC_RESULT when all required present', () => {
      const fields: FieldDefinition[] = [
        { fieldId: 'weight', labelKey: 'w', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal' },
      ];
      const result = assessInputCompleteness(fields, { weight: 80 });
      expect(result).toBe('SUFFICIENT_FOR_BASIC_RESULT');
    });

    it('should return INCOMPLETE when some required missing', () => {
      const fields: FieldDefinition[] = [
        { fieldId: 'weight', labelKey: 'w', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal' },
        { fieldId: 'height', labelKey: 'h', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal' },
      ];
      const result = assessInputCompleteness(fields, { weight: 80 });
      expect(result).toBe('INCOMPLETE');
    });

    it('should return INSUFFICIENT_FOR_SAFE_RESULT when all required missing and no input', () => {
      const fields: FieldDefinition[] = [
        { fieldId: 'weight', labelKey: 'w', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal' },
      ];
      const result = assessInputCompleteness(fields, {});
      expect(result).toBe('INSUFFICIENT_FOR_SAFE_RESULT');
    });

    it('should return SUFFICIENT_WITH_LIMITATIONS when estimated field present', () => {
      const fields: FieldDefinition[] = [
        { fieldId: 'weight', labelKey: 'w', dataType: 'number', required: true, fieldState: 'ESTIMATED', provenance: 'ESTIMATED', sensitivityClass: 'personal' },
      ];
      const result = assessInputCompleteness(fields, { weight: 80 });
      expect(result).toBe('SUFFICIENT_WITH_LIMITATIONS');
    });
  });

  describe('validateFieldValue', () => {
    it('should return VALID for valid number within range', () => {
      const field: FieldDefinition = { fieldId: 'weight', labelKey: 'w', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal', constraints: { min: 30, max: 300 } };
      const result = validateFieldValue(field, 80);
      expect(result.state).toBe('VALID');
      expect(result.errors).toHaveLength(0);
    });

    it('should return MISSING for required field with no value', () => {
      const field: FieldDefinition = { fieldId: 'weight', labelKey: 'w', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal' };
      const result = validateFieldValue(field, undefined);
      expect(result.state).toBe('MISSING');
      expect(result.errors).toHaveLength(1);
    });

    it('should return NOT_REQUIRED for optional field with no value', () => {
      const field: FieldDefinition = { fieldId: 'hip', labelKey: 'h', dataType: 'number', required: false, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal' };
      const result = validateFieldValue(field, undefined);
      expect(result.state).toBe('NOT_REQUIRED');
      expect(result.errors).toHaveLength(0);
    });

    it('should return INVALID for out-of-range value', () => {
      const field: FieldDefinition = { fieldId: 'weight', labelKey: 'w', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal', constraints: { min: 30, max: 300 } };
      const result = validateFieldValue(field, 500);
      expect(result.state).toBe('INVALID');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return INVALID for non-finite value', () => {
      const field: FieldDefinition = { fieldId: 'weight', labelKey: 'w', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal' };
      const result = validateFieldValue(field, NaN);
      expect(result.state).toBe('INVALID');
    });

    it('should validate enum values', () => {
      const field: FieldDefinition = { fieldId: 'sex', labelKey: 's', dataType: 'enum', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal', constraints: { enumValues: ['male', 'female'] } };
      expect(validateFieldValue(field, 'male').state).toBe('VALID');
      expect(validateFieldValue(field, 'other').state).toBe('INVALID');
    });

    it('should validate boolean values', () => {
      const field: FieldDefinition = { fieldId: 'flag', labelKey: 'f', dataType: 'boolean', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'public' };
      expect(validateFieldValue(field, true).state).toBe('VALID');
      expect(validateFieldValue(field, 'true').state).toBe('INVALID');
    });

    it('should validate date values', () => {
      const field: FieldDefinition = { fieldId: 'date', labelKey: 'd', dataType: 'date', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'public' };
      expect(validateFieldValue(field, '2026-11-05').state).toBe('VALID');
      expect(validateFieldValue(field, 'not-a-date').state).toBe('INVALID');
    });
  });

  // ============================================================
  // Output Validation
  // ============================================================

  describe('validateToolResultEnvelope', () => {
    const validEnvelope = {
      contractVersion: '4.0',
      schemaVersion: '4.0.0',
      toolId: 'mrx.tool.macro',
      canonicalSlug: 'macro',
      engineVersion: '4.0.0',
      calculationId: 'calc-123',
      status: 'VALID',
      inputSnapshot: {
        values: { weight: 80 },
        fieldStates: { weight: 'VALID' },
        provenance: { weight: 'USER_ENTERED' },
        completeness: 'SUFFICIENT_FOR_BASIC_RESULT',
        recordedAt: '2026-11-05T00:00:00Z',
        version: '4.0.0',
      },
      result: { calories: 2000 },
      resultType: 'CALCULATED',
      provenance: [{ source: 'manual', recordedAt: '2026-11-05T00:00:00Z', timezone: 'UTC', unit: 'kcal', confidence: 0.9, dataQuality: 'high' }],
      units: { calories: 'kcal' },
      assumptions: [{ assumptionId: 'a1', description: 'test', type: 'formula', impact: 'low', version: '4.0.0' }],
      evidence: [{ evidenceId: 'e1', sourceType: 'formula', title: 'test', applicability: 'all', limitations: [], version: '4.0.0' }],
      uncertainty: { level: 'LOW', basis: [], affectedOutputs: [], whatWouldReduceIt: [], limitations: [] },
      warnings: [],
      validity: { status: 'CURRENT', invalidationTriggers: [] },
      privacyClass: 'PERSONAL',
      contextUsed: [],
      nextActions: [],
      createdAt: '2026-11-05T00:00:00Z',
    };

    it('should accept a valid envelope', () => {
      const result = validateToolResultEnvelope(validEnvelope);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject envelope with wrong contract version', () => {
      const env = { ...validEnvelope, contractVersion: '3.0' };
      const result = validateToolResultEnvelope(env);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'contractVersion')).toBe(true);
    });

    it('should reject envelope with invalid status', () => {
      const env = { ...validEnvelope, status: 'INVALID_STATUS' };
      const result = validateToolResultEnvelope(env);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'status')).toBe(true);
    });

    it('should reject envelope with invalid resultType', () => {
      const env = { ...validEnvelope, resultType: 'INVALID_TYPE' };
      const result = validateToolResultEnvelope(env);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'resultType')).toBe(true);
    });

    it('should reject envelope with missing toolId', () => {
      const env = { ...validEnvelope, toolId: '' };
      const result = validateToolResultEnvelope(env);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'toolId')).toBe(true);
    });

    it('should reject envelope with invalid privacyClass', () => {
      const env = { ...validEnvelope, privacyClass: 'INVALID' };
      const result = validateToolResultEnvelope(env);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'privacyClass')).toBe(true);
    });

    it('should reject non-object input', () => {
      const result = validateToolResultEnvelope(null);
      expect(result.valid).toBe(false);
    });

    it('should reject envelope with null result for NOT_AVAILABLE status (warning only)', () => {
      const env = { ...validEnvelope, status: 'NOT_AVAILABLE', result: null };
      const result = validateToolResultEnvelope(env);
      expect(result.valid).toBe(true); // Valid, just a warning
    });
  });

  describe('validateProvenanceRecord', () => {
    it('should accept valid provenance record', () => {
      const record = { source: 'manual', recordedAt: '2026-11-05T00:00:00Z', timezone: 'UTC', unit: 'kg', confidence: 0.9, dataQuality: 'high' };
      const result = validateProvenanceRecord(record);
      expect(result.valid).toBe(true);
    });

    it('should reject provenance with invalid confidence', () => {
      const record = { source: 'manual', recordedAt: '2026-11-05T00:00:00Z', timezone: 'UTC', unit: 'kg', confidence: 1.5, dataQuality: 'high' };
      const result = validateProvenanceRecord(record);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'confidence')).toBe(true);
    });

    it('should reject provenance with missing source', () => {
      const record = { recordedAt: '2026-11-05T00:00:00Z', timezone: 'UTC', unit: 'kg', confidence: null, dataQuality: 'high' };
      const result = validateProvenanceRecord(record);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'source')).toBe(true);
    });
  });

  describe('validateAssumptionRecord', () => {
    it('should accept valid assumption record', () => {
      const record = { assumptionId: 'a1', description: 'test', type: 'formula', impact: 'low', version: '4.0.0' };
      const result = validateAssumptionRecord(record);
      expect(result.valid).toBe(true);
    });

    it('should reject assumption with invalid type', () => {
      const record = { assumptionId: 'a1', description: 'test', type: 'invalid', impact: 'low', version: '4.0.0' };
      const result = validateAssumptionRecord(record);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'type')).toBe(true);
    });
  });

  describe('validateEvidenceReference', () => {
    it('should accept valid evidence reference', () => {
      const record = { evidenceId: 'e1', sourceType: 'formula', title: 'test', applicability: 'all', limitations: [], version: '4.0.0' };
      const result = validateEvidenceReference(record);
      expect(result.valid).toBe(true);
    });

    it('should reject evidence with invalid sourceType', () => {
      const record = { evidenceId: 'e1', sourceType: 'invalid', title: 'test', applicability: 'all', limitations: [], version: '4.0.0' };
      const result = validateEvidenceReference(record);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'sourceType')).toBe(true);
    });
  });

  describe('validateUncertaintyRecord', () => {
    it('should accept valid uncertainty record', () => {
      const record = { level: 'LOW', basis: [], affectedOutputs: [], whatWouldReduceIt: [], limitations: [] };
      const result = validateUncertaintyRecord(record);
      expect(result.valid).toBe(true);
    });

    it('should reject uncertainty with invalid level', () => {
      const record = { level: 'INVALID', basis: [], affectedOutputs: [], whatWouldReduceIt: [], limitations: [] };
      const result = validateUncertaintyRecord(record);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'level')).toBe(true);
    });
  });

  describe('validateResultValidity', () => {
    it('should accept valid result validity', () => {
      const record = { status: 'CURRENT', invalidationTriggers: [] };
      const result = validateResultValidity(record);
      expect(result.valid).toBe(true);
    });

    it('should reject validity with invalid status', () => {
      const record = { status: 'INVALID', invalidationTriggers: [] };
      const result = validateResultValidity(record);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'status')).toBe(true);
    });
  });

  describe('validateSafetyWarningV4', () => {
    it('should accept valid safety warning', () => {
      const record = { warningId: 'w1', level: 'warning', code: 'TEST', message: 'test', trigger: 'test', severity: 'medium', reason: 'test' };
      const result = validateSafetyWarningV4(record);
      expect(result.valid).toBe(true);
    });

    it('should reject warning with invalid level', () => {
      const record = { warningId: 'w1', level: 'INVALID', code: 'TEST', message: 'test', trigger: 'test', severity: 'medium', reason: 'test' };
      const result = validateSafetyWarningV4(record);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'level')).toBe(true);
    });

    it('should reject warning with missing code', () => {
      const record = { warningId: 'w1', level: 'warning', message: 'test', trigger: 'test', severity: 'medium', reason: 'test' };
      const result = validateSafetyWarningV4(record);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'code')).toBe(true);
    });
  });

  // ============================================================
  // Backward Compatibility
  // ============================================================

  describe('adaptV6ToV4Envelope', () => {
    it('should create a valid V4 envelope from V6 data', () => {
      const envelope = adaptV6ToV4Envelope(
        'mrx.tool.macro',
        'macro',
        '6.0.0',
        'VALID',
        { values: { weight: 80 }, fieldStates: { weight: 'VALID' }, provenance: { weight: 'USER_ENTERED' }, completeness: 'SUFFICIENT_FOR_BASIC_RESULT', recordedAt: '2026-11-05T00:00:00Z', version: '4.0.0' },
        { calories: 2000 },
        'CALCULATED',
        [{ source: 'manual', recordedAt: '2026-11-05T00:00:00Z', timezone: 'UTC', unit: 'kcal', confidence: 0.9, dataQuality: 'high' }],
        { calories: 'kcal' },
        [{ assumptionId: 'a1', description: 'test', type: 'formula', impact: 'low', version: '4.0.0' }],
        [{ evidenceId: 'e1', sourceType: 'formula', title: 'test', applicability: 'all', limitations: [], version: '4.0.0' }],
        { level: 'LOW', basis: [], affectedOutputs: [], whatWouldReduceIt: [], limitations: [] },
        [],
        { status: 'CURRENT', invalidationTriggers: [] },
        'PERSONAL',
        '2026-11-05T00:00:00Z'
      );
      expect(envelope.contractVersion).toBe('4.0');
      expect(envelope.toolId).toBe('mrx.tool.macro');
      expect(envelope.resultType).toBe('CALCULATED');
      const validation = validateToolResultEnvelope(envelope);
      expect(validation.valid).toBe(true);
    });

    it('should be deterministic in structure (same inputs produce same shape)', () => {
      const base = {
        toolId: 'mrx.tool.test',
        canonicalSlug: 'test',
        engineVersion: '6.0.0',
        status: 'VALID' as const,
        inputSnapshot: { values: {}, fieldStates: {}, provenance: {}, completeness: 'INCOMPLETE' as const, recordedAt: '2026-11-05T00:00:00Z', version: '4.0.0' },
        result: { x: 1 },
        resultType: 'CALCULATED' as const,
        provenance: [],
        units: {},
        assumptions: [],
        evidence: [],
        uncertainty: { level: 'LOW' as const, basis: [], affectedOutputs: [], whatWouldReduceIt: [], limitations: [] },
        warnings: [],
        validity: { status: 'CURRENT' as const, invalidationTriggers: [] },
        privacyClass: 'PUBLIC' as const,
        createdAt: '2026-11-05T00:00:00Z',
      };
      const env1 = adaptV6ToV4Envelope(base.toolId, base.canonicalSlug, base.engineVersion, base.status, base.inputSnapshot, base.result, base.resultType, base.provenance, base.units, base.assumptions, base.evidence, base.uncertainty, base.warnings, base.validity, base.privacyClass, base.createdAt);
      const env2 = adaptV6ToV4Envelope(base.toolId, base.canonicalSlug, base.engineVersion, base.status, base.inputSnapshot, base.result, base.resultType, base.provenance, base.units, base.assumptions, base.evidence, base.uncertainty, base.warnings, base.validity, base.privacyClass, base.createdAt);
      expect(env1.contractVersion).toBe(env2.contractVersion);
      expect(env1.toolId).toBe(env2.toolId);
      expect(env1.resultType).toBe(env2.resultType);
      expect(env1.status).toBe(env2.status);
    });
  });

  // ============================================================
  // Determinism
  // ============================================================

  describe('Determinism', () => {
    it('should produce same validation result for same input', () => {
      const field: FieldDefinition = { fieldId: 'weight', labelKey: 'w', dataType: 'number', required: true, fieldState: 'VALID', provenance: 'USER_ENTERED', sensitivityClass: 'personal', constraints: { min: 30, max: 300 } };
      const r1 = validateFieldValue(field, 80);
      const r2 = validateFieldValue(field, 80);
      expect(r1.state).toBe(r2.state);
      expect(r1.errors).toEqual(r2.errors);
    });

    it('should produce same envelope validation for same input', () => {
      const envelope = {
        contractVersion: '4.0', schemaVersion: '4.0.0', toolId: 'test', canonicalSlug: 'test', engineVersion: '4.0.0', calculationId: 'calc-1', status: 'VALID', inputSnapshot: { values: {}, fieldStates: {}, provenance: {}, completeness: 'INCOMPLETE', recordedAt: '2026-11-05T00:00:00Z', version: '4.0.0' }, result: null, resultType: 'NOT_AVAILABLE', provenance: [], units: {}, assumptions: [], evidence: [], uncertainty: { level: 'NOT_ASSESSED', basis: [], affectedOutputs: [], whatWouldReduceIt: [], limitations: [] }, warnings: [], validity: { status: 'NOT_ASSESSED', invalidationTriggers: [] }, privacyClass: 'PUBLIC', contextUsed: [], nextActions: [], createdAt: '2026-11-05T00:00:00Z',
      };
      const r1 = validateToolResultEnvelope(envelope);
      const r2 = validateToolResultEnvelope(envelope);
      expect(r1.valid).toBe(r2.valid);
      expect(r1.errors).toEqual(r2.errors);
    });
  });
});