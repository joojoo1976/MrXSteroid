# Supabase Migrations — Status & Reconciliation Guide

## TL;DR
- The **`profiles_auth_users_cascade`** migration (adds `profiles.id → auth.users.id`
  `ON DELETE CASCADE`) is **fully aligned**: repo file
  `20260907220419_profiles_auth_users_cascade.sql` matches the live
  `supabase_migrations.schema_migrations` row (version `20260907220419`).
  `supabase db push` treats it as applied — no re-run.
- The **rest of this folder has pre-existing drift** vs the live database ledger
  (see below). Do **not** run `supabase db push` blindly until reconciled.

## The drift (pre-existing, not introduced by recent work)
The live DB ledger (`supabase_migrations.schema_migrations`) is the source of
truth and uses 14-digit versions (`YYYYMMDDHHMMSS`). Many files in this folder
use 8-digit date prefixes (`YYYYMMDD`) that do **not** match any ledger version,
and several ledger migrations have **no** file here (they were applied via the
dashboard/CLI without committing the file).

Concretely:
- **Exact version match (safe):** `20260805012110_revoke_execute_from_public_setup_fns`,
  `20260907220419_profiles_auth_users_cascade`.
- **Name matches a ledger version but filename timestamp differs** (e.g.
  `20260805_add_cms_tables` ↔ ledger `20260805002341 add_cms_tables`).
- **No ledger counterpart** (early foundational files applied before tracking):
  `create_payments_table`, `create_profiles_table`, `delegate_sync`,
  `final_auth_sync`, `add_avatar_to_profiles`, `add_payment_method_fields`,
  `advisor_fixes`, `billing_invoices_enhancement`, etc.

## Authoritative one-time fix (run with your own token)
The correct, safe way to make this folder mirror the live DB is the Supabase CLI
(it needs `SUPABASE_ACCESS_TOKEN`, which only the project owner has):

```bash
# 1) Authenticate
supabase login                       # or: export SUPABASE_ACCESS_TOKEN=<token>

# 2) Link the project (already linked: project_id = alghvtpkpspnqupbvodu)
supabase link --project-ref alghvtpkpspnqupbvodu

# 3) Re-baseline: capture the CURRENT live schema as the authoritative migration
#    history. Move the drifted files aside first (git keeps them):
git mv supabase/migrations supabase/migrations_drifted_backup
mkdir supabase/migrations
supabase db pull --local             # generates migrations from the live schema

# 4) Review the generated migration, commit, and from then on use:
#    supabase migration new <name>   -> edit -> supabase db push
```

After this, `supabase db push` is clean and the folder is trustworthy.

## Until then
- Apply schema changes via the **Supabase Dashboard SQL editor** or the MCP, and
  record them here as new `<YYYYMMDDHHMMSS>_<name>.sql` files using the SAME
  14-digit version the CLI/ledger uses.
- Never run `supabase db push` against production until the re-baseline above is done.
