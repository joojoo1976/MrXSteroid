/**
 * lib/tools/adapters/toolLogAdapter.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Layer 3 — Persistence & AI Adapter (shared, tool-agnostic).
 * ═══════════════════════════════════════════════════════════════════════════
 * Responsibilities (spec §5):
 *   1. AUTO-DRAFT  — debounced local cache (localStorage), never the DB.
 *   2. COMMIT      — `draft` / `submitted_snapshot` / `dashboard_projection`
 *                    writes through `POST /api/tools/logs` (Bearer-authenticated).
 *   3. AI CONTEXT  — deterministic structured context for any LLM call.
 *
 * Storage, clock and fetch are INJECTED, so this module is fully testable in
 * the node environment and safe to import during SSR (no `window` access at
 * module scope, no `Date` read outside an injected timestamp).
 */
import {
    byteLength,
    formatProvenance,
    MAX_TOOL_LOG_BYTES,
    rankKeyFindings,
    type AccessTier,
    type DataProvenance,
    type KeyFinding,
    type Locale,
    type SnapshotType,
    type ToolOutput,
    type UnitSystem,
} from '../contracts';
import { requireTool } from '../registry';

/** Bump when the cached draft shape changes — old drafts are then discarded. */
export const DRAFT_SCHEMA_VERSION = 1;
/** Spec §5.2 — persistence fires only after this much input inactivity. */
export const AUTO_DRAFT_DEBOUNCE_MS = 1500;
/** Shared persistence endpoint (see `app/api/tools/logs/route.ts`). */
export const TOOL_LOG_ENDPOINT = '/api/tools/logs';
export const DRAFT_KEY_PREFIX = 'mrx:tool-draft';
/**
 * Byte cap, mirrored from the single source of truth in
 * `lib/tools/contracts.ts` — measured with `byteLength` (UTF-8), never with
 * `String.length`, otherwise Arabic payloads are under-reported by up to 2×.
 */
export const MAX_COMMIT_BYTES = MAX_TOOL_LOG_BYTES;

// ─────────────────────────────────────────────────────────────────────────────
// Storage indirection
// ─────────────────────────────────────────────────────────────────────────────

export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

/** Returns `localStorage` in the browser, `null` during SSR / locked storage. */
export function getBrowserStorage(): StorageLike | null {
    try {
        if (typeof window === 'undefined') return null;
        const storage = window.localStorage as StorageLike | undefined;
        return storage && typeof storage.getItem === 'function' ? storage : null;
    } catch {
        return null;
    }
}

/** Versioned, collision-free cache key: `mrx:tool-draft:v1:macro`. */
export function draftStorageKey(slugOrHref: string): string {
    return `${DRAFT_KEY_PREFIX}:v${DRAFT_SCHEMA_VERSION}:${requireTool(slugOrHref).slug}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Auto-draft (local cache)
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolDraft<TInputs> {
    version: number;
    toolSlug: string;
    toolVersion: string;
    savedAt: string;
    locale: Locale;
    unitSystem: UnitSystem;
    inputs: TInputs;
}

export interface SaveDraftOptions {
    locale: Locale;
    unitSystem: UnitSystem;
    /** ISO-8601 — injected so the write stays deterministic in tests. */
    savedAt: string;
    storage?: StorageLike | null;
}

/** Persists the live input state locally. Returns `false` on quota/SSR failure. */
export function saveDraft<TInputs>(slugOrHref: string, inputs: TInputs, options: SaveDraftOptions): boolean {
    const tool = requireTool(slugOrHref);
    const storage = options.storage ?? getBrowserStorage();
    if (!storage) return false;
    const draft: ToolDraft<TInputs> = {
        version: DRAFT_SCHEMA_VERSION,
        toolSlug: tool.slug,
        toolVersion: tool.version,
        savedAt: options.savedAt,
        locale: options.locale,
        unitSystem: options.unitSystem,
        inputs,
    };
    try {
        storage.setItem(draftStorageKey(tool.slug), JSON.stringify(draft));
        return true;
    } catch {
        return false;
    }
}

const isDraftShape = (value: unknown): value is ToolDraft<unknown> => {
    if (!value || typeof value !== 'object') return false;
    const d = value as Partial<ToolDraft<unknown>>;
    return (
        d.version === DRAFT_SCHEMA_VERSION &&
        typeof d.toolSlug === 'string' &&
        typeof d.savedAt === 'string' &&
        (d.locale === 'ar' || d.locale === 'en') &&
        (d.unitSystem === 'metric' || d.unitSystem === 'imperial') &&
        d.inputs !== undefined
    );
};

/**
 * Reads the cached draft. Returns `null` for missing, corrupt, stale-schema or
 * tool-mismatched payloads — never throws, so a bad cache cannot break a page.
 */
export function loadDraft<TInputs>(slugOrHref: string, storage?: StorageLike | null): ToolDraft<TInputs> | null {
    const tool = requireTool(slugOrHref);
    const store = storage ?? getBrowserStorage();
    if (!store) return null;
    try {
        const raw = store.getItem(draftStorageKey(tool.slug));
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        if (!isDraftShape(parsed) || parsed.toolSlug !== tool.slug) return null;
        return parsed as ToolDraft<TInputs>;
    } catch {
        return null;
    }
}

/** Clears the cached draft (called after a successful commit). */
export function clearDraft(slugOrHref: string, storage?: StorageLike | null): boolean {
    const tool = requireTool(slugOrHref);
    const store = storage ?? getBrowserStorage();
    if (!store) return false;
    try {
        store.removeItem(draftStorageKey(tool.slug));
        return true;
    } catch {
        return false;
    }
}

/** True once the user has been idle for at least the debounce window (§5.2). */
export function shouldAutoDraft(lastSavedAtMs: number, nowMs: number, debounceMs: number = AUTO_DRAFT_DEBOUNCE_MS): boolean {
    if (!Number.isFinite(lastSavedAtMs) || !Number.isFinite(nowMs)) return false;
    return nowMs - lastSavedAtMs >= debounceMs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Snapshot commit (Supabase via the API route)
// ─────────────────────────────────────────────────────────────────────────────

/** Exact request body accepted by `POST /api/tools/logs`. */
export interface ToolLogCommitPayload {
    toolSlug: string;
    toolVersion: string;
    snapshotType: SnapshotType;
    locale: Locale;
    unitSystem: UnitSystem;
    inputs: Record<string, unknown>;
    outputSnapshot: ToolOutput<unknown>;
    provenance: DataProvenance;
}

export interface CommitOptions {
    /** Supabase access token — required by the route (401 without it). */
    accessToken?: string | null;
    fetchImpl?: typeof fetch;
    endpoint?: string;
}

export interface CommitResult {
    ok: boolean;
    status?: number;
    id?: string;
    error?: string;
}

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : { value };

/**
 * Maps a tool output + its inputs onto the persisted row contract.
 * `dashboard_projection` commits are always written together with the
 * permanent `submitted_snapshot` (see `commitDashboardSnapshot`).
 */
export function buildCommitPayload<T>(
    output: ToolOutput<T>,
    inputs: unknown,
    snapshotType: SnapshotType = 'draft',
): ToolLogCommitPayload {
    const tool = requireTool(output.toolSlug);
    return {
        toolSlug: tool.slug,
        toolVersion: tool.version,
        snapshotType,
        locale: output.locale,
        unitSystem: output.unitSystem,
        inputs: toRecord(inputs),
        outputSnapshot: { ...output, snapshotType },
        provenance: output.provenance,
    };
}

/** `snapshot_type: 'submitted_snapshot'` — the permanent Bio-Dashboard record. */
export function buildSubmittedPayload<T>(output: ToolOutput<T>, inputs: unknown): ToolLogCommitPayload {
    return buildCommitPayload(output, inputs, 'submitted_snapshot');
}

/** `snapshot_type: 'dashboard_projection'` — the single live dashboard row. */
export function buildProjectionPayload<T>(output: ToolOutput<T>, inputs: unknown): ToolLogCommitPayload {
    return buildCommitPayload(output, inputs, 'dashboard_projection');
}

/**
 * POSTs a snapshot to the persistence endpoint.
 * Never throws: network, auth and validation failures all resolve to
 * `{ ok: false, error }` so callers can degrade gracefully to local draft only.
 */
export async function commitToolLog(
    payload: ToolLogCommitPayload,
    options: CommitOptions = {},
): Promise<CommitResult> {
    const fetchImpl = options.fetchImpl ?? (typeof fetch === 'function' ? fetch : null);
    if (!fetchImpl) return { ok: false, error: 'fetch is not available in this runtime' };

    let body: string;
    try {
        body = JSON.stringify(payload);
    } catch {
        return { ok: false, error: 'payload is not JSON-serializable' };
    }
    if (byteLength(body) > MAX_COMMIT_BYTES) {
        return { ok: false, error: `payload exceeds ${MAX_COMMIT_BYTES} bytes` };
    }

    try {
        const response = await fetchImpl(options.endpoint ?? TOOL_LOG_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
            },
            body,
        });

        if (!response.ok) {
            let message = `request failed with status ${response.status}`;
            try {
                const errorBody = (await response.json()) as { error?: string };
                if (errorBody?.error) message = errorBody.error;
            } catch {
                /* non-JSON error body — keep the status message */
            }
            return { ok: false, status: response.status, error: message };
        }

        const json = (await response.json()) as { ok?: boolean; id?: string };
        return { ok: json.ok !== false, status: response.status, id: json.id };
    } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'network error' };
    }
}

/**
 * Bio-Dashboard commit (§5.3): writes the permanent `submitted_snapshot` first
 * and only then refreshes the `dashboard_projection`, so a failed projection
 * can never leave the dashboard pointing at a snapshot that was never stored.
 */
export async function commitDashboardSnapshot<T>(
    output: ToolOutput<T>,
    inputs: unknown,
    options: CommitOptions = {},
): Promise<{ submitted: CommitResult; projection: CommitResult }> {
    const submitted = await commitToolLog(buildSubmittedPayload(output, inputs), options);
    if (!submitted.ok) return { submitted, projection: { ok: false, error: 'skipped: submitted_snapshot failed' } };
    const projection = await commitToolLog(buildProjectionPayload(output, inputs), options);
    return { submitted, projection };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Structured AI context
// ─────────────────────────────────────────────────────────────────────────────

/** Default cap on findings pushed into an LLM prompt (prompt-budget guard). */
export const AI_CONTEXT_MAX_FINDINGS = 5;

export interface AiToolContext<T> {
    toolId: string;
    toolSlug: string;
    calculatedAt: string;
    locale: Locale;
    unitSystem: UnitSystem;
    accessTier: AccessTier;
    snapshotType: SnapshotType;
    /** Human-auditable provenance line — the anti-hallucination anchor. */
    provenanceLine: string;
    /** Severity-ranked, capped findings (important → monitor → info). */
    findings: KeyFinding[];
    /** Compact, already-computed payload — the model must not recompute it. */
    values: T;
}

export interface AiContextOptions {
    maxFindings?: number;
}

/**
 * Deterministic, compact context object for any downstream LLM call.
 * Findings are severity-ranked and capped, and the exact computed values are
 * passed through so the model never re-derives numbers (no drift, no invention).
 */
export function buildAiContext<T>(output: ToolOutput<T>, options: AiContextOptions = {}): AiToolContext<T> {
    const maxFindings = options.maxFindings ?? AI_CONTEXT_MAX_FINDINGS;
    return {
        toolId: output.toolId,
        toolSlug: output.toolSlug,
        calculatedAt: output.calculatedAt,
        locale: output.locale,
        unitSystem: output.unitSystem,
        accessTier: output.accessTier,
        snapshotType: output.snapshotType,
        provenanceLine: formatProvenance(output.provenance),
        findings: rankKeyFindings(output.keyFindings).slice(0, Math.max(0, maxFindings)),
        values: output.result,
    };
}

/** Stable JSON serialization (2-space indent) for prompt embedding / logging. */
export function serializeAiContext<T>(context: AiToolContext<T>): string {
    return JSON.stringify(context, null, 2);
}

