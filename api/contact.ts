/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  📨 CONTACT / TRANSMISSION PROTOCOL — Vercel Serverless Function         ║
 * ║  Route: POST /api/contact                                                ║
 * ║  1) Persists the message into public.contact_messages (service role).    ║
 * ║  2) Dispatches an immediate email notification with all details to       ║
 * ║     the destination inbox (default: foryoutalk@gmail.com).               ║
 * ║  Email transport: Nodemailer via Gmail SMTP (reliable Inbox delivery).   ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createTransport } from 'nodemailer';

const ALLOWED_ORIGINS = [
    'https://mrxsteroid.vercel.app',
    'https://mrxsteroid.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
];

// Destination inbox for contact form notifications.
const DESTINATION_EMAIL = process.env.CONTACT_DESTINATION_EMAIL || 'foryoutalk@gmail.com';

// Gmail SMTP configuration (fallback chain keeps .env / Vercel env agnostic).
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // ─── CORS ─────────────────────────────────────────────────────────
        const origin = req.headers.origin || '';
        const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
        res.setHeader('Access-Control-Allow-Origin', corsOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // ─── PAYLOAD ──────────────────────────────────────────────────────
        const body = req.body ?? {};
        const operatorName = String(body.name ?? body.operator_name ?? '').trim();
        const email = String(body.email ?? '').trim();
        const missionTypeRaw = String(body.topic ?? body.mission_type ?? 'general').trim();
        const subject = String(body.subject ?? '').trim();
        const message = String(body.message ?? '').trim();
        const orderId = body.orderId ? String(body.orderId).trim() : null;
        const userAgent = String(body.userAgent || req.headers['user-agent'] || '').trim();

        if (!operatorName || operatorName.length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        if (subject.length < 5) {
            return res.status(400).json({ error: 'Subject must be at least 5 characters' });
        }
        if (message.length < 10) {
            return res.status(400).json({ error: 'Message must be at least 10 characters' });
        }

        const missionType = mapMissionType(missionTypeRaw);

        // ─── 1) PERSIST TO SUPABASE ───────────────────────────────────────
        const { createClient } = await import('@supabase/supabase-js');
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
                return res.status(500).json({ error: 'Failed to store message' });
            }
            savedId = data?.id ?? null;
        } else {
            console.warn('⚠️ [Contact] Supabase not configured — skipping persistence.');
        }

        // ─── 2) DISPATCH EMAIL ────────────────────────────────────────────
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

        // ─── RESPONSE ──────────────────────────────────────────────────────
        const saved = savedId !== null;
        if (!saved && !emailSent) {
            return res.status(500).json({ error: 'Message could not be processed' });
        }

        return res.status(200).json({
            ok: true,
            message: 'Transmission received',
            saved,
            emailSent,
            id: savedId,
        });
    } catch (topLevelError) {
        const msg = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
        console.error('💥 [Contact] TOP-LEVEL CRASH:', msg);
        return res.status(500).json({ error: 'Server initialization error', message: msg });
    }
}