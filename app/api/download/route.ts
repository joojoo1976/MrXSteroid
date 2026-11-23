/**
 * Route Handler — /api/download
 * Securely streams a protected paid e-book after verifying the Supabase
 * session (Bearer token) and the caller's book access server-side.
 *
 * Access order (Phase B):
 *   1. `entitlements` is authoritative — a granted entitlement for a
 *      book-bearing product (and, when the entitlement records a language, for
 *      the requested language).
 *   2. `profiles.has_paid` is only a LEGACY FALLBACK, used when the account has
 *      no entitlement rows at all (pre-entitlement purchases).
 *
 * If the account has entitlements but none of them grants this book/language,
 * access is denied — `has_paid` never overrides a recorded entitlement.
 */
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { corsPreflightResponse } from '../../../server/cors/corsConfig';

const BOOK_FILES: Record<string, { path: string; displayName: string }> = {
    en: { path: 'MrXSteroid_Book_EN.pdf', displayName: 'MrXSteroid_Book_EN.pdf' },
    ar: { path: 'MrXSteroid_Book_AR.pdf', displayName: 'MrXSteroid_Book_AR.pdf' },
};

/**
 * Products that include the digital book. Canonical ids come from
 * `invoiceLineProducts`; the tier ids are accepted for legacy entitlement rows
 * granted before the canonical mapping existed.
 */
const BOOK_PRODUCT_IDS = new Set([
    'MRX-PROTOCOL',
    'MRX-TACTICAL',
    'MRX-SMART-PRO',
    'digital',
    'digital_plus',
    'pdf',
    'bundle',
    'bundle_plus',
    'paperback',
    'coaching',
    'coaching_plus',
]);

interface EntitlementRow {
    product_id?: string | null;
    status?: string | null;
    metadata?: Record<string, unknown> | null;
}

function entitlementLanguage(row: EntitlementRow): 'ar' | 'en' | null {
    const value = row.metadata?.language;
    if (value === 'ar' || value === 'en') return value;
    return null;
}

export async function OPTIONS(req: Request) {
    return corsPreflightResponse(req, 'GET, OPTIONS', 'Content-Type, Authorization');
}

export async function GET(req: Request) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseAnonKey) {
            return Response.json({ error: 'Missing Supabase configuration' }, { status: 500 });
        }

        const url = new URL(req.url);
        const authHeader = req.headers.get('authorization') || '';
        const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        if (!accessToken) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // ── 1. Authenticate ──────────────────────────────────────────────────
        const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
        if (authError || !authData?.user) {
            return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
        }

        // ── 2. Validate the requested book/language ──────────────────────────
        const fileKey = (url.searchParams.get('file') || 'en').toLowerCase();
        const book = BOOK_FILES[fileKey];
        if (!book) {
            return Response.json({ error: 'Unknown file requested' }, { status: 400 });
        }

        // ── 3. Entitlements first (RLS: users read their own rows) ───────────
        const { data: entitlementData, error: entitlementError } = await supabase
            .from('entitlements')
            .select('product_id, status, metadata')
            .eq('user_id', authData.user.id)
            .eq('status', 'granted');

        if (entitlementError) {
            // Fail closed on a genuine read failure instead of granting access
            // on an unverifiable state.
            console.error('❌ [Download] Entitlement lookup error:', entitlementError.message);
            return Response.json({ error: 'Failed to verify entitlement' }, { status: 500 });
        }

        const entitlementRows = (entitlementData || []) as EntitlementRow[];
        const bookEntitlements = entitlementRows.filter((row) =>
            BOOK_PRODUCT_IDS.has(String(row.product_id || ''))
        );

        if (entitlementRows.length > 0) {
            if (bookEntitlements.length === 0) {
                return Response.json(
                    { error: 'No active book entitlement was found for this account' },
                    { status: 403 }
                );
            }

            // A language recorded on the entitlement is binding. Entitlements
            // without a language (legacy rows) keep access to both editions.
            const recordedLanguages = bookEntitlements
                .map(entitlementLanguage)
                .filter((value): value is 'ar' | 'en' => value !== null);

            if (recordedLanguages.length > 0 && !recordedLanguages.includes(fileKey as 'ar' | 'en')) {
                return Response.json(
                    { error: 'This book language is not included in your entitlement' },
                    { status: 403 }
                );
            }

            return await streamBook(book, authData.user.id, `entitlement:${fileKey}`);
        }

        // ── 4. Legacy fallback: no entitlement rows at all ───────────────────
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('has_paid')
            .eq('id', authData.user.id)
            .maybeSingle();

        if (profileError) {
            console.error('❌ [Download] Profile fetch error:', profileError.message);
            return Response.json({ error: 'Failed to verify entitlement' }, { status: 500 });
        }

        if (!profile || profile.has_paid !== true) {
            return Response.json({ error: 'Active subscription required for this download' }, { status: 403 });
        }

        return await streamBook(book, authData.user.id, `legacy_has_paid:${fileKey}`);
    } catch (topLevelError) {
        const msg = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
        console.error('💥 [Download] TOP-LEVEL CRASH:', msg);
        return Response.json({ error: 'Download service unavailable' }, { status: 500 });
    }
}

async function streamBook(
    book: { path: string; displayName: string },
    userId: string,
    source: string
): Promise<Response> {
    const filePath = join(process.cwd(), 'private', 'books', book.path);
    const content = await readFile(filePath);

    console.log(`✅ [Download] Granted — user: ${userId}, file: ${book.path}, via ${source}`);

    return new Response(new Uint8Array(content), {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${book.displayName}"`,
            'Content-Length': String(content.byteLength),
            'Cache-Control': 'private, no-store, max-age=0',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
