'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import AuthGuard from '../../features/auth/AuthGuard';
import Dashboard from '../../legacy-pages/Dashboard';

export default function DashboardPage() {
    return (
        <LegacyPageShell>
            {({ navigateTo }) => (
                <AuthGuard navigateTo={navigateTo}>
                    <Dashboard navigateTo={navigateTo} />
                </AuthGuard>
            )}
        </LegacyPageShell>
    );
}
