/**
 * PricingTiers.tsx — Server Component.
 * Three purchase tiers with inline SocialProof as a trust strip.
 */
import SocialProof from './SocialProof';

interface Tier {
    name: string;
    price: number;
    priceLabel: string;
    tagline: string;
    features: string[];
    cta: string;
    highlight?: boolean;
}

const TIERS: Tier[] = [
    {
        name: 'Protocol Lite',
        price: 29,
        priceLabel: 'one-time',
        tagline: 'The calculator, full unlock.',
        features: ['Full BioCalc access', 'Daily macro targets', 'Body-fat projection', 'Email support'],
        cta: 'Start Lite',
    },
    {
        name: 'The Protocol',
        price: 79,
        priceLabel: 'one-time',
        tagline: '12-week engineering blueprint.',
        features: [
            'Everything in Lite',
            '4-phase cycle architecture',
            'Week-by-week calendar',
            'Refeed & deload windows',
            'Priority support',
        ],
        cta: 'Run The Protocol',
        highlight: true,
    },
    {
        name: 'Coached',
        price: 149,
        priceLabel: 'one-time',
        tagline: 'Protocol + human oversight.',
        features: ['Everything in The Protocol', 'Coach review of your plan', '1 on-1 onboarding call', 'Monthly check-in'],
        cta: 'Apply For Coaching',
    },
];

export default function PricingTiers() {
    return (
        <section id="pricing" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20">
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                    Choose Your <span className="neon-text">Protocol</span>
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
                    One model, three levels of ownership. Upgrade later — prices lock at purchase.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {TIERS.map((t) => (
                    <article
                        key={t.name}
                        className={`glass relative flex flex-col rounded-3xl p-8 ${t.highlight ? 'neon-border bg-white/[0.04] md:-translate-y-3' : ''}`}
                    >
                        {t.highlight && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[rgb(var(--neon-primary))] px-4 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                                Most Popular
                            </span>
                        )}
                        <h3 className="text-lg font-black text-white">{t.name}</h3>
                        <p className="mt-1 text-sm text-zinc-400">{t.tagline}</p>

                        <div className="mt-6 flex items-end gap-2">
                            <span className="text-5xl font-black tabular-nums text-white">${t.price}</span>
                            <span className="pb-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500">{t.priceLabel}</span>
                        </div>

                        <ul className="mt-6 flex-1 space-y-3">
                            {t.features.map((f) => (
                                <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgb(var(--neon-primary)/0.15)] text-[11px] font-black text-[rgb(var(--neon-primary))]">
                                        ✓
                                    </span>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <a
                            href="#cta"
                            className={`mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-black uppercase tracking-widest transition-transform hover:scale-[1.02] ${
                                t.highlight
                                    ? 'bg-[rgb(var(--neon-primary))] text-black'
                                    : 'border border-white/15 bg-white/[0.03] text-zinc-200 hover:border-[rgb(var(--neon-primary))] hover:text-[rgb(var(--neon-primary))]'
                            }`}
                        >
                            {t.cta}
                        </a>
                    </article>
                ))}
            </div>

            <div className="glass mt-10 rounded-2xl p-6">
                <SocialProof />
            </div>
        </section>
    );
}
