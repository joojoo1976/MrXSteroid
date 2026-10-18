/* eslint-disable react-refresh/only-export-components */

import type { Metadata } from 'next';
import SmartToolsHeader from '@/components/layouts/SmartToolsHeader';
import GlobalFooterWrapper from '@/components/layouts/GlobalFooterWrapper';

export const metadata: Metadata = {
    title: 'Exclusive Resources | Mr. X-Steroid',
    description: 'Premium resources for advanced users: Transformation Timeline, Cycle Architect, Cycle Schedule Sync, and Smart Lab Reference. Bilingual (Arabic & English).',
    keywords: ['transformation timeline', 'cycle architect', 'cycle schedule', 'smart lab reference', 'premium tools', 'Mr. X Steroid', 'الجدول الزمني للتحول', 'مهندس الدورة', 'مزامنة جدول الكورس'],
    openGraph: {
        title: 'Exclusive Resources | Mr. X-Steroid',
        description: 'Premium resources for advanced users.',
        type: 'website',
        images: [
            {
                url: '/mrx-sticky-logo.png',
                width: 512,
                height: 512,
                alt: 'Mr. X-Steroid Exclusive Resources',
            },
        ],
    },
};

export default function PremiumResourcesLayout({
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
