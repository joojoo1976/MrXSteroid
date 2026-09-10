import type { AffiliateProfile } from "../types/affiliate.types";
const NEXT_TIER: Record<string, { name: string; threshold: number; rate: string } | null> = {
    bronze: { name: "Silver", threshold: 11, rate: "35%" },
    silver: { name: "Gold", threshold: 51, rate: "45%" },
    gold: null,
    custom: null,
};
export function TierProgress({ affiliate }: { affiliate: AffiliateProfile }) {
    const next = NEXT_TIER[affiliate.tier];
    if (!next || affiliate.customCommissionRate !== null) return null;
    const progress = Math.min(100, (affiliate.monthlyPaidReferrals / next.threshold) * 100);
    const remaining = Math.max(0, next.threshold - affiliate.monthlyPaidReferrals);
    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold">Monthly Tier Progress</h3>
                <span className="text-xs text-gray-400">{affiliate.monthlyPaidReferrals} / {next.threshold} sales</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                <div className="bg-yellow-500 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400">
                {remaining > 0 ? <>{remaining} more sale{remaining !== 1 ? "s" : ""} to reach <span className="text-yellow-400 font-semibold">{next.name} ({next.rate})</span></> : `You've reached ${next.name}!`}
            </p>
        </div>
    );
}
