/**
 * Footer.tsx — Server Component.
 * Legal links, SEO text block, and Product schema.org JSON-LD.
 */
const LEGAL_LINKS = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refunds' },
    { label: 'Medical Disclaimer', href: '/disclaimer' },
    { label: 'Contact', href: '/contact' },
];

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/40">
            {/* SEO copy block */}
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid gap-10 md:grid-cols-3">
                    <div>
                        <a href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
                            <span className="neon-text">MR</span>
                            <span className="text-white">.X</span>
                        </a>
                        <p className="mt-3 max-w-xs text-xs leading-relaxed text-zinc-500">
                            Precision metabolic protocol engine — body-composition modeling,
                            adaptive macro targets and week-by-week projections built on
                            applied biology.
                        </p>
                    </div>

                    <nav aria-label="Legal" className="grid grid-cols-2 gap-3">
                        {LEGAL_LINKS.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                className="text-xs font-semibold text-zinc-400 transition-colors hover:text-[rgb(var(--neon-primary))]"
                            >
                                {l.label}
                            </a>
                        ))}
                    </nav>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">SEO</h3>
                        <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                            Metabolic rate calculator · TDEE &amp; BMR estimation · body-fat
                            projection · adaptive nutrition protocol · 12-week physique
                            engineering system.
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 py-5">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-[10px] text-zinc-600 sm:flex-row">
                    <p>© {new Date().getFullYear()} Mr. X Steroid. For educational purposes only — not medical advice.</p>
                    <p>Est. 2025 · Engineered for results</p>
                </div>
            </div>

            {/* Product schema.org for search engines */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: 'Mr. X Steroid — The Protocol',
                        description:
                            'Precision metabolic protocol engine with body-composition modeling, adaptive macro targets and week-by-week projections.',
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: '4.9',
                            reviewCount: '2300',
                        },
                        offers: {
                            '@type': 'Offer',
                            priceCurrency: 'USD',
                            price: '79',
                            availability: 'https://schema.org/InStock',
                        },
                    }),
                }}
            />
        </footer>
    );
}
