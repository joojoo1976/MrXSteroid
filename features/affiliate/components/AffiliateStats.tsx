import type { AffiliateProfile } from "../types/affiliate.types";

interface Props { affiliate: AffiliateProfile; }

const TIER_COLOR: Record<string, string> = {
    bronze: "text-amber-600", silver: "text-gray-400", gold: "text-yellow-400", custom: "text-purple-400",
};
const TIER_RATE: Record<string, string> = {
    bronze: "25%", silver: "35%", gold: "45%", custom: "Custom",
};

export function AffiliateStats({ affiliate }: Props) {
    const tierColor = TIER_COLOR[affiliate.tier] ?? "text-white";
    const tierRate = affiliate.customCommissionRate !== null
        ? `${affiliate.customCommissionRate}%` : (TIER_RATE[affiliate.tier] ?? "—");

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: "Balance", value: `$${affiliate.currentBalance.toFixed(2)}`, sub: "Available" },
                { label: "Lifetime Earnings", value: `$${affiliate.lifetimeEarnings.toFixed(2)}`, sub: "All time" },
                { label: "Total Sales", value: affiliate.totalPaidReferrals, sub: "Paid referrals" },
                { label: "Commission Rate", value: tierRate, sub: <span className={tierColor}>{affiliate.tier.toUpperCase()}</span> },
            ].map(({ label, value, sub }) => (
                <div key={label} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-1">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                </div>
            ))}
        </div>
    );
}
