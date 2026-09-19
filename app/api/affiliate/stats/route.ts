import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { json, getUserFromRequest } from "../../../../server/affiliate/apiHelpers";
import { enforceRateLimit, clientIp } from "../../../../lib/ratelimit";

const StatsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: Request) {
    const ip = clientIp(req);
    const rateCheck = await enforceRateLimit(`affiliate-stats:${ip}`);
    if (!rateCheck.success) {
        return json({ error: "Too many requests. Please try again later." }, 429);
    }

    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return json({ error: "Server config error" }, 500);

    const reqUrl = new URL(req.url);
    const parseResult = StatsQuerySchema.safeParse({
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

    const { data: ledger, count, error: ledgerErr } = await supabase
        .from("affiliate_commission_ledger")
        .select("id, transaction_type, amount, currency, balance_after, description, created_at", { count: "exact" })
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (ledgerErr) {
        return json({ error: "Database error fetching ledger", details: ledgerErr.message }, 500);
    }

    return json({
        stats: ledger ?? [],
        total: count ?? 0,
        page,
        limit,
    });
}
