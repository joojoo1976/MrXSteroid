'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import CookiePolicyPage from '../../legacy-pages/CookiePolicyPage';

export default function CookiesPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <CookiePolicyPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}
