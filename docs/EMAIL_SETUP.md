# Email Setup — mrxsteroid.com

Status: **Inbound verified working.** `support@mrxsteroid.com` forwards to
`foryoutalk@gmail.com` via **Cloudflare Email Routing** (MX → `route1/2/3.mx.cloudflare.net`,
SPF `v=spf1 include:_spf.mx.cloudflare.net ~all`).

This document covers the two remaining goals:
1. **Reply FROM `support@mrxsteroid.com`** (not just receive) — Gmail "Send mail as".
2. **DMARC** — protect the domain from spoofing.

---

## 1) Reply as support@mrxsteroid.com (Gmail "Send mail as")

Cloudflare Email Routing cannot *send*. You need an SMTP relay authorized for the
domain. Recommended free option: **Zoho Mail** (used here as a send relay; inbound
stays on Cloudflare → Gmail).

### A. Create the Zoho mailbox (send identity)
1. Sign up at `zoho.com/mail` (Free plan) → add domain `mrxsteroid.com`.
2. Verify domain ownership: Zoho gives a **TXT** record → add it in Cloudflare
   (DNS → Records → TXT, name `@`, the token value) → verify in Zoho.
3. Create user/mailbox: **`support@mrxsteroid.com`**.
4. **Do NOT change MX to Zoho** — keep Cloudflare Email Routing MX so inbound
   still forwards to Gmail. Zoho is used only for **outbound SMTP**.
   (If Zoho insists on MX for the mailbox, you can still use its SMTP to send;
   inbound continues via Cloudflare.)

### B. Connect Gmail "Send mail as" to Zoho SMTP
1. Gmail → ⚙ Settings → **Accounts and Import** → **Send mail as** → *Add another email address*.
2. Name: `Mr. X Steroid Support` · Email: `support@mrxsteroid.com` →
   uncheck "Send through Gmail" → next.
3. SMTP server: `smtp.zoho.com` · Port: `465` (SSL) or `587` (TLS) ·
   Username: `support@mrxsteroid.com` · Password: your **Zoho app password**.
4. Gmail sends a verification link to `support@mrxsteroid.com` → it forwards to
   Gmail via Email Routing → open it and enter the code.
5. Now, when replying/composing, choose **From → support@mrxsteroid.com**.

### C. SPF/DKIM alignment (so replies don't hit spam)
- **SPF**: update the Cloudflare SPF TXT to also allow Zoho:
  `v=spf1 include:_spf.mx.cloudflare.net include:zoho.com ~all`
- **DKIM**: enable DKIM in Zoho (Admin → Email → DKIM) and add its CNAME/TXT in
  Cloudflare. Aligned DKIM (`d=mrxsteroid.com`) + SPF give DMARC pass.

---

## 2) DMARC record (anti-spoofing)

Add in **Cloudflare → DNS → Records → Add → TXT**:

- **Name:** `_dmarc`
- **Content (Phase 1 — monitoring, safe):**
  ```
  v=DMARC1; p=none; rua=mailto:foryoutalk@gmail.com; adkim=s; aspf=s; pct=100
  ```
- **TTL:** Auto

`p=none` only **reports** (never blocks) — use it for ~2–4 weeks while you watch
the `rua` reports to confirm legitimate mail (Gmail, Zoho, Cloudflare) passes.

**Phase 2 — enforcement (after reports look clean):**
```
v=DMARC1; p=quarantine; rua=mailto:foryoutalk@gmail.com; adkim=s; aspf=s; pct=100
```
Move to `p=reject` only once you're certain all legitimate senders align.

> Note: with `adkim=s; aspf=s` (strict), make sure the sending services produce
> aligned DKIM/SPF for `mrxsteroid.com` (Zoho DKIM + the SPF include above).
> If reports show failures, relax to `adkim=r; aspf=r` (relaxed).

---

## Verification commands (run after changes)
```powershell
Resolve-DnsName -Type MX   mrxsteroid.com -Server 1.1.1.1
Resolve-DnsName -Type TXT  mrxsteroid.com -Server 1.1.1.1   # SPF
Resolve-DnsName -Type TXT _dmarc.mrxsteroid.com -Server 1.1.1.1
```
