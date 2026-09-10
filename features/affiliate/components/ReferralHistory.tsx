import type { Referral } from "../types/affiliate.types";
const STATUS_COLOR: Record<string, string> = {
    pending: "text-yellow-400", approved: "text-green-400", reversed: "text-red-400",
    chargeback: "text-red-500", refunded: "text-orange-400",
};
export function ReferralHistory({ referrals }: { referrals: Referral[] }) {
    if (!referrals.length) return <p className="text-gray-500 text-center py-8">No referrals yet. Share your link!</p>;
    return (
        <div className="space-y-2">
            {referrals.map(r => (
                <div key={r.id} className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-white text-sm font-medium">{r.currency} {r.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-yellow-400 font-bold">${r.commissionAmount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{r.commissionRate}% · {r.tier}</p>
                    </div>
                    <span className={`text-xs font-semibold ${STATUS_COLOR[r.status] ?? "text-gray-400"}`}>{r.status}</span>
                </div>
            ))}
        </div>
    );
}
