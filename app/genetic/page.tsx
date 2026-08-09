'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import GeneticPotentialCalculator from '../../features/calculator/GeneticPotentialCalculator';

export default function geneticPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <GeneticPotentialCalculator content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}