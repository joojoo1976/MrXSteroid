// lib/shared/audit-contract.ts
// Slice F — Audit and Approval Contracts (typed contracts only).
//
// Scope (G-R6.1-1): typed shapes for security/audit events and approval
// decisions, with a lightweight validator, so every security-relevant action
// has a traceable shape.
//
// OUT OF SCOPE for this slice (separate owner decision, not implemented here):
//   - durable audit persistence (database-backed storage remains unauthorized)
//   - writing to Supabase, RLS, or any production audit table
//
// This module is pure TypeScript: no I/O, no Supabase, no clock. Timestamps are
// injected by the caller. Safe to import during SSR and in unit tests.
export type AuditOutcome = 'allowed' | 'denied' | 'error';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export interface AuditActor {
  readonly actorId: string;
  readonly actorRole: string;
  readonly tenantId?: string;
}

export interface AuditScope {
  readonly toolId?: string;
  readonly resourceType: string;
  readonly resourceId: string;
}

export interface AuditEvent {
  readonly eventId: string;
  readonly timestamp: string; // ISO-8601 instant, injected by the caller
  readonly outcome: AuditOutcome;
  readonly action: string; // e.g. 'tool.calculate', 'snapshot.commit', 'approval.create'
  readonly actor: AuditActor;
  readonly scope: AuditScope;
  readonly evidenceRef?: string; // reference to supporting evidence (not the evidence itself)
  readonly metadata?: Record<string, unknown>;
}

export interface ApprovalDecision {
  readonly decisionId: string;
  readonly action: string;
  readonly status: ApprovalStatus;
  readonly decidedBy?: string;
  readonly decidedAt?: string; // ISO-8601 instant, injected by the caller
  readonly evidenceRef?: string;
  readonly reason?: string;
}

export interface AuditEventResultOk {
  readonly ok: true;
  readonly event: AuditEvent;
}
export interface AuditEventResultFail {
  readonly ok: false;
  readonly reason: 'shape';
  readonly detail: string;
}
export type AuditEventResult = AuditEventResultOk | AuditEventResultFail;

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const NON_EMPTY_STRING = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** Actions that require an explicit approval before execution. */
export const APPROVAL_REQUIRED_ACTIONS = new Set<string>([
  'snapshot.commit',
  'database.write',
  'provider.enable',
  'secret.access',
  'rule.override',
]);

/**
 * Fail-closed validator for an audit event shape. Never throws.
 */
export function validateAuditEvent(raw: unknown): AuditEventResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, reason: 'shape', detail: 'event must be an object' };
  }
  const e = raw as Partial<AuditEvent>;
  if (!NON_EMPTY_STRING(e.eventId)) {
    return { ok: false, reason: 'shape', detail: 'eventId is required' };
  }
  if (!NON_EMPTY_STRING(e.timestamp) || !ISO_TIMESTAMP.test(e.timestamp)) {
    return { ok: false, reason: 'shape', detail: 'timestamp must be ISO-8601' };
  }
  if (e.outcome !== 'allowed' && e.outcome !== 'denied' && e.outcome !== 'error') {
    return { ok: false, reason: 'shape', detail: 'outcome must be allowed/denied/error' };
  }
  if (!NON_EMPTY_STRING(e.action)) {
    return { ok: false, reason: 'shape', detail: 'action is required' };
  }
  if (!e.actor || typeof e.actor !== 'object' || !NON_EMPTY_STRING(e.actor.actorId)) {
    return { ok: false, reason: 'shape', detail: 'actor.actorId is required' };
  }
  if (!e.scope || typeof e.scope !== 'object' || !NON_EMPTY_STRING(e.scope.resourceType)) {
    return { ok: false, reason: 'shape', detail: 'scope.resourceType is required' };
  }
  if (!NON_EMPTY_STRING(e.scope.resourceId)) {
    return { ok: false, reason: 'shape', detail: 'scope.resourceId is required' };
  }
  return { ok: true, event: e as AuditEvent };
}

/** True when an action requires an explicit approval before execution. */
export function isApprovalRequired(action: string): boolean {
  return APPROVAL_REQUIRED_ACTIONS.has(action);
}

/** Validate an approval decision shape. */
export function validateApprovalDecision(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const d = raw as Partial<ApprovalDecision>;
  return (
    NON_EMPTY_STRING(d.decisionId) &&
    NON_EMPTY_STRING(d.action) &&
    (d.status === 'pending' || d.status === 'approved' || d.status === 'rejected' || d.status === 'blocked')
  );
}
