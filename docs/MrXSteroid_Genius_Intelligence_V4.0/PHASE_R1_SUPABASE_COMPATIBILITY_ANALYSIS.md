# PHASE R1 — SUPABASE COMPATIBILITY ANALYSIS

**Date:** 2026-11-01
**Phase:** R1 — Controlled Architecture Foundation
**Status:** COMPLETE — PENDING OWNER REVIEW
**Mode:** READ-ONLY — No database writes, no migrations, no schema changes

---

## 1. user_tool_states Compatibility Analysis

### Live DB Schema (from information_schema.columns)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | YES | null |
| current_stack | jsonb | YES | '[]'::jsonb |
| s_score | numeric | YES | null |
| washout_date | timestamptz | YES | null |
| pct_start_date | timestamptz | YES | null |
| created_at | timestamptz | YES | now() |

### Repository Schema (supabase/schema.sql)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | YES (FK) | null |
| tool_id | INTEGER | NO | — |
| inputs | JSONB | YES | '{}'::jsonb |
| outputs | JSONB | YES | '{}'::jsonb |
| units | VARCHAR(10) | YES | 'metric' |
| language | VARCHAR(5) | YES | 'en' |
| created_at | TIMESTAMPTZ | YES | NOW() |
| updated_at | TIMESTAMPTZ | YES | NOW() |

### Code Usage (Actual Runtime)

**File: `lib/supabase/tool-state-sync.ts` (lines 3-47)**
- `saveToolState()`: Upserts `user_id, tool_id, inputs, outputs, units, language, updated_at` with `onConflict: 'user_id,tool_id'`
- `loadToolState()`: Selects `*` filtered by `user_id` + `tool_id`
- **Type:** `UserToolState` (from `lib/supabase/client.ts`): expects `tool_id: number, inputs, outputs, units, language, created_at, updated_at`

**File: `lib/utils/guestState.ts` (lines 97-122)**
- `syncGuestStateToSupabase()`: Upserts `user_id, current_stack, s_score, washout_date, pct_duration_weeks, selected_serm, hcg_phases, serm_phases, input_data, current_protocol, updated_at`
- **Type:** `GuestStateDbInsert`: expects `current_stack, s_score, washout_date, pct_duration_weeks, selected_serm, hcg_phases, serm_phases, input_data, current_protocol`

### Column Compatibility Matrix

| Column | Live DB | schema.sql | tool-state-sync.ts | guestState.ts | Verdict |
|--------|---------|------------|-------------------|---------------|---------|
| id | ✅ uuid | ✅ uuid | ✅ string | — | Compatible |
| user_id | ✅ uuid | ✅ uuid | ✅ string | ✅ string | Compatible |
| tool_id | ❌ | ✅ INTEGER | ✅ number | ❌ | **Live DB missing** |
| inputs | ❌ | ✅ JSONB | ✅ Record | ❌ | **Live DB missing** |
| outputs | ❌ | ✅ JSONB | ✅ Record | ❌ | **Live DB missing** |
| units | ❌ | ✅ VARCHAR | ✅ enum | ❌ | **Live DB missing** |
| language | ❌ | ✅ VARCHAR | ✅ enum | ❌ | **Live DB missing** |
| current_stack | ✅ jsonb | ❌ | ❌ | ✅ StackItem[] | **schema.sql missing** |
| s_score | ✅ numeric | ❌ | ❌ | ✅ number | **schema.sql missing** |
| washout_date | ✅ timestamptz | ❌ | ❌ | ✅ string | **schema.sql missing** |
| pct_start_date | ✅ timestamptz | ❌ | ❌ | ❌ | **Unused in code** |
| pct_duration_weeks | ❌ | ❌ | ❌ | ✅ number | **Live DB missing** |
| selected_serm | ❌ | ❌ | ❌ | ✅ string | **Live DB missing** |
| hcg_phases | ❌ | ❌ | ❌ | ✅ HcgPhase[] | **Live DB missing** |
| serm_phases | ❌ | ❌ | ❌ | ✅ SermPhase[] | **Live DB missing** |
| input_data | ❌ | ❌ | ❌ | ✅ Record | **Live DB missing** |
| current_protocol | ❌ | ❌ | ❌ | ✅ string | **Live DB missing** |
| created_at | ✅ timestamptz | ✅ TIMESTAMPTZ | — | — | Compatible |
| updated_at | ❌ | ✅ TIMESTAMPTZ | ✅ (set manually) | ✅ (set manually) | **Live DB missing** |
| UNIQUE(user_id, tool_id) | ❌ | ✅ | ✅ (onConflict) | ❌ | **Live DB missing** |

### Classification of Mismatch

**Type: Active Runtime Incompatibility + Legacy Schema**

The live database `user_tool_states` table was created with columns specific to PCT/stack tracking (`current_stack`, `s_score`, `washout_date`, `pct_start_date`) — this is a **legacy schema** from an earlier version of the app focused on cycle management. The `supabase/schema.sql` file defines a **different schema** (tool_id, inputs, outputs, units, language) that was never applied to the live database. The code in `lib/supabase/tool-state-sync.ts` expects the schema.sql version, while `lib/utils/guestState.ts` expects the legacy version. **Neither matches the live DB.**

**Runtime Impact:** Both code paths that reference `user_tool_states` will fail at runtime. However, both functions have zero production call sites (dead code). The runtime incompatibility is **theoretical** — it would fail if called, but is never called.

### Call Site Analysis

| Function | File | Call Sites (Production) | Status |
|----------|------|------------------------|--------|
| `saveToolState()` | `lib/supabase/tool-state-sync.ts:3` | 0 | Dead code |
| `loadToolState()` | `lib/supabase/tool-state-sync.ts:31` | 0 | Dead code |
| `syncGuestStateToSupabase()` | `lib/utils/guestState.ts:98` | 0 | Dead code (not wired) |
| `UserToolState` type | `lib/supabase/client.ts:25` | Used only in tool-state-sync.ts | Dead type |
| `GuestStateDbInsert` type | `lib/utils/guestState.ts:49` | Used only in guestState.ts | Dead type |

### Safe Integration Proposal (No Implementation)

**Option A: Reuse calculator_history (RECOMMENDED)**
- `calculator_history` already exists, has working RLS, and is used by 6 tools
- JSONB columns can store any tool's inputs/results
- No migration needed — just expand usage
- Preserve `user_tool_states` as-is for PCT/stack tracking

**Option B: Migrate user_tool_states**
- Add `tool_id`, `inputs`, `outputs`, `units`, `language`, `updated_at` columns
- Migrate legacy PCT data to new columns
- Risk: data loss if migration fails
- Requires owner approval for schema change

**Option C: Create new table (NOT RECOMMENDED)**
- Would require new migration
- Would fragment persistence layer
- Not needed — `calculator_history` is sufficient

**Recommendation:** Option A — reuse `calculator_history` as the unified persistence layer. No schema changes needed.

---

## 2. Missing Tables Analysis

### Tables in schema.sql but NOT in Live DB

| Table | In Live DB? | In Migrations? | In schema.sql? | In db_types.ts? | Used by Active Code? | Classification |
|-------|-------------|----------------|----------------|-----------------|---------------------|----------------|
| `user_preferences` | ❌ No | ❌ No | ✅ Yes (line 25) | ❌ No | ❌ No (only dead code) | **Legacy design, never implemented** |
| `tool_usage_analytics` | ❌ No | ❌ No | ✅ Yes (line 36) | ❌ No | ❌ No (only dead code) | **Legacy design, never implemented** |
| `tool_ratings` | ❌ No | ❌ No | ✅ Yes (line 46) | ❌ No | ❌ No | **Legacy design, never implemented** |
| `user_voice_commands` | ❌ No | ❌ No | ✅ Yes (line 57) | ❌ No | ❌ No (only dead code) | **Legacy design, never implemented** |
| `ai_user_profiles` | ❌ No | ❌ No | ✅ Yes (line 69) | ❌ No | ❌ No (only dead code) | **Legacy design, never implemented** |

### Tables in Live DB from Migrations NOT in schema.sql

| Table | In Live DB? | In Migrations? | In schema.sql? | In db_types.ts? | Used by Active Code? | Classification |
|-------|-------------|----------------|----------------|-----------------|---------------------|----------------|
| `user_tool_logs` | ❌ No | ✅ Yes (20260921120000) | ❌ No | ❌ No | ✅ Yes (server/tools/toolLogService.ts) | **Migration exists but NOT applied** |
| `user_profiles` | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No | **Created manually or earlier migration** |
| `user_history` | ✅ Yes | ✅ Yes (20260807070530) | ❌ No | ❌ No | ❌ No | **Migration applied, code doesn't use** |
| `body_fat_logs` | ✅ Yes | ✅ Yes (20260310200203) | ❌ No | ❌ No | ❌ No | **Migration applied, code doesn't use** |
| `fitness_logs` | ✅ Yes | ✅ Yes (20260310200203) | ❌ No | ❌ No | ❌ No | **Migration applied, code doesn't use** |
| `active_cycles` | ✅ Yes | ✅ Yes (20260310200517) | ❌ No | ❌ No | ❌ No | **Migration applied, code doesn't use** |

### Reconciliation Summary
- **5 tables exist ONLY in schema.sql** (design document, never migrated): `user_preferences`, `tool_usage_analytics`, `tool_ratings`, `user_voice_commands`, `ai_user_profiles`
- **1 table exists in migration but NOT in live DB**: `user_tool_logs` (migration exists but was never applied — returns 404)
- **3 tables exist in live DB but NOT in schema.sql**: `user_profiles`, `user_history`, `body_fat_logs` (and `fitness_logs`, `active_cycles`) — created via migrations not reflected in schema.sql
- **schema.sql is NOT the source of truth** — it's a design document that was never applied. The actual schema is managed through 75+ migration files.

---

## 3. RLS Policy Audit (Complete)

### Per-Table RLS Status

| Table | RLS Enabled | Policies | SELECT | INSERT | UPDATE | DELETE |
|-------|-------------|----------|--------|--------|--------|--------|
| `profiles` | ✅ | 5 | own or admin | own (role guard) | own or admin | admin only |
| `user_dashboard_data` | ✅ | 4 | own | own | own | admin or service_role |
| `calculator_history` | ✅ | 4 | own (+ admin all) | own | — (none) | own |
| `user_tool_states` | ✅ | 1 | own (ALL) | own (ALL) | own (ALL) | own (ALL) |
| `user_profiles` | ✅ | 1 | own (ALL) | own (ALL) | own (ALL) | own (ALL) |
| `payment_intents` | ✅ | 1 | **admin only** | — (none) | — (none) | — (none) |
| `fraud_observations` | ✅ | 1 | **service_role only** | **service_role only** | **service_role only** | **service_role only** |
| `payments` | ✅ | 2 | own or customer_email | own (status=pending) | — (none) | — (none) |
| `invoices` | ✅ | 4 | own or admin | own | — (none) | — (none) |
| `orders` | ✅ | 3 | own or admin or rep | own (or null user_id) | admin only | — (none) |
| `tool_registry` | ✅ | **0** | **DENY ALL** | **DENY ALL** | **DENY ALL** | **DENY ALL** |
| `user_history` | ✅ | 1 | own (ALL) | own (ALL) | own (ALL) | own (ALL) |
| `body_fat_logs` | ✅ | 2 | own or admin | own | — (none) | — (none) |
| `fitness_logs` | ✅ | 2 | own or admin | own | — (none) | — (none) |
| `active_cycles` | ✅ | 2 | own or admin | own | — (none) | — (none) |

### Critical Security Findings

1. **`tool_registry` has RLS enabled but NO policies** → **Deny all access** (no one can read or write, including authenticated users). This table is effectively inaccessible.

2. **`payment_intents` has NO user-level SELECT policy** → Only admin can access. Regular users cannot see their own payment status. Dashboard payment diagnostic panel is permanently broken for non-admins.

3. **`fraud_observations` is service_role only** → No user (including admin) can read fraud observations through the anon/authenticated key. Dashboard fraud panel is permanently broken for all users.

4. **`calculator_history` has no UPDATE policy** → Users cannot update saved results (only insert and delete).

5. **`payments` allows INSERT only if status='pending'** → Prevents users from creating payments with other statuses (good security).

6. **`profiles` has role escalation guard on INSERT** → Prevents users from self-assigning admin role (good security).

### Recommendation: Secure API for Payment/Fraud Data
Instead of direct table access, the dashboard should use a **secure backend API** (e.g., `/api/dashboard/payments`) that:
- Authenticates the user via session
- Returns only the user's own payment data (server-side, using service_role)
- Never exposes fraud observations to users
- Returns aggregated stats, not raw fraud data

---

## 3. Dashboard Data Access Matrix

| Dashboard Query | Table | Filter | RLS Result for Regular User | RLS Result for Admin | Error Handling |
|----------------|-------|--------|---------------------------|---------------------|----------------|
| Admin Stats | payment_intents | `.eq('user_id', user.id)` | **BLOCKED** — RLS admin-only returns 0 rows | Returns user's payments | Error caught, panel stays empty |
| Analytics Data | payment_intents | No filter, limit 5 | **BLOCKED** — RLS admin-only returns 0 rows | Returns 5 latest payments | Error caught, panel stays empty |
| Payment Diagnostic | payment_intents | `.eq('user_id', user.id).limit(1)` | **BLOCKED** — RLS admin-only returns null | Returns last payment | Error caught, panel stays empty |
| Fraud Engine | fraud_observations | No filter, limit 100 | **BLOCKED** — service_role only returns 0 rows | **BLOCKED** — service_role only returns 0 rows | Error caught, panel stays empty |
| Protocol Goals/Notes | user_dashboard_data | `.eq('user_id', user.id)` | **WORKS** | **WORKS** | Error caught, shows toast |
| Calculator History | calculator_history | `.eq('user_id', user.id)` | **WORKS** | **WORKS** (admin sees all) | Error caught, shows empty state |
| User Profile | profiles | AuthContext | **WORKS** | **WORKS** | Handled by AuthContext |

### Critical Finding: Silent Failures
The dashboard's admin-style panels (Stats, Analytics, Payment Diagnostic, Fraud Engine) silently fail for regular users because RLS blocks access. The code catches errors and leaves panels empty without informing the user. This creates a **misleading UX** where panels appear to be "not working" rather than "not accessible."

---

## 4. No Changes Made

- No database writes performed
- No migrations executed
- No schema changes
- No RLS policy changes
- No table creation or deletion
- No files created or modified (except this report)