/**
 * app/api/seo/search-log/route.ts
 * POST /api/seo/search-log
 * Records anonymous internal search terms to detect unserved demand and content opportunities.
 * Strictly anonymous: zero PII, zero tracking identifiers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SeoLanguage } from '../../../../server/seo/types';
import { logInternalSearchQuery } from '../../../../server/seo/seoService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, language, resultsCount } = body || {};

        if (!query || typeof query !== 'string' || query.trim().length < 2) {
            return NextResponse.json(
                { ok: false, message: 'Invalid query' },
                { status: 400 }
            );
        }

        const lang: SeoLanguage = language === 'ar' ? 'ar' : 'en';
        const count = typeof resultsCount === 'number' ? resultsCount : 0;

        await logInternalSearchQuery(query, lang, count);

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
