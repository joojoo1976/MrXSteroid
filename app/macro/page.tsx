'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import MacroCalculator from '../../features/calculator/MacroCalculator';

export default function macroPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <MacroCalculator content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}