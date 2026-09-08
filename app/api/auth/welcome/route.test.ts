/**
 * Integration tests for POST/OPTIONS /api/auth/welcome.
 * Only the network leaf (nodemailer) is mocked — the real route + emailService
 * logic runs, so this locks the branching contract against regressions without
 * touching the network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { sendMail } = vi.hoisted(() => ({
    sendMail: vi.fn(async () => ({ messageId: 'test-1', accepted: ['x'] })),
}));
vi.mock('nodemailer', () => ({
    createTransport: vi.fn(() => ({ verify: vi.fn(async () => true), sendMail })),
}));

import { POST, OPTIONS } from './route';

const req = (body: unknown) =>
    new Request('http://localhost/api/auth/welcome', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });

const clearSmtpEnv = () => {
    process.env.SMTP_PASS = '';
    process.env.GMAIL_APP_PASSWORD = '';
    process.env.SUPABASE_SMTP_PASSWORD = '';
};

describe('/api/auth/welcome', () => {
    beforeEach(() => { sendMail.mockClear(); });
    afterEach(() => { clearSmtpEnv(); });

    it('OPTIONS returns 204 with CORS headers', async () => {
        const res = await OPTIONS();
        expect(res.status).toBe(204);
        expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('rejects an invalid email (ok:false, no send)', async () => {
        process.env.GMAIL_APP_PASSWORD = 'fake-app-password';
        const res = await POST(req({ email: 'not-an-email', fullName: 'X', lang: 'en' }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toMatchObject({ ok: false, reason: 'invalid email' });
        expect(sendMail).not.toHaveBeenCalled();
    });

    it('no-ops when SMTP is not configured (ok:false, no send)', async () => {
        clearSmtpEnv();
        const res = await POST(req({ email: 'visitor@example.com', fullName: 'X', lang: 'en' }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toMatchObject({ ok: false, reason: 'smtp-not-configured' });
        expect(sendMail).not.toHaveBeenCalled();
    });

    it('sends the welcome email when configured (ok:true, provider smtp)', async () => {
        process.env.GMAIL_APP_PASSWORD = 'fake-app-password';
        const res = await POST(req({ email: 'visitor@example.com', fullName: 'Zara', lang: 'ar' }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toMatchObject({ ok: true, provider: 'smtp' });
        expect(sendMail).toHaveBeenCalledTimes(1);
        const mail = sendMail.mock.calls[0][0];
        expect(mail.to).toBe('visitor@example.com');
        expect(mail.from).toContain('MrXSteroid.com');
    });

    it('survives a send failure without throwing (ok:false, provider smtp)', async () => {
        process.env.GMAIL_APP_PASSWORD = 'fake-app-password';
        sendMail.mockRejectedValueOnce(new Error('535 BadCredentials'));
        const res = await POST(req({ email: 'visitor@example.com', fullName: 'X', lang: 'en' }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.ok).toBe(false);
        expect(json.provider).toBe('smtp');
    });
});
