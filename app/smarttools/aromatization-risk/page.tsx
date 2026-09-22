/**
 * app/smarttools/aromatization-risk/page.tsx
 * Tool #002 route — server component: SEO metadata + JSON-LD + the Layer-5
 * client simulator.
 */
/* eslint-disable react-refresh/only-export-components -- metadata export is the sanctioned Next.js pattern (see app/layout.tsx) */
import type { Metadata } from 'next';
import AromatizationRiskToolComponent from '@/components/tools/aromatization-risk';

const CANONICAL = 'https://mrxsteroid.com/smarttools/aromatization-risk';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Aromatization Risk & E2 Management Modeler | Mr. X-Steroid',
        description:
            'محاكي مخاطر الأروماتزة ومستوى الاستراديول (E2) أثناء الكورسات الهرمونية مع توصيات مثبطات الأروماتاز وفق كتاب Mr. X-Steroid.',
        alternates: {
            canonical: CANONICAL,
            languages: {
                'ar-EG': CANONICAL,
                'en-US': 'https://mrxsteroid.com/en/smarttools/aromatization-risk',
            },
        },
        openGraph: {
            title: 'Aromatization Risk & E2 Management Modeler | Mr. X-Steroid',
            description: 'Estradiol trajectory modeler for aromatization risk and AI management during anabolic cycles.',
            url: CANONICAL,
            siteName: 'Mr. X-Steroid',
            type: 'website',
        },
    };
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Aromatization Risk & Estradiol Management Modeler',
    url: CANONICAL,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    author: { '@type': 'Person', name: 'George Mourice' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function AromatizationRiskPage() {
    return (
        <>
            <script
                type="application/ld+json"
                // JSON-LD contract: static, server-built object (no user input).
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AromatizationRiskToolComponent />
        </>
    );
}
