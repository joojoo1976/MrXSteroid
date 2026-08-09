'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import CareersPage from '../../legacy-pages/CareersPage';

export default function careersPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <CareersPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}