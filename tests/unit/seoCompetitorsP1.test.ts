/**
 * P1 verification — competitor endpoint honesty (H2).
 *
 * Defects (Gap Audit 2026-09-28):
 *  - H2a: the PUBLIC GET /api/seo/competitors performed service-role DB
 *    upserts on every anonymous request (the curated competitors were synced
 *    inside the GET handler with no auth and no rate limit).
 *  - H2b: the endpoint shipped fabricated metrics with no data source:
 *    searchVolumeEstimate ("High 10k-50k/mo"), opportunityScore (87-98) and
 *    confidence (70-95).
 *
 * Fix: the sync moved to POST /api/admin/seo/competitors (requireAdmin);
 * the public GET is read-only and emits null for every unbacked metric while
 * preserving the real data (curated competitor list, live coverage check,
 * real summary counts).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSeoSupabaseFake } from '../helpers/seoSupabaseFake';
import { CURATED_COMPETITOR_GAPS } from '../../server/seo/competitorIntel';

const h = vi.hoisted(() => ({ admin: null as unknown, current: null as unknown }));

vi.mock('../../server/auth/require-admin', () => ({
    requireAdmin: async () => {
        if (!h.admin) {
            return {
                authorized: false,
                response: new Response(JSON.stringify({ error: 'nope' }), { status: 401 }),
            };
        }
        return { authorized: true, response: null };
    },
}));

vi.mock('../../server/seo/seoService', () => ({
    getSupabaseAdmin: () => h.current,
}));

async function callPublicCompetitors() {
    const { GET } = await import('../../app/api/seo/competitors/route');
    return GET(new NextRequest('http://localhost:3000/api/seo/competitors'));
}

async function callAdminSync() {
    const { POST } = await import('../../app/api/admin/seo/competitors/route');
    return POST(new NextRequest('http://localhost:3000/api/admin/seo/competitors', { method: 'POST' }));
}

beforeEach(() => {
    h.admin = null;
    h.current = null;
});

describe('GET /api/seo/competitors — P1 (H2) honesty', () => {
    it('performs no database writes (read-only)', async () => {
        const fake = createSeoSupabaseFake({ keywordsRows: [] });
        h.current = fake;

        const res = await callPublicCompetitors();
        expect(res.status).toBe(200);

        const writes = fake.ops.filter(
            (o) => o.methods.includes('insert') || o.methods.includes('upsert') || o.methods.includes('update')
        );
        expect(writes.length).toBe(0);
    });

    it('emits null — never invented values — for every unbacked metric', async () => {
        const fake = createSeoSupabaseFake({ keywordsRows: [] });
        h.current = fake;

        const res = await callPublicCompetitors();
        const body = await res.json();

        expect(body.opportunities.length).toBe(CURATED_COMPETITOR_GAPS.length);
        for (const opp of body.opportunities) {
            expect(opp.opportunityScore).toBeNull();
            expect(opp.searchVolumeEstimate).toBeNull();
            expect(opp.confidence).toBeNull();
        }
        // The fabricated aggregate is gone with its inputs:
        expect(body.summary.averageOpportunityScore).toBeUndefined();
    });

    it('preserves the real data: curated list, live coverage check, real counts', async () => {
        // One English gap's normalized keyword exists in the DB -> covered.
        const fake = createSeoSupabaseFake({
            keywordsRows: [
                { normalized_keyword: 'deca vs tren neurotoxicity comparison', language: 'en' },
            ],
        });
        h.current = fake;

        const res = await callPublicCompetitors();
        const body = await res.json();

        // Curated competitor list preserved (3 Arab + 3 Global):
        expect(body.competitors.length).toBe(6);
        expect(body.summary.arabCompetitorsCount).toBe(3);
        expect(body.summary.globalCompetitorsCount).toBe(3);

        // Live coverage check still real:
        const covered = body.opportunities.filter((o: { status: string }) => o.status === 'covered');
        const missing = body.opportunities.filter((o: { status: string }) => o.status === 'missing');
        expect(covered.length).toBe(1);
        expect(missing.length).toBe(CURATED_COMPETITOR_GAPS.length - 1);
        expect(body.summary.totalOpportunities).toBe(CURATED_COMPETITOR_GAPS.length);
        expect(body.summary.coveredOpportunities).toBe(1);
        expect(body.summary.coveragePercentage).toBe(Math.round((1 / CURATED_COMPETITOR_GAPS.length) * 100));

        // Destinations stay real routes:
        for (const opp of body.opportunities) {
            expect(opp.recommendedDestination.startsWith('/')).toBe(true);
        }
    });
});

describe('POST /api/admin/seo/competitors — P1 (H2) sync behind requireAdmin', () => {
    it('rejects an unauthorized request before any database work', async () => {
        h.admin = null;
        const fake = createSeoSupabaseFake({});
        h.current = fake;

        const res = await callAdminSync();
        expect(res.status).toBe(401);
        expect(fake.ops.length).toBe(0);
    });

    it('syncs the curated competitors (upsert on domain) when authorized', async () => {
        h.admin = { id: 'admin-1' };
        const fake = createSeoSupabaseFake({});
        h.current = fake;

        const res = await callAdminSync();
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.synced).toBe(6);

        const upserts = fake.ops.filter(
            (o) => o.table === 'seo_competitors' && o.methods.includes('upsert')
        );
        expect(upserts.length).toBe(6);
        const domains = upserts.map((o) => (o.payload as { domain: string }).domain);
        expect(domains).toContain('egyfitness.net');
        expect(domains).toContain('anabolicminds.com');
    });

    it('fails closed when a sync upsert errors', async () => {
        h.admin = { id: 'admin-1' };
        // The shared fake has no per-table upsert error config for
        // seo_competitors; simulate via a throwing proxy around the fake.
        const fake = createSeoSupabaseFake({});
        h.current = new Proxy(fake, {
            get(target, prop, receiver) {
                if (prop === 'from') {
                    return (table: string) => {
                        const builder = target.from(table);
                        if (table === 'seo_competitors') {
                            // Wrap upsert to inject a PostgREST-style error.
                            const originalUpsert = builder.upsert.bind(builder);
                            builder.upsert = () => Promise.resolve({ data: null, error: { message: 'simulated upsert failure' } });
                            void originalUpsert;
                        }
                        return builder;
                    };
                }
                return Reflect.get(target, prop, receiver);
            },
        });

        const res = await callAdminSync();
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.success).toBe(false);
        expect(body.details.failures.length).toBe(6);
        expect(body.details.synced).toBe(0);
    });
});
