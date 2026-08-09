'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import ShippingPolicyPage from '../../legacy-pages/ShippingPolicyPage';

export default function ShippingPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <ShippingPolicyPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}
