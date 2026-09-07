# Supabase Migrations — Status & Reconciliation

## Current state (reconciled)
This folder was reconciled against the live database ledger
(`supabase_migrations.schema_migrations`) so that **`supabase db push` is a clean
no-op** (every file here is already recorded as applied; no duplicates).

- `supabase/migrations/` → **15 files**, each filename version matches a live
  ledger version exactly (14-digit `YYYYMMDDHHMMSS`).
- `supabase/migrations_prebaseline/` → **14 archived files**: early foundational
  migrations applied before the CLI ledger tracked them. Their schema is already
  live in the database; they are kept here (outside the `db push` scan path) for
  historical reference only. **Do not move them back** into `migrations/` — that
  would make `db push` try to re-apply them and fail.

## How to add a NEW migration (going forward)
```bash
supabase migration new <short_name>     # creates <YYYYMMDDHHMMSS>_<short_name>.sql
# edit the generated file with your DDL
supabase db push                         # applies it to the linked project
```
Always use the CLI-generated 14-digit timestamp so the repo filename matches the
ledger version the CLI records.

## Notes
- The live DB ledger contains additional migrations that have **no file** in this
  folder (applied via the dashboard/CLI without committing). These are harmless
  for `db push` (it only pushes repo files not yet in the ledger). To capture them
  as files, run `supabase db pull` on a machine with Docker (needs
  `SUPABASE_ACCESS_TOKEN`).
- The `profiles_auth_users_cascade` migration (`20260907220419`) adds
  `profiles.id → auth.users.id ON DELETE CASCADE`, fixing orphan profile rows
  left behind when an auth user is deleted.

## Verification performed
Automated cross-check confirmed: all 15 `migrations/*.sql` versions ∈ ledger,
zero duplicates → `supabase db push` is a clean no-op.
