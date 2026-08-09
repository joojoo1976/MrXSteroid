'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import AuthGuard from '../../features/auth/AuthGuard';
import CycleCalendarExporter from '../../features/calculator/CycleCalendarExporter';

export default function CyclePage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => (
                <AuthGuard requireSubscription={true} navigateTo={navigateTo}>
                    <CycleCalendarExporter content={content} navigateTo={navigateTo} />
                </AuthGuard>
            )}
        </LegacyPageShell>
    );
}
