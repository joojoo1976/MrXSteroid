import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = fs.readFileSync(
    path.join(root, 'supabase/migrations/20261118160000_invoice_first_atomic.sql'),
    'utf8'
);
const rollback = fs.readFileSync(
    path.join(root, 'supabase/migrations/rollbacks/20261118160000_rollback_invoice_first_atomic.sql'),
    'utf8'
);

describe('Phase 4 — atomic invoice migration contract', () => {
    it('defines one SECURITY DEFINER function that writes all three tables', () => {
        expect(migration).toMatch(/create or replace function public\.create_invoice_atomic/i);
        expect(migration).toMatch(/security definer/i);
        expect(migration).toContain('insert into public.invoices');
        expect(migration).toContain('insert into public.orders');
        expect(migration).toContain('insert into public.invoice_lines');
    });

    it('rejects a line-sum that differs from the invoice amount', () => {
        expect(migration).toContain('invoice_line_total_mismatch');
        expect(migration).toMatch(/v_line_total\s*<>\s*p_amount/i);
    });

    it('uses DB unique idempotency and has an additive rollback', () => {
        expect(migration).toMatch(/on conflict \(idempotency_key\)/i);
        expect(migration).toMatch(/add column if not exists pricing_version/i);
        expect(migration).toMatch(/add column if not exists quote_hash/i);
        expect(rollback).toMatch(/drop function if exists public\.create_invoice_atomic/i);
        expect(rollback).toMatch(/drop column if exists quote_hash/i);
        expect(rollback).toMatch(/drop column if exists pricing_version/i);
    });
});
