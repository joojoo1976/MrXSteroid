/**
 * GuaranteeBar.tsx — Server Component.
 * Risk-reversal / refund-policy strip directly under pricing.
 */
export default function GuaranteeBar() {
    return (
        <section id="cta" className="mx-auto max-w-7xl scroll-mt-24 px-6 pb-20">
            <div className="glass relative overflow-hidden rounded-3xl p-8 text-center md:p-10">
                <div className="absolute inset-0 bg-[rgb(var(--neon-primary)/0.05)]" />
                <div className="relative">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgb(var(--neon-primary)/0.4)] bg-[rgb(var(--neon-primary)/0.1)] text-2xl">
                        🛡
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                        48-Hour <span className="neon-text">Zero-Risk</span> Guarantee
                    </h3>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
                        Run the BioCalc. If the protocol doesn&apos;t feel like a measurable upgrade to how you
                        plan your physique, email us within 48 hours for a full refund — no forms, no hoops,
                        no questions asked.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <span>✓ Full refund</span>
                        <span>✓ No questions</span>
                        <span>✓ Instant processing</span>
                        <span>✓ You keep the calculator</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
