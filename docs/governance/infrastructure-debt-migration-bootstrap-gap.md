# Infrastructure Debt — Migration Bootstrap Gap

**Status:** FROZEN. Documented, not acted upon.
**Scope:** Repository infrastructure. **Explicitly OUTSIDE** Dynamic Keyword Intelligence.
**Date frozen:** 2026-09-30
**Authorised actions in this state:** documentation only.

> This report is deliberately **disconnected** from the Dynamic Keyword
> Initiative. The SEO migrations A′/B/C/D are NOT the cause of this debt, and
> this debt is NOT a reason to modify them. They are two separate problems that
> happen to be discovered in the same session.

---

## 1. Summary

The repository **cannot rebuild its own database from scratch.** Three tables
that the migration chain depends on exist in Production but are created by
**no migration in this repository**.

Consequence: `supabase db reset` fails at **migration 1 of 68**, long before
any SEO migration is reached.

---

## 2. The three objects

### Evidence line (as required)

```text
profiles  = Production exists / repository bootstrap missing
invoices  = Production exists / repository bootstrap missing
orders    = Production exists / repository bootstrap missing
```

| Table | First migration that depends on it | `create table` in repository | Production rows |
|---|---|---|---|
| `public.profiles` | `20260316084151_add_subscription_tier_to_profiles.sql` | **MISSING** | **11** |
| `public.invoices` | `20260910220000_extend_invoices_for_payments.sql` | **MISSING** | **79** |
| `public.orders` | `20260924174753_m1a_orders_additive.sql` | **MISSING** | **0** |

`orders` has zero rows but the table exists — created and then never populated,
or populated and later emptied.

### Control tables (created by the repository, for comparison)

| Table | Created by repository | Production rows |
|---|---|---|
| `order_splits` | yes | 0 |
| `payment_intents` | yes | 14 |
| `seo_keywords` | yes | 234 |

These confirm the detection method is sound: tables the repository creates are
present and reported, and only the three genuinely missing ones are absent.

---

## 3. Point of failure

```text
supabase db reset
  └─ applies migrations in timestamp order
       └─ 20260316084151_add_subscription_tier_to_profiles.sql   ← FIRST
            └─ ALTER TABLE public.profiles ADD COLUMN ...
                 └─ ERROR: relation "public.profiles" does not exist
                      SQLSTATE 42P01
```

Verbatim local output:

```text
Starting database...
Initialising schema...
Seeding globals from roles.sql...
Applying migration 20260316084151_add_subscription_tier_to_profiles.sql...
ERROR: relation "public.profiles" does not exist (SQLSTATE 42P01)
At statement: 0
```

**Migration 1 of 68 fails.** The SEO migrations occupy positions ~57-60 and are
never reached.

Note the assumption pattern: each of the three migrations issues an
`ALTER TABLE` with no preceding `CREATE TABLE`. The dependency is implicit and
undocumented.

---

## 4. Why the schema cannot be reconstructed from the repository

### 4.1 What the repository does contain

| Table | `add column` statements found | Base columns |
|---|---|---|
| `profiles` | ~0 | **UNKNOWN** |
| `invoices` | ~30 | **UNKNOWN** |
| `orders` | ~33 | **UNKNOWN** |

### 4.2 What is unrecoverable

`ALTER` statements record only *what was added later*. They do not record:


---

## 5. Whether existing history can supply the schema

**No.** Evaluated sources:

| Source | Sufficient? | Reason |
|---|---|---|
| `supabase/migrations/` | No | contains no `create table` for any of the three |
| Git history | Not relied upon | outside the frozen scope; and even a deleted founding migration would not make the *current* repository rebuildable |
| `supabase/seed.sql` | No | seeds data, not DDL |
| `supabase/config.toml` | No | project ref only |
| Production | Authoritative | but extracting it IS schema reconstruction, which is out of scope |

---

## 6. Evidence required to proceed (for the future task)

When this is reopened, the following must be obtained before any founding
migration is designed:

1. **Authoritative schema dump of the three tables**, including:
   - full column definitions (type, nullability, default)
   - primary key and all foreign keys
   - CHECK constraints
   - indexes
   - RLS status, policies, and grants
2. **The same for any table a later migration turns out to need** — the current
   list is derived from statement-position references and may be incomplete. A
   successful `db reset` is the only complete proof.
3. **Confirmation of the intended bootstrap path**: whether the three tables
   were created via the Supabase Dashboard (implying an ongoing process gap),
   or by a migration that was never committed.

Recommended extraction order (subject to independent approval):

```text
pg_dump --schema-only (three tables)      → exact DDL
compare against every referencing ALTER   → confirm no drift
draft founding migrations                 → review
local rebuild + full db reset             → prove it
```

---

## 7. Boundaries observed while freezing this report

```text
✅ No founding migration created for profiles / invoices / orders
✅ No schema extracted from Production
✅ No attempt to make `db reset` pass
✅ No existing file modified — this document is a new file
✅ No Production writes (all probes were HTTP GET)
✅ No `db push` / `db push --dry-run` / `migration repair`
✅ A′ / B / C / D unchanged; their safety review remains PASS
✅ No GSC, no provider verification
✅ No commit / push / deploy
```

---

## 8. Relationship to the Dynamic Keyword Initiative

**None, by design.**

- The SEO migrations are **not** the cause of this debt.
- This debt is **not** a justification to alter A′, B, C or D.
- A′ → B → C → D remain **READY pending safety review, NOT APPLIED**, and are
  gated on their own execution criteria.

The Dynamic Keyword work continues from the same baseline later. It does not
proceed until the bootstrap gap is decided independently.

- the original column set (`id`, `created_at`, totals, …)
- primary keys and foreign keys
- CHECK constraints, NOT NULL, DEFAULT on the original columns
- indexes
- **RLS policies** — these reference `auth.uid()` and cannot be inferred

Roughly 30 altered columns out of an unknown original total. The remainder is
not present in the repository in any form.

### 4.3 Why a guessed founding migration would be unsafe

A hand-written `CREATE TABLE` would produce a schema that *appears* to satisfy
every later `ALTER` while differing from Production in the parts that matter:
column types, nullability, defaults, keys, and access policies. Migrations would
then run "successfully" against a database that does not resemble the real one,
producing false confidence rather than a fix.

**Therefore: no reconstruction. No guessing.**
