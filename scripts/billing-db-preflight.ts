/**
 * CLI: billing schema preflight (READ ONLY).
 *
 * Usage:
 *   npx tsx scripts/billing-db-preflight.ts
 *
 * Answers one question without touching data: are the billing objects a
 * correctly migrated database must have actually there?
 *
 * Safety contract
 *   - Only HTTP GET requests against PostgREST. No POST, no RPC, no insert,
 *     update, delete or upsert. It is safe to point at production.
 *   - Uses SUPABASE_SERVICE_ROLE_KEY when present, otherwise the anon key
 *     (RLS then applies; a 42501 "permission denied" still proves existence).
 *   - Prints object names only — never a key.
 *
 * Exit codes: 0 = every expectation satisfied; 2 = something is still pending;
 *             1 = misconfiguration / transport failure.
 */

import 'dotenv/config';
import { BILLING_PROBES, classifyProbe, summarizePreflight, type ProbeOutcome } from './billingDbPreflight';

function resolveTarget(): { url: string; key: string; using: 'service_role' | 'anon' } {
    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!url) throw new Error('Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL');
    const key = serviceKey || anonKey;
    if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY');

    return { url, key, using: serviceKey ? 'service_role' : 'anon' };
}

async function probe(url: string, key: string, table: string, column?: string): Promise<ProbeOutcome> {
    const select = column ?? 'id';
    const res = await fetch(`${url}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    let code: string | null = null;
    try {
        const body = (await res.json()) as { code?: string };
        code = body?.code ?? null;
    } catch {
        code = null;
    }
    return { status: res.status, code };
}

async function main() {
    let { url, key, using } = resolveTarget();
    const host = url.split('//')[1] ?? url;
    console.log(`[BillingPreflight] host=${host} role=${using} mode=read-only\n`);

    // A stale service-role key (401 with no Postgres error code) is common
    // in local env files. Fall back to the anon key once instead of
    // reporting every object as "error" — RLS may hide rows, but a 42501
    // still proves the object exists.
    const firstProbe = await probe(url, key, BILLING_PROBES[0].table, BILLING_PROBES[0].column);
    if (firstProbe.status === 401 && !firstProbe.code && using === 'service_role') {
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
        if (anonKey && anonKey !== key) {
            console.log('[BillingPreflight] service-role key rejected - retrying with the anon key');
            key = anonKey;
            using = 'anon';
        }
    }

    const verdicts = [];
    for (const spec of BILLING_PROBES) {
        const outcome = await probe(url, key, spec.table, spec.column);
        verdicts.push(classifyProbe(spec, outcome));
    }

    const summary = summarizePreflight(verdicts);

    for (const v of summary.verdicts) {
        const mark = v.ok ? 'OK  ' : 'PEND';
        const want = v.spec.expected === 'present' ? 'present' : 'absent ';
        console.log(
            `${mark} ${v.spec.label.padEnd(28)} want=${want} got=${String(v.state).padEnd(10)} ${v.detail}`
        );
        if (!v.ok) {
            console.log(`     -> apply ${v.spec.migration} · ${v.spec.why}`);
        }
    }

    console.log('');
    if (summary.exitCode === 0) {
        console.log('[BillingPreflight] all expectations satisfied');
    } else {
        console.log(`[BillingPreflight] pending migrations: ${summary.pendingMigrations.join(', ')}`);
    }

    process.exitCode = summary.exitCode;
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
