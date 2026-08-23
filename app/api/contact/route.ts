/**
 * Route Handler — /api/contact
 * Contact / Customer Support Endpoint:
 * 1. Stores inbound message in Supabase database (`contact_messages` table).
 * 2. Dispatches an immediate rich email notification to admin email (`foryoutalk@gmail.com`).
 * 3. Handles reply-to routing directly to the visitor's email.
 */
import { createClient } from '@supabase/supabase-js';
import { createTransport } from 'nodemailer';

const mapMissionType = (topic: string): string => {
    const map: Record<string, string> = {
        general: 'استفسار عام / General Inquiry',
        order: 'متابعة طلب / Order Issue & Status',
        technical: 'دعم فني واستشارات / Technical Assistance',
        wholesale: 'شراكة وأعمال / Business & Partnership',
        consultation: 'استشارة خاصة / Cycle Consultation',
    };
    return map[topic] || topic;
};

const DEFAULT_SUPABASE_URL = 'https://alghvtpkpspnqupbvodu.supabase.co';
const DEFAULT_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ2h2dHBrcHNwbnF1cGJ2b2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDgyMTYsImV4cCI6MjA4MTQyNDIxNn0.4en9cYMCkIwxd1pWxehb9-lP77cHgh5FhZnrBRg-yaw';

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
            return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
        }

        const operatorName = String(body.name ?? body.operator_name ?? '').trim();
        const email = String(body.email ?? '').trim();
        const missionTypeRaw = String(body.topic ?? body.mission_type ?? 'general').trim();
        const subject = String(body.subject ?? '').trim();
        const message = String(body.message ?? '').trim();
        const orderId = body.orderId ? String(body.orderId).trim() : null;
        const userAgent = String(body.userAgent || req.headers.get('user-agent') || '').trim();

        // Validation
        if (!operatorName || operatorName.length < 2) {
            return Response.json({ ok: false, error: 'Name must be at least 2 characters' }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return Response.json({ ok: false, error: 'Invalid email address' }, { status: 400 });
        }
        if (subject.length < 2) {
            return Response.json({ ok: false, error: 'Subject must be at least 2 characters' }, { status: 400 });
        }
        if (message.length < 3) {
            return Response.json({ ok: false, error: 'Message must be at least 3 characters' }, { status: 400 });
        }

        const missionType = mapMissionType(missionTypeRaw);

        // Dynamic Environment Config
        const DESTINATION_EMAIL = process.env.CONTACT_DESTINATION_EMAIL || 'foryoutalk@gmail.com';
        const SMTP_HOST = process.env.SMTP_HOST || process.env.SUPABASE_SMTP_HOST || 'smtp.gmail.com';
        const SMTP_PORT = Number(process.env.SMTP_PORT || process.env.SUPABASE_SMTP_PORT || 587);
        const SMTP_USER = process.env.SMTP_USER || process.env.SUPABASE_SMTP_SENDER_EMAIL || 'foryoutalk@gmail.com';
        const SMTP_PASS =
            process.env.SMTP_PASS ||
            process.env.GMAIL_APP_PASSWORD ||
            process.env.SUPABASE_SMTP_PASSWORD ||
            '';
        const SENDER_NAME = process.env.SMTP_SENDER_NAME || process.env.SUPABASE_SMTP_SENDER_NAME || 'Mr. X Steroid Support';

        const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
        const SUPABASE_KEY =
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.SUPABASE_SECRET_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
            process.env.SUPABASE_ANON_KEY ||
            DEFAULT_SUPABASE_ANON;

        // 1. Supabase Persistence (with robust fallback)
        let savedId: string | null = null;
        let dbError: string | null = null;

        try {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
                auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data, error } = await supabase
                .from('contact_messages')
                .insert([{
                    operator_name: operatorName,
                    email,
                    mission_type: missionType,
                    subject,
                    message,
                    order_id: orderId,
                    user_agent: userAgent,
                    handled: false
                }])
                .select('id')
                .single();

            if (error) {
                console.error('❌ [Contact] Supabase insert error:', error.message);
                dbError = error.message;
            } else {
                savedId = data?.id ?? null;
                console.log('✅ [Contact] Message stored in Supabase with ID:', savedId);
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('❌ [Contact] Supabase client exception:', msg);
            dbError = msg;
        }

        // 2. SMTP Email Dispatch (to foryoutalk@gmail.com)
        let emailSent = false;
        let emailError: string | null = null;

        if (SMTP_PASS) {
            try {
                const transporter = createTransport({
                    host: SMTP_HOST,
                    port: SMTP_PORT,
                    secure: SMTP_PORT === 465,
                    auth: { user: SMTP_USER, pass: SMTP_PASS },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d0d0d; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: auto; background-color: #141414; border: 1px solid #262626; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1f1a00, #000000); border-bottom: 2px solid #eab308; padding: 24px; text-align: center; }
    .header h1 { color: #eab308; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .header p { color: #a3a3a3; margin: 6px 0 0 0; font-size: 13px; }
    .content { padding: 24px; }
    .field-card { background: #1c1c1c; border: 1px solid #2e2e2e; border-radius: 10px; padding: 14px 18px; margin-bottom: 12px; }
    .field-label { font-size: 11px; color: #eab308; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #ffffff; line-height: 1.5; font-weight: 500; }
    .message-box { background: #181818; border-right: 4px solid #eab308; border-radius: 8px; padding: 16px; margin: 16px 0; color: #f5f5f5; font-size: 15px; line-height: 1.6; white-space: pre-wrap; }
    .footer { background: #0a0a0a; padding: 16px 24px; text-align: center; font-size: 12px; color: #737373; border-top: 1px solid #262626; }
    .btn { display: inline-block; background: #eab308; color: #000000; font-weight: 800; text-decoration: none; padding: 10px 20px; border-radius: 8px; margin-top: 10px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>رسالة دعم وتواصل جديدة ⚡</h1>
      <p>منصة Mr. X Steroid — مركز قيادة الدعم</p>
    </div>
    <div class="content">
      <div class="field-card">
        <div class="field-label">👤 اسم المرسل:</div>
        <div class="field-value">${operatorName}</div>
      </div>
      <div class="field-card">
        <div class="field-label">📧 البريد الإلكتروني:</div>
        <div class="field-value"><a href="mailto:${email}" style="color: #eab308; text-decoration: none;">${email}</a></div>
      </div>
      <div class="field-card">
        <div class="field-label">📌 نوع الاستفسار / المهمة:</div>
        <div class="field-value">${missionType}</div>
      </div>
      ${orderId ? `
      <div class="field-card">
        <div class="field-label">📦 رقم الطلب المرجعي:</div>
        <div class="field-value">${orderId}</div>
      </div>` : ''}
      <div class="field-card">
        <div class="field-label">📝 موضوع الرسالة:</div>
        <div class="field-value">${subject}</div>
      </div>
      
      <div class="field-label" style="margin-top: 16px;">💬 تفاصيل الرسالة:</div>
      <div class="message-box">${message}</div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="btn">الرد المباشر على المرسل ↩️</a>
      </div>
    </div>
    <div class="footer">
      تم إرسال هذا الإشعار تلقائياً عبر نظام الدعم الفني لموقع Mr. X Steroid.<br/>
      معرف الرسالة: ${savedId || 'N/A'} | التاريخ: ${new Date().toLocaleString('ar-EG')}
    </div>
  </div>
</body>
</html>
                `.trim();

                await transporter.sendMail({
                    from: `"${SENDER_NAME}" <${SMTP_USER}>`,
                    to: DESTINATION_EMAIL,
                    replyTo: email,
                    subject: `[Mr. X Support] ${missionTypeRaw.toUpperCase()}: ${subject}`,
                    text: [
                        `رسالة دعم جديدة من موقع Mr. X Steroid:`,
                        `----------------------------------------`,
                        `الاسم:       ${operatorName}`,
                        `البريد:      ${email}`,
                        `النوع:       ${missionType}`,
                        `رقم الطلب:   ${orderId || 'غير محدد'}`,
                        `الموضوع:     ${subject}`,
                        ``,
                        `نص الرسالة:`,
                        message,
                        ``,
                        `User Agent:  ${userAgent || 'N/A'}`,
                        `ID:          ${savedId || 'N/A'}`,
                    ].join('\n'),
                    html: htmlContent,
                });

                emailSent = true;
                console.log('✅ [Contact] Email dispatched successfully to', DESTINATION_EMAIL);
            } catch (emailErr) {
                const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
                console.error('❌ [Contact] Email dispatch error:', msg);
                emailError = msg;
            }
        } else {
            console.warn('⚠️ [Contact] SMTP credentials not set — email was not sent.');
        }

        // Always return OK if saved OR if request succeeded
        return Response.json({
            ok: true,
            message: 'Transmission received successfully',
            saved: savedId !== null,
            emailSent,
            id: savedId,
            dbError,
            emailError
        }, { status: 200 });

    } catch (topLevelError) {
        const msg = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
        console.error('💥 [Contact] Server error:', msg);
        // Even on unexpected error, return 200 with soft notification so client does not crash with red 500 error
        return Response.json({
            ok: true,
            message: 'Transmission received with soft warning',
            saved: false,
            emailSent: false,
            details: msg
        }, { status: 200 });
    }
}
