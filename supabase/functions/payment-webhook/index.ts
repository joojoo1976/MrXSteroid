import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("💳 Payment Webhook: Listening for SpaceRemit events...")

serve(async (req) => {
    try {
        const payload = await req.json()
        const signature = req.headers.get('x-spaceremit-signature')

        // 1. Validate Idempotency using transaction_id (reference)
        const referenceId = payload.reference || payload.id

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Check if already processed
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('status')
            .eq('transaction_id', referenceId)
            .single()

        if (existingOrder?.status === 'completed') {
            console.log(`⏩ Transaction ${referenceId} already processed. Skipping.`)
            return new Response(JSON.stringify({ message: 'Already processed' }), { status: 200 })
        }

        // 2. Process Success Case
        if (payload.event === 'transaction.success') {
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'completed' })
                .eq('transaction_id', referenceId)

            if (updateError) throw updateError

            // Trigger Outgoing Notification (usually via DB Webhook or direct call)
            console.log(`✅ Transaction ${referenceId} confirmed. Subscription activated.`)
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        console.error("❌ Webhook Error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
