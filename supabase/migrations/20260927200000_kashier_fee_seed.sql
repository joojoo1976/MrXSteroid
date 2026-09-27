-- =============================================================================
-- MIGRATION: 20260927200000_kashier_fee_seed.sql
-- PHASE:     §6.3 NET fee source — Production fee policy seed
-- PREREQ:    20260927190000_guest_order_claims_and_gateway_fee.sql
--            (kashier_fee_schedules, kashier_fee_method_map tables must exist)
--
-- PURPOSE: Seed the APPROVED commercial fee schedules and exact method mappings
--          into Production. The schema migration deliberately seeds NO rows; this
--          migration supplies the owner-approved commercial facts.
--
--          APPROVED SCHEDULES (source: Owner Decision 3-5, recorded in
--          tests/helpers/kashierFeeFixtures.ts and gatewayFeeNet.test.ts):
--
--          card_settled:
--            rate_percent = 0.2000  (0.2%)
--            min_fee_minor = 1000    (10 EGP)
--            max_fee_minor = 30000000 (300,000 EGP)
--
--          instant_transfer:
--            rate_percent = 2.5000   (2.5%)
--            min_fee_minor = NULL
--            max_fee_minor = NULL
--
--          APPROVED METHOD MAPPINGS (exact normalized keys from fixture):
--          card_settled:
--            card, creditcard, debitcard, prepaidcard, visa, mastercard,
--            amex, americanexpress
--          instant_transfer:
--            wallet, ewallet, mobilewallet, vodafonecash, etisalatcash,
--            orangecash, instapay, banktransfer, onlinebanking
--
-- IDEMPOTENCE: ON CONFLICT DO NOTHING on PK. Re-running converges.
-- =============================================================================

-- 1. Seed the two approved fee schedules
insert into public.kashier_fee_schedules (
    code, rate_percent, min_fee_minor, max_fee_minor, active
) values
(
    'card_settled',
    0.2000,
    1000,
    30000000,
    true
),
(
    'instant_transfer',
    2.5000,
    NULL,
    NULL,
    true
)
on conflict (code) do nothing;

-- 2. Seed the exact approved method mappings
-- card_settled methods (card rails)
insert into public.kashier_fee_method_map (provider_method_key, schedule_code, active) values
('card',          'card_settled', true),
('creditcard',    'card_settled', true),
('debitcard',     'card_settled', true),
('prepaidcard',   'card_settled', true),
('visa',          'card_settled', true),
('mastercard',    'card_settled', true),
('amex',          'card_settled', true),
('americanexpress','card_settled', true)
on conflict (provider_method_key) do nothing;

-- instant_transfer methods (wallets, instant bank transfer, online banking)
insert into public.kashier_fee_method_map (provider_method_key, schedule_code, active) values
('wallet',         'instant_transfer', true),
('ewallet',        'instant_transfer', true),
('mobilewallet',   'instant_transfer', true),
('vodafonecash',   'instant_transfer', true),
('etisalatcash',   'instant_transfer', true),
('orangecash',     'instant_transfer', true),
('instapay',       'instant_transfer', true),
('banktransfer',   'instant_transfer', true),
('onlinebanking',  'instant_transfer', true)
on conflict (provider_method_key) do nothing;