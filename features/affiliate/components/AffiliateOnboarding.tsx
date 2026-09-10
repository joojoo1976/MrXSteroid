"use client";
import { useState } from "react";

interface Props { onEnroll: () => void; enrolling: boolean; }

export function AffiliateOnboarding({ onEnroll, enrolling }: Props) {
    const [agreed, setAgreed] = useState(false);
    return (
        <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">Join the Affiliate Program</h2>
            <p className="text-gray-400 text-lg">Earn commissions by referring customers to Mr. X Steroid.</p>
            <div className="bg-zinc-900 rounded-2xl p-6 text-left space-y-4 border border-zinc-700">
                <h3 className="font-semibold text-white text-lg">Commission Tiers</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li>🥉 <strong>Bronze</strong> — 1-10 sales/month → <span className="text-yellow-400 font-bold">25%</span></li>
                    <li>🥈 <strong>Silver</strong> — 11-50 sales/month → <span className="text-yellow-400 font-bold">35%</span></li>
                    <li>🥇 <strong>Gold</strong> — 51+ sales/month → <span className="text-yellow-400 font-bold">45%</span></li>
                </ul>
                <p className="text-xs text-gray-500">Commission calculated on product amount after discount, before shipping. Attribution window: 60 days.</p>
            </div>
            <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                I agree to the affiliate terms and conditions
            </label>
            <button
                onClick={onEnroll}
                disabled={!agreed || enrolling}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold py-3 px-6 rounded-xl transition-all"
            >
                {enrolling ? "Enrolling…" : "Enroll Now — Get My Referral Link"}
            </button>
        </div>
    );
}
