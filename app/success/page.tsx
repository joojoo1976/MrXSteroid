'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import SuccessPage from '../../legacy-pages/SuccessPage';

export default function successPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <SuccessPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}