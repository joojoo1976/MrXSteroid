'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import AuthGuard from '../../features/auth/AuthGuard';
import RepresentativePage from '../../legacy-pages/RepresentativePage';

export default function RepresentativeRoute() {
    return (
        <LegacyPageShell>
            {({ navigateTo }) => (
                <AuthGuard navigateTo={navigateTo}>
                    <RepresentativePage />
                </AuthGuard>
            )}
        </LegacyPageShell>
    );
}
