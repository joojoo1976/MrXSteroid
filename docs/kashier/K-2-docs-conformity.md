# K-2 — Kashier Docs Conformity Evidence Card

Phase: 1 (Discovery & Docs Verification) · Gate: Final Gate v5 §3
Status: **DELIVERED — awaiting owner approval before Phase 2**
Verifier: Lead Digital Architect · Date: 2026-09-16
Source of truth: live `developers.kashier.io` (fetched this session). Where v5 and the live docs disagree, **the live docs win** (v5 §3).

Verdict legend: `CONFIRMED` (v5 correct) · `CORRECTED` (v5 wrong / must change) · `NEW` (not in v5; must be added) · `BLOCKED` (still unverifiable).

---

## 1. Verification table

| # | v5 hypothesis | Live-docs evidence (quote) | Verdict |
|---|---------------|----------------------------|---------|
| A1 | Session endpoint `POST /v3/payment/sessions` on `test-api` / `api.kashier.io` | "TEST-URL https://test-api.kashier.io/v3/payment/sessions · LIVE-URL https://api.kashier.io/v3/payment/sessions · Method POST" | CONFIRMED |
| A2 | Secret Key in `Authorization`, raw (no Bearer) | Credentials table: "Secret Key → `Authorization` header (raw value, not a Bearer token)"; quickstart `--header 'Authorization: YOUR_TEST_SECRET_KEY'` | CONFIRMED |
| A3 | Payment API Key sent in `api-key` header | Credentials table: "Payment API Key → `api-key` header" | CONFIRMED |
| A4 | Webhook signature = HMAC-SHA256 | "Kashier signs every webhook request with SHA256 HMAC" | CONFIRMED |
| A5 | Signature header name `x-kashier-signature` | "compare your result with the `x-kashier-signature` request header" | CONFIRMED |
| A6 | Signature keyed with **Payment API Key**, not Secret Key | "Hash the signature payload with your Payment API Key" + Hint: "You must use the Payment API Key that you used to create the Payment Hash" | CONFIRMED |
| A7 | Payload = sort `signatureKeys` alphabetically, pick those keys from `data`, URL-encode **only the values**, join `key=value` with `&` | Step 3: "URL-encode only the value"; Step 4: "Join each pair with `=` and all pairs with `&`"; a full worked example is published with a known-good hex digest | CONFIRMED (exact) |
| A8 | Branch on `data.status` (SUCCESS/FAILURE/PENDING), never `event` | Callout: "Branch on `data.status` (`SUCCESS`, `FAILURE`, or `PENDING`), never on `event` alone" | CONFIRMED |
| A9 | Ack semantics / retry policy | "Kashier treats HTTP `200` and HTTP `409 Conflict` as acknowledged"; "retries … up to 10 times, backing off 2m → 10m → 30m → 1h → 2h → 4h, then every 4h"; 30-second delivery timeout | CONFIRMED (adds 409) |
| A10 | Event type list | `pay, authorize, capture, refund, partial_refund, void, reject, reversal` | CONFIRMED (v5 §6.2 listed a subset) |
| A11 | Mode handling: `test-` host prefix; checkout host shared | going-live table: Dashboard host `test-api`→`api`, FEP host `test-fep`→`fep`, "checkout host is the same in both modes — the mode travels on the `sessionUrl` as a `mode` query parameter" | CONFIRMED + NEW detail |
| A12 | Refund endpoint on checkout host via `apiOperation` | Order operations: "`PUT /v3/orders/{orderId}` on the checkout host (`test-fep.kashier.io`) with the operation named in `apiOperation`" | CONFIRMED |
| A13 | Refund requires elevated permission | "refund and void additionally need the refund permission on the key's role" | NEW |
| B1 | C-2 Payout host `fep/v3` vs `api/v2` | going-live table lists "transfers" under **Payment API / FEP** → `test-fep.kashier.io` / `fep.kashier.io` | CORRECTED → docs place transfers on the **FEP host**; governance still requires written confirmation from the Kashier account manager before unlinking C-2 |
| B2 | MID `48761-625` / `40-761-525` | Docs show format `MID-XXXX-XXXX` (example `MID-00-000`, header `authmerchantid`); dashboard says MID is "under your username in the top navigation" | CONFLICT → the two-digit-group form in v5 §2.2 does not match the documented `MID-XXXX-XXXX`; must be reconciled against the dashboard before Phase 2 |
| B3 | Currency set | Sessions: "`EGP`, `USD`, `GBP`, or `EUR`" | CONFIRMED (v5 used EGP) |
| C1 | D-8 Transfers hashing | `createTransfer` page rendered only its title — request/response body not retrievable this session | BLOCKED |
| C2 | Refund fee accounting rule (v5 §5.2 MERCHANT_ABSORBS) | Refunds page not yet fetched | UNVERIFIED |
| C3 | All payment methods testable in sandbox | "Outside live mode the checkout ignores `allowedMethods` and forces the method list to card and wallet" | CORRECTED → v5 §12.2 Group L must not assume `bank_installments` / `fawry` can be exercised in test |
| C4 | Session required fields | 10 required: `expireAt`, `maxFailureAttempts`, `amount`, `currency`, `order`, `merchantId`, `merchantRedirect`, `type`, `display`, `customer` | NEW → must be encoded in Phase 4 checkout design |
| C5 | Duplicate order handling | "Kashier rejects a duplicate order reference for the same merchant (`ERR_ORD_02`)" | NEW → `order` reference must be unique; align with v5 §8 idempotency key |
| C6 | Per-request webhook destination | `serverWebhook` field accepted by payment sessions | NEW → v5 §6.2 had no per-request destination |
| C7 | Webhook de-dupe semantics | "Kashier de-dupes delivery on `{transactionId}::{webhookUrl}::{status}`"; replayed order notification arrives as `event: "idempotency"` with `ORDER_PAID_BEFORE` | NEW → must be modelled in `webhook_events` indexing |
| C8 | Settlement windows availability | "Settlement windows and batches are produced by the live settlement pipeline only — test mode never creates windows or batches" | NEW → v5 §7 Reconciliation must branch on mode |
| C9 | Capability flags | "a brand-new merchant has exactly three enabled: multiple balance accounts, payment links, and customers. Everything else … is off until Kashier enables it" | NEW → Payouts/instant settlement require a capability flag before Phase 8 |
| C10 | Live rate limit | "checkout requests are limited to 1000 requests per minute per IP address" | NEW → v5 §9.1's 10/min guard is stricter and remains valid |
| C11 | IP allow-list behaviour | "once it has at least one entry, only those IPs may use your Secret Key … rejected with `403 Unauthorized IP address`" | NEW → Vercel egress IPs must be allow-listed before go-live |
| C12 | Hash field `data.hash` | "an internal Kashier integrity field … **do not attempt to verify it**" | NEW → must be explicitly ignored in the webhook handler |

---

## 2. Conflict Log (mandatory amendments before Phase 2+)

1. **MID format (B2)** — v5 §2.2 stores `MID-48761-625`; docs require `MID-XXXX-XXXX`. **Owner action:** confirm the exact MID from the dashboard top-nav before Phase 2.
2. **Test-mode method coverage (C3)** — Group L (v5 §12.2) must be re-scoped: `bank_installments`, `fawry`, and similar can only be validated on live, one transaction per method.
3. **Payout host (B1/C-2)** — live docs place transfers on the **FEP host**; v5 §1.2 governance still blocks until written confirmation from the Kashier account manager. Do not unblock in code.
4. **D-8 / refund-fee rules (C1, C2)** — remain BLOCKED; cannot design payout hashing nor finalise refund fee accounting until the docs (or account manager) confirm.

---

## 3. New requirements not present in v5 (to fold into later phases)

- C4 required session fields · C5 `ERR_ORD_02` unique order · C6 `serverWebhook` · C7 `{transactionId}::{webhookUrl}::{status}` de-dupe + `event:"idempotency"` / `ORDER_PAID_BEFORE` · C8 live-only settlement windows · C9 per-merchant capability flags · C10 live 1000/min per-IP limit · C11 IP allow-list · C12 ignore `data.hash` · A13 refund permission on key role.

---

## 4. Verdict

- **Phase 1 gate:** the signature algorithm, header names, encoding rules, ack semantics, status-branch rule, event list, and host map are **verified against live docs**.
- **Cannot close Phase 1 fully** while B2 (MID), C1 (D-8), C2 (refund fees) remain unresolved.
- **STOP here** per v5 §14 — no Phase 2 work begins until the owner approves this card and rules on the Conflict Log.

### Owner sign-off
- [ ] K-2 accepted
- [ ] MID confirmed
- [ ] C-2 written confirmation obtained (or formally deferred)
- [ ] Authorised to proceed to Phase 2