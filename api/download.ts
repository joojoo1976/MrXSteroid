/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔐 SECURE DIGITAL DOWNLOAD — Vercel Serverless Function                 ║
 * ║  Route: /api/download?file=en|ar                                         ║
 * ║  Verifies the Supabase session + has_paid subscription SERVER-SIDE,      ║
 * ║  then streams the protected PDF from the private/books directory.        ║
 * ║  The PDFs are never exposed via public/ static hosting.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile } from 'fs/promises';
import { join } from 'path';

const BOOK_FILES: Record<string, { path: string; displayName: string }> = {
    en: { path: 'MrXSteroid_Book_EN.pdf', displayName: 'MrXSteroid_Book_EN.pdf' },
    ar: { path: 'MrXSteroid_Book_AR.pdf', displayName: 'MrXSteroid_Book_AR.pdf' },
};

const ALLOWED_ORIGINS = [
    'https://mrxsteroid.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { createClient } = await import('@supabase/supabase-js');

        const CONFIG = {
            SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        };

        if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
            return res.status(500).json({ error: 'Missing Supabase configuration' });
        }

        // ─── CORS ─────────────────────────────────────────────────────────
        const origin = req.headers.origin || '';
        const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
        res.setHeader('Access-Control-Allow-Origin', corsOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // ─── AUTHENTICATION: Bearer access token ─────────────────────────
        const authHeader = req.headers.authorization || '';
        const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        if (!accessToken) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
        if (authError || !authData?.user) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        // ─── AUTHORIZATION: has_paid subscription check ───────────────────
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('has_paid, subscription_status')
            .eq('id', authData.user.id)
            .maybeSingle();

        if (profileError) {
            console.error('❌ [Download] Profile fetch error:', profileError.message);
            return res.status(500).json({ error: 'Failed to verify entitlement' });
        }

        if (!profile || profile.has_paid !== true) {
            return res.status(403).json({ error: 'Active subscription required for this download' });
        }

        // ─── RESOLVE FILE (whitelist map, prevents path traversal) ───────
        const fileKey = String(req.query.file || 'en').toLowerCase();
        const book = BOOK_FILES[fileKey];
        if (!book) {
            return res.status(400).json({ error: 'Unknown file requested' });
        }

        // ─── STREAM THE PROTECTED PDF ─────────────────────────────────────
        const filePath = join(process.cwd(), 'private', 'books', book.path);
        const content = await readFile(filePath);

        console.log(`✅ [Download] Granted — user: ${authData.user.id}, file: ${book.path}`);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${book.displayName}"`);
        res.setHeader('Content-Length', String(content.byteLength));
        res.setHeader('Cache-Control', 'private, no-store, max-age=0');
        return res.status(200).send(content);
    } catch (topLevelError) {
        const msg = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
        console.error('💥 [Download] TOP-LEVEL CRASH:', msg);
        return res.status(500).json({
            error: 'Server initialization error',
            message: msg,
        });
    }
}
