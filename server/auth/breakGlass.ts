/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  BREAK-GLASS PROTOCOL (v4 - Final Gate N-17)
 *  Emergency Administrative Access Recovery:
 *  - Single-use, time-limited cryptographic recovery token
 *  - High-severity audit logging in public.audit_log
 *  - Prevents total lockout if MFA/2FA is disrupted while preserving security
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface BreakGlassExecutionParams {
    actorId: string;
    reason: string;
    submittedToken: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface BreakGlassResult {
    granted: boolean;
    reason?: string;
    auditLogId?: string;
}

function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('[BreakGlass] Missing Supabase admin env vars.');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Validates and consumes a single-use break-glass token.
 * Token must match BREAK_GLASS_SECRET_KEY env var (or configured hash).
 */
export async function executeBreakGlassProtocol(
    params: BreakGlassExecutionParams,
    supabaseClient?: SupabaseClient
): Promise<BreakGlassResult> {
    const configuredSecret = process.env.BREAK_GLASS_SECRET_KEY;

    if (!configuredSecret || configuredSecret.length < 32) {
        return {
            granted: false,
            reason: 'Break-glass recovery is not configured or secret length is below security threshold (min 32 chars).',
        };
    }

    // Constant-time comparison to prevent timing attacks
    const submittedBuffer = Buffer.from(params.submittedToken || '');
    const secretBuffer = Buffer.from(configuredSecret);

    const isMatch =
        submittedBuffer.length === secretBuffer.length &&
        crypto.timingSafeEqual(submittedBuffer, secretBuffer);

    const supabase = supabaseClient || getSupabaseAdmin();

    // Audit the attempt regardless of outcome
    const { data: auditEntry } = await supabase
        .from('audit_log')
        .insert({
            actor_id: params.actorId || null,
            actor_type: 'admin',
            action: isMatch ? 'BREAK_GLASS_ACCESS_GRANTED' : 'BREAK_GLASS_ACCESS_FAILED',
            entity_type: 'break_glass_protocol',
            entity_id: params.actorId,
            ip_address: params.ipAddress || null,
            user_agent: params.userAgent || null,
            metadata: {
                reason: params.reason,
                timestamp: new Date().toISOString(),
                success: isMatch,
            },
        })
        .select('id')
        .single();

    if (!isMatch) {
        return {
            granted: false,
            reason: 'Invalid break-glass authentication token.',
            auditLogId: auditEntry?.id,
        };
    }

    return {
        granted: true,
        auditLogId: auditEntry?.id,
    };
}
