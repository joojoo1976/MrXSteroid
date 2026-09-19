import type { Referral } from "../types/affiliate.types";

interface Props {
    referrals: Referral[];
    page?: number;
    totalPages?: number;
    onPageChange?: (newPage: number) => void;
}

const STATUS_COLOR: Record<string, string> = {
    pending: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    approved: "text-green-400 border-green-500/30 bg-green-500/10",
    reversed: "text-red-400 border-red-500/30 bg-red-500/10",
    chargeback: "text-red-500 border-red-600/30 bg-red-600/10",
    refunded: "text-orange-400 border-orange-500/30 bg-orange-500/10",
};

export function ReferralHistory({ referrals, page = 1, totalPages = 1, onPageChange }: Props) {
    if (!referrals.length) {
        return (
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center space-y-2">
                <p className="text-gray-400 font-medium">No referrals yet</p>
                <p className="text-xs text-gray-500">Share your unique referral link to start earning commissions!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {referrals.map(r => {
                    const statusStyle = STATUS_COLOR[r.status] ?? "text-gray-400 border-zinc-700 bg-zinc-800";
                    return (
                        <div
                            key={r.id}
                            className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-white text-sm font-semibold">
                                        {r.currency} {r.amount.toFixed(2)}
                                    </p>
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle}`}>
                                        {r.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                                <p className="text-yellow-400 font-bold text-base">
                                    +${r.commissionAmount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {r.commissionRate}% · <span className="capitalize">{r.tier}</span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && onPageChange && (
                <div className="flex items-center justify-between pt-3 text-sm text-gray-400">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                        Previous
                    </button>
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
