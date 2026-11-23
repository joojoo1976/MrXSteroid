import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
    BILLING_PROBES,
    classifyProbe,
    summarizePreflight,
    type ProbeSpec,
} from '../../scripts/billingDbPreflight';

/**
 * The billing preflight is the only thing that can tell us whether a migration
 * actually landed (a recorded migration proves nothing). These tests pin the
 * classification rules and the read-only guarantee.
 */

const spec = (over: Partial<ProbeSpec> = {}): ProbeSpec => ({
    kind: 'table',
    table: 'invoice_lines',
    label: 'invoice_lines',
    expected: 'present',
    migration: '20261118150000_create_invoice_lines',
    why: 'test fixture',
    ...over,
});

describe('classifyProbe', () => {
    it('treats a readable object as present', () => {
        const v = classifyProbe(spec(), { status: 200, code: null });
        expect(v.state).toBe('present');
        expect(v.ok).toBe(true);
    });

    it('treats PGRST205 (missing table) as absent', () => {
        const v = classifyProbe(spec(), { status: 404, code: 'PGRST205' });
        expect(v.state).toBe('absent');
        expect(v.ok).toBe(false);
    });

    it('treats 42703 (missing column) as absent', () => {
        const v = classifyProbe(
            spec({ kind: 'column', table: 'invoices', column: 'pricing_version', label: 'invoices.pricing_version' }),
            { status: 400, code: '42703' }
        );
        expect(v.state).toBe('absent');
        expect(v.ok).toBe(false);
    });

    it('treats 42501 (no grant for the role) as present, not missing', () => {
        // An RLS-locked table rejects the anon role but obviously exists.
        const v = classifyProbe(spec({ table: 'payment_intents', label: 'payment_intents' }), {
            status: 401,
            code: '42501',
        });
        expect(v.state).toBe('present');
        expect(v.ok).toBe(true);
    });

    it('marks an object that must stay absent as ok only when it is absent', () => {
        const guard = spec({
            kind: 'column',
            table: 'entitlements',
            column: 'tier_id',
            label: 'entitlements.tier_id',
            expected: 'absent',
        });

        expect(classifyProbe(guard, { status: 400, code: '42703' }).ok).toBe(true);
        expect(classifyProbe(guard, { status: 200, code: null }).ok).toBe(false);
    });

    it('surfaces transport/unknown failures as errors, never as satisfied', () => {
        const v = classifyProbe(spec(), { status: 500, code: null });
        expect(v.state).toBe('error');
        expect(v.ok).toBe(false);
    });
});

describe('summarizePreflight', () => {
    it('exits 0 when every expectation holds', () => {
        const verdicts = [classifyProbe(spec(), { status: 200, code: null })];
        const summary = summarizePreflight(verdicts);
        expect(summary.exitCode).toBe(0);
        expect(summary.pendingMigrations).toEqual([]);
    });

    it('exits 2 and lists the migrations still to apply, de-duplicated', () => {
        const verdicts = [
            classifyProbe(spec(), { status: 404, code: 'PGRST205' }),
            classifyProbe(spec({ label: 'invoices.pricing_version', kind: 'column', table: 'invoices', column: 'pricing_version', migration: '20261118160000_invoice_first_atomic' }), { status: 400, code: '42703' }),
            classifyProbe(spec({ label: 'invoices.quote_hash', kind: 'column', table: 'invoices', column: 'quote_hash', migration: '20261118160000_invoice_first_atomic' }), { status: 400, code: '42703' }),
        ];

        const summary = summarizePreflight(verdicts);
        expect(summary.exitCode).toBe(2);
        expect(summary.pending).toHaveLength(3);
        expect(summary.pendingMigrations).toEqual([
            '20261118150000_create_invoice_lines',
            '20261118160000_invoice_first_atomic',
        ]);
    });
});

describe('probe catalogue', () => {
    it('covers the three blocked migrations plus the InstaPay guard', () => {
        const migrations = BILLING_PROBES.map((p) => p.migration);
        expect(migrations.some((m) => m.startsWith('20261118150000'))).toBe(true);
        expect(migrations.some((m) => m.startsWith('20261118160000'))).toBe(true);
        expect(migrations.some((m) => m.startsWith('20261019120000'))).toBe(true);

        const guard = BILLING_PROBES.find((p) => p.table === 'entitlements' && p.column === 'tier_id');
        expect(guard?.expected).toBe('absent');
    });

    it('every probe documents why it exists and which migration owns it', () => {
        for (const p of BILLING_PROBES) {
            expect(p.why.length, p.label).toBeGreaterThan(10);
            expect(p.migration, p.label).toMatch(/^20\d{12}_/);
            if (p.kind === 'column') expect(p.column, p.label).toBeTruthy();
        }
    });
});

describe('read-only guarantee', () => {
    const cli = fs.readFileSync(path.join(process.cwd(), 'scripts/billing-db-preflight.ts'), 'utf8');

    it('never writes and never calls an RPC', () => {
        expect(cli).not.toMatch(/\.insert\(/);
        expect(cli).not.toMatch(/\.update\(/);
        expect(cli).not.toMatch(/\.upsert\(/);
        expect(cli).not.toMatch(/\.delete\(/);
        expect(cli).not.toMatch(/\.rpc\(/);
        expect(cli).not.toMatch(/method:\s*['"]POST['"]/i);
    });

    it('only issues GET requests', () => {
        const fetches = cli.match(/fetch\(/g) ?? [];
        expect(fetches).toHaveLength(1);
        expect(cli).toContain('select=');
    });
});
