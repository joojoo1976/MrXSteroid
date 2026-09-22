/**
 * app/smarttools/pct-timing/page.tsx
 * Tool #004 route — server component: SEO metadata + JSON-LD + the Layer-5
 * client simulator.
 */
/* eslint-disable react-refresh/only-export-components -- metadata export is the sanctioned Next.js pattern (see app/layout.tsx) */
import type { Metadata } from 'next';
import PctTimingToolComponent from '@/components/tools/pct-timing';

const CANONICAL = 'https://mrxsteroid.com/smarttools/pct-timing';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PCT Timing & Compound Washout Engine | Mr. X-Steroid',
        description:
            'محرك توقيت تطهير المركبات وجدولة علاج ما بعد الدورة (PCT) وفق نصف العمر الأُسّي ومنهجية كتاب Mr. X-Steroid.',
        alternates: {
            canonical: CANONICAL,
            languages: {
                'ar-EG': CANONICAL,
                'en-US': 'https://mrxsteroid.com/en/smarttools/pct-timing',
            },
        },
        openGraph: {
            title: 'PCT Timing & Compound Washout Engine | Mr. X-Steroid',
            description: 'Compound washout engine and post-cycle therapy scheduling based on elimination half-life.',
            url: CANONICAL,
            siteName: 'Mr. X-Steroid',
            type: 'website',
        },
    };
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PCT Timing & Compound Washout Engine',
    url: CANONICAL,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    author: { '@type': 'Person', name: 'George Mourice' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function PctTimingPage() {
    return (
        <>
            <script
                type="application/ld+json"
                // JSON-LD contract: static, server-built object (no user input).
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PctTimingToolComponent />
        </>
    );
}
