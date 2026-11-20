// lib/shared/tenant-context.test.ts
// Slice D — Tenant Isolation Foundation (application-layer contract only).
// Verifies the fail-closed tenant context validator. No database, no Supabase,
// no auth wiring — contract shape and validation behaviour only.
import { describe, it, expect } from 'vitest';
import {
  validateTenantContext,
  assertTenantContext,
  isCrossTenant,
  canMutate,
  TENANT_ACTOR_ROLES,
  type TenantContext,
} from './tenant-context';

const baseContext: TenantContext = {
  tenantId: 'tenant-alpha',
  actorId: 'actor-1',
  actorRole: 'admin',
  authenticatedAt: '2026-09-21T10:00:00.000Z',
  source: 'session',
};

describe('Slice D — validateTenantContext (fail-closed)', () => {
  it('accepts a well-formed tenant context', () => {
    const result = validateTenantContext(baseContext);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.context.tenantId).toBe('tenant-alpha');
  });

  it('rejects missing context', () => {
    expect(validateTenantContext(null)).toEqual({ ok: false, reason: 'missing' });
    expect(validateTenantContext(undefined)).toEqual({ ok: false, reason: 'missing' });
    expect(validateTenantContext('not-an-object')).toEqual({ ok: false, reason: 'missing' });
    expect(validateTenantContext({})).toEqual({ ok: false, reason: 'missing' });
  });

  it('rejects missing tenantId or actorId', () => {
    expect(validateTenantContext({ ...baseContext, tenantId: '' })).toEqual({
      ok: false, reason: 'missing',
    });
    expect(validateTenantContext({ ...baseContext, actorId: '' })).toEqual({
      ok: false, reason: 'missing',
    });
  });

  it('rejects an invalid actor role', () => {
    const result = validateTenantContext({ ...baseContext, actorRole: 'god' as never });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid');
  });

  it('rejects an invalid timestamp', () => {
    const result = validateTenantContext({ ...baseContext, authenticatedAt: 'not-a-date' as never });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid');
  });

  it('rejects an invalid source', () => {
    const result = validateTenantContext({ ...baseContext, source: 'client' as never });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid');
  });
});

describe('Slice D — assertTenantContext (strict accessor)', () => {
  it('returns the context for valid input', () => {
    expect(assertTenantContext(baseContext)).toBe(baseContext);
  });

  it('throws for invalid context', () => {
    expect(() => assertTenantContext({})).toThrow(/Tenant context rejected/);
  });
});

describe('Slice D — cross-tenant guard and mutation roles', () => {
  const otherTenant: TenantContext = { ...baseContext, tenantId: 'tenant-beta' };

  it('detects cross-tenant contexts', () => {
    expect(isCrossTenant(baseContext, otherTenant)).toBe(true);
    expect(isCrossTenant(baseContext, { ...baseContext })).toBe(false);
  });

  it('allows mutation for owner/admin/developer only', () => {
    for (const role of ['owner', 'admin', 'developer']) {
      expect(canMutate({ ...baseContext, actorRole: role })).toBe(true);
    }
    for (const role of ['reviewer', 'support', 'user']) {
      expect(canMutate({ ...baseContext, actorRole: role })).toBe(false);
    }
  });

  it('lists all canonical actor roles', () => {
    expect(TENANT_ACTOR_ROLES).toEqual([
      'owner', 'admin', 'developer', 'reviewer', 'support', 'user',
    ]);
  });
});
