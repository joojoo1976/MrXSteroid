'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import AccessibilityPage from '../../legacy-pages/AccessibilityPage';

export default function accessibilityPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <AccessibilityPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}