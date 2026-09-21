/**
 * app/api/tools/logs/route.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Shared persistence endpoint for the 5-layer tool stack.
 * ═══════════════════════════════════════════════════════════════════════════
 *  GET    ?tool=<slug>&snapshotType=<type>&limit=<1..100>   → history feed
 *  POST   validated ToolLogCommit payload                    → snapshot write
 *  DELETE ?id=<uuid>                                          → remove one row
 *
 * Security posture:
 *   - Bearer token required on every verb (401 otherwise) via the shared
 *     `getUserFromRequest` helper — no anonymous writes.
 *   - The caller can only ever touch rows scoped to its own `user_id`; the
 *     client-supplied user id is never trusted (IDOR-safe).
 *   - Payloads are validated by `toolLogCommitSchema` (zero-trust boundary) and
 *     the `toolSlug` must exist in `TOOL_REGISTRY`.
 *   - Requests over 256 KB are rejected before parsing.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../server/affiliate/apiHelpers';
import { MAX_TOOL_LOG_BYTES, toolLogQuerySchema, tryParseToolLogCommit } from '../../../../lib/tools/schemas/toolLogSchema';
import { byteLength } from '../../../../lib/tools/contracts';
import { getTool } from '../../../../lib/tools/registry';
import { commitDashboardPair, deleteToolLog, listToolLogs, saveToolLog } from '../../../../server/tools/toolLogService';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

const badRequest = (error: string, details?: unknown) =>
    NextResponse.json({ error, ...(details ? { details } : {}) }, { status: 400 });

export async function GET(req: NextRequest) {
    const auth = await getUserFromRequest(req);
    if (!auth?.userId) return unauthorized();

    const parsed = toolLogQuerySchema.safeParse({
        tool: req.nextUrl.searchParams.get('tool') ?? undefined,
        snapshotType: req.nextUrl.searchParams.get('snapshotType') ?? undefined,
        limit: req.nextUrl.searchParams.get('limit') ?? undefined,
    });
    if (!parsed.success) {
        return badRequest('Invalid query parameters', parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })));
    }

    const logs = await listToolLogs(auth.userId, {
        toolSlug: parsed.data.tool,
        snapshotType: parsed.data.snapshotType,
        limit: parsed.data.limit,
    });

    return NextResponse.json({ ok: true, count: logs.length, logs });
}

export async function POST(req: NextRequest) {
    const auth = await getUserFromRequest(req);
    if (!auth?.userId) return unauthorized();

    // Cheap early rejection from the header, then an AUTHORITATIVE byte check on
    // the raw body — a hostile client can send a lying `content-length`, so the
    // header alone is never trusted (zero-trust boundary).
    const declaredLength = Number(req.headers.get('content-length') ?? 0);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_TOOL_LOG_BYTES) {
        return NextResponse.json({ error: `Payload exceeds ${MAX_TOOL_LOG_BYTES} bytes` }, { status: 413 });
    }

    let raw: string;
    try {
        raw = await req.text();
    } catch {
        return badRequest('Unable to read request body');
    }
    if (byteLength(raw) > MAX_TOOL_LOG_BYTES) {
        return NextResponse.json({ error: `Payload exceeds ${MAX_TOOL_LOG_BYTES} bytes` }, { status: 413 });
    }

    let body: unknown;
    try {
        body = JSON.parse(raw);
    } catch {
        return badRequest('Invalid JSON body');
    }

    const parsed = tryParseToolLogCommit(body);
    if (!parsed.ok) {
        return badRequest('Invalid tool log payload', parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })));
    }

    const commit = parsed.data;
    if (!getTool(commit.toolSlug)) {
        return badRequest(`Unknown toolSlug "${commit.toolSlug}" — not present in TOOL_REGISTRY`);
    }

    // §5.3: a Bio-Dashboard commit writes the permanent submitted_snapshot and
    // only then refreshes the single dashboard_projection row.
    if (commit.snapshotType === 'dashboard_projection') {
        const { submitted, projection } = await commitDashboardPair(auth.userId, commit);
        if (!submitted || !projection) {
            return NextResponse.json({ error: 'Failed to persist dashboard snapshot' }, { status: 503 });
        }
        return NextResponse.json({
            ok: true,
            toolSlug: commit.toolSlug,
            snapshotType: commit.snapshotType,
            id: projection.id,
            submittedId: submitted.id,
        });
    }

    const saved = await saveToolLog(auth.userId, commit);
    if (!saved) {
        return NextResponse.json({ error: 'Failed to persist tool log' }, { status: 503 });
    }

    return NextResponse.json({ ok: true, id: saved.id, toolSlug: saved.toolSlug, snapshotType: saved.snapshotType });
}

export async function DELETE(req: NextRequest) {
    const auth = await getUserFromRequest(req);
    if (!auth?.userId) return unauthorized();

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return badRequest('Missing "id" query parameter');

    const deleted = await deleteToolLog(auth.userId, id);
    if (!deleted.ok) return NextResponse.json({ error: 'Failed to delete tool log' }, { status: 503 });
    // 404 for both "missing" and "belongs to another user" — never leak existence.
    if (!deleted.deleted) return NextResponse.json({ error: 'Tool log not found' }, { status: 404 });

    return NextResponse.json({ ok: true, id });
}
