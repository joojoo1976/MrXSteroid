import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Smart Tools | Mr. X-Steroid',
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
    return <>{children}</>;
}
