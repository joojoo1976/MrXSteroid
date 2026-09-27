'use client';

/**
 * /claim-order — the destination of the emailed guest claim link.
 *
 * The raw token arrives as `?token=...`. It is handed to the page component as
 * an in-memory prop and is deliberately NOT mirrored into any storage, cookie or
 * analytics call, and never rendered. The server, not this route, decides
 * whether the claim may be redeemed.
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import GuestOrderClaimPage from '../../legacy-pages/GuestOrderClaimPage';
import { usePreferences } from '../../context/PreferencesContext';

function ClaimOrderInner() {
    const searchParams = useSearchParams();
    const { language } = usePreferences();
    // Read once and pass down as a prop. `useSearchParams()` can hand back null
    // during the very first render on a statically-rendered shell, so default to
    // an empty string and let the page render its invalid-link state.
    const token = searchParams?.get('token') || '';
    return (
        <LegacyPageShell>
            {({ navigateTo }) => (
                <GuestOrderClaimPage token={token} navigateTo={navigateTo} locale={language} />
            )}
        </LegacyPageShell>
    );
}

export default function ClaimOrderRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <ClaimOrderInner />
        </Suspense>
    );
}
