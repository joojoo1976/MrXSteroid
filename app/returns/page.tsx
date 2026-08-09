'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import ReturnPolicyPage from '../../legacy-pages/ReturnPolicyPage';

export default function ReturnsPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <ReturnPolicyPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}
