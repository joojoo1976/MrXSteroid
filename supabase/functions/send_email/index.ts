import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { name, email, inquiry_type, subject, message } = await req.json();
    if (!name || !email || !inquiry_type || !subject || !message) throw new Error("Missing fields");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");

    // 1. Save to DB (Guaranteed)
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await supabase.from("support_tickets").insert({ name, email, inquiry_type, subject, message });

    // 2. Send via Resend API (HTTPS - Bypasses Free Tier Block)
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("SENDER_EMAIL") || "onboarding@resend.dev";

    if (apiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `Mr. X-Steroid <${fromEmail}>`,
          to: ["[EMAIL]"], // Admin Target
          reply_to: email, // User Reply-To
          subject: `[${inquiry_type}] ${subject}`,
          html: `<h3>New Ticket</h3><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Type:</b> ${inquiry_type}</p><hr/><p>${message.replace(/\n/g, '<br>')}</p>`
        })
      });
      if (!res.ok) console.error("Resend Error:", await res.text());
      else console.log("✅ Email Sent via Resend");
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    console.error("❌ Function Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
