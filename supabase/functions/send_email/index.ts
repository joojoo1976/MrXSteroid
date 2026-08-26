import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, inquiry_type, subject, message } = body;

    // 1. Validation
    if (!name || !email || !inquiry_type || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 2. Database Integration (Save Ticket)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("support_tickets").insert({
        name, email, inquiry_type, subject, message
      });
    }

    // 3. Email Configuration (SMTP)
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");

    if (!smtpUser || !smtpPass) {
      console.error("Missing SMTP credentials");
      // We continue execution even if SMTP fails, so DB is saved
    } else {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, 
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"Mr. X-Steroid Support" <${smtpUser}>`, // Sender
        to: "foryoutalk@gmail.com", // Admin Inbox
        replyTo: email, // User's email for reply
        subject: `[${inquiry_type}] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nType: ${inquiry_type}\n\nMessage:\n${message}`,
        html: `<h3>New Support Ticket</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Type:</strong> ${inquiry_type}</p><hr/><p>${message.replace(/\n/g, '<br>')}</p>`
      });
    }

    return new Response(
      JSON.stringify({ message: "Ticket received successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
