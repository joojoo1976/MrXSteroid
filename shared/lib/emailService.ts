/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  emailService.ts — Branded transactional email (Gmail SMTP via Nodemailer)
 *
 *  Reusable, server-side email dispatcher for the platform's transactional
 *  mail (signup welcome / confirmation, etc.). Sends from the Gmail account
 *  `foryoutalk@gmail.com` under the display name "MrXSteroid.com" so the
 *  message lands in the visitor's inbox branded as the site.
 *
 *  Design:
 *   • Pure config from env with safe defaults; NEVER throws — returns a result
 *     object so callers can fire-and-forget without breaking the main flow.
 *   • Bilingual templates (AR/EN) chosen by the recipient's language.
 *   • Requires an App Password in env (GMAIL_APP_PASSWORD / SMTP_PASS). When
 *     absent it no-ops with a clear reason (mirrors the contact route policy).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createTransport } from 'nodemailer';

const SITE_NAME = 'MrXSteroid.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mrxsteroid.com';

export interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    senderName: string;
}

export function getSmtpConfig(): SmtpConfig {
    return {
        host: process.env.SMTP_HOST || process.env.SUPABASE_SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || process.env.SUPABASE_SMTP_PORT || 587),
        user: process.env.SMTP_USER || process.env.SUPABASE_SMTP_SENDER_EMAIL || 'foryoutalk@gmail.com',
        pass:
            process.env.SMTP_PASS ||
            process.env.GMAIL_APP_PASSWORD ||
            process.env.SUPABASE_SMTP_PASSWORD ||
            '',
        senderName: process.env.SMTP_SENDER_NAME || SITE_NAME,
    };
}

export function isEmailConfigured(): boolean {
    return !!getSmtpConfig().pass;
}

export interface SendResult {
    ok: boolean;
    provider: 'smtp' | 'none';
    reason?: string;
}

/** Low-level dispatch. Never throws. */
export async function sendEmail(opts: {
    to: string;
    subject: string;
    html: string;
    text: string;
    cc?: string;
}): Promise<SendResult> {
    const cfg = getSmtpConfig();
    if (!cfg.pass) {
        return { ok: false, provider: 'none', reason: 'SMTP password not configured (set GMAIL_APP_PASSWORD)' };
    }
    try {
        const transporter = createTransport({
            host: cfg.host,
            port: cfg.port,
            secure: cfg.port === 465,
            auth: { user: cfg.user, pass: cfg.pass },
            tls: { rejectUnauthorized: false },
        });
        await transporter.sendMail({
            from: `"${cfg.senderName}" <${cfg.user}>`,
            to: opts.to,
            cc: opts.cc,
            subject: opts.subject,
            text: opts.text,
            html: opts.html,
        });
        return { ok: true, provider: 'smtp' };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, provider: 'smtp', reason: msg };
    }
}

function wrapHtml(inner: string, isAr: boolean): string {
    return `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#e5e5e5;}
  .wrap{max-width:600px;margin:0 auto;padding:24px;}
  .card{background:#141414;border:1px solid #262626;border-radius:16px;overflow:hidden;}
  .head{background:linear-gradient(135deg,#1f1a00,#000);border-bottom:2px solid #eab308;padding:28px;text-align:center;}
  .head h1{color:#eab308;margin:0;font-size:26px;letter-spacing:1px;}
  .body{padding:28px;line-height:1.7;font-size:15px;}
  .btn{display:inline-block;background:#eab308;color:#000;font-weight:800;text-decoration:none;padding:12px 26px;border-radius:10px;margin-top:8px;}
  .foot{padding:18px 28px;text-align:center;font-size:12px;color:#737373;border-top:1px solid #262626;}
</style></head>
<body><div class="wrap"><div class="card">
  <div class="head"><h1><a href="${SITE_URL}" style="color:#eab308;text-decoration:none">${SITE_NAME}</a></h1></div>
  <div class="body">${inner}</div>
  <div class="foot">© ${new Date().getFullYear()} ${SITE_NAME} — ${isAr ? 'لأغراض تعليمية وبحثية، وليست نصيحة طبية.' : 'Educational & research use only — not medical advice.'}</div>
</div></div></body></html>`;
}

/** Branded signup welcome / confirmation email. */
export async function sendWelcomeEmail(params: {
    to: string;
    fullName: string;
    lang?: 'ar' | 'en';
}): Promise<SendResult> {
    const isAr = (params.lang || 'en') === 'ar';
    const name = params.fullName?.trim() || (isAr ? 'بطلنا الجديد' : 'Athlete');

    const subject = isAr
        ? `مرحباً بك في ${SITE_NAME} 🦅 — أكمل تفعيل حسابك`
        : `Welcome to ${SITE_NAME} 🦅 — please confirm your account`;

    const text = isAr
        ? `مرحباً ${name}،\n\nشكراً لتسجيلك في ${SITE_NAME}. لتفعيل حسابك بالكامل، اضغط على رابط التأكيد الذي أرسلناه إليك من بريدنا.\n\nإذا لم تجد الرسالة خلال دقائق، تفقّد مجلد البريد المزعج (Spam).\n\n${SITE_URL}`
        : `Hi ${name},\n\nThanks for registering with ${SITE_NAME}. To fully activate your account, click the confirmation link we sent from our inbox.\n\nIf you don't see it within a few minutes, check your Spam/Junk folder.\n\n${SITE_URL}`;

    const inner = isAr
        ? `<p>مرحباً <strong style="color:#eab308">${name}</strong>،</p>
           <p>تم استلام تسجيلك في <strong>${SITE_NAME}</strong> بنجاح. لتفعيل حسابك بالكامل، افتح رابط التأكيد الذي وصلك في بريدك الإلكتروني.</p>
           <p>لم يصلك البريد؟ تفقّد مجلد <strong>الرسائل غير المرغوب فيها (Spam/Junk)</strong>، أو أعد المحاولة بعد قليل.</p>
           <p style="text-align:center"><a class="btn" href="${SITE_URL}/login">تسجيل الدخول بعد التفعيل</a></p>`
        : `<p>Hi <strong style="color:#eab308">${name}</strong>,</p>
           <p>Your registration at <strong>${SITE_NAME}</strong> was received. To fully activate your account, open the confirmation link that arrived in your inbox.</p>
           <p>Didn't get it? Check your <strong>Spam/Junk</strong> folder, or try again shortly.</p>
           <p style="text-align:center"><a class="btn" href="${SITE_URL}/login">Log in after verifying</a></p>`;

    return sendEmail({ to: params.to, subject, text, html: wrapHtml(inner, isAr) });
}
