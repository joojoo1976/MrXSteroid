import { NextRequest, NextResponse } from 'next/server';
import { createClient, type User } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface AdminProfile {
    id: string;
    role: string;
    [key: string]: unknown;
}

export type RequireAdminResult =
    | { authorized: true; user: User; profile: AdminProfile }
    | { authorized: false; response: NextResponse };

/**
 * Enterprise Server-side Admin Guard
 *
 * Flow & Invariants:
 * 1. Reads Bearer token strictly from 'Authorization' header (RFC 6750 standard).
 * 2. Cryptographically verifies token via client.auth.getUser(token) using safe public anon key.
 * 3. Queries public.profiles within authenticated user RLS context.
 * 4. Strictly checks profiles.role === 'admin'.
 * 5. Does NOT leak DB details or account profile existence; logs internally with requestId.
 * 6. Does NOT trust user_metadata or client-supplied body fields.
 * 7. Returns { authorized: true, user, profile } on success, or structured NextResponse on rejection.
 */
export async function requireAdmin(req: NextRequest | Request): Promise<RequireAdminResult> {
    const requestId = crypto.randomUUID();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error(`[AdminAuth:${requestId}] Missing Supabase URL or Anon Key environment variables`);
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Server configuration error', requestId },
                { status: 500 }
            ),
        };
    }

    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Unauthorized: Missing or invalid authorization token' },
                { status: 401 }
            ),
        };
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Unauthorized: Empty authorization token' },
                { status: 401 }
            ),
        };
    }

    // Standard client bound to the user's token (RLS enforced, NO service_role)
    const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: `Bearer ${token}` },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    const { data: userData, error: userError } = await client.auth.getUser(token);
    if (userError || !userData?.user) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Unauthorized: Invalid or expired session' },
                { status: 401 }
            ),
        };
    }

    const user = userData.user;

    // Direct database role verification from profiles table
    const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError) {
        console.error(`[AdminAuth:${requestId}] Profile query error for user ${user.id}:`, profileError.message);
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Forbidden: Administrator privileges required', requestId },
                { status: 403 }
            ),
        };
    }

    if (!profile || profile.role !== 'admin') {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Forbidden: Administrator privileges required' },
                { status: 403 }
            ),
        };
    }

    return {
        authorized: true,
        user,
        profile: profile as AdminProfile,
    };
}
