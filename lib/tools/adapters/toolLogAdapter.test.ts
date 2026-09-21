/**
 * lib/tools/adapters/toolLogAdapter.test.ts
 * Layer 3 tests — local draft cache, commit protocol (§5.2/§5.3) and AI context
 * generation. Storage, clock and fetch are all injected, so nothing here touches
 * the network, localStorage or the wall clock.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildToolOutput, TOOL_REGISTRY } from '../registry';
import type { DataProvenance, ToolOutput } from '../contracts';
import {
    AI_CONTEXT_MAX_FINDINGS,
    AUTO_DRAFT_DEBOUNCE_MS,
    MAX_COMMIT_BYTES,
    buildAiContext,
    buildCommitPayload,
    buildProjectionPayload,
    buildSubmittedPayload,
    clearDraft,
    commitDashboardSnapshot,
    commitToolLog,
    draftStorageKey,
    getBrowserStorage,
    loadDraft,
    saveDraft,
    serializeAiContext,
    shouldAutoDraft,
    type StorageLike,
} from './toolLogAdapter';
import { byteLength } from '../contracts';

const registryAvailable = TOOL_REGISTRY.length > 0; // registry must be importable in node

const provenance: DataProvenance = {
    source: 'manual',
    recordedAt: '2026-09-21T10:00:00.000Z',
    timezone: 'Africa/Cairo',
    unit: 'kg',
    originalUnit: 'lb',
    confidence: 0.95,
    dataQuality: 'high',
};

function createMemoryStorage(): StorageLike & { map: Map<string, string> } {
    const map = new Map<string, string>();
    return {
        map,
        getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
        setItem: (key: string, value: string) => { map.set(key, value); },
        removeItem: (key: string) => { map.delete(key); },
    };
}

const buildOutput = (snapshotType: ToolOutput['snapshotType'] = 'draft'): ToolOutput<{ tdee: number }> =>
    buildToolOutput('macro', {
        calculatedAt: '2026-09-21T10:00:00.000Z',
        locale: 'ar',
        unitSystem: 'metric',
        snapshotType,
        result: { tdee: 2600 },
        provenance,
        keyFindings: [
            { code: 'LOW_HCT', labelAr: 'هيماتوكريت منخفض', labelEn: 'Low hematocrit', value: 38, severity: 'important' },
            { code: 'TIP', labelAr: 'نصيحة', labelEn: 'Tip', value: 'ok', severity: 'info' },
            { code: 'WATCH', labelAr: 'مراقبة', labelEn: 'Watch', value: 1, severity: 'monitor' },
        ],
    });

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Layer 3 — registry wiring guard', () => {
    it('has tools to exercise the adapter against', () => {
        expect(registryAvailable).toBe(true);
    });
});

describe('Layer 3 — auto-draft local cache (§5.2)', () => {
    it('round-trips a draft through an injected storage', () => {
        const storage = createMemoryStorage();
        const saved = saveDraft('macro', { weightKg: 82, goal: 'cut' }, {
            locale: 'ar',
            unitSystem: 'metric',
            savedAt: '2026-09-21T09:59:00.000Z',
            storage,
        });

        expect(saved).toBe(true);
        expect(storage.map.has('mrx:tool-draft:v1:macro')).toBe(true);

        const draft = loadDraft<{ weightKg: number; goal: string }>('macro', storage);
        expect(draft).not.toBeNull();
        expect(draft?.toolSlug).toBe('macro');
        expect(draft?.toolVersion).toBe('1.0.0');
        expect(draft?.inputs).toEqual({ weightKg: 82, goal: 'cut' });
        expect(draft?.savedAt).toBe('2026-09-21T09:59:00.000Z');
    });

    it('clears the draft after a commit', () => {
        const storage = createMemoryStorage();
        saveDraft('macro', { a: 1 }, { locale: 'en', unitSystem: 'imperial', savedAt: '2026-09-21T10:00:00.000Z', storage });
        expect(clearDraft('macro', storage)).toBe(true);
        expect(loadDraft('macro', storage)).toBeNull();
    });

    it('degrades to a no-op when storage is unavailable (SSR)', () => {
        expect(saveDraft('macro', { a: 1 }, { locale: 'ar', unitSystem: 'metric', savedAt: '2026-09-21T10:00:00.000Z', storage: null })).toBe(false);
        expect(loadDraft('macro', null)).toBeNull();
        expect(clearDraft('macro', null)).toBe(false);
        expect(getBrowserStorage()).toBeNull();
    });

    it('discards corrupt, stale-version and tool-mismatched drafts', () => {
        const storage = createMemoryStorage();
        const key = draftStorageKey('macro');

        storage.map.set(key, '{not-json');
        expect(loadDraft('macro', storage)).toBeNull();

        storage.map.set(key, JSON.stringify({
            version: 99, toolSlug: 'macro', savedAt: '2026-09-21T10:00:00.000Z', locale: 'ar', unitSystem: 'metric', inputs: { a: 1 },
        }));
        expect(loadDraft('macro', storage)).toBeNull();

        storage.map.set(key, JSON.stringify({
            version: 1, toolSlug: 'bodyfat', savedAt: '2026-09-21T10:00:00.000Z', locale: 'ar', unitSystem: 'metric', inputs: { a: 1 },
        }));
        expect(loadDraft('macro', storage)).toBeNull();
    });

    it('fires only after the 1500 ms inactivity window', () => {
        expect(AUTO_DRAFT_DEBOUNCE_MS).toBe(1500);
        expect(shouldAutoDraft(0, 1499)).toBe(false);
        expect(shouldAutoDraft(0, 1500)).toBe(true);
        expect(shouldAutoDraft(5_000, 7_000)).toBe(true);
        expect(shouldAutoDraft(Number.NaN, 5_000)).toBe(false);
    });
});

describe('Layer 3 — commit payload contract (§5.3)', () => {
    it('maps a tool output onto the persisted row shape (draft by default)', () => {
        const payload = buildCommitPayload(buildOutput(), { weightKg: 82 });

        expect(payload.snapshotType).toBe('draft');
        expect(payload.toolSlug).toBe('macro');
        expect(payload.toolVersion).toBe('1.0.0');
        expect(payload.locale).toBe('ar');
        expect(payload.unitSystem).toBe('metric');
        expect(payload.inputs).toEqual({ weightKg: 82 });
        expect(payload.outputSnapshot.snapshotType).toBe('draft');
        expect(payload.provenance.source).toBe('manual');
    });

    it('builds the permanent submitted snapshot and the live projection', () => {
        expect(buildSubmittedPayload(buildOutput(), {}).snapshotType).toBe('submitted_snapshot');
        expect(buildProjectionPayload(buildOutput(), {}).snapshotType).toBe('dashboard_projection');
    });

    it('wraps non-object inputs instead of silently dropping them', () => {
        expect(buildCommitPayload(buildOutput(), 'raw-string').inputs).toEqual({ value: 'raw-string' });
        expect(buildCommitPayload(buildOutput(), [1, 2, 3]).inputs).toEqual({ value: [1, 2, 3] });
        expect(buildCommitPayload(buildOutput(), undefined).inputs).toEqual({ value: undefined });
    });

    it('rejects an unregistered tool slug', () => {
        const ghost = { ...buildOutput(), toolSlug: 'ghost-tool' } as ToolOutput<{ tdee: number }>;
        expect(() => buildCommitPayload(ghost, {})).toThrow(/unknown tool/);
    });
});

describe('Layer 3 — network commit behaviour', () => {
    const fetchOk = () => vi.fn(async () => new Response(JSON.stringify({ ok: true, id: 'log-1' }), { status: 200 }));

    it('POSTs the payload with a Bearer token and maps the response id', async () => {
        const fetchImpl = fetchOk();
        const payload = buildCommitPayload(buildOutput(), { weightKg: 82 });

        const result = await commitToolLog(payload, { accessToken: 'jwt-token', fetchImpl });

        expect(result).toEqual({ ok: true, status: 200, id: 'log-1' });
        const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toBe('/api/tools/logs');
        expect(init.method).toBe('POST');
        expect((init.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token');
        expect(JSON.parse(String(init.body)).toolSlug).toBe('macro');
    });

    it('surfaces the server error message on a rejected commit', async () => {
        const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: 'Invalid tool log payload' }), { status: 400 }));
        const result = await commitToolLog(buildCommitPayload(buildOutput(), {}), { fetchImpl });

        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.error).toBe('Invalid tool log payload');
    });

    it('falls back to the status message for a non-JSON error body', async () => {
        const fetchImpl = vi.fn(async () => new Response('<html>gateway</html>', { status: 502 }));
        const result = await commitToolLog(buildCommitPayload(buildOutput(), {}), { fetchImpl });

        expect(result.ok).toBe(false);
        expect(result.error).toContain('502');
    });

    it('never throws on a network failure', async () => {
        const fetchImpl = vi.fn(async () => { throw new Error('offline'); });
        const result = await commitToolLog(buildCommitPayload(buildOutput(), {}), { fetchImpl });

        expect(result).toEqual({ ok: false, error: 'offline' });
    });

    it('reports a missing fetch implementation and an oversized payload', async () => {
        vi.stubGlobal('fetch', undefined);
        expect((await commitToolLog(buildCommitPayload(buildOutput(), {}))).error)
            .toBe('fetch is not available in this runtime');

        const huge = { blob: 'x'.repeat(MAX_COMMIT_BYTES) };
        const result = await commitToolLog(buildCommitPayload(buildOutput(), huge), { fetchImpl: fetchOk() });
        expect(result.ok).toBe(false);
        expect(result.error).toContain('exceeds');
    });

    it('measures the cap in UTF-8 BYTES, so Arabic payloads cannot slip through', async () => {
        // ~140k Arabic characters ≈ 280 KB in UTF-8 but only ~140k by String.length.
        const arabicBlob = 'م'.repeat(140_000);
        expect(arabicBlob.length).toBeLessThan(MAX_COMMIT_BYTES);
        expect(byteLength(JSON.stringify({ blob: arabicBlob }))).toBeGreaterThan(MAX_COMMIT_BYTES);

        const result = await commitToolLog(buildCommitPayload(buildOutput(), { blob: arabicBlob }), { fetchImpl: fetchOk() });
        expect(result.ok).toBe(false);
        expect(result.error).toContain('exceeds');
    });

    it('writes submitted_snapshot before dashboard_projection', async () => {
        const seen: string[] = [];
        const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
            seen.push(JSON.parse(String(init.body)).snapshotType);
            return new Response(JSON.stringify({ ok: true, id: `id-${seen.length}` }), { status: 200 });
        });

        const result = await commitDashboardSnapshot(buildOutput('dashboard_projection'), { weightKg: 82 }, { fetchImpl });

        expect(seen).toEqual(['submitted_snapshot', 'dashboard_projection']);
        expect(result.submitted.ok).toBe(true);
        expect(result.projection.ok).toBe(true);
    });

    it('skips the projection when the permanent snapshot fails', async () => {
        const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: 'nope' }), { status: 503 }));
        const result = await commitDashboardSnapshot(buildOutput('dashboard_projection'), {}, { fetchImpl });

        expect(fetchImpl).toHaveBeenCalledTimes(1);
        expect(result.submitted.ok).toBe(false);
        expect(result.projection.error).toContain('skipped');
    });
});

describe('Layer 3 — structured AI context', () => {
    it('exposes severity-ranked findings plus the exact computed values', () => {
        const context = buildAiContext(buildOutput());

        expect(context.toolSlug).toBe('macro');
        expect(context.accessTier).toBe('free');
        expect(context.values).toEqual({ tdee: 2600 });
        expect(context.findings.map((f) => f.severity)).toEqual(['important', 'monitor', 'info']);
        expect(context.provenanceLine).toContain('manual');
        expect(context.provenanceLine).toContain('kg (from lb)');
    });

    it('caps the findings for prompt-budget control', () => {
        expect(AI_CONTEXT_MAX_FINDINGS).toBe(5);
        expect(buildAiContext(buildOutput(), { maxFindings: 2 }).findings).toHaveLength(2);
        expect(buildAiContext(buildOutput(), { maxFindings: 0 }).findings).toHaveLength(0);
    });

    it('serializes to stable, parseable JSON', () => {
        const serialized = serializeAiContext(buildAiContext(buildOutput()));
        const parsed = JSON.parse(serialized) as { toolSlug: string; values: { tdee: number } };

        expect(parsed.toolSlug).toBe('macro');
        expect(parsed.values.tdee).toBe(2600);
        expect(serialized).toContain('\n  "toolSlug"');
    });
});
