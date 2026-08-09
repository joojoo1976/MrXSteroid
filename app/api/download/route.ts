/**
 * Route Handler — /api/download
 * Securely streams a protected paid e-book after verifying the Supabase
 * session (Bearer token) and has_paid entitlement server-side.
 * Adapted from the legacy Vercel serverless function to the App Router.
 */
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';

const BOOK_FILES: Record<string, { path: string; displayName: string }> = {
    en: { path: 'MrXSteroid_Book_EN.pdf', displayName: 'MrXSteroid_Book_EN.pdf' },
    ar: { path: 'MrXSteroid_Book_AR.pdf', displayName: 'MrXSteroid_Book_AR.pdf' },
};

const CONFIG = {
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function GET(req: Request) {
    try {
        if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
            return Response.json({ error: 'Missing Supabase configuration' }, { status: 500 });
        }

        const url = new URL(req.url);
        const authHeader = req.headers.get('authorization') || '';
        const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        if (!accessToken) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
        if (authError || !authData?.user) {
            return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('has_paid, subscription_status')
            .eq('id', authData.user.id)
            .maybeSingle();

        if (profileError) {
            console.error('❌ [Download] Profile fetch error:', profileError.message);
            return Response.json({ error: 'Failed to verify entitlement' }, { status: 500 });
        }

        if (!profile || profile.has_paid !== true) {
            return Response.json({ error: 'Active subscription required for this download' }, { status: 403 });
        }

        const fileKey = (url.searchParams.get('file') || 'en').toLowerCase();
        const book = BOOK_FILES[fileKey];
        if (!book) {
            return Response.json({ error: 'Unknown file requested' }, { status: 400 });
        }

        const filePath = join(process.cwd(), 'private', 'books', book.path);
        const content = await readFile(filePath);

        console.log(`✅ [Download] Granted — user: ${authData.user.id}, file: ${book.path}`);

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
    } catch (topLevelError) {
        const msg = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
        console.error('💥 [Download] TOP-LEVEL CRASH:', msg);
        return Response.json({ error: 'Server initialization error', message: msg }, { status: 500 });
    }
}
