import { createClient } from "@supabase/supabase-js";

const getSupabaseAdmin = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase service role credentials");
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

export const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function getUserFromRequest(req: Request): Promise<{ userId: string } | null> {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return null;
    try {
        const supabase = getSupabaseAdmin();
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return { userId: user.id };
    } catch { return null; }
}

export { getSupabaseAdmin };
