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
    const { data: ledger } = await supabase
        .from("affiliate_commission_ledger")
        .select("transaction_type, amount, currency, created_at")
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false })
        .limit(100);
    return json({ stats: ledger ?? [] });
}
