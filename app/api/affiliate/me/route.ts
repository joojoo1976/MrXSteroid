import { createClient } from "@supabase/supabase-js";
import { json, getUserFromRequest } from "../../../../server/affiliate/apiHelpers";
import { getTierName } from "../../../../server/affiliate/commissionConfig";

export async function GET(req: Request) {
    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return json({ error: "Server config error" }, 500);
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: affiliate, error } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.userId)
        .maybeSingle();

    if (error) return json({ error: "Database error" }, 500);
    if (!affiliate) return json({ affiliate: null, enrolled: false }, 200);

    // Monthly stats for tier display
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
    const tier = getTierName(monthlyPaidReferrals);

    return json({
        enrolled: true,
        affiliate: {
            id: affiliate.id,
            referralCode: affiliate.referral_code,
            status: affiliate.status,
            currentBalance: affiliate.current_balance,
            lifetimeEarnings: affiliate.lifetime_earnings,
            totalReferrals: affiliate.total_referrals,
            totalPaidReferrals: affiliate.total_paid_referrals,
            customCommissionRate: affiliate.custom_commission_rate,
            tier,
            monthlyPaidReferrals,
            createdAt: affiliate.created_at,
        },
    });
}
