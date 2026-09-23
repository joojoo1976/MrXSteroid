-- Phase 4: Lock the pricing/merchant reference tables to server-side access only.
--
-- Context:
--   * merchant_configs / product_prices / kashier_product_mappings are reference
--     mirror data with zero client consumers (no browser client exists in the app;
--     runtime resolution uses env/code: merchantResolver, CANONICAL_PRODUCTS,
--     admin_settings, resolveKashierSku).
--   * anon/authenticated currently carry full table privileges (Supabase default
--     bootstrap arwdDxtm); the only gate is RLS. Apply least privilege directly at
--     the grant level by removing ALL table privileges (incl. TRUNCATE/REFERENCES/
--     TRIGGER) so no unnecessary privilege remains.
--   * service_role (bypasses RLS) and postgres (owner) retain access. No new RLS
--     policies are created and RLS stays ENABLED.

revoke all privileges on table
    public.merchant_configs,
    public.product_prices,
    public.kashier_product_mappings
from anon, authenticated;