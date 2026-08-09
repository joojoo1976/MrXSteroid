'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import AdminGuard from '../../features/auth/AdminGuard';
import AdminAnalytics from '../../legacy-pages/AdminAnalytics';

export default function AdminAnalyticsRoute() {
    return (
        <LegacyPageShell>
            {({ navigateTo }) => (
                <AdminGuard navigateTo={navigateTo}>
                    <AdminAnalytics />
                </AdminGuard>
            )}
        </LegacyPageShell>
    );
}
