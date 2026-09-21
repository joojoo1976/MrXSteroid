/**
 * server/tools/toolLogService.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Supabase integration service for `public.user_tool_logs` — the shared
 *  persistence backbone of the 5-layer tool stack.
 * ═══════════════════════════════════════════════════════════════════════════
 * Conventions inherited from `server/dashboard/dashboardService.ts`:
 *   - `getSupabaseAdmin()` returns `null` (never throws) when credentials are
 *     absent, so the route degrades to a 503 instead of crashing the runtime.
 *   - snake_case rows in ↔ camelCase DTOs out.
 *   - Every query is scoped by `user_id` in addition to RLS (defence in depth
 *     against IDOR: the service-role client bypasses RLS policies).
 *
 * Snapshot semantics (spec §5):
 *   - `submitted_snapshot`      → append-only history (one row per commit).
 *   - `draft`                   → exactly one row per (user, tool), upserted.
 *   - `dashboard_projection`    → exactly one row per (user, tool), upserted.
 * The single-row rule for drafts/projections is also enforced in the database
 * by partial unique indexes (see the `create_user_tool_logs` migration).
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SnapshotType } from '../../lib/tools/contracts';
import type { ToolLogCommit } from '../../lib/tools/schemas/toolLogSchema';
import { getTool } from '../../lib/tools/registry';

export interface ToolLogRecord {
    id: string;
    userId: string;
    toolSlug: string;
    toolVersion: string;
    snapshotType: SnapshotType;
    /** Server-derived tier (see `lib/tools/registry.ts`) — never client-supplied. */
    accessTier: string;
    inputs: Record<string, unknown>;
    outputSnapshot: Record<string, unknown>;
    provenance: Record<string, unknown>;
    locale: string;
    unitSystem: string;
    createdAt: string;
    updatedAt: string;
}

export interface ToolLogQueryOptions {
    toolSlug?: string;
    snapshotType?: SnapshotType;
    limit?: number;
}

function getSupabaseAdmin(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

/** snake_case row → camelCase DTO. Returns `null` for malformed rows. */
export function mapToolLogRow(row: unknown): ToolLogRecord | null {
    if (!row || typeof row !== 'object') return null;
    const r = row as Record<string, unknown>;
    if (typeof r.id !== 'string' || typeof r.user_id !== 'string' || typeof r.tool_slug !== 'string') return null;
    return {
        id: r.id,
        userId: r.user_id,
        toolSlug: r.tool_slug,
        toolVersion: typeof r.tool_version === 'string' ? r.tool_version : '1.0.0',
        snapshotType: r.snapshot_type as SnapshotType,
        accessTier: typeof r.access_tier === 'string' ? r.access_tier : 'free',
        inputs: asRecord(r.inputs),
        outputSnapshot: asRecord(r.output_snapshot),
        provenance: asRecord(r.provenance),
        locale: typeof r.locale === 'string' ? r.locale : 'ar',
        unitSystem: typeof r.unit_system === 'string' ? r.unit_system : 'metric',
        createdAt: typeof r.created_at === 'string' ? r.created_at : '',
        updatedAt: typeof r.updated_at === 'string' ? r.updated_at : '',
    };
}

const toRow = (userId: string, commit: ToolLogCommit) => ({
    user_id: userId,
    tool_slug: commit.toolSlug,
    tool_version: commit.toolVersion,
    snapshot_type: commit.snapshotType,
    // Authoritative tier comes from the registry, never from the request body.
    access_tier: getTool(commit.toolSlug)?.accessTier ?? 'free',
    inputs: commit.inputs,
    output_snapshot: commit.outputSnapshot as unknown as Record<string, unknown>,
    provenance: commit.provenance as unknown as Record<string, unknown>,
    locale: commit.locale,
    unit_system: commit.unitSystem,
});

const isUniqueViolation = (error: { code?: string } | null): boolean => error?.code === '23505';

// ─────────────────────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upserts the single mutable row kind (`draft`, `dashboard_projection`).
 * Select-then-update is used instead of `ON CONFLICT` because the uniqueness
 * rule lives in a PARTIAL unique index, which PostgREST cannot infer — and the
 * index still acts as the last-resort guard (23505 → retry as an update).
 */
async function upsertSingleSnapshot(
    userId: string,
    commit: ToolLogCommit,
    client: SupabaseClient,
): Promise<ToolLogRecord | null> {
    const { data: existing, error: selectError } = await client
        .from('user_tool_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('tool_slug', commit.toolSlug)
        .eq('snapshot_type', commit.snapshotType)
        .maybeSingle();

    if (selectError) {
        console.warn('[ToolLogService] Lookup failed:', selectError.message);
        return null;
    }

    const row = toRow(userId, commit);

    if (existing?.id) {
        const { error: updateError } = await client
            .from('user_tool_logs')
            .update(row)
            .eq('id', existing.id)
            .eq('user_id', userId);
        if (updateError) {
            console.warn('[ToolLogService] Update failed:', updateError.message);
            return null;
        }
        return getToolLogById(userId, existing.id as string, client);
    }

    const { data: inserted, error: insertError } = await client
        .from('user_tool_logs')
        .insert(row)
        .select('*')
        .single();

    if (insertError) {
        if (isUniqueViolation(insertError)) {
            // Race: another writer created the row between SELECT and INSERT.
            const retry = await client
                .from('user_tool_logs')
                .update(row)
                .eq('user_id', userId)
                .eq('tool_slug', commit.toolSlug)
                .eq('snapshot_type', commit.snapshotType);
            if (retry.error) return null;
            const { data } = await client
                .from('user_tool_logs')
                .select('*')
                .eq('user_id', userId)
                .eq('tool_slug', commit.toolSlug)
                .eq('snapshot_type', commit.snapshotType)
                .maybeSingle();
            return mapToolLogRow(data);
        }
        console.warn('[ToolLogService] Insert failed:', insertError.message);
        return null;
    }

    return mapToolLogRow(inserted);
}

/**
 * Persists a validated commit.
 * `submitted_snapshot` is append-only history; `draft` and
 * `dashboard_projection` collapse onto one row per (user, tool).
 */
export async function saveToolLog(
    userId: string,
    commit: ToolLogCommit,
    client: SupabaseClient | null = getSupabaseAdmin(),
): Promise<ToolLogRecord | null> {
    if (!userId || !commit || !client) return null;

    try {
        if (commit.snapshotType === 'submitted_snapshot') {
            const { data, error } = await client
                .from('user_tool_logs')
                .insert(toRow(userId, commit))
                .select('*')
                .single();
            if (error) {
                console.warn('[ToolLogService] Insert submitted_snapshot failed:', error.message);
                return null;
            }
            return mapToolLogRow(data);
        }
        return await upsertSingleSnapshot(userId, commit, client);
    } catch (error) {
        console.error('[ToolLogService] saveToolLog failed:', error);
        return null;
    }
}

export interface DeleteToolLogResult {
    /** `false` only when the request could not be executed (no client / DB error). */
    ok: boolean;
    /** `false` when the row does not exist or belongs to another user. */
    deleted: boolean;
}

/**
 * Deletes one log row — always scoped by `user_id` (IDOR-safe).
 * `.select('id')` makes PostgREST return the deleted rows, so the caller can
 * distinguish "nothing matched" (404) from an execution failure (503).
 */
export async function deleteToolLog(
    userId: string,
    id: string,
    client: SupabaseClient | null = getSupabaseAdmin(),
): Promise<DeleteToolLogResult> {
    if (!userId || !id || !client) return { ok: false, deleted: false };
    try {
        const { data, error } = await client
            .from('user_tool_logs')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
            .select('id');

        if (error) {
            console.warn('[ToolLogService] Delete failed:', error.message);
            return { ok: false, deleted: false };
        }
        return { ok: true, deleted: Array.isArray(data) && data.length > 0 };
    } catch (error) {
        console.error('[ToolLogService] deleteToolLog failed:', error);
        return { ok: false, deleted: false };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/** History feed for one tool (or all tools), newest first. */
export async function listToolLogs(
    userId: string,
    options: ToolLogQueryOptions = {},
    client: SupabaseClient | null = getSupabaseAdmin(),
): Promise<ToolLogRecord[]> {
    if (!userId || !client) return [];
    const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

    try {
        let query = client
            .from('user_tool_logs')
            .select('*')
            .eq('user_id', userId);

        if (options.toolSlug) query = query.eq('tool_slug', options.toolSlug);
        if (options.snapshotType) query = query.eq('snapshot_type', options.snapshotType);

        const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);
        if (error) {
            console.warn('[ToolLogService] listToolLogs failed:', error.message);
            return [];
        }
        return (data ?? []).map(mapToolLogRow).filter((r): r is ToolLogRecord => r !== null);
    } catch (error) {
        console.error('[ToolLogService] listToolLogs threw:', error);
        return [];
    }
}

export async function getToolLogById(
    userId: string,
    id: string,
    client: SupabaseClient | null = getSupabaseAdmin(),
): Promise<ToolLogRecord | null> {
    if (!userId || !id || !client) return null;
    const { data, error } = await client
        .from('user_tool_logs')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
    if (error) return null;
    return mapToolLogRow(data);
}

/** Most recent row of any snapshot type for a single tool (draft restore). */
export async function getLatestToolLog(
    userId: string,
    toolSlug: string,
    client: SupabaseClient | null = getSupabaseAdmin(),
): Promise<ToolLogRecord | null> {
    if (!userId || !toolSlug || !client) return null;
    const { data, error } = await client
        .from('user_tool_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('tool_slug', toolSlug)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) return null;
    return mapToolLogRow(data);
}

/** The single live Bio-Dashboard row per tool (one row per user+tool by design). */
export async function getDashboardProjections(
    userId: string,
    client: SupabaseClient | null = getSupabaseAdmin(),
): Promise<ToolLogRecord[]> {
    return listToolLogs(userId, { snapshotType: 'dashboard_projection', limit: MAX_LIMIT }, client);
}

/**
 * Convenience composition used by the API route: writes a dashboard commit as
 * the permanent `submitted_snapshot` first, then refreshes the projection.
 */
export async function commitDashboardPair(
    userId: string,
    commit: ToolLogCommit,
    client: SupabaseClient | null = getSupabaseAdmin(),
): Promise<{ submitted: ToolLogRecord | null; projection: ToolLogRecord | null }> {
    const submitted = await saveToolLog(userId, { ...commit, snapshotType: 'submitted_snapshot' }, client);
    if (!submitted) return { submitted: null, projection: null };
    const projection = await saveToolLog(userId, { ...commit, snapshotType: 'dashboard_projection' }, client);
    return { submitted, projection };
}

