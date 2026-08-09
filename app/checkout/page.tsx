'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import CheckoutPage from '../../legacy-pages/CheckoutPage';
import { Page } from '@/shared/types/types';

export default function CheckoutRoute() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => {
                const openLegal = (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => {
                    const map: Record<'privacy' | 'terms' | 'refund' | 'disclaimer', Page> = {
                        privacy: Page.PRIVACY,
                        terms: Page.TERMS,
                        refund: Page.REFUND,
                        disclaimer: Page.LEGAL_DISCLAIMER_PAGE,
                    };
                    navigateTo(map[key]);
                };
                return (
                    <CheckoutPage
                        content={content}
                        selectedTier={null}
                        navigateTo={navigateTo}
                        onSuccess={() => navigateTo(Page.PAYMENT_SUCCESS)}
                        openLegal={openLegal}
                    />
                );
            }}
        </LegacyPageShell>
    );
}
