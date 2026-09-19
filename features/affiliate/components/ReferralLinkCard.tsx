"use client";
import { useState } from "react";

interface Props {
    referralCode: string;
}

export function ReferralLinkCard({ referralCode }: Props) {
    const siteUrl = typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mrxsteroid.com");

    const link = `${siteUrl}/api/referral/track?ref=${referralCode}&redirect=/`;
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-3">
            <h3 className="text-white font-semibold">Your Referral Link</h3>
            <div className="flex items-center gap-2">
                <input
                    readOnly
                    value={link}
                    aria-label="Your Referral URL"
                    className="flex-1 bg-zinc-800 text-gray-300 text-sm rounded-lg px-3 py-2 border border-zinc-600 outline-none select-all"
                />
                <button
                    onClick={copy}
                    aria-label="Copy Referral Link"
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-all shrink-0"
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
            <p className="text-xs text-gray-500">
                Code: <span className="font-mono text-yellow-400 font-bold">{referralCode}</span> — 60-day attribution window (server-side verified)
            </p>
        </div>
    );
}
