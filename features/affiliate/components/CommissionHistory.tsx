import type { Referral } from "../types/affiliate.types";

interface LedgerEntry {
    id: string;
    transaction_type: string;
    amount: number;
    currency: string;
    created_at: string;
    description?: string;
}

interface Props {
    referrals: Referral[];
    ledger?: LedgerEntry[];
}

const TYPE_LABEL: Record<string, string> = {
    commission: "Commission", refund: "Refund", partial_refund: "Partial Refund",
    chargeback: "Chargeback", reversal: "Reversal", manual_adjustment: "Adjustment",
    bonus: "Bonus", payout: "Payout",
};

const TYPE_COLOR: Record<string, string> = {
    commission: "text-green-400", bonus: "text-green-300",
    refund: "text-orange-400", partial_refund: "text-orange-300",
    chargeback: "text-red-500", reversal: "text-red-400",
    manual_adjustment: "text-blue-400", payout: "text-purple-400",
};

export function CommissionHistory({ ledger = [] }: Props) {
    if (!ledger.length) {
        return (
            <p className="text-gray-500 text-center py-8 text-sm">
                No commission history yet. Share your referral link to start earning!
            </p>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-white font-semibold text-lg mb-3">Commission History</h3>
            {ledger.map((entry) => {
                const isPositive = entry.amount >= 0;
                const amountColor = isPositive ? "text-green-400" : "text-red-400";
                const typeColor = TYPE_COLOR[entry.transaction_type] ?? "text-gray-400";
                const typeLabel = TYPE_LABEL[entry.transaction_type] ?? entry.transaction_type;
                const prefix = isPositive ? "+" : "";

                return (
                    <div key={entry.id} className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <p className={"text-xs font-semibold uppercase tracking-wide " + typeColor}>{typeLabel}</p>
                            {entry.description && <p className="text-xs text-gray-500 truncate mt-0.5">{entry.description}</p>}
                            <p className="text-xs text-gray-600 mt-1">{new Date(entry.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className={"text-lg font-bold " + amountColor}>
                                {prefix}{entry.amount.toFixed(2)}
                                <span className="text-xs font-normal text-gray-500 ml-1">{entry.currency}</span>
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
