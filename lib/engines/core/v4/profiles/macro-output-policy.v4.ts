/**
 * lib/engines/core/v4/profiles/macro-output-policy.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Batch B — Additive Macro V4 Output Policy
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Documents and type-checks the output rules that the accepted Macro adapter
 *  already follows. This file does not calculate, wrap, mutate, persist or
 *  transmit anything; Macro V6 remains the sole numeric authority.
 *
 *  Covered requirements:
 *  - M4-OUT-01: engine, equation and calculation identity.
 *  - M4-OUT-02 / M4-EV-04: result validity and invalidation policy.
 *  - M4-OUT-03: contract/schema compatibility.
 *  - M4-OUT-04: conditional evidence, assumptions and warning requirements.
 *  - M4-OUT-05: deterministic next-action policy (still empty).
 *  - M4-OUT-06: calculationId is operation identity, never an input fingerprint.
 *  - M4-OUT-07: auditRef remains absent until a confirmed storage write.
 *
 *  No React, DOM, clock, storage, network, AI, provider, fingerprint, hash,
 *  HMAC, salt, secret, database or persistence behavior.
 */

import type { ResultStatus, ResultValidity } from '../contracts.v4';
import { CONTRACT_VERSION, SCHEMA_VERSION } from '../contracts.v4';

export interface MacroEngineIdentityV4 {
  toolId: string;
  canonicalSlug: string;
  engineVersion: string;
  equationId: string;
  contractVersion: string;
  schemaVersion: string;
  adapterVersion: string;
}

/**
 * The adapter currently wraps Macro V6 and declares engineVersion `6.0.0`.
 * The equation identity is the unchanged Macro V6 equation id.
 */
export const MACRO_ENGINE_IDENTITY_V4: MacroEngineIdentityV4 = {
  toolId: 'mrx.tool.macro',
  canonicalSlug: 'macro',
  engineVersion: '6.0.0',
  equationId: 'mifflin-st-jeor-macro-v1',
  contractVersion: CONTRACT_VERSION,
  schemaVersion: SCHEMA_VERSION,
  adapterVersion: '1.0.0',
};

/** Accepted validity for a current, complete adapter result. */
export const MACRO_CURRENT_VALIDITY: ResultValidity = {
  status: 'CURRENT',
  invalidationTriggers: ['input_changed', 'engine_version_changed'],
};

/** Accepted validity for an empty or partial envelope with no result. */
export const MACRO_NOT_ASSESSED_VALIDITY: ResultValidity = {
  status: 'NOT_ASSESSED',
  invalidationTriggers: [],
};

export type MacroInvalidationCauseV4 = 'input_changed' | 'engine_version_changed';

/**
 * Resolve validity from explicit causes only. No universal expiry is defined
 * and no clock is read. Repeated causes are kept once, in first-seen order.
 */
export function resolveMacroResultValidity(
  causes: readonly MacroInvalidationCauseV4[]
): ResultValidity {
  const uniqueCauses = causes.filter(
    (cause, index) => causes.indexOf(cause) === index
  );

  if (uniqueCauses.length === 0) {
    return {
      status: MACRO_CURRENT_VALIDITY.status,
      invalidationTriggers: [...MACRO_CURRENT_VALIDITY.invalidationTriggers],
    };
  }

  return {
    status: 'INVALIDATED',
    invalidationTriggers: [...uniqueCauses],
  };
}

export type MacroNextActionsPolicyV4 = 'EMPTY_UNTIL_APPROVED';
export type MacroAuditRefPolicyV4 = 'ABSENT_UNTIL_CONFIRMED_WRITE';

/** No deterministic next action is approved for Macro yet. */
export const MACRO_NEXT_ACTIONS_POLICY: MacroNextActionsPolicyV4 = 'EMPTY_UNTIL_APPROVED';

/** R6 persistence is not authorized, so no audit reference may be emitted. */
export const MACRO_AUDIT_REF_POLICY: MacroAuditRefPolicyV4 = 'ABSENT_UNTIL_CONFIRMED_WRITE';

export interface MacroEnvelopeExpectationsV4 {
  requiresMifflinEvidence: boolean;
  requiresAssumptions: boolean;
  requiresDeterministicWarning: boolean;
  nextActions: MacroNextActionsPolicyV4;
  auditRef: MacroAuditRefPolicyV4;
}

/**
 * Conditional output expectations by result status.
 *
 * A calculated `VALID` result requires the Mifflin evidence, the engine
 * assumptions and the deterministic-calculation warning. Every non-calculating
 * state (`INVALID`, `NOT_AVAILABLE`, `DEGRADED`) must not fabricate them.
 * `DEGRADED` is a controlled mapping, not an engine output; if a future
 * degraded result carries engine output, this policy must be revised first.
 */
export function macroEnvelopeExpectationsFor(
  status: ResultStatus
): MacroEnvelopeExpectationsV4 {
  const calculated = status === 'VALID';

  return {
    requiresMifflinEvidence: calculated,
    requiresAssumptions: calculated,
    requiresDeterministicWarning: calculated,
    nextActions: MACRO_NEXT_ACTIONS_POLICY,
    auditRef: MACRO_AUDIT_REF_POLICY,
  };
}
