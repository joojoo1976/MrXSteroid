/**
 * Read-only pricing loader for POST /api/checkout/quote.
 *
 * The quote route itself stays free of database plumbing (and is source-tested
 * for that), while both quote and invoice paths resolve the SAME
 * `admin_settings > env > defaults` catalog. A missing Supabase env pair is a
 * pure/offline caller: it falls back to env/default pricing.
 */

import { createClient } from '@supabase/supabase-js';
import { basePricing, loadPricing, type PricingConfig } from './pricing';

export async function loadQuotePricing(): Promise<PricingConfig> {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return basePricing();

    const supabase = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
    return loadPricing(async () => {
        const { data } = await supabase.from('admin_settings').select('key, value');
        return (data || []) as Array<{ key: string; value: string }>;
    });
}
