
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import MessagingResponse from "https://esm.sh/twilio@3.84.0/lib/twiml/MessagingResponse.js";

console.log("🦅 Mr. X Webhook: Listening for WhatsApp Signals...")

serve(async (req) => {
    try {
        // 1. Parse FormData coming from Twilio
        const formData = await req.formData()
        const incomingMsg = formData.get("Body")?.toString().toLowerCase() || ""
        const from = formData.get("From")?.toString() || ""

        console.log(`📩 Incoming from ${from}: ${incomingMsg}`)

        // 2. Prepare TwiML Response
        const twiml = new MessagingResponse();

        if (incomingMsg.includes("سعر") || incomingMsg.includes("price")) {
            twiml.message("سعر الكتاب حالياً هو 49.99$ بدلاً من 100$. يمكنك الشراء من الرابط: mrxsteroid.vercel.app/buy");
        } else if (incomingMsg.includes("تفعيل") || incomingMsg.includes("activate")) {
            twiml.message("من فضلك أرسل رقم الطلب الخاص بك ليتم تفعيل حسابك فوراً.");
        } else {
            twiml.message("أهلاً بك في نظام مستر إكس الذكي. كيف يمكننا مساعدتك اليوم؟");
        }

        // 3. Return XML
        return new Response(twiml.toString(), {
            headers: { "Content-Type": "text/xml" },
        })

    } catch (error) {
        console.error("❌ Error processing webhook:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
})
