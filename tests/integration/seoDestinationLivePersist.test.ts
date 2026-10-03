/**
 * LIVE destination verification + persistence against the REAL Production DB.
 *
 * Runs the exact modules the weekly route runs, against the live site, then
 * writes the honest per-row flag. Skipped unless SEO_LIVE_DEST=1.
 *
 * The two rows whose destination_path is '/' are left untouched on purpose:
 * '/' is a placeholder needing a human decision, not a verified destination.
 */
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

import {
    verifyDestinations,
    summariseVerification,
    toVerifiedFlag,
} from '../../server/seo/destinationVerification';

const LIVE = process.env.SEO_LIVE_DEST === '1';

describe.skipIf(!LIVE)('destination verification — LIVE', () => {
    it('verifies real destinations and persists the honest flag', async () => {
        const env = dotenv.parse(
            fs.readFileSync('C:/Users/foryo/.cline/worktrees/8b0da/MrXSteroid-main/.env.local')
        );
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });

        const { data: rows, error } = await supabase
            .from('seo_keywords')
            .select('id, destination_path, destination_verified')
            .eq('is_active', true);
        if (error) throw error;

        const paths = Array.from(
            new Set(
                rows
                    .map((r) => String(r.destination_path ?? '').trim())
                    .filter((p) => p.length > 0 && p !== '/')
            )
        );
        console.log(`  active keywords : ${rows.length}`);
        console.log(`  distinct paths  : ${paths.length}`);
        console.log(`  skipped '/' rows: ${rows.filter((r) => String(r.destination_path).trim() === '/').length}`);

        const checks = await verifyDestinations(paths, {
            siteOrigin: 'https://mrxsteroid.com',
            fetchImpl: globalThis.fetch,
        });
        const summary = summariseVerification(checks);
        console.log(`  summary: ${JSON.stringify(summary)}`);
        for (const c of checks) {
            console.log(`    ${c.path.padEnd(14)} ${c.verification.padEnd(11)} status=${c.status} ${c.error ?? ''}`);
        }

        const flagByPath = new Map(
            checks.map((c) => [c.path, toVerifiedFlag(c.verification)] as const)
        );
        let written = 0;
        for (const r of rows) {
            const p = String(r.destination_path ?? '').trim();
            if (!p || p === '/') continue;
            const flag = flagByPath.get(p);
            if (flag === undefined || r.destination_verified === flag) continue;
            const up = await supabase
                .from('seo_keywords')
                .update({ destination_verified: flag })
                .eq('id', r.id);
            if (!up.error) written += 1;
        }
        console.log(`  rows written    : ${written}`);

        const { data: after } = await supabase
            .from('seo_keywords')
            .select('destination_verified')
            .eq('is_active', true);
        const t = (after ?? []).filter((r) => r.destination_verified === true).length;
        const fa = (after ?? []).filter((r) => r.destination_verified === false).length;
        const n = (after ?? []).filter((r) => r.destination_verified === null).length;
        console.log(`  AFTER verified=${t} missing=${fa} unverified=${n}`);

        expect(summary.total).toBe(paths.length);
    }, 300_000);
});