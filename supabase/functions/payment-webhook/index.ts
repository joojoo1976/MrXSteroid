// @ts-expect-error: Deno standard library URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error: Supabase ESM URL import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * EXTREME VERIFICATION: satisfying IDE environment for Deno globals
 */
declare const Deno: {
    env: {
        get(key: string): string | undefined;
    };
};

console.log("💳 Payment Webhook: Listening for SpaceRemit events...")

serve(async (req: Request) => {
    try {
        const payload = await req.json()
        const signature = req.headers.get('x-spaceremit-signature')
        const webhookSecret = Deno.env.get('SPACEREMIT_WEBHOOK_SECRET')

        // 1. Validate Signature (Production Hardening)
        if (!signature || signature !== webhookSecret) {
            console.error("🔒 Invalid Webhook Signature Rejected")
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        // 2. Validate Idempotency using transaction_id (reference)
        const referenceId = payload.reference || payload.id

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Check if already processed
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('status')
            .eq('transaction_id', referenceId)
            .single()

        if (existingPayment?.status === 'completed' || existingPayment?.status === 'success') {
            console.log(`⏩ Transaction ${referenceId} already processed. Skipping.`)
            return new Response(JSON.stringify({ message: 'Already processed' }), { status: 200 })
        }

        // 2. Process Success Case
        if (payload.event === 'transaction.success') {
            // Update Payment Record
            const { data: updatedPayment, error: updateError } = await supabase
                .from('payments')
                .update({
                    status: 'completed',
                    updated_at: new Date().toISOString()
                })
                .eq('transaction_id', referenceId)
                .select('order_id')
                .single()

            if (updateError) throw updateError

            // Sync with Orders Table if order_id exists
            if (updatedPayment?.order_id) {
                console.log(`📦 Syncing Order ${updatedPayment.order_id}...`)
                await supabase
                    .from('orders')
                    .update({
                        status: 'completed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', updatedPayment.order_id)
            }

            // Trigger Outgoing Notification (usually via DB Webhook or direct call)
            console.log(`✅ Transaction ${referenceId} confirmed. Payment and Order status updated.`)
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (err: unknown) {
        const error = err as Error;
        console.error("❌ Webhook Error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
