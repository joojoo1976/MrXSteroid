/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  middleware.ts — Locale-prefix routing (AR/EN)
 *
 *  Makes /ar/* and /en/* resolve for EVERY page in the project without
 *  duplicating routes. The prefix is stripped via an internal rewrite so the
 *  underlying page renders, while the browser URL keeps the locale prefix and
 *  a cookie records it. The client PreferencesProvider reads the prefix/cookie
 *  to apply the matching language on load and refresh.
 *
 *  Examples:
 *    /ar            → renders /            (cookie mrx_locale=ar)
 *    /en/timeline   → renders /timeline   (cookie mrx_locale=en)
 *    /ar/macro      → renders /macro      (cookie mrx_locale=ar)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = new Set(['en', 'ar']);

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const segments = pathname.split('/');
    const prefix = segments[1];

    // Only act on /en or /ar prefixed paths.
    if (LOCALES.has(prefix)) {
        const rest = segments.slice(2).join('/');
        const destination = request.nextUrl.clone();
        destination.pathname = '/' + rest;

        const response = NextResponse.rewrite(destination);
        response.cookies.set('mrx_locale', prefix, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
            sameSite: 'lax',
        });
        return response;
    }

    return NextResponse.next();
}

export const config = {
    // Run only for locale-prefixed paths; skip static assets & API.
    matcher: ['/en/:path*', '/ar/:path*'],
};
