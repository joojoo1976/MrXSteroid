/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  middleware.ts — Edge Auto-Localization & Locale-Prefix Routing
 *
 *  Runs on every /en/* and /ar/* request AND on all other requests to resolve
 *  the visitor's language + unit system at the edge, then:
 *    1. Rewrites /ar/* and /en/* to the underlying route (prefix stripped) so
 *       every page works under both locales without duplicating routes.
 *    2. Computes the effective language & unit-system from, in priority order:
 *         URL prefix  >  explicit user cookie  >  resolved cookie
 *         >  Vercel IP-country header  >  Accept-Language  >  default (ar)
 *    3. Passes them to server components via request headers (x-locale /
 *       x-units) so the FIRST server render is already correct — no flash.
 *    4. Persists the resolved locale to a cookie for stable subsequent renders.
 *
 *  Manual overrides (set by the header controls) live in mrx_explicit_language
 *  / mrx_explicit_units cookies and always win over auto-detection.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
    normalizeLang,
    languageForCountry,
    unitForCountry,
    unitForLanguage,
    pickAcceptLanguage,
    type SupportedLang,
    type UnitSystemLite,
} from './shared/lib/localeMap';

const DEFAULT_LANG: SupportedLang = 'ar';

function normalizeUnit(raw: string | undefined | null): UnitSystemLite | null {
    return raw === 'metric' || raw === 'imperial' ? raw : null;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const segments = pathname.split('/');
    const pathLocale = normalizeLang(segments[1]);

    // --- Signals -------------------------------------------------------------
    const explicitLang = normalizeLang(request.cookies.get('mrx_explicit_language')?.value);
    const explicitUnit = normalizeUnit(request.cookies.get('mrx_explicit_units')?.value);
    const resolvedCookie = normalizeLang(request.cookies.get('mrx_locale')?.value);
    const country = request.headers.get('x-vercel-ip-country');
    const acceptHeader = request.headers.get('accept-language');
    const accept = pickAcceptLanguage(acceptHeader);

    // --- Language resolution (priority order) --------------------------------
    let lang: SupportedLang;
    if (pathLocale) lang = pathLocale;                 // explicit URL intent wins
    else if (explicitLang) lang = explicitLang;        // user's manual choice
    else if (resolvedCookie) lang = resolvedCookie;    // previously resolved
    else if (country) lang = languageForCountry(country); // IP geolocation
    else if (accept) lang = accept;                    // browser language (supported)
    else if (acceptHeader) lang = 'en';                // browser language present but
                                                       // unsupported → English fallback
    else lang = DEFAULT_LANG;                          // no signal at all

    // --- Unit-system resolution ----------------------------------------------
    let units: UnitSystemLite;
    if (explicitUnit) units = explicitUnit;            // user's manual choice
    else if (country) units = unitForCountry(country); // country-accurate
    else units = unitForLanguage(lang);                // language-derived fallback

    // --- Build response (rewrite prefixed paths) -----------------------------
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', lang);
    requestHeaders.set('x-units', units);

    let response: NextResponse;
    if (pathLocale) {
        const rest = segments.slice(2).join('/');
        const destination = request.nextUrl.clone();
        destination.pathname = '/' + rest;
        response = NextResponse.rewrite(destination, { request: { headers: requestHeaders } });
    } else {
        response = NextResponse.next({ request: { headers: requestHeaders } });
    }

    // --- Persist resolved locale for stable subsequent SSR -------------------
    response.cookies.set('mrx_locale', lang, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
    });

    return response;
}

export const config = {
    // Resolve locale for every page, but skip static assets & API routes.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|json|webmanifest|pdf|mp3|woff|woff2|ttf)$).*)',
    ],
};
