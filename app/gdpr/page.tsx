'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import GDPRPage from '../../legacy-pages/GDPRPage';

export default function gdprPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <GDPRPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}