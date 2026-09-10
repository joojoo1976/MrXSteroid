"use client";
import { useState } from "react";
import { AffiliateOnboarding } from "./AffiliateOnboarding";
import { ReferralLinkCard } from "./ReferralLinkCard";
import { AffiliateStats } from "./AffiliateStats";
import { TierProgress } from "./TierProgress";
import { ReferralHistory } from "./ReferralHistory";
import { CommissionHistory } from "./CommissionHistory";
import { useAffiliate } from "../hooks/useAffiliate";

interface Props { token?: string; }
type Tab = "referrals" | "commissions";

export function AffiliateOverview({ token }: Props) {
    const { enrolled, affiliate, referrals, totalReferrals, ledger, loading, enrolling, error, enroll, refetch } = useAffiliate(token);
    const [activeTab, setActiveTab] = useState<Tab>("referrals");

    if (loading) return (<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>);
    if (error) return (<div className="text-center py-12"><p className="text-red-400">{error}</p><button onClick={refetch} className="text-yellow-400 underline text-sm">Retry</button></div>);
    if (!enrolled || !affiliate) return <AffiliateOnboarding onEnroll={enroll} enrolling={enrolling} />;

    const sc = affiliate.status === "active" ? "bg-green-900 text-green-400" : "bg-zinc-700 text-gray-400";
    const tabLabel = "Referrals (" + String(totalReferrals) + ")";

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Affiliate Dashboard</h1>
                <span className={"px-3 py-1 rounded-full text-xs font-semibold " + sc}>{affiliate.status.toUpperCase()}</span>
            </div>
            <AffiliateStats affiliate={affiliate} />
            <TierProgress affiliate={affiliate} />
            <ReferralLinkCard referralCode={affiliate.referralCode} />
            <div className="space-y-4">
                <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 border border-zinc-700 w-fit">
                    <button onClick={() => setActiveTab("referrals")} className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (activeTab === "referrals" ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white")}>{tabLabel}</button>
                    <button onClick={() => setActiveTab("commissions")} className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (activeTab === "commissions" ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white")}>Commission History</button>
                </div>
                {activeTab === "referrals" ? <ReferralHistory referrals={referrals} /> : <CommissionHistory referrals={referrals} ledger={ledger} />}
            </div>
        </div>
    );
}
