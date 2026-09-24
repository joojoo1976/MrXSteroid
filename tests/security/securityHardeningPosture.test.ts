/**
 * Security Hardening — Production posture lock (static, CI-gated).
 *
 * Locks the security invariants evidenced in
 * docs/governance/phase1/P1-SECURITY-HARDENING-EVIDENCE.md. Source-level tests
 * so a future change that weakens any control fails before deploy.
 *
 * Nothing here hits the database; it guards the repo's security contracts:
 *  - SUPABASE_SERVICE_ROLE_KEY never reaches a client bundle
 *  - all admin API routes are requireAdmin-guarded
 *  - checkout/financial write surfaces enforce rate limits
 *  - payment_receipts cannot be written from client paths (service/admin only)
 *  - webhook source verification where mutations are possible
 *  - InstaPay receipt storage remains private and service-role-driven
 *  - no hardcoded secrets in tracked source
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

function walkDir(rel: string): string[] {
    const abs = path.join(root, rel);
    const out: string[] = [];
    const entries = fs.readdirSync(abs, { withFileTypes: true });
    for (const e of entries) {
        const child = path.join(rel, e.name);
        if (e.isDirectory()) {
            out.push(...walkDir(child));
        } else {
            out.push(child);
        }
    }
    return out;
}

const SKIP_DIRS = ['node_modules', '.next', '.git', '.vercel', 'coverage', 'dist', '.agent'];

function listSourceFiles(): string[] {
    const all = walkDir('.');
    return all.filter(
        (f) =>
            !SKIP_DIRS.some((d) => f.includes(`${path.sep}${d}${path.sep}`) || f.startsWith(`${d}${path.sep}`)) &&
            /\.(ts|tsx|js|jsx|mjs|cjs|json|md|sql|yml|yaml|env\.example)$/.test(f)
    );
}

const CLIENT_ENTRY_FILES = [
    'lib/supabaseClient.ts',
    'shared/lib/supabase.ts',
    'shared/lib/env-reader.ts',
    'config/env.ts',
    'context/AuthContext.tsx',
    'features/auth/hooks/useLogin.ts',
    'features/auth/hooks/useSignup.ts',
    'shared/lib/calculator-history.ts',
];

const RATE_LIMITED_ROUTES = [
    'app/api/checkout/instapay/route.ts',
    'app/api/checkout/kashier/session/route.ts',
    'app/api/payments/create-session/route.ts',
    'app/api/affiliate/create/route.ts',
    'app/api/affiliate/me/route.ts',
    'app/api/affiliate/stats/route.ts',
    'app/api/affiliate/referrals/route.ts',
    'app/api/auth/check-password/route.ts',
    'app/api/calculate/route.ts',
];

const SECRET_PATTERNS: RegExp[] = [
    /sk_live_[A-Za-z0-9]{10,}/,
    /sk_test_[A-Za-z0-9]{10,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /ghp_[A-Za-z0-9]{36}/,
    /xox[baprs]-[A-Za-z0-9-]{10,}/,
];

/**
 * The Production PUBLISHABLE anon key is intentionally embedded as a fallback
 * default in a few client-entry files and documented in DEPLOYMENT_GUIDE.md
 * (finding F-8 — publishable by design, flagged for env-only cleanup in a
 * later batch). It is the ONLY full JWT allowed in source. The allowed token
 * is derived at runtime (the test never copies it); any OTHER full JWT (e.g.
 * a pasted service-role key) must trip the scan. The JWT-header pattern is
 * assembled from fragments so the test itself carries no verbatim secret seed.
 */
const jwtHeaderFragments = ['eyJhbGciOiJIUzI1NiIsInR5', 'cCI6IkpXVCJ9'];
const jwtHeader = jwtHeaderFragments.join('');
const JWT_PATTERN = new RegExp(jwtHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

describe('Security Hardening posture (static)', () => {
    it('SUPABASE_SERVICE_ROLE_KEY never referenced from client-entry files', () => {
        for (const rel of CLIENT_ENTRY_FILES) {
            const src = read(rel);
            expect(src, `${rel} must not expose the service-role key`).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
            expect(src, `${rel} must not expose a raw service_role jwt`).not.toMatch(/service_role/i);
        }
    });

    it('client-entry files hold no server secrets at all (only NEXT_PUBLIC_* envs)', () => {
        for (const rel of ['shared/lib/env-reader.ts', 'config/env.ts']) {
            const src = read(rel);
            expect(src).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|BOSTA_API_KEY|DHL_API_KEY|KASHIER.*(KEY|SECRET)/i);
        }
    });

    it('create-transfer.ts (service role) is imported only by tests, never by a client component', () => {
        const importer = 'kashier/payouts/create-transfer';
        const codeFiles = listSourceFiles().filter((f) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f));
        for (const f of codeFiles) {
            if (f.endsWith('create-transfer.ts')) continue;
            const src = read(f);
            if (src.includes(importer)) {
                const isTest = f.includes(`${path.sep}tests${path.sep}`) || f.startsWith('tests');
                expect(isTest, `non-test file imports service-role payouts helper: ${f}`).toBe(true);
            }
        }
    });

    it('every admin API route is requireAdmin-guarded', () => {
        const adminRoutes = walkDir('app/api/admin').filter((f) => f.endsWith('route.ts') && !f.includes('.test.'));
        expect(adminRoutes.length).toBeGreaterThan(0);
        for (const f of adminRoutes) {
            const src = read(f);
            expect(src, `${f} must call requireAdmin`).toContain('requireAdmin(');
        }
        const riskRoute = read('app/api/payments/evaluate-risk/route.ts');
        expect(riskRoute).toContain('requireAdmin(req)');
    });

    it('checkout/financial write routes enforce rate limits', () => {
        for (const rel of RATE_LIMITED_ROUTES) {
            const src = read(rel);
            expect(src, `${rel} must enforce a rate limit`).toContain('enforceRateLimit');
        }
    });

    it('payment_receipts can never be deleted by any API route', () => {
        const apiRoutes = walkDir('app/api').filter((f) => f.endsWith('route.ts') && !f.includes('.test.'));
        expect(apiRoutes.length).toBeGreaterThan(0);
        for (const f of apiRoutes) {
            const src = read(f);
            expect(
                src.match(/from\(['"]payment_receipts['"]\)\s*\.delete\(/g),
                `${f} must not delete payment_receipts`
            ).toBeNull();
        }
    });

    it('payment_receipts INSERT lives only in the service-role InstaPay route', () => {
        const apiRoutes = walkDir('app/api').filter((f) => f.endsWith('route.ts') && !f.includes('.test.'));
        for (const f of apiRoutes) {
            const src = read(f);
            const inserts = src.match(/from\(['"]payment_receipts['"]\)\s*\.insert\(/g);
            if (inserts) {
                const normalized = f.replace(/\\/g, '/');
                expect(normalized, `receipt insert outside InstaPay route: ${f}`).toContain('checkout/instapay');
            }
        }
    });

    it('InstaPay route writes receipts+orders through its own service-role client, not the shared anon client', () => {
        const src = read('app/api/checkout/instapay/route.ts');
        expect(src).toContain('SUPABASE_SERVICE_ROLE_KEY');
        expect(src).not.toContain("from '@/shared/lib/supabase'");
        expect(src).not.toContain('shared/lib/supabase');
        expect(src).not.toContain("lib/supabaseClient");
    });

    it('payment-webhook (mutation-capable edge function) verifies its source signature', () => {
        const src = read('supabase/functions/payment-webhook/index.ts');
        expect(src).toContain('x-spaceremit-signature');
        expect(src).toMatch(/[Ss]ignature/);
    });

    it("whatsapp-webhook performs zero DB writes (limits blast radius of its missing provider signature)", () => {
        const src = read('supabase/functions/whatsapp-webhook/index.ts');
        expect(src).not.toMatch(/\.from\(['"]/);
    });

    it("receipt storage is the PRIVATE 'payment-receipts' bucket via the service-role route client", () => {
        const src = read('app/api/checkout/instapay/route.ts');
        expect(src).toMatch(/const RECEIPT_BUCKET\s*=\s*'payment-receipts'/);
        expect(src).toContain('Private bucket');
    });

    it('admin receipt settle always writes an audit trail', () => {
        const src = read('app/api/admin/payment-receipts/[id]/route.ts');
        expect(src).toContain(".from('audit_log').insert(");
    });

    it('no hardcoded secret material in tracked source (except the documented publishable anon key)', () => {
        const supabaseClientSrc = read('shared/lib/supabase.ts');
        const match = supabaseClientSrc.match(/'([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)'/);
        const allowedAnon = match ? match[1] : '';
        expect(allowedAnon.length, 'shared anon key default should still be identifiable for the allow-list').toBeGreaterThan(100);
        expect(allowedAnon.split('.').length).toBe(3);

        const offenders: string[] = [];
        for (const f of listSourceFiles()) {
            const src = read(f).split(allowedAnon).join('');
            const isCode = /\.(ts|tsx|js|jsx|mjs|cjs|json)$/.test(f);
            const patterns = isCode ? [...SECRET_PATTERNS, JWT_PATTERN] : SECRET_PATTERNS;
            for (const re of patterns) {
                if (re.test(src)) {
                    offenders.push(`${f} matched ${re}`);
                    break;
                }
            }
        }
        expect(offenders, offenders.join('; ')).toEqual([]);
    });
});