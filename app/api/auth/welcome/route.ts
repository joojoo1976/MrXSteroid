/**
 * Route Handler — /api/auth/welcome
 * Sends the branded signup welcome/confirmation email to a new registrant from
 * the platform Gmail account (display name "MrXSteroid.com"). Fire-and-forget
 * from the client; always returns 200 so it never blocks the signup UX.
 */
import { sendWelcomeEmail, isEmailConfigured } from '../../../../shared/lib/emailService';
import { corsPreflightResponse } from '../../../../server/cors/corsConfig';

export async function OPTIONS(req: Request) {
    return corsPreflightResponse(req, 'POST, OPTIONS', 'Content-Type');
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const email = String(body.email ?? '').trim();
        const fullName = String(body.fullName ?? body.name ?? '').trim();
        const lang = body.lang === 'ar' ? 'ar' : 'en';

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return Response.json({ ok: false, reason: 'invalid email' }, { status: 200 });
        }
        if (!isEmailConfigured()) {
            return Response.json({ ok: false, reason: 'smtp-not-configured' }, { status: 200 });
        }

        const result = await sendWelcomeEmail({ to: email, fullName, lang });
        return Response.json(result, { status: 200 });
    } catch (err) {
        console.error('❌ [WelcomeEmail] Failed to send email:', err);
        return Response.json({ ok: false, reason: 'failed-to-send' }, { status: 200 });
    }
}

