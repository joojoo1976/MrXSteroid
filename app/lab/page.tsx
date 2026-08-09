'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import SmartLabReference from '../../features/calculator/SmartLabReference';

export default function labPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <SmartLabReference content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}