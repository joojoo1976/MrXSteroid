/**
 * P2 regression — /api/contact validation messages must follow the visitor's
 * language.
 *
 * Defect (QA 2026-09-25): submitting the Arabic contact form with an invalid
 * field returned English-only messages ("Name must be at least 2 characters",
 * "Invalid email address", ...) to an Arabic-speaking visitor. The success and
 * soft-warning bodies were English too.
 *
 * Locale is resolved in the same priority order the edge middleware uses:
 *   body.locale > x-locale header > Accept-Language > 'en' (backward-compatible
 *   default for clients that send no locale signal at all).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: () => ({
            insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'c1' }, error: null }) }) }),
        }),
    }),
}));

vi.mock('nodemailer', () => ({ createTransport: () => ({ sendMail: async () => ({}) }) }));

vi.mock('../../server/cors/corsConfig', () => ({
    corsPreflightResponse: () => new Response(null, { status: 204 }),
}));

const ARABIC = /[\u0600-\u06FF]/;

async function post(body: unknown, headers: Record<string, string> = {}) {
    const { POST } = await import('../../app/api/contact/route');
    const res = await POST(
        new Request('http://localhost/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(body),
        })
    );
    return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

const valid = { name: 'Test User', email: 'a@b.co', subject: 'Hello', message: 'Testing message' };

beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SENDGRID_API_KEY;
    delete process.env.SMTP_PASS;
});

describe('/api/contact localization', () => {
    it('returns Arabic messages when the x-locale header is ar', async () => {
        const { status, body } = await post({ ...valid, name: 'x' }, { 'x-locale': 'ar' });
        expect(status).toBe(400);
        expect(String(body.error)).toMatch(ARABIC);
    });

    it('returns English messages when the x-locale header is en', async () => {
        const { status, body } = await post({ ...valid, name: 'x' }, { 'x-locale': 'en' });
        expect(status).toBe(400);
        expect(String(body.error)).toMatch(/at least 2 characters/i);
    });

    it('honours an explicit body.locale over the header', async () => {
        const { body } = await post({ ...valid, email: 'not-an-email', locale: 'ar' }, { 'x-locale': 'en' });
        expect(String(body.error)).toMatch(ARABIC);
    });

    it('falls back to Accept-Language when no explicit locale is present', async () => {
        const { body } = await post({ ...valid, subject: 'x' }, { 'accept-language': 'ar-EG,ar;q=0.9' });
        expect(String(body.error)).toMatch(ARABIC);
    });

    it('defaults to ENGLISH when no locale signal exists at all (backward compatible)', async () => {
        const { body } = await post({ ...valid, message: 'ab' });
        expect(String(body.error)).not.toMatch(ARABIC);
        expect(String(body.error)).toMatch(/at least 3 characters/i);
    });

    it('defaults to ENGLISH for an English Accept-Language signal', async () => {
        const { body } = await post({ ...valid, message: 'ab' }, { 'accept-language': 'en-GB,en;q=0.9' });
        expect(String(body.error)).not.toMatch(ARABIC);
        expect(String(body.error)).toMatch(/at least 3 characters/i);
    });

    it('still returns Arabic for an Arabic Accept-Language signal', async () => {
        const { body } = await post({ ...valid, message: 'ab' }, { 'accept-language': 'ar-EG,ar;q=0.9' });
        expect(String(body.error)).toMatch(ARABIC);
    });

    it('localizes the invalid-email error', async () => {
        const { body } = await post({ ...valid, email: 'nope' }, { 'x-locale': 'ar' });
        expect(String(body.error)).toMatch(ARABIC);
        expect(String(body.error)).not.toMatch(/Invalid email/i);
    });

    it('localizes the short-subject error', async () => {
        const { body } = await post({ ...valid, subject: 'a' }, { 'x-locale': 'ar' });
        expect(String(body.error)).toMatch(ARABIC);
    });

    it('localizes the short-message error', async () => {
        const { body } = await post({ ...valid, message: 'a' }, { 'x-locale': 'ar' });
        expect(String(body.error)).toMatch(ARABIC);
    });

    it('localizes the invalid-JSON error', async () => {
        const { POST } = await import('../../app/api/contact/route');
        const res = await POST(
            new Request('http://localhost/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-locale': 'ar' },
                body: '{not json',
            })
        );
        expect(res.status).toBe(400);
        expect(String(((await res.json()) as Record<string, unknown>).error)).toMatch(ARABIC);
    });

    it('returns an Arabic success message for an Arabic submission', async () => {
        const { status, body } = await post(valid, { 'x-locale': 'ar' });
        expect(status).toBe(200);
        expect(String(body.message)).toMatch(ARABIC);
    });

    it('returns an English success message for an English submission', async () => {
        const { status, body } = await post(valid, { 'x-locale': 'en' });
        expect(status).toBe(200);
        expect(String(body.message)).not.toMatch(ARABIC);
    });

    it('never leaks an English-only validation string to an Arabic visitor', async () => {
        const englishOnly = [
            'Name must be at least 2 characters',
            'Invalid email address',
            'Subject must be at least 2 characters',
            'Message must be at least 3 characters',
            'Invalid JSON body',
            'Transmission received successfully',
        ];
        const cases = [
            { ...valid, name: 'x' },
            { ...valid, email: 'nope' },
            { ...valid, subject: 'x' },
            { ...valid, message: 'ab' },
            valid,
        ];
        for (const payload of cases) {
            const { body } = await post(payload, { 'x-locale': 'ar' });
            for (const msg of englishOnly) {
                expect(String(body.error ?? body.message)).not.toBe(msg);
            }
        }
    });
});
