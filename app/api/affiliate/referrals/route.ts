import { createClient } from "@supabase/supabase-js";
import { json, getUserFromRequest } from "../../../../server/affiliate/apiHelpers";

export async function GET(req: Request) {
    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "Unauthorized" }, 401);
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return json({ error: "Server config error" }, 500);
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: affiliate } = await supabase
        .from("affiliates").select("id").eq("user_id", user.userId).maybeSingle();
    if (!affiliate) return json({ error: "Not enrolled as affiliate" }, 404);
    const searchParams = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;
    const { data: referrals, count } = await supabase
        .from("referrals")
        .select("id,referral_code,amount,currency,commission_amount,commission_rate,tier,status,created_at", { count: "exact" })
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
    return json({ referrals: referrals ?? [], total: count ?? 0, page, limit });
}
