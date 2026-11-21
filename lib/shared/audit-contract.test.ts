// lib/shared/audit-contract.test.ts
// Slice F — Audit and Approval Contracts (typed contracts only).
// Verifies audit event and approval-decision validation. No durable storage,
// no Supabase — contract shapes only.
import { describe, it, expect } from 'vitest';
import {
  validateAuditEvent,
  validateApprovalDecision,
  isApprovalRequired,
  APPROVAL_REQUIRED_ACTIONS,
  type AuditEvent,
  type ApprovalDecision,
} from './audit-contract';

const baseEvent: AuditEvent = {
  eventId: 'evt-1',
  timestamp: '2026-09-21T10:00:00.000Z',
  outcome: 'allowed',
  action: 'tool.calculate',
  actor: { actorId: 'actor-1', actorRole: 'admin', tenantId: 'tenant-alpha' },
  scope: {
    toolId: 'tool-016-half-life-calculator',
    resourceType: 'tool',
    resourceId: 'tool-016-half-life-calculator',
  },
  evidenceRef: 'ev-9',
};

const baseDecision: ApprovalDecision = {
  decisionId: 'dec-1',
  action: 'snapshot.commit',
  status: 'pending',
};

describe('Slice F — validateAuditEvent (fail-closed shape validation)', () => {
  it('accepts a well-formed audit event', () => {
    const result = validateAuditEvent(baseEvent);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.event.eventId).toBe('evt-1');
  });

  it('rejects non-object and missing eventId/timestamp/outcome', () => {
    expect(validateAuditEvent(null)).toMatchObject({ ok: false, reason: 'shape' });
    expect(validateAuditEvent({})).toMatchObject({ ok: false, reason: 'shape' });
    expect(
      validateAuditEvent({ ...baseEvent, eventId: '' }),
    ).toMatchObject({ ok: false, reason: 'shape' });
    expect(
      validateAuditEvent({ ...baseEvent, timestamp: 'not-a-date' as never }),
    ).toMatchObject({ ok: false, reason: 'shape' });
    expect(
      validateAuditEvent({ ...baseEvent, outcome: 'maybe' as never }),
    ).toMatchObject({ ok: false, reason: 'shape' });
  });

  it('rejects a missing action or actor.actorId', () => {
    expect(validateAuditEvent({ ...baseEvent, action: '' })).toMatchObject({
      ok: false,
      reason: 'shape',
    });
    expect(
      validateAuditEvent({
        ...baseEvent,
        actor: { ...baseEvent.actor, actorId: '' },
      }),
    ).toMatchObject({ ok: false, reason: 'shape' });
  });

  it('rejects a missing scope.resourceType or scope.resourceId', () => {
    expect(
      validateAuditEvent({
        ...baseEvent,
        scope: { ...baseEvent.scope, resourceType: '' },
      }),
    ).toMatchObject({ ok: false, reason: 'shape' });
    expect(
      validateAuditEvent({
        ...baseEvent,
        scope: { ...baseEvent.scope, resourceId: '' },
      }),
    ).toMatchObject({ ok: false, reason: 'shape' });
  });
});

describe('Slice F — approval decisions and required-action set', () => {
  it('validates approval decision shapes', () => {
    expect(validateApprovalDecision(baseDecision)).toBe(true);
    expect(validateApprovalDecision({ ...baseDecision, status: 'approved' })).toBe(
      true,
    );
    expect(validateApprovalDecision({ ...baseDecision, status: 'rejected' })).toBe(
      true,
    );
    expect(validateApprovalDecision({ ...baseDecision, status: 'blocked' })).toBe(
      true,
    );
    expect(
      validateApprovalDecision({ ...baseDecision, status: 'unknown' as never }),
    ).toBe(false);
    expect(validateApprovalDecision({})).toBe(false);
    expect(validateApprovalDecision(null)).toBe(false);
  });

  it('identifies approval-required actions', () => {
    expect(isApprovalRequired('snapshot.commit')).toBe(true);
    expect(isApprovalRequired('database.write')).toBe(true);
    expect(isApprovalRequired('provider.enable')).toBe(true);
    expect(isApprovalRequired('secret.access')).toBe(true);
    expect(isApprovalRequired('rule.override')).toBe(true);
    expect(isApprovalRequired('tool.calculate')).toBe(false);
    expect(isApprovalRequired('tool.read')).toBe(false);
  });

  it('lists the approval-required action set', () => {
    expect(APPROVAL_REQUIRED_ACTIONS.has('snapshot.commit')).toBe(true);
    expect(APPROVAL_REQUIRED_ACTIONS.size).toBeGreaterThanOrEqual(5);
  });
});
