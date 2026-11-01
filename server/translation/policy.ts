import type { TranslationSurface } from './contracts';

export type TranslationRouteClass =
    | 'PUBLIC_TRANSLATABLE'
    | 'PUBLIC_PROTECTED'
    | 'AUTHENTICATED_PROTECTED'
    | 'ADMIN_PROTECTED'
    | 'PAYMENT_PROTECTED'
    | 'WEBHOOK_PROTECTED'
    | 'API_PROTECTED'
    | 'UNKNOWN_PROTECTED';

export type TranslationRoutePolicy = {
    readonly routeClass: TranslationRouteClass;
    readonly translatable: boolean;
    readonly allowedSurfaces: readonly TranslationSurface[];
};

const PUBLIC_SURFACES: readonly TranslationSurface[] = [
    'header', 'navigation', 'hero', 'public-content', 'faq',
    'public-tools', 'public-product-presentation', 'public-informational',
];

const EXACT_PUBLIC = new Set([
    '/', '/about', '/accessibility', '/blog', '/careers', '/ccpa', '/contact',
    '/cookies', '/disclaimer', '/faq', '/gdpr', '/medical-disclaimer',
    '/premium-resources', '/privacy', '/refund', '/returns', '/shipping',
    '/sitemap', '/smart-landing', '/terms',
]);

const AUTH_PREFIXES = ['/dashboard', '/profile', '/claim-order'];
const ADMIN_PREFIXES = ['/admin', '/admin-analytics', '/evaluate-risk', '/payment-diagnostic'];
const PAYMENT_PREFIXES = ['/checkout', '/payment-pending', '/success', '/cancel'];
const AUTH_PUBLIC_PREFIXES = ['/login', '/signup', '/reset-password', '/auth'];

export function normalizeTranslationRoutePath(raw: string): string {
    let path = raw.trim();
    if (path === '') return '/';
    try {
        if (/^https?:\/\//i.test(path)) path = new URL(path).pathname;
    } catch {
        return '/__invalid__';
    }
    path = path.split(/[?#]/, 1)[0] || '/';
    if (!path.startsWith('/')) path = `/${path}`;
    path = path.replace(/^\/(?:ar|en)(?=\/|$)/, '') || '/';
    path = path.replace(/\/{2,}/g, '/');
    return path.length > 1 ? path.replace(/\/$/, '') : path;
}

function startsWithRoute(path: string, prefix: string): boolean {
    return path === prefix || path.startsWith(`${prefix}/`);
}

export function classifyTranslationRoute(rawPath: string): TranslationRoutePolicy {
    const path = normalizeTranslationRoutePath(rawPath);
    if (path.startsWith('/api/')) {
        return {
            routeClass: path.includes('/webhook') ? 'WEBHOOK_PROTECTED' : 'API_PROTECTED',
            translatable: false,
            allowedSurfaces: [],
        };
    }
    if (ADMIN_PREFIXES.some((prefix) => startsWithRoute(path, prefix))) {
        return { routeClass: 'ADMIN_PROTECTED', translatable: false, allowedSurfaces: [] };
    }
    if (PAYMENT_PREFIXES.some((prefix) => startsWithRoute(path, prefix))) {
        return { routeClass: 'PAYMENT_PROTECTED', translatable: false, allowedSurfaces: [] };
    }
    if (AUTH_PREFIXES.some((prefix) => startsWithRoute(path, prefix))) {
        return { routeClass: 'AUTHENTICATED_PROTECTED', translatable: false, allowedSurfaces: [] };
    }
    if (AUTH_PUBLIC_PREFIXES.some((prefix) => startsWithRoute(path, prefix))) {
        return { routeClass: 'PUBLIC_PROTECTED', translatable: false, allowedSurfaces: [] };
    }
    if (EXACT_PUBLIC.has(path) || startsWithRoute(path, '/smarttools')) {
        return { routeClass: 'PUBLIC_TRANSLATABLE', translatable: true, allowedSurfaces: PUBLIC_SURFACES };
    }
    return { routeClass: 'UNKNOWN_PROTECTED', translatable: false, allowedSurfaces: [] };
}

export function isSurfaceAllowedForRoute(rawPath: string, surface: TranslationSurface): boolean {
    const policy = classifyTranslationRoute(rawPath);
    return policy.translatable && policy.allowedSurfaces.includes(surface);
}

/** Same-origin Referer is browser-controlled request context, not JSON input. */
export function resolveRequestRoutePath(request: Request): string | null {
    const referer = request.headers.get('referer');
    if (!referer) return null;
    try {
        const requestUrl = new URL(request.url);
        const refererUrl = new URL(referer);
        if (requestUrl.origin !== refererUrl.origin) return null;
        return normalizeTranslationRoutePath(refererUrl.pathname);
    } catch {
        return null;
    }
}