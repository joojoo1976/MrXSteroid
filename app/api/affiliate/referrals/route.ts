import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { json, getUserFromRequest } from "../../../../server/affiliate/apiHelpers";
import { enforceRateLimit, clientIp } from "../../../../lib/ratelimit";

const ReferralsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: Request) {
    const ip = clientIp(req);
    const rateCheck = await enforceRateLimit(`affiliate-referrals:${ip}`);
    if (!rateCheck.success) {
        return json({ error: "Too many requests. Please try again later." }, 429);
    }

    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return json({ error: "Server configuration error" }, 500);

    const reqUrl = new URL(req.url);
    const parseResult = ReferralsQuerySchema.safeParse({
        page: reqUrl.searchParams.get("page") ?? 1,
        limit: reqUrl.searchParams.get("limit") ?? 20,
    });

    if (!parseResult.success) {
        return json({ error: "Invalid query parameters", details: parseResult.error.issues }, 400);
    }

    const { page, limit } = parseResult.data;
    const offset = (page - 1) * limit;

    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id")
        .eq("user_id", user.userId)
        .maybeSingle();

    if (!affiliate) return json({ error: "Not enrolled as affiliate" }, 404);

    const { data: referrals, count, error: refErr } = await supabase
        .from("referrals")
        .select("id, referral_code, amount, currency, commission_base_amount, commission_amount, commission_rate, tier, status, attribution_source, created_at", { count: "exact" })
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (refErr) {
        return json({ error: "Database error fetching referrals", details: refErr.message }, 500);
    }

    const formattedReferrals = (referrals ?? []).map(r => ({
        id: r.id,
        referralCode: r.referral_code,
        amount: Number(r.amount) || 0,
        currency: r.currency,
        commissionBaseAmount: Number(r.commission_base_amount) || 0,
        commissionAmount: Number(r.commission_amount) || 0,
        commissionRate: Number(r.commission_rate) || 0,
        tier: r.tier,
        status: r.status,
        attributionSource: r.attribution_source,
        createdAt: r.created_at,
    }));

    return json({
        referrals: formattedReferrals,
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit) || 1,
    });
}
