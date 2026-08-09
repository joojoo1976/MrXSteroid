'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import ResetPasswordPage from '../../legacy-pages/ResetPasswordPage';

export default function resetpasswordPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <ResetPasswordPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}