# PHASE 1 — DECISION RECORD (owner-approved)

**Date:** 2026-09-24
**Authority:** owner approval message ("الاعتماد النهائي والتصويبات الأخيرة")
**Governing prompt:** `docs/governance/MASTER_IMPLEMENTATION_GOVERNANCE_PROMPT.md` (§67 — Phase 1 = Contracts + Source-of-Truth approval)
**Phase 0 report:** `docs/governance/2026-09-24-read-only-reconciliation.md`
**Mode of this phase:** DESIGN ONLY. No SQL executed, no migration created, no code change, no production mutation.

---

## 1. Approved decisions

| ID | Decision (owner-approved) | Effect on Phase 0 findings | Does **not** decide |
| --- | --- | --- | --- |
| **D1** | **Canonical Order = Option A (Convergence).** Supabase becomes the primary canonical order source. | Resolves §12 Option A/B/C. Enables the `orders` migration design. | Whether `orders` is formalised in place or a new canonical table is introduced — **OPEN-1**. |
| **D2** | **Fourthwall = Global External Commerce System**, activated **only** when the customer presses "خارج مصر / Global". The external order is created there and synchronized into Supabase as a **Mirror Record**. | Resolves the Phase 0 Fourthwall ownership question at business level. | Technical contract (API/webhooks/signature/currency control) — `BLOCKED` until Partner access; provider-agnostic envelope is designed, every Fourthwall-specific detail stays `TO VERIFY`. |
| **D3** | **Local shipping = flat 199 EGP** (correcting all three 239 EGP paths); **Bosta = Primary Local Shipping Provider**, behind a `ShippingProvider` adapter so other local carriers can be added later. | Resolves Phase 0 **P1** and the Bosta `MISSING` finding at design level. | Bosta endpoint/auth/idempotency details (`TO VERIFY`). Change scope — **OPEN-2**. |
| **D4** | **Global online coaching = 349.99 USD**; **200.00 USD is cancelled**. | Resolves Phase 0 **P2**. | Whether 200.00 survives as a guarded deprecated constant — **OPEN-3**. |
| **D5** | **All legacy Kashier `PP-…` identifiers are cancelled**; the owner-approved `PL-…` list is adopted. | Resolves Phase 0 **P10** at identity level. | **Payment Sessions vs static PL links — OPEN-4 (high risk).** |
| **D6** | **Custom Consultation = independent Canonical Product `MRX-CONSULT`** at **299 EGP / 30 USD**, rendered in the cart **above** the online-coaching box using the **same checkbox mechanism**. | Resolves Phase 0 **P8** (`MISSING`). | Exact slug/SKU and standalone-vs-add-on scope — **OPEN-5**. |
| **D7** | **Admin security:** all admin write/update operations move to **Server Routes protected by `requireAdmin`**; CRUD privileges are withdrawn from the browser and from `anon` / `authenticated`. | Resolves the Phase 0 section O deviation from prompt §11. | Revocation sequencing — **OPEN-6** (must not break the current dashboard). |
| **D8** | **§47 copy approved (Arabic only).** | Partially closes `CONTENT INPUT REQUIRED`. | **English copy not supplied** → **OPEN-7**. |

---

## 2. Approved §47 copy (verbatim, Arabic)

> **"احصل على خطة تدريبية وتغذوية مخصصة بالكامل تحت إشراف مباشر لضمان أفضل النتائج بأمان."**

This sentence must render **above** `إضافة تدريب شخصي أونلاين` at the Phase 0-identified anchors:

| Surface | File | Anchor |
| --- | --- | --- |
| Checkout product selector | `features/checkout/ProductSelector.tsx` | line 324 |
| Marketing pricing section | `features/marketing/PricingSection.tsx` | line 285 |
| i18n AR | `i18n/ar.ts` | line 2082 (`pricingAddCoaching`) — new sibling key required |
| Order summary add-on | `features/checkout/OrderSummary.tsx` | line 76 |
| Pricing grid suffix | `features/billing/components/PricingGrid.tsx` | lines 44-45 |

**No copy was written into code in this phase.** The Arabic string above is the approved source text; implementation adds a new i18n key (proposed `pricingCoachingAddonNote`) plus its EN counterpart once supplied (OPEN-7).

---

## 3. Frozen product/price contract (per D3, D4, D5, D6)

| Canonical product | Slug / SKU | Egypt | Global | Channel |
| --- | --- | --- | --- | --- |
| Digital Protocol | `protocol` / `MRX-PROTOCOL` | 499 EGP | 49.99 USD | both |
| Tactical Bundle (glossy paperback) | `tactical` / `MRX-TACTICAL` | 749 EGP | 72.00 USD | both |
| Smart Professional (hardcover) | `smart-pro` / `MRX-SMART-PRO` | 849 EGP | 82.00 USD | both |
| **Custom Consultation** | `consultation` / **`MRX-CONSULT`** | **299 EGP** | **30.00 USD** | both — checkbox **above** coaching |
| Online coaching add-on | add-on of the three packages | 9,999 EGP | **349.99 USD** | both — checkbox |
| Local shipping (Bosta) | shipping charge, **not** a product | **199 EGP** | n/a | EG only |
| International shipping (DHL) | shipping charge | n/a | provider quote | GLOBAL only |

**Forbidden in every channel** (prompt §31): `GLOBAL + EGP`, `EG + USD`, `GLOBAL + InstaPay`, `GLOBAL + Bosta`, `EG + DHL`, `EG + Global merchant`, `GLOBAL + Egypt merchant`.

---

## 4. Open items carried into Phase 1

| ID | Open item | Why it matters | Blocks |
| --- | --- | --- | --- |
| **OPEN-1** | Formalise Production `orders` in place vs introduce a new canonical table (with `orders` as a legacy view). | The repository has **no** migration creating `orders`; real DDL, row count and constraints are unknown. | M1 application |
| **OPEN-2** | 239 → 199 change scope: `server/payments/pricing.ts` only, or also `shared/lib/logic.ts`, `shared/lib/locationData.ts`, `shared/lib/paymobProducts.ts` (Paymob legacy)? | Three sources disagree; Production `admin_settings` was never read. | Phase 4 |
| **OPEN-3** | Delete `COACHING_ADDON_USD = 200.00` outright, or keep it as a guarded deprecated constant? | A live 200.00 display path is a price-integrity risk. | Phase 4 / 9 |
| **OPEN-4** | **Website checkout: keep Kashier v3 Payment Sessions (server-authoritative amount) and store `PL-…` as reference mappings — or switch to static PL links?** | Static links remove server-side amount authority and idempotency (`invoices.idempotency_key`, `computeAmount` validation). Security-relevant. | Phase 4 |
| **OPEN-5** | Consultation: standalone only or also a package add-on? Exact slug/SKU. | Determines `kashier_product_mappings` rows, entitlement and cart rules. | M1 / Phase 3 |
| **OPEN-6** | Sequencing for D7: admin UI currently writes `orders` **from the browser** (`MissionControl.tsx:1173`). The server route must ship **before** client UPDATE is revoked. | Revoking first breaks admin order handling. | M3 / Phase 8 |
| **OPEN-7** | English copy for the §47 sentence. | Bilingual UI must not show a missing string. | Phase 9 |
| **OPEN-8** | Production read-only Supabase access, Vercel env **names**, Fourthwall Partner access, rotated Bosta key. | Closes remaining `BLOCKED` rows (Production `orders` DDL, `admin_settings`, provider contracts). | Migrations + Phases 4-6 |

---

## 5. Phase 1 deliverables

| Deliverable | File |
| --- | --- |
| Decision record (this file) | `docs/governance/phase1/PHASE1-DECISION-RECORD.md` |
| Migration Design — canonical `orders` (§50-compliant) | `docs/governance/phase1/PHASE1-MIGRATION-DESIGN-ORDERS.md` |
| API & Webhook Contracts — Fourthwall mirror, Bosta adapter, consultation/coaching, admin write routes | `docs/governance/phase1/PHASE1-API-WEBHOOK-CONTRACTS.md` |

**Status: Phase 1 design complete — awaiting owner approval of the migration design and contracts before any SQL or code change.**
