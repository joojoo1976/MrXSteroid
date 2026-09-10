import { createClient } from "@supabase/supabase-js";
import { json, getUserFromRequest } from "../../../../server/affiliate/apiHelpers";

function generateReferralCode(seed: string): string {
    const base = seed.replace(/[^a-z0-9]/gi, "").slice(0, 5).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${base}${rand}`;
}

export async function POST(req: Request) {
    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "Unauthorized" }, 401);
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return json({ error: "Server config error" }, 500);
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    // Check already enrolled
    const { data: existing } = await supabase
        .from("affiliates").select("id,referral_code,status").eq("user_id", user.userId).maybeSingle();
    if (existing) return json({ enrolled: true, affiliate: existing }, 200);

    // Generate a unique referral code
    let referralCode = "";
    let attempts = 0;
    while (attempts < 10) {
        const candidate = generateReferralCode(user.userId);
        const { data: conflict } = await supabase
            .from("affiliates").select("id").eq("referral_code", candidate).maybeSingle();
        if (!conflict) { referralCode = candidate; break; }
        attempts++;
    }
    if (!referralCode) return json({ error: "Could not generate unique referral code, please try again" }, 500);

    const { data: affiliate, error } = await supabase
        .from("affiliates")
        .insert({ user_id: user.userId, referral_code: referralCode, status: "active" })
        .select("id,referral_code,status")
        .single();

    if (error || !affiliate) return json({ error: "Failed to create affiliate account", details: error?.message }, 500);

    // Audit log
    await supabase.from("affiliate_audit_logs").insert({
        affiliate_id: affiliate.id,
        actor_type: "affiliate",
        actor_id: user.userId,
        event_type: "affiliate_created",
        payload: { referral_code: referralCode },
    });

    return json({ enrolled: true, affiliate }, 201);
}
