/* eslint-disable react-refresh/only-export-components */

import type { Metadata } from 'next';
import SmartToolsHeader from '@/components/layouts/SmartToolsHeader';
import GlobalFooterWrapper from '@/components/layouts/GlobalFooterWrapper';

export const metadata: Metadata = {
    title: 'Smart Tools',
    description: 'Access all professional bodybuilding calculators: Macro Calculator, Body Fat Calculator, Injection Map, Half-Life Simulator, Smart Lab Reference, and Genetic Potential Calculator. Bilingual (Arabic & English).',
    keywords: ['macro calculator', 'body fat calculator', 'injection map', 'half-life simulator', 'lab reference', 'genetic potential', 'Mr. X Steroid', 'bodybuilding tools', 'حاسبة الماكروز', 'حاسبة الدهون', 'خريطة الحقن'],
    openGraph: {
        title: 'Smart Tools | Mr. X-Steroid',
        description: 'Professional bodybuilding calculators powered by applied biology.',
        type: 'website',
        images: [
            {
                url: '/mrx-sticky-logo.png',
                width: 512,
                height: 512,
                alt: 'Mr. X-Steroid Smart Tools',
            },
        ],
    },
};

export default function SmartToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background text-zinc-900 dark:text-zinc-100">
            <SmartToolsHeader />
            <div className="flex-1 pt-24 md:pt-28">
                {children}
            </div>
            <GlobalFooterWrapper />
        </div>
    );
}
