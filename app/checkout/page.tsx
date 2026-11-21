import CheckoutRouteClient from './CheckoutRouteClient';

/**
 * Phase 5: the direct-services section is gated by a server-only env flag.
 * Next.js does not expose `KASHIER_SERVICE_LINKS_VERIFIED` to the browser unless
 * it is `NEXT_PUBLIC_*`, so the server resolves it once and passes a boolean
 * down. When false, `CheckoutPage` does not render the section at all.
 */
export default function CheckoutRoute() {
    const showDirectServices =
        (process.env.KASHIER_SERVICE_LINKS_VERIFIED || '').toLowerCase() === 'true';

    return <CheckoutRouteClient showDirectServices={showDirectServices} />;
}
