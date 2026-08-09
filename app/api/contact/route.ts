/**
 * Route Handler — /api/contact
 * Contact/transmission endpoint: persists the message to Supabase
 * (contact_messages) and dispatches an email notification via SMTP.
 * Adapted from the legacy Vercel serverless function to the App Router.
 */
import { createClient } from '@supabase/supabase-js';
import { createTransport } from 'nodemailer';

const DESTINATION_EMAIL = process.env.CONTACT_DESTINATION_EMAIL || 'foryoutalk@gmail.com';

const SMTP_HOST = process.env.SMTP_HOST || process.env.SUPABASE_SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || process.env.SUPABASE_SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || process.env.SUPABASE_SMTP_SENDER_EMAIL || 'foryoutalk@gmail.com';
const SMTP_PASS =
    process.env.SMTP_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SUPABASE_SMTP_PASSWORD ||
    '';

const SENDER_NAME = process.env.SMTP_SENDER_NAME || process.env.SUPABASE_SMTP_SENDER_NAME || 'Mr. X Steroid';

const mapMissionType = (topic: string): string => {
    const map: Record<string, string> = {
        general: 'General Inquiry',
        order: 'Order Issue/Status',
        technical: 'Technical Assistance',
        wholesale: 'Business/Partnership',
        consultation: 'Cycle Consultation',
    };
    return map[topic] || topic;
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(req: Request) {
    try {
        let body: Record<string, unknown>;
        try {
            body = await req.json();
        } catch {
            return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const operatorName = String(body.name ?? body.operator_name ?? '').trim();
        const email = String(body.email ?? '').trim();
        const missionTypeRaw = String(body.topic ?? body.mission_type ?? 'general').trim();
        const subject = String(body.subject ?? '').trim();
        const message = String(body.message ?? '').trim();
        const orderId = body.orderId ? String(body.orderId).trim() : null;
        const userAgent = String(body.userAgent || req.headers.get('user-agent') || '').trim();

        if (!operatorName || operatorName.length < 2) {
            return Response.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return Response.json({ error: 'Invalid email address' }, { status: 400 });
        }
        if (subject.length < 5) {
            return Response.json({ error: 'Subject must be at least 5 characters' }, { status: 400 });
        }
        if (message.length < 10) {
            return Response.json({ error: 'Message must be at least 10 characters' }, { status: 400 });
        }

        const missionType = mapMissionType(missionTypeRaw);

        const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

        let savedId: string | null = null;
        if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
            const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
                auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data, error } = await admin
                .from('contact_messages')
                .insert([{
                    operator_name: operatorName,
                    email,
                    mission_type: missionType,
                    subject,
                    message,
                    order_id: orderId,
                    user_agent: userAgent,
                }])
                .select('id')
                .single();

            if (error) {
                console.error('❌ [Contact] Supabase insert error:', error.message);
                return Response.json({ error: 'Failed to store message' }, { status: 500 });
            }
            savedId = data?.id ?? null;
        } else {
            console.warn('⚠️ [Contact] Supabase not configured — skipping persistence.');
        }

        let emailSent = false;
        if (SMTP_PASS) {
            try {
                const transporter = createTransport({
                    host: SMTP_HOST,
                    port: SMTP_PORT,
                    secure: SMTP_PORT === 465,
                    auth: { user: SMTP_USER, pass: SMTP_PASS },
                });

                await transporter.sendMail({
                    from: `"${SENDER_NAME}" <${SMTP_USER}>`,
                    to: DESTINATION_EMAIL,
                    replyTo: email,
                    subject: `[Contact] ${subject}`,
                    text: [
                        `New contact form submission (Mr. X Steroid).`,
                        ``,
                        `Operator:  ${operatorName}`,
                        `Email:     ${email}`,
                        `Mission:   ${missionType}`,
                        `Subject:   ${subject}`,
                        `Order ID:  ${orderId || '—'}`,
                        ``,
                        `Message:`,
                        message,
                        ``,
                        `User Agent: ${userAgent || '—'}`,
                    ].join('\n'),
                });
                emailSent = true;
                console.log('✅ [Contact] Email dispatched to', DESTINATION_EMAIL);
            } catch (emailErr) {
                const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
                console.error('❌ [Contact] Email dispatch failed:', msg);
            }
        } else {
            console.warn('⚠️ [Contact] SMTP password not configured — email NOT sent.');
        }

        const saved = savedId !== null;
        if (!saved && !emailSent) {
            return Response.json({ error: 'Message could not be processed' }, { status: 500 });
        }

        return Response.json({
            ok: true,
            message: 'Transmission received',
            saved,
            emailSent,
            id: savedId,
        });
    } catch (topLevelError) {
        const msg = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
        console.error('💥 [Contact] TOP-LEVEL CRASH:', msg);
        return Response.json({ error: 'Server initialization error', message: msg }, { status: 500 });
    }
}
