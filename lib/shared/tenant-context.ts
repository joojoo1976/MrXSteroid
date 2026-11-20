// lib/shared/tenant-context.ts
// Slice D — Tenant Isolation Foundation (application-layer contract only).
//
// Scope (G-R6.1-1): define the tenant/security context shape and a fail-closed
// validator so no tool or route can act on an absent, invalid or mismatched
// tenant identity.
//
// OUT OF SCOPE for this slice (separate owner decision, not implemented here):
//   - wiring to a server-side authentication boundary (NextAuth / middleware / route)
//   - any database write, Supabase call, RLS policy or production data access
//   - session issuance, cookie handling or cloud sync (W18 remains blocked)
//
// This module is pure TypeScript: no `window`, no `Date`, no I/O, no Supabase.
// It is safe to import during SSR and in unit tests.
export type TenantActorRole =
  | 'owner'
  | 'admin'
  | 'developer'
  | 'reviewer'
  | 'support'
  | 'user';

export interface TenantContext {
  readonly tenantId: string;      // trusted tenant identifier (never client-supplied as authorization)
  readonly actorId: string;       // authenticated actor
  readonly actorRole: TenantActorRole;
  readonly authenticatedAt: string; // ISO-8601 instant, injected by the auth boundary
  readonly source: 'session' | 'api-key' | 'service';
}

export interface TenantContextResultOk {
  readonly ok: true;
  readonly context: TenantContext;
}
export interface TenantContextResultFail {
  readonly ok: false;
  readonly reason: 'missing' | 'invalid' | 'expired';
}
export type TenantContextResult = TenantContextResultOk | TenantContextResultFail;

/** Canonical roles, single source of truth for IAM checks elsewhere. */
export const TENANT_ACTOR_ROLES: TenantActorRole[] = [
  'owner', 'admin', 'developer', 'reviewer', 'support', 'user',
];

/** Roles that may authorise mutation of tenant-scoped data. */
export const MUTATION_ROLES: TenantActorRole[] = ['owner', 'admin', 'developer'];

const isTenantActorRole = (value: unknown): value is TenantActorRole =>
  typeof value === 'string' && TENANT_ACTOR_ROLES.includes(value as TenantActorRole);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Fail-closed validator for a tenant/security context.
 * Returns { ok: false } for missing, invalid or expired context — never throws,
 * so a bad context can never be mistaken for authorization.
 */
export function validateTenantContext(raw: unknown): TenantContextResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, reason: 'missing' };
  }
  const c = raw as Partial<TenantContext>;
  if (!isNonEmptyString(c.tenantId)) return { ok: false, reason: 'missing' };
  if (!isNonEmptyString(c.actorId)) return { ok: false, reason: 'missing' };
  if (!isTenantActorRole(c.actorRole)) return { ok: false, reason: 'invalid' };
  if (!isNonEmptyString(c.authenticatedAt) || !ISO_TIMESTAMP.test(c.authenticatedAt)) {
    return { ok: false, reason: 'invalid' };
  }
  if (c.source !== 'session' && c.source !== 'api-key' && c.source !== 'service') {
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true, context: c as TenantContext };
}

/**
 * Strict accessor: throws on missing or invalid context. Use at authorization
 * boundaries where proceeding without a trusted tenant is unsafe.
 */
export function assertTenantContext(raw: unknown): TenantContext {
  const result = validateTenantContext(raw);
  if (!result.ok) {
    throw new Error(`Tenant context rejected: ${result.reason}`);
  }
  return result.context;
}

/** True when two contexts belong to different tenants (cross-tenant guard). */
export function isCrossTenant(a: TenantContext, b: TenantContext): boolean {
  return a.tenantId !== b.tenantId;
}

/** True when the actor may perform a mutation on tenant-scoped data. */
export function canMutate(context: TenantContext): boolean {
  return MUTATION_ROLES.includes(context.actorRole);
}
