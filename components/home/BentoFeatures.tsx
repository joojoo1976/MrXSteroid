/**
 * BentoFeatures.tsx — Server Component.
 * Interactive-looking bento grid (pure CSS, zero client JS) replacing the old FeatureGrid.
 */
const TILES = [
    {
        title: 'Bio-Signal Intake',
        body: 'Weight, body-fat, training age — the exact signals that drive a real physiology model, not a generic 3,000 kcal guess.',
        span: 'lg:col-span-2 lg:row-span-2',
        accent: true,
    },
    {
        title: 'Adaptive Macros',
        body: 'Protein ceilings rise with training age; carbs and fats balance the remaining energy budget automatically.',
        span: '',
    },
    {
        title: 'Week-by-Week Projection',
        body: 'Watch your body-fat trajectory re-project live as you drag a single slider.',
        span: '',
    },
    {
        title: 'Phase Architecture',
        body: 'A 4-phase, 12-week load → build → refine → reveal structure keeps momentum compounding.',
        span: 'lg:col-span-2',
    },
    {
        title: 'Zero-Persistence Privacy',
        body: 'Biometrics never touch localStorage — every session starts clean by design.',
        span: '',
    },
    {
        title: 'Server-Validated',
        body: 'Every calculation can be re-run against the API route with strict Zod sanitization.',
        span: '',
    },
];

export default function BentoFeatures() {
    return (
        <section id="protocol" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20">
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                    Everything Your Metabolism Actually <span className="neon-text">Needs</span>
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
                    A bento of capabilities engineered around one model — your real body.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:auto-rows-[180px]">
                {TILES.map((t) => (
                    <article
                        key={t.title}
                        className={`glass group relative overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 ${t.span} ${t.accent ? 'neon-border bg-white/[0.03]' : ''}`}
                    >
                        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[rgb(var(--neon-primary)/0.05)]" />
                        <div className="relative">
                            <h3 className={`text-lg font-black ${t.accent ? 'neon-text' : 'text-white'}`}>{t.title}</h3>
                            <p className={`mt-2 text-sm leading-relaxed ${t.accent ? 'text-zinc-200' : 'text-zinc-400'}`}>{t.body}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
