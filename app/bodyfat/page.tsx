'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import BodyFatCalculator from '../../features/calculator/BodyFatCalculator';

export default function bodyfatPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <BodyFatCalculator content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}