/**
 * P0 verification — /api/seo/report must not depend on non-existent columns
 * and must never present fallback data as the live corpus (H1).
 *
 * APPROVED as the P0 regression lock for the H1 fix (owner approval). The
 * route fix lives in app/api/seo/report/route.ts; this suite must keep its
 * assertions intact.
 *
 * Defect (Gap Audit 2026-09-28): the report selected last_analyzed_at /
 * final_score / confidence_score / lifecycle_status / is_ymyl /
 * requires_review — none exist in the production database (v1 schema, all
 * 42703). PostgREST rejected the whole select, the error was never checked,
 * and the Tier-3 fallback silently substituted the curated baseline seeds
 * (is_ymyl: false) for the live corpus with no fallback flag.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createSeoSupabaseFake } from '../helpers/seoSupabaseFake';

const h = vi.hoisted(() => ({ current: null as unknown }));

vi.mock('../../server/auth/require-admin', () => ({
    requireAdmin: async () => ({ authorized: true, user: { id: 'admin-1' }, response: null }),
}));

vi.mock('../../server/seo/seoService', () => ({
    getSupabaseAdmin: () => h.current,
    getIsoWeek: () => ({ year: 2026, weekNumber: 39 }),
}));

/** v1-schema keyword row (matches the production columns exactly). */
function v1KeywordRow(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 'kw-1',
        language: 'en',
        locale: 'en-US',
        original_keyword: 'testosterone enanthate half life guide',
        normalized_keyword: 'testosterone enanthate half life guide',
        cluster: 'smart-tools',
        intent: 'informational',
        trend_status: 'stable',
        destination_path: '/halflife',
        score: 72.5,
        is_active: true,
        ...overrides,
    };
}

async function callReport() {
    const { GET } = await import('../../app/api/seo/report/route');
    return GET(new NextRequest('http://localhost:3000/api/seo/report?lang=all'));
}

beforeEach(() => {
    h.current = null;
});

describe('/api/seo/report — P0 fallback provenance verification', () => {
    it('no longer references the non-existent last_analyzed_at column', () => {
        const src = readFileSync(join(process.cwd(), 'app/api/seo/report/route.ts'), 'utf8');
        expect(src).not.toContain('last_analyzed_at');
    });

    it('requests only production-existing columns from seo_keywords', async () => {
        const fake = createSeoSupabaseFake({ keywordsRows: [v1KeywordRow()] });
        h.current = fake;

        const res = await callReport();
        expect(res.status).toBe(200);

        const kwSelect = fake.ops.find((o) => o.table === 'seo_keywords' && o.methods.includes('select'));
        expect(kwSelect?.selectArg).toBeDefined();
        const cols = (kwSelect!.selectArg as string).split(',').map((c) => c.trim());
        for (const forbidden of [
            'last_analyzed_at', 'final_score', 'confidence_score',
            'lifecycle_status', 'is_ymyl', 'requires_review',
        ]) {
            expect(cols).not.toContain(forbidden);
        }
        for (const required of [
            'id', 'original_keyword', 'normalized_keyword', 'language',
            'cluster', 'intent', 'destination_path', 'score', 'trend_status', 'is_active',
        ]) {
            expect(cols).toContain(required);
        }
    });

    it('labels fallback data explicitly when the database query errors', async () => {
        const fake = createSeoSupabaseFake({
            keywordsError: { message: 'column seo_keywords.last_analyzed_at does not exist' },
        });
        h.current = fake;

        const res = await callReport();
        expect(res.status).toBe(200);
        const body = await res.json();

        // The fallback must be explicit, never silently presented as live data:
        expect(body.fallbackUsed).toBe(true);
        expect(body.dataSource).toBe('fallback');
        expect(body.fallbackReason).toBe('database_error');
        expect(body.topKeywords.length).toBeGreaterThan(0);
        for (const item of body.topKeywords) {
            expect(item.fallback).toBe(true);
            expect(item.id).toMatch(/^fallback-/);
            // Unclassified data must not be presented as is_ymyl=false:
            expect(item.is_ymyl).toBeNull();
        }
    });

    it('serves database rows without fallback labels when rows exist', async () => {
        const fake = createSeoSupabaseFake({
            keywordsRows: [v1KeywordRow(), v1KeywordRow({ id: 'kw-2', language: 'ar', locale: 'ar-EG' })],
        });
        h.current = fake;

        const res = await callReport();
        expect(res.status).toBe(200);
        const body = await res.json();

        expect(body.fallbackUsed).toBe(false);
        expect(body.dataSource).toBe('database');
        expect(body.fallbackReason).toBeNull();
        expect(body.summary.totalActiveKeywords).toBe(2);
        for (const item of body.topKeywords) {
            expect(item.fallback).toBeUndefined();
        }
    });

    it('does not fabricate an average confidence when the field is absent', async () => {
        const fake = createSeoSupabaseFake({ keywordsRows: [v1KeywordRow()] });
        h.current = fake;

        const res = await callReport();
        expect(res.status).toBe(200);
        const body = await res.json();

        // The v1 schema has no confidence_score column — the report must not
        // fabricate the neutral-70 default for rows that do not carry it.
        expect(body.summary.averageConfidence).toBe(0);
    });
});
