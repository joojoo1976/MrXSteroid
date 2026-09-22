/**
 * app/smarttools/timeline/page.tsx
 * Tool #080 route — server component: SEO metadata + JSON-LD + the Layer-5
 * client simulator.
 */
/* eslint-disable react-refresh/only-export-components -- metadata export is the sanctioned Next.js pattern (see app/layout.tsx) */
import type { Metadata } from 'next';
import TimelineToolComponent from '@/components/tools/timeline';

const CANONICAL = 'https://mrxsteroid.com/smarttools/timeline';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Transformation Timeline Engine | Mr. X-Steroid',
        description:
            'محرك جدول التغيير الزمني للتحول البدني — محاكاة أسبوعية لمسار تركيبة الجسم (الوزن، الكتلة العضلية، الكتلة الدهنية) مع التكيف الأيضي وتحذير الهضبة وفق كتاب Mr. X-Steroid.',
        alternates: {
            canonical: CANONICAL,
            languages: {
                'ar-EG': CANONICAL,
                'en-US': 'https://mrxsteroid.com/en/smarttools/timeline',
            },
        },
        openGraph: {
            title: 'Transformation Timeline Engine | Mr. X-Steroid',
            description: 'Week-by-week body-composition trajectory engine with metabolic adaptation and plateau detection.',
            url: CANONICAL,
            siteName: 'Mr. X-Steroid',
            type: 'website',
        },
    };
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Transformation Timeline Engine',
    url: CANONICAL,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    author: { '@type': 'Person', name: 'George Mourice' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function TimelinePage() {
    return (
        <>
            <script
                type="application/ld+json"
                // JSON-LD contract: static, server-built object (no user input).
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TimelineToolComponent />
        </>
    );
}
