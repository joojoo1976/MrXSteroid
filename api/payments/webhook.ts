
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
    try {
        const { status, customer_email, plan_type } = req.body || {};

        if (status === 'success' && customer_email) {
            await supabase
                .from('profiles')
                .update({
                    subscription_status: 'active',
                    plan_tier: plan_type || 'standard'
                })
                .eq('email', customer_email);
        }
    } catch (err) {
        console.error('Webhook processing error:', err);
    }

    res.status(200).json({ status: 'ok' });
}
