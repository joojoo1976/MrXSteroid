/**
 * Integration tests for POST/OPTIONS /api/contact.
 * Mocks the two network leaves (nodemailer + @supabase/supabase-js) so the
 * real route logic (validation, dispatch branching, response shape) runs
 * without any network or DB side effects.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { sendMail } = vi.hoisted(() => ({
    sendMail: vi.fn(async () => ({ messageId: 'm-1' })),
}));
vi.mock('nodemailer', () => ({
    createTransport: vi.fn(() => ({ verify: vi.fn(async () => true), sendMail })),
}));

const { single } = vi.hoisted(() => ({
    single: vi.fn(async () => ({ data: { id: 'row-1' }, error: null })),
}));
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            insert: vi.fn(() => ({
                select: vi.fn(() => ({ single })),
            })),
        })),
    })),
}));

import { POST, OPTIONS } from './route';

const req = (body: unknown) =>
    new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });

const validBody = {
    name: 'Test User',
    email: 'visitor@example.com',
    topic: 'general',
    subject: 'Hello there',
    message: 'This is a test message body.',
};

const setEnv = (over: Record<string, string>) => {
    process.env.SENDGRID_API_KEY = over.SENDGRID_API_KEY ?? '';
    process.env.SMTP_PASS = over.SMTP_PASS ?? '';
    process.env.GMAIL_APP_PASSWORD = over.GMAIL_APP_PASSWORD ?? '';
    process.env.SUPABASE_SMTP_PASSWORD = over.SUPABASE_SMTP_PASSWORD ?? '';
};

describe('/api/contact', () => {
    beforeEach(() => { sendMail.mockClear(); single.mockClear(); });
    afterEach(() => { setEnv({}); });

    it('OPTIONS returns 204', async () => {
        const res = await OPTIONS();
        expect(res.status).toBe(204);
    });

    it('rejects malformed JSON with 400', async () => {
        setEnv({});
        const res = await POST(req('{ not json'));
        expect(res.status).toBe(400);
        expect(await res.json()).toMatchObject({ ok: false, error: 'Invalid JSON body' });
    });

    it('validates name length', async () => {
        setEnv({});
        const res = await POST(req({ ...validBody, name: 'A' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toMatch(/Name/);
    });

    it('validates email format', async () => {
        setEnv({});
        const res = await POST(req({ ...validBody, email: 'bad-email' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toMatch(/email/i);
    });

    it('validates subject length', async () => {
        setEnv({});
        const res = await POST(req({ ...validBody, subject: 'x' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toMatch(/Subject/);
    });

    it('validates message length', async () => {
        setEnv({});
        const res = await POST(req({ ...validBody, message: 'ab' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toMatch(/Message/);
    });

    it('stores + sends via SMTP when configured (SendGrid absent)', async () => {
        setEnv({ SMTP_PASS: 'fake-app-password' });
        const res = await POST(req(validBody));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toMatchObject({ ok: true, saved: true, emailSent: true, emailProvider: 'smtp' });
        expect(single).toHaveBeenCalledTimes(1);
        expect(sendMail).toHaveBeenCalledTimes(1);
        const mail = sendMail.mock.calls[0][0];
        expect(mail.to).toBe('foryoutalk@gmail.com');
        expect(mail.cc).toBe('support@mrxsteroid.com');
    });

    it('stores but does not send when no email provider configured', async () => {
        setEnv({});
        const res = await POST(req(validBody));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toMatchObject({ ok: true, saved: true, emailSent: false, emailProvider: 'none' });
        expect(single).toHaveBeenCalledTimes(1);
        expect(sendMail).not.toHaveBeenCalled();
    });

    it('uses SendGrid when API key present (no SMTP needed)', async () => {
        setEnv({ SENDGRID_API_KEY: 'SG.test' });
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(null, { status: 202 }),
        );
        const res = await POST(req(validBody));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toMatchObject({ ok: true, emailSent: true, emailProvider: 'sendgrid' });
        expect(fetchSpy).toHaveBeenCalled();
        fetchSpy.mockRestore();
    });
});
