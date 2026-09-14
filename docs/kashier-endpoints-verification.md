# Kashier Endpoint Verification Register

> Reference Architecture v3.1 Compliance Register
> Source of truth: https://developers.kashier.io/
> Last verified: 2026-09-13

---

## 1. Endpoints Status Table

| Function | Environment | Host | Endpoint | Auth Mechanism | Verified Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Create Payment Session** | Test | `test-api.kashier.io` | `/v3/payment/sessions` | Bearer Secret + api-key | **YES** | Official Hosted Checkout sessions API |
| **Create Payment Session** | Live | `api.kashier.io` | `/v3/payment/sessions` | Bearer Secret + api-key | **PENDING** | Enabled upon live deployment |
| **Get Payment Session** | Test | `test-api.kashier.io` | `/v3/payment/sessions/:sessionId/payment` | Bearer Secret + api-key | **YES** | Server-to-server session status check |
| **Get Payment Session** | Live | `api.kashier.io` | `/v3/payment/sessions/:sessionId/payment` | Bearer Secret + api-key | **PENDING** | Enabled upon live deployment |
| **Payout / Transfer** | Test | `test-api.kashier.io` | `/v3/transfers/single` | Bearer Secret + api-key | **PENDING** | Test simulation active; verified when account transfer capability is enabled |
| **Payout / Transfer** | Live | `api.kashier.io` | `/v3/transfers/single` | Bearer Secret + api-key | **PENDING** | Enforces Admin Manual Batch Approval in v1 |

---

## 2. Status & Reconciliation Semantics

- `reconcilation` is a **reconciliation verdict**, not a payment status.
- Primary payment outcome is resolved from `orderStatus` / `status` / `transactionResponseCode`.
- Secondary reconciliation verdict (`reconcilation = OK / Failed / NA / Not_Exists`) acts as an integrity gate.
- Ambiguous or unverified outcomes (`NA`, `Not_Exists`, `TIMED_OUT`, `UNKNOWN`) fail closed and require manual administrative review before fulfillment.

---

## 3. Merchant Capabilities Checklist

- [x] Card Acceptance (Test MID configured)
- [x] Webhook Delivery & HMAC Signature Verification
- [ ] Direct Payout / Transfer Capability (Subject to bank agreement and merchant onboarding)
