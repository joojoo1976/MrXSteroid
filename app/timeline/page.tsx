'use client';

import React from 'react';
import TransformationTimeline from '../../features/calculator/TransformationTimeline';
import { arContent } from '../../i18n/ar';

export default function TimelinePage() {
    return (
        <main className="min-h-screen bg-black text-white pt-20">
            <TransformationTimeline content={arContent} />
        </main>
    );
}
