'use client';

import { useAuth } from '../../../context/AuthContext';
import AuthGuard from '../../../features/auth/AuthGuard';
import { AffiliateOverview } from '../../../features/affiliate/components/AffiliateOverview';
import LegacyPageShell from '../../../components/legacy/LegacyPageShell';

export default function AffiliatePage() {
    const { session } = useAuth();
    const token = (session as { access_token?: string } | null)?.access_token ?? undefined;

    return (
        <LegacyPageShell>
            {({ navigateTo }) => (
                <AuthGuard navigateTo={navigateTo}>
                    <main className="min-h-screen bg-zinc-950">
                        <AffiliateOverview token={token} />
                    </main>
                </AuthGuard>
            )}
        </LegacyPageShell>
    );
}