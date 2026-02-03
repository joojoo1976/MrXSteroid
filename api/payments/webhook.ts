
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase (Ensure keys are in Vercel env vars)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'POST') {
        const { status, customer_email, plan_type } = req.body;

        // Verify payment success from Spaceremit
        if (status === 'success') {
            const { error } = await supabase
                .from('profiles')
                .update({
                    subscription_status: 'active',
                    // Optional: Logic to calculate end date based on plan_type
                    plan_tier: plan_type || 'standard'
                })
                .eq('email', customer_email);

            if (error) {
                console.error("Webhook Error:", error);
                return res.status(500).json({ error: "Database update failed" });
            }

            return res.status(200).json({ message: "Subscription activated successfully" });
        } else {
            return res.status(200).json({ message: "Received, but status not success" });
        }
    }

    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
}
