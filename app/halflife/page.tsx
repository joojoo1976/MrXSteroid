'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import HalfLifeVisualizer from '../../features/calculator/HalfLifeVisualizer';

export default function halflifePage() {
    return (
        <LegacyPageShell>
            {({ content }) => <HalfLifeVisualizer content={content} />}
        </LegacyPageShell>
    );
}
