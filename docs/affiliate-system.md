# Affiliate System

## Overview
Cookie-based referral attribution with immutable commission records.

## Commission Tiers (UTC monthly boundaries)
| Tier | Monthly Qualified Sales | Rate |
|------|------------------------|------|
| Bronze | 1–10 | 25% |
| Silver | 11–50 | 35% |
| Gold | 51+ | 45% |
| Custom override | Any | Admin-set % |

Custom rate always overrides tier rate. Tier rates are immutable once recorded.

## Commission Base
`commission_base = product_subtotal - discount_amount`  
Shipping is NEVER included in commission base.

## Attribution Flow
1. Visitor clicks referral link: `GET /api/referral/track?ref=CODE`
2. Server validates code, sets `mrx_ref` cookie (HttpOnly, 60-day window)
3. Customer purchases: `POST /api/payments/create-invoice`
4. Server reads `mrx_ref` cookie, validates, stores `affiliate_id` in invoice (self-referral blocked)
5. Payment confirmed via webhook → `triggerAffiliateCommission(invoiceId)` called
6. Atomic Postgres RPC creates referral + ledger entry + updates affiliate balance

## Self-Referral Protection
Server-side check in `create-invoice/route.ts`: affiliate's `user_id` vs purchasing user's `user_id`. If match → attribution stripped, order proceeds normally.

## InstaPay
InstaPay invoices require manual admin commission action. `triggerAffiliateCommission` skips them automatically.

## Database Tables
- `affiliates` — one per enrolled user
- `referrals` — one per commission event (immutable rates)
- `affiliate_commission_ledger` — append-only financial ledger
- `affiliate_audit_logs` — immutable audit trail

## Atomic Operations
`affiliate_create_commission` and `affiliate_create_reversal` Postgres functions run all DB writes in a single transaction with `SELECT FOR UPDATE` row locking.

## Dashboard
`/profile/affiliate` — noindex, requires auth
