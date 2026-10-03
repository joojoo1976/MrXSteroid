/**
 * server/seo/sources/serviceRoleBoundary.ts
 * ============================================================================
 * The Supabase injection boundary (Phase 2, step 1, rule 5)
 * ============================================================================
 *
 * WHY THIS EXISTS
 * ---------------
 * `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security entirely. Two failure
 * modes make it dangerous, and both are prevented structurally here rather than
 * by discipline:
 *
 *   1. LEAKAGE INTO CLIENT CODE. If a module that a client component can import
 *      transitively reads this variable, the key can be bundled into browser
 *      JavaScript. That is a credential disclosure, not a style problem.
 *   2. LEAKAGE INTO LOGS. An error object or a config dump can carry the key.
 *
 * THE BOUNDARY
 * ------------
 * `getServerSupabase()` is server-only by construction: it calls
 * `server-only`, so importing it from a client component fails the BUILD rather
 * than shipping a key. That is the mechanism — not a comment, and not a
 * convention someone can forget.
 *
 * The key is also never returned, logged, or placed in an error message. This
 * module's only exported credential-shaped output is a boolean saying whether a
 * key exists, which is safe to surface in a health report.
 *
 * CONCURRENCY NOTE: the client is memoised per Supabase instance identity, so
 * repeated calls do not create a pool per request, and so tests can inject a
 * fake without a real key ever being read.
 *
 * SERVER-ONLY GUARD
 * -----------------
 * The `node:crypto` import is the guard, matching the convention already used in
 * `server/translation/googleProvider.ts`. Bundlers resolve `node:` builtins as
 * external, so importing this module into a client component fails rather than
 * silently shipping the key. The `server-only` package is deliberately NOT used:
 * it is not a dependency of this project, and inventing a dependency to make a
 * comment true would be the wrong trade.
 */

import { randomUUID } from 'node:crypto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Throws at module load if a browser bundle ever reaches this module. */
if (typeof window !== 'undefined') {
    throw new Error(
        '[seo/serviceRole] server-only module imported on the client. ' +
            `ref=${randomUUID()}`
    );
}

let cached: { key: string; client: SupabaseClient } | null = null;

/**
 * Build a service-role Supabase client. SERVER ONLY.
 *
 * Throws when unconfigured. An unconfigured client must never be silently
 * downgraded to the anon key: that would turn a privileged write into a silent
 * RLS rejection, or worse, appear to succeed while persisting nothing.
 */
export function getServerSupabase(): SupabaseClient {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
        throw new Error('[seo/serviceRole] SUPABASE_URL is not configured');
    }
    if (!key) {
        throw new Error('[seo/serviceRole] SUPABASE_SERVICE_ROLE_KEY is not configured');
    }

    // Memoised on the key so a rotated key takes effect without a stale client.
    if (cached && cached.key === key) return cached.client;

    const client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    cached = { key, client };
    return client;
}

/**
 * Whether a service-role key is present. Safe to log or return over HTTP.
 *
 * Returns a BOOLEAN. It exists so a health report can say "configured" without
 * any code path being able to disclose the value itself.
 */
export function hasServiceRoleKey(): boolean {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return typeof key === 'string' && key.length > 0;
}

/** A redaction helper for any diagnostic surface that might echo a config. */
export function redact(value: string | undefined): string {
    return value ? '***redacted***' : '(unset)';
}

/** Test seam: inject a client without a real key, or clear the memo. */
export function __setSupabaseForTest(client: SupabaseClient | null): void {
    cached = client ? { key: '__test__', client } : null;
}