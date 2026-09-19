import { createClient } from "@supabase/supabase-js";
import { json, getUserFromRequest } from "../../../../server/affiliate/apiHelpers";
import { getTierName, COMMISSION_TIERS } from "../../../../server/affiliate/commissionConfig";
import { enforceRateLimit, clientIp } from "../../../../lib/ratelimit";

export async function GET(req: Request) {
    const ip = clientIp(req);
    const rateCheck = await enforceRateLimit(`affiliate-me:${ip}`);
    if (!rateCheck.success) {
        return json({ error: "Too many requests. Please try again later." }, 429);
    }

    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return json({ error: "Server configuration error" }, 500);

    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: affiliate, error } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.userId)
        .maybeSingle();

    if (error) return json({ error: "Database error", details: error.message }, 500);
    if (!affiliate) return json({ affiliate: null, enrolled: false }, 200);

    // Monthly stats for tier display (UTC month boundaries)
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();

    const { count: monthlyCount } = await supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("affiliate_id", affiliate.id)
        .eq("status", "approved")
        .gte("created_at", monthStart)
        .lt("created_at", monthEnd);

    const monthlyPaidReferrals = monthlyCount ?? 0;
    const tier = affiliate.custom_commission_rate !== null && affiliate.custom_commission_rate !== undefined
        ? "custom"
        : getTierName(monthlyPaidReferrals);

    // Current commission rate
    const currentCommissionRate = affiliate.custom_commission_rate ??
        (COMMISSION_TIERS.find(t => t.name === tier)?.rate ?? 25);

    return json({
        enrolled: true,
        affiliate: {
            id: affiliate.id,
            referralCode: affiliate.referral_code,
            status: affiliate.status,
            currentBalance: Number(affiliate.current_balance) || 0,
            lifetimeEarnings: Number(affiliate.lifetime_earnings) || 0,
            totalReferrals: Number(affiliate.total_referrals) || 0,
            totalPaidReferrals: Number(affiliate.total_paid_referrals) || 0,
            customCommissionRate: affiliate.custom_commission_rate !== null ? Number(affiliate.custom_commission_rate) : null,
            currentCommissionRate,
            tier,
            monthlyPaidReferrals,
            createdAt: affiliate.created_at,
        },
    });
}
