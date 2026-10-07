/**
 * app/smarttools/hcg-serm-protocol/page.tsx
 * Tool #005 route — server component: SEO metadata + JSON-LD + the Layer-5
 * client simulator.
 */
/* eslint-disable react-refresh/only-export-components -- metadata export is the sanctioned Next.js pattern (see app/layout.tsx) */
import type { Metadata } from 'next';
import HcgSermProtocolToolComponent from '@/components/tools/hcg-serm-protocol';

const CANONICAL = 'https://mrxsteroid.com/smarttools/hcg-serm-protocol';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Intelligent HCG & SERM Protocol Generator',
        description:
            'المولد الذكي لبروتوكولات HCG و SERM لاستعادة المستقبلات السريرية ومحور HPTA وفق منهجية كتاب Mr. X-Steroid.',
        alternates: {
            canonical: CANONICAL,
            languages: {
                'ar-EG': CANONICAL,
                'en-US': 'https://mrxsteroid.com/en/smarttools/hcg-serm-protocol',
            },
        },
        openGraph: {
            title: 'Intelligent HCG & SERM Protocol Generator | Mr. X-Steroid',
            description: 'Clinical receptor recovery protocol generator based on compound suppression factors and testicular status.',
            url: CANONICAL,
            siteName: 'Mr. X-Steroid',
            type: 'website',
        },
    };
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Intelligent HCG & SERM Protocol Generator',
    url: CANONICAL,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    author: { '@type': 'Person', name: 'George Mourice' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function HcgSermProtocolPage() {
    return (
        <>
            <script
                type="application/ld+json"
                // JSON-LD contract: static, server-built object (no user input).
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HcgSermProtocolToolComponent />
        </>
    );
}
