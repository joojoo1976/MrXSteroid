/**
 * ClientIslands.tsx (Client Component)
 * Hosts the two interactive islands — BioCalculator and StickyCTA — behind
 * next/dynamic with ssr:false. `ssr:false` is illegal inside Server Components,
 * so this file is the sanctioned client boundary: it ships zero SSR HTML for the
 * motion/heavy UI and defers hydration to the browser, killing mismatch risk.
 */
'use client';

import dynamic from 'next/dynamic';

const BioCalculator = dynamic(() => import('./BioCalculator'), {
    ssr: false,
    loading: () => (
        <section className="mx-auto max-w-7xl px-6 py-20">
            <div className="glass-strong h-[540px] animate-pulse rounded-3xl" />
        </section>
    ),
});

const StickyCTA = dynamic(() => import('./StickyCTA'), {
    ssr: false,
});

export default function ClientIslands({ variant }: { variant: 'calculator' | 'sticky' }) {
    if (variant === 'sticky') return <StickyCTA />;
    return <BioCalculator />;
}
