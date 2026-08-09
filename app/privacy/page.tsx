'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import PrivacyPage from '../../legacy-pages/PrivacyPage';

export default function privacyPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <PrivacyPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}