/**
 * SocialProof.tsx — Server Component.
 * Inline trust signals used inside PricingTiers (rating strip + count).
 */
const AVATARS = ['MrX', 'KL', 'S7', 'AD', 'RK'];

export default function SocialProof() {
    return (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                    {AVATARS.map((a) => (
                        <span
                            key={a}
                            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-gradient-to-br from-zinc-700 to-zinc-900 text-[10px] font-black text-[rgb(var(--neon-primary))]"
                        >
                            {a}
                        </span>
                    ))}
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-[rgb(var(--neon-primary))] text-[10px] font-black text-black">
                        +2k
                    </span>
                </div>
                <div className="text-left">
                    <div className="text-sm font-black text-[rgb(var(--neon-primary))]" aria-label="Rated 4.9 out of 5">
                        ★★★★★ 4.9/5
                    </div>
                    <p className="text-xs text-zinc-500">2,300+ engineered protocols run</p>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {['SSL Secure', 'Instant Access', '48h Refund', 'Lifetime Updates'].map((b) => (
                    <span key={b} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                        {b}
                    </span>
                ))}
            </div>
        </div>
    );
}
