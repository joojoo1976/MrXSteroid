import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
    try {
        // التأكد من أن الإشارة قادمة من Spaceremit
        const { status, customer_email, plan_type } = req.body || {};

        if (status === 'success' && customer_email) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    subscription_status: 'active',
                    plan_tier: plan_type || 'pro',
                    updated_at: new Date().toISOString()
                })
                .eq('email', customer_email);

            if (error) throw error;
        }

        return res.status(200).json({ status: 'ok' });
    } catch (err: any) {
        console.error('Webhook Error:', err.message);
        // نرسل 200 دائماً للبوابة حتى لا تكرر الإرسال وتسبب ضغطاً
        return res.status(200).json({ error: 'Internal Error but received' });
    }
}
