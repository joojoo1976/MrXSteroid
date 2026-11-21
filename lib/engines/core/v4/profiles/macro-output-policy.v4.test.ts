/**
 * lib/engines/core/v4/profiles/macro-output-policy.v4.test.ts
 *
 * Batch B coverage for the additive Macro V4 output policy and for the existing
 * V6→V4 adapter's conformance to it:
 * - engine/calculation identity
 * - result validity and invalidation
 * - contract/schema version consistency
 * - conditional evidence, warnings and assumptions
 * - nextActions and auditRef policy
 * - output validation and compatibility
 *
 * The adapter is consumed read-only. Macro V6 remains the numeric authority.
 */

import { describe, expect, it } from 'vitest';
import {
  MACRO_AUDIT_REF_POLICY,
  MACRO_ENGINE_IDENTITY_V4,
  MACRO_NEXT_ACTIONS_POLICY,
  MACRO_CURRENT_VALIDITY,
  macroEnvelopeExpectationsFor,
  resolveMacroResultValidity,
} from './macro-output-policy.v4';
import {
  adaptMacroV6InvalidToV4,
  adaptMacroV6ToV4,
  adaptMacroV6UnavailableToV4,
} from '../adapter.macro.v4';
import { validateToolResultEnvelope } from '../runtime.v4';
import { CONTRACT_VERSION, SCHEMA_VERSION } from '../contracts.v4';
import { calculateMacrosV6, type MacroInputV6 } from '@/lib/tools/engines/macro.v6';

const VALID_INPUT: MacroInputV6 = {
  age: 30,
  sex: 'male',
  heightCm: 175,
  weightKg: 75,
  activityLevel: 1.55,
  phase: 'maintenance',
};

const CREATED_AT = '2026-11-05T12:00:00.000Z';

async function validEnvelope(input: MacroInputV6 = VALID_INPUT) {
  const response = await calculateMacrosV6(input);
  if (!('result' in response)) throw new Error('Expected a complete Macro V6 result.');
  return adaptMacroV6ToV4(input, response.result, CREATED_AT, response.intelligence.warnings);
}

describe('M4-OUT-01 engine and calculation identity', () => {
  it('publishes the accepted tool, engine, equation and contract identity', () => {
    expect(MACRO_ENGINE_IDENTITY_V4.toolId).toBe('mrx.tool.macro');
    expect(MACRO_ENGINE_IDENTITY_V4.canonicalSlug).toBe('macro');
    expect(MACRO_ENGINE_IDENTITY_V4.engineVersion).toBe('6.0.0');
    expect(MACRO_ENGINE_IDENTITY_V4.equationId).toBe('mifflin-st-jeor-macro-v1');
    expect(MACRO_ENGINE_IDENTITY_V4.contractVersion).toBe(CONTRACT_VERSION);
    expect(MACRO_ENGINE_IDENTITY_V4.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('matches the envelope identity produced by the accepted adapter', async () => {
    const envelope = await validEnvelope();
    expect(envelope.toolId).toBe(MACRO_ENGINE_IDENTITY_V4.toolId);
    expect(envelope.canonicalSlug).toBe(MACRO_ENGINE_IDENTITY_V4.canonicalSlug);
    expect(envelope.engineVersion).toBe(MACRO_ENGINE_IDENTITY_V4.engineVersion);
    expect(envelope.contractVersion).toBe(MACRO_ENGINE_IDENTITY_V4.contractVersion);
    expect(envelope.schemaVersion).toBe(MACRO_ENGINE_IDENTITY_V4.schemaVersion);
  });
});

describe('M4-OUT-02 and M4-EV-04 result validity and invalidation', () => {
  it('returns CURRENT with the accepted invalidation triggers when nothing changed', () => {
    expect(resolveMacroResultValidity([])).toEqual({
      status: 'CURRENT',
      invalidationTriggers: ['input_changed', 'engine_version_changed'],
    });
    expect(MACRO_CURRENT_VALIDITY).toEqual({
      status: 'CURRENT',
      invalidationTriggers: ['input_changed', 'engine_version_changed'],
    });
  });

  it('invalidates on an input change and on an engine change', () => {
    expect(resolveMacroResultValidity(['input_changed'])).toEqual({
      status: 'INVALIDATED',
      invalidationTriggers: ['input_changed'],
    });
    expect(resolveMacroResultValidity(['engine_version_changed'])).toEqual({
      status: 'INVALIDATED',
      invalidationTriggers: ['engine_version_changed'],
    });
    expect(resolveMacroResultValidity(['input_changed', 'engine_version_changed'])).toEqual({
      status: 'INVALIDATED',
      invalidationTriggers: ['input_changed', 'engine_version_changed'],
    });
  });

  it('uses the CURRENT policy on a valid adapter envelope and never sets a universal expiry', async () => {
    const envelope = await validEnvelope();
    expect(envelope.validity.status).toBe('CURRENT');
    expect(envelope.validity.invalidationTriggers).toEqual([
      'input_changed',
      'engine_version_changed',
    ]);
    expect(envelope.validity.validUntil).toBeUndefined();
    expect(envelope.validity.freshnessPolicyId).toBeUndefined();
  });
});

describe('M4-OUT-03 contract and schema compatibility', () => {
  it('uses contractVersion 4.0 and a semver schemaVersion on every adapter state', () => {
    const envelopes = [
      adaptMacroV6InvalidToV4({}, 'invalid', CREATED_AT),
      adaptMacroV6UnavailableToV4({}, 'empty', ['age'], CREATED_AT),
    ];

    for (const envelope of envelopes) {
      expect(envelope.contractVersion).toBe('4.0');
      expect(envelope.schemaVersion).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });
});

describe('M4-OUT-04 conditional evidence, assumptions and warnings', () => {
  it('describes which artefacts each result state actually requires', () => {
    expect(macroEnvelopeExpectationsFor('VALID')).toEqual({
      requiresMifflinEvidence: true,
      requiresAssumptions: true,
      requiresDeterministicWarning: true,
      nextActions: MACRO_NEXT_ACTIONS_POLICY,
      auditRef: MACRO_AUDIT_REF_POLICY,
    });
    for (const status of ['INVALID', 'NOT_AVAILABLE', 'DEGRADED'] as const) {
      expect(macroEnvelopeExpectationsFor(status)).toEqual({
        requiresMifflinEvidence: false,
        requiresAssumptions: false,
        requiresDeterministicWarning: false,
        nextActions: MACRO_NEXT_ACTIONS_POLICY,
        auditRef: MACRO_AUDIT_REF_POLICY,
      });
    }
  });

  it('emits Mifflin evidence, assumptions and the deterministic warning for a calculated result', async () => {
    const envelope = await validEnvelope();
    expect(envelope.result).not.toBeNull();
    expect(envelope.evidence.map((entry) => entry.evidenceId)).toEqual(['mifflin-st-jeor-1990']);
    expect(envelope.assumptions.length).toBeGreaterThan(0);
    expect(envelope.warnings.map((warning) => warning.code)).toContain(
      'DETERMINISTIC_CALCULATION'
    );
  });

  it('does not require Mifflin evidence or assumptions when no calculation exists', () => {
    const unavailable = adaptMacroV6UnavailableToV4({}, 'empty', ['age'], CREATED_AT);
    const invalid = adaptMacroV6InvalidToV4({}, 'invalid', CREATED_AT);

    expect(unavailable.evidence).toEqual([]);
    expect(unavailable.assumptions).toEqual([]);
    expect(invalid.evidence).toEqual([]);
    expect(invalid.assumptions).toEqual([]);
    expect(unavailable.warnings.map((warning) => warning.code)).toEqual(['MISSING_INPUTS']);
    expect(invalid.warnings.map((warning) => warning.code)).toEqual(['INVALID_INPUT']);
  });

  it('passes the accepted runtime envelope validator in valid, unavailable and invalid states', async () => {
    const envelopes = [
      await validEnvelope(),
      adaptMacroV6UnavailableToV4({}, 'empty', ['age'], CREATED_AT),
      adaptMacroV6InvalidToV4({ age: 18 }, 'invalid', CREATED_AT),
    ];

    for (const envelope of envelopes) {
      const validation = validateToolResultEnvelope(envelope);
      expect(validation.errors).toEqual([]);
      expect(validation.valid).toBe(true);
    }
  });
});

describe('M4-OUT-05 and M4-OUT-07 nextActions and auditRef gating', () => {
  it('keeps nextActions empty until a deterministic action is approved', () => {
    expect(MACRO_NEXT_ACTIONS_POLICY).toBe('EMPTY_UNTIL_APPROVED');
  });

  it('never emits auditRef before a confirmed storage write exists', () => {
    expect(MACRO_AUDIT_REF_POLICY).toBe('ABSENT_UNTIL_CONFIRMED_WRITE');
  });

  it('keeps nextActions, auditRef and contextUsed empty on every adapter state', async () => {
    const envelopes = [
      await validEnvelope(),
      adaptMacroV6UnavailableToV4({}, 'empty', ['age'], CREATED_AT),
      adaptMacroV6InvalidToV4({}, 'invalid', CREATED_AT),
    ];

    for (const envelope of envelopes) {
      expect(envelope.nextActions).toEqual([]);
      expect(envelope.contextUsed).toEqual([]);
      expect(envelope.auditRef).toBeUndefined();
    }
  });
});

describe('M4-OUT-06 calculationId operation identity', () => {
  it('creates a distinct operation id for each calculation of identical input', async () => {
    const first = await validEnvelope();
    const second = await validEnvelope();

    expect(first.calculationId).toMatch(/^calc-/);
    expect(second.calculationId).toMatch(/^calc-/);
    expect(first.calculationId).not.toBe(second.calculationId);
    expect(first.calculationId).not.toBe(String(VALID_INPUT.age));
  });
});
