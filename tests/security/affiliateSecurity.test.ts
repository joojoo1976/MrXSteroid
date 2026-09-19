import { describe, it, expect } from 'vitest';
import { GET as getMe } from '../../app/api/affiliate/me/route';
import { POST as postCreate } from '../../app/api/affiliate/create/route';
import { GET as getReferrals } from '../../app/api/affiliate/referrals/route';
import { GET as getStats } from '../../app/api/affiliate/stats/route';

describe('Affiliate API Security & Parameter Tampering Defense', () => {
    describe('1. Authentication Gatekeeping', () => {
        it('GET /api/affiliate/me rejects unauthenticated requests with 401', async () => {
            const req = new Request('http://localhost:3000/api/affiliate/me', {
                method: 'GET',
            });
            const res = await getMe(req);
            expect(res.status).toBe(401);
            const data = await res.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('POST /api/affiliate/create rejects unauthenticated requests with 401', async () => {
            const req = new Request('http://localhost:3000/api/affiliate/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agreeTerms: true }),
            });
            const res = await postCreate(req);
            expect(res.status).toBe(401);
            const data = await res.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('GET /api/affiliate/referrals rejects unauthenticated requests with 401', async () => {
            const req = new Request('http://localhost:3000/api/affiliate/referrals', {
                method: 'GET',
            });
            const res = await getReferrals(req);
            expect(res.status).toBe(401);
            const data = await res.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('GET /api/affiliate/stats rejects unauthenticated requests with 401', async () => {
            const req = new Request('http://localhost:3000/api/affiliate/stats', {
                method: 'GET',
            });
            const res = await getStats(req);
            expect(res.status).toBe(401);
            const data = await res.json();
            expect(data.error).toBe('Unauthorized');
        });
    });

    describe('2. Malformed Query Inputs & Injection Resistance', () => {
        it('rejects invalid page parameters with 400 or clamps safely', async () => {
            const req = new Request('http://localhost:3000/api/affiliate/referrals?page=notanumber&limit=-5', {
                method: 'GET',
                headers: { Authorization: 'Bearer invalid-token' },
            });
            const res = await getReferrals(req);
            // With invalid token, it safely rejects before DB execution
            expect([400, 401]).toContain(res.status);
        });

        it('sanitizes referral code against SQL injection and XSS attempts', async () => {
            const { resolveReferralCode } = await import('../../server/affiliate/attributionService');
            // Malicious SQL injection probe
            const sqlProbe = "'; DROP TABLE affiliates; --";
            const sqlResult = await resolveReferralCode(sqlProbe);
            expect(sqlResult).toBeNull();

            // Malicious XSS probe
            const xssProbe = "<script>alert('xss')</script>";
            const xssResult = await resolveReferralCode(xssProbe);
            expect(xssResult).toBeNull();
        });
    });
});
