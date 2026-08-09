'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import InjectionMap from '../../features/calculator/InjectionMap';

export default function injectionPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <InjectionMap content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}