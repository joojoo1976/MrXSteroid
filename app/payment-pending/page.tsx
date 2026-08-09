'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import PaymentPendingPage from '../../legacy-pages/PaymentPendingPage';
import { usePreferences } from '../../context/PreferencesContext';

function PaymentPendingInner() {
    const searchParams = useSearchParams();
    const { language } = usePreferences();
    return (
        <LegacyPageShell>
            {({ navigateTo }) => (
                <PaymentPendingPage
                    transactionId={searchParams?.get('txn') || ''}
                    navigateTo={navigateTo}
                    locale={language}
                />
            )}
        </LegacyPageShell>
    );
}

export default function PaymentPendingRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <PaymentPendingInner />
        </Suspense>
    );
}
