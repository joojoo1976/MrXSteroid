'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import RefundPage from '../../legacy-pages/RefundPage';

export default function refundPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <RefundPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}