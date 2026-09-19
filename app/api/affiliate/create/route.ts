import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import crypto from "crypto";
import { json, getUserFromRequest } from "../../../../server/affiliate/apiHelpers";
import { enforceRateLimit, clientIp } from "../../../../lib/ratelimit";

const CreateAffiliateSchema = z.object({
    agreeTerms: z.boolean().optional(),
}).optional();

function generateReferralCode(seed: string): string {
    const base = seed.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase();
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `${base}${randomHex}`;
}

export async function POST(req: Request) {
    const ip = clientIp(req);
    const rateCheck = await enforceRateLimit(`affiliate-create:${ip}`);
    if (!rateCheck.success) {
        return json({ error: "Too many requests. Please try again later." }, 429);
    }

    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    // Rate limit per user
    const userRateCheck = await enforceRateLimit(`affiliate-create:user:${user.userId}`);
    if (!userRateCheck.success) {
        return json({ error: "Too many requests for this user." }, 429);
    }

    try {
        const body = await req.json().catch(() => ({}));
        CreateAffiliateSchema.parse(body);
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return json({ error: "Invalid request payload", details: err.issues }, 400);
        }
    }

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return json({ error: "Server configuration error" }, 500);

    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    // Check if already enrolled
    const { data: existing, error: existingErr } = await supabase
        .from("affiliates")
        .select("id,referral_code,status,current_balance,lifetime_earnings,total_referrals,total_paid_referrals")
        .eq("user_id", user.userId)
        .maybeSingle();

    if (existingErr) {
        return json({ error: "Database error checking existing affiliate", details: existingErr.message }, 500);
    }

    if (existing) {
        return json({ enrolled: true, affiliate: existing }, 200);
    }

    // Generate a unique collision-resistant referral code
    let referralCode = "";
    let attempts = 0;
    while (attempts < 10) {
        const candidate = generateReferralCode(user.userId);
        const { data: conflict } = await supabase
            .from("affiliates")
            .select("id")
            .eq("referral_code", candidate)
            .maybeSingle();
        if (!conflict) {
            referralCode = candidate;
            break;
        }
        attempts++;
    }

    if (!referralCode) {
        return json({ error: "Could not generate unique referral code, please try again" }, 500);
    }

    const { data: affiliate, error } = await supabase
        .from("affiliates")
        .insert({
            user_id: user.userId,
            referral_code: referralCode,
            status: "active",
        })
        .select("id,referral_code,status,current_balance,lifetime_earnings,total_referrals,total_paid_referrals")
        .single();

    if (error || !affiliate) {
        return json({ error: "Failed to create affiliate account", details: error?.message }, 500);
    }

    // Immutable audit log
    await supabase.from("affiliate_audit_logs").insert({
        affiliate_id: affiliate.id,
        actor_type: "affiliate",
        actor_id: user.userId,
        event_type: "affiliate_created",
        payload: { referral_code: referralCode },
    });

    return json({ enrolled: true, affiliate }, 201);
}
