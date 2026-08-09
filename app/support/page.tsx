'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import SupportPage from '../../legacy-pages/SupportPage';

export default function supportPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <SupportPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}