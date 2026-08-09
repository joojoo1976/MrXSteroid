'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import LegalDisclaimerPage from '../../legacy-pages/LegalDisclaimerPage';

export default function disclaimerPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <LegalDisclaimerPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}