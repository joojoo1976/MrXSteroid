'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import SignupPage from '../../legacy-pages/SignupPage';

export default function signupPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <SignupPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}