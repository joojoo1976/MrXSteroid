/**
 * tests/unit/seoKeywordProvenance.test.ts
 *
 * STEP 4 — Provenance write path.
 *
 * Confirmed root cause this suite pins down: `seo_keyword_source_links` had
 * ZERO write sites, so no keyword was ever source-backed. The suite drives the
 * REAL `server/seo/provenance.ts` code against an in-memory Supabase fake that
 * models the two RPCs added by
 * `supabase/migrations/20260930120000_seo_keyword_provenance_atomic_rpc.sql`
 * with their real semantics:
 *
 *   - `seo_upsert_keyword_with_provenance` — keyword upsert + provenance link
 *     in ONE transaction; the keyword insert is ROLLED BACK if the provenance
 *     insert fails (atomicity).
 *   - `seo_record_keyword_provenance` — link only; refuses an unknown keyword.
 *   - both are idempotent: keyword conflicts on (language, normalized_keyword),
 *     link conflicts on the existing (keyword_id, source_id) primary key.
 *
 * Hard rule asserted throughout: NO PROVENANCE = NOT SOURCE-BACKED.
 */
import { describe, it, expect } from 'vitest';
import {
    persistKeywordWithProvenance,
    recordProvenance,
    editorialBaselineProvenance,
    EDITORIAL_SOURCE,
    assertProvenanceComplete,
    classifyUnprovenancedKeyword,
    describeKeywordProvenance,
    summarizeProvenance,
    PROVENANCE_RPC,
    type ProvenanceKeywordInput,
    type ProvenanceLinkInput,
} from '../../server/seo/provenance';

/* ------------------------------------------------------------------ */
/* In-memory Supabase fake modelling the SQL semantics                 */
/* ------------------------------------------------------------------ */

export interface FakeLinkRow {
    keyword_id: string;
    source_id: string;
    evidence_type: string;
    source_reference: string;
    generation_method: string;
    confidence: number | null;
    discovered_at: string;
    parent_keyword_id: string | null;
}

interface FakeOptions {
    /** Make the provenance insert fail (simulates a rollback). */
    provenanceInsertFails?: boolean;
    /** Keywords already present before the call. */
    seedKeywords?: Array<{ id: string; language: string; normalized_keyword: string }>;
}

function createProvenanceFake(opts: FakeOptions = {}) {
    const keywords: Array<{ id: string; language: string; normalized_keyword: string }> = [
        ...(opts.seedKeywords ?? []),
    ];
    const sources: Array<{ id: string; source_type: string; source_name: string }> = [];
    const links: FakeLinkRow[] = [];
    const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];

    let nextId = 1;
    const uuid = () => `id-${nextId++}`;

    const resolveSource = (src: Record<string, unknown>): string => {
        const id = String(src.id ?? '');
        if (id) {
            const found = sources.find(s => s.id === id);
            if (!found) throw new Error(`source_id ${id} not found`);
            return id;
        }
        const name = String(src.source_name ?? '');
        if (!name) throw new Error('source_name is required');
        const type = String(src.source_type ?? 'editorial');
        const existing = sources.find(s => s.source_type === type && s.source_name === name);
        if (existing) return existing.id;
        const created = { id: uuid(), source_type: type, source_name: name };
        sources.push(created);
        return created.id;
    };

    const requireProvenance = (p: Record<string, unknown>) => {
        if (!p.evidence_type || !p.source_reference || !p.generation_method) {
            throw new Error(
                'seo provenance: evidence_type, source_reference and generation_method are required'
            );
        }
    };

    /** Mirrors `on conflict (keyword_id, source_id) do update`. */
    const upsertLink = (keywordId: string, sourceId: string, p: Record<string, unknown>) => {
        const existing = links.find(l => l.keyword_id === keywordId && l.source_id === sourceId);
        const next: FakeLinkRow = {
            keyword_id: keywordId,
            source_id: sourceId,
            evidence_type: String(p.evidence_type),
            source_reference: String(p.source_reference),
            generation_method: String(p.generation_method),
            confidence: p.confidence === undefined ? null : Number(p.confidence),
            discovered_at: String(p.discovered_at ?? new Date().toISOString()),
            parent_keyword_id: (p.parent_keyword_id as string | null) ?? null,
        };
        if (existing) Object.assign(existing, next);
        else links.push(next);
    };

    // Simulates the transactional unit: on any error every effect is undone.
    const withTransaction = <T>(fn: () => T): T => {
        const kw = keywords.map(k => ({ ...k }));
        const ln = links.map(l => ({ ...l }));
        const sr = sources.map(s => ({ ...s }));
        try {
            return fn();
        } catch (e) {
            keywords.length = 0;
            keywords.push(...kw);
            links.length = 0;
            links.push(...ln);
            sources.length = 0;
            sources.push(...sr);
            throw e;
        }
    };
const rpc = async (fn: string, args: Record<string, unknown>) => {
        rpcCalls.push({ fn, args });
        try {
            return runRpc(fn, args);
        } catch (e) {
            // PostgREST surfaces SQL errors as `{ data: null, error }`; the fake
            // must do the same so callers exercise their real error path.
            return { data: null, error: { message: e instanceof Error ? e.message : String(e) } };
        }
    };

    const runRpc = (fn: string, args: Record<string, unknown>) => {
        if (fn === PROVENANCE_RPC.upsertKeyword) {
            const pKeyword = (args.p_keyword ?? {}) as Record<string, unknown>;
            const pProvenance = (args.p_provenance ?? {}) as Record<string, unknown>;
            return withTransaction(() => {
                requireProvenance(pProvenance);
                const language = String(pKeyword.language ?? '');
                const normalized = String(pKeyword.normalized_keyword ?? '');
                if (!language || !normalized) {
                    throw new Error('keyword payload is missing a required column');
                }

                const sourceId = resolveSource((args.p_source ?? {}) as Record<string, unknown>);

                let row = keywords.find(
                    k => k.language === language && k.normalized_keyword === normalized
                );
                const inserted = !row;
                if (!row) {
                    row = { id: uuid(), language, normalized_keyword: normalized };
                    keywords.push(row);
                }

                if (opts.provenanceInsertFails) {
                    throw new Error('simulated provenance insert failure');
                }

                upsertLink(row.id, sourceId, pProvenance);
                return {
                    data: {
                        keyword_id: row.id,
                        source_id: sourceId,
                        keyword_inserted: inserted,
                        provenance_inserted: true,
                        source_backed: true,
                    },
                    error: null,
                };
            });
        }

        if (fn === PROVENANCE_RPC.record) {
            const keywordId = String(args.p_keyword_id ?? '');
            const pProvenance = (args.p_provenance ?? {}) as Record<string, unknown>;
            return withTransaction(() => {
                requireProvenance(pProvenance);
                const keyword = keywords.find(k => k.id === keywordId);
                if (!keyword) {
                    throw new Error(
                        'refusing to create an orphan source link: keyword does not exist'
                    );
                }
                const sourceId = resolveSource((args.p_source ?? {}) as Record<string, unknown>);
                upsertLink(keywordId, sourceId, pProvenance);
                return {
                    data: {
                        keyword_id: keywordId,
                        source_id: sourceId,
                        provenance_inserted: true,
                        source_backed: true,
                    },
                    error: null,
                };
            });
        }

        return { data: null, error: { message: `unknown rpc ${fn}` } };
    };

    // The module only calls client.rpc(...).
    const client = { rpc } as unknown as Parameters<typeof persistKeywordWithProvenance>[0];

    return { client, keywords, sources, links, rpcCalls };
}

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

function keywordPayload(
    overrides: Partial<ProvenanceKeywordInput> = {}
): ProvenanceKeywordInput {
    return {
        language: 'en',
        locale: 'en-US',
        original_keyword: 'testosterone enanthate half life',
        normalized_keyword: 'testosterone enanthate half life',
        cluster: 'smart-tools',
        intent: 'informational',
        destination_path: '/halflife',
        score: 82,
        source: 'baseline',
        ...overrides,
    };
}

function linkPayload(overrides: Partial<ProvenanceLinkInput> = {}): ProvenanceLinkInput {
    return {
        evidence_type: 'baseline',
        source_reference: 'internal://baseline-keywords',
        confidence: 95,
        generation_method: 'seed',
        ...overrides,
    };
}

/* ------------------------------------------------------------------ */
/* 1. A provenance row is written together with the keyword row       */
/* ------------------------------------------------------------------ */

describe('persistKeywordWithProvenance — keyword + provenance in one atomic write', () => {
    it('writes the keyword row AND its provenance row in a single RPC call', async () => {
        const fake = createProvenanceFake();

        const res = await persistKeywordWithProvenance(
            fake.client,
            keywordPayload(),
            linkPayload()
        );

        expect(res.ok).toBe(true);
        expect(res.result?.source_backed).toBe(true);

        // ONE call = ONE transaction: keyword and link are inseparable.
        expect(fake.rpcCalls.length).toBe(1);
        expect(fake.rpcCalls[0].fn).toBe(PROVENANCE_RPC.upsertKeyword);

        // Keyword row persisted.
        expect(fake.keywords.length).toBe(1);
        const keywordId = fake.keywords[0].id;

        // Provenance row persisted, pointing at that exact keyword.
        expect(fake.links.length).toBe(1);
        expect(fake.links[0].keyword_id).toBe(keywordId);
        expect(res.result?.keyword_id).toBe(keywordId);

        // Every required provenance field is carried.
        expect(fake.links[0].evidence_type).toBe('baseline');
        expect(fake.links[0].source_reference).toBe('internal://baseline-keywords');
        expect(fake.links[0].generation_method).toBe('seed');
        expect(fake.links[0].confidence).toBe(95);
        expect(fake.links[0].discovered_at).toBeTruthy();
        expect(fake.links[0].parent_keyword_id).toBeNull();
        expect(fake.sources.length).toBe(1);
        expect(fake.sources[0].source_type).toBe('editorial');
    });

    it('carries parent_keyword_id when the keyword is generated from another', async () => {
        const fake = createProvenanceFake();

        const res = await persistKeywordWithProvenance(
            fake.client,
            keywordPayload(),
            linkPayload({ parent_keyword_id: 'parent-kw-1', evidence_type: 'api_response' })
        );

        expect(res.ok).toBe(true);
        expect(fake.links[0].parent_keyword_id).toBe('parent-kw-1');
        expect(fake.links[0].evidence_type).toBe('api_response');
    });

    it('refuses to write a keyword when provenance fields are incomplete', async () => {
        const fake = createProvenanceFake();

        const res = await persistKeywordWithProvenance(
            fake.client,
            keywordPayload(),
            // evidence_type missing
            {
                source_reference: 'internal://baseline',
                generation_method: 'seed',
            } as ProvenanceLinkInput
        );

        expect(res.ok).toBe(false);
        expect(res.error).toContain('evidence_type is required');
        // Nothing was written at all.
        expect(fake.keywords.length).toBe(0);
        expect(fake.links.length).toBe(0);
        expect(fake.rpcCalls.length).toBe(0);
    });
});

/* ------------------------------------------------------------------ */
/* 2. No orphan source-backed keyword                                  */
/* ------------------------------------------------------------------ */

describe('atomicity — no orphan source-backed keyword', () => {
    it('rolls the keyword back when the provenance insert fails', async () => {
        const fake = createProvenanceFake({ provenanceInsertFails: true });

        const res = await persistKeywordWithProvenance(
            fake.client,
            keywordPayload(),
            linkPayload()
        );

        expect(res.ok).toBe(false);
        // The keyword must NOT survive: it would be an unprovenanced keyword
        // claiming source backing it never received.
        expect(fake.keywords.length).toBe(0);
        expect(fake.links.length).toBe(0);
        expect(fake.sources.length).toBe(0);
    });

    it('never leaves a source link pointing at a keyword that does not exist', async () => {
        const fake = createProvenanceFake();

        await recordProvenance(fake.client, 'does-not-exist', editorialBaselineProvenance());

        expect(fake.links.length).toBe(0);
        for (const link of fake.links) {
            expect(fake.keywords.some(k => k.id === link.keyword_id)).toBe(true);
        }
    });

    it('every persisted keyword that claims source_backed has a provenance link', async () => {
        const fake = createProvenanceFake();
        const res = await persistKeywordWithProvenance(
            fake.client,
            keywordPayload(),
            linkPayload()
        );

        expect(res.result?.source_backed).toBe(true);
        const linksForKeyword = fake.links.filter(l => l.keyword_id === res.result?.keyword_id);
        expect(linksForKeyword.length).toBeGreaterThan(0);
    });

    it('a keyword with no provenance link is classified, never verified', () => {
        const verdict = describeKeywordProvenance({ id: 'kw-1', source: 'internal_search' });

        expect(verdict.verified).toBe(false);
        expect(verdict.source_backed).toBe(false);
        expect(verdict.classification).toBe('needs-migration');
        expect(verdict.reason).toContain('Not source-backed, not verified');
    });
});

/* ------------------------------------------------------------------ */
/* 3. Idempotency                                                      */
/* ------------------------------------------------------------------ */

describe('idempotency — running twice creates no duplicate provenance rows', () => {
    it('persistKeywordWithProvenance twice yields exactly one keyword and one link', async () => {
        const fake = createProvenanceFake();

        await persistKeywordWithProvenance(fake.client, keywordPayload(), linkPayload());
        await persistKeywordWithProvenance(fake.client, keywordPayload(), linkPayload());

        expect(fake.keywords.length).toBe(1);
        expect(fake.links.length).toBe(1);
        // The EDITORIAL source registry row is reused, not duplicated.
        expect(fake.sources.length).toBe(1);
    });

    it('recordProvenance twice for the same keyword updates in place', async () => {
        const fake = createProvenanceFake({
            seedKeywords: [{ id: 'kw-1', language: 'en', normalized_keyword: 'kw' }],
        });

        const first = await recordProvenance(
            fake.client,
            'kw-1',
            editorialBaselineProvenance('2026-09-01T00:00:00.000Z')
        );
        const second = await recordProvenance(
            fake.client,
            'kw-1',
            editorialBaselineProvenance('2026-09-02T00:00:00.000Z')
        );

        expect(first.ok).toBe(true);
        expect(second.ok).toBe(true);
        expect(fake.links.length).toBe(1);
        // The latest observation wins (ON CONFLICT DO UPDATE).
        expect(fake.links[0].discovered_at).toBe('2026-09-02T00:00:00.000Z');
        expect(fake.sources.length).toBe(1);
    });

    it('distinct keywords keep distinct provenance rows (no over-deduplication)', async () => {
        const fake = createProvenanceFake();

        await persistKeywordWithProvenance(fake.client, keywordPayload(), linkPayload());
        await persistKeywordWithProvenance(
            fake.client,
            keywordPayload({ normalized_keyword: 'trestolone half life' }),
            linkPayload()
        );

        expect(fake.keywords.length).toBe(2);
        expect(fake.links.length).toBe(2);
    });
});

/* ------------------------------------------------------------------ */
/* 4. EDITORIAL provenance for baseline / editorial seeds              */
/* ------------------------------------------------------------------ */

describe('EDITORIAL baseline provenance', () => {
    it('editorialBaselineProvenance carries the EDITORIAL source identity', async () => {
        const fake = createProvenanceFake({
            seedKeywords: [{ id: 'kw-seed', language: 'en', normalized_keyword: 'kw' }],
        });

        const res = await recordProvenance(
            fake.client,
            'kw-seed',
            editorialBaselineProvenance('2026-09-28T12:00:00.000Z'),
            EDITORIAL_SOURCE
        );

        expect(res.ok).toBe(true);
        expect(fake.sources[0].source_type).toBe('editorial');
        expect(fake.sources[0].source_name).toBe('internal_editorial_seeds');
        expect(fake.links[0].evidence_type).toBe('baseline');
        expect(fake.links[0].generation_method).toBe('seed');
        expect(fake.links[0].discovered_at).toBe('2026-09-28T12:00:00.000Z');
    });

    it('rejects an out-of-range confidence instead of inventing a metric', () => {
        expect(() => assertProvenanceComplete(linkPayload({ confidence: 140 }))).toThrow(
            /within 0-100/
        );
        expect(() => assertProvenanceComplete(linkPayload({ confidence: Number.NaN }))).toThrow(
            /within 0-100/
        );
    });
});

/* ------------------------------------------------------------------ */
/* 5. Classification helper                                            */
/* ------------------------------------------------------------------ */

describe('classifyUnprovenancedKeyword / summarizeProvenance', () => {
    it('returns null ONLY when a link exists', () => {
        expect(classifyUnprovenancedKeyword({ hasProvenanceLink: true })).toBeNull();
    });

    it('classifies rows without a link as legacy | baseline | needs-migration', () => {
        expect(classifyUnprovenancedKeyword({ source: 'baseline' })).toBe('baseline');
        expect(classifyUnprovenancedKeyword({ source: 'internal_search' })).toBe(
            'needs-migration'
        );
        expect(classifyUnprovenancedKeyword({ source: 'baseline', isLegacy: true })).toBe(
            'legacy'
        );
        expect(classifyUnprovenancedKeyword({})).toBe('needs-migration');
    });

    it('marks a linked keyword verified and an unlinked one not', () => {
        expect(describeKeywordProvenance({ hasProvenanceLink: true }).verified).toBe(true);
        expect(describeKeywordProvenance({ source: 'baseline' }).verified).toBe(false);
    });

    it('summarizes a corpus and never inflates the source-backed count', () => {
        const summary = summarizeProvenance([
            { id: 'a', hasProvenanceLink: true },
            { id: 'b', source: 'baseline' },
            { id: 'c', source: 'internal_search' },
            { id: 'd', source: 'trend', isLegacy: true },
        ]);

        expect(summary.total).toBe(4);
        expect(summary.sourceBacked).toBe(1);
        expect(summary.unverified).toBe(3);
        expect(summary.byClass).toEqual({
            legacy: 1,
            baseline: 1,
            'needs-migration': 1,
        });
    });
});

