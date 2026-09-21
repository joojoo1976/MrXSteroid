-- ============================================================================
-- Phase 9 — Corrective Migration (fraud_rules schema + data integrity)
-- Fixes 5 discrepancies found during comprehensive audit vs Architecture Lock:
--
--   [1] HIGH: fraud_rules.tags column MISSING in prod (migration declares it)
--   [2] HIGH: fraud_rules.action CHECK constraint missing 'BLOCK' value
--   [3] CRITICAL: seed rule IDs are SWAPPED in prod vs DEFAULT_RULES in
--       fraudService.ts (55549c79=Blocked Region, a6711e22=Amount Exceeded
--       in prod; a6711e22=Blocked Region, 55549c79=Amount Exceeded in code)
--   [4] Duplicate trigger from an earlier attempt (update_fraud_flag_trigger)
--       — both triggers update fraud_flag on INSERT (double-write, redundant)
--   [5] Align with architecture lock: single evaluation per decision insert
--
-- Preconditions (verified 2026-09-21):
--   - public.fraud_decisions is EMPTY (rows: 0)  → safe to swap rule IDs
--   - fraud_observations is EMPTY (rows: 0)      → no observation_id drift
--   - RLS policies exist on all 3 fraud tables   → untouched by this script
--
-- Idempotent. Safe to re-run.
-- ============================================================================

-- ── [1] Add missing tags column ─────────────────────────────────────────────
alter table public.fraud_rules
    add column if not exists tags text[] default '{}';

-- ── [2] Fix action CHECK constraint: add 'BLOCK' ────────────────────────────
-- Old constraint only allows (ALLOW, REVIEW, REJECT, NOTIFY).
-- Drop and recreate with the full 5-value set per the migration + code.
alter table public.fraud_rules
    drop constraint if exists fraud_rules_action_check;

alter table public.fraud_rules
    add constraint fraud_rules_action_check
    check (action in ('ALLOW', 'REVIEW', 'REJECT', 'NOTIFY', 'BLOCK'));

-- ── [3] Swap swapped rule IDs to match DEFAULT_RULES in fraudService.ts ────
-- Target state (matches code + committed migration seed):
--   a6711e22-ce89-413b-8bac-361f6d79f095 = 'Blocked Region'  (REJECT, 20)
--   55549c79-67b6-4d78-a0b7-08c697710a8a = 'Amount Exceeded' (REVIEW, 10)
--
-- 3-step swap via temp UUID (required because both IDs already exist).
-- Guard: only run when the rows are actually swapped (idempotency guard).

do $$
declare
    v_blocked_name  text;
    v_blocked_id    uuid;
    v_amount_id     uuid;
    v_tmp_id        uuid := '00000000-0000-0000-0000-000000000001';
begin
    -- Read current state
    select id into v_blocked_id from public.fraud_rules where name = 'Blocked Region';
    select id into v_amount_id  from public.fraud_rules where name = 'Amount Exceeded';

    -- Expected (already correct) → no-op
    if v_blocked_id = 'a6711e22-ce89-413b-8bac-361f6d79f095'
       and v_amount_id = '55549c79-67b6-4d78-a0b7-08c697710a8a' then
        raise notice 'Rule IDs already aligned with DEFAULT_RULES — no swap needed';
        return;
    end if;

    -- Unexpected (swapped) → perform 3-step swap
    if v_blocked_id = '55549c79-67b6-4d78-a0b7-08c697710a8a'
       and v_amount_id = 'a6711e22-ce89-413b-8bac-361f6d79f095' then
        update public.fraud_rules set id = v_tmp_id where id = v_blocked_id;
        update public.fraud_rules set id = '55549c79-67b6-4d78-a0b7-08c697710a8a'
            where id = v_amount_id;
        update public.fraud_rules set id = 'a6711e22-ce89-413b-8bac-361f6d79f095'
            where id = v_tmp_id;
        raise notice 'Rule IDs swapped to match DEFAULT_RULES';
        return;
    end if;

    raise warning 'Unexpected rule ID state: blocked=% amount=% — no swap performed',
        v_blocked_id, v_amount_id;
end$$;

-- Re-assert canonical seed values for the two swapped rows (name-safe update,
-- does not touch Default Allow rule-3).
update public.fraud_rules
set action = 'REJECT', priority = 20, updated_at = now()
where id = 'a6711e22-ce89-413b-8bac-361f6d79f095'
  and name = 'Blocked Region';

update public.fraud_rules
set action = 'REVIEW', priority = 10, updated_at = now()
where id = '55549c79-67b6-4d78-a0b7-08c697710a8a'
  and name = 'Amount Exceeded';

-- ── [4] Drop duplicate trigger from earlier attempt ────────────────────────
-- trg_fraud_decision_apply_flag (from committed migration) is the canonical one.
-- update_fraud_flag_trigger (earlier attempt) duplicates it → drop.
drop trigger if exists update_fraud_flag_trigger on public.fraud_decisions;

-- Drop the orphaned duplicate function if nothing references it.
drop function if exists public.update_fraud_flag();

-- ── [5] Verify (informational) ──────────────────────────────────────────────
-- After applying, these must hold:
--   SELECT column_name FROM information_schema.columns
--     WHERE table_schema='public' AND table_name='fraud_rules' AND column_name='tags';
--   → must return exactly 1 row
--
--   SELECT pg_get_constraintdef(oid) FROM pg_constraint
--     WHERE conrelid='public.fraud_rules'::regclass AND conname='fraud_rules_action_check';
--   → must include 'BLOCK'
--
--   SELECT id, name, priority FROM public.fraud_rules ORDER BY priority DESC;
--   → a6711e22... = Blocked Region (20), 55549c79... = Amount Exceeded (10)
--
--   SELECT tgname FROM pg_trigger WHERE tgrelid='public.fraud_decisions'::regclass
--     AND NOT tgisinternal;
--   → must return ONLY trg_fraud_decision_apply_flag
-- ============================================================================
