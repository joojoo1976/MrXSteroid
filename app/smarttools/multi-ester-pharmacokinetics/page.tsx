/**
 * app/smarttools/multi-ester-pharmacokinetics/page.tsx
 * Tool #001 route — server component: SEO metadata (Phase 5.1) + JSON-LD
 * (Phase 5.2) + the Layer-5 client simulator.
 */
/* eslint-disable react-refresh/only-export-components -- metadata export is the sanctioned Next.js pattern (see app/layout.tsx) */
import type { Metadata } from 'next';
import MultiEsterPKToolComponent from '@/components/tools/multi-ester-pharmacokinetics';

const CANONICAL = 'https://mrxsteroid.com/smarttools/multi-ester-pharmacokinetics';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PharmaSim™ | حاسبة تراكم الإسترات وتجميع الهرمونات - Mr. X-Steroid',
        description:
            'حاسبة المحاكاة الحيوية الدقيقة لحرائك أدوية وإسترات الهرمونات البنائية (Bateman Pharmacokinetic Simulator). تحليل تراكم مصل الدم، الذروة، والقاع بدقة عالية.',
        alternates: {
            canonical: CANONICAL,
            languages: {
                'ar-EG': CANONICAL,
                'en-US': 'https://mrxsteroid.com/en/smarttools/multi-ester-pharmacokinetics',
            },
        },
        openGraph: {
            title: 'PharmaSim™ Multi-Ester Accumulation Simulator',
            description: 'Advanced 2-compartment pharmacokinetic simulation engine for compound clearance and peak/trough ratios.',
            url: CANONICAL,
            siteName: 'Mr. X-Steroid',
            type: 'website',
        },
    };
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PharmaSim™ Multi-Ester Accumulation Simulator',
    url: CANONICAL,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    author: { '@type': 'Person', name: 'George Mourice' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function MultiEsterPharmacokineticsPage() {
    return (
        <>
            <script
                type="application/ld+json"
                // JSON-LD contract: static, server-built object (no user input).
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MultiEsterPKToolComponent />
        </>
    );
}
