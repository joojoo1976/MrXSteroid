'use client';

import React from 'react';
import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import TransformationTimeline from '../../features/calculator/TransformationTimeline';

export default function TimelinePage() {
    return (
        <LegacyPageShell>
            {({ content }) => <TransformationTimeline content={content} />}
        </LegacyPageShell>
    );
}
