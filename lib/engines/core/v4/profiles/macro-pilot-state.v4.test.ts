/**
 * lib/engines/core/v4/profiles/macro-pilot-state.v4.test.ts
 *
 * Batch D coverage for the additive pilot presentation-state helper. The helper
 * is pure and is consumed by the pilot to keep empty/partial/full/invalid/
 * degraded/error presentation deterministic and testable.
 */

import { describe, expect, it } from 'vitest';
import {
  MACRO_REQUIRED_FIELD_COUNT,
  getMacroRequiredFieldProgress,
  resolveMacroPilotPresentationStateV4,
} from './macro-pilot-state.v4';

describe('macro pilot presentation state mapping', () => {
  it('maps an error before any envelope exists', () => {
    expect(
      resolveMacroPilotPresentationStateV4({
        hasError: true,
        hasEnvelope: true,
        status: 'INVALID',
        completeness: 'INCOMPLETE',
        hasResult: false,
      })
    ).toBe('ERROR');
  });

  it('maps no envelope and no error to idle', () => {
    expect(
      resolveMacroPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: false,
        status: null,
        completeness: null,
        hasResult: false,
      })
    ).toBe('IDLE');
  });

  it('maps the owner-approved empty, partial, full and invalid states', () => {
    expect(
      resolveMacroPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: true,
        status: 'NOT_AVAILABLE',
        completeness: 'INSUFFICIENT_FOR_SAFE_RESULT',
        hasResult: false,
      })
    ).toBe('EMPTY');

    expect(
      resolveMacroPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: true,
        status: 'NOT_AVAILABLE',
        completeness: 'INCOMPLETE',
        hasResult: false,
      })
    ).toBe('PARTIAL');

    expect(
      resolveMacroPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: true,
        status: 'VALID',
        completeness: 'SUFFICIENT_FOR_BASIC_RESULT',
        hasResult: true,
      })
    ).toBe('FULL');

    expect(
      resolveMacroPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: true,
        status: 'INVALID',
        completeness: 'INCOMPLETE',
        hasResult: false,
      })
    ).toBe('INVALID');
  });

  it('maps the controlled DEGRADED envelope, never an engine-output claim', () => {
    expect(
      resolveMacroPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: true,
        status: 'DEGRADED',
        completeness: 'INSUFFICIENT_FOR_SAFE_RESULT',
        hasResult: false,
      })
    ).toBe('DEGRADED');
  });

  it('maps an unexpected NOT_AVAILABLE combination to unavailable', () => {
    expect(
      resolveMacroPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: true,
        status: 'NOT_AVAILABLE',
        completeness: 'SUFFICIENT_FOR_BASIC_RESULT',
        hasResult: false,
      })
    ).toBe('UNAVAILABLE');
  });
});

describe('macro required-input progress', () => {
  it('counts the six required fields only', () => {
    expect(MACRO_REQUIRED_FIELD_COUNT).toBe(6);
    expect(getMacroRequiredFieldProgress({}).provided).toBe(0);
    expect(getMacroRequiredFieldProgress({ age: 30 }).provided).toBe(1);
    expect(
      getMacroRequiredFieldProgress({
        age: 30,
        sex: 'male',
        heightCm: 175,
        weightKg: 75,
        activityLevel: 1.55,
        phase: 'maintenance',
      }).provided
    ).toBe(6);
  });

  it('lists missing fields in canonical order without inventing values', () => {
    expect(getMacroRequiredFieldProgress({ age: 30 })).toEqual({
      provided: 1,
      required: 6,
      missing: ['sex', 'heightCm', 'weightKg', 'activityLevel', 'phase'],
    });
  });
});
