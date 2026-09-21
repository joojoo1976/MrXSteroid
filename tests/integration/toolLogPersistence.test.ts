/**
 * tests/integration/toolLogPersistence.test.ts
 *
 * Integration tests for the shared tool-log persistence path:
 *   service layer (`server/tools/toolLogService.ts`)
 *   HTTP layer    (`app/api/tools/logs/route.ts`)
 *
 * All Supabase traffic is served by the shared in-memory fake; auth is mocked so
 * no live project or JWT is required.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createInMemorySupabase } from '../helpers/inMemorySupabase';
import { buildToolOutput } from '../../lib/tools/registry';
import { buildCommitPayload } from '../../lib/tools/adapters/toolLogAdapter';
import {
    commitDashboardPair,
    deleteToolLog,
    getDashboardProjections,
    getToolLogById,
    listToolLogs,
    mapToolLogRow,
    saveToolLog,
} from '../../server/tools/toolLogService';
import type { ToolLogCommit } from '../../lib/tools/schemas/toolLogSchema';
import type { DataProvenance } from '../../lib/tools/contracts';

const USER_A = 'aaaaaaaa-0000-0000-0000-000000000001';
const USER_B = 'bbbbbbbb-0000-0000-0000-000000000002';

let fake = createInMemorySupabase();
let client = fake.createClientMock();
let authedUser: string | null = USER_A;

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => client),
}));

vi.mock('../../server/affiliate/apiHelpers', () => ({
    getUserFromRequest: vi.fn(async () => (authedUser ? { userId: authedUser } : null)),
}));

const provenance: DataProvenance = {
    source: 'manual',
    recordedAt: '2026-09-21T10:00:00.000Z',
    timezone: 'Africa/Cairo',
    unit: 'kg',
    confidence: 0.95,
    dataQuality: 'high',
};

const commitFor = (snapshotType: ToolLogCommit['snapshotType'], inputs: Record<string, unknown> = { weightKg: 82 }): ToolLogCommit => {
    const output = buildToolOutput('macro', {
        calculatedAt: '2026-09-21T10:00:00.000Z',
        locale: 'ar',
        unitSystem: 'metric',
        snapshotType,
        result: { tdee: 2600, proteinG: 205 },
        provenance,
        keyFindings: [
            { code: 'LOW_HCT', labelAr: 'هيماتوكريت منخفض', labelEn: 'Low hematocrit', value: 38, severity: 'important' },
        ],
    });
    return buildCommitPayload(output, inputs, snapshotType);
};

const rows = (): Array<Record<string, unknown>> => (fake.tables.user_tool_logs ?? []).filter(Boolean);
const rowsOf = (type: string) => rows().filter((r) => r.snapshot_type === type);

const post = (body: unknown) =>
    new NextRequest('http://localhost:3000/api/tools/logs', {
        method: 'POST',
        headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });

beforeEach(() => {
    fake = createInMemorySupabase();
    client = fake.createClientMock();
    authedUser = USER_A;
    process.env.SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
});

describe('Tool log service — snapshot semantics', () => {
    it('writes a draft row scoped to the user with a registry-derived tier', async () => {
        const saved = await saveToolLog(USER_A, commitFor('draft'));

        expect(saved).not.toBeNull();
        expect(saved?.snapshotType).toBe('draft');
        expect(saved?.userId).toBe(USER_A);
        expect(saved?.accessTier).toBe('free');
        expect(rows()).toHaveLength(1);
        expect(rows()[0].tool_slug).toBe('macro');
    });

    it('collapses repeated drafts onto a single row (upsert, not append)', async () => {
        await saveToolLog(USER_A, commitFor('draft', { weightKg: 82 }));
        const second = await saveToolLog(USER_A, commitFor('draft', { weightKg: 90 }));

        expect(rowsOf('draft')).toHaveLength(1);
        expect(second?.inputs).toEqual({ weightKg: 90 });
    });

    it('appends submitted snapshots as permanent history', async () => {
        await saveToolLog(USER_A, commitFor('submitted_snapshot'));
        await saveToolLog(USER_A, commitFor('submitted_snapshot'));

        expect(rowsOf('submitted_snapshot')).toHaveLength(2);
    });

    it('writes the submitted snapshot before the projection and keeps one projection', async () => {
        await commitDashboardPair(USER_A, commitFor('dashboard_projection'));
        await commitDashboardPair(USER_A, commitFor('dashboard_projection'));

        expect(rowsOf('submitted_snapshot')).toHaveLength(2);
        expect(rowsOf('dashboard_projection')).toHaveLength(1);

        const projections = await getDashboardProjections(USER_A);
        expect(projections).toHaveLength(1);
        expect(projections[0].toolSlug).toBe('macro');
    });

    it('keeps per-user isolation on read, delete and empty user ids', async () => {
        const saved = await saveToolLog(USER_A, commitFor('draft'));
        await saveToolLog(USER_B, commitFor('draft'));

        expect(await listToolLogs(USER_A)).toHaveLength(1);
        expect(await listToolLogs(USER_B)).toHaveLength(1);

        expect(await getToolLogById(USER_B, saved?.id ?? '')).toBeNull();
        expect(await getToolLogById(USER_A, saved?.id ?? '')).not.toBeNull();

        // USER_B cannot delete USER_A's row (idempotent no-op, row survives).
        expect(await deleteToolLog(USER_B, saved?.id ?? '')).toEqual({ ok: true, deleted: false });
        expect(rows()).toHaveLength(2);
        expect(await deleteToolLog(USER_A, saved?.id ?? '')).toEqual({ ok: true, deleted: true });

        expect(await saveToolLog('', commitFor('draft'))).toBeNull();
        expect(await listToolLogs('')).toEqual([]);
        expect(await deleteToolLog(USER_A, '')).toEqual({ ok: false, deleted: false });
    });

    it('rejects malformed rows instead of trusting them', () => {
        expect(mapToolLogRow(null)).toBeNull();
        expect(mapToolLogRow({ id: 'x' })).toBeNull();
        expect(mapToolLogRow({ id: 'x', user_id: USER_A, tool_slug: 'macro' })).toMatchObject({
            toolVersion: '1.0.0',
            locale: 'ar',
            unitSystem: 'metric',
            accessTier: 'free',
        });
    });
});

describe('API /api/tools/logs — HTTP contract', () => {
    it('persists a draft commit for the authenticated user', async () => {
        const { POST } = await import('../../app/api/tools/logs/route');
        const response = await POST(post(commitFor('draft')));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toMatchObject({ ok: true, toolSlug: 'macro', snapshotType: 'draft' });
        expect(typeof body.id).toBe('string');
        expect(rowsOf('draft')).toHaveLength(1);
        expect(rows()[0].user_id).toBe(USER_A);
        expect(rows()[0].access_tier).toBe('free');
    });

    it('writes the submitted snapshot plus the projection for a dashboard commit', async () => {
        const { POST } = await import('../../app/api/tools/logs/route');
        const response = await POST(post(commitFor('dashboard_projection')));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.snapshotType).toBe('dashboard_projection');
        expect(typeof body.submittedId).toBe('string');
        expect(rowsOf('submitted_snapshot')).toHaveLength(1);
        expect(rowsOf('dashboard_projection')).toHaveLength(1);
    });

    it('rejects invalid payloads, unknown tools and malformed JSON with 400', async () => {
        const { POST } = await import('../../app/api/tools/logs/route');

        const badSnapshot = commitFor('draft') as unknown as Record<string, unknown>;
        badSnapshot.snapshotType = 'archived';
        const invalid = await POST(post(badSnapshot));
        expect(invalid.status).toBe(400);
        expect((await invalid.json()).details.length).toBeGreaterThan(0);

        const unknownTool = commitFor('draft') as unknown as Record<string, unknown>;
        unknownTool.toolSlug = 'ghost-tool';
        unknownTool.outputSnapshot = { ...(unknownTool.outputSnapshot as Record<string, unknown>), toolSlug: 'ghost-tool' };
        const ghost = await POST(post(unknownTool));
        expect(ghost.status).toBe(400);
        expect((await ghost.json()).error).toContain('Unknown toolSlug');

        const malformed = await POST(new NextRequest('http://localhost:3000/api/tools/logs', {
            method: 'POST',
            headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
            body: '{not-json',
        }));
        expect(malformed.status).toBe(400);
        expect(rows()).toHaveLength(0);
    });

    it('requires authentication on every verb', async () => {
        const { DELETE, GET, POST } = await import('../../app/api/tools/logs/route');
        authedUser = null;

        expect((await GET(new NextRequest('http://localhost:3000/api/tools/logs'))).status).toBe(401);
        expect((await POST(post(commitFor('draft')))).status).toBe(401);
        expect((await DELETE(new NextRequest('http://localhost:3000/api/tools/logs?id=x', { method: 'DELETE' }))).status).toBe(401);
        expect(rows()).toHaveLength(0);
    });

    it('returns the history feed and validates the query contract', async () => {
        const { GET, POST } = await import('../../app/api/tools/logs/route');
        await POST(post(commitFor('submitted_snapshot')));
        await POST(post(commitFor('draft')));

        const ok = await GET(new NextRequest('http://localhost:3000/api/tools/logs?tool=macro&limit=10', {
            headers: { authorization: 'Bearer test-token' },
        }));
        const payload = await ok.json();
        expect(ok.status).toBe(200);
        expect(payload.ok).toBe(true);
        expect(payload.count).toBe(2);
        expect(payload.logs[0]).toHaveProperty('toolSlug', 'macro');

        const filtered = await GET(new NextRequest('http://localhost:3000/api/tools/logs?snapshotType=draft', {
            headers: { authorization: 'Bearer test-token' },
        }));
        expect((await filtered.json()).count).toBe(1);

        const badSlug = await GET(new NextRequest('http://localhost:3000/api/tools/logs?tool=Bad%20Slug', {
            headers: { authorization: 'Bearer test-token' },
        }));
        expect(badSlug.status).toBe(400);

        const badLimit = await GET(new NextRequest('http://localhost:3000/api/tools/logs?limit=0', {
            headers: { authorization: 'Bearer test-token' },
        }));
        expect(badLimit.status).toBe(400);
    });

    it('deletes only the caller own row', async () => {
        const { DELETE, POST } = await import('../../app/api/tools/logs/route');
        const created = await (await POST(post(commitFor('draft')))).json();

        const missingId = await DELETE(new NextRequest('http://localhost:3000/api/tools/logs', {
            method: 'DELETE',
            headers: { authorization: 'Bearer test-token' },
        }));
        expect(missingId.status).toBe(400);

        authedUser = USER_B;
        const foreign = await DELETE(new NextRequest(`http://localhost:3000/api/tools/logs?id=${created.id}`, {
            method: 'DELETE',
            headers: { authorization: 'Bearer test-token' },
        }));
        expect(foreign.status).toBe(404); // exists, but never another user's row
        expect(rows()).toHaveLength(1);

        authedUser = USER_A;
        const own = await DELETE(new NextRequest(`http://localhost:3000/api/tools/logs?id=${created.id}`, {
            method: 'DELETE',
            headers: { authorization: 'Bearer test-token' },
        }));
        expect(own.status).toBe(200);
        expect(rows()).toHaveLength(0);

        const again = await DELETE(new NextRequest(`http://localhost:3000/api/tools/logs?id=${created.id}`, {
            method: 'DELETE',
            headers: { authorization: 'Bearer test-token' },
        }));
        expect(again.status).toBe(404); // repeat delete is a clean not-found
    });
});
