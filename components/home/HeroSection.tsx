/**
 * HeroSection.tsx — Server Component.
 * Hook + Value Proposition + primary CTA. Purely static; zero client JS.
 */
export default function HeroSection() {
    return (
        <section className="relative isolate overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-grid" />
            <div className="absolute -top-40 left-1/2 -z-10 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-[rgb(var(--neon-primary)/0.14)] blur-[140px]" />
            <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-28 pb-20 text-center md:pt-36">
                <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--neon-primary))]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--neon-primary))] animate-pulse" />
                    Applied Biology · Science-First Protocol
                </span>

                <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
                    Engineer Your Physique With{' '}
                    <span className="neon-text">Precision Metabolism</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
                    A single bio-signal calculator that turns your body composition into an
                    exact nutrition protocol — calories, protein, macros and a week-by-week
                    projection. No guessing. No gimmicks.
                </p>

                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                    <a
                        href="#calculator"
                        className="group relative inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--neon-primary))] px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.03] active:scale-[0.99]"
                    >
                        Run Your BioCalc
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                    </a>
                    <a
                        href="#protocol"
                        className="glass inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-widest text-zinc-200 transition-colors hover:text-[rgb(var(--neon-primary))]"
                    >
                        View The Protocol
                    </a>
                </div>

                <dl className="mt-14 grid w-full max-w-3xl grid-cols-3 gap-4">
                    {[
                        { k: '12-week cycles', v: 'Engineering-grade projections' },
                        { k: '4 phases', v: 'Load, build, refine, reveal' },
                        { k: '0 guesswork', v: 'Numbers from your own metrics' },
                    ].map((s) => (
                        <div key={s.k} className="glass rounded-2xl p-4">
                            <dt className="text-sm font-black text-[rgb(var(--neon-primary))]">{s.k}</dt>
                            <dd className="mt-1 text-xs text-zinc-400">{s.v}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
