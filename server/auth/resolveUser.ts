import { createClient } from '@supabase/supabase-js';

export type UserAuthResult =
    | { status: 'AUTHENTICATED'; userId: string }
    | { status: 'INVALID_TOKEN' }
    | { status: 'ANONYMOUS' };

/**
 * Cryptographically resolves and verifies the caller's identity from the HTTP Request.
 * Uses public anon key to avoid unnecessary service_role usage.
 */
export async function getAuthenticatedUser(req: Request): Promise<UserAuthResult> {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
        return { status: 'ANONYMOUS' };
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
        return { status: 'INVALID_TOKEN' };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('[resolveUser] Supabase configuration missing');
        return { status: 'INVALID_TOKEN' };
    }

    try {
        const client = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: { user }, error } = await client.auth.getUser(token);
        if (error || !user) {
            return { status: 'INVALID_TOKEN' };
        }

        return { status: 'AUTHENTICATED', userId: user.id };
    } catch (err) {
        console.error('[resolveUser] Error verifying auth token:', err);
        return { status: 'INVALID_TOKEN' };
    }
}

export type EffectiveUserResolution =
    | { success: true; effectiveUserId: string | null }
    | { success: false; status: 401 | 403; error: string };

/**
 * Enforces IDOR protection when associating a request with a user account.
 *
 * Rules:
 * 1. If an invalid/expired token is supplied -> 401.
 * 2. If authenticated user != client-supplied userId -> 403 (IDOR attempt).
 * 3. If unauthenticated caller attempts to claim a userId -> 401 (cannot forge userId without auth).
 * 4. If authenticated and client-supplied userId is omitted or matches -> binds to authenticated userId.
 * 5. If unauthenticated and no userId supplied -> effectiveUserId is null (guest checkout).
 */
export async function resolveEffectiveUserId(
    req: Request,
    clientUserId?: string | null
): Promise<EffectiveUserResolution> {
    const auth = await getAuthenticatedUser(req);

    if (auth.status === 'INVALID_TOKEN') {
        return {
            success: false,
            status: 401,
            error: 'Invalid or expired authorization token',
        };
    }

    const trimmedClientUserId = clientUserId?.trim() || null;

    if (auth.status === 'AUTHENTICATED') {
        if (trimmedClientUserId && trimmedClientUserId !== auth.userId) {
            return {
                success: false,
                status: 403,
                error: 'Forbidden: Cannot create invoice for another user',
            };
        }
        return {
            success: true,
            effectiveUserId: auth.userId,
        };
    }

    // ANONYMOUS
    if (trimmedClientUserId) {
        return {
            success: false,
            status: 401,
            error: 'Unauthorized: Authentication required to associate invoice with a user account',
        };
    }

    return {
        success: true,
        effectiveUserId: null,
    };
}
