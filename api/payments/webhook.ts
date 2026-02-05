import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
    // التحقق من وجود المفاتيح قبل البدء
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('CRITICAL: Missing Supabase environment variables in Vercel');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
            console.log(`✅ Subscription updated for: ${customer_email}`);
        }

        return res.status(200).json({ status: 'ok' });
    } catch (err: any) {
        console.error('Webhook Error:', err.message);
        return res.status(200).json({ error: 'Internal Error', message: err.message });
    }
}

