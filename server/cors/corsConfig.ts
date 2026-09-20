/**
 * Shared CORS Configuration — server/cors/corsConfig.ts
 *
 * Provides explicit origin allowlist instead of '*' wildcard.
 * All API routes that serve browser requests MUST use these helpers.
 *
 * Rules:
 * - Production: only NEXT_PUBLIC_SITE_URL-derived origins (www + apex).
 * - Development (NODE_ENV !== 'production'): additionally localhost:3000 / :3001.
 * - Webhooks/server-to-server endpoints that don't need CORS may skip OPTIONS entirely.
 * - Unknown origins receive a 204 without the Access-Control-Allow-Origin header,
 *   which browsers interpret as a CORS block.
 */

export function buildAllowedOrigins(): Set<string> {
    const origins = new Set<string>();
    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        'https://www.mrxsteroid.com';

    try {
        const parsed = new URL(siteUrl);
        // e.g. https://www.mrxsteroid.com
        origins.add(parsed.origin);

        // Also allow the apex domain (without www) and vice-versa
        if (parsed.hostname.startsWith('www.')) {
            const apex = `${parsed.protocol}//${parsed.hostname.slice(4)}`;
            origins.add(apex);
        } else {
            const withWww = `${parsed.protocol}//www.${parsed.hostname}`;
            origins.add(withWww);
        }
    } catch {
        // Fallback to production domain
        origins.add('https://www.mrxsteroid.com');
        origins.add('https://mrxsteroid.com');
    }

    // Explicit Vercel production domain
    origins.add('https://mrxsteroid.vercel.app');

    // Dynamic Vercel deployment URL (if running on Vercel preview/production)
    if (process.env.VERCEL_URL) {
        origins.add(`https://${process.env.VERCEL_URL}`);
    }


    // Local development — never add in production builds
    if (process.env.NODE_ENV !== 'production') {
        origins.add('http://localhost:3000');
        origins.add('http://localhost:3001');
        origins.add('http://127.0.0.1:3000');
    }

    return origins;
}

/**
 * Returns true if the given origin is in the explicit allowlist.
 */
export function isOriginAllowed(origin: string | null | undefined): boolean {
    if (!origin) return false;
    return buildAllowedOrigins().has(origin);
}

/**
 * Returns the CORS origin value to echo back, or null if the origin is not
 * allowed. Callers should only set the header when the return value is non-null.
 */
export function resolveAllowedOrigin(req?: Request | null): string | null {
    if (!req || typeof req.headers?.get !== 'function') return null;
    const origin = req.headers.get('origin');
    if (origin && isOriginAllowed(origin)) return origin;
    return null;
}

/**
 * Builds the headers object for a successful (allowed) response.
 * Returns an empty object if the request origin is not in the allowlist,
 * which results in the browser blocking the cross-origin response.
 */
export function buildCorsHeaders(
    req?: Request | null,
    extra?: Record<string, string>
): Record<string, string> {
    const allowed = resolveAllowedOrigin(req);
    if (!allowed) return extra ?? {};
    return {
        'Access-Control-Allow-Origin': allowed,
        'Vary': 'Origin',
        ...(extra ?? {}),
    };
}

/**
 * Constructs a standard 204 preflight response.
 * If the request origin is not in the allowlist, no ACAO header is set —
 * the browser will correctly treat the preflight as failed.
 */
export function corsPreflightResponse(
    req?: Request | null,
    methods: string = 'GET, POST, OPTIONS',
    allowHeaders: string = 'Content-Type, Authorization'
): Response {
    const allowed = resolveAllowedOrigin(req);
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': methods,
        'Access-Control-Allow-Headers': allowHeaders,
    };
    if (allowed) {
        headers['Access-Control-Allow-Origin'] = allowed;
        headers['Vary'] = 'Origin';
    }
    return new Response(null, { status: 204, headers });
}

