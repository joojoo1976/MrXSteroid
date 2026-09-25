/**
 * Paymob must never be visible to a customer.
 *
 * Defect found during the 2026-09-25 Paymob rollout audit: the checkout security
 * notice selected its copy with a catch-all ternary —
 *
 *     isStripeSelected ? stripe : paymobMethod === 'kashier' ? kashier : PAYMOB
 *
 * The reachable payment methods are `stripe`, `kashier` and `instapay`, so every
 * InstaPay shopper was shown "All transactions are secured via Paymob 256-bit
 * SSL encryption. You will be redirected directly to your selected Paymob
 * checkout page." — naming a payment processor that is not processing their
 * payment, on the one gateway that is meant to stay invisible to customers.
 *
 * These tests are source-level because `CheckoutForm` cannot be rendered in
 * isolation (it needs auth, preferences, Stripe and gateway context). They pin
 * the notice's branch→copy mapping and the remaining storefront exposure.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const checkout = read('features/checkout/CheckoutForm.tsx');
const grid = read('features/billing/components/PaymentMethodGrid.tsx');

/** The security-notice copy block, from the ternary to the closing paragraph. */
function noticeBlock(): string {
    // Anchor on the ternary itself. `{isStripeSelected` also occurs earlier as a
    // `&&` render guard, so a bare indexOf would match the wrong block.
    const m = /\{isStripeSelected\s*\n\s*\?\s*\(isAr/.exec(checkout);
    expect(m, 'security-notice ternary not found').not.toBeNull();
    const start = m!.index;
    const end = checkout.indexOf('</p>', start);
    expect(end).toBeGreaterThan(start);
    return checkout.slice(start, end);
}

describe('checkout security notice names the gateway actually being used', () => {
    it('has an explicit InstaPay branch', () => {
        // The whole bug: InstaPay fell through to the Paymob catch-all.
        expect(noticeBlock()).toContain("paymobMethod === 'instapay'");
    });

    it('the InstaPay copy says InstaPay and never says Paymob', () => {
        const notice = noticeBlock();
        const branch = notice.slice(notice.indexOf("paymobMethod === 'instapay'"));
        // The English string inside the InstaPay branch.
        const enMatch = branch.match(/"([^"]*InstaPay[^"]*)"/);
        expect(enMatch).not.toBeNull();
        expect(enMatch![1]).toContain('InstaPay');
        expect(enMatch![1]).not.toContain('Paymob');
    });

    it('the Arabic InstaPay copy never says Paymob', () => {
        const notice = noticeBlock();
        const branch = notice.slice(notice.indexOf("paymobMethod === 'instapay'"));
        // Arabic InstaPay is written إنستاباي; Paymob is Paymob.
        expect(branch).toContain('إنستاباي');
        const arSegment = branch.split('Paymob')[0];
        // Everything before the Paymob fallback must not itself name Paymob.
        expect(arSegment).not.toContain('Paymob');
    });

    it('keeps a Paymob notice only as the innermost unreachable fallback', () => {
        // Retained so re-enabling Paymob later still has accurate copy, but it
        // sits after the instapay branch, so it is only reached by the
        // card/wallet/kiosk options that are not rendered.
        const notice = noticeBlock();
        expect(notice.lastIndexOf('Paymob')).toBeGreaterThan(
            notice.indexOf("paymobMethod === 'instapay'")
        );
    });
});

describe('the Paymob payment options are not rendered to customers', () => {
    it('wraps the Paymob method blocks in a hard-off guard', () => {
        // `{false && (` is the existing hard-off. These blocks are NOT wired to
        // the admin visibility flag: hiding is enforced server-side in
        // create-invoice, so the options cannot be re-enabled from the UI even
        // if the guard were changed by mistake.
        expect(checkout).toContain('HIDING PAYMOB METHODS TEMPORARILY');
        expect((checkout.match(/\{false && \(/g) || []).length).toBeGreaterThanOrEqual(2);
    });

    it('the Paymob method ids are all inside those guarded regions', () => {
        for (const id of ['checkout-method-card', 'checkout-method-wallet', 'checkout-method-kiosk', 'checkout-method-paypal']) {
            const at = checkout.indexOf(id);
            expect(at, `${id} should still exist in the guarded markup`).toBeGreaterThan(-1);
        }
    });

    it('the legacy Paymob modal is mounted but nothing can open it', () => {
        // `PaymobModalHost` is mounted in app/providers.tsx and listens for the
        // `mrx_open_paymob` custom event. If nothing dispatches that event, the
        // Paymob product modal is unreachable from the storefront.
        const dispatcher = read('components/legacy/PaymobModalHost.tsx');
        expect(dispatcher).toContain("addEventListener('mrx_open_paymob'");
    });
});

describe('no other storefront component labels Paymob to shoppers', () => {
    it('PaymentMethodGrid no longer hard-codes a Paymob processor label', () => {
        // It previously read "Processed via Paymob Egypt" for the EG market.
        // The component is currently only barrel-exported (not rendered), but
        // the label was a latent leak.
        expect(grid).not.toContain('Paymob');
    });
});
