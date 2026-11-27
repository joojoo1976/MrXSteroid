/**
 * Internal checkout deep links.
 *
 * Phase 5 replaces direct gateway links in the UI with a first-party
 * `/checkout?plan=...` URL. The checkout surface then runs the invoice-first
 * flow (quote → create-invoice → create-session). Marketing links target
 * `/checkout#plans`, the real package selector, without starting payment.
 * Keeping this helper free of
 * server imports lets both server and client components use the exact same
 * URL shape.
 */

export const CHECKOUT_PLANS_HREF = '/checkout#plans';

/** Locale-prefixed link keeps marketing language consistent through checkout. */
export function buildCheckoutPlansHref(language: 'ar' | 'en'): string {
    return `/${language}/checkout#plans`;
}

export type CheckoutPlanId =
    | 'digital'
    | 'bundle'
    | 'coaching'
    | 'coaching_plus'
    | 'bundle_plus'
    | 'digital_plus'
    | 'pdf'
    | 'paperback';

export interface CheckoutPlanUrlOptions {
    region?: 'EG' | 'GLOBAL';
    /** Raw query string, usually `window.location.search`. */
    search?: string;
    referralCode?: string | null;
}

const TRACKING_PARAMS = ['ref'] as const;

/**
 * Builds a first-party checkout URL and carries attribution through.
 *
 * `utm_*` and `ref` are copied from the current query string so a marketing
 * link that lands on a legacy payment link does not lose attribution when it
 * is redirected into the invoice-first checkout.
 */
export function buildCheckoutPlanUrl(
    planId: CheckoutPlanId,
    options: CheckoutPlanUrlOptions = {}
): string {
    const params = new URLSearchParams();
    params.set('plan', planId);

    if (options.region) params.set('region', options.region);

    const rawSearch = options.search
        ?? (typeof window !== 'undefined' ? window.location.search : '');
    const incoming = new URLSearchParams(rawSearch.startsWith('?') ? rawSearch.slice(1) : rawSearch);

    for (const [key, value] of incoming.entries()) {
        if (key.startsWith('utm_') || (TRACKING_PARAMS as readonly string[]).includes(key)) {
            params.set(key, value);
        }
    }

    if (options.referralCode && !params.has('ref')) {
        params.set('ref', options.referralCode);
    }

    return `/checkout?${params.toString()}`;
}
