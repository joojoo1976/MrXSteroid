'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import AdminGuard from '../../features/auth/AdminGuard';
import MissionControl from '../../legacy-pages/MissionControl';

export default function AdminRoute() {
    return (
        <LegacyPageShell>
            {({ navigateTo }) => (
                <AdminGuard navigateTo={navigateTo}>
                    <MissionControl />
                </AdminGuard>
            )}
        </LegacyPageShell>
    );
}
