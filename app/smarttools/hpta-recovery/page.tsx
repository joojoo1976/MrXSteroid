/**
 * app/smarttools/hpta-recovery/page.tsx
 * Tool #003 route — server component: SEO metadata + JSON-LD + the Layer-5
 * client simulator.
 */
/* eslint-disable react-refresh/only-export-components -- metadata export is the sanctioned Next.js pattern (see app/layout.tsx) */
import type { Metadata } from 'next';
import HptaRecoveryToolComponent from '@/components/tools/hpta-recovery';

const CANONICAL = 'https://mrxsteroid.com/smarttools/hpta-recovery';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'HPTA Suppression & Recovery Modeler | Mr. X-Steroid',
        description:
            'محاكي التثبيط المحوري واستعادة نشاط الغدة النخامية والخصية الزمني بعد الكورسات الهرمونية وفق كتاب Mr. X-Steroid.',
        alternates: {
            canonical: CANONICAL,
            languages: {
                'ar-EG': CANONICAL,
                'en-US': 'https://mrxsteroid.com/en/smarttools/hpta-recovery',
            },
        },
        openGraph: {
            title: 'HPTA Suppression & Recovery Modeler | Mr. X-Steroid',
            description: 'Time-course modeler for HPTA suppression and endogenous-T rebound after anabolic cycles.',
            url: CANONICAL,
            siteName: 'Mr. X-Steroid',
            type: 'website',
        },
    };
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'HPTA Suppression & Recovery Time-Course Modeler',
    url: CANONICAL,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    author: { '@type': 'Person', name: 'George Mourice' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function HptaRecoveryPage() {
    return (
        <>
            <script
                type="application/ld+json"
                // JSON-LD contract: static, server-built object (no user input).
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HptaRecoveryToolComponent />
        </>
    );
}
