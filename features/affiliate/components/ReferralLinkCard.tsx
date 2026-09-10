"use client";
import { useState } from "react";

interface Props { referralCode: string; }

const SITE = typeof window !== "undefined" ? window.location.origin : "https://www.mrxsteroid.com";

export function ReferralLinkCard({ referralCode }: Props) {
    const link = `${SITE}/api/referral/track?ref=${referralCode}&redirect=/`;
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    };
    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-3">
            <h3 className="text-white font-semibold">Your Referral Link</h3>
            <div className="flex items-center gap-2">
                <input readOnly value={link} className="flex-1 bg-zinc-800 text-gray-300 text-sm rounded-lg px-3 py-2 border border-zinc-600 outline-none select-all" />
                <button onClick={copy} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-all">
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
            <p className="text-xs text-gray-500">Code: <span className="font-mono text-yellow-400">{referralCode}</span> — 60-day attribution window</p>
        </div>
    );
}
