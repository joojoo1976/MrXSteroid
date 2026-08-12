'use client';

import React from 'react';
import TransformationTimeline from '../../features/calculator/TransformationTimeline';
import { arContent } from '../../i18n/ar';

export default function TransformationTimelinePage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white pt-10">
            <TransformationTimeline content={arContent} />
        </main>
    );
}
