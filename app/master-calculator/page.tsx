'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import MasterCalculator from '../../features/calculator/MasterCalculator';

export default function masterCalculatorPage() {
    return (
        <LegacyPageShell>
            {({ navigateTo }) => <MasterCalculator navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}
