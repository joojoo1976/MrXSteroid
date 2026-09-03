// @ts-expect-error: Deno standard library URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("📱 WhatsApp Trigger: Ready to send notifications...")

serve(async (req: Request) => {
    try {
        const { record } = await req.json()
        const email = record.email
        const tier = record.tier
        const lang = record.language || 'en'

        console.log(`🚀 Sending Welcome WhatsApp to ${email} for tier ${tier} in ${lang}`)

        // Twilio API Integration (Conceptual template as per QA plan)
        // const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
        // const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')

        // Template logic for multi-language consistency
        const templates = {
            ar: `مرحباً بك في عالم مستر إكس! 🦅 تم تفعيل اشتراكك في باقة ${tier}. يمكنك تحميل كتابك الآن من الرابط: www.mrxsteroid.com/dashboard`,
            en: `Welcome to the Mr. X protocols! 🦅 Your ${tier} subscription is now active. You can download your book from: www.mrxsteroid.com/dashboard`
        }

        const body = templates[lang as keyof typeof templates] || templates.en

        // Simulation of Outgoing Signal
        const payload = {
            to: `whatsapp:${record.phone || 'customer'}`,
            body: body
        }

        return new Response(JSON.stringify({ success: true, payload }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        })
    } catch (err: unknown) {
        const error = err as Error;
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
