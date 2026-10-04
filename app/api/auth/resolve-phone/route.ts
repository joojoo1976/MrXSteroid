import { createClient } from '@supabase/supabase-js';
import { readEnv } from '../../../../shared/lib/env-reader';
import { enforceRateLimit, clientIp } from '../../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizeArabicNumerals(str: string): string {
    return str
        .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632 + 48))
        .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776 + 48));
}

export async function POST(req: Request): Promise<Response> {
    try {
        // 1. Rate limit to prevent phone enumeration abuse
        const ip = clientIp(req);
        const rate = await enforceRateLimit(`resolve-phone:${ip}`);
        if (!rate.success) {
            return Response.json(
                { success: false, error: 'Too many requests' },
                { status: 429, headers: { 'Retry-After': '60' } }
            );
        }

        const body = await req.json().catch(() => null);
        if (!body || typeof body.phone !== 'string') {
            return Response.json({ success: false, error: 'Phone is required' }, { status: 400 });
        }

        const rawPhone = body.phone.trim();
        const normalized = normalizeArabicNumerals(rawPhone);
        const cleanPhone = normalized.replace(/[\s\-()]/g, '');

        if (!cleanPhone || cleanPhone.length < 7) {
            return Response.json({ success: false, error: 'Invalid phone format' }, { status: 400 });
        }

        const supabaseUrl = readEnv('SUPABASE_URL') || readEnv('NEXT_PUBLIC_SUPABASE_URL');
        const supabaseKey = readEnv('SUPABASE_SERVICE_ROLE_KEY') || readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            return Response.json({ success: false, error: 'Supabase configuration missing' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // 1. Call database RPC get_email_by_phone
        const { data: rpcEmail, error: rpcErr } = await supabase.rpc('get_email_by_phone', {
            p_phone: cleanPhone,
        });

        if (!rpcErr && rpcEmail) {
            return Response.json({ success: true, email: rpcEmail });
        }

        // 2. Direct query fallback using service role key (bypasses RLS)
        const digits = cleanPhone.replace(/\D/g, '');
        const phoneVariants = Array.from(new Set([
            cleanPhone,
            digits,
            cleanPhone.startsWith('+') ? cleanPhone.slice(1) : '+' + cleanPhone,
            cleanPhone.startsWith('00') ? '+' + cleanPhone.slice(2) : cleanPhone,
            cleanPhone.startsWith('00') ? cleanPhone.slice(2) : cleanPhone,
        ])).filter(Boolean);

        const { data: profile } = await supabase
            .from('profiles')
            .select('email, phone_number')
            .or(
                phoneVariants.map((v) => `phone_number.eq.${v}`).join(',')
            )
            .limit(1)
            .maybeSingle();

        if (profile?.email) {
            return Response.json({ success: true, email: profile.email });
        }

        // 3. Right-digits fallback (e.g. 010... vs 2010...)
        if (digits.length >= 8) {
            const right9 = digits.slice(-9);
            const { data: fuzzyProfile } = await supabase
                .from('profiles')
                .select('email, phone_number')
                .not('phone_number', 'is', null)
                .limit(20);

            if (fuzzyProfile) {
                const match = fuzzyProfile.find((p) => {
                    if (!p.phone_number) return false;
                    const pDigits = p.phone_number.replace(/\D/g, '');
                    return pDigits.length >= 8 && pDigits.slice(-9) === right9;
                });
                if (match?.email) {
                    return Response.json({ success: true, email: match.email });
                }
            }
        }

        return Response.json({ success: true, email: null });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal error';
        return Response.json({ success: false, error: message }, { status: 500 });
    }
}
