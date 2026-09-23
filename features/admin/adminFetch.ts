'use client';

import { supabase } from '../../shared/lib/supabase';

/**
 * Resolves an Authorization header carrying the user's Supabase access token
 * (required by server-side `requireAdmin`). Reusable for bare fetch() calls
 * that only need the header.
 */
export async function adminHeaders(): Promise<Record<string, string>> {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
    } catch (err) {
        console.warn('[adminHeaders] Failed to resolve session token', err);
        return {};
    }
}

/**
 * Admin API fetch that attaches the Supabase access token (required by
 * server-side `requireAdmin`) and normalises JSON responses.
 * All MissionControl admin surfaces must use this instead of bare fetch().
 */
export async function adminFetch<T = unknown>(
    path: string,
    init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T; error?: string }> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
    };

    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    } catch (err) {
        // Auth lookup failures fall through — the server will reject with 401.
        console.warn('[adminFetch] Failed to resolve session token', err);
    }

    const response = await fetch(path, { ...init, headers });

    let body: T & { error?: string };
    try {
        body = (await response.json()) as T & { error?: string };
    } catch {
        body = { error: `HTTP ${response.status}` } as T & { error?: string };
    }

    if (!response.ok) {
        return { ok: false, status: response.status, data: body, error: body.error || `HTTP ${response.status}` };
    }
    return { ok: true, status: response.status, data: body };
}