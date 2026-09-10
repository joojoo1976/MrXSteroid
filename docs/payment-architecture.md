# Payment Architecture

## Gateways
| Gateway | Countries | Currency | Method |
|---------|-----------|----------|--------|
| Paymob | EG | EGP | card, wallet, kiosk, PayPal |
| Kashier Egypt | EG (explicit) | EGP | card |
| Kashier Global | Non-EG (explicit) | USD | card |
| Stripe | US, EU, MENA, etc. | USD | embedded |
| SpaceRemit | Global fallback | USD | redirect |
| InstaPay | EG | EGP | manual |

## Routing (create-invoice)
1. `paymentMethod=instapay` → InstaPay (manual flow)
2. `paymentMethod=stripe` → Stripe embedded
3. `paymentMethod=kashier` + country=EG → KashierGateway(egypt)
4. `paymentMethod=kashier` + country!=EG → KashierGateway(global)
5. country=EG or Paymob method → PaymobGateway
6. Stripe countries + STRIPE_SECRET_KEY present → StripeGateway
7. Fallback → SpaceRemitGateway

## Webhook Detection Order
1. `x-kashier-signature` → Kashier
2. `stripe-signature` → Stripe
3. `hmac` header/query → Paymob
4. `x-spaceremit-signature` / `SP_payment_code` → SpaceRemit
5. Fallback → SpaceRemit

## Required Env Vars (Kashier)
```
KASHIER_EGYPT_MERCHANT_ID
KASHIER_EGYPT_PAYMENT_API_KEY
KASHIER_EGYPT_SECRET_KEY
KASHIER_GLOBAL_MERCHANT_ID
KASHIER_GLOBAL_PAYMENT_API_KEY
KASHIER_GLOBAL_SECRET_KEY
KASHIER_MODE=test  # switch to live only after QA
```
