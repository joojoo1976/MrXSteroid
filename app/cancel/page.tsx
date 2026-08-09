'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import CancelPage from '../../legacy-pages/CancelPage';

export default function cancelPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <CancelPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}