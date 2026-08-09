'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import CCPAPage from '../../legacy-pages/CCPAPage';

export default function ccpaPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <CCPAPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}