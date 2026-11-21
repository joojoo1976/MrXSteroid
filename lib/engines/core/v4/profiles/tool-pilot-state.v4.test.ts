/**
 * lib/engines/core/v4/profiles/tool-pilot-state.v4.test.ts
 *
 * Shared additive presentation-state helper for the R5 first batch
 * (BMI, Protein Needs, Water Intake). Pure mapping from the accepted V4
 * envelope state to the pilot's localized presentation state.
 */

import { describe, expect, it } from 'vitest';
import {
  countProvidedToolFields,
  resolveToolPilotPresentationStateV4,
} from './tool-pilot-state.v4';

describe('tool pilot presentation state mapping', () => {
  it('maps an error before any envelope exists', () => {
    expect(
      resolveToolPilotPresentationStateV4({
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
      resolveToolPilotPresentationStateV4({
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
      resolveToolPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: true,
        status: 'NOT_AVAILABLE',
        completeness: 'INSUFFICIENT_FOR_SAFE_RESULT',
        hasResult: false,
      })
    ).toBe('EMPTY');

    expect(
      resolveToolPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: true,
        status: 'NOT_AVAILABLE',
        completeness: 'INCOMPLETE',
        hasResult: false,
      })
    ).toBe('PARTIAL');

    expect(
      resolveToolPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: true,
        status: 'VALID',
        completeness: 'SUFFICIENT_FOR_BASIC_RESULT',
        hasResult: true,
      })
    ).toBe('FULL');

    expect(
      resolveToolPilotPresentationStateV4({
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
      resolveToolPilotPresentationStateV4({
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
      resolveToolPilotPresentationStateV4({
        hasError: false,
        hasEnvelope: true,
        status: 'NOT_AVAILABLE',
        completeness: 'SUFFICIENT_FOR_BASIC_RESULT',
        hasResult: false,
      })
    ).toBe('UNAVAILABLE');
  });
});

describe('tool required-input progress counting', () => {
  it('counts provided values in canonical order without inventing entries', () => {
    expect(countProvidedToolFields([undefined, undefined])).toBe(0);
    expect(countProvidedToolFields([30, undefined])).toBe(1);
    expect(countProvidedToolFields([30, 70])).toBe(2);
    expect(countProvidedToolFields([70, null])).toBe(1);
  });
});
