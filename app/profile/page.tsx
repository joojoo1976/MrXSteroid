'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import AuthGuard from '../../features/auth/AuthGuard';
import ProfilePage from '../../legacy-pages/ProfilePage';
import { useAuth } from '../../context/AuthContext';

export default function ProfileRoute() {
    const { user } = useAuth();
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => (
                <AuthGuard navigateTo={navigateTo}>
                    <ProfilePage user={user} content={content} navigateTo={navigateTo} />
                </AuthGuard>
            )}
        </LegacyPageShell>
    );
}
