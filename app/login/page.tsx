'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import LoginPage from '../../legacy-pages/LoginPage';

export default function loginPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <LoginPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}